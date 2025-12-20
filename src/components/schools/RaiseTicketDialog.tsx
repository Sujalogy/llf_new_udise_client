import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "../../hooks/use-toast";

export function RaiseTicketDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (val: boolean) => void }) {
    const [unsyncedData, setUnsyncedData] = useState<any[]>([]);
    const [selectedState, setSelectedState] = useState<string>("");
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            api.getUnsyncedLocations()
                .then(setUnsyncedData)
                .catch(() => toast({ title: "Error", description: "Could not load unsynced locations", variant: "destructive" }));
        }
    }, [open]);

    const uniqueStates = Array.from(new Set(unsyncedData.map(d => JSON.stringify({ code: d.stcode11, name: d.stname }))))
        .map(s => JSON.parse(s));

    const filteredDistricts = unsyncedData.filter(d => d.stcode11 === selectedState);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const stateObj = uniqueStates.find(s => s.code === selectedState);
        const districtNames = filteredDistricts
            .filter(d => selectedDistricts.includes(d.dtcode11))
            .map(d => d.dtname);

        try {
            await api.raiseTicket({
                stcode11: selectedState,
                stname: stateObj.name,
                dtcode11: selectedDistricts,
                dtnames: districtNames
            });

            toast({ title: "Success", description: "Admin notified." });
            onOpenChange(false);
        } catch (err: any) {
            // 1. Log the error for debugging
            console.error("Ticket Error:", err);

            // 2. Extract the backend's specific duplicate message
            // Adjust based on your API's error structure (usually err.message or err.response.data.message)
            const backendMessage = err.message || "Request failed";

            if (err.status === 409) {
                toast({
                    title: "Duplicate Request",
                    description: backendMessage, // This will now show the actual user's name
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: backendMessage,
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Missing Data</DialogTitle>
                    <DialogDescription>Select districts that currently have no data in the directory.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Select State</Label>
                        <Select value={selectedState} onValueChange={(val) => { setSelectedState(val); setSelectedDistricts([]); }}>
                            <SelectTrigger><SelectValue placeholder="Choose a State" /></SelectTrigger>
                            <SelectContent>
                                {uniqueStates.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedState && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Available Districts ({filteredDistricts.length})</Label>
                            <ScrollArea className="h-48 border rounded-md p-3">
                                <div className="space-y-2">
                                    {filteredDistricts.map(d => (
                                        <div key={d.dtcode11} className="flex items-center space-x-2">
                                            <Checkbox id={d.dtcode11} checked={selectedDistricts.includes(d.dtcode11)} onCheckedChange={(checked) => {
                                                setSelectedDistricts(prev => checked ? [...prev, d.dtcode11] : prev.filter(id => id !== d.dtcode11));
                                            }} />
                                            <label htmlFor={d.dtcode11} className="text-xs font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed">{d.dtname}</label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!selectedDistricts.length || isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Send Request to Admin"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}