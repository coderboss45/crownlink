import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/contact", label: "Contact" },
];

function AuthNav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (!user) {
    return (
      <>
        <NavLink
          to="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Login
        </NavLink>
        <NavLink
          to="/auth/signup"
          className="text-sm font-medium text-foreground"
        >
          Sign up
        </NavLink>
      </>
    );
  }

  const avatarName = user.name || user.username || user.email.split("@")[0];
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    avatarName,
  )}&background=3b82f6&color=fff&rounded=true&size=64`;

  const dashboardPath =
    user.role === "admin"
      ? "/admin"
      : user.role === "employer"
        ? "/employer"
        : "/learner";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-muted"
        aria-label="Account"
      >
        <img src={avatarUrl} alt="avatar" className="h-8 w-8 rounded-full" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card p-2 shadow-lg">
          <div className="px-2 py-1 text-sm text-muted-foreground">
            {user?.name || user?.username}
          </div>
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Role: {user?.role}
          </div>
          <div className="mt-2 border-t pt-2">
            <NavLink
              to={dashboardPath}
              className="block px-2 py-2 text-sm hover:bg-muted rounded"
            >
              Dashboard
            </NavLink>
            <button
              onClick={() => logout()}
              className="mt-2 w-full text-left px-2 py-2 text-sm hover:bg-muted rounded"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F63a3c6fc0a3f4008855a3fca5a15d24a%2Fc74c4ca8ca5d4011ae8b79c2e033472e?format=webp&width=800"
            alt="Crownlinks Academy Logo"
            className="h-8 w-auto"
          />
          <span className="text-lg font-bold tracking-tight">
            Crownlinks Academy
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <nav className="hidden gap-4 md:flex">
            {/* auth-aware links */}
            <AuthNav />
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
