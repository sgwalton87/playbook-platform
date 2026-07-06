"use client";

import OpportunityMarketplace from "@/components/opportunity-marketplace/OpportunityMarketplace";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";

const demoCourses = [
  { name: "Biology", subject: "science", credits: 10, completed: true },
  { name: "Algebra II", subject: "math", credits: 10, completed: true },
  { name: "English 9", subject: "english", credits: 10, completed: true },
];

export default function OpportunitiesPage() {
  return <OpportunityMarketplace courses={demoCourses} />;
}
