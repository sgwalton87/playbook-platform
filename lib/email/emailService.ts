import nodemailer from "nodemailer";
import { getEmailSender } from "./emailConfig";

export async function sendPlaybookEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromType?: "onboarding" | "support" | "notifications" | "hello" | "noreply";
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter.sendMail({
    from: getEmailSender(input.fromType || "onboarding"),
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: getEmailSender("support"),
  });
}
