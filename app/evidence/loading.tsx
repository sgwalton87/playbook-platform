import { PlaybookSurfaceState } from "@/components/ui";

export default function Loading() {
  return <main style={{ maxWidth: 1040, margin: "0 auto", padding: 36 }}><PlaybookSurfaceState state="loading" title="Loading Evidence Center" description="Checking identity, relationship permissions, and authorized evidence." /></main>;
}
