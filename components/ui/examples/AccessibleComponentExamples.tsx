import { PlaybookBadge, PlaybookCard, PlaybookInput, PlaybookMetricCard, PlaybookSurfaceState } from "@/components/ui";
import { PlaybookButton } from "@/components/ui/PlaybookButton";
export function AccessibleComponentExamples() { return <div style={{ display: "grid", gap: 24 }}>
  <section aria-labelledby="buttons-example"><h2 id="buttons-example">Buttons and badges</h2><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><PlaybookButton href="/dashboard">Primary action</PlaybookButton><PlaybookButton href="/settings" variant="secondary">Secondary action</PlaybookButton><PlaybookBadge>Verified</PlaybookBadge></div></section>
  <section aria-labelledby="cards-example"><h2 id="cards-example">Cards and metrics</h2><PlaybookCard><h3>Evidence summary</h3><p>Cards use semantic article markup and visible headings.</p></PlaybookCard><PlaybookMetricCard label="Verified evidence" value="4 of 5" detail="One review pending" /></section>
  <section aria-labelledby="forms-example"><h2 id="forms-example">Forms</h2><form><label htmlFor="goal">Opportunity goal</label><PlaybookInput id="goal" name="goal" placeholder="Describe your goal" /><PlaybookButton type="submit">Save goal</PlaybookButton></form></section>
  <section aria-labelledby="states-example"><h2 id="states-example">Workflow states</h2><PlaybookSurfaceState state="restricted" description="Select an authorized Scholar relationship to continue." action={{ href: "/support-network", label: "Review relationships" }} /></section>
  </div>; }
