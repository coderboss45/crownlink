import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import type { Enrollment } from "@shared/api";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  useEffect(() => {
    fetch(api("/api/admin/enrollments"), { credentials: "include" })
      .then((r) => r.json())
      .then(setEnrollments);
    fetch(api("/users"))
      .then((r) => r.json())
      .then(setUsers);
    fetch(api("/api/courses"))
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  const enroll = async () => {
    if (!userId || !courseId) return;
    await fetch(api("/api/admin/enroll"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, courseId }),
    });
    fetch(api("/api/admin/enrollments"), { credentials: "include" })
      .then((r) => r.json())
      .then(setEnrollments);
  };

  return (
    <DashboardShell role="admin">
      <h1 className="text-2xl font-bold">Enrollments</h1>
      <div className="rounded-lg border p-4 mb-4">
        <div className="font-semibold mb-2">Enroll a user</div>
        <div className="grid gap-2 md:grid-cols-3">
          <select
            className="rounded-md border bg-background px-3 py-2"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email} ({u.username})
              </option>
            ))}
          </select>
          <select
            className="rounded-md border bg-background px-3 py-2"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Button onClick={enroll}>Enroll</Button>
        </div>
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold">All Enrollments</div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">User</th>
                <th className="py-2">Course</th>
                <th className="py-2">Status</th>
                <th className="py-2">Progress</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="py-2">{e.id}</td>
                  <td className="py-2">{e.userId}</td>
                  <td className="py-2">{e.courseId}</td>
                  <td className="py-2 capitalize">{e.status}</td>
                  <td className="py-2">{e.progressPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
