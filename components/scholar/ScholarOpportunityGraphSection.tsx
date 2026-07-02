"use client";

import Link from "next/link";
import OpportunityGraphCard from "@/components/opportunity-graph/OpportunityGraphCard";

const demoCourses = [
  { name: "Biology", subject: "science", credits: 10, completed: true },
  { name: "Algebra II", subject: "math", credits: 10, completed: true },
  { name: "English 9", subject: "english", credits: 10, completed: true },
];

export default function ScholarOpportunityGraphSection() {
  return (
    <div style={{animation:"fadeUp .45s ease both"}}>
      <OpportunityGraphCard courses={demoCourses} />
      <Link
        href="/opportunities"
        style={{
          display:"inline-flex",
          marginTop:10,
          background:"#F97316",
          color:"#fff",
          textDecoration:"none",
          borderRadius:999,
          padding:"10px 14px",
          fontSize:13,
          fontWeight:900
        }}
      >
        Open Opportunity Marketplace →
      </Link>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
