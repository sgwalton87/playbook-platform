"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getMajorOptions,
  searchMajors,
} from "@/lib/education";

type Props = {
  fieldKey: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  customMajors?: string[];
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "13px 15px",
  border: "1.5px solid #CBD5E1",
  borderRadius: 12,
  background: "#FFFFFF",
  color: "#0F172A",
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
};

export default function SearchableMajorField({
  fieldKey,
  label,
  value,
  placeholder,
  required,
  helpText,
  error,
  customMajors = [],
  onChange,
  onBlur,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] =
    useState(-1);

  const closeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const allMajors = useMemo(
    () => getMajorOptions(customMajors),
    [customMajors]
  );

  const matches = useMemo(() => {
    const query = value.trim();

    if (!query) {
      return allMajors.slice(0, 40);
    }

    return searchMajors(
      query,
      customMajors,
      40
    );
  }, [
    allMajors,
    customMajors,
    value,
  ]);

  function selectMajor(major: string) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    onChange(major);
    setOpen(false);
    setActiveIndex(-1);
  }

  function closeResults() {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setActiveIndex(-1);
      onBlur?.(value.trim());
    }, 150);
  }

  return (
    <div
      data-field-key={fieldKey}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        marginBottom: 18,
        zIndex: open ? 400 : 1,
        isolation: "isolate",
      }}
    >
      <label
        htmlFor={fieldKey}
        style={{
          display: "block",
          marginBottom: 6,
          color: "#0F172A",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {label}

        {required ? (
          <span
            style={{
              marginLeft: 4,
              color: "#F97316",
            }}
          >
            *
          </span>
        ) : null}
      </label>

      {helpText ? (
        <div
          style={{
            marginBottom: 7,
            color: "#64748B",
            fontSize: 12,
          }}
        >
          {helpText}
        </div>
      ) : null}

      <input
        id={fieldKey}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${fieldKey}-results`}
        value={value}
        placeholder={
          placeholder ||
          "Start typing a major..."
        }
        style={{
          ...inputStyle,
          borderColor: error
            ? "#DC2626"
            : open
              ? "#F97316"
              : "#CBD5E1",
          boxShadow: open
            ? "0 0 0 3px rgba(249,115,22,.12)"
            : "none",
        }}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onBlur={closeResults}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" &&
            matches.length
          ) {
            event.preventDefault();
            setOpen(true);

            setActiveIndex((current) =>
              Math.min(
                current + 1,
                matches.length - 1
              )
            );
          }

          if (
            event.key === "ArrowUp" &&
            matches.length
          ) {
            event.preventDefault();

            setActiveIndex((current) =>
              Math.max(current - 1, 0)
            );
          }

          if (
            event.key === "Enter" &&
            activeIndex >= 0 &&
            matches[activeIndex]
          ) {
            event.preventDefault();
            selectMajor(matches[activeIndex]);
          }

          if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
      />

      {open ? (
        <div
          id={`${fieldKey}-results`}
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: "100%",
            minWidth: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            zIndex: 10000,
            maxHeight: 320,
            overflowY: "auto",
            overflowX: "hidden",
            border: "1px solid #CBD5E1",
            borderRadius: 12,
            background: "#FFFFFF",
            boxShadow:
              "0 18px 45px rgba(15,23,42,.18)",
          }}
        >
          {matches.length ? (
            matches.map((major, index) => (
              <button
                key={major}
                type="button"
                role="option"
                aria-selected={
                  index === activeIndex
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectMajor(major);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 14px",
                  border: 0,
                  borderBottom:
                    index === matches.length - 1
                      ? 0
                      : "1px solid #E2E8F0",
                  background:
                    index === activeIndex
                      ? "#FFF7ED"
                      : "#FFFFFF",
                  color: "#0F172A",
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {major}
              </button>
            ))
          ) : (
            <div
              style={{
                padding: 14,
                color: "#64748B",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              No existing major match was found.
              Continue using the major you typed;
              it will be saved when you leave this
              field.
            </div>
          )}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 6,
            color: "#B91C1C",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
