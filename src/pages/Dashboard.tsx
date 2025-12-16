import { useEffect, useState } from 'react';
import { School, Database, Activity, ChevronDown, ChevronRight, LayoutGrid, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import type { DashboardData } from '../types/school';

// Define Matrix Types Locally (or import from api/types)
interface MatrixStats {
  schools: number;
  districts: number;
  blocks: number;
  teachers: number;
  students: number;
}

interface MatrixNode {
  type: 'state' | 'district';
  name: string;
  stats: MatrixStats;
  districts?: MatrixNode[];
}

export default function Dashboard() {
  // State for Upper Part (Sync Stats)
  const [data, setData] = useState<DashboardData | null>(null);
  // State for Lower Part (Matrix Table)
  const [matrix, setMatrix] = useState<MatrixNode[]>([]);
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        // Fetch both Sync Stats and Matrix Data in parallel
        const [statsResult, matrixResult] = await Promise.all([
            api.getDashboardStats(),
            api.getStateMatrix()
        ]);
        setData(statsResult);
        setMatrix(matrixResult);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toggleExpand = (stateName: string) => {
    const newSet = new Set(expandedStates);
    if (newSet.has(stateName)) newSet.delete(stateName);
    else newSet.add(stateName);
    setExpandedStates(newSet);
  };

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div>No data available</div>;

  const { sync } = data; 
  const num = (v: string | number) => Number(v) || 0;

  // Calculate percentages for Sync Funnel
  const masterCount = num(sync.total_master_ids);
  const dirCount = num(sync.synced_directory);
  const detailCount = num(sync.synced_details);
  
  const dirPercent = masterCount ? (dirCount / masterCount) * 100 : 0;
  const detailPercent = masterCount ? (detailCount / masterCount) * 100 : 0;

  return (
    <div className="animate-fade-in pb-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of sync status and regional performance.</p>
      </div>

      {/* 1. UPPER PART: SYNC STATUS CARDS (Preserved) */}
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
          title="Total School Fetched" 
          value={detailCount} 
          subtitle={`${Math.round(detailPercent)}% have Full Reports`}
          icon={Activity}
          color="text-green-500"
          bg="bg-green-100"
          progress={detailPercent}
        />
      </div>

      {/* 2. LOWER PART: EXPANDABLE MATRIX TABLE (New) */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle>State & District Report</CardTitle>
          <CardDescription>Click on a state row to view district-wise breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-muted/50 p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider border-b">
              <div className="col-span-4 pl-2">Location</div>
              <div className="col-span-2 text-right">Schools</div>
              <div className="col-span-2 text-right">Districts</div>
              <div className="col-span-2 text-right">Blocks</div>
              <div className="col-span-1 text-right">Teachers</div>
              <div className="col-span-1 text-right pr-2">Students</div>
            </div>
            
            <div className="max-h-[600px] overflow-auto">
              {matrix.map((state) => {
                const isExpanded = expandedStates.has(state.name);
                return (
                  <div key={state.name} className="group border-b last:border-0 transition-colors hover:bg-muted/10">
                    
                    {/* STATE ROW (Clickable) */}
                    <div 
                      className={`grid grid-cols-12 gap-4 p-4 cursor-pointer items-center transition-all duration-200 ${isExpanded ? "bg-muted/10" : ""}`}
                      onClick={() => toggleExpand(state.name)}
                    >
                      <div className="col-span-4 flex items-center gap-3 font-semibold text-foreground">
                        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                           {isExpanded ? <ChevronDown className="h-4 w-4 text-primary"/> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <span className="text-sm">{state.name}</span>
                      </div>

                      <div className="col-span-2 text-right font-mono text-sm font-medium">
                        {state.stats.schools.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right font-mono text-sm">
                         {/* Show District Count for State */}
                         <Badge variant="secondary" className="font-normal text-xs h-5 px-1.5">{state.stats.districts}</Badge>
                      </div>
                      <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">
                        {state.stats.blocks}
                      </div>
                      <div className="col-span-1 text-right font-mono text-sm text-muted-foreground">
                        {state.stats.teachers.toLocaleString()}
                      </div>
                      <div className="col-span-1 text-right font-mono text-sm font-bold text-primary pr-2">
                        {state.stats.students.toLocaleString()}
                      </div>
                    </div>

                    {/* EXPANDED DISTRICT ROWS */}
                    {isExpanded && (
                      <div className="bg-muted/5 border-t border-b-0 shadow-inner">
                        {state.districts?.map((dist) => (
                          <div 
                            key={dist.name} 
                            className="grid grid-cols-12 gap-4 py-3 px-4 text-sm text-muted-foreground hover:bg-muted/10 hover:text-foreground transition-colors border-b last:border-0 border-dashed border-muted/50"
                          >
                            <div className="col-span-4 flex items-center gap-3 pl-10 relative">
                              {/* Visual Tree Connector */}
                              <div className="absolute left-6 top-0 bottom-1/2 w-px bg-border -z-10" />
                              <div className="absolute left-6 top-1/2 w-3 h-px bg-border" />
                              
                              <LayoutGrid className="h-3.5 w-3.5 opacity-50" />
                              <span className="truncate">{dist.name}</span>
                            </div>
                            <div className="col-span-2 text-right font-mono text-xs">
                                {dist.stats.schools.toLocaleString()}
                            </div>
                            <div className="col-span-2 text-right text-xs opacity-20">-</div>
                            <div className="col-span-2 text-right font-mono text-xs">
                                {dist.stats.blocks}
                            </div>
                            <div className="col-span-1 text-right font-mono text-xs">
                                {dist.stats.teachers.toLocaleString()}
                            </div>
                            <div className="col-span-1 text-right font-mono text-xs pr-2">
                                {dist.stats.students.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {matrix.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
                  <div className="p-4 bg-muted rounded-full">
                    <Map className="h-8 w-8 opacity-50" />
                  </div>
                  <p>No regional data available yet.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SUB COMPONENTS (Preserved) ---

function SyncCard({ title, value, subtitle, icon: Icon, color, bg, progress }: any) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
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

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-muted rounded-xl" />)}
      </div>
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  );
}