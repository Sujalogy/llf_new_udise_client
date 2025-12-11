import { useNavigate } from 'react-router-dom';
import { Eye, MapPin, Building2 } from 'lucide-react';
import type { School } from '../../types/school';
import { Button } from '../ui/button';

interface SchoolsTableProps {
  schools: School[];
  isLoading?: boolean;
}

export function SchoolsTable({ schools, isLoading }: SchoolsTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Schools Found</h3>
          <p className="mt-2 text-muted-foreground">
            Select a state and district to view synced schools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>UDISE Code</th>
              <th>School Name</th>
              <th>Block</th>
              <th>Category</th>
              <th>Management</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.school_id}>
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
                <td>
                  {school.category_name && (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {school.category_name}
                    </span>
                  )}
                </td>
                <td className="text-muted-foreground">{school.management_type || '-'}</td>
                <td className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/school/${school.school_id}`)}
                    className="gap-1.5"
                  >
                    <Eye className="h-4 w-4" />
                    View Report
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
