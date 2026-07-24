import { controlStyle } from "./Input";
import { playbookTheme } from "@/lib/design-system/tokens";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; helperText?: string; error?: string };

export function Textarea({ label, helperText, error, id, style, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;
  return <label style={field}>{label && <span style={labelStyle}>{label}</span>}<textarea id={textareaId} {...props} aria-invalid={Boolean(error)} style={{ ...controlStyle, minHeight: 120, resize: "vertical", borderColor: error ? playbookTheme.colors.red : playbookTheme.colors.line, ...style }} />{(error || helperText) && <span style={{ ...help, color: error ? playbookTheme.colors.red : playbookTheme.colors.muted }}>{error ?? helperText}</span>}</label>;
}
const field: React.CSSProperties = { display: "grid", gap: 8, color: playbookTheme.colors.ink };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 900 };
const help: React.CSSProperties = { fontSize: 12, lineHeight: 1.4 };
