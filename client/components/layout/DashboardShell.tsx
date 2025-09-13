import { ReactNode, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import Header from "./Header";
import { 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  X, 
  Menu,
  BarChart3,
  BookOpen,
  UserCheck,
  CreditCard,
  UserPlus,
  Target,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardShell({
  children,
  role,
}: {
  children: ReactNode;
  role: "admin" | "learner" | "employer";
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const items =
    role === "admin"
      ? [
          { to: "/admin", label: "Overview", icon: BarChart3 },
          { to: "/admin/courses", label: "Courses", icon: BookOpen },
          { to: "/admin/users", label: "Users", icon: Users },
          { to: "/admin/payments", label: "Payments", icon: CreditCard },
          { to: "/admin/enrollments", label: "Enrollments", icon: UserPlus },
        ]
      : role === "learner"
        ? [
            { to: "/learner", label: "My Courses", icon: BookOpen },
            { to: "/learner/payments", label: "Payments", icon: CreditCard },
            { to: "/learner/progress", label: "Progress", icon: Target },
          ]
        : [
            { to: "/employer", label: "Team Overview", icon: Users },
            { to: "/employer/enroll", label: "Enroll Team", icon: UserPlus },
            { to: "/employer/payments", label: "Payments", icon: CreditCard },
            { to: "/employer/progress", label: "Team Progress", icon: Target },
          ];

  const roleColors = {
    admin: "from-primary to-accent",
    learner: "from-primary to-accent",
    employer: "from-primary to-accent",
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={cn(
          "hidden md:flex flex-col bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F63a3c6fc0a3f4008855a3fca5a15d24a%2Fc74c4ca8ca5d4011ae8b79c2e033472e?format=webp&width=800"
                  alt="Crownlinks Logo"
                  className={cn("h-8 w-auto transition-all", sidebarCollapsed ? "opacity-100" : "opacity-100")}
                />
                {!sidebarCollapsed && (
                  <div>
                    <div className="text-sm font-semibold text-gray-900 capitalize">{role} Panel</div>
                    <div className="text-xs text-gray-500">Welcome back</div>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hover:bg-gray-100 rounded-lg h-8 w-8 p-0"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {items.map((item) => {
                const end = item.to === "/admin" || item.to === "/learner" || item.to === "/employer";
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                        "hover:bg-gray-100 hover:shadow-sm",
                        isActive ? "bg-white text-gray-900" : "text-gray-700"
                      )
                    }
                    title={sidebarCollapsed ? item.label : ""}
                  >
                    {/* Active color bar */}
                    <span
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 rounded-r",
                        "bg-gradient-to-b from-primary to-accent",
                        "transition-all",
                        "opacity-0",
                        "data-[active=true]:opacity-100"
                      )}
                      data-active
                    />
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            {!sidebarCollapsed ? (
              <div className="space-y-2">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/help"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/settings"
                  className="flex items-center justify-center rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <Link
                  to="/help"
                  className="flex items-center justify-center rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title="Help & Support"
                >
                  <HelpCircle className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="sm"
          className="md:hidden fixed top-20 left-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
