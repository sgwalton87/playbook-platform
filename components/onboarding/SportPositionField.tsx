"use client";

import { useMemo, useState } from "react";

import {
  getSportPositionOptions,
} from "@/lib/education";

type Props = {
  fieldId: string;
  sport: string;
  value: string;
  onChange: (value: string) => void;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1.5px solid #CBD5E1",
  borderRadius: 10,
  background: "#FFFFFF",
  color: "#0F172A",
  fontSize: 14,
  outline: "none",
};

export default function SportPositionField({
  fieldId,
  sport,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () => getSportPositionOptions(sport),
    [sport]
  );

  const query = value.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!query) {
      return options;
    }

    return options.filter((position) =>
      position.toLowerCase().includes(query)
    );
  }, [options, query]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        marginTop: 6,
        zIndex: open ? 150 : 1,
      }}
    >
      <input
        id={fieldId}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        value={value}
        placeholder={`Select or type a ${sport} position...`}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          setTimeout(
            () => setOpen(false),
            150
          );
        }}
        style={{
          ...inputStyle,
          borderColor: open
            ? "#F97316"
            : "#CBD5E1",
        }}
      />

      {open ? (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: "100%",
            maxHeight: 260,
            overflowY: "auto",
            border: "1px solid #CBD5E1",
            borderRadius: 11,
            background: "#FFFFFF",
            boxShadow:
              "0 18px 45px rgba(15,23,42,.18)",
            zIndex: 10000,
          }}
        >
          {matches.length ? (
            matches.map((position) => (
              <button
                key={position}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(position);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "11px 13px",
                  border: 0,
                  borderBottom:
                    "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {position}
              </button>
            ))
          ) : (
            <div
              style={{
                padding: 13,
                color: "#64748B",
                fontSize: 12,
              }}
            >
              No listed position matched.
              You may use the position or role you typed.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
