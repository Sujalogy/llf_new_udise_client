import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from '../hooks/use-toast';
import type { SkippedSchool, Year } from '../types/school';

export default function SkippedSchools() {
    const [skipped, setSkipped] = useState<SkippedSchool[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [targetYear, setTargetYear] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Load Data
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [skippedRes, yearsRes] = await Promise.all([
                api.getSkippedSchools(page, 50),
                api.getYears()
            ]);
            setSkipped(skippedRes.data);
            setTotal(skippedRes.meta.total);
            setYears(yearsRes);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [page]);

    // Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelected(skipped.map(s => s.udise_code));
        else setSelected([]);
    };

    const handleSelectOne = (udise: string, checked: boolean) => {
        if (checked) setSelected(prev => [...prev, udise]);
        else setSelected(prev => prev.filter(id => id !== udise));
    };

    const handleRetry = async () => {
        if (!targetYear || selected.length === 0) return;

        setIsRetrying(true);
        try {
            const firstSchool = skipped.find(s => s.udise_code === selected[0]);

            // [NEW] Read settings
            const batchSize = parseInt(localStorage.getItem('conf_batchSize') || '5');
            const strictMode = localStorage.getItem('conf_strictMode') === 'true';

            const res = await api.syncSchoolDetails(
                targetYear,
                firstSchool?.stcode11 || '',
                firstSchool?.dtcode11 || '',
                selected,
                { batchSize, strictMode } // Pass config here too
            );

            if (res.success) {
                toast({ title: "Retry Complete", description: res.message });
                setSelected([]);
                loadData();
            } else {
                toast({ title: "Retry Failed", description: res.message, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" });
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-10">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Skipped Schools</h1>
                <p className="text-muted-foreground">
                    Review schools that were skipped during sync and retry them for a different year.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                            <CardTitle>Skipped Queue ({total})</CardTitle>
                            <CardDescription>Schools often skip because they already exist for the synced year.</CardDescription>
                        </div>

                        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border">
                            <span className="text-sm font-medium whitespace-nowrap">Retry Selected ({selected.length}) for:</span>
                            <Select value={targetYear} onValueChange={setTargetYear}>
                                <SelectTrigger className="w-[140px] bg-background">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y.yearId} value={String(y.yearId)}>{y.yearDesc}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleRetry}
                                disabled={!targetYear || selected.length === 0 || isRetrying}
                                size="sm"
                            >
                                {isRetrying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                Sync
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr className="border-b">
                                    <th className="p-4 w-10">
                                        <Checkbox
                                            checked={selected.length === skipped.length && skipped.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="p-4">UDISE Code</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Skipped Reason</th>
                                    <th className="p-4">Attempted Year</th>
                                    <th className="p-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                                ) : skipped.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No skipped schools found.</td></tr>
                                ) : (
                                    skipped.map(school => (
                                        <tr key={school.udise_code + school.year_desc} className="border-b hover:bg-muted/5">
                                            <td className="p-4">
                                                <Checkbox
                                                    checked={selected.includes(school.udise_code)}
                                                    onCheckedChange={(c) => handleSelectOne(school.udise_code, !!c)}
                                                />
                                            </td>
                                            <td className="p-4 font-mono font-medium">{school.udise_code}</td>
                                            <td className="p-4">
                                                <div className="font-medium">{school.dtname || 'Unknown Dist'}</div>
                                                <div className="text-xs text-muted-foreground">{school.stname || 'Unknown State'}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                    {school.reason}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-muted-foreground">{school.year_desc}</td>
                                            <td className="p-4 text-xs text-muted-foreground">
                                                {new Date(school.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <Button
                            variant="ghost"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <span className="py-2 px-4 text-sm font-medium">Page {page}</span>
                        <Button
                            variant="ghost"
                            disabled={skipped.length < 50}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}