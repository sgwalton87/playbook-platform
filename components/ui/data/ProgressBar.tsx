import { playbookTheme } from "@/lib/design-system/tokens";

export type ProgressBarProps = { value: number; max?: number; label?: string; showValue?: boolean };

export function ProgressBar({ value, max = 100, label, showValue = false }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return <div style={root}>{(label || showValue) && <div style={row}>{label && <span>{label}</span>}{showValue && <strong>{Math.round(percent)}%</strong>}</div>}<div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} style={track}><div style={{ ...bar, width: `${percent}%` }} /></div></div>;
}

const root: React.CSSProperties = { display: "grid", gap: 8 };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, color: playbookTheme.colors.slate, fontSize: 13, fontWeight: 850 };
const track: React.CSSProperties = { width: "100%", height: 10, borderRadius: 999, background: "#E2E8F0", overflow: "hidden" };
const bar: React.CSSProperties = { height: "100%", borderRadius: 999, background: playbookTheme.colors.orange, transition: "width .2s ease" };
