export interface User {
  id: string;
  role: "admin" | "learner" | "employer";
  email: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  moodleCourseId?: number;
  published: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "active" | "completed" | "pending";
  progressPercent: number;
  moodleEnrollmentId?: number;
}

export interface Payment {
  id: string;
  userId: string;
  amountCents: number;
  currency: string;
  status: "succeeded" | "failed" | "pending";
  provider: "stripe";
  createdAt: string;
}

export interface EmployerGroup {
  id: string;
  employerId: string;
  employeeEmails: string[];
}

export interface DemoResponse {
  message: string;
}
