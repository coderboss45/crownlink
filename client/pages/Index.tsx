import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Globe,
  ShieldCheck,
  Clock,
  Users,
  Award,
  BookOpen,
  Star,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  Download,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Index() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch(api("/api/courses"))
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data))
          setCourses(
            data.map((c: any, i: number) => ({
              id: c.id,
              title: c.title,
              description: c.description || c.desc || "",
              duration: c.duration || "",
              img: c.img || `/images/course-${(i % 6) + 1}.svg`,
              level: c.level || ["Beginner", "Intermediate", "Advanced"][i % 3],
              students: c.students || Math.floor(Math.random() * 5000) + 1000,
              rating: c.rating || (4.2 + Math.random() * 0.8).toFixed(1),
              priceCents: c.priceCents || 0,
            })),
          );
      })
      .catch(() => setCourses([]));
  }, []);

  const stats = [
    {
      label: "Accredited Programs",
      value: "100+",
      icon: ShieldCheck,
      color: "text-blue-600",
    },
    {
      label: "Learners Trained",
      value: "50,000+",
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Enterprise Clients",
      value: "200+",
      icon: Award,
      color: "text-yellow-500",
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Accredited & Compliant",
      description:
        "Professional, accredited programs with enterprise-grade security and compliance.",
      highlights: [
        "Regulated standards",
        "Verified certificates",
        "Data protection",
        "GDPR-compliant",
      ],
      color: "from-blue-500 to-yellow-500",
    },
    {
      icon: Users,
      title: "Employer Training Solutions",
      description:
        "Enroll teams, track completion, and manage compliance in one place.",
      highlights: [
        "Bulk enrollment",
        "Progress analytics",
        "Team dashboards",
        "Custom reporting",
      ],
      color: "from-blue-500 to-yellow-500",
    },
    {
      icon: Clock,
      title: "Self‑Paced, Flexible Learning",
      description:
        "Learn anytime with mobile-friendly courses and downloadable resources.",
      highlights: [
        "Flexible schedules",
        "Progress tracking",
        "Mentor support",
        "Certificates",
      ],
      color: "from-blue-500 to-yellow-500",
    },
  ];

  return (
    <Shell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-yellow-400/15 to-amber-400/20">
        {/* Enhanced background with multiple gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.blue.600)/30,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.yellow.500)/25,transparent_55%)]" />

          {/* Animated floating elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400/30 to-yellow-400/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{
              duration: 2.5,
              delay: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400/30 to-yellow-400/30 blur-3xl"
          />
        </div>

        <div className="container relative pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="mx-auto max-w-5xl space-y-8 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-4 py-2 text-sm text-gray-700 backdrop-blur-sm shadow-lg"
            >
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="font-medium">
                🏆 International • Professional • Accredited
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-balance text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl lg:text-8xl"
            >
              Transform Your Career with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                Expert-Led Learning
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto max-w-3xl text-balance text-xl text-gray-600 md:text-2xl"
            >
              Join thousands of professionals who have advanced their careers
              through our comprehensive online courses in health, social care,
              leadership, and management.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-14 px-8 shadow-xl"
              >
                <Link to="/courses" className="flex items-center">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="font-medium">Accredited Programs</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">50,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">4.8/5 Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/60 backdrop-blur-sm border-y border-blue-100">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-yellow-100 mb-4 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Crownlinks Academy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive learning solutions designed for modern
              professionals and organizations seeking measurable growth and
              success.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} mb-4 shadow-lg`}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Professional Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most sought-after programs chosen by professionals
              worldwide to advance their careers.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={course.img}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-900">
                      {course.level}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {course.rating}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700 font-semibold">
                        £{((course.priceCents || 0) / 100).toFixed(2)}
                      </div>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600"
                      >
                        <Link to={`/courses/${course.id}`}>Enroll Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-yellow-500 to-amber-500 text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have advanced their careers
              with our expert-led online courses. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold h-14 px-8 shadow-xl"
              >
                <Link to="/auth/signup" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 h-14 px-8"
              >
                <Link to="/courses" className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Shell>
  );
}
