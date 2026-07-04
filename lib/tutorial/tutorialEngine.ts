export function getFirstLoginTutorial() {
  return [
    { id: "home", title: "Welcome to Playbook", body: "This is your education intelligence operating system.", href: "/dashboard" },
    { id: "record", title: "Scholar Record", body: "Your academic, opportunity, evidence, and support-network record lives here.", href: "/record" },
    { id: "messages", title: "Inbox", body: "Coordinate with your support network through messages and shared actions.", href: "/messages" },
    { id: "notifications", title: "Notifications", body: "See what needs your attention next.", href: "/notifications" },
    { id: "store", title: "Playbook Store", body: "Earn coins and redeem them for partner rewards.", href: "/store-v2" },
  ];
}

export function getTutorialProgress(completedIds: string[]) {
  const steps = getFirstLoginTutorial();
  return Math.round((completedIds.length / steps.length) * 100);
}
