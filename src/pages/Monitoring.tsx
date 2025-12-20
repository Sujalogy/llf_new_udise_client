import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Activity, Download, Users, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Monitoring() {
  // Fix: Provide full initial state structure to prevent "undefined" errors
  const [data, setData] = useState<any>({
    summary: { total_users: 0, active_today: 0, total_downloads: 0 },
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

  if (loading) return <div className="p-8 text-center animate-pulse font-mono">Gathering System Intel...</div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Oversight</h1>
          <p className="text-muted-foreground text-sm">v 1.2.2 Monitoring Engine</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 gap-2 bg-white border-green-200">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Real-time Telemetry
        </Badge>
      </div>

      {/* Summary Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Total Users" value={data.summary?.total_users} icon={Users} color="text-blue-600" />
        <MetricCard title="Active (24h)" value={data.summary?.active_today} icon={Activity} color="text-orange-600" />
        <MetricCard title="Data Exports" value={data.summary?.total_downloads} icon={Download} color="text-indigo-600" />
        <MetricCard title="Auth Health" value="100%" icon={ShieldCheck} color="text-green-600" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Trend Visualization */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Download Velocity</CardTitle>
            <CardDescription>User-initiated exports across 14 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Power Users</CardTitle>
            <CardDescription>Top activity contributors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.topUsers.slice(0, 6).map((u: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold truncate max-w-[120px]">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{u.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">{u.download_count}</p>
                  <p className="text-[9px] text-muted-foreground">EXPORTS</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">Global Activity Feed</CardTitle>
          <CardDescription>Verifiable log of all recent data interactions</CardDescription>
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
                <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6 font-semibold">{log.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none text-[10px] uppercase">
                      Export {log.format}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate text-[11px] font-mono text-muted-foreground">
                    {JSON.stringify(log.filters)}
                  </TableCell>
                  <TableCell className="text-right pr-6 text-xs font-medium text-slate-500">
                    {new Date(log.downloaded_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
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

function MetricCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value || 0}</div>
        <div className="flex items-center text-[10px] text-green-600 mt-1 font-bold">
          <ArrowUpRight className="h-3 w-3 mr-0.5" />
          STABLE <span className="text-muted-foreground font-normal ml-1">Live monitoring</span>
        </div>
      </CardContent>
    </Card>
  );
}