import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { 
  Activity, 
  Download, 
  Users, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  HardDrive, 
  BarChart3 
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Monitoring() {
  // State includes expanded summary and topUsers fields for MB tracking
  const [data, setData] = useState<any>({
    summary: { 
      total_users: 0, 
      active_today: 0, 
      total_downloads: 0, 
      daily_mb: 0, 
      weekly_mb: 0, 
      monthly_mb: 0 
    },
    trends: [],
    topUsers: [],
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMonitoringStats()
      .then((res) => {
        if (res && res.summary) setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Monitoring Load Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse font-mono text-slate-500">Initializing System Oversight...</div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Oversight</h1>
          <p className="text-muted-foreground text-sm font-medium italic">v 1.3.2 Monitoring Engine • Real-time Telemetry</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 gap-2 bg-white border-blue-200 text-blue-700 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Live Network Traffic
        </Badge>
      </div>

      {/* Row 1: Global Data Consumption Analytics */}
      <div className="grid gap-4 md:grid-cols-3">
        <UsageCard 
          title="Daily Traffic" 
          value={`${Number(data.summary?.daily_mb || 0).toFixed(2)} MB`} 
          icon={Zap} 
          description="Volume processed since midnight"
          color="text-amber-600 bg-amber-50"
        />
        <UsageCard 
          title="Weekly Volume" 
          value={`${Number(data.summary?.weekly_mb || 0).toFixed(2)} MB`} 
          icon={BarChart3} 
          description="Traffic processed last 7 days"
          color="text-indigo-600 bg-indigo-50"
        />
        <UsageCard 
          title="Monthly Footprint" 
          value={`${Number(data.summary?.monthly_mb || 0).toFixed(2)} MB`} 
          icon={HardDrive} 
          description="Total data exported this month"
          color="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Row 2: High-Level Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Total Users" value={data.summary?.total_users} icon={Users} color="text-blue-600" />
        <MetricCard title="Active (24h)" value={data.summary?.active_today} icon={Activity} color="text-orange-600" />
        <MetricCard title="Total Exports" value={data.summary?.total_downloads} icon={Download} color="text-indigo-600" />
        <MetricCard title="Auth Health" value="100%" icon={ShieldCheck} color="text-green-600" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Row 3: Trend Visualization (Line Chart) */}
        <Card className="md:col-span-2 border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Download Velocity</CardTitle>
            <CardDescription>User-initiated exports across 14 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#4f46e5' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Row 3: User-Wise Consumption (Power Users) */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">User Consumption</CardTitle>
            <CardDescription>Individual bandwidth tracking (Top 8)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.topUsers.slice(0, 8).map((u: any, i: number) => (
              <div key={i} className="flex flex-col space-y-2 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[140px]">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{u.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-indigo-600">{Number(u.total_mb || 0).toFixed(2)} MB</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Lifetime</p>
                  </div>
                </div>
                
                {/* Micro Metrics per User */}
                <div className="flex items-center gap-4 text-[10px] bg-slate-50/80 p-1.5 rounded-md border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Download className="h-3 w-3" />
                    <span>{u.download_count} Exports</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Zap className="h-3 w-3" />
                    <span>{Number(u.daily_mb || 0).toFixed(2)} MB Today</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Global Activity Feed (Audit Log) */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">Global Activity Feed</CardTitle>
          <CardDescription>Real-time audit log of all system data interactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow>
                <TableHead className="pl-6">Initiator</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead className="text-right pr-6">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentLogs.map((log: any, i: number) => (
                <TableRow key={i} className="hover:bg-blue-50/30 transition-colors border-slate-100">
                  <TableCell className="pl-6 font-semibold text-slate-700">{log.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-white border text-indigo-700 border-indigo-100 text-[10px] uppercase font-bold">
                      Export {log.format}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate text-[11px] font-mono text-slate-500 italic">
                    {JSON.stringify(log.filters)}
                  </TableCell>
                  <TableCell className="text-right pr-6 text-xs font-medium text-slate-400">
                    <div className="flex items-center justify-end gap-1.5">
                       <Clock className="h-3 w-3" />
                       {new Date(log.downloaded_at).toLocaleString('en-IN', { 
                         dateStyle: 'medium', 
                         timeStyle: 'short' 
                       })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/** * UsageCard Helper Component
 * Displays MB traffic metrics with large text and distinct icons
 */
function UsageCard({ title, value, icon: Icon, description, color }: any) {
  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="text-[9px] font-mono tracking-tighter opacity-70">TELEMETRY_TX</Badge>
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <div className="text-3xl font-black mt-1 text-slate-900">{value}</div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}

/** * MetricCard Helper Component
 * Displays simple count stats with an "up-right" arrow indicator
 */
function MetricCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value || 0}</div>
        <div className="flex items-center text-[10px] text-green-600 mt-1 font-bold">
          <ArrowUpRight className="h-3 w-3 mr-0.5" />
          STABLE
        </div>
      </CardContent>
    </Card>
  );
}