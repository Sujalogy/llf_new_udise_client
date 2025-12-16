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
  // Context for global selections (Year, State, District)
  const { 
    selectedState, 
    selectedDistrict, 
    selectedYear, 
    setSelections 
  } = useSync();

  // Dropdown Data States
  const [years, setYears] = useState<Year[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]); // Renamed from categories
  const [categories, setCategories] = useState<string[]>([]);   // New Category list
  const [managements, setManagements] = useState<string[]>([]);

  // Selection States
  const [selectedSchoolType, setSelectedSchoolType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedManagement, setSelectedManagement] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Table Data States
  const [schools, setSchools] = useState<School[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);        
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
  const [totalCount, setTotalCount] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_LIMIT = 50;

  // 1. Initial Load (Years & Static Filters)
  useEffect(() => {
    async function init() {
      try {
        const [yearsData, filters] = await Promise.all([
          api.getYears(),
          api.getFilters()
        ]);
        setYears(yearsData);
        // Map API response to local state
        setSchoolTypes(filters.schoolTypes || []);
        setCategories(filters.categories || []);
        setManagements(filters.managements || []);
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    }
    init();
  }, []);

  // 2. Fetch States (Dependent on Year)
  useEffect(() => {
    async function fetchStates() {
      try {
        // Fetch states that actually have data for the selected year
        const statesData = await api.getSyncedStates(selectedYear);
        setStates(statesData);
      } catch (error) {
        setStates([]);
      }
    }
    fetchStates();
  }, [selectedYear]);

  // 3. Fetch Districts (Dependent on State & Year)
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    async function fetchDistricts() {
      try {
        const districtsData = await api.getSyncedDistricts(selectedState, selectedYear);
        setDistricts(districtsData);
      } catch (error) {
        setDistricts([]);
      }
    }
    fetchDistricts();
  }, [selectedState, selectedYear]);

  // 4. Reset Pagination on Filter Change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    // When filters change, we reset the list, so data fetch will be triggered by the next effect
  }, [
    selectedDistrict, selectedState, selectedYear, 
    selectedSchoolType, selectedCategory, selectedManagement, 
    searchQuery
  ]);

  // 5. Main Data Fetch (Dynamic Table)
  useEffect(() => {
    async function fetchSchools() {
      const isInitial = page === 1;

      if (isInitial) {
        setIsLoading(true);
        setSchools([]); // Clear old data for fresh filter
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await api.getUdiseList(
          selectedState || '', 
          selectedDistrict || '', 
          page, 
          PAGE_LIMIT,
          selectedSchoolType, // Passed as schoolType
          selectedManagement,
          selectedYear,
          searchQuery,
          selectedCategory    // Passed as category
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

    // Debounce search slightly
    const timeoutId = setTimeout(() => {
        fetchSchools();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    page, 
    selectedState, 
    selectedDistrict, 
    selectedSchoolType, 
    selectedCategory, 
    selectedManagement, 
    selectedYear, 
    searchQuery
  ]);

  // 6. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore]);


  // Handlers
  const handleYearChange = (val: string) => setSelections(val, '', ''); 
  const handleStateChange = (val: string) => setSelections(selectedYear, val, '');
  const handleDistrictChange = (val: string) => setSelections(selectedYear, selectedState, val);

  return (
    <div className="animate-fade-in pb-10">
      <header className="page-header">
        <h1 className="page-title">My Schools</h1>
        <p className="page-description">Browse, filter, and export school data.</p>
      </header>

      <div className="filter-section mb-6 space-y-4">
        <LocationFilters
          years={years}
          states={states}
          districts={districts}
          
          schoolTypes={schoolTypes} // Data
          categories={categories}   // Data
          managements={managements} // Data
          
          selectedYear={selectedYear}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          
          selectedSchoolType={selectedSchoolType} // Selection
          selectedCategory={selectedCategory}     // Selection
          selectedManagement={selectedManagement} // Selection
          
          onYearChange={handleYearChange}
          onStateChange={handleStateChange}
          onDistrictChange={handleDistrictChange}
          
          onSchoolTypeChange={setSelectedSchoolType}
          onCategoryChange={setSelectedCategory}
          onManagementChange={setSelectedManagement}
          
          showYear={true}
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Name or UDISE Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            <ExportButton
              stcode11={selectedState}
              dtcode11={selectedDistrict}
              yearId={selectedYear}
              schoolType={selectedSchoolType}
              category={selectedCategory}
              management={selectedManagement}
              disabled={schools.length === 0}
            />
        </div>
      </div>

      <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Found {totalCount} schools matching your criteria.
          </p>
      </div>

      <SchoolsTable schools={schools} isLoading={isLoading} />

      {/* Infinite Scroll Sentinel */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {!hasMore && schools.length > 0 && <span className="text-sm text-muted-foreground">End of list</span>}
      </div>
    </div>
  );
}