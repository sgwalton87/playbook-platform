export function PlaybookModal({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="playbook-modal" role="dialog" aria-label={title}><h2>{title}</h2>{children}</section>;
}
