export function PlaybookProgress({ value, label }: { value: number; label?: string }) {
  const normalized = Math.max(0, Math.min(100, value));
  return <div className="playbook-progress" aria-label={label} aria-valuenow={normalized} aria-valuemin={0} aria-valuemax={100} role="progressbar"><span style={{ width: `${normalized}%` }} /></div>;
}
