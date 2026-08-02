import Link from "next/link";

type Completion = { completed: number; total: number; percent: number; ready: boolean; requirements: Array<{ id: string; label: string; complete: boolean }>; gaps: Array<{ id: string; label: string }> };

export default function ScholarRecordReadiness({ completion }: { completion: Completion }) {
  return <section aria-labelledby="record-readiness" style={{ border: "1px solid #CBD5E1", borderRadius: 18, padding: 24, marginBottom: 24, background: "#fff" }}>
    <p>Scholar Record readiness</p><h1 id="record-readiness">{completion.percent}% complete</h1>
    <progress value={completion.completed} max={completion.total}>{completion.percent}%</progress>
    <ul>{completion.requirements.map((requirement) => <li key={requirement.id}>{requirement.complete ? "✓" : "○"} {requirement.label}</li>)}</ul>
    {completion.gaps.length > 0 && <p>{completion.gaps.length} evidence or profile gaps remain. Missing evidence is not a judgment of potential.</p>}
    <Link href="/portfolio">Prepare a controlled portfolio</Link>
  </section>;
}
