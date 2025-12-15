import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Building2, Users, GraduationCap, 
  CheckCircle2, XCircle, School, BookOpen, UserCircle, Droplets, Zap, Accessibility
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { api } from '../lib/api';
// Use Recharts for a beautiful chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SchoolDetail() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await api.getLocalSchoolDetails(schoolId!);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch local details", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [schoolId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading School Report...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-muted p-4">
          <School className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">School data not found</h2>
        <p className="text-muted-foreground">Please sync this school in the Admin panel first.</p>
        <Button onClick={() => navigate('/my-schools')}>Back to List</Button>
      </div>
    );
  }

  const { profile, facility, social, teachers, stats } = data;

  // Prepare chart data
  const socialChartData = [
    { name: 'General', value: social.general, color: '#94a3b8' }, // slate-400
    { name: 'SC', value: social.caste_SC, color: '#f59e0b' },     // amber-500
    { name: 'ST', value: social.caste_ST, color: '#10b981' },     // emerald-500
    { name: 'OBC', value: social.OBC, color: '#3b82f6' },         // blue-500
  ];

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/my-schools')} className="shrink-0 mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-mono">
                {profile.udise_code}
              </Badge>
              <Badge variant="secondary">{profile.school_status}</Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                {profile.year_desc}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.school_name}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {profile.village ? `${profile.village}, ` : ''}
                {profile.block_name}, {profile.district_name}, {profile.state_name}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Box */}
        <div className="flex gap-4 p-4 bg-card border rounded-xl shadow-sm">
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Students</p>
            <p className="text-2xl font-bold text-primary">{stats.students_total}</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Teachers</p>
            <p className="text-2xl font-bold text-primary">{teachers.total_teachers}</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground uppercase font-semibold">PTR</p>
            <p className="text-2xl font-bold text-primary">
              {teachers.total_teachers > 0 ? Math.round(stats.students_total / teachers.total_teachers) : 0}:1
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT TABS */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 space-x-6">
          <TabLink value="overview">Overview</TabLink>
          <TabLink value="infrastructure">Infrastructure</TabLink>
          <TabLink value="students">Student Demographics</TabLink>
          <TabLink value="staff">Teaching Staff</TabLink>
        </TabsList>

        <div className="mt-6">
          {/* TAB: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    School Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <InfoRow label="Head Master" value={profile.head_master} />
                  <Separator />
                  <InfoRow label="Category" value={profile.category_name} />
                  <Separator />
                  <InfoRow label="Cluster" value={profile.cluster} />
                  <Separator />
                  <InfoRow label="Establishment Year" value={profile.establishment_year || 'N/A'} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Management & Medium
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <InfoRow label="Management" value={profile.management_type} />
                  <Separator />
                  <InfoRow label="Status" value={profile.school_status} />
                  <Separator />
                  <div className="pt-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Key Facilities Check</p>
                    <div className="grid grid-cols-2 gap-3">
                      <StatusBadge label="Library" active={facility.library} />
                      <StatusBadge label="Playground" active={facility.playground} />
                      <StatusBadge label="Electricity" active={facility.electricity} />
                      <StatusBadge label="Water" active={facility.drinking_water} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: INFRASTRUCTURE */}
          <TabsContent value="infrastructure" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <FacilityCard 
                title="Classrooms" 
                value={facility.classroom_count} 
                icon={School} 
                desc={`Condition: ${facility.building_status}`}
              />
              <FacilityCard 
                title="Boys Toilets" 
                value={facility.toilet_boys} 
                icon={UserCircle} 
                desc="Functional units"
              />
              <FacilityCard 
                title="Girls Toilets" 
                value={facility.toilet_girls} 
                icon={UserCircle} 
                desc="Functional units"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Amenities Checklist</CardTitle>
                <CardDescription>Status of essential school facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatusRow label="Drinking Water" active={facility.drinking_water} icon={Droplets} />
                  <StatusRow label="Electricity Connection" active={facility.electricity} icon={Zap} />
                  <StatusRow label="Library Available" active={facility.library} icon={BookOpen} />
                  <StatusRow label="Playground" active={facility.playground} icon={UserCircle} />
                  <StatusRow label="Ramp for CWSN" active={facility.ramp} icon={Accessibility} />
                  <StatusRow label="Boundary Wall" active={facility.boundary_wall !== 'Not Applicable'} icon={Building2} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: STUDENTS */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Social Category Distribution</CardTitle>
                  <CardDescription>Breakdown of student enrolment by caste category</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={socialChartData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {socialChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Special Groups</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">CWSN Students</span>
                        <span className="text-sm font-bold">{social.CWSN}</span>
                      </div>
                      <Progress value={(social.CWSN / stats.students_total) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">EWS Students</span>
                        <span className="text-sm font-bold">{social.EWS}</span>
                      </div>
                      <Progress value={(social.EWS / stats.students_total) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Enrolment</p>
                    <p className="text-4xl font-bold text-primary">{stats.students_total}</p>
                    <div className="flex justify-center gap-4 mt-4 text-sm">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"/> Boys: {stats.students_boys}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"/> Girls: {stats.students_girls}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB: STAFF */}
          <TabsContent value="staff" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">Total Teachers</div>
                  <div className="text-3xl font-bold mt-2">{teachers.total_teachers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">Regular Staff</div>
                  <div className="text-3xl font-bold mt-2 text-success">{teachers.regular}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">Contract Staff</div>
                  <div className="text-3xl font-bold mt-2 text-warning">{teachers.contract}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">Gender Ratio</div>
                  <div className="text-lg font-medium mt-2">
                    {teachers.teachers_male} M / {teachers.teachers_female} F
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function TabLink({ value, children }: { value: string, children: any }) {
  return (
    <TabsTrigger 
      value={value} 
      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 pb-3 pt-2 font-medium"
    >
      {children}
    </TabsTrigger>
  );
}

function InfoRow({ label, value }: { label: string, value: string | number | undefined }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value || '-'}</span>
    </div>
  );
}

function StatusBadge({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
      {active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

function FacilityCard({ title, value, icon: Icon, desc }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, active, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg">
      <div className={`p-2 rounded-full ${active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className={`text-xs ${active ? 'text-green-600' : 'text-red-600'}`}>
          {active ? 'Available' : 'Not Available'}
        </p>
      </div>
    </div>
  );
}