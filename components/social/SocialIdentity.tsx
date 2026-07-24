"use client";

export function formatDisplayName(profile: LegacyValue) {
  return (
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.username ||
    "Playbook Member"
  );
}

export function formatRole(profile: LegacyValue) {
  const role = profile?.role || "member";
  return role.replaceAll("_", " ").replaceAll("-", " ");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "PB";
}
