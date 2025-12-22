import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import { SyncContextType, SyncStatus } from '../types/school';
import { toast } from '../hooks/use-toast';
import { SyncResponse } from '../types/school';

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [directoryStatus, setDirectoryStatus] = useState<SyncStatus>({ status: 'idle' });
  const [detailsStatus, setDetailsStatus] = useState<SyncStatus>({ status: 'idle' });

  const setSelections = (year: string, state: string, district: string) => {
    setSelectedYear(year);
    setSelectedState(state);
    setSelectedDistrict(district);

    if (state !== selectedState || district !== selectedDistrict) {
      setDirectoryStatus({ status: 'idle' });
      setDetailsStatus({ status: 'idle' });
    }
  };

  const runDirectorySync = async () => {
    if (!selectedYear || !selectedState || !selectedDistrict) {
      toast({ title: "Validation Error", description: "Please select Year, State, and District", variant: "destructive" });
      return;
    }

    setDirectoryStatus({ status: 'syncing', message: 'Checking for new schools...' });
    
    try {
      // Explicitly type the result as SyncResponse
      const result = await api.syncDirectory(selectedYear, selectedState, selectedDistrict) as SyncResponse;
      
      if (result.success) {
        setDirectoryStatus({ status: 'success', message: result.message });
        toast({ title: 'Directory Sync', description: result.message });
      } else {
        throw new Error(result.message || "Failed to sync directory");
      }
    } catch (error: any) {
      const errorMessage = error.details?.message || error.message || 'Failed to fetch directory.';
      setDirectoryStatus({ status: 'error', message: errorMessage });
      toast({ title: 'Sync Failed', description: errorMessage, variant: 'destructive' });
    }
  };

  const runDetailsSync = async () => {
    if (!selectedYear || !selectedState || !selectedDistrict) return;

    setDetailsStatus({ status: 'syncing', message: 'Initializing...' });

    try {
      const storedBatch = localStorage.getItem('conf_batchSize');
      const storedStrict = localStorage.getItem('conf_strictMode');
      const batchSize = storedBatch ? parseInt(storedBatch, 10) : 5;
      const strictMode = storedStrict === 'true';

      setDetailsStatus({ status: 'syncing', message: `Syncing with batch size ${batchSize}...` });

      // Explicitly type the result as SyncResponse
      const result: SyncResponse = await api.syncSchoolDetails(
        selectedYear,
        selectedState,
        selectedDistrict,
        undefined,
        { batchSize, strictMode }
      ) as SyncResponse;

      if (result.success) {
        setDetailsStatus({ status: 'success', message: result.message });
        toast({ title: 'Deep Sync Complete', description: result.message });
      } else {
        throw new Error(result.message || "Detail sync failed");
      }
    } catch (error: any) {
      const errorMessage = error.details?.message || error.message || 'Detail Sync failed.';
      setDetailsStatus({ status: 'error', message: errorMessage });
      toast({ title: 'Sync Failed', description: errorMessage, variant: 'destructive' });
    }
  };

  const isSyncing = directoryStatus.status === 'syncing' || detailsStatus.status === 'syncing';
  const isStep1Complete = directoryStatus.status === 'success';

  return (
    <SyncContext.Provider value={{
      selectedYear, selectedState, selectedDistrict, setSelections,
      directoryStatus, detailsStatus,
      runDirectorySync, runDetailsSync,
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