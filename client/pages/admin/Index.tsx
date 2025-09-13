import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<{
    users: number;
    courses: number;
    enrollments: number;
    payments: number;
  }>();
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  useEffect(() => {
    fetch(api("/api/admin/summary"), { credentials: "include" })
      .then((r) => r.json())
      .then(setSummary);
    fetch(api("/api/admin/payments"), { credentials: "include" })
      .then((r) => r.json())
      .then(setRecentPayments);
  }, []);

  return (
    <DashboardShell role="admin">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <Button onClick={() => (location.href = "/admin/courses")}>
          Manage Courses
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Users" value={summary?.users ?? 0} />
        <Stat title="Courses" value={summary?.courses ?? 0} />
        <Stat title="Enrollments" value={summary?.enrollments ?? 0} />
        <Stat title="Payments" value={summary?.payments ?? 0} />
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold">Recent Payments</div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">User</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.id}</td>
                  <td className="py-2">{p.userId}</td>
                  <td className="py-2">
                    ${(p.amountCents / 100).toFixed(2)}{" "}
                    {p.currency.toUpperCase()}
                  </td>
                  <td className="py-2 capitalize">{p.status}</td>
                  <td className="py-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
