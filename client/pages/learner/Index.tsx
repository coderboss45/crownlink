import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import type { Enrollment, Course } from "@shared/api";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function LearnerDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [enrollRes, coursesRes] = await Promise.all([
          fetch(api("/api/enrollments"), { credentials: "include" }),
          fetch(api("/api/courses"))
        ]);

        if (!enrollRes.ok) throw new Error("Failed to fetch enrollments");
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");

        const enrollData = await enrollRes.json();
        const coursesData = await coursesRes.json();

        // Ensure arrays
        setEnrollments(Array.isArray(enrollData) ? enrollData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshEnrollment = async (id: string) => {
    try {
      const res = await fetch(api(`/api/enrollments/${id}/sync`), {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (json?.enrollment) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === id ? { ...e, ...json.enrollment } : e))
        );
      }
    } catch (err) {
      console.error("Failed to sync enrollment:", err);
    }
  };

  const continueLearning = (courseId: string) => {
    window.location.href = `/api/moodle/launch?courseId=${encodeURIComponent(courseId)}`;
  };

  if (loading) return <DashboardShell role="learner"><p>Loading courses...</p></DashboardShell>;
  if (error) return <DashboardShell role="learner"><p className="text-red-600">{error}</p></DashboardShell>;

  return (
    <DashboardShell role="learner">
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>
      {enrollments.length === 0 ? (
        <p>You are not enrolled in any courses yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {enrollments.map((e) => {
            const course = courses.find((c) => c.id === e.courseId);
            return (
              <div key={e.id} className="rounded-lg border p-4">
                <div className="text-sm font-semibold">
                  {course?.title ?? e.courseId}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Progress: {e.progressPercent ?? 0}% {e.status === 'completed' ? '• Completed' : ''}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => continueLearning(e.courseId)}>
                    Continue Learning
                  </Button>
                  <Button variant="outline" onClick={() => refreshEnrollment(e.id)}>Sync Progress</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
