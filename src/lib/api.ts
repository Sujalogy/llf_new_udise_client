import axios, { AxiosError } from "axios";
import type {
  Year,
  State,
  District,
  School,
  SchoolProfile,
  SchoolFacility,
  SocialData,
  TeacherStats,
  DashboardData,
  SkippedSchool,
  MatrixNode,
  SyncResponse,
} from "../types/school";
import { GoogleUser } from "../context/AuthContext";

export const API_BASE = (import.meta as any).env.VITE_API_BASE_URL;

// 1. Create an Axios Instance
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 👈 Crucial for sending/receiving cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Generic Helper for requests
async function request<T>(config: any): Promise<T> {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;

    // Extract error details to match your previous logic
    const customError: any = new Error(
      (axiosError.response?.data as any)?.message ||
        `API Error: ${axiosError.response?.status}`
    );

    customError.status = axiosError.response?.status;
    customError.details = axiosError.response?.data;

    throw customError;
  }
}

export const api = {
  // --- Metadata & Filters ---
  getMe: () => apiClient.get("/auth/me").then((res) => res.data),
  googleLogin: (credential: string) =>
    request<{ success: boolean; user: GoogleUser }>({
      url: "/auth/google",
      method: "POST",
      data: { credential },
    }),
  logout: () =>
    request({
      url: "/auth/logout",
      method: "POST",
    }),
  getYears: () => request<Year[]>({ url: "/years", method: "GET" }),
  getFilters: () =>
    request<{
      schoolTypes: string[];
      categories: string[];
      managements: string[];
    }>({ url: "/schools/filters", method: "GET" }),
  getUnsyncedLocations: () =>
    request<
      Array<{
        stcode11: string;
        dtcode11: string;
        state_name: string;
        district_name: string;
      }>
    >({
      url: "/admin/locations/unsynced",
      method: "GET",
    }),
  getMasterStates: (yearId: string) =>
    request<State[]>({ url: "/locations/master/states", method: "GET" }),

  getMasterDistricts: (stateCode: string, yearId: string) =>
    request<District[]>({
      url: `/locations/master/districts/${stateCode}`,
      method: "GET",
    }),

  getSyncedStates: (yearId?: string) =>
    request<State[]>({
      url: "/locations/synced/states",
      method: "GET",
      params: { yearId },
    }),

  getSyncedDistricts: (stateCode: string, yearId?: string) =>
    request<District[]>({
      url: `/locations/synced/districts/${stateCode}`,
      method: "GET",
      params: { yearId },
    }),

  getCategories: () =>
    request<{ catId: string; category: string }[]>({
      url: "/categories",
      method: "GET",
    }),

  // --- Admin User Management ---
  getAdminUsers: () => request<any[]>({ url: "/admin/users", method: "GET" }),

  updateUser: (userId: number, data: any) =>
    request({
      url: `/admin/users/${userId}`,
      method: "PUT",
      data,
    }),

  getMonitoringStats: () =>
    request<{
      summary: {
        total_users: number;
        active_today: number;
        total_downloads: number;
      };
      trends: { date: string; count: number }[];
      topUsers: any[];
      recentLogs: any[];
    }>({ url: "/admin/monitoring", method: "GET" }),

  // --- Schools List & Search ---
  getUdiseList: (
    stcode?: string,
    dtcode?: string,
    page = 1,
    limit = 100,
    schoolType?: string,
    management?: string,
    yearId?: string,
    search?: string,
    category?: string
  ) =>
    request<{ data: School[]; meta: { total: number } }>({
      url: "/schools/list",
      method: "GET",
      params: {
        stcode11: stcode,
        dtcode11: dtcode,
        schoolType: schoolType !== "all" ? schoolType : undefined,
        category: category !== "all" ? category : undefined,
        management: management !== "all" ? management : undefined,
        yearId,
        search,
        page,
        limit,
      },
    }),

  getLocalSchoolDetails: (udise: string) =>
    request<SchoolProfile>({
      url: `/schools/local-details/${udise}`,
      method: "GET",
    }),
  searchSchools: (searchType: number, searchParam: string) =>
    request<School[]>({
      url: "/schools/search",
      method: "GET",
      params: { searchType, searchParam },
    }),

  // --- AI ---
  askAI: (prompt: string) =>
    request<{
      answer: string;
      data: any[];
      format: "text" | "table" | "chart";
      query: string;
    }>({ url: "/ai/ask", method: "POST", data: { prompt } }),

  // --- School Details ---
  getSchoolProfile: (schoolId: string) =>
    request<SchoolProfile>({
      url: `/schools/profile/${schoolId}`,
      method: "GET",
    }),

  getSchoolFacility: (schoolId: string) =>
    request<SchoolFacility>({
      url: `/schools/facility/${schoolId}`,
      method: "GET",
    }),

  getSocialData: (schoolId: string, flag: number) =>
    request<SocialData>({
      url: `/schools/social-data/${schoolId}`,
      method: "GET",
      params: { flag },
    }),
  getSkippedSummary: (yearId?: string, stcode?: string) => {
    const params = new URLSearchParams();
    if (yearId) params.append("yearId", yearId);
    if (stcode) params.append("stcode11", stcode);
    return request<
      { state: string; district: string; count: number; year: string }[]
    >(`/schools/skipped/summary?${params.toString()}`);
  },
  getEnrolmentTeacher: (schoolId: string) =>
    request<TeacherStats>({ url: `/schools/stats/${schoolId}`, method: "GET" }),

  getSkippedSchools: (page = 1, limit = 50) =>
    request<{ data: SkippedSchool[]; meta: { total: number } }>({
      url: "/schools/skipped",
      method: "GET",
      params: { page, limit },
    }),

  // --- Admin Sync Actions ---
  syncDirectory: (yearId: string, stcode11: string, dtcode11: string) =>
    request<SyncResponse>({
      // 👈 Ensure <SyncResponse> is here
      url: "/schools/sync-directory",
      method: "POST",
      data: { yearId, stcode11, dtcode11 },
    }),

  syncSchools: (stcode11: string, dtcode11: string) =>
    request({
      url: "/schools/sync",
      method: "POST",
      data: { stcode11, dtcode11 },
    }),

  syncSchoolDetails: (
    yearId: string,
    stcode: string,
    dtcode: string,
    udiseList?: string[],
    config?: { batchSize?: number; strictMode?: boolean }
  ) =>
    request<SyncResponse>({
      // 👈 Ensure <SyncResponse> is here
      url: "/schools/sync/details",
      method: "POST",
      data: {
        yearId,
        stcode11: stcode,
        dtcode11: dtcode,
        udiseList,
        ...config,
      },
    }),

  // --- Dashboard & Matrix ---
  getDashboardStats: () =>
    request<DashboardData>({ url: "/schools/stats/dashboard", method: "GET" }),
  getStateMatrix: () =>
    request<MatrixNode[]>({ url: "/schools/stats/matrix", method: "GET" }),

  // --- Exports (Special Handling for Blobs) ---
  exportSchools: async (filters: any, format: "csv" | "json") => {
    const response = await apiClient.get("/schools/export/list", {
      params: { ...filters, format },
      responseType: "blob", // 👈 Required for file downloads in Axios
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `schools_export.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportSkippedList: async (format: "csv" | "json", filters: any) => {
    const response = await apiClient.get("/schools/skipped/export", {
      params: { ...filters, format },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skipped_schools.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // --- Tickets & Notifications ---
  raiseTicket: (data: any) =>
    request({ url: "/admin/requests", method: "POST", data }),
  getPendingRequests: () =>
    request<any[]>({ url: "/admin/requests/pending", method: "GET" }),
  getUserNotifications: () =>
    request<any[]>({
      url: "/admin/requests/user-notifications",
      method: "GET",
    }),
};
