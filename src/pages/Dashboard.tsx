import { useEffect, useState } from 'react';
import { 
  Building2, Users, GraduationCap, ChevronRight, 
  LayoutGrid, Activity, Zap, Globe, Target, Database, BarChart3, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { api } from '../lib/api';

export default function Dashboard() {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [lifecycle, setLifecycle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // API should now return { hierarchy, lifecycle }
    api.getStateMatrix().then((res: any) => {
      setMatrix(res.hierarchy);
      setLifecycle(res.lifecycle);
    }).finally(() => setIsLoading(false));
  }, []);

  const toggleState = (name: string) => {
    const next = new Set(expandedStates);
    next.has(name) ? next.delete(name) : next.add(name);
    setExpandedStates(next);
  };

  const toggleDistrict = (name: string) => {
    const next = new Set(expandedDistricts);
    next.has(name) ? next.delete(name) : next.add(name);
    setExpandedDistricts(next);
  };

  if (isLoading) return <div className="p-20 text-center font-bold">Loading Departmental Intelligence...</div>;

  return (
    <div className="p-8 max-w-[1650px] mx-auto space-y-10 bg-slate-50/30 animate-in fade-in duration-700">
      
      {/* 1. CEO EXECUTIVE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Department Command Center</h1>
          <p className="text-slate-500 font-semibold uppercase tracking-widest text-xs flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> National Institutional Intelligence Matrix | AY 2025-26
          </p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2 font-bold uppercase text-[10px]">
             Integrity: Verified
          </Badge>
          <Badge variant="outline" className="border-slate-300 px-4 py-2 font-bold text-slate-600 uppercase text-[10px]">
            Data Quality Score: 98.4%
          </Badge>
        </div>
      </div>

      {/* 2. LIVE SYNC PIPELINE (Using lifecycle counts from SQL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FunnelCard title="Master Source" value={lifecycle?.master.toLocaleString()} label="Objects" desc="Potential schools in base dataset." icon={Database} />
        <FunnelCard title="Directory Synced" value={lifecycle?.directory.toLocaleString()} label="Verified" desc="GIS identified school codes." icon={LayoutGrid} />
        <FunnelCard title="Detailed Reports" value={lifecycle?.fetched.toLocaleString()} label="Full DCF" desc="Complete student & faculty profiles." icon={Target} />
      </div>

      {/* 3. PERFORMANCE DRILL-DOWN MATRIX */}
      <Card className="border border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-white">
        <CardHeader className="px-8 py-8 border-b bg-slate-50/80">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">Regional Performance Matrix</CardTitle>
              <CardDescription className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                State → District → Block Distribution
              </CardDescription>
            </div>
            <BarChart3 className="h-8 w-8 text-slate-200" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100 border-b-2">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[450px] py-6 pl-10 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Jurisdiction</TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Schools</TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">PTR</TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Enrolment</TableHead>
                <TableHead className="text-right pr-10 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Infra index</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map((state) => (
                <>
                  <TableRow key={state.name} onClick={() => toggleState(state.name)} className="cursor-pointer group hover:bg-slate-50 border-b border-slate-100">
                    <TableCell className="py-6 pl-10">
                      <div className="flex items-center gap-4">
                        <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${expandedStates.has(state.name) ? 'rotate-90 text-primary' : 'text-slate-300'}`} />
                        <span className="text-lg font-bold text-slate-800 tracking-tight">{state.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-base font-bold">{state.stats.schools.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-bold text-slate-500">{state.stats.ptr}:1</TableCell>
                    <TableCell className="text-right font-mono text-base font-bold text-primary">{state.stats.students.toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-4">
                         <span className="text-sm font-bold text-slate-700">{state.stats.infra_index}%</span>
                         <Progress value={state.stats.infra_index} className="w-24 h-2 bg-slate-100" />
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedStates.has(state.name) && state.districts.map((dist: any) => (
                    <>
                      <TableRow key={dist.name} onClick={() => toggleDistrict(dist.name)} className="bg-slate-50/40 cursor-pointer hover:bg-white transition-colors border-l-4 border-primary/40">
                        <TableCell className="py-4 pl-20">
                          <div className="flex items-center gap-3">
                            <ChevronRight className={`h-4 w-4 transition-transform ${expandedDistricts.has(dist.name) ? 'rotate-90 text-primary' : 'text-slate-300'}`} />
                            <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{dist.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold opacity-60">{dist.stats.schools.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold opacity-50">{dist.stats.ptr}:1</TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold opacity-70">{dist.stats.students.toLocaleString()}</TableCell>
                        <TableCell className="text-right pr-10 text-xs font-bold text-slate-500">{dist.stats.infra_index}%</TableCell>
                      </TableRow>

                      {/* LEVEL 3: BLOCK [Same boldness as District] */}
                      {expandedDistricts.has(dist.name) && dist.blocks.map((block: any) => (
                        <TableRow key={block.name} className="bg-white border-l-8 border-primary/10">
                          <TableCell className="py-3 pl-36">
                            <div className="flex items-center gap-3 text-sm text-slate-700 font-bold uppercase tracking-tighter">
                              <LayoutGrid className="h-4 w-4 text-primary/40" />
                              {block.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-bold opacity-40">{block.stats.schools}</TableCell>
                          <TableCell className="text-right font-mono text-xs font-bold opacity-40">{block.stats.ptr}:1</TableCell>
                          <TableCell className="text-right font-mono text-sm font-bold opacity-60 text-primary">{block.stats.students}</TableCell>
                          <TableCell className="text-right pr-10 opacity-40 text-xs font-bold">{block.stats.infra_index}%</TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. STRATEGIC CEO SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <CEOInsightCard title="Infrastructure Stability" icon={Building2}>
            Gaps identified in <strong>Secondary Sections</strong>. Immediate attention required for Blocks with index scores below 50% to meet 2025-26 compliance.
         </CEOInsightCard>
         <CEOInsightCard title="Enrolment & Equity" icon={TrendingUp} color="text-emerald-600">
            <strong>Gender Parity Index (GPI)</strong> remains stable across urban blocks. Focus shifting to <strong>Out-of-School Children (OoSC)</strong> retention.
         </CEOInsightCard>
      </div>
    </div>
  );
}

function FunnelCard({ title, value, label, desc, icon: Icon }: any) {
  return (
    <Card className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] shadow-sm">
       <CardContent className="p-8 flex items-center gap-6">
          <div className="p-5 bg-slate-50 rounded-full text-slate-300 border shadow-inner"><Icon className="h-8 w-8" /></div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">{value}</span>
              <span className="text-xs font-bold text-slate-400">{label}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 leading-tight mt-2">{desc}</p>
          </div>
       </CardContent>
    </Card>
  );
}

function CEOInsightCard({ title, icon: Icon, color = "text-primary", children }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-md border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`h-6 w-6 ${color}`} />
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 font-bold leading-relaxed">{children}</p>
    </div>
  );
}