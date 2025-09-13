import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const usernameFromQuery = searchParams.get("username") || "";
  const [username, setUsername] = useState(usernameFromQuery);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    if (usernameFromQuery) setUsername(usernameFromQuery);
  }, [usernameFromQuery]);

  const submit = async () => {
    const res = await fetch(api("/auth/verify-otp"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, otp }),
    });
    const { toast } = await import("@/hooks/use-toast");
    if (res.ok) {
      await refresh();
      toast({ title: "Verified", description: "Account created." });
      navigate("/learner");
    } else {
      const json = await res.json();
      toast({
        title: "Verification failed",
        description: json.error || "Verification failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Shell>
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Verify your account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter the 6-digit code sent to your email.
          </p>
          <div className="mt-6 grid gap-4">
            <input
              className="rounded-md border px-3 py-2"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="flex items-center justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-12 w-12 rounded-lg border text-center text-lg font-semibold outline-none focus:border-primary"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={submit} disabled={otp.length !== 6}>
              Verify
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
