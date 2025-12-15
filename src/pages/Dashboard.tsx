import { useEffect, useState } from 'react';
import { 
  Users, GraduationCap, School, Database, 
  ArrowRight, Activity, PieChart as PieIcon, BarChart3 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { api } from '../lib/api';
import type { DashboardData } from '../types/school';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await api.getDashboardStats();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div>No data available</div>;

  const { sync, enrollment, management, category, states } = data;

  // Safe Number Parsing
  const num = (v: string | number) => Number(v) || 0;

  // Calculate percentages for Sync Funnel
  const masterCount = num(sync.total_master_ids);
  const dirCount = num(sync.synced_directory);
  const detailCount = num(sync.synced_details);
  
  const dirPercent = masterCount ? (dirCount / masterCount) * 100 : 0;
  const detailPercent = masterCount ? (detailCount / masterCount) * 100 : 0;

  // Prepare Chart Data
  const genderData = [
    { name: 'Boys', value: num(enrollment.total_boys), color: '#3b82f6' },
    { name: 'Girls', value: num(enrollment.total_girls), color: '#ec4899' },
  ];

  const ptrGlobal = num(enrollment.total_teachers) ? Math.round(num(enrollment.total_students) / num(enrollment.total_teachers)) : 0;

  return (
    <div className="animate-fade-in pb-10 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of school data synchronization and analytics.</p>
      </div>

      {/* 1. SYNC FUNNEL CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <SyncCard 
          title="Total Object IDs" 
          value={masterCount} 
          subtitle="Potential Schools in Master"
          icon={Database}
          color="text-slate-500"
          bg="bg-slate-100"
        />
        <SyncCard 
          title="Directory Fetched" 
          value={dirCount} 
          subtitle={`${Math.round(dirPercent)}% of Master Synced`}
          icon={School}
          color="text-blue-500"
          bg="bg-blue-100"
          progress={dirPercent}
        />
        <SyncCard 
          title="Fully Detailed" 
          value={detailCount} 
          subtitle={`${Math.round(detailPercent)}% have Full Reports`}
          icon={Activity}
          color="text-green-500"
          bg="bg-green-100"
          progress={detailPercent}
        />
      </div>

      {/* 2. ENROLLMENT & PTR */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={num(enrollment.total_students).toLocaleString()} icon={Users} />
        <StatCard title="Total Teachers" value={num(enrollment.total_teachers).toLocaleString()} icon={GraduationCap} />
        <StatCard title="Global PTR" value={`${ptrGlobal}:1`} icon={BarChart3} desc="Student-Teacher Ratio" />
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center">
           <div className="text-sm font-medium text-muted-foreground mb-2">Gender Parity</div>
           <div className="h-4 flex w-full rounded-full overflow-hidden">
             <div style={{ width: `${(num(enrollment.total_boys)/num(enrollment.total_students))*100}%` }} className="bg-blue-500" />
             <div style={{ width: `${(num(enrollment.total_girls)/num(enrollment.total_students))*100}%` }} className="bg-pink-500" />
           </div>
           <div className="flex justify-between mt-2 text-xs text-muted-foreground">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> {num(enrollment.total_boys).toLocaleString()} Boys</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"/> {num(enrollment.total_girls).toLocaleString()} Girls</span>
           </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>School Categories</CardTitle>
            <CardDescription>Distribution by education level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category.slice(0, 6)} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" width={100} tick={{fontSize: 11}} interval={0} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  {category.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Management Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Management Type</CardTitle>
            <CardDescription>Who runs the schools?</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={management}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="management_type"
                >
                  {management.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 4. STATE PERFORMANCE TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>State-wise Performance</CardTitle>
          <CardDescription>Detailed breakdown of fetched data by state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">State Name</th>
                  <th className="px-4 py-3 text-right">Schools Fetched</th>
                  <th className="px-4 py-3 text-right">Total Students</th>
                  <th className="px-4 py-3 text-right">Teachers</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">PTR</th>
                </tr>
              </thead>
              <tbody>
                {states.map((st) => {
                  const ptr = num(st.teacher_count) ? Math.round(num(st.student_count) / num(st.teacher_count)) : 0;
                  return (
                    <tr key={st.state_name} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{st.state_name}</td>
                      <td className="px-4 py-3 text-right">{num(st.school_count).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{num(st.student_count).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{num(st.teacher_count).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ptr > 35 ? 'bg-red-100 text-red-700' : 
                          ptr > 25 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {ptr}:1
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SUB COMPONENTS ---

function SyncCard({ title, value, subtitle, icon: Icon, color, bg, progress }: any) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bg} ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          {progress !== undefined && (
            <span className="text-xs font-bold bg-muted px-2 py-1 rounded-full">
              {Math.round(progress)}%
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value.toLocaleString()}</h3>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="h-1 mt-4" />
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, icon: Icon, desc }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
            {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-muted rounded-xl" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  );
}