import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  FileDown, Info, Users, GraduationCap, Coins,
  Milestone, Landmark, ShieldCheck, Laptop, BookOpen
} from "lucide-react";

export default function DcfDetails() {
  /**
   * Exhaustive Mapping Table
   */
  const mappingData = [
    { ourName: "udise_code", dcfName: "UDISE Code", dcfCode: "Section 1A", category: "Identity" },
    { ourName: "school_name", dcfName: "School Name", dcfCode: "1.1", category: "Identity" },
    { ourName: "district_name", dcfName: "Name of the District", dcfCode: "1.2", category: "Identity" },
    { ourName: "block_name", dcfName: "Name of the UDISE+ Block", dcfCode: "1.3", category: "Identity" },
    { ourName: "location_type", dcfName: "Location Type (Rural/Urban)", dcfCode: "1.4", category: "Profile" },
    { ourName: "head_master_name", dcfName: "HoS / In-Charge Name", dcfCode: "1.11 (b)", category: "Staff" },
    { ourName: "management_type", dcfName: "Management Group/Code", dcfCode: "1.12", category: "Profile" },
    { ourName: "category", dcfName: "School Category", dcfCode: "1.16", category: "Profile" },
    { ourName: "lowest_class", dcfName: "Lowest Class in School", dcfCode: "1.17 (a)", category: "Profile" },
    { ourName: "highest_class", dcfName: "Highest Class in School", dcfCode: "1.17 (a)", category: "Profile" },
    { ourName: "school_type", dcfName: "Type (Co-ed/Boys/Girls)", dcfCode: "1.18", category: "Profile" },
    { ourName: "establishment_year", dcfName: "Year of Establishment", dcfCode: "1.23", category: "Profile" },
    { ourName: "total_expenditure", dcfName: "Total Annual Expenditure", dcfCode: "1.62", category: "Finance" },
    { ourName: "building_status", dcfName: "Status of School Building", dcfCode: "2.1", category: "Facility" },
    { ourName: "total_classrooms_in_use", dcfName: "Total Classrooms for Instruction", dcfCode: "2.3 (a)", category: "Facility" },
    { ourName: "total_teachers", dcfName: "Total Teaching Staff", dcfCode: "3.1", category: "Staff" },
    { ourName: "total_students", dcfName: "Total Student Enrolment", dcfCode: "Section 4", category: "Demographics" },
  ];

  const detailSections = [
    {
      title: "Religion & Minority",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      description: "Minority community breakdown (Section 4.1.14)",
      fields: ["Muslim_total_boys", "Christian_total_boys", "Sikh_total_boys", "Buddhist_total_boys", "Parsi_total_boys", "Jain_total_boys"]
    },
    {
      title: "Disadvantaged Groups",
      icon: <Coins className="h-6 w-6 text-emerald-600" />,
      description: "BPL, EWS, and RTE indicators (Section 4.1.15, 4.1.16, 4.2.6)",
      fields: ["BPL_total_boys", "EWS_total_boys", "RTE_total_boys", "CWSN_total_boys", "Repeater_total_boys"]
    },
    {
      title: "Teacher Qualifications",
      icon: <GraduationCap className="h-6 w-6 text-purple-600" />,
      description: "Professional training degree codes (Section 3.3.7)",
      fields: ["teacher_qual_deled", "teacher_qual_bed", "teacher_qual_bele", "teacher_qual_special_ed", "teacher_qual_med"]
    },
    {
      title: "Age-Wise Profile",
      icon: <Milestone className="h-6 w-6 text-orange-600" />,
      description: "Enrolment by age brackets (Section 5.2, 5.3)",
      fields: ["Age_3_total_boys", "Age_6_total_boys", "Age_14_total_boys", "Age_18_total_boys", "Age_22_total_boys"]
    },
    {
      title: "Infrastructure Safety",
      icon: <ShieldCheck className="h-6 w-6 text-red-600" />,
      description: "Facility booleans and safety audits (Section 1B, 2)",
      fields: ["has_solar_panel", "has_rain_harvesting", "has_medical_checkup", "has_drinking_water_facility", "has_ramps", "boundary_wall_type"]
    },
    {
      title: "Digital Initiatives",
      icon: <Laptop className="h-6 w-6 text-indigo-600" />,
      description: "ICT and Computer status (Section 2.24, 2.26)",
      fields: ["functional_desktops", "total_digital_boards", "has_internet", "has_dth_access", "has_integrated_lab"]
    },
    {
      title: "Academic Standards",
      icon: <BookOpen className="h-6 w-6 text-cyan-600" />,
      description: "Curriculum and instruction (Section 1.25, 1.38, 1.39)",
      fields: ["medium_of_instruction_1", "instructional_days", "is_cce_implemented", "is_shift_school", "is_pre_primary_section"]
    },
    {
      title: "Staff Composition",
      icon: <Landmark className="h-6 w-6 text-slate-600" />,
      description: "Employment types and visits (Section 3.1, 1.45)",
      fields: ["total_regular_teachers", "total_contract_teachers", "total_part_time_teachers", "visits_by_brc", "visits_by_crc"]
    }
  ];

  const handleDownloadDcf = () => {
    const link = document.createElement("a");
    link.href = "/UDISE DCF.pdf"; //
    link.download = "UDISE_DCF_Template_2025-26.pdf";
    link.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">DCF Field Mapping</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Exhaustive data dictionary mapping internal columns to original UDISE+ 2025-26 Data Capture Format.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadDcf} className="gap-3 border-primary/20 hover:bg-primary/5 shadow-md h-14 px-6 text-base font-bold">
          <FileDown className="h-6 w-6 text-primary" />
          Download DCF Template
        </Button>
      </header>

      {/* Main Table */}
      <Card className="shadow-xl border-primary/5">
        <CardHeader className="bg-muted/30 border-b py-6">
          <CardTitle className="text-2xl font-bold">Standardized Export Mapping Table</CardTitle>
          <CardDescription className="text-base">Primary school-level identifiers and core infrastructure fields.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="w-[300px] font-bold py-6 text-base">Internal Field Name</TableHead>
                <TableHead className="font-bold py-6 text-base">Original DCF Description</TableHead>
                <TableHead className="w-[180px] font-bold text-center text-base">DCF Code</TableHead>
                <TableHead className="w-[200px] font-bold text-right px-10 text-base">Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappingData.map((item, index) => (
                <TableRow key={index} className="hover:bg-primary/[0.02] transition-colors border-b last:border-0">
                  <TableCell className="font-mono text-sm text-primary font-bold tracking-tight py-4">{item.ourName}</TableCell>
                  <TableCell className="text-base font-medium text-foreground/80 py-4">{item.dcfName}</TableCell>
                  <TableCell className="text-center py-4">
                    <Badge variant="outline" className="text-xs bg-white border-primary/10 px-3 py-1 font-semibold">Q: {item.dcfCode}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-10 py-4">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-70">
                      {item.category}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Granular Details Grid */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b-2 border-primary/10 pb-4">
          <Info className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-black tracking-tight text-foreground">Granular Data Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {detailSections.map((sec, i) => (
            <Card key={i} className="border-primary/5 hover:border-primary/20 transition-all shadow-lg flex flex-col">
              <CardHeader className="pb-5 bg-muted/20 border-b">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white rounded-2xl border shadow-inner shrink-0">{sec.icon}</div>
                  <div>
                    <CardTitle className="text-xl font-bold leading-tight">{sec.title}</CardTitle>
                    <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-tight mt-1">
                      {sec.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                <div className="flex flex-wrap gap-2.5">
                  {sec.fields.map((f, fi) => (
                    <Badge key={fi} variant="secondary" className="px-3 py-1.5 bg-primary/5 text-primary border-primary/10 text-xs font-mono font-bold tracking-tight">
                      {f}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border-2 border-primary/10 p-8 rounded-3xl flex gap-8 items-start shadow-inner">
        <div className="h-12 w-12 text-primary shrink-0 flex items-center justify-center rounded-full bg-white border-4 border-primary/10">
          <span className="text-2xl font-black italic">i</span>
        </div>
        <div className="space-y-3">
          <p className="text-xl font-bold text-foreground">Technical Mapping Notes</p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Staff qualifications (Section 3.3.7) and Student economic status (Section 4.1.15) map internal flags to the specific multi-choice codes defined in the Academic Year 2025-26 format. Enrolment aggregates (e.g., <code className="bg-white px-1 rounded border font-bold text-primary">Age_14_total_boys</code>) are synthesized from the BRC level age-enrolment tables in Section 5.
          </p>
        </div>
      </div>
    </div>
  );
}