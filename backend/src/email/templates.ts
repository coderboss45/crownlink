const brand = {
  primary: "#3b82f6", // Tailwind blue-500
  accent: "#f59e0b", // Tailwind amber-500
  bg: "#0b1020",
};

function baseEmail({ title, body }: { title: string; body: string }) {
  return `<!doctype html><html><head><meta charset=\"utf-8\"/>
  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>
  <title>${title}</title>
  <style>
    body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: #f7f7fb; margin:0; padding:24px; }
    .card { max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; }
    .brand { background: linear-gradient(135deg, ${brand.primary}, ${brand.accent}); height:6px; }
    .header { padding:20px 24px 0 24px; }
    .title { color:#0f172a; font-size:22px; font-weight:800; margin:0 0 6px; }
    .sub { color:#475569; font-size:14px; margin:0 0 18px; }
    .content { padding: 0 24px 24px 24px; color:#0f172a; line-height:1.6; font-size:15px; }
    .btn { display:inline-block; background:${brand.primary}; color:#fff; text-decoration:none; padding:10px 16px; border-radius:10px; font-weight:700; }
    .hint { color:#64748b; font-size:12px; margin-top:12px; }
    .footer { text-align:center; color:#94a3b8; font-size:12px; margin-top:16px; }
  </style></head><body>
  <div class=\"card\">
    <div class=\"brand\"></div>
    <div class=\"header\">
      <h1 class=\"title\">${title}</h1>
      <p class=\"sub\">Crownlinks Academy</p>
    </div>
    <div class=\"content\">${body}</div>
  </div>
  <p class=\"footer\">© ${new Date().getFullYear()} Crownlinks Academy</p>
  </body></html>`;
}

export function welcomeEmail(name: string, email: string) {
  const subject = `Welcome to Crownlinks Academy, ${name || "Learner"}!`;
  const body = `
    <p>Hi ${name || "Learner"},</p>
    <p>Thanks for creating an account at Crownlinks Academy. You can now browse courses and start learning.</p>
    <p>Login with: <strong>${email}</strong></p>
    <p>If you need help, reply to this email.</p>
    <p>— The Crownlinks Academy Team</p>
  `;
  const html = baseEmail({ title: "Welcome 🎉", body });
  const text = `Welcome to Crownlinks Academy\n\nHi ${name || "Learner"},\n\nThanks for creating an account at Crownlinks Academy. Login with: ${email}\n\n— The Crownlinks Academy Team`;
  return { subject, html, text };
}

export function otpEmail(email: string, otp: string) {
  const subject = `Verify your Crownlinks Academy account`;
  const body = `
    <p>Use the verification code below to complete your sign up. The code expires in <strong>10 minutes</strong>.</p>
    <div style=\"font-size:28px; font-weight:800; letter-spacing:8px; background:#f1f5f9; padding:12px 16px; border-radius:10px; display:inline-block;\">${otp}</div>
    <p class=\"hint\">If you didn’t request this, you can ignore this email.</p>
  `;
  const html = baseEmail({ title: "Verify your email", body });
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  return { subject, html, text };
}

export function resetPasswordEmail(email: string, link: string) {
  const subject = `Reset your Crownlinks Academy password`;
  const body = `
    <p>We received a request to reset the password for <strong>${email}</strong>.</p>
    <p>Click the button below to set a new password. This link is valid for 60 minutes.</p>
    <p><a class=\"btn\" href=\"${link}\">Reset password</a></p>
    <p class=\"hint\">If you didn’t request this, you can safely ignore this email.</p>
  `;
  const html = baseEmail({ title: "Password reset", body });
  const text = `Reset your password: ${link}`;
  return { subject, html, text };
}

export function credentialsEmail(
  employeeEmail: string,
  password: string,
  courseTitle: string,
) {
  const subject = `Your Crownlinks Academy account and course access`;
  const body = `
    <p>An account was created for <strong>${employeeEmail}</strong> to access <strong>${courseTitle}</strong>.</p>
    <p>Login details:</p>
    <ul>
      <li><strong>Email:</strong> ${employeeEmail}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>After logging in, you'll be enrolled in ${courseTitle} on Moodle.</p>
    <p>— Crownlinks Academy</p>
  `;
  const html = baseEmail({ title: "Your account is ready", body });
  const text = `Account created for ${employeeEmail}\n\nEmail: ${employeeEmail}\nPassword: ${password}\nCourse: ${courseTitle}\n\n— Crownlinks Academy`;
  return { subject, html, text };
}

export function paymentReceipt(
  email: string,
  amountCents: number,
  currency: string,
  courseTitle: string,
) {
  const subject = `Payment receipt — ${courseTitle}`;
  const body = `
    <p>Thanks for your purchase.</p>
    <p>We received a payment of <strong>${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}</strong> for <strong>${courseTitle}</strong>.</p>
    <p>If you have questions, reply to this email.</p>
    <p>— Crownlinks Academy</p>
  `;
  const html = baseEmail({ title: "Payment receipt", body });
  const text = `Payment receipt\n\nWe received a payment of ${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()} for ${courseTitle}.\n\n— Crownlinks Academy`;
  return { subject, html, text };
}
