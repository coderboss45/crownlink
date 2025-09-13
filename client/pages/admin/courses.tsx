import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import type { Course } from "@shared/api";
import { api } from "@/lib/api";

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceCents: 0,
  });

  useEffect(() => {
    fetch(api("/api/courses"))
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  const create = async () => {
    const res = await fetch("/api/courses", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const c = await res.json();
      setCourses((prev) => [c, ...prev]);
      setForm({ title: "", description: "", priceCents: 0 });
    }
  };

  return (
    <DashboardShell role="admin">
      <h1 className="text-2xl font-bold">Courses</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="mb-2 text-sm font-semibold">Create Course</div>
          <div className="grid gap-2">
            <input
              className="rounded-md border bg-background px-3 py-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="min-h-24 rounded-md border bg-background px-3 py-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              type="number"
              className="rounded-md border bg-background px-3 py-2"
              placeholder="Price (GBP pence)"
              value={form.priceCents}
              onChange={(e) =>
                setForm({ ...form, priceCents: Number(e.target.value) })
              }
            />
            <Button onClick={create}>Create</Button>
          </div>
        </div>
        <div className="rounded-lg border p-4 md:col-span-2">
          <div className="mb-2 text-sm font-semibold">All Courses</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2">Title</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Published</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="py-2">{c.title}</td>
                    <td className="py-2">£{(c.priceCents / 100).toFixed(2)}</td>
                    <td className="py-2">{c.published ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
