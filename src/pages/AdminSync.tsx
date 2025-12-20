import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Loader2, List, FileText, Users, Clock, MapPin } from 'lucide-react';
import { LocationFilters } from '../components/filters/LocationFilters';
import { api } from '../lib/api';
import type { Year, State, District, SyncStatus } from '../types/school';
import { Button } from '../components/ui/button';
import { useSync } from '../context/SyncContext';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast"; // Ensure toast is imported

export default function AdminSync() {
  const {
    selectedYear, selectedState, selectedDistrict, setSelections,
    directoryStatus, detailsStatus,
    runDirectorySync, runDetailsSync,
    isStep1Complete
  } = useSync();

  const [years, setYears] = useState<Year[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch pending requests from the backend
  const fetchPendingRequests = useCallback(async () => {
    try {
      const data = await api.getPendingRequests();
      setPendingRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  }, []);

  // 2. Watch for Sync Success to refresh the Sidebar
  useEffect(() => {
    if (directoryStatus.status === 'success' || detailsStatus.status === 'success') {
      fetchPendingRequests(); // Refresh list immediately after a successful sync
      
      if (detailsStatus.status === 'success') {
          toast({ 
            title: "Sync Resolved", 
            description: "Data synced successfully. Related user tickets have been resolved." 
          });
      }
    }
  }, [directoryStatus.status, detailsStatus.status, fetchPendingRequests]);

  useEffect(() => {
    async function init() {
      try {
        const yearsData = await api.getYears();
        setYears(yearsData);
        fetchPendingRequests();
      } catch (error) {
        console.error("Initialization failed", error);
      }
    }
    init();

    const interval = setInterval(fetchPendingRequests, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, [fetchPendingRequests]);

  // Fetching Logic (States/Districts)
  useEffect(() => {
    if (!selectedYear) { setStates([]); return; }
    async function fetchStates() {
      setIsLoading(true);
      try { const statesData = await api.getMasterStates(selectedYear); setStates(statesData); } 
      catch (error) { setStates([]); } 
      finally { setIsLoading(false); }
    }
    fetchStates();
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedState || !selectedYear) { setDistricts([]); return; }
    async function fetchDistricts() {
      setIsLoading(true);
      try { const districtsData = await api.getMasterDistricts(selectedState, selectedYear); setDistricts(districtsData); } 
      catch (error) { setDistricts([]); } 
      finally { setIsLoading(false); }
    }
    fetchDistricts();
  }, [selectedState, selectedYear]);

  const handleYearChange = (year: string) => setSelections(year, selectedState, selectedDistrict);
  const handleStateChange = (state: string) => setSelections(selectedYear, state, '');
  const handleDistrictChange = (district: string) => setSelections(selectedYear, selectedState, district);

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDE: SYNC CONTROLS */}
        <div className="flex-1">
          <header className="page-header mb-8">
            <h1 className="page-title text-3xl font-bold">Admin Sync</h1>
            <p className="page-description text-muted-foreground">
              Synchronize school data in two stages: Directory Listing and Detailed Reports.
            </p>
          </header>

          <LocationFilters
            years={years} states={states} districts={districts}
            selectedYear={selectedYear} selectedState={selectedState} selectedDistrict={selectedDistrict}
            onYearChange={handleYearChange} onStateChange={handleStateChange} onDistrictChange={handleDistrictChange}
            showYear={true} isLoading={isLoading}
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Step 1 Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <List className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Step 1: GIS</h3>
                  <p className="text-xs text-muted-foreground">Get List & Coordinates</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Fetch master list of UDISE codes and GIS coordinates.</p>
              <Button
                onClick={runDirectorySync}
                disabled={!selectedDistrict || directoryStatus.status === 'syncing'}
                className="w-full mt-auto"
              >
                {directoryStatus.status === 'syncing' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</> : 'Fetch Directory'}
              </Button>
              <StatusMessage status={directoryStatus} />
            </div>

            {/* Step 2 Card */}
            <div className={`rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col transition-opacity ${!isStep1Complete ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Step 2: Details</h3>
                  <p className="text-xs text-muted-foreground">Get Full Reports</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Fetch Profile, Facilities, Teachers, Enrolment & Social Data from UDISE+.</p>
              <Button
                onClick={runDetailsSync}
                disabled={!isStep1Complete || detailsStatus.status === 'syncing'}
                variant="outline"
                className="w-full mt-auto border-orange-200 hover:bg-orange-50"
              >
                {detailsStatus.status === 'syncing' ? <><Loader2 className="mr-2 h-4 w-4 text-gray-900 animate-spin" /> Fetching...</> : 'Sync Details'}
              </Button>
              <StatusMessage status={detailsStatus} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: WORK QUEUE SIDEBAR */}
        <div className="w-full lg:w-[350px] shrink-0">
          <Card className="h-full min-h-[600px] border-primary/10">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  User Data Requests
                </CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {pendingRequests.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {pendingRequests.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground italic">No pending requests. All users up to date!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {pendingRequests.map((req) => (
                      <div key={req.request_id} className="p-4 hover:bg-muted/20 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{req.user_name}</span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-destructive" />
                            <span className="text-xs font-bold text-foreground">{req.stname}</span>
                          </div>
                          <div className="pl-5 border-l-2 border-primary/10 ml-1.5">
                            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                              {req.dtnames?.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function StatusMessage({ status }: { status: SyncStatus }) {
  if (status.status === 'idle') return null;
  return (
    <div className={`mt-3 flex items-center gap-2 text-xs p-2 rounded-md ${
      status.status === 'success' ? 'bg-success/10 text-success' :
      status.status === 'error' ? 'bg-destructive/10 text-destructive' : 
      'bg-secondary text-secondary-foreground'
    }`}>
      {status.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> :
       status.status === 'error' ? <AlertCircle className="h-3 w-3" /> : null}
      <span className="truncate" title={status.message}>{status.message}</span>
    </div>
  );
}