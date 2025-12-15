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

const API_BASE = "http://localhost:3000/api";

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
    fetchApi<{ categories: string[]; managements: string[] }>(
      "/schools/filters"
    ),
  getMasterStates: (yearId: string) =>
    fetchApi<State[]>("/locations/master/states"),
  getMasterDistricts: (stateCode: string, yearId: string) =>
    fetchApi<District[]>(`/locations/master/districts/${stateCode}`),
  getSyncedStates: () => fetchApi<State[]>("/locations/synced/states"),
  getSyncedDistricts: (stateCode: string) =>
    fetchApi<District[]>(`/locations/synced/districts/${stateCode}`),
  getCategories: () =>
    fetchApi<{ catId: string; category: string }[]>("/categories"),
  getManagements: () => Promise.resolve([]),

  getUdiseList: (
    stcode: string,
    dtcode: string,
    page = 1,
    limit = 100,
    category?: string,
    management?: string,
    yearId?: string // [NEW]
  ) => {
    let url = `/schools/list?stcode11=${stcode}&dtcode11=${dtcode}&page=${page}&limit=${limit}`;
    if (category && category !== "all")
      url += `&category=${encodeURIComponent(category)}`;
    if (management && management !== "all")
      url += `&management=${encodeURIComponent(management)}`;
    if (yearId) url += `&yearId=${encodeURIComponent(yearId)}`; // [NEW]

    return fetchApi<{
      data: School[];
      meta: { page: number; limit: number; count: number; total: number };
    }>(url);
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
    stcode: string,
    dtcode: string,
    format: "csv" | "json"
  ) => {
    const response = await fetch(
      `${API_BASE}/schools/export/list?stcode11=${stcode}&dtcode11=${dtcode}&format=${format}`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schools_list.${format}`;
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
