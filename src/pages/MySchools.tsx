import { useEffect, useState, useRef } from 'react';
import { Search, Loader2, FilterX, Ticket } from 'lucide-react'; 
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge'; 
import { Button } from '../components/ui/button'; 
import { ExportButton } from '../components/export/ExportButton';
import { SchoolsTable } from '../components/schools/SchoolsTable';
import { LocationFilters } from '../components/filters/LocationFilters';
import { RaiseTicketDialog } from '../components/schools/RaiseTicketDialog'; 
import { api } from '../lib/api';
import type { Year, State, District, School } from '../types/school';
import { useSync } from '../context/SyncContext';

export default function MySchools() {
  // Access global selections from SyncContext
  const { 
    selectedState, 
    selectedDistrict, 
    selectedYear, 
    setSelections 
  } = useSync();

  // Dialog UI State
  const [isTicketOpen, setIsTicketOpen] = useState(false);

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

  // 5. Main Data Fetch with Infinite Scroll Support
  useEffect(() => {
    async function fetchSchools() {
      const hasActiveFilters = 
        selectedState || 
        selectedDistrict || 
        searchQuery || 
        selectedSchoolType !== 'all' || 
        selectedCategory !== 'all' || 
        selectedManagement !== 'all';

      if (!hasActiveFilters) {
        setSchools([]);
        setTotalCount(0);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

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

        // Strict Year Filter Logic
        if (selectedYear && years.length > 0) {
          const currentYearObj = years.find(y => String(y.yearId) === selectedYear);
          
          if (currentYearObj) {
            const match1 = String(currentYearObj.yearDesc).trim().toLowerCase();
            const match2 = currentYearObj.yearName ? String(currentYearObj.yearName).trim().toLowerCase() : '';
            
            newSchools = newSchools.filter(s => {
              if (!s.year_desc) return true; 
              const sYear = String(s.year_desc).trim().toLowerCase();
              return sYear === match1 || sYear === match2 || sYear.includes(match1);
            });

            if (newSchools.length === 0) globalTotal = 0;
          }
        }

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

  // 6. Intersection Observer for Infinite Scroll
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


  // Filter Handlers
  const handleYearChange = (val: string) => setSelections(val, selectedState, selectedDistrict);
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
      <header className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title text-3xl font-bold tracking-tight">My Schools</h1>
          <p className="page-description text-muted-foreground">Browse, filter, and export school data.</p>
        </div>
        
        {/* Actions Cluster */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 shadow-sm border-primary/20 hover:bg-primary/5 transition-colors" 
            onClick={() => setIsTicketOpen(true)}
          >
            <Ticket className="h-4 w-4 text-primary" />
            Raise Data Ticket
          </Button>
        </div>
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
            <div className="relative w-full max-sm:max-w-none max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Name or UDISE Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background h-11"
              />
            </div>

            <ExportButton
              stcode11={selectedState}
              stname={states.find(s => s.stcode11 === selectedState)?.stname || ''}
              dtname={districts.find(d => d.dtcode11 === selectedDistrict)?.dtname || ''}
              dtcode11={selectedDistrict}
              yearId={selectedYear}
              schoolType={selectedSchoolType}
              category={selectedCategory}
              management={selectedManagement}
              disabled={schools.length === 0}
            />
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 mb-6 flex flex-wrap gap-4 items-center justify-between text-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Total Schools Found:</span>
                <Badge variant="default" className="text-sm px-2.5 bg-primary/90">
                  {totalCount.toLocaleString()}
                </Badge>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block"></div>

            <div className="flex flex-wrap gap-2 items-center">
                {selectedSchoolType !== 'all' && (
                    <Badge variant="secondary" className="border-border font-normal">
                        Type: {selectedSchoolType}
                    </Badge>
                )}
                {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="border-border font-normal">
                        Cat: {selectedCategory}
                    </Badge>
                )}
                {selectedManagement !== 'all' && (
                    <Badge variant="secondary" className="border-border font-normal">
                        Mgmt: {selectedManagement}
                    </Badge>
                )}
                {searchQuery && (
                     <Badge variant="secondary" className="border-border font-normal italic">
                        "{searchQuery}"
                    </Badge>
                )}
            </div>
        </div>

        {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="h-8 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
                <FilterX className="h-3.5 w-3.5 mr-1.5" />
                Clear All Filters
            </Button>
        )}
      </div>

      {/* Main Results Table */}
      <SchoolsTable schools={schools} isLoading={isLoading} />

      {/* Loading States for Infinite Scroll */}
      <div ref={observerTarget} className="h-24 flex items-center justify-center">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Fetching more records...</span>
          </div>
        )}
        {!hasMore && schools.length > 0 && (
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">End of List</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">v 1.2.2 Intelligence</p>
          </div>
        )}
      </div>

      {/* Ticket Dialog Component */}
      <RaiseTicketDialog open={isTicketOpen} onOpenChange={setIsTicketOpen} />
    </div>
  );
}