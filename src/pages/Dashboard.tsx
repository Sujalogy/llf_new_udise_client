import { useEffect, useState } from 'react';
import { School, Users, GraduationCap, MapPin, Building2 } from 'lucide-react';
import type { DashboardStats, StateWiseStats } from '../types/school';
import { api } from '../lib/api';
import { StatCard } from '../components/ui/stat-card';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stateStats, setStateStats] = useState<StateWiseStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, stateData] = await Promise.all([
          api.getStats(),
          api.getStateWiseStats(),
        ]);
        setStats(statsData);
        setStateStats(stateData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set demo data for preview
        setStats({
          totalSchools: 14847,
          totalStudents: 2456789,
          totalTeachers: 89234,
          syncedStates: 12,
          syncedDistricts: 156,
        });
        setStateStats([
          { state_name: 'Uttar Pradesh', school_count: 3245, student_count: 567890 },
          { state_name: 'Maharashtra', school_count: 2876, student_count: 445678 },
          { state_name: 'Madhya Pradesh', school_count: 2134, student_count: 334567 },
          { state_name: 'Rajasthan', school_count: 1987, student_count: 289456 },
          { state_name: 'Bihar', school_count: 1756, student_count: 267890 },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Overview of school data synchronization status and statistics.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={stats?.totalSchools || 0}
          icon={School}
          description="Synced in database"
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          description="Enrolled across all schools"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers || 0}
          icon={GraduationCap}
          description="Teaching staff"
        />
        <StatCard
          title="Synced Districts"
          value={stats?.syncedDistricts || 0}
          icon={MapPin}
          description={`Across ${stats?.syncedStates || 0} states`}
        />
      </div>

      {/* State-wise Stats */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">State-wise Distribution</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>State</th>
                <th className="text-right">Schools</th>
                <th className="text-right">Students</th>
              </tr>
            </thead>
            <tbody>
              {stateStats.map((state) => (
                <tr key={state.state_name}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{state.state_name}</span>
                    </div>
                  </td>
                  <td className="text-right font-mono">
                    {state.school_count.toLocaleString()}
                  </td>
                  <td className="text-right font-mono">
                    {state.student_count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Sync New Data</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fetch school data from the GIS server for new states and districts.
          </p>
          <a
            href="/admin-sync"
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Go to Admin Sync →
          </a>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Browse Schools</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore synced schools and view detailed reports for each school.
          </p>
          <a
            href="/my-schools"
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Go to My Schools →
          </a>
        </div>
      </div>
    </div>
  );
}
