export function PlaybookSkeleton({ lines = 3 }: { lines?: number }) {
  return <div className="playbook-skeleton" aria-hidden="true">{Array.from({ length: lines }).map((_, i) => <span key={i} />)}</div>;
}
