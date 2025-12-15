import { useEffect, useState, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { ExportButton } from '../components/export/ExportButton';
import { SchoolsTable } from '../components/schools/SchoolsTable';
import { api } from '../lib/api';
import type { State, District, School } from '../types/school';
import { useSync } from '../context/SyncContext'; // 1. Import Context

export default function MySchools() {
  // 2. Use Global State instead of local useState for selections
  const { 
    selectedState, 
    selectedDistrict, 
    selectedYear, // Need this to preserve it when calling setSelections
    setSelections 
  } = useSync();

  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  // Data State
  const [schools, setSchools] = useState<School[]>([]);
  
  // Local UI State (Search & Pagination don't strictly need persistence, but can be added if needed)
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);        
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
  const [totalCount, setTotalCount] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_LIMIT = 50;

  // 1. Fetch synced states on mount
  useEffect(() => {
    async function fetchSyncedStates() {
      try {
        const statesData = await api.getSyncedStates();
        setStates(statesData);
      } catch (error) {
        console.error("Failed to fetch synced states", error);
        setStates([]); 
      }
    }
    fetchSyncedStates();
  }, []);

  // 2. Fetch districts when state changes (or loads from context)
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      // Only clear schools if we actually don't have a state (e.g. initial load empty)
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
    
    // CRITICAL CHANGE: Removed the automatic reset of selectedDistrict here.
    // We only want to reset it if the USER changes the state, not on re-mount.
  }, [selectedState]);

  // 3. Reset Pagination when District Changes
  useEffect(() => {
    // Only reset pagination if we have a valid district
    if (selectedDistrict) {
      setPage(1);
      setHasMore(true);
      // We don't clear schools here immediately to avoid flash, 
      // the fetchSchools effect will handle the update.
    }
  }, [selectedDistrict]);

  // 4. Fetch Schools (Initial + Append)
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
        const result: any = await api.getUdiseList(selectedState, selectedDistrict, page, PAGE_LIMIT);
        
        let newSchools: School[] = [];
        let fetchedCount = 0;
        let backendTotal = 0;

        if (Array.isArray(result)) {
          newSchools = result;
          fetchedCount = result.length;
          backendTotal = result.length;
        } else if (result && result.data) {
          newSchools = result.data;
          fetchedCount = newSchools.length;
          backendTotal = result.meta?.count || result.total || 0;
        }

        if (isInitial) {
          setSchools(newSchools);
          setTotalCount(backendTotal);
        } else {
          setSchools((prev) => [...prev, ...newSchools]);
        }

        setHasMore(fetchedCount === PAGE_LIMIT);

      } catch (error) {
        console.error("Failed to fetch schools", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }

    fetchSchools();
  }, [page, selectedState, selectedDistrict]);

  // 5. Intersection Observer
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

  // Handlers
  const handleStateChange = (newState: string) => {
    // When USER explicitly changes state, we reset district
    setSelections(selectedYear, newState, ''); 
    setSchools([]); // Clear current data
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelections(selectedYear, selectedState, newDistrict);
  };

  const filteredSchools = searchQuery
    ? (schools || []).filter(
        (school) =>
          school.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.udise_code?.includes(searchQuery)
      )
    : (schools || []);

  return (
    <div className="animate-fade-in pb-10">
      <header className="page-header">
        <h1 className="page-title">My Schools</h1>
        <p className="page-description">
          Browse and explore schools that have been synced to your database.
        </p>
      </header>

      <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 p-4">
        <h3 className="font-medium text-foreground">Step 2: Explore Synced Data</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select from states and districts that already exist in your database.
        </p>
      </div>

      <div className="filter-section">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">State</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.stcode11} value={state.stcode11}>
                    {state.stname}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedState}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.dtcode11} value={district.dtcode11}>
                    {district.dtname}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ExportButton
            stcode11={selectedState}
            dtcode11={selectedDistrict}
            disabled={!selectedDistrict}
          />
        </div>

        {schools.length > 0 && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by school name or UDISE code..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {selectedDistrict && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredSchools.length} {hasMore ? '+' : ''} of approx {totalCount} schools
          </p>
        </div>
      )}

      <SchoolsTable schools={filteredSchools} isLoading={isLoading && !!selectedDistrict} />

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
        </div>
      )}
    </div>
  );
}