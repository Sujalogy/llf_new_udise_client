import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import type { Year, State, District } from '../../types/school';

interface LocationFiltersProps {
  years?: Year[];
  states: State[];
  districts: District[];
  
  schoolTypes?: string[];
  categories?: string[];
  managements?: string[];
  
  selectedYear?: string;
  selectedState: string;
  selectedDistrict: string;
  
  selectedSchoolType?: string;
  selectedCategory?: string;
  selectedManagement?: string;

  onYearChange?: (val: string) => void;
  onStateChange: (val: string) => void;
  onDistrictChange: (val: string) => void;
  
  onSchoolTypeChange?: (val: string) => void;
  onCategoryChange?: (val: string) => void;
  onManagementChange?: (val: string) => void;

  showYear?: boolean;
  isLoading?: boolean;
}

export function LocationFilters({
  years, states, districts, 
  schoolTypes, categories, managements,
  
  selectedYear, selectedState, selectedDistrict, 
  selectedSchoolType, selectedCategory, selectedManagement,
  
  onYearChange, onStateChange, onDistrictChange, 
  onSchoolTypeChange, onCategoryChange, onManagementChange,
  
  showYear = true, isLoading = false,
}: LocationFiltersProps) {
  return (
    <div className="filter-section space-y-4">
      {/* Row 1: Year, State, District */}
      <div className="grid gap-4 md:grid-cols-3">
        {showYear && years && onYearChange && (
          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Select value={selectedYear} onValueChange={onYearChange} disabled={isLoading}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select Year" /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y.yearId} value={String(y.yearId)}>{y.yearDesc}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>State</Label>
          <Select value={selectedState} onValueChange={onStateChange} disabled={isLoading || (showYear && !selectedYear)}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent>
              {states.map((s) => <SelectItem key={s.stcode11} value={s.stcode11}>{s.stname}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>District</Label>
          <Select value={selectedDistrict} onValueChange={onDistrictChange} disabled={isLoading || !selectedState}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="Select District" /></SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.dtcode11} value={d.dtcode11}>
                   {d.dtname} {d.school_count !== undefined ? `(${d.school_count})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: School Type, Category, Management (Decoupled from District) */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* 1. School Type Filter */}
        {onSchoolTypeChange && schoolTypes && (
          <div className="space-y-2">
            <Label>School Type</Label>
            {/* REMOVED: !selectedDistrict from disabled prop */}
            <Select value={selectedSchoolType} onValueChange={onSchoolTypeChange} disabled={isLoading}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="All School Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All School Types</SelectItem>
                {schoolTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 2. Category Filter */}
        {onCategoryChange && categories && (
          <div className="space-y-2">
            <Label>Category</Label>
            {/* REMOVED: !selectedDistrict from disabled prop */}
            <Select value={selectedCategory} onValueChange={onCategoryChange} disabled={isLoading}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 3. Management Filter */}
        {onManagementChange && managements && (
          <div className="space-y-2">
            <Label>Management</Label>
            {/* REMOVED: !selectedDistrict from disabled prop */}
            <Select value={selectedManagement} onValueChange={onManagementChange} disabled={isLoading}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="All Managements" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managements</SelectItem>
                {managements.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}