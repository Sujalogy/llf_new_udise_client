import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers(); // Add this to api.ts
      setUsers(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    }
  };

  const toggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userId, newStatus); // Add this to api.ts
      toast({ title: "Success", description: `User status set to ${newStatus}` });
      fetchUsers();
    } catch (err) {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>{u.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant={u.status === 'active' ? 'destructive' : 'default'}
                    onClick={() => toggleStatus(u.user_id, u.status)}
                  >
                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}