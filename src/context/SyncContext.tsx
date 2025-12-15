import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import { SyncStatus } from '../types/school';
import { toast } from '../hooks/use-toast';

interface SyncContextType {
  selectedYear: string;
  selectedState: string;
  selectedDistrict: string;
  setSelections: (year: string, state: string, district: string) => void;

  directoryStatus: SyncStatus;
  detailsStatus: SyncStatus;

  runDirectorySync: () => Promise<void>;
  runDetailsSync: () => Promise<void>;

  isSyncing: boolean;
  isStep1Complete: boolean;
}

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

  // 1. Directory Sync (Smart Incremental)
  const runDirectorySync = async () => {
    if (!selectedYear || !selectedState || !selectedDistrict) return;

    setDirectoryStatus({ status: 'syncing', message: 'Checking for new schools...' });
    try {
      const result = await api.syncDirectory(selectedYear, selectedState, selectedDistrict);
      if (result.success) {
        // [UPDATE]: Use the dynamic message from backend (e.g. "Added 5 new schools")
        setDirectoryStatus({ status: 'success', message: result.message });
        toast({ title: 'Directory Sync', description: result.message });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setDirectoryStatus({ status: 'error', message: 'Failed to fetch directory.' });
      toast({ title: 'Sync Failed', description: String(error), variant: 'destructive' });
    }
  };

  // 2. Details Sync (Smart Incremental)
  const runDetailsSync = async () => {
    setDetailsStatus({ status: 'syncing', message: 'Initializing...' });

    try {
      // 1. Read Settings from LocalStorage (or use defaults)
      const storedBatch = localStorage.getItem('conf_batchSize');
      const storedStrict = localStorage.getItem('conf_strictMode');

      const batchSize = storedBatch ? parseInt(storedBatch, 10) : 5;
      const strictMode = storedStrict === 'true';

      setDetailsStatus({ status: 'syncing', message: `Syncing with batch size ${batchSize}...` });

      // 2. Call API with Config
      const result = await api.syncSchoolDetails(
        selectedYear,
        selectedState,
        selectedDistrict,
        undefined, // udiseList (undefined for bulk sync)
        { batchSize, strictMode } // [NEW] Pass config
      );

      if (result.success) {
        setDetailsStatus({ status: 'success', message: result.message });
        toast({ title: 'Deep Sync Complete', description: result.message });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setDetailsStatus({ status: 'error', message: 'Detail Sync failed.' });
      toast({ title: 'Sync Failed', description: String(error), variant: 'destructive' });
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