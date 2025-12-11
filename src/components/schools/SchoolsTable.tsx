import { useNavigate } from 'react-router-dom';
import { Eye, MapPin, Building2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import type { School } from '../../types/school';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'; // Ensure you have Tooltip components

interface SchoolsTableProps {
  schools: School[];
  isLoading?: boolean;
}

export function SchoolsTable({ schools, isLoading }: SchoolsTableProps) {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>UDISE Code</th>
              <th>School Name</th>
              <th>Block</th>
              {/* Added Sync Status Column */}
              <th>Sync Status</th> 
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.udise_code}>
                <td>
                  <span className="font-mono text-sm font-medium text-primary">
                    {school.udise_code}
                  </span>
                </td>
                <td>
                  <div className="max-w-xs">
                    <p className="font-medium text-foreground truncate">{school.school_name}</p>
                    {school.pincode && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {school.pincode}
                      </p>
                    )}
                  </div>
                </td>
                <td className="text-muted-foreground">{school.block_name || '-'}</td>
                
                {/* Status Check: If school_id exists, Level 2 is done */}
                <td>
                  {school.school_id ? (
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                      Synced
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                      Directory Only
                    </span>
                  )}
                </td>

                <td className="text-right">
                  {school.school_id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/school/${school.school_id}`)}
                      className="gap-1.5"
                    >
                      <Eye className="h-4 w-4" />
                      View Report
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" disabled className="opacity-50 cursor-not-allowed gap-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          Not Synced
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Run "Sync Details" in Admin Sync to view this report.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}