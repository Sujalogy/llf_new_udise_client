import type {
  Year,
  State,
  District,
  School,
  SchoolProfile,
  SchoolFacility,
  SocialData,
  TeacherStats,
  ReportCard,
  DashboardStats,
  StateWiseStats,
} from '../types/school';

const API_BASE = 'http://localhost:3001/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Metadata & Filter APIs
export const api = {
  // Years
  getYears: () => fetchApi<Year[]>('/years'),

  // Master Location APIs (for Admin Sync - shows ALL possible locations)
  getMasterStates: (yearId: string) => fetchApi<State[]>(`/states?yearId=${yearId}`),
  getMasterDistricts: (stateCode: string, yearId: string) =>
    fetchApi<District[]>(`/districts?stateCode=${stateCode}&yearId=${yearId}`),

  // Synced Location APIs (for My Schools - shows only synced locations)
  getSyncedStates: () => fetchApi<State[]>('/locations/synced/states'),
  getSyncedDistricts: (stateCode: string) =>
    fetchApi<District[]>(`/locations/synced/districts?stateCode=${stateCode}`),

  // Categories and Managements
  getCategories: () => fetchApi<{ catId: string; category: string }[]>('/categories'),
  getManagements: () => fetchApi<{ managementId: string; management: string }[]>('/managements'),

  // School Search & Lists
  getUdiseList: (stcode: string, dtcode: string, page = 1, limit = 50) =>
    fetchApi<{ data: School[]; total: number; page: number; totalPages: number }>(
      `/udise-list?stcode=${stcode}&dtcode=${dtcode}&page=${page}&limit=${limit}`
    ),

  searchSchools: (searchType: number, searchParam: string) =>
    fetchApi<School[]>(`/search-schools?searchType=${searchType}&searchParam=${searchParam}`),

  // School 360 Reports
  getSchoolProfile: (schoolId: string) =>
    fetchApi<SchoolProfile>(`/school/profile?schoolId=${schoolId}`),
  getSchoolFacility: (schoolId: string) =>
    fetchApi<SchoolFacility>(`/school/facility?schoolId=${schoolId}`),
  getSocialData: (schoolId: string, flag: number) =>
    fetchApi<SocialData>(`/getSocialData?schoolId=${schoolId}&flag=${flag}`),
  getEnrolmentTeacher: (schoolId: string) =>
    fetchApi<TeacherStats>(`/school-statistics/enrolment-teacher?schoolId=${schoolId}`),
  getReportCard: (schoolId: string) =>
    fetchApi<ReportCard>(`/school/report-card?schoolId=${schoolId}`),

  // Admin Data Sync
  syncSchools: (stcode11: string, dtcode11: string) =>
    fetchApi<{ success: boolean; count: number; message: string }>('/fetch/schools', {
      method: 'POST',
      body: JSON.stringify({ stcode11, dtcode11 }),
    }),

  syncByObjectIds: (objectIds: number[], stcode11: string, dtcode11: string) =>
    fetchApi<{ success: boolean; count: number }>('/fetch/objectids', {
      method: 'POST',
      body: JSON.stringify({ objectIds, stcode11, dtcode11 }),
    }),

  // Dashboard Analytics
  getStats: () => fetchApi<DashboardStats>('/stats'),
  getStateWiseStats: () => fetchApi<StateWiseStats[]>('/stats/state-wise'),

  // Export
  exportSchools: async (stcode: string, dtcode: string, format: 'csv' | 'json') => {
    const response = await fetch(
      `${API_BASE}/schools/export/list?stcode11=${stcode}&dtcode11=${dtcode}&format=${format}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
    const filename = filenameMatch?.[1] || `schools_list.${format}`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
