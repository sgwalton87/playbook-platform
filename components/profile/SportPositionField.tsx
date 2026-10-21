"use client";

import { useId, useState, type CSSProperties } from "react";
import { SPORT_CONFIG } from "@/lib/onboarding/sports";

type Props = {
  sport: string;
  value: string;
  onChange: (value: string) => void;
  inputStyle?: CSSProperties;
  labelStyle?: CSSProperties;
};

export default function SportPositionField({ sport, value, onChange, inputStyle, labelStyle }: Props) {
  const id = useId();
  const config = SPORT_CONFIG[sport];
  const options = config?.options ?? [];
  const label = config?.label ?? "Position / event";
  const [custom, setCustom] = useState(false);
  const customValue = Boolean(value && !options.includes(value));
  const showCustom = custom || customValue;
  const control = { width: "100%", ...inputStyle };

  if (!options.length) return (
    <label style={labelStyle}>
      {label}
      <input style={control} value={value} onChange={event => onChange(event.target.value)} disabled={!sport} placeholder={sport ? `Enter your ${label.toLowerCase()}` : "Choose a primary sport first"} />
    </label>
  );

  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <select id={id} style={control} value={showCustom ? "__custom__" : value} onChange={event => {
        const next = event.target.value;
        setCustom(next === "__custom__");
        onChange(next === "__custom__" ? "" : next);
      }}>
        <option style={{ color: "#0F172A", background: "#FFFFFF" }} value="">Select {label.toLowerCase()}…</option>
        {options.map(option => <option style={{ color: "#0F172A", background: "#FFFFFF" }} key={option} value={option}>{option}</option>)}
        <option style={{ color: "#0F172A", background: "#FFFFFF" }} value="__custom__">Other / enter your own</option>
      </select>
      {showCustom && <label style={{ ...labelStyle, marginTop: 8 }}>Your {label.toLowerCase()}
        <input style={control} value={value} onChange={event => onChange(event.target.value)} />
      </label>}
    </div>
  );
}
