import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function Settings() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendReset = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      await fetch(api("/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: user.email }),
      });
      setSent(true);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Email sent",
        description: "Check your inbox for a reset link.",
      });
    } catch (e: any) {
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Failed",
        description: e?.message || "Unable to send reset email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardShell role={(user?.role as any) || "learner"}>
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your account information
          </p>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={user?.name || ""}
                readOnly
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Username</div>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={user?.username || ""}
                readOnly
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={user?.email || ""}
                readOnly
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Role</div>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 capitalize"
                value={user?.role || ""}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send a password reset email to your account address.
          </p>
          <Button onClick={sendReset} disabled={!user?.email || sending}>
            {sending ? "Sending..." : sent ? "Email sent" : "Send reset email"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
