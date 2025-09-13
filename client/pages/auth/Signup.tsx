import { useState } from "react";
import Shell from "@/components/layout/Shell";
import { api } from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"learner" | "employer">("learner");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "";

  const submit = async () => {
    // client-side password validation: at least 8 chars, upper, lower, number, symbol
    const pwRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;
    if (!pwRegex.test(password)) {
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Weak password",
        description:
          "Password must be at least 8 characters and include uppercase, lowercase, number and symbol.",
        variant: "destructive",
      });
      return;
    }
    if (!username) {
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Missing username",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    const res = await fetch(api("/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password, name, role }),
    });
    if (res.ok) {
      // proceed to OTP verification step
      navigate(`/auth/verify-otp?username=${encodeURIComponent(username)}`);
    } else {
      const json = await res.json();
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Signup failed",
        description: json.error || "Signup failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Shell>
      <div className="container py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-8 text-white shadow-sm md:h-full">
            <h2 className="text-3xl font-extrabold">Join Crownlinks Academy</h2>
            <p className="mt-3 text-white/90">Mentor-led, flexible programs with recognized certification.</p>
            <ul className="mt-6 space-y-3 text-white/80 text-sm">
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-white"/>Team & employer programs</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-white/80"/>Global access, flexible pace</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-white/80"/>Moodle-powered delivery</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Join thousands of professionals learning with Crownlinks Academy.
            </p>
            <div className="mt-6 grid gap-3">
              <input
                className="rounded-md border px-3 py-2"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="rounded-md border px-3 py-2"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-md border px-3 py-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="rounded-md border px-3 py-2"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <select
                className="rounded-md border px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="learner">Learner</option>
                <option value="employer">Employer</option>
              </select>
              <Button onClick={submit}>Create account</Button>
              <div className="pt-4 text-sm text-muted-foreground">
                Already have an account?{" "}
                <a
                  href={`/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
                  className="text-primary"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
