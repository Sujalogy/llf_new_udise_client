import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export function useSchoolFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to get param or default
  const getParam = (key: string, def = '') => searchParams.get(key) || def;

  // State values derived from URL
  const filters = useMemo(() => ({
    year: getParam('year'),
    state: getParam('state'),
    district: getParam('district'),
    schoolType: getParam('type', 'all'),
    category: getParam('category', 'all'),
    management: getParam('management', 'all'),
    search: getParam('q'),
    page: parseInt(getParam('page', '1'), 10),
  }), [searchParams]);

  // Update handlers
  const setFilter = useCallback((key: string, value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      // Reset dependent filters
      if (key === 'year') { newParams.delete('state'); newParams.delete('district'); }
      if (key === 'state') { newParams.delete('district'); }
      
      // Always reset page on filter change
      newParams.set('page', '1');
      return newParams;
    });
  }, [setSearchParams]);

  const setPage = useCallback((newPage: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', String(newPage));
      return newParams;
    });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(prev => {
        const newParams = new URLSearchParams();
        // Preserve Year/State if needed, or clear all. 
        // Keeping Year/State is usually better UX
        if (prev.has('year')) newParams.set('year', prev.get('year')!);
        if (prev.has('state')) newParams.set('state', prev.get('state')!);
        return newParams;
    });
  }, [setSearchParams]);

  return {
    filters,
    setFilter,
    setPage,
    clearFilters,
    // Direct Setters compatible with UI components
    setYear: (v: string) => setFilter('year', v),
    setState: (v: string) => setFilter('state', v),
    setDistrict: (v: string) => setFilter('district', v),
    setSchoolType: (v: string) => setFilter('type', v),
    setCategory: (v: string) => setFilter('category', v),
    setManagement: (v: string) => setFilter('management', v),
    setSearch: (v: string) => setFilter('q', v),
  };
}