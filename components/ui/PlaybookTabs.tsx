export function PlaybookTabs({ tabs }: { tabs: { label: string; active?: boolean }[] }) {
  return <div className="playbook-tabs" role="tablist">{tabs.map((tab) => <button key={tab.label} role="tab" aria-selected={Boolean(tab.active)}>{tab.label}</button>)}</div>;
}
