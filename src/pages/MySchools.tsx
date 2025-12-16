import { useEffect, useState, useRef } from 'react';
import { Search, Loader2, FilterX } from 'lucide-react'; 
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge'; 
import { Button } from '../components/ui/button'; 
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
  
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]); 
  const [categories, setCategories] = useState<string[]>([]);   
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
  }, [
    selectedDistrict, selectedState, selectedYear, 
    selectedSchoolType, selectedCategory, selectedManagement, 
    searchQuery
  ]);

  // 5. Main Data Fetch
  useEffect(() => {
    async function fetchSchools() {
      const isInitial = page === 1;

      if (isInitial) {
        setIsLoading(true);
        setSchools([]);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await api.getUdiseList(
          selectedState || '', 
          selectedDistrict || '', 
          page, 
          PAGE_LIMIT,
          selectedSchoolType,
          selectedManagement,
          selectedYear,
          searchQuery,
          selectedCategory
        );
        
        let newSchools = result.data || [];
        let globalTotal = result.meta?.total || 0;

        // --- STRICT YEAR FILTER FIX ---
        // If the backend returns a default year when data is missing, we filter it out.
        // Updated to be more robust for different string formats.
        if (selectedYear && years.length > 0) {
          const currentYearObj = years.find(y => String(y.yearId) === selectedYear);
          
          if (currentYearObj) {
            const match1 = String(currentYearObj.yearDesc).trim().toLowerCase();
            const match2 = currentYearObj.yearName ? String(currentYearObj.yearName).trim().toLowerCase() : '';
            
            // Check if returned data matches the requested year
            const originalCount = newSchools.length;
            newSchools = newSchools.filter(s => {
              if (!s.year_desc) return true; // Keep if no year info (safe fallback)
              
              const sYear = String(s.year_desc).trim().toLowerCase();
              
              // Match exact, or check if one contains the other (e.g. "2022" in "2022-23")
              return sYear === match1 || sYear === match2 || sYear.includes(match1);
            });

            // If we filtered out EVERYTHING (indicating backend sent wrong year), reset total
            if (originalCount > 0 && newSchools.length === 0) {
              globalTotal = 0;
            }
          }
        }
        // ------------------------------

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
    searchQuery,
    years
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
  // [CHANGED] Preserve selectedState and selectedDistrict when Year changes
  const handleYearChange = (val: string) => {
    setSelections(val, selectedState, selectedDistrict);
  };
  
  const handleStateChange = (val: string) => setSelections(selectedYear, val, '');
  const handleDistrictChange = (val: string) => setSelections(selectedYear, selectedState, val);

  const clearFilters = () => {
    setSelectedSchoolType('all');
    setSelectedCategory('all');
    setSelectedManagement('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedSchoolType !== 'all' || selectedCategory !== 'all' || selectedManagement !== 'all' || searchQuery;

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
          schoolTypes={schoolTypes}
          categories={categories}
          managements={managements}
          selectedYear={selectedYear}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          selectedSchoolType={selectedSchoolType}
          selectedCategory={selectedCategory}
          selectedManagement={selectedManagement}
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

      {/* --- STATS STRIP --- */}
      <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 mb-4 flex flex-wrap gap-4 items-center justify-between text-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
            
            {/* Total Count */}
            <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Total Schools Found:</span>
                <Badge variant="default" className="text-sm px-2.5">{totalCount.toLocaleString()}</Badge>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block"></div>

            {/* Active Filters Badges */}
            <div className="flex flex-wrap gap-2 items-center">
                {selectedSchoolType !== 'all' && (
                    <Badge variant="secondary" className="border-border">
                        Type: {selectedSchoolType}
                    </Badge>
                )}
                {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="border-border">
                        Cat: {selectedCategory}
                    </Badge>
                )}
                {selectedManagement !== 'all' && (
                    <Badge variant="secondary" className="border-border">
                        Mgmt: {selectedManagement}
                    </Badge>
                )}
                {searchQuery && (
                     <Badge variant="secondary" className="border-border">
                        Search: "{searchQuery}"
                    </Badge>
                )}
            </div>
        </div>

        {/* Clear Filters Action */}
        {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                <FilterX className="h-3.5 w-3.5 mr-1" />
                Clear Filters
            </Button>
        )}
      </div>

      <SchoolsTable schools={schools} isLoading={isLoading} />

      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {!hasMore && schools.length > 0 && <span className="text-sm text-muted-foreground">End of list</span>}
      </div>
    </div>
  );
}