export function PlaybookCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <article className={`playbook-card ${className}`.trim()}>{children}</article>;
}
