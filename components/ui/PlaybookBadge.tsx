export function PlaybookBadge({ children, tone = "orange" }: { children: React.ReactNode; tone?: "orange" | "navy" | "success" | "warning" | "error" | "info" }) {
  return <span className={`playbook-badge playbook-badge--${tone}`}>{children}</span>;
}
