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
        // Demo data
        setStates([
          { stateCode: '09', stateName: 'Uttar Pradesh' },
          { stateCode: '27', stateName: 'Maharashtra' },
          { stateCode: '08', stateName: 'Rajasthan' },
        ]);
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
        // Demo data
        setDistricts([
          { districtCode: '0901', districtName: 'Lucknow' },
          { districtCode: '0902', districtName: 'Kanpur Nagar' },
        ]);
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
        const result = await api.getUdiseList(selectedState, selectedDistrict, 1, 50);
        setSchools(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        });
      } catch (error) {
        // Demo data
        setSchools([
          {
            school_id: '1',
            udise_code: '09010101001',
            school_name: 'Government Primary School Aminabad',
            state_name: 'Uttar Pradesh',
            district_name: 'Lucknow',
            block_name: 'Lucknow',
            pincode: '226001',
            category_name: 'Primary',
            management_type: 'Government',
          },
          {
            school_id: '2',
            udise_code: '09010101002',
            school_name: 'Kendriya Vidyalaya Aliganj',
            state_name: 'Uttar Pradesh',
            district_name: 'Lucknow',
            block_name: 'Lucknow',
            pincode: '226024',
            category_name: 'Higher Secondary',
            management_type: 'Central Govt',
          },
          {
            school_id: '3',
            udise_code: '09010101003',
            school_name: 'City Montessori School',
            state_name: 'Uttar Pradesh',
            district_name: 'Lucknow',
            block_name: 'Lucknow',
            pincode: '226010',
            category_name: 'Higher Secondary',
            management_type: 'Private',
          },
          {
            school_id: '4',
            udise_code: '09010101004',
            school_name: 'Government Upper Primary School Chowk',
            state_name: 'Uttar Pradesh',
            district_name: 'Lucknow',
            block_name: 'Lucknow',
            pincode: '226003',
            category_name: 'Upper Primary',
            management_type: 'Government',
          },
          {
            school_id: '5',
            udise_code: '09010101005',
            school_name: 'St. Francis College',
            state_name: 'Uttar Pradesh',
            district_name: 'Lucknow',
            block_name: 'Lucknow',
            pincode: '226001',
            category_name: 'Higher Secondary',
            management_type: 'Private Aided',
          },
        ]);
        setPagination({ page: 1, totalPages: 5, total: 247 });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchools();
  }, [selectedState, selectedDistrict]);

  // Filter schools by search query
  const filteredSchools = searchQuery
    ? schools.filter(
        (school) =>
          school.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.udise_code.includes(searchQuery)
      )
    : schools;

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
                  <option key={state.stateCode} value={state.stateCode}>
                    {state.stateName}
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
                  <option key={district.districtCode} value={district.districtCode}>
                    {district.districtName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ExportButton
            stateCode={selectedState}
            districtCode={selectedDistrict}
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
