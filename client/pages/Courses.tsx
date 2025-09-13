import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Course = {
  id: string;
  title: string;
  description?: string;
  priceCents?: number;
  duration?: string;
  img?: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch(api("/api/courses"))
      .then((r) => r.json())
      .then((data) => setCourses(data))
      .catch(() => setCourses([]));
  }, []);

  return (
    <Shell>
      <div className="container py-16">
        <h1 className="text-4xl font-bold">Courses</h1>
        <p className="text-muted-foreground mt-2">
          Browse all available programs — enroll as an individual or bring a
          team.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg border bg-card p-6"
            >
              <img
                src={c.img || `/images/course-${(i % 6) + 1}.svg`}
                alt={c.title}
                className="h-36 w-full rounded-md object-cover"
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {c.duration}
                  </div>
                </div>
                <Button asChild size="sm">
                  <Link to={`/courses/${c.id}`}>View</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {c.description ||
                  "This is a practical program with real-world projects, mentor sessions and a recognized certificate."}
              </p>
              <div className="mt-2 text-base font-semibold">
                £{((c.priceCents || 0) / 100).toFixed(2)} GBP
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
