import DashboardShell from "@/components/layout/DashboardShell";

export default function EmployerDashboard() {
  return (
    <DashboardShell role="employer">
      <h1 className="text-2xl font-bold">Team</h1>
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Connect Stripe and Postmark to invite employees and track payments.
      </div>
    </DashboardShell>
  );
}
