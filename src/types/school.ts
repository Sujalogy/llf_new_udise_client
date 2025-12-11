export interface Year {
  yearId: string;
  yearName: string;
}

export interface State {
  stateCode: string;
  stateName: string;
}

export interface District {
  districtCode: string;
  districtName: string;
}

export interface School {
  school_id: string;
  udise_code: string;
  school_name: string;
  state_name: string;
  district_name: string;
  block_name?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  category_name?: string;
  management_type?: string;
  establishment_year?: number;
}

export interface SchoolProfile {
  udise_code: string;
  school_name: string;
  state_name: string;
  district_name: string;
  block_name: string;
  cluster: string;
  pincode: string;
  category_name: string;
  management_type: string;
  establishment_year: number;
  assembly_constituency: string;
  latitude: number;
  longitude: number;
}

export interface SchoolFacility {
  toilet_boys: number;
  toilet_girls: number;
  electricity: boolean;
  furniture: string;
  boundary_wall: string;
  building_status: string;
  classroom_count: number;
  drinking_water: boolean;
  library: boolean;
  playground: boolean;
  ramp: boolean;
}

export interface SocialData {
  caste_SC: number;
  caste_ST: number;
  OBC: number;
  EWS: number;
  general: number;
  CWSN: number;
}

export interface TeacherStats {
  teachers_male: number;
  teachers_female: number;
  total_teachers: number;
  ptr_primary: number;
  ptr_upper_primary: number;
  highly_qualified_count: number;
}

export interface ReportCard {
  students_total: number;
  teachers_total: number;
  ramp_available: boolean;
  library_available: boolean;
  drinking_water_status: string;
  playground_status: string;
}

export interface DashboardStats {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  syncedStates: number;
  syncedDistricts: number;
}

export interface StateWiseStats {
  state_name: string;
  school_count: number;
  student_count: number;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  progress?: number;
}

export interface FilterState {
  yearId: string;
  stateCode: string;
  districtCode: string;
}
