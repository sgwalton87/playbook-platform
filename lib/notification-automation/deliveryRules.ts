import type { IntelligenceEvent } from "@/lib/intelligence-automation";

export function getRoleAwareNotificationRule(input: {
  event: IntelligenceEvent;
  role: string;
}) {
  const { event, role } = input;

  if (event.type === "message.received") {
    return {
      title: role === "scholar" ? "New support message" : "New scholar support message",
      body: event.detail || "A new message was posted in the support network.",
      href: "/messages",
      priority: "medium",
    };
  }

  if (event.type === "action.assigned") {
    return {
      title: role === "family" ? "Family support action assigned" : "New shared action",
      body: event.detail || "A shared action needs attention.",
      href: "/messages",
      priority: role === event.actorRole ? "high" : "medium",
    };
  }

  if (event.type === "network.blocker_detected") {
    return {
      title: "Network blocker detected",
      body: event.detail || "Compass found a blocker in the scholar support network.",
      href: "/network-intelligence",
      priority: "high",
    };
  }

  if (event.type === "mail.reply_received") {
    return {
      title: "Email reply received",
      body: event.detail || "A connected supporter replied by email.",
      href: "/messages",
      priority: "medium",
    };
  }

  return {
    title: event.title || "Playbook update",
    body: event.detail || "There is a new Playbook update.",
    href: "/notifications",
    priority: "medium",
  };
}
