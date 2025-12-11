import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import type { Year, State, District } from '../../types/school';

interface LocationFiltersProps {
  years?: Year[];
  states: State[];
  districts: District[];
  selectedYear?: string;
  selectedState: string;
  selectedDistrict: string;
  onYearChange?: (yearId: string) => void;
  onStateChange: (stcode11: string) => void;
  onDistrictChange: (dtcode11: string) => void;
  showYear?: boolean;
  isLoading?: boolean;
}

export function LocationFilters({
  years,
  states,
  districts,
  selectedYear,
  selectedState,
  selectedDistrict,
  onYearChange,
  onStateChange,
  onDistrictChange,
  showYear = true,
  isLoading = false,
}: LocationFiltersProps) {
  return (
    <div className="filter-section">
      <div className="grid gap-4 md:grid-cols-3">
        {showYear && years && onYearChange && (
          <div className="space-y-2">
            <Label htmlFor="year">Academic Year</Label>
            <Select value={selectedYear} onValueChange={onYearChange} disabled={isLoading}>
              <SelectTrigger id="year" className="bg-background">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {years.map((year) => (
                  // Ensure yearId is treated as string for Select value if needed, or update props
                  <SelectItem key={year.yearId} value={String(year.yearId)}>
                    {year.yearDesc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            value={selectedState}
            onValueChange={onStateChange}
            disabled={isLoading || (showYear && !selectedYear)}
          >
            <SelectTrigger id="state" className="bg-background">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {states.map((state) => (
                <SelectItem key={state.stcode11} value={state.stcode11}>
                  {state.stname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Select
            value={selectedDistrict}
            onValueChange={onDistrictChange}
            disabled={isLoading || !selectedState}
          >
            <SelectTrigger id="district" className="bg-background">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {districts.map((district) => (
                <SelectItem key={district.dtcode11} value={district.dtcode11}>
                  {district.dtname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
