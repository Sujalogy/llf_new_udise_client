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
  onStateChange: (stateCode: string) => void;
  onDistrictChange: (districtCode: string) => void;
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
                  <SelectItem key={year.yearId} value={year.yearId}>
                    {year.yearName}
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
                <SelectItem key={state.stateCode} value={state.stateCode}>
                  {state.stateName}
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
                <SelectItem key={district.districtCode} value={district.districtCode}>
                  {district.districtName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
