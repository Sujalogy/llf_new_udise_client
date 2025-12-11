import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { ExportButton } from '../components/export/ExportButton';
import { SchoolsTable } from '../components/schools/SchoolsTable';
import { api } from '../lib/api';
import type { State, District, School } from '../types/school';

export default function MySchools() {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Fetch synced states on mount
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

  // Fetch districts when state changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSchools([]);
      return;
    }

    async function fetchDistricts() {
      setIsLoading(true);
      try {
        const districtsData = await api.getSyncedDistricts(selectedState);
        setDistricts(districtsData);
      } catch (error) {
        console.error("Failed to fetch districts", error);
        setDistricts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDistricts();
    setSelectedDistrict('');
    setSchools([]);
  }, [selectedState]);

  // Fetch schools when district changes
  useEffect(() => {
    if (!selectedState || !selectedDistrict) {
      setSchools([]);
      return;
    }

    async function fetchSchools() {
      setIsLoading(true);
      try {
        // Use 'any' type here because the backend returns an array, 
        // but the strict TS interface expects an object.
        const result: any = await api.getUdiseList(selectedState, selectedDistrict, 1, 50);
        
        let schoolsData: School[] = [];
        let totalCount = 0;

        // FIX: Check if result is an array (Backend behavior) or Object (Frontend expectation)
        if (Array.isArray(result)) {
          schoolsData = result;
          totalCount = result.length;
        } else if (result && result.data) {
          schoolsData = result.data;
          totalCount = result.total;
        }

        setSchools(schoolsData);
        setPagination({
          page: 1, 
          totalPages: 1, 
          total: totalCount,
        });
      } catch (error) {
        console.error("Failed to fetch schools", error);
        setSchools([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchools();
  }, [selectedState, selectedDistrict]);

  // Filter schools by search query (Safe navigation added)
  const filteredSchools = searchQuery
    ? (schools || []).filter(
        (school) =>
          school.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.udise_code?.includes(searchQuery)
      )
    : (schools || []);

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">My Schools</h1>
        <p className="page-description">
          Browse and explore schools that have been synced to your database.
        </p>
      </header>

      {/* Workflow Info */}
      <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 p-4">
        <h3 className="font-medium text-foreground">Step 2: Explore Synced Data</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select from states and districts that already exist in your database. Click "View Report"
          on any school to see detailed information fetched live from the UDISE+ server.
        </p>
      </div>

      {/* Filters with Export */}
      <div className="filter-section">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
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
                onChange={(e) => setSelectedDistrict(e.target.value)}
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

        {/* Search within results */}
        {schools.length > 0 && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by school name or UDISE code..."
              value={searchQuery}
              onChange={(e:any) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {/* Results Count */}
      {selectedDistrict && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredSchools.length} of {pagination.total} schools
          </p>
        </div>
      )}

      {/* Schools Table */}
      <SchoolsTable schools={filteredSchools} isLoading={isLoading && !!selectedDistrict} />
    </div>
  );
}