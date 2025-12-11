import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, List, Database, FileText } from 'lucide-react';
import { LocationFilters } from '../components/filters/LocationFilters';
import { api } from '../lib/api';
import type { Year, State, District, SyncStatus } from '../types/school';
import { Button } from '../components/ui/button';
import { useSync } from '../context/SyncContext'; // Import hook

export default function AdminSync() {
  // Use Global State
  const { 
    selectedYear, selectedState, selectedDistrict, setSelections,
    directoryStatus, gisStatus, detailsStatus,
    runDirectorySync, runGisSync, runDetailsSync,
    isStep1Complete
  } = useSync();

  // Local state for dropdown options only
  const [years, setYears] = useState<Year[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch years
  useEffect(() => {
    async function fetchYears() {
      try {
        const yearsData = await api.getYears();
        setYears(yearsData);
      } catch (error) {
        console.error("Failed to fetch years", error);
      }
    }
    fetchYears();
  }, []);

  // Fetch states
  useEffect(() => {
    if (!selectedYear) {
      setStates([]);
      return;
    }
    async function fetchStates() {
      setIsLoading(true);
      try {
        const statesData = await api.getMasterStates(selectedYear);
        setStates(statesData);
      } catch (error) {
        console.error("Failed to fetch states", error);
        setStates([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStates();
    // No need to clear local state here, context handles selections
  }, [selectedYear]);

  // Fetch districts
  useEffect(() => {
    if (!selectedState || !selectedYear) {
      setDistricts([]);
      return;
    }
    async function fetchDistricts() {
      setIsLoading(true);
      try {
        const districtsData = await api.getMasterDistricts(selectedState, selectedYear);
        setDistricts(districtsData);
      } catch (error) {
        console.error("Failed to fetch districts", error);
        setDistricts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDistricts();
  }, [selectedState, selectedYear]);

  // Handlers to update Context
  const handleYearChange = (year: string) => setSelections(year, selectedState, selectedDistrict);
  const handleStateChange = (state: string) => setSelections(selectedYear, state, '');
  const handleDistrictChange = (district: string) => setSelections(selectedYear, selectedState, district);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <header className="page-header mb-8">
        <h1 className="page-title">Admin Sync</h1>
        <p className="page-description">
          Synchronize school data in three stages: Directory, GIS Coordinates, and Detailed Reports.
        </p>
      </header>

      {/* Global Filters */}
      <LocationFilters
        years={years}
        states={states}
        districts={districts}
        selectedYear={selectedYear}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onYearChange={handleYearChange}
        onStateChange={handleStateChange}
        onDistrictChange={handleDistrictChange}
        showYear={true}
        isLoading={isLoading}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        
        {/* PANEL 1: Directory Sync */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Step 1: Directory</h3>
              <p className="text-xs text-muted-foreground">Get School List</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            Fetch master list of UDISE codes for <strong>{selectedYear || 'selected year'}</strong>.
          </p>
          <Button 
            onClick={runDirectorySync}
            disabled={!selectedDistrict || directoryStatus.status === 'syncing'}
            className="w-full mt-auto"
          >
            {directoryStatus.status === 'syncing' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Fetching...</> : 'Fetch List'}
          </Button>
          <StatusMessage status={directoryStatus} />
        </div>

        {/* PANEL 2: GIS Sync */}
        <div className={`rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col transition-opacity ${!isStep1Complete ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Step 2: GIS Data</h3>
              <p className="text-xs text-muted-foreground">Get Coordinates</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            Fetch Latitude, Longitude & basic info from GIS Server.
          </p>
          <Button 
            onClick={runGisSync}
            disabled={!isStep1Complete || gisStatus.status === 'syncing'}
            variant="secondary"
            className="w-full mt-auto"
          >
            {gisStatus.status === 'syncing' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Syncing...</> : 'Sync GIS'}
          </Button>
          <StatusMessage status={gisStatus} />
        </div>

        {/* PANEL 3: Detail Sync */}
        <div className={`rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col transition-opacity ${!isStep1Complete ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Step 3: Details</h3>
              <p className="text-xs text-muted-foreground">Get Full Reports</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            Fetch Profile, Facilities, Teachers, Enrolment & Social Data.
          </p>
          <Button 
            onClick={runDetailsSync}
            disabled={!isStep1Complete || detailsStatus.status === 'syncing'}
            variant="outline"
            className="w-full mt-auto border-warning/50 hover:bg-warning/5 text-warning-foreground"
          >
            {detailsStatus.status === 'syncing' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Fetching...</> : 'Sync Details'}
          </Button>
          <StatusMessage status={detailsStatus} />
        </div>

      </div>
    </div>
  );
}

// Helper Component for consistent status messages
function StatusMessage({ status }: { status: SyncStatus }) {
  if (status.status === 'idle') return null;
  
  return (
    <div className={`mt-3 flex items-center gap-2 text-xs p-2 rounded-md ${
      status.status === 'success' ? 'bg-success/10 text-success' : 
      status.status === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'
    }`}>
      {status.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : 
       status.status === 'error' ? <AlertCircle className="h-3 w-3" /> : null}
      <span className="truncate" title={status.message}>{status.message}</span>
    </div>
  );
}