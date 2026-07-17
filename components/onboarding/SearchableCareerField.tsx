"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  searchCareers,
  type CareerSearchOption,
} from "@/lib/education";

type Props = {
  fieldKey: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  onChange: (
    value: string
  ) => void;
  onBlur?: (
    value: string
  ) => void;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "13px 15px",
  border:
    "1.5px solid #CBD5E1",
  borderRadius: 12,
  background: "#FFFFFF",
  color: "#0F172A",
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
};

export default function SearchableCareerField({
  fieldKey,
  label,
  value,
  placeholder,
  required,
  helpText,
  error,
  onChange,
  onBlur,
}: Props) {
  const [results, setResults] =
    useState<
      CareerSearchOption[]
    >([]);

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(-1);

  const [requestError, setRequestError] =
    useState<string | null>(
      null
    );

  const requestIdRef =
    useRef(0);

  const closeTimerRef =
    useRef<
      ReturnType<typeof setTimeout>
      | null
    >(null);

  const query = value.trim();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setRequestError(null);
      return;
    }

    const requestId =
      requestIdRef.current + 1;

    requestIdRef.current =
      requestId;

    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);
          setRequestError(null);

          const matches =
            await searchCareers(
              query
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setResults(
            matches.slice(0, 40)
          );

          setOpen(true);
          setActiveIndex(-1);
        } catch (searchError) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          console.error(
            "Career search failed:",
            searchError
          );

          setResults([]);

          setRequestError(
            "Career search is temporarily unavailable. You may still type the profession."
          );

          setOpen(true);
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(false);
          }
        }
      },
      300
    );

    return () =>
      clearTimeout(timer);
  }, [query]);

  function selectCareer(
    career: CareerSearchOption
  ) {
    if (
      closeTimerRef.current
    ) {
      clearTimeout(
        closeTimerRef.current
      );
    }

    onChange(career.title);

    setOpen(false);
    setResults([]);
    setActiveIndex(-1);
    setRequestError(null);
  }

  function closeResults() {
    closeTimerRef.current =
      setTimeout(() => {
        setOpen(false);
        setActiveIndex(-1);
        onBlur?.(
          value.trim()
        );
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
        zIndex: open ? 450 : 1,
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
          "Start typing a profession..."
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
        onFocus={() => {
          if (
            query.length >= 2 ||
            loading ||
            requestError
          ) {
            setOpen(true);
          }
        }}
        onChange={(event) => {
          const next =
            event.target.value;

          onChange(next);

          if (
            next.trim().length >=
            2
          ) {
            setOpen(true);
          } else {
            setOpen(false);
            setResults([]);
          }

          setActiveIndex(-1);
        }}
        onBlur={closeResults}
        onKeyDown={(event) => {
          if (
            event.key ===
              "ArrowDown" &&
            results.length
          ) {
            event.preventDefault();

            setOpen(true);

            setActiveIndex(
              (current) =>
                Math.min(
                  current + 1,
                  results.length - 1
                )
            );
          }

          if (
            event.key ===
              "ArrowUp" &&
            results.length
          ) {
            event.preventDefault();

            setActiveIndex(
              (current) =>
                Math.max(
                  current - 1,
                  0
                )
            );
          }

          if (
            event.key ===
              "Enter" &&
            activeIndex >= 0 &&
            results[activeIndex]
          ) {
            event.preventDefault();

            selectCareer(
              results[
                activeIndex
              ]
            );
          }

          if (
            event.key ===
            "Escape"
          ) {
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
            top:
              "calc(100% + 6px)",
            left: 0,
            width: "100%",
            minWidth: "100%",
            maxWidth: "100%",
            boxSizing:
              "border-box",
            zIndex: 10000,
            maxHeight: 320,
            overflowY: "auto",
            overflowX: "hidden",
            border:
              "1px solid #CBD5E1",
            borderRadius: 12,
            background: "#FFFFFF",
            boxShadow:
              "0 18px 45px rgba(15,23,42,.18)",
          }}
        >
          {loading ? (
            <div
              style={{
                padding:
                  "13px 14px",
                color: "#64748B",
                fontSize: 13,
              }}
            >
              Searching professions...
            </div>
          ) : null}

          {!loading &&
          results.length > 0
            ? results.map(
                (
                  career,
                  index
                ) => (
                  <button
                    key={[
                      career.id,
                      career.title,
                      index,
                    ].join("::")}
                    type="button"
                    role="option"
                    aria-selected={
                      index ===
                      activeIndex
                    }
                    onMouseDown={(
                      event
                    ) => {
                      event.preventDefault();

                      selectCareer(
                        career
                      );
                    }}
                    style={{
                      display:
                        "block",
                      width: "100%",
                      padding:
                        "12px 14px",
                      border: 0,
                      borderBottom:
                        index ===
                        results.length -
                          1
                          ? 0
                          : "1px solid #E2E8F0",
                      background:
                        index ===
                        activeIndex
                          ? "#FFF7ED"
                          : "#FFFFFF",
                      color:
                        "#0F172A",
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign:
                        "left",
                      cursor:
                        "pointer",
                    }}
                  >
                    {career.title}
                  </button>
                )
              )
            : null}

          {!loading &&
          results.length === 0 &&
          !requestError &&
          query.length >= 2 ? (
            <div
              style={{
                padding:
                  "13px 14px",
                color: "#64748B",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              No existing profession
              matched. You may continue
              using the career you typed.
            </div>
          ) : null}

          {requestError ? (
            <div
              style={{
                padding:
                  "13px 14px",
                color: "#92400E",
                background:
                  "#FFFBEB",
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
