"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  searchColleges,
  type CollegeSearchOption,
} from "@/lib/education/providers/collegeSearch";

type CollegeSearchProps = {
  value: string;
  onChange: (
    schoolName: string,
    schoolId?: string
  ) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  fieldId?: string;
  onBlur?: (value: string) => void;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1.5px solid #E2E8F0",
  background: "#FFFFFF",
  color: "#0F172A",
  fontSize: 14,
  outline: "none",
};

export default function CollegeSearch({
  value,
  onChange,
  placeholder = "Start typing a college or university...",
  required = false,
  error,
  helpText,
  fieldId = "college-search",
  onBlur,
}: CollegeSearchProps) {
  const [results, setResults] = useState<
    CollegeSearchOption[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] = useState(false);

  const [activeIndex, setActiveIndex] =
    useState(-1);

  const [requestError, setRequestError] =
    useState<string | null>(null);

  const requestIdRef = useRef(0);

  const closeTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const query = useMemo(
    () => value.trim(),
    [value]
  );

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setRequestError(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setRequestError(null);

        const matches =
          await searchColleges(query);

        if (
          requestId !== requestIdRef.current
        ) {
          return;
        }

        setResults(matches.slice(0, 30));
        setOpen(true);
        setActiveIndex(-1);
      } catch (searchError) {
        if (
          requestId !== requestIdRef.current
        ) {
          return;
        }

        console.error(
          "College search failed:",
          searchError
        );

        setResults([]);
        setRequestError(
          "College search is temporarily unavailable. You may still type the school name."
        );
        setOpen(true);
      } finally {
        if (
          requestId === requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  function selectCollege(
    college: CollegeSearchOption
  ) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    onChange(college.name, college.id);

    setOpen(false);
    setResults([]);
    setActiveIndex(-1);
    setRequestError(null);
  }

  function closeResults() {
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setActiveIndex(-1);
      onBlur?.(value.trim());
    }, 150);
  }

  return (
    <div
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        marginBottom: open ? 12 : 0,
        zIndex: open ? 500 : 1,
        isolation: "isolate",
      }}
    >
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
        id={fieldId}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${fieldId}-results`}
        aria-required={required}
        value={value}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          borderColor: error
            ? "#DC2626"
            : open
              ? "#F97316"
              : "#E2E8F0",
          boxShadow: open
            ? "0 0 0 3px rgba(249,115,22,.12)"
            : "none",
        }}
        onFocus={() => {
          if (
            query.length >= 2 ||
            loading ||
            requestError
          ) {
            setOpen(true);
          }
        }}
        onBlur={closeResults}
        onChange={(event) => {
          onChange(event.target.value, "");

          if (
            event.target.value.trim().length >= 2
          ) {
            setOpen(true);
          } else {
            setOpen(false);
            setResults([]);
          }
        }}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" &&
            results.length
          ) {
            event.preventDefault();
            setOpen(true);

            setActiveIndex((current) =>
              Math.min(
                current + 1,
                results.length - 1
              )
            );
          }

          if (
            event.key === "ArrowUp" &&
            results.length
          ) {
            event.preventDefault();

            setActiveIndex((current) =>
              Math.max(current - 1, 0)
            );
          }

          if (
            event.key === "Enter" &&
            activeIndex >= 0 &&
            results[activeIndex]
          ) {
            event.preventDefault();

            selectCollege(
              results[activeIndex]
            );
          }

          if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
      />

      {open ? (
        <div
          id={`${fieldId}-results`}
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
          {loading ? (
            <div
              style={{
                padding: "13px 14px",
                color: "#64748B",
                fontSize: 13,
              }}
            >
              Searching colleges...
            </div>
          ) : null}

          {!loading &&
          results.length > 0 ? (
            results.map((college, index) => (
              <button
                key={[
                  college.id,
                  college.name,
                  index,
                ].join("::")}
                type="button"
                role="option"
                aria-selected={
                  index === activeIndex
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectCollege(college);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 14px",
                  border: 0,
                  borderBottom:
                    index ===
                    results.length - 1
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
                <div>{college.name}</div>

                {college.country ? (
                  <div
                    style={{
                      marginTop: 3,
                      color: "#64748B",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {college.country}
                  </div>
                ) : null}
              </button>
            ))
          ) : null}

          {!loading &&
          results.length === 0 &&
          !requestError &&
          query.length >= 2 ? (
            <div
              style={{
                padding: "13px 14px",
                color: "#64748B",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              No official match found. You may
              continue using the college name you
              typed.
            </div>
          ) : null}

          {requestError ? (
            <div
              style={{
                padding: "13px 14px",
                color: "#92400E",
                background: "#FFFBEB",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {requestError}
            </div>
          ) : null}
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
