import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import type { Payment, Course } from "@shared/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function LearnerPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useAuth();
  useEffect(() => {
    fetch(api("/api/payments"), { credentials: "include" })
      .then((r) => r.json())
      .then(setPayments);
    fetch(api("/api/courses"))
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  const pay = async (courseId: string, priceCents: number) => {
    const res = await fetch(api("/api/checkout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceCents,
        currency: "gbp",
        courseId,
        email: user?.email,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <DashboardShell role="learner">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold">Available Courses</div>
        <div className="grid gap-4 p-4 md:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-lg border p-4">
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                £{(c.priceCents / 100).toFixed(2)}
              </div>
              <Button className="mt-3" onClick={() => pay(c.id, c.priceCents)}>
                Buy
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold">My Payments</div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.id}</td>
                  <td className="py-2">
                    £{(p.amountCents / 100).toFixed(2)}{" "}
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
