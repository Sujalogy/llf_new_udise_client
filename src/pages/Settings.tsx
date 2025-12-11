import { Database, Server, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Settings() {
  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Configure system settings and connections.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* API Configuration */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">API Configuration</h3>
              <p className="text-sm text-muted-foreground">Backend server settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">API Base URL</label>
              <input
                type="text"
                value="http://localhost:3001/api"
                readOnly
                className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-success">Connected</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Database className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Database</h3>
              <p className="text-sm text-muted-foreground">Local database status</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tables</span>
              <span className="font-medium">school_info, sync_history</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Records</span>
              <span className="font-mono">14,847</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Sync</span>
              <span>Dec 11, 2024 14:32</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <RefreshCw className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Data Management</h3>
              <p className="text-sm text-muted-foreground">Manage synced data</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Clear Sync History</Button>
            <Button variant="destructive">Reset All Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
