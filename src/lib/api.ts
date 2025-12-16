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
  SyncStatus,
  DashboardData,
  SkippedSchool, // Ensure this is exported from types/school.ts
} from "../types/school";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // ... existing metadata & list APIs ...
  getYears: () => fetchApi<Year[]>("/years"),
  getFilters: () =>
    fetchApi<{
      schoolTypes: string[];
      categories: string[];
      managements: string[];
    }>("/schools/filters"),
  getMasterStates: (yearId: string) =>
    fetchApi<State[]>("/locations/master/states"),
  getMasterDistricts: (stateCode: string, yearId: string) =>
    fetchApi<District[]>(`/locations/master/districts/${stateCode}`),
  getSyncedStates: (yearId?: string) =>
    fetchApi<State[]>(
      `/locations/synced/states${yearId ? `?yearId=${yearId}` : ""}`
    ),
  getSyncedDistricts: (stateCode: string, yearId?: string) =>
    fetchApi<District[]>(
      `/locations/synced/districts/${stateCode}${
        yearId ? `?yearId=${yearId}` : ""
      }`
    ),
  getCategories: () =>
    fetchApi<{ catId: string; category: string }[]>("/categories"),
  getManagements: () => Promise.resolve([]),

getUdiseList: (
    stcode?: string,
    dtcode?: string,
    page = 1,
    limit = 100,
    schoolType?: string, // [Renamed from category]
    management?: string,
    yearId?: string,
    search?: string,
    category?: string    // [NEW]
  ) => {
    const params = new URLSearchParams();
    if (stcode) params.append('stcode11', stcode);
    if (dtcode) params.append('dtcode11', dtcode);
    if (schoolType && schoolType !== 'all') params.append('schoolType', schoolType);
    if (category && category !== 'all') params.append('category', category); // [NEW]
    if (management && management !== 'all') params.append('management', management);
    if (yearId) params.append('yearId', yearId);
    if (search) params.append('search', search);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return fetchApi<{
      data: School[];
      meta: { page: number; limit: number; count: number; total: number };
    }>(`/schools/list?${params.toString()}`);
  },
  searchSchools: (searchType: number, searchParam: string) =>
    fetchApi<School[]>(
      `/schools/search?searchType=${searchType}&searchParam=${searchParam}`
    ),

  getSchoolProfile: (schoolId: string) =>
    fetchApi<SchoolProfile>(`/schools/profile/${schoolId}`),
  getSchoolFacility: (schoolId: string) =>
    fetchApi<SchoolFacility>(`/schools/facility/${schoolId}`),
  getSocialData: (schoolId: string, flag: number) =>
    fetchApi<SocialData>(`/schools/social-data/${schoolId}?flag=${flag}`),
  getEnrolmentTeacher: (schoolId: string) =>
    fetchApi<TeacherStats>(`/schools/stats/${schoolId}`),
  getReportCard: (schoolId: string) =>
    Promise.reject("Endpoint not implemented"),
  getSkippedSchools: (page = 1, limit = 50) =>
    fetchApi<{ data: SkippedSchool[]; meta: { total: number } }>(
      `/schools/skipped?page=${page}&limit=${limit}`
    ),
  // --- ADMIN SYNC ACTIONS ---

  // Step 1: Sync Directory (Master List)
  syncDirectory: (yearId: string, stcode11: string, dtcode11: string) =>
    fetchApi<{ success: boolean; count: number; message: string }>(
      "/schools/sync-directory",
      {
        method: "POST",
        body: JSON.stringify({ yearId, stcode11, dtcode11 }),
      }
    ),

  // Step 2: Sync GIS Data (Coordinates)
  syncSchools: (stcode11: string, dtcode11: string) =>
    fetchApi<{ success: boolean; count: number; message: string }>(
      "/schools/sync",
      {
        method: "POST",
        body: JSON.stringify({ stcode11, dtcode11 }),
      }
    ),

  // Step 3: Sync Full Details (Profile, Facilities, Stats - NEW)
  syncSchoolDetails: (
    yearId: string,
    stcode: string,
    dtcode: string,
    udiseList?: string[],
    config?: { batchSize?: number; strictMode?: boolean } // [NEW]
  ) =>
    fetchApi<any>("/schools/sync/details", {
      method: "POST",
      body: JSON.stringify({
        yearId,
        stcode11: stcode,
        dtcode11: dtcode,
        udiseList,
        ...config, // Spread config (batchSize, strictMode)
      }),
    }),

  getDashboardStats: () => fetchApi<DashboardData>("/schools/stats/dashboard"),

  // ... stats & export ...
  getStats: () =>
    Promise.resolve({
      totalSchools: 0,
      totalStudents: 0,
      totalTeachers: 0,
      syncedStates: 0,
      syncedDistricts: 0,
    }),
  getStateWiseStats: () => Promise.resolve([]),

  exportSchools: async (
    filters: {
      stcode?: string;
      dtcode?: string;
      yearId?: string;
      category?: string;
      management?: string;
    },
    format: "csv" | "json"
  ) => {
    const params = new URLSearchParams();
    if (filters.stcode) params.append("stcode11", filters.stcode);
    if (filters.dtcode) params.append("dtcode11", filters.dtcode);
    if (filters.yearId) params.append("yearId", filters.yearId);
    if (filters.category && filters.category !== "all")
      params.append("category", filters.category);
    if (filters.management && filters.management !== "all")
      params.append("management", filters.management);
    params.append("format", format);

    const response = await fetch(
      `${API_BASE}/schools/export/list?${params.toString()}`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schools_export.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  getLocalSchoolDetails: (schoolId: string) =>
    fetchApi<{
      profile: SchoolProfile;
      facility: SchoolFacility;
      social: SocialData;
      teachers: TeacherStats;
      stats: any; // Add specific type if needed
    }>(`/schools/local-details/${schoolId}`),
};
