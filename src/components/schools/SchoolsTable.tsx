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

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading schools...</div>;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3">UDISE Code</th>
              <th className="px-4 py-3">School Name</th>
              <th className="px-4 py-3">Location (Block/Dist/State)</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Management</th>
              <th className="px-4 py-3 text-right">Total Students</th>
              <th className="px-4 py-3 text-center">Sync Status</th> {/* [ADDED] */}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schools.map((school) => (
              <tr key={`${school.udise_code}-${school.year_desc}`} className="hover:bg-muted/30 transition-colors">
                
                {/* 1. UDISE Code */}
                <td className="px-4 py-3">
                  <span className="font-mono font-medium text-primary">
                    {school.udise_code}
                  </span>
                </td>

                {/* 2. School Name */}
                <td className="px-4 py-3">
                  <div className="max-w-[200px] truncate font-medium text-foreground" title={school.school_name}>
                    {school.school_name}
                  </div>
                </td>

                {/* 3. Location */}
                <td className="px-4 py-3">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-foreground">{school.block_name || '-'}</span>
                    <span className="text-muted-foreground">
                      {school.district_name}, {school.state_name}
                    </span>
                  </div>
                </td>

                {/* 4. Year */}
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-normal text-xs">
                    {school.year_desc || '-'}
                  </Badge>
                </td>

                {/* 5. Category */}
                <td className="px-4 py-3">
                  <span className="truncate block max-w-[150px]" title={school.category || school.school_type}>
                    {school.category || school.school_type || '-'}
                  </span>
                </td>

                {/* 6. Management */}
                <td className="px-4 py-3">
                  <span className="truncate block max-w-[150px]" title={school.management}>
                    {school.management || '-'}
                  </span>
                </td>

                {/* 7. Total Students */}
                <td className="px-4 py-3 text-right font-mono">
                  {school.total_students !== undefined ? school.total_students : '-'}
                </td>

                {/* 8. Sync Status [ADDED] */}
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

                {/* 9. Action */}
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
                        <Button size="sm" variant="ghost" disabled className="h-8 px-2 opacity-50 cursor-not-allowed text-warning">
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