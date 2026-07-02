export function inferCompassGoals(input: { courses?: any[] }) {
  const names = (input.courses || []).map(c => String(c.name || "").toLowerCase());

  return [
    names.some(n => n.includes("biology")) && "Explore health, science, or public health pathways.",
    names.some(n => n.includes("algebra")) && "Strengthen STEM, finance, or engineering readiness.",
    names.some(n => n.includes("english")) && "Develop writing, communication, and leadership pathways.",
  ].filter(Boolean) as string[];
}
