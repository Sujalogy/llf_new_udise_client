import { useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle } from 'lucide-react';
import type { School } from '../../types/school';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface SchoolsTableProps {
  schools: School[];
  isLoading?: boolean;
}

export function SchoolsTable({ schools, isLoading }: SchoolsTableProps) {
  const navigate = useNavigate();
  const columns = [
    "UDISE Code",
    "School Name",
    "Location (Block/Dist/State)",
    "Year",
    "Category",
    "Management",
    "Total Students",
    "Sync Status",
    "Action",
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading schools...</div>;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schools.map((school) => (
              <tr
                key={`${school.udise_code}-${school.year_desc}`}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-mono font-medium text-primary">
                    {school.udise_code}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div
                    className="max-w-[200px] truncate font-medium text-foreground"
                    title={school.school_name}
                  >
                    {school.school_name}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-foreground">
                      {school.block_name || "-"}
                    </span>
                    <span className="text-muted-foreground">
                      {school.district_name}, {school.state_name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-normal text-xs">
                    {school.year_desc || "-"}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  <span
                    className="truncate block max-w-[150px]"
                    title={school.category || school.school_type}
                  >
                    {school.category || school.school_type || "-"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className="truncate block max-w-[150px]"
                    title={school.management}
                  >
                    {school.management || "-"}
                  </span>
                </td>

                <td className="px-4 py-3 text-right font-mono">
                  {school.total_students ?? "-"}
                </td>

                <td className="px-4 py-3 text-center">
                  {school.school_id ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">
                      Synced
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 border border-yellow-200">
                      Directory Only
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  {school.school_id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/school/${school.school_id}`)}
                      className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          className="h-8 px-2 opacity-50 cursor-not-allowed text-warning"
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Sync
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Run "Sync Details" in Admin Sync first.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </td>
              </tr>
            ))}

            {schools.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  No schools found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}