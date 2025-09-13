import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { generateKeyPairSync, createPublicKey } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@luma.app";
  const adminPass = process.env.ADMIN_PASSWORD || "adminpass123";
  const clientId = process.env.OIDC_CLIENT_ID || 'crownlinks-moodle-client';
  const clientSecret = process.env.OIDC_CLIENT_SECRET || 'REPLACE_ME';
  const redirectUris = [process.env.OIDC_CLIENT_REDIRECT_URI || 'https://learn.crownlinksacademy.net/admin/oauth2callback.php'];

  // ----- Admin user -----
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    const hash = await bcrypt.hash(adminPass, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: "admin", // ensure your schema requires username if needed
        password: hash,
        name: "Admin",
        // Use a string value for role to avoid enum mismatch; change if your schema uses different value
        role: "admin",
      },
    });
    console.log("Admin user created:", adminEmail);
  } else {
    console.log("Admin exists");
  }

  // ----- Create sample learners -----
  const learnersIn = [
    { email: "nadia@example.com", name: "Nadia K.", pass: "password1" },
    { email: "ravi@example.com", name: "Ravi S.", pass: "password2" },
    { email: "leila@example.com", name: "Leila M.", pass: "password3" },
  ].map((u) => ({
    ...u,
    username: u.email.split("@")[0],
  }));

  for (const l of learnersIn) {
    const u = await prisma.user.findUnique({ where: { email: l.email } });
    if (!u) {
      const hash = await bcrypt.hash(l.pass, 10);
      await prisma.user.create({
        data: {
          email: l.email,
          username: l.username,
          password: hash,
          name: l.name,
          role: "learner",
        },
      });
      console.log("Created learner", l.email);
    }
  }

  // ----- Create sample courses -----
  const sampleCourses = [
    {
      title: "Advanced TypeScript",
      description: "Deep dive into TypeScript for building large applications.",
      priceCents: 49900,
      published: true,
    },
    {
      title: "Professional React",
      description: "Build scalable React apps with best practices.",
      priceCents: 59900,
      published: true,
    },
    {
      title: "Data Analytics",
      description: "Analyze and visualize data to support decisions.",
      priceCents: 39900,
      published: true,
    },
  ];

  for (const c of sampleCourses) {
    const existsCourse = await prisma.course.findFirst({ where: { title: c.title } });
    if (!existsCourse) {
      await prisma.course.create({ data: c as any });
      console.log("Created course", c.title);
    }
  }

  // ----- Create sample enrollment + payment for first learner & first course -----
  const learner = await prisma.user.findUnique({
    where: { email: learnersIn[0].email },
  });
  const course1 = await prisma.course.findFirst({
    where: { title: sampleCourses[0].title },
  });

  if (learner && course1) {
    const existsEnr = await prisma.enrollment.findFirst({
      where: { userId: learner.id, courseId: course1.id },
    });
    if (!existsEnr) {
      await prisma.enrollment.create({
        data: {
          userId: learner.id,
          courseId: course1.id,
          status: "active" as any,
        },
      });
      console.log("Created enrollment for", learner.email);
    }

    const existsPay = await prisma.payment.findFirst({
      where: { userId: learner.id, amountCents: course1.priceCents },
    });
    if (!existsPay) {
      await prisma.payment.create({
        data: {
          userId: learner.id,
          amountCents: course1.priceCents,
          currency: "usd",
          status: "succeeded" as any,
          provider: "stripe",
        },
      });
      console.log("Created payment for", learner.email);
    }
  }

  // ----- Upsert OAuth client for Moodle -----
 await prisma.oAuthClient.upsert({
  where: { clientId },
  update: { 
    clientSecret, 
    redirectUris: redirectUris as any, 
    grantTypes: ['authorization_code', 'refresh_token'] as any 
  },
  create: { 
    clientId, 
    clientSecret, 
    redirectUris: redirectUris as any, 
    grantTypes: ['authorization_code', 'refresh_token'] as any 
  },
});


  // ----- Create signing key if none exists -----
  const existingKey = await prisma.oidcKey.findFirst();
  if (!existingKey) {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const pubKeyObj = createPublicKey(publicKey);
    const jwk: any = pubKeyObj.export({ format: 'jwk' });
    const kid = randomUUID();
    await prisma.oidcKey.create({
      data: {
        kid,
        publicKey: JSON.stringify(jwk),
        privateKey,
      },
    });
    console.log('Created OIDC signing key with kid', kid);
  }

  console.log('Seed complete. Client ID:', clientId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
function randomUUID(): string {
  // Use crypto.randomUUID if available (Node.js 16.17+)
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }
  // Fallback for older Node.js versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

