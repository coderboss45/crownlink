import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import type { Payment } from "@shared/api";
import { api } from "@/lib/api";

export default function EmployerPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  useEffect(() => {
    fetch(api("/api/payments"), { credentials: "include" })
      .then((r) => r.json())
      .then(setPayments);
  }, []);

  return (
    <DashboardShell role="employer">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold">Company Payments</div>
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
