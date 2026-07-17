"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getSchoolOptions,
  type SchoolOption,
} from "@/lib/education";

type Props = {
  fieldKey: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  onChange: (value: string) => void;
  onSchoolSelect?: (school: SchoolOption) => void;
  onBlur?: (value: string) => void;
};

const fieldInput: React.CSSProperties = {
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

function searchableText(school: SchoolOption) {
  return [
    school.label,
    school.district,
    school.city,
    school.county,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function SearchableSchoolField({
  fieldKey,
  label,
  value,
  placeholder,
  required,
  helpText,
  error,
  onChange,
  onSchoolSelect,
  onBlur,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const closeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const schools = useMemo(
    () => getSchoolOptions(),
    []
  );

  const query = value.trim().toLowerCase();

  const matches = useMemo(() => {
    if (query.length < 2) {
      return [];
    }

    return schools
      .map((school) => {
        const name = school.label.toLowerCase();
        const haystack = searchableText(school);

        let rank = 99;

        if (name === query) rank = 0;
        else if (name.startsWith(query)) rank = 1;
        else if (name.includes(query)) rank = 2;
        else if (haystack.includes(query)) rank = 3;

        return { school, rank };
      })
      .filter(({ rank }) => rank < 99)
      .sort((a, b) => {
        if (a.rank !== b.rank) {
          return a.rank - b.rank;
        }

        const nameComparison =
          a.school.label.localeCompare(
            b.school.label
          );

        if (nameComparison !== 0) {
          return nameComparison;
        }

        return String(
          a.school.city || ""
        ).localeCompare(
          String(b.school.city || "")
        );
      })
      .slice(0, 40)
      .map(({ school }) => school);
  }, [query, schools]);

  function selectSchool(school: SchoolOption) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    onChange(school.label);
    onSchoolSelect?.(school);

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
        zIndex: open ? 100 : 1,
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
          "Start typing your high school..."
        }
        style={{
          ...fieldInput,
          borderColor: error
            ? "#DC2626"
            : open
              ? "#F97316"
              : "#CBD5E1",
          boxShadow: open
            ? "0 0 0 3px rgba(249,115,22,.12)"
            : "none",
        }}
        onFocus={() => {
          if (query.length >= 2) {
            setOpen(true);
          }
        }}
        onChange={(event) => {
          const next = event.target.value;

          onChange(next);
          setOpen(next.trim().length >= 2);
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
            selectSchool(matches[activeIndex]);
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
            right: 0,
            left: 0,
            zIndex: 10000,
            maxHeight: 320,
            overflowY: "auto",
            border: "1px solid #CBD5E1",
            borderRadius: 12,
            background: "#FFFFFF",
            boxShadow:
              "0 18px 45px rgba(15,23,42,.18)",
          }}
        >
          {matches.length ? (
            matches.map((school, index) => (
              <button
                key={[
                  school.id,
                  school.label,
                  school.district,
                  school.city,
                ].join("::")}
                type="button"
                role="option"
                aria-selected={
                  index === activeIndex
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSchool(school);
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
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    color: "#0F172A",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {school.label}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color: "#64748B",
                    fontSize: 12,
                  }}
                >
                  {[
                    school.district,
                    school.city,
                    school.state,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </button>
            ))
          ) : (
            <div
              style={{
                padding: 14,
                color: "#64748B",
                fontSize: 13,
              }}
            >
              No official school match found.
              Continue typing the correct school name;
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
