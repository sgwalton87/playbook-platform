import type { ReactNode } from "react";
import { PlaybookButton } from "./PlaybookButton";

type SurfaceState = "loading" | "empty" | "error" | "restricted";
const LABELS: Record<SurfaceState, string> = { loading: "Loading", empty: "Nothing here yet", error: "Unable to load", restricted: "Permission required" };
export function PlaybookSurfaceState({ state, title = LABELS[state], description, action }: { state: SurfaceState; title?: string; description: string; action?: { href: string; label: string } | ReactNode }) {
  return <section className={`playbook-surface-state playbook-surface-state--${state}`} role={state === "error" ? "alert" : "status"} aria-busy={state === "loading" || undefined}>
    <p className="playbook-surface-state__eyebrow">{LABELS[state]}</p><h2>{title}</h2><p>{description}</p>
    {action && (typeof action === "object" && "href" in action ? <PlaybookButton href={action.href}>{action.label}</PlaybookButton> : action)}
  </section>;
}
