// src/pages/MySchools.tsx

import { useEffect, useState, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { ExportButton } from '../components/export/ExportButton';
import { SchoolsTable } from '../components/schools/SchoolsTable';
import { LocationFilters } from '../components/filters/LocationFilters';
import { api } from '../lib/api';
import type { Year, State, District, School } from '../types/school';
import { useSync } from '../context/SyncContext';

export default function MySchools() {
  // 1. Use Global State for Location (Persists across navigation)
  const { 
    selectedState, 
    selectedDistrict, 
    selectedYear, 
    setSelections 
  } = useSync();

  // 2. Metadata State
  const [years, setYears] = useState<Year[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [managements, setManagements] = useState<string[]>([]);

  // 3. Local Filter State (Category & Management)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedManagement, setSelectedManagement] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 4. Data & Pagination State
  const [schools, setSchools] = useState<School[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);        
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
  const [totalCount, setTotalCount] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_LIMIT = 50;

  // --- EFFECTS ---

  // A. Initial Load: Fetch Years, States, and Filter Options
  useEffect(() => {
    async function init() {
      try {
        const [yearsData, statesData, filters] = await Promise.all([
          api.getYears(),
          api.getSyncedStates(),
          api.getFilters()
        ]);
        setYears(yearsData);
        setStates(statesData);
        setCategories(filters.categories);
        setManagements(filters.managements);
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    }
    init();
  }, []);

  // B. Fetch Districts when State changes (or loads from context)
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      if (schools.length > 0) setSchools([]);
      return;
    }

    async function fetchDistricts() {
      try {
        const districtsData = await api.getSyncedDistricts(selectedState);
        setDistricts(districtsData);
      } catch (error) {
        console.error("Failed to fetch districts", error);
        setDistricts([]);
      }
    }
    fetchDistricts();
  }, [selectedState]);

  // C. Reset Pagination on Filter Change
  useEffect(() => {
    if (selectedDistrict) {
      setPage(1);
      setHasMore(true);
      // We don't clear schools here to avoid UI flash; fetchSchools handles update
    }
  }, [selectedDistrict, selectedCategory, selectedManagement, selectedYear]);

  // D. Fetch Schools (Main Data Loop)
  useEffect(() => {
    if (!selectedState || !selectedDistrict) {
      setSchools([]);
      return;
    }

    async function fetchSchools() {
      const isInitial = page === 1;

      if (isInitial) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        // Fetch data including all new filters
        const result = await api.getUdiseList(
          selectedState, 
          selectedDistrict, 
          page, 
          PAGE_LIMIT,
          selectedCategory,
          selectedManagement,
          selectedYear
        );
        
        const newSchools = result.data || [];
        const globalTotal = result.meta?.total || 0;

        if (isInitial) {
          setSchools(newSchools);
          setTotalCount(globalTotal);
        } else {
          setSchools((prev) => [...prev, ...newSchools]);
        }

        setHasMore(newSchools.length === PAGE_LIMIT);

      } catch (error) {
        console.error("Failed to fetch schools", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }

    fetchSchools();
  }, [page, selectedState, selectedDistrict, selectedCategory, selectedManagement, selectedYear]);

  // E. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore]);

  // --- HANDLERS ---

  const handleYearChange = (val: string) => {
    setSelections(val, selectedState, selectedDistrict);
    setSchools([]);
  };

  const handleStateChange = (newState: string) => {
    setSelections(selectedYear, newState, ''); 
    setSchools([]); 
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelections(selectedYear, selectedState, newDistrict);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setSchools([]); // Clear immediately for better UX
  };

  const handleManagementChange = (val: string) => {
    setSelectedManagement(val);
    setSchools([]);
  };

  // Client-side search logic
  const filteredSchools = searchQuery
    ? schools.filter(
        (school) =>
          school.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.udise_code?.includes(searchQuery)
      )
    : schools;

  return (
    <div className="animate-fade-in pb-10">
      <header className="page-header">
        <h1 className="page-title">My Schools</h1>
        <p className="page-description">
          Browse and explore schools synced to your database.
        </p>
      </header>

      {/* Filter Section */}
      <div className="filter-section mb-6">
        <div className="flex flex-col gap-4">
          <LocationFilters
            // Metadata
            years={years}
            states={states}
            districts={districts}
            categories={categories}
            managements={managements}
            
            // Selected Values
            selectedYear={selectedYear}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            selectedCategory={selectedCategory}
            selectedManagement={selectedManagement}
            
            // Change Handlers
            onYearChange={handleYearChange}
            onStateChange={handleStateChange}
            onDistrictChange={handleDistrictChange}
            onCategoryChange={handleCategoryChange}
            onManagementChange={handleManagementChange}
            
            // Config
            showYear={true}
            isLoading={isLoading && !schools.length}
          />
          
          <div className="flex justify-between items-center">
            {/* Search Bar */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search loaded schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!schools.length}
                className="pl-9 bg-background"
              />
            </div>

            {/* Export */}
            <ExportButton
              stcode11={selectedState}
              dtcode11={selectedDistrict}
              disabled={!selectedDistrict || !schools.length}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      {selectedDistrict && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredSchools.length} {hasMore ? '+' : ''} of {totalCount} schools
          </p>
        </div>
      )}

      {/* Table */}
      <SchoolsTable schools={filteredSchools} isLoading={isLoading && page === 1} />

      {/* Loader Sentinel */}
      {selectedDistrict && !isLoading && !searchQuery && (
        <div 
          ref={observerTarget} 
          className="w-full h-20 flex items-center justify-center mt-4"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more schools...</span>
            </div>
          )}
          {!hasMore && schools.length > 0 && (
            <p className="text-sm text-muted-foreground">No more schools to load.</p>
          )}
          {!hasMore && schools.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No schools found for this selection.</p>
          )}
        </div>
      )}
    </div>
  );
}