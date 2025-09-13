import { useState } from "react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const res = await fetch(api("/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { toast } = await import("@/hooks/use-toast");
    if (res.ok) {
      setSent(true);
      toast({ title: "Email sent", description: "Check your inbox for the reset link." });
    } else {
      toast({ title: "Error", description: "Unable to send email.", variant: "destructive" });
    }
  };

  return (
    <Shell>
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email associated with your account. We'll send you a link to reset your password.
          </p>
          <div className="mt-6 grid gap-3">
            <input
              className="rounded-md border px-3 py-2"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={submit} disabled={!email || sent}>{sent ? "Sent" : "Send reset link"}</Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
