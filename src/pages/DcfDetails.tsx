import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function DcfDetails() {
  const sections = [
    { title: "Identity", fields: ["School ID", "UDISE Code", "School Name", "State", "District", "Block"] },
    { title: "Demographics", fields: ["Total Boys", "Total Girls", "SC Enrollment", "ST Enrollment", "Muslim Enrollment"] },
    { title: "Facilities", fields: ["Drinking Water", "Toilet Count", "Electricity Status", "Library", "Playground"] }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">DCF Details (CSV Export Mapping)</h1>
      <p className="text-muted-foreground">Standardized column structure used during all school data downloads.</p>
      
      <div className="grid gap-6">
        {sections.map(sec => (
          <Card key={sec.title}>
            <CardHeader><CardTitle className="text-lg">{sec.title}</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {sec.fields.map(f => (
                <span key={f} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                  {f}
                </span>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}