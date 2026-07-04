export const playbookEmails = {
  onboarding: process.env.PLAYBOOK_EMAIL_ONBOARDING || "onboarding@playbookseriesinc.org",
  support: process.env.PLAYBOOK_EMAIL_SUPPORT || "support@playbookseriesinc.org",
  notifications: process.env.PLAYBOOK_EMAIL_NOTIFICATIONS || "notifications@playbookseriesinc.org",
  hello: process.env.PLAYBOOK_EMAIL_HELLO || "hello@playbookseriesinc.org",
  noreply: process.env.PLAYBOOK_EMAIL_NOREPLY || "noreply@playbookseriesinc.org",
};

export function getEmailSender(type: keyof typeof playbookEmails) {
  const email = playbookEmails[type];

  const names: Record<keyof typeof playbookEmails, string> = {
    onboarding: "Playbook Onboarding",
    support: "Playbook Support",
    notifications: "Playbook Notifications",
    hello: "Playbook",
    noreply: "Playbook",
  };

  return `"${names[type]}" <${email}>`;
}
