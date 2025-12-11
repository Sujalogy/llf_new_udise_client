import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../lib/api'; // Import your existing API
import { SyncStatus } from '../types/school';
import { toast } from '../hooks/use-toast';

// Define the shape of our global state
interface SyncContextType {
  // Selections (Persist these so user doesn't have to re-select)
  selectedYear: string;
  selectedState: string;
  selectedDistrict: string;
  setSelections: (year: string, state: string, district: string) => void;

  // Sync Statuses
  directoryStatus: SyncStatus;
  gisStatus: SyncStatus;
  detailsStatus: SyncStatus;

  // Actions
  runDirectorySync: () => Promise<void>;
  runGisSync: () => Promise<void>;
  runDetailsSync: () => Promise<void>;

  // Computed Helpers
  isSyncing: boolean;
  isStep1Complete: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  // 1. Shared State
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [directoryStatus, setDirectoryStatus] = useState<SyncStatus>({ status: 'idle' });
  const [gisStatus, setGisStatus] = useState<SyncStatus>({ status: 'idle' });
  const [detailsStatus, setDetailsStatus] = useState<SyncStatus>({ status: 'idle' });

  // Helper to update selections
  const setSelections = (year: string, state: string, district: string) => {
    setSelectedYear(year);
    setSelectedState(state);
    setSelectedDistrict(district);
    
    // Reset statuses if selection changes significantly (Optional logic)
    if (state !== selectedState || district !== selectedDistrict) {
      setDirectoryStatus({ status: 'idle' });
      setGisStatus({ status: 'idle' });
      setDetailsStatus({ status: 'idle' });
    }
  };

  // 2. Async Actions
  const runDirectorySync = async () => {
    if (!selectedYear || !selectedState || !selectedDistrict) return;
    
    setDirectoryStatus({ status: 'syncing', message: 'Fetching school list...' });
    try {
      const result = await api.syncDirectory(selectedYear, selectedState, selectedDistrict);
      if (result.success) {
        setDirectoryStatus({ status: 'success', message: `Found ${result.count} schools.` });
        toast({ title: 'Directory Synced', description: `Listed ${result.count} schools.` });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setDirectoryStatus({ status: 'error', message: 'Failed to fetch directory.' });
      toast({ title: 'Sync Failed', description: String(error), variant: 'destructive' });
    }
  };

  const runGisSync = async () => {
    setGisStatus({ status: 'syncing', message: 'Fetching GIS coordinates...' });
    try {
      const result = await api.syncSchools(selectedState, selectedDistrict);
      if (result.success) {
        setGisStatus({ status: 'success', message: `Synced GIS for ${result.count} schools.` });
        toast({ title: 'GIS Sync Complete', description: `Updated ${result.count} schools.` });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setGisStatus({ status: 'error', message: 'GIS Sync failed.' });
    }
  };

  const runDetailsSync = async () => {
    setDetailsStatus({ status: 'syncing', message: 'Fetching full reports...' });
    try {
      const result = await api.syncSchoolDetails(selectedYear, selectedState, selectedDistrict);
      if (result.success) {
        setDetailsStatus({ status: 'success', message: `Details synced for ${result.count} schools.` });
        toast({ title: 'Deep Sync Complete', description: `Fetched reports for ${result.count} schools.` });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setDetailsStatus({ status: 'error', message: 'Detail Sync failed.' });
    }
  };

  const isSyncing = 
    directoryStatus.status === 'syncing' || 
    gisStatus.status === 'syncing' || 
    detailsStatus.status === 'syncing';

  const isStep1Complete = directoryStatus.status === 'success';

  return (
    <SyncContext.Provider value={{
      selectedYear, selectedState, selectedDistrict, setSelections,
      directoryStatus, gisStatus, detailsStatus,
      runDirectorySync, runGisSync, runDetailsSync,
      isSyncing, isStep1Complete
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
}