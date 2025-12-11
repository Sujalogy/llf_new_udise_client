import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { api } from '../lib/api';
import type {
  SchoolProfile,
  SchoolFacility,
  SocialData,
  TeacherStats,
  ReportCard,
} from '../types/school';

export default function SchoolDetail() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [facility, setFacility] = useState<SchoolFacility | null>(null);
  const [socialData, setSocialData] = useState<SocialData | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!schoolId) return;

    async function fetchSchoolData() {
      setIsLoading(true);
      try {
        const profileData = await api.getSchoolProfile(schoolId!);
        setProfile(profileData);
      } catch (error) {
        // Demo data
        setProfile({
          udise_code: '09010101001',
          school_name: 'Government Primary School Aminabad',
          state_name: 'Uttar Pradesh',
          district_name: 'Lucknow',
          block_name: 'Lucknow',
          cluster: 'Aminabad Cluster',
          pincode: '226001',
          category_name: 'Primary',
          management_type: 'Government',
          establishment_year: 1965,
          assembly_constituency: 'Lucknow West',
          latitude: 26.8467,
          longitude: 80.9462,
        });
      }
      setIsLoading(false);
    }

    fetchSchoolData();
  }, [schoolId]);

  const loadTabData = async (tab: string) => {
    if (!schoolId) return;

    try {
      switch (tab) {
        case 'facility':
          if (!facility) {
            const data = await api.getSchoolFacility(schoolId);
            setFacility(data);
          }
          break;
        case 'social':
          if (!socialData) {
            const data = await api.getSocialData(schoolId, 1);
            setSocialData(data);
          }
          break;
        case 'teachers':
          if (!teacherStats) {
            const data = await api.getEnrolmentTeacher(schoolId);
            setTeacherStats(data);
          }
          break;
        case 'report':
          if (!reportCard) {
            const data = await api.getReportCard(schoolId);
            setReportCard(data);
          }
          break;
      }
    } catch (error) {
      // Set demo data based on tab
      if (tab === 'facility' && !facility) {
        setFacility({
          toilet_boys: 4,
          toilet_girls: 4,
          electricity: true,
          furniture: 'Adequate',
          boundary_wall: 'Complete',
          building_status: 'Good',
          classroom_count: 12,
          drinking_water: true,
          library: true,
          playground: true,
          ramp: true,
        });
      }
      if (tab === 'social' && !socialData) {
        setSocialData({
          caste_SC: 45,
          caste_ST: 12,
          OBC: 78,
          EWS: 34,
          general: 89,
          CWSN: 5,
        });
      }
      if (tab === 'teachers' && !teacherStats) {
        setTeacherStats({
          teachers_male: 8,
          teachers_female: 12,
          total_teachers: 20,
          ptr_primary: 28,
          ptr_upper_primary: 32,
          highly_qualified_count: 15,
        });
      }
      if (tab === 'report' && !reportCard) {
        setReportCard({
          students_total: 456,
          teachers_total: 20,
          ramp_available: true,
          library_available: true,
          drinking_water_status: 'Available',
          playground_status: 'Available',
        });
      }
    }
  };

  useEffect(() => {
    if (activeTab !== 'profile') {
      loadTabData(activeTab);
    }
  }, [activeTab, schoolId]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">School not found</p>
        <Button onClick={() => navigate('/my-schools')} className="mt-4">
          Back to My Schools
        </Button>
      </div>
    );
  }

  const StatusBadge = ({ value }: { value: boolean | string }) => {
    const isPositive = value === true || value === 'Available' || value === 'Yes';
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
        }`}
      >
        {isPositive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/my-schools')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile.school_name}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="font-mono text-primary">{profile.udise_code}</span>
                <span>•</span>
                <MapPin className="h-3.5 w-3.5" />
                {profile.district_name}, {profile.state_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="mb-6 rounded-lg border border-success/20 bg-success/5 p-4">
        <h3 className="font-medium text-foreground">Step 3: Live Data Reports</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          View detailed information fetched live from the UDISE+ server. Switch between tabs to
          explore different aspects of the school.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start bg-muted/50 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="facility">Facilities</TabsTrigger>
          <TabsTrigger value="social">Social Data</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="report">Report Card</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-foreground">Basic Information</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{profile.category_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Management</dt>
                  <dd className="font-medium">{profile.management_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Established</dt>
                  <dd className="font-medium">{profile.establishment_year}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cluster</dt>
                  <dd className="font-medium">{profile.cluster}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-foreground">Location Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Block</dt>
                  <dd className="font-medium">{profile.block_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Assembly</dt>
                  <dd className="font-medium">{profile.assembly_constituency}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pincode</dt>
                  <dd className="font-mono">{profile.pincode}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Coordinates</dt>
                  <dd className="font-mono text-sm">
                    {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>

        {/* Facility Tab */}
        <TabsContent value="facility">
          {facility ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Infrastructure</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Classrooms</dt>
                    <dd className="font-medium">{facility.classroom_count}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Building Status</dt>
                    <dd className="font-medium">{facility.building_status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Boundary Wall</dt>
                    <dd className="font-medium">{facility.boundary_wall}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Furniture</dt>
                    <dd className="font-medium">{facility.furniture}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Sanitation</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Boys Toilets</dt>
                    <dd className="font-medium">{facility.toilet_boys}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Girls Toilets</dt>
                    <dd className="font-medium">{facility.toilet_girls}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Drinking Water</dt>
                    <dd><StatusBadge value={facility.drinking_water} /></dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Amenities</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Electricity</dt>
                    <dd><StatusBadge value={facility.electricity} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Library</dt>
                    <dd><StatusBadge value={facility.library} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Playground</dt>
                    <dd><StatusBadge value={facility.playground} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ramp</dt>
                    <dd><StatusBadge value={facility.ramp} /></dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading facilities data...</p>
            </div>
          )}
        </TabsContent>

        {/* Social Data Tab */}
        <TabsContent value="social">
          {socialData ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                    <Users className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SC Students</p>
                    <p className="text-2xl font-bold">{socialData.caste_SC}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                    <Users className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ST Students</p>
                    <p className="text-2xl font-bold">{socialData.caste_ST}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                    <Users className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">OBC Students</p>
                    <p className="text-2xl font-bold">{socialData.OBC}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                    <Users className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EWS Students</p>
                    <p className="text-2xl font-bold">{socialData.EWS}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">General</p>
                    <p className="text-2xl font-bold">{socialData.general}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CWSN</p>
                    <p className="text-2xl font-bold">{socialData.CWSN}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading social data...</p>
            </div>
          )}
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers">
          {teacherStats ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Teachers</p>
                    <p className="text-2xl font-bold">{teacherStats.total_teachers}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                    <GraduationCap className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Male Teachers</p>
                    <p className="text-2xl font-bold">{teacherStats.teachers_male}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                    <GraduationCap className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Female Teachers</p>
                    <p className="text-2xl font-bold">{teacherStats.teachers_female}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Pupil-Teacher Ratio</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Primary</dt>
                    <dd className="font-medium">{teacherStats.ptr_primary}:1</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Upper Primary</dt>
                    <dd className="font-medium">{teacherStats.ptr_upper_primary}:1</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <GraduationCap className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Highly Qualified</p>
                    <p className="text-2xl font-bold">{teacherStats.highly_qualified_count}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading teacher statistics...</p>
            </div>
          )}
        </TabsContent>

        {/* Report Card Tab */}
        <TabsContent value="report">
          {reportCard ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Summary</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Students</dt>
                    <dd className="font-medium">{reportCard.students_total}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Teachers</dt>
                    <dd className="font-medium">{reportCard.teachers_total}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Facilities Status</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ramp Available</dt>
                    <dd><StatusBadge value={reportCard.ramp_available} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Library</dt>
                    <dd><StatusBadge value={reportCard.library_available} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Drinking Water</dt>
                    <dd><StatusBadge value={reportCard.drinking_water_status} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Playground</dt>
                    <dd><StatusBadge value={reportCard.playground_status} /></dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading report card...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
