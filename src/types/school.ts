export interface Year {
  yearDesc: number;
  yearId: number;
  yearName: string;
}

export interface State {
  stcode11: string;
  stname: string;
}

export interface District {
  dtcode11: string;
  dtname: string;
  school_count?: number;
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
  stcode11: string;
  dtcode11: string;
}

export interface DashboardData {
  sync: {
    total_master_ids: string | number;
    synced_directory: string | number;
    synced_details: string | number;
  };
  enrollment: {
    total_students: string | number;
    total_boys: string | number;
    total_girls: string | number;
    total_teachers: string | number;
  };
  management: { management_type: string; count: string | number }[];
  category: { category: string; count: string | number }[];
  states: {
    state_name: string;
    school_count: string | number;
    student_count: string | number;
    teacher_count: string | number;
  }[];
}

export interface SkippedSchool {
  id: number;
  udise_code: string;
  stcode11: string;
  dtcode11: string;
  year_desc: string;
  reason: string;
  created_at: string;
  stname?: string;
  dtname?: string;
  school_name?: string;
}