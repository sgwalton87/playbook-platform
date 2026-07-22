"use client";

import { useEffect, useMemo, useState } from "react";

type CollegeResult = {
  id?: number | string;
  relevance_score?: number;
  "school.name"?: string;
  "school.alias"?: string;
};

export default function CollegeSearch({
  value,
  onChange,
  excludedValues = [],
}: {
  value: string;
  onChange: (schoolName: string, schoolId?: string) => void;
  excludedValues?: string[];
}) {
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const excludedNames = useMemo(
    () => excludedValues.map((school) => school.trim().toLowerCase()).filter(Boolean),
    [excludedValues]
  );

  useEffect(() => {
    if (value !== selectedValue) {
      setDropdownOpen(true);
    }

    if (!value || value.length < 3 || !dropdownOpen) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const url =
          `https://api.data.gov/ed/collegescorecard/v1/name-autocomplete` +
          `?school_search=${encodeURIComponent(value)}` +
          `&api_key=${process.env.NEXT_PUBLIC_COLLEGE_SCORECARD_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        console.log("College autocomplete response:", data);

        const nextResults = Array.isArray(data.results) ? data.results : [];
        setResults(
          nextResults.filter((school: CollegeResult) => {
            const schoolName = school["school.name"] || school["school.alias"] || "";
            return !excludedNames.includes(schoolName.trim().toLowerCase());
          })
        );
      } catch (err) {
        console.error("College search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [dropdownOpen, excludedNames, selectedValue, value]);

  return (
    <div style={{ position: "relative" }}>
      <input
        style={{
          width: "100%",
          padding: "13px 14px",
          borderRadius: 12,
          border: "1.5px solid #e5e7eb",
          fontSize: 14,
        }}
        placeholder="Type your dream school"
        value={value}
        onChange={(e) => {
          setSelectedValue("");
          setDropdownOpen(true);
          onChange(e.target.value, "");
        }}
        onFocus={() => setDropdownOpen(true)}
      />

      {loading && (
        <div style={{ fontSize: 12, marginTop: 6, color: "#666" }}>
          Searching colleges...
        </div>
      )}

      {dropdownOpen && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 999,
            background: "#fff",
            width: "100%",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            marginTop: 6,
            maxHeight: 300,
            overflowY: "auto",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          }}
        >
          {results.map((school, index) => {
            const schoolName = school["school.name"] || school["school.alias"] || "Unknown school";
            const schoolId = school.id ? String(school.id) : "";

            return (
              <button
                key={`${schoolId}-${schoolName}-${index}`}
                type="button"
                onClick={() => {
                  setSelectedValue(schoolName);
                  onChange(schoolName, schoolId);
                  setResults([]);
                  setDropdownOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  border: "none",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <strong>{schoolName}</strong>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
