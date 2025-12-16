import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Building2, 
  CheckCircle2, XCircle, School, BookOpen, UserCircle, 
  Droplets, Zap, Accessibility, Phone, Calendar, Monitor, 
  ClipboardCheck, GraduationCap, LayoutGrid
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { api } from '../lib/api';
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
        {/* UPDATED: Uses navigate(-1) to preserve filters */}
        <Button onClick={() => navigate(-1)}>Back to List</Button>
      </div>
    );
  }

  const { profile, facility, social, teachers, stats } = data;

  const socialChartData = [
    { name: 'General', value: social.general, color: '#94a3b8' },
    { name: 'SC', value: social.caste_SC, color: '#f59e0b' },
    { name: 'ST', value: social.caste_ST, color: '#10b981' },
    { name: 'OBC', value: social.OBC, color: '#3b82f6' },
  ];

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          {/* UPDATED: Uses navigate(-1) to preserve filters */}
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="shrink-0 mt-1">
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
              {profile.is_cwsn_school && <Badge className="bg-blue-100 text-blue-700">Special School (CWSN)</Badge>}
              {profile.shift_school && <Badge className="bg-purple-100 text-purple-700">Shift School</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.school_name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>
                  {profile.village ? `${profile.village}, ` : ''}
                  {profile.block_name}, {profile.district_name}
                </span>
              </div>
              <Separator orientation="vertical" className="hidden sm:block h-4" />
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{profile.school_phone || 'No Phone'}</span>
              </div>
              <Separator orientation="vertical" className="hidden sm:block h-4" />
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Estd: {profile.establishment_year || 'N/A'}</span>
              </div>
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
        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 space-x-6 overflow-x-auto">
          <TabLink value="overview">Overview</TabLink>
          <TabLink value="infrastructure">Infrastructure</TabLink>
          <TabLink value="students">Demographics</TabLink>
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
                  <InfoRow label="Location Type" value={profile.location_type} />
                  <Separator />
                  <InfoRow label="Residential Type" value={profile.residential_school_type || 'Non-Residential'} />
                  <Separator />
                  <InfoRow label="Pre-Primary Section" value={profile.is_pre_primary_section} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Academics & Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <InfoRow label="Management" value={profile.management_type} />
                  <Separator />
                  <InfoRow label="Instructional Days" value={profile.instructional_days} />
                  <Separator />
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Mediums of Instruction</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[profile.medium_of_instruction_1, profile.medium_of_instruction_2, profile.medium_of_instruction_3, profile.medium_of_instruction_4]
                        .filter(Boolean)
                        .map((m: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-secondary/50">{m}</Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Official Visits Section */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    Official Visits & Inspections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">BRC Visits</p>
                      <p className="text-2xl font-bold">{profile.visits_by_brc || 0}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">CRC Visits</p>
                      <p className="text-2xl font-bold">{profile.visits_by_crc || 0}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">District Officer</p>
                      <p className="text-2xl font-bold">{profile.visits_by_district_officer || 0}</p>
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
                desc={`${facility.good_condition_classrooms || 0} in good condition`}
              />
              <FacilityCard 
                title="Digital Boards" 
                value={facility.total_digital_boards || 0} 
                icon={Monitor} 
                desc="Smart Classrooms"
              />
              <FacilityCard 
                title="Desktops" 
                value={facility.functional_desktops || 0} 
                icon={Monitor} 
                desc="Functional Units"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Sanitation & Hygiene
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-xs text-blue-600 font-medium">Boys Toilets</p>
                        <p className="text-xl font-bold text-blue-800">{facility.toilet_boys}</p>
                      </div>
                      <div className="p-3 bg-pink-50 rounded-lg text-center">
                        <p className="text-xs text-pink-600 font-medium">Girls Toilets</p>
                        <p className="text-xl font-bold text-pink-800">{facility.toilet_girls}</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 rounded-lg text-center">
                        <p className="text-xs text-blue-600/80 font-medium">Boys Urinals</p>
                        <p className="text-xl font-bold text-blue-800/80">{facility.urinals_boys || 0}</p>
                      </div>
                      <div className="p-3 bg-pink-50/50 rounded-lg text-center">
                        <p className="text-xs text-pink-600/80 font-medium">Girls Urinals</p>
                        <p className="text-xl font-bold text-pink-800/80">{facility.urinals_girls || 0}</p>
                      </div>
                   </div>
                   <Separator />
                   <div className="grid grid-cols-2 gap-2">
                      <StatusBadge label="Drinking Water" active={facility.drinking_water} />
                      <StatusBadge label="Handwash (Meal)" active={facility.has_handwash_meal} />
                      <StatusBadge label="Handwash (Common)" active={facility.has_handwash_common} />
                      <StatusBadge label="Incinerator" active={false} /> 
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                    General Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                     <StatusRow label="Electricity" active={facility.electricity} icon={Zap} />
                     <StatusRow label="Internet" active={facility.has_internet} icon={Zap} />
                     <StatusRow label="Solar Panel" active={facility.has_solar_panel} icon={Zap} />
                     <StatusRow label="Rain Harvest" active={facility.has_rain_harvesting} icon={Droplets} />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <StatusRow label="Ramps" active={facility.has_ramps} icon={Accessibility} />
                    <StatusRow label="Handrails" active={facility.has_handrails} icon={Accessibility} />
                    <StatusRow label="Library" active={facility.library} icon={BookOpen} />
                    <StatusRow label="Playground" active={facility.playground} icon={UserCircle} />
                  </div>
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm flex justify-between">
                    <span>Furniture for Students</span>
                    <span className="font-bold">{facility.students_with_furniture || 0}</span>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="text-sm font-medium text-muted-foreground">Regular</div>
                  <div className="text-3xl font-bold mt-2 text-green-600">{teachers.regular}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">Contractual</div>
                  <div className="text-3xl font-bold mt-2 text-orange-600">{teachers.contract}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">Non-Teaching Duty</div>
                  <div className="text-3xl font-bold mt-2 text-red-500">{teachers.non_teaching_assignments || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Teachers assigned other work</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
               {/* Qualifications Chart */}
               <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Academic Qualifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <QualificationRow label="Post Graduate" count={teachers.post_graduate_above} total={teachers.total_teachers} />
                     <QualificationRow label="Graduate" count={teachers.graduate_above} total={teachers.total_teachers} />
                     <QualificationRow label="Below Graduate" count={teachers.below_graduate} total={teachers.total_teachers} />
                  </CardContent>
               </Card>

               {/* Professional Qualifications Breakdown */}
               <Card>
                  <CardHeader>
                    <CardTitle>Professional Qualifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <CompactRow label="B.Ed" count={teachers.qual_bed} />
                      <CompactRow label="M.Ed" count={teachers.qual_med} />
                      <CompactRow label="D.El.Ed" count={teachers.qual_deled} />
                      <CompactRow label="Diploma (Basic)" count={teachers.qual_diploma_basic} />
                      <CompactRow label="B.El.Ed" count={teachers.qual_bele} />
                      <CompactRow label="Special Ed." count={teachers.qual_special_ed} />
                      <CompactRow label="Pursuing" count={teachers.qual_pursuing} />
                      <CompactRow label="None/Other" count={(teachers.qual_none || 0) + (teachers.qual_others || 0)} />
                    </div>
                    <Separator className="my-4"/>
                    <div className="flex justify-between items-center text-sm font-medium">
                       <span>In-Service Training Received</span>
                       <Badge variant="secondary">{teachers.in_service_training || 0} Teachers</Badge>
                    </div>
                  </CardContent>
               </Card>
            </div>
          </TabsContent>
          
          {/* TAB: STUDENTS (Existing) */}
          <TabsContent value="students" className="space-y-6">
             <div className="grid gap-6 md:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Social Category Distribution</CardTitle>
                  <CardDescription>Breakdown of student enrolment</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={socialChartData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
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
      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 pb-3 pt-2 font-medium shrink-0"
    >
      {children}
    </TabsTrigger>
  );
}

function InfoRow({ label, value }: { label: string, value: string | number | undefined }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right break-words max-w-[60%]">{value || '-'}</span>
    </div>
  );
}

function StatusBadge({ label, active }: { label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
      {active ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
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
    <div className="flex items-center gap-3 p-2">
      <div className={`p-1.5 rounded-full shrink-0 ${active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs ${active ? 'text-green-600' : 'text-red-600'}`}>
          {active ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
}

function QualificationRow({ label, count, total }: { label: string, count?: number, total: number }) {
  const percentage = total > 0 ? Math.round(((count || 0) / total) * 100) : 0;
  return (
    <div>
       <div className="flex justify-between mb-1 text-sm">
          <span>{label}</span>
          <span className="font-bold">{count || 0}</span>
       </div>
       <Progress value={percentage} className="h-2" />
    </div>
  );
}

function CompactRow({ label, count }: { label: string, count?: number }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-dashed last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{count || 0}</span>
    </div>
  );
}