"use client";

import { useEffect, useState } from "react";

type CollegeResult = {
  id?: number | string;
  relevance_score?: number;
  "school.name"?: string;
  "school.alias"?: string;
};

export default function CollegeSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (schoolName: string, schoolId?: string) => void;
}) {
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value || value.length < 3) {
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

        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        console.error("College search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

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
        onChange={(e) => onChange(e.target.value, "")}
      />

      {loading && (
        <div style={{ fontSize: 12, marginTop: 6, color: "#666" }}>
          Searching colleges...
        </div>
      )}

      {results.length > 0 && (
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
                  onChange(schoolName, schoolId);
                  setResults([]);
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
