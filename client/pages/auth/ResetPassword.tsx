import { useState } from "react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    const pwRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;
    const { toast } = await import("@/hooks/use-toast");
    if (!pwRegex.test(password)) {
      toast({ title: "Weak password", description: "Use at least 8 chars with upper, lower, number and symbol.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    const res = await fetch(api("/auth/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      toast({ title: "Password updated", description: "You can now sign in." });
      navigate("/auth/login");
    } else {
      const json = await res.json();
      toast({ title: "Reset failed", description: json.error || "Invalid or expired link.", variant: "destructive" });
    }
  };

  return (
    <Shell>
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <div className="mt-6 grid gap-3">
            <input
              className="rounded-md border px-3 py-2"
              placeholder="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="rounded-md border px-3 py-2"
              placeholder="Confirm new password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button onClick={submit}>Update password</Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
