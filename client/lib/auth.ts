export type AppRole = "admin" | "learner" | "employer";

export function dashboardPathForRole(role?: string | null): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "employer":
      return "/employer";
    case "learner":
    default:
      return "/learner";
  }
}
