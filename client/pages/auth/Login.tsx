import { useState } from "react";
import Shell from "@/components/layout/Shell";
import { api } from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Globe,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "";
  const { refresh } = useAuth();

  const submit = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      const res = await fetch(api("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username || email,
          password,
        }),
      });

      const { toast } = await import("@/hooks/use-toast");

      if (res.ok) {
        await refresh();

        toast({
          title: "Logged in",
          description: "Welcome back! Redirecting to your dashboard...",
        });

        if (returnTo) {
          const path = returnTo.startsWith("/") ? returnTo : `/${returnTo}`;
          navigate(path);
          return;
        }

        navigate("/learner");
      } else {
        let json: any = null;
        try {
          json = await res.json();
        } catch {}
        const isPending =
          res.status === 403 ||
          json?.error === "pending_verification" ||
          json?.pending === true;
        if (isPending) {
          toast({
            title: "Verify your email",
            description: "Please enter the 6-digit code sent to your email.",
          });
          const userParam =
            (json && (json.username || json.email)) || username || email;
          navigate(
            `/auth/verify-otp?username=${encodeURIComponent(userParam)}`,
          );
          return;
        }
        const errorMessage = (json && json.error) || "Login failed";
        setError(errorMessage);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage =
        err.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: "Students Enrolled", value: "50,000+", icon: Users },
    { label: "Courses Available", value: "500+", icon: BookOpen },
    { label: "Expert Instructors", value: "100+", icon: Award },
    { label: "Countries Reached", value: "75+", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Information Card */}
      <div className="min-h-screen flex">
        <a
          href="/"
          className="absolute top-6 left-6 flex items-center text-white hover:text-yellow-300 transition-all z-50 group"
          aria-label="Go back to homepage"
        >
          <ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </a>

        {/* Left Side - Info Section */}
        <div className="hidden lg:flex w-7/10 flex-col justify-center px-10 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <BookOpen className="h-10 w-10 text-yellow-300" />
              <span className="text-2xl font-bold">Crownlinks Academy</span>
            </div>

            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Transform Your Career with
              <span className="text-yellow-300"> Expert-Led</span> Learning
            </h1>

            <p className="text-lg text-blue-100 mb-12 leading-relaxed">
              Join thousands of professionals who have advanced their careers
              through our comprehensive online courses in health, social care,
              leadership, and management.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-300 rounded-full mb-3">
                    <stat.icon className="h-6 w-6 text-blue-800" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Crownlinks Academy
              </span>
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Sign in to continue your learning journey
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-600 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Username or email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm text-gray-700 cursor-pointer select-none"
                    >
                      Remember me for 30 days
                    </Label>
                  </div>

                  <a
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <a
                    href={`/auth/signup${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
                    className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
                  >
                    Sign up for free
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              By signing in, you agree to our{" "}
              <a
                href="/terms"
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
