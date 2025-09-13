import Shell from "@/components/layout/Shell";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy client-side submit — in real app this would POST to an API
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Shell>
      <div className="container py-16">
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="text-muted-foreground mt-2">
          Have a question about courses, corporate pricing or partnerships? Send
          us a message.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border bg-background p-2"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border bg-background p-2"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border bg-background p-2"
              placeholder="How can we help?"
            />
          </div>
          <div>
            <Button type="submit">Send message</Button>
            {sent && (
              <span className="ml-4 text-sm text-primary">
                Message sent — we'll reply shortly.
              </span>
            )}
          </div>
        </form>
      </div>
    </Shell>
  );
}
