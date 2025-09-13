import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Enrollment, Course } from "@shared/api";

export default function LearnerProgress() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrollRes, coursesRes] = await Promise.all([
          fetch(api("/api/enrollments"), { credentials: "include" }),
          fetch(api("/api/courses")),
        ]);
        if (!enrollRes.ok) throw new Error("Failed to fetch enrollments");
        const enrollData = await enrollRes.json();
        const coursesData = await coursesRes.json();
        setEnrollments(Array.isArray(enrollData) ? enrollData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load progress");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refresh = async (id: string) => {
    try {
      const res = await fetch(api(`/api/enrollments/${id}/sync`), {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (json?.enrollment) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === id ? { ...e, ...json.enrollment } : e)),
        );
      }
    } catch {}
  };

  if (loading)
    return (
      <DashboardShell role="learner">
        <p>Loading progress...</p>
      </DashboardShell>
    );
  if (error)
    return (
      <DashboardShell role="learner">
        <p className="text-red-600">{error}</p>
      </DashboardShell>
    );

  return (
    <DashboardShell role="learner">
      <h1 className="text-2xl font-bold mb-4">Learning Progress</h1>
      {enrollments.length === 0 ? (
        <p>You have no active enrollments.</p>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => {
            const course = courses.find((c) => c.id === e.courseId);
            const pct =
              typeof e.progressPercent === "number" ? e.progressPercent : 0;
            return (
              <div
                key={e.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {course?.title ?? e.courseId}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {e.status || "in_progress"}
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <div className="text-sm font-medium">{pct}%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={pct} className="h-2" />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => refresh(e.id)}>
                    Sync Progress
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
