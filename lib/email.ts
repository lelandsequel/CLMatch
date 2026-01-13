import { Resend } from "resend";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping email.");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "C&L Job Match <reports@cljobmatch.com>",
    to,
    subject,
    html
  });
}
