import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import { Edit2, Circle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"; // Ensure you have this UI component
import { cn } from "../lib/utils";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [masterStates, setMasterStates] = useState<any[]>([]);
  const [masterDistricts, setMasterDistricts] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      console.log(data)
      setUsers(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    }
  };

  const fetchMasterData = async () => {
    try {
      const states = await api.getMasterStates("2024-25");
      setMasterStates(states);
    } catch (err) {
      console.error("Failed to fetch master states", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMasterData();
  }, []);

  const handleStateChange = async (stateCode: string) => {
    const selectedState = masterStates.find(s => s.stcode11 === stateCode);

    setEditingUser({
      ...editingUser,
      assigned_states: [stateCode],
      assigned_state_names: [selectedState?.stname || ""], 
      assigned_districts: [],
      assigned_district_names: []
    });

    if (!stateCode) return;

    try {
      const districts = await api.getMasterDistricts(stateCode, "2024-25");
      setMasterDistricts(districts);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load districts", variant: "destructive" });
    }
  };

  const handleDistrictChange = (districtCode: string) => {
    const selectedDistrict = masterDistricts.find(d => d.dtcode11 === districtCode);
    setEditingUser({
      ...editingUser,
      assigned_districts: [districtCode],
      assigned_district_names: [selectedDistrict?.dtname || ""] 
    });
  };

  const handleEditClick = async (user: any) => {
    setEditingUser({ ...user });

    const stateCode = user.assigned_states?.[0];
    if (stateCode && stateCode.trim() !== "") {
      try {
        const districts = await api.getMasterDistricts(stateCode, "2024-25");
        setMasterDistricts(districts);
      } catch (err) {
        setMasterDistricts([]);
      }
    } else {
      setMasterDistricts([]);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await api.updateUser(editingUser.user_id, editingUser);
      toast({ title: "Success", description: "User profile updated successfully" });
      setIsDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role & Access</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell>
                  <div className="flex justify-center">
                    <Circle className={cn(
                      "h-3 w-3 fill-current",
                      u.is_logged_in ? "text-green-500 animate-pulse drop-shadow-[0_0_5px_rgba(34,197,94,0.6)]" : "text-gray-300"
                    )} />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{u.user_id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.profile_picture} alt={u.name} />
                      <AvatarFallback>{u.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="capitalize text-[10px]">{u.role}</Badge>
                    <div className="text-[10px] text-muted-foreground">
                      {u.assigned_state_names?.[0] || "All States"} / {u.assigned_district_names?.[0] || "All Districts"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.login_attempts > 5 ? "destructive" : "secondary"}>
                    {u.login_attempts || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(u)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit User: {editingUser?.email}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={editingUser?.name || ""}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editingUser?.role || "user"} onValueChange={(val) => setEditingUser({ ...editingUser, role: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <Select value={editingUser?.status} onValueChange={(val) => setEditingUser({...editingUser, status: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign State</Label>
              <Select value={editingUser?.assigned_states?.[0] || ""} onValueChange={handleStateChange}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>
                  {masterStates.map((s) => (<SelectItem key={s.stcode11} value={s.stcode11}>{s.stname}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign District</Label>
              <Select
                value={editingUser?.assigned_districts?.[0] || ""}
                disabled={!editingUser?.assigned_states?.length}
                onValueChange={handleDistrictChange}
              >
                <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                <SelectContent>
                  {masterDistricts.map((d) => (<SelectItem key={d.dtcode11} value={d.dtcode11}>{d.dtname}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={handleSave}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}