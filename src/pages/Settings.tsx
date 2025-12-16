import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Database, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox'; // Ensure this component exists
import { api } from '../lib/api';
import { toast } from '../hooks/use-toast';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [allManagements, setAllManagements] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Preferences
  const [visibleManagements, setVisibleManagements] = useState<string[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  
  const [batchSize, setBatchSize] = useState(localStorage.getItem('conf_batchSize') || '5');
  const [strictMode, setStrictMode] = useState(localStorage.getItem('conf_strictMode') === 'true');

  useEffect(() => {
    async function loadMeta() {
      try {
        const filters = await api.getFilters();
        setAllManagements(filters.managements || []);
        setAllCategories(filters.categories || []);

        // Load saved prefs or default to all
        const savedMgmt = localStorage.getItem('pref_visibleManagements');
        const savedCats = localStorage.getItem('pref_visibleCategories');
        
        setVisibleManagements(savedMgmt ? JSON.parse(savedMgmt) : filters.managements);
        setVisibleCategories(savedCats ? JSON.parse(savedCats) : filters.categories);
      } catch (e) {
        console.error("Failed to load settings meta", e);
      }
    }
    loadMeta();
  }, []);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('conf_batchSize', batchSize);
      localStorage.setItem('conf_strictMode', String(strictMode));
      
      // Save Visibility Preferences
      localStorage.setItem('pref_visibleManagements', JSON.stringify(visibleManagements));
      localStorage.setItem('pref_visibleCategories', JSON.stringify(visibleCategories));
      
      setLoading(false);
      toast({ title: "Settings Saved", description: "Configuration updated successfully." });
    }, 800);
  };

  const toggleItem = (list: string[], setList: any, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10 space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage preferences and configurations.</p>
        </div>
      </div>

      <Tabs defaultValue="filters" className="w-full">
        <TabsList>
            <TabsTrigger value="filters">Filter Visibility</TabsTrigger>
            <TabsTrigger value="sync">Sync Config</TabsTrigger>
        </TabsList>

        {/* TAB: FILTERS */}
        <TabsContent value="filters" className="mt-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Data Visibility</CardTitle>
                    <CardDescription>Uncheck items to hide them from the 'My Schools' filters.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8 md:grid-cols-2">
                    {/* Categories */}
                    <div className="space-y-4">
                        <Label className="text-base">Allowed Categories</Label>
                        <div className="grid grid-cols-1 gap-2 border p-4 rounded-md h-64 overflow-y-auto">
                            {allCategories.map(cat => (
                                <div key={cat} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`cat-${cat}`} 
                                        checked={visibleCategories.includes(cat)}
                                        onCheckedChange={() => toggleItem(visibleCategories, setVisibleCategories, cat)}
                                    />
                                    <label htmlFor={`cat-${cat}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {cat}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setVisibleCategories(allCategories)}>Select All</Button>
                    </div>

                    {/* Managements */}
                    <div className="space-y-4">
                        <Label className="text-base">Allowed Managements</Label>
                        <div className="grid grid-cols-1 gap-2 border p-4 rounded-md h-64 overflow-y-auto">
                            {allManagements.map(mgmt => (
                                <div key={mgmt} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`mgmt-${mgmt}`} 
                                        checked={visibleManagements.includes(mgmt)}
                                        onCheckedChange={() => toggleItem(visibleManagements, setVisibleManagements, mgmt)}
                                    />
                                    <label htmlFor={`mgmt-${mgmt}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {mgmt}
                                    </label>
                                </div>
                            ))}
                        </div>
                         <Button variant="outline" size="sm" onClick={() => setVisibleManagements(allManagements)}>Select All</Button>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-4 flex justify-end">
                    <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Filters'}</Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* TAB: SYNC CONFIG */}
        <TabsContent value="sync" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Sync Engine</CardTitle>
              <CardDescription>Advanced technical configurations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Strict Validation Mode</Label>
                  <p className="text-sm text-muted-foreground">Reject schools with incomplete profiles.</p>
                </div>
                <Switch checked={strictMode} onCheckedChange={setStrictMode} />
              </div>
              <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Input type="number" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} min="1" max="20" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 px-6 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-2" /> Update Config</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}