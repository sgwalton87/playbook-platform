export function PlaybookPageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <header className="playbook-page-header"><div>{eyebrow && <p>{eyebrow}</p>}<h1>{title}</h1>{subtitle && <span>{subtitle}</span>}</div>{action}</header>;
}
