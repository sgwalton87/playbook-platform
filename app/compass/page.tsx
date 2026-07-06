"use client";

import CompassCoreCard from "@/components/compass/CompassCoreCard";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import { PlaybookHeroVisual } from "@/components/brand-story";

const demoCourses = [
  { name: "Biology", subject: "science", credits: 10, grade: "A", completed: true },
  { name: "Algebra II", subject: "math", credits: 10, grade: "B", completed: true },
  { name: "English 9", subject: "english", credits: 10, grade: "A", completed: true },
];

export default function CompassPage() {
  return (
    <>
      <PlaybookHeroVisual
        image={PLAYBOOK_HERO_VISUALS.compass.image}
        alt={PLAYBOOK_HERO_VISUALS.compass.alt}
      />

    <main style={{minHeight:"100vh",background:"#F8F7F4",padding:36}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <CompassCoreCard courses={demoCourses} trustScore={60} />
      </div>
    </main>
    </>
  );
}
