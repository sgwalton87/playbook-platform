export function PlaybookEmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <section className="playbook-empty-state"><div aria-hidden="true">✦</div><h2>{title}</h2>{description && <p>{description}</p>}{action}</section>;
}
