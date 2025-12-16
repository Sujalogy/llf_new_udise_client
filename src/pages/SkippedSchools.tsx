import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import type { Year, State } from '../types/school';

interface SkippedSummary {
    state: string;
    district: string;
    count: number;
    year: string;
}

export default function SkippedSchools() {
    // Filters
    const [years, setYears] = useState<Year[]>([]);
    const [states, setStates] = useState<State[]>([]);
    
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedState, setSelectedState] = useState<string>('');

    // Data
    const [summary, setSummary] = useState<SkippedSummary[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        Promise.all([api.getYears(), api.getSyncedStates()])
            .then(([y, s]) => { setYears(y); setStates(s); })
            .catch(console.error);
    }, []);

    // Fetch Summary when filters change
    useEffect(() => {
        async function fetchSummary() {
            setLoading(true);
            try {
                // Assuming API returns grouped data [State, District, Count]
                const data = await api.getSkippedSummary(selectedYear, selectedState);
                setSummary(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchSummary();
    }, [selectedYear, selectedState]);

    const handleDownload = (format: 'csv' | 'json') => {
        api.exportSkippedList(format, { yearId: selectedYear, stcode: selectedState });
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-10">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Skipped Schools Report</h1>
                <p className="text-muted-foreground">Summary of schools skipped during sync processes.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                    <Label>Filter by State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All States</SelectItem>
                            {states.map(s => <SelectItem key={s.stcode11} value={s.stcode11}>{s.stname}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Summary Overview</CardTitle>
                        <CardDescription>Schools grouped by location and academic year.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload('json')}>
                            <Download className="h-4 w-4 mr-2"/> JSON
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleDownload('csv')}>
                            <Download className="h-4 w-4 mr-2"/> CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 font-medium">
                                <tr className="border-b">
                                    <th className="p-4">State</th>
                                    <th className="p-4">District</th>
                                    <th className="p-4">Academic Year</th>
                                    <th className="p-4 text-right">Skipped Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin inline mr-2"/>Loading data...</td></tr>
                                ) : summary.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No skipped records found for selected filters.</td></tr>
                                ) : (
                                    summary.map((row, idx) => (
                                        <tr key={idx} className="border-b hover:bg-muted/5">
                                            <td className="p-4 font-medium">{row.state}</td>
                                            <td className="p-4">{row.district}</td>
                                            <td className="p-4 text-muted-foreground">{row.year}</td>
                                            <td className="p-4 text-right font-mono font-bold text-orange-600">{row.count}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}