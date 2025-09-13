import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import type { User } from "@shared/api";
import { api } from "@/lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    fetch(api("/users"))
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  return (
    <DashboardShell role="admin">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold">All Users</div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.name}</td>
                  <td className="py-2">{u.email}</td>
                  <td className="py-2 capitalize">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
