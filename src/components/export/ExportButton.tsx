import { useState } from 'react';
import { Download, ChevronDown, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { api } from '../../lib/api';
import { toast } from '../../hooks/use-toast';

interface ExportButtonProps {
  stcode11: string;
  dtcode11: string;
  disabled?: boolean;
}

export function ExportButton({ stcode11, dtcode11, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!stcode11 || !dtcode11) {
      toast({
        title: 'Selection Required',
        description: 'Please select both State and District to export data.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      await api.exportSchools(stcode11, dtcode11, format);
      toast({
        title: 'Export Successful',
        description: `Schools data exported as ${format.toUpperCase()}.`,
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || !dtcode11 || isExporting}
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
              Export
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
          <FileJson className="h-4 w-4" />
          Download as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
