import { emailDirectory, type PlaybookEmailType } from "./directory";

export const playbookEmails = {
  founder: process.env.PLAYBOOK_EMAIL_FOUNDER || "sycoywalton@playbookseriesinc.org",
  leadership: process.env.PLAYBOOK_EMAIL_LEADERSHIP || "vycoywalton@playbookseriesinc.org",
  recommendations: process.env.PLAYBOOK_EMAIL_LOR || "LOR@playbookseriesinc.org",
  brandpartners: process.env.PLAYBOOK_EMAIL_BRANDPARTNERS || "brandpartners@playbookseriesinc.org",
  parents: process.env.PLAYBOOK_EMAIL_PARENTS || "Parents@playbookseriesinc.org",
  onboarding: process.env.PLAYBOOK_EMAIL_ONBOARDING || "onboarding@playbookseriesinc.org",
  support: process.env.PLAYBOOK_EMAIL_SUPPORT || "support@playbookseriesinc.org",
  notifications: process.env.PLAYBOOK_EMAIL_NOTIFICATIONS || "notifications@playbookseriesinc.org",
  hello: process.env.PLAYBOOK_EMAIL_HELLO || "hello@playbookseriesinc.org",
  noreply: process.env.PLAYBOOK_EMAIL_NOREPLY || "noreply@playbookseriesinc.org",
};

export function getEmailSender(type: PlaybookEmailType) {
  const email = playbookEmails[type];

  const label = emailDirectory.find(mailbox => mailbox.key === type)?.label || "Playbook";

  return `"${label}" <${email}>`;
}
