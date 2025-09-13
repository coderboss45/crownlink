import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import type { Course } from "@shared/api";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function EmployerEnroll() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [emails, setEmails] = useState("");
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(api("/api/courses"))
      .then((r) => r.json())
      .then((cs) => {
        setCourses(cs);
        if (cs[0]) setCourseId(cs[0].id);
      });
  }, []);

  const send = async () => {
    const list = emails.split(/\s|,|;/).filter(Boolean);
    const res = await fetch(api("/api/employer/enroll"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: list, courseId }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Failed to send");
    else setMessage("Emails queued successfully");
  };

  return (
    <DashboardShell role="employer">
      <h1 className="text-2xl font-bold">Enroll Team</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-2 text-sm font-semibold">Employee Emails</div>
          <textarea
            className="min-h-40 w-full rounded-md border bg-background p-3"
            placeholder="one@acme.com, two@acme.com"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 text-sm font-semibold">Course</div>
          <select
            className="w-full rounded-md border bg-background p-3"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Button className="mt-4" onClick={send}>
            Enroll and Send Credentials
          </Button>
          {message && (
            <div className="mt-3 text-sm text-muted-foreground">{message}</div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
