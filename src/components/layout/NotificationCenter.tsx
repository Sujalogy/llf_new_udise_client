import { useEffect, useState } from "react";
import { Bell, CheckCircle, Clock } from "lucide-react";
import { api } from "../../lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

export function NotificationCenter({ role }: { role: string }) {
    const [notifs, setNotifs] = useState<any[]>([]);

    const fetchLogs = async () => {
        try {
            const data = role === 'admin' ? await api.getPendingRequests() : await api.getUserNotifications();
            setNotifs(data);
        } catch (e) { console.error("Notification sync failed", e); }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [role]);

    return (
        <Popover>
            <PopoverTrigger className="relative p-2 rounded-xl border bg-background hover:bg-muted transition-colors">
                <Bell className="h-5 w-5" />
                {notifs.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-destructive border-2 border-background">
                        {notifs.length}
                    </Badge>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-xl" align="end">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-bold text-sm">System Alerts</h3>
                </div>
                <ScrollArea className="h-72">
                    {notifs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs">No pending notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifs.map((n, i) => (
                                <div key={i} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${role === 'admin' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                        <div className="space-y-1">
                                            {role === 'admin' ? (
                                                <p className="text-xs font-medium">
                                                    <span className="font-bold text-primary">{n.user_name}</span> requested:
                                                    <div className="mt-1 bg-amber-50 p-1 rounded border border-amber-100">
                                                        <span className="font-bold text-foreground">{n.stname}</span>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                                            Districts: {n.dtnames?.join(", ")}
                                                        </p>
                                                    </div>
                                                </p>
                                            ) : (
                                                <p className="text-xs font-medium">
                                                    Data for <span className="font-bold">{n.stname}</span> is now online.
                                                    <div className="text-[10px] text-green-600 bg-green-50 px-1 py-0.5 rounded mt-1">
                                                        Synced: {n.dtnames?.join(", ")}
                                                    </div>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}