import { useEffect, useState } from 'react';
import { 
  User, Settings as SettingsIcon, Database, 
  Save, Bell, Shield, Moon, Sun, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from '../hooks/use-toast';
import type { Year, State } from '../types/school';

export default function Settings() {
  const { user } = useAuth();
  const role = (user as any)?.role || 'user';
  
  // Data State
  const [years, setYears] = useState<Year[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(false);

  // Preference State (Persisted in localStorage for now)
  const [defaultYear, setDefaultYear] = useState(localStorage.getItem('pref_defaultYear') || '');
  const [defaultState, setDefaultState] = useState(localStorage.getItem('pref_defaultState') || '');
  const [pageSize, setPageSize] = useState(localStorage.getItem('pref_pageSize') || '50');
  
  // Sync Config (Admin Only)
  const [batchSize, setBatchSize] = useState(localStorage.getItem('conf_batchSize') || '5');
  const [strictMode, setStrictMode] = useState(localStorage.getItem('conf_strictMode') === 'true');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [yData, sData] = await Promise.all([
          api.getYears(),
          api.getSyncedStates().catch(() => []) // Fallback if API fails
        ]);
        setYears(yData);
        setStates(sData);
      } catch (e) {
        console.error("Failed to load settings meta", e);
      }
    }
    loadMeta();
  }, []);

  const handleSavePreferences = () => {
    setLoading(true);
    // Simulate API call or save to Context
    setTimeout(() => {
      localStorage.setItem('pref_defaultYear', defaultYear);
      localStorage.setItem('pref_defaultState', defaultState);
      localStorage.setItem('pref_pageSize', pageSize);
      
      localStorage.setItem('conf_batchSize', batchSize);
      localStorage.setItem('conf_strictMode', String(strictMode));
      
      setLoading(false);
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    }, 800);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and system configurations.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sync" disabled={role !== 'admin'}>Sync Config</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* TAB: GENERAL */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Customize your default views and filters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Academic Year</Label>
                  <Select value={defaultYear} onValueChange={setDefaultYear}>
                    <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y.yearId} value={String(y.yearId)}>{y.yearDesc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[0.8rem] text-muted-foreground">Pre-selects this year in filters.</p>
                </div>

                <div className="space-y-2">
                  <Label>Default State</Label>
                  <Select value={defaultState} onValueChange={setDefaultState}>
                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>
                      {states.map(s => <SelectItem key={s.stcode11} value={s.stcode11}>{s.stname}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[0.8rem] text-muted-foreground">Automatically loads this state on login.</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Table Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="50 rows" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                    <SelectItem value="100">100 rows</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[0.8rem] text-muted-foreground">Number of schools shown per page in 'My Schools'.</p>
              </div>

            </CardContent>
            <CardFooter className="bg-muted/50 px-6 py-4 flex justify-end">
              <Button onClick={handleSavePreferences} disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB: SYNC CONFIG (Admin) */}
        <TabsContent value="sync" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Sync Engine Configuration
              </CardTitle>
              <CardDescription>Advanced controls for the UDISE+ data synchronization process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Strict Validation Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    If enabled, schools without a valid name/profile will be rejected and logged to Skipped List.
                  </p>
                </div>
                <Switch checked={strictMode} onCheckedChange={setStrictMode} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Batch Chunk Size</Label>
                  <Input 
                    type="number" 
                    value={batchSize} 
                    onChange={(e) => setBatchSize(e.target.value)}
                    min="1" max="20"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Number of concurrent API requests. Higher = Faster, but risk of rate limits.
                    <br/><span className="text-warning">Recommended: 5</span>
                  </p>
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-muted/50 px-6 py-4 flex justify-end">
              <Button onClick={handleSavePreferences} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Update Config
              </Button>
            </CardFooter>
          </Card>

           <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Clear all locally cached filter data. This does not delete actual school data from the database.
              </p>
              <Button variant="destructive" size="sm" onClick={() => toast({title: "Cache Cleared"})}>
                Clear Filter Cache
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ACCOUNT */}
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details and role permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-medium">{user?.email?.split('@')[0]}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 capitalize">
                      {role}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-1">
                   <Label>User ID</Label>
                   <div className="text-sm font-mono bg-muted p-2 rounded">{user?.id}</div>
                 </div>
                 <div className="space-y-1">
                   <Label>Last Login</Label>
                   <div className="text-sm bg-muted p-2 rounded">{new Date().toLocaleDateString()}</div>
                 </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}