import { useState } from 'react';
import { Download, ChevronDown, FileJson, Layers, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../../components/ui/dropdown-menu';
import { api } from '../../lib/api';
import { toast } from '../../hooks/use-toast';

interface ExportButtonProps {
  stcode11?: string;
  dtcode11?: string;
  yearId?: string;
  schoolType?: string; // [UPDATED] Renamed from 'category' to match your School Type filter
  category?: string;   // [NEW] The new DB column category
  management?: string;
  disabled?: boolean;
}

export function ExportButton({ 
  stcode11, 
  dtcode11, 
  yearId, 
  schoolType, 
  category, 
  management, 
  disabled 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Helper to trigger export
  const runExport = async (format: 'csv' | 'json', filters: any) => {
    setIsExporting(true);
    try {
      await api.exportSchools(filters, format);
      toast({
        title: 'Export Successful',
        description: `Data exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Unable to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCurrentViewExport = (format: 'csv' | 'json') => {
    // [UPDATED] Passes schoolType and category separately
    const filters = { 
      stcode: stcode11, 
      dtcode: dtcode11, 
      yearId, 
      schoolType, 
      category, 
      management 
    };
    runExport(format, filters);
  };

  const handleDistrictExport = (format: 'csv' | 'json') => {
    if (!stcode11 || !dtcode11) {
       toast({ title: "District Export", description: "Please select a State and District first.", variant: "destructive" });
       return;
    }
    // Only pass location + year (ignoring category/management for "Full District Export")
    const filters = { stcode: stcode11, dtcode: dtcode11, yearId };
    runExport(format, filters);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Options
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        
        <DropdownMenuLabel>Current Filtered List</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleCurrentViewExport('csv')} className="gap-2">
          <Filter className="h-4 w-4 text-blue-500" />
          Export filtered (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCurrentViewExport('json')} className="gap-2">
          <FileJson className="h-4 w-4 text-blue-500" />
          Export filtered (.json)
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Full District Data</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleDistrictExport('csv')} 
          disabled={!stcode11 || !dtcode11}
          className="gap-2"
        >
          <Layers className="h-4 w-4 text-green-500" />
          Export Entire District (.csv)
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}