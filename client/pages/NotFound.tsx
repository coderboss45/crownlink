import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <div className="container flex h-screen flex-col items-center justify-center text-center">
        <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent" />
        <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          We couldn't find that page.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Go home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
