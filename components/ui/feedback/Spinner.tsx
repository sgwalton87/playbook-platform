import { playbookTheme } from "@/lib/design-system/tokens";

export type SpinnerProps = { label?: string; size?: number };

export function Spinner({ label = "Loading", size = 24 }: SpinnerProps) {
  const radius = 18;
  return (
    <svg role="status" aria-label={label} width={size} height={size} viewBox="0 0 44 44" style={{ display: "inline-block" }}>
      <circle cx="22" cy="22" r={radius} fill="none" stroke={playbookTheme.colors.line} strokeWidth="5" />
      <circle cx="22" cy="22" r={radius} fill="none" stroke={playbookTheme.colors.orange} strokeWidth="5" strokeLinecap="round" strokeDasharray="34 90">
        <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
