import { controlStyle } from "./Input";
import { playbookTheme } from "@/lib/design-system/tokens";

export type SelectOption = { label: string; value: string; disabled?: boolean };
export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & { label?: string; helperText?: string; error?: string; options: SelectOption[]; placeholder?: string };

export function Select({ label, helperText, error, options, placeholder, id, style, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  return <label style={field}>{label && <span style={labelStyle}>{label}</span>}<select id={selectId} {...props} aria-invalid={Boolean(error)} style={{ ...controlStyle, borderColor: error ? playbookTheme.colors.red : playbookTheme.colors.line, ...style }}>{placeholder && <option value="">{placeholder}</option>}{options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>{(error || helperText) && <span style={{ ...help, color: error ? playbookTheme.colors.red : playbookTheme.colors.muted }}>{error ?? helperText}</span>}</label>;
}
const field: React.CSSProperties = { display: "grid", gap: 8, color: playbookTheme.colors.ink };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 900 };
const help: React.CSSProperties = { fontSize: 12, lineHeight: 1.4 };
