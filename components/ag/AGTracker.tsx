"use client";

const AG_REQUIREMENTS = [
  { code: "A", name: "History / Social Science", years: 2 },
  { code: "B", name: "English", years: 4 },
  { code: "C", name: "Mathematics", years: 3 },
  { code: "D", name: "Laboratory Science", years: 2 },
  { code: "E", name: "Language Other Than English", years: 2 },
  { code: "F", name: "Visual & Performing Arts", years: 1 },
  { code: "G", name: "College-Preparatory Elective", years: 1 },
];

export default function AGTracker() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {AG_REQUIREMENTS.map((req) => (
        <div
          key={req.code}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
            background: "#fff",
          }}
        >
          <strong>{req.code}. {req.name}</strong>
          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
            Required: {req.years} year{req.years > 1 ? "s" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
