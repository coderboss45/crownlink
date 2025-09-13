import Shell from "@/components/layout/Shell";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetch(api(`/api/courses/${id}`))
      .then((r) => r.json())
      .then((data) => setCourse(data))
      .catch(() => setCourse(null));
  }, [id]);

  const buy = async () => {
    const { toast } = await import("@/hooks/use-toast");
    try {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to purchase this course",
          variant: "destructive",
        });
        navigate(
          "/auth/login?returnTo=" + encodeURIComponent(`/courses/${id}`),
        );
        return;
      }
      const res = await fetch(api("/api/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceCents: course.priceCents,
          currency: "gbp",
          courseId: id,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Checkout failed",
          description: data?.error || "Unable to start checkout",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Checkout failed",
        description: "Unable to start checkout",
        variant: "destructive",
      });
    }
  };

  if (!course) {
    return (
      <Shell>
        <div className="container py-16">Loading...</div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="mt-6">
              <img
                src={course.img || "/images/course-1.svg"}
                className="rounded-md border"
                alt={course.title}
              />
            </div>
            <div className="mt-6 rounded-lg border bg-card">
              <Accordion type="single" collapsible>
                <AccordionItem value="overview">
                  <AccordionTrigger>Overview</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="learn">
                  <AccordionTrigger>What you'll learn</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {(course.whatYouWillLearn || "")
                        .split("\n")
                        .filter((s: string) => s.trim().length)
                        .map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="audience">
                  <AccordionTrigger>Who this course is for</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {(course.whoIsFor || "")
                        .split("\n")
                        .filter((s: string) => s.trim().length)
                        .map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="details">
                  <AccordionTrigger>Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2 text-sm">
                      <div>Duration: {course.duration || "Self-paced"}</div>
                      <div>Amount: £{((course.priceCents || 0) / 100).toFixed(2)} GBP</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <aside className="rounded-md border p-6">
            <div className="text-xl font-semibold">Enroll</div>
            <div className="text-sm text-muted-foreground mt-2">{course.duration}</div>
            <div className="mt-2 text-lg font-semibold">£{((course.priceCents || 0) / 100).toFixed(2)} GBP</div>
            <div className="mt-4">
              <Button onClick={buy}>Buy with Stripe</Button>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
