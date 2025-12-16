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
  school_id: string; // or number, depending on your DB
  udise_code: string;
  school_name: string;
  
  // Location
  state_name: string;
  district_name: string;
  block_name?: string;
  pincode?: string;
  
  // Details
  school_type: string;
  category?: string; // The new category column
  management: string;
  
  // [ADDED] These missing fields
  year_desc?: string;
  total_students?: number;
  
  // Optional extras from your previous code
  latitude?: number;
  longitude?: number;
  category_name?: string;
  management_type?: string;
  establishment_year?: number;
}

export interface SchoolProfile {
  udise_code: string;
  school_name: string;
  school_phone?: string;        // [NEW]
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
  location_type?: string;       // [NEW]
  school_status: string;
  year_desc: string;
  village?: string;
  head_master?: string;
  
  // [NEW] Basic & Instruction
  is_pre_primary_section?: string;
  residential_school_type?: string;
  is_cwsn_school?: boolean;
  shift_school?: boolean;
  medium_of_instruction_1?: string;
  medium_of_instruction_2?: string;
  medium_of_instruction_3?: string;
  medium_of_instruction_4?: string;
  instructional_days?: number;
  
  // [NEW] Visits
  visits_by_brc?: number;
  visits_by_crc?: number;
  visits_by_district_officer?: number;
}

export interface SchoolFacility {
  // [NEW] & Existing
  building_status: string;
  classroom_count: number;
  good_condition_classrooms?: number;
  
  toilet_boys: number;
  toilet_girls: number;
  urinals_boys?: number;         // [NEW]
  urinals_girls?: number;        // [NEW]
  
  drinking_water: boolean;
  electricity: boolean;
  library: boolean;
  playground: boolean;
  ramp: boolean;
  boundary_wall: string;
  furniture: string;
  
  // [NEW] Amenities
  has_handwash_meal?: boolean;
  has_handwash_common?: boolean;
  has_handrails?: boolean;
  has_medical_checkup?: boolean;
  has_hm_room?: boolean;
  has_solar_panel?: boolean;
  has_rain_harvesting?: boolean;
  
  // [NEW] Digital
  has_internet?: boolean;
  has_dth_access?: boolean;
  has_integrated_lab?: boolean;
  functional_desktops?: number;
  total_digital_boards?: number;
  students_with_furniture?: number;
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
  regular: number;
  contract: number;
  part_time?: number;            // [NEW]
  
  // [NEW] Engagement & Training
  non_teaching_assignments?: number;
  in_service_training?: number;
  
  // [NEW] Qualifications Stats
  below_graduate?: number;
  graduate_above?: number;
  post_graduate_above?: number;
  
  // [NEW] Professional Quals (Counts)
  qual_diploma_basic?: number;
  qual_bele?: number;
  qual_bed?: number;
  qual_med?: number;
  qual_others?: number;
  qual_none?: number;
  qual_special_ed?: number;
  qual_pursuing?: number;
  qual_deled?: number;
  qual_diploma_preschool?: number;
  qual_bed_nursery?: number;
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

export interface MatrixStats {
  schools: number;
  districts: number;
  blocks: number;
  teachers: number;
  students: number;
}

export interface MatrixNode {
  type: 'state' | 'district';
  name: string;
  stats: MatrixStats;
  districts?: MatrixNode[];
}