"use client";

import CompassCoreCard from "@/components/compass/CompassCoreCard";

const demoCourses = [
  { name: "Biology", subject: "science", credits: 10, grade: "A", completed: true },
  { name: "Algebra II", subject: "math", credits: 10, grade: "B", completed: true },
  { name: "English 9", subject: "english", credits: 10, grade: "A", completed: true },
];

export default function TodaysGuidanceCard() {
  return (
    <div style={{animation:"fadeUp .45s ease both"}}>
      <CompassCoreCard courses={demoCourses} trustScore={65} />
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
