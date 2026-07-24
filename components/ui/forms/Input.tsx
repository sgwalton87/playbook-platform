import { playbookTheme } from "@/lib/design-system/tokens";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; helperText?: string; error?: string };

export function Input({ label, helperText, error, id, style, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return <label style={field}>{label && <span style={labelStyle}>{label}</span>}<input id={inputId} {...props} aria-invalid={Boolean(error)} style={{ ...inputStyle, borderColor: error ? playbookTheme.colors.red : playbookTheme.colors.line, ...style }} />{(error || helperText) && <span style={{ ...help, color: error ? playbookTheme.colors.red : playbookTheme.colors.muted }}>{error ?? helperText}</span>}</label>;
}

const field: React.CSSProperties = { display: "grid", gap: 8, color: playbookTheme.colors.ink };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 900 };
export const controlStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: `1px solid ${playbookTheme.colors.line}`, borderRadius: playbookTheme.radius.md, background: playbookTheme.colors.card, color: playbookTheme.colors.ink, padding: "12px 14px", font: "inherit", outlineColor: playbookTheme.colors.orange };
const inputStyle: React.CSSProperties = controlStyle;
const help: React.CSSProperties = { fontSize: 12, lineHeight: 1.4 };
