"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
} from "@/components/ui";

export default function AlbumsPage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Photo Albums"
        title="Your scholar story is bigger than grades."
        subtitle="Albums are for clubs, events, sports matches, meets, service projects, performances, field trips, and community moments."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/feed">Post to Community</PlaybookButton>
          <PlaybookButton href="/profile" variant="secondary">Edit Profile</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Gallery" title="Profile photo book">
          <p style={body}>
            Photos uploaded through profile and feed posts become part of the
            scholar's public story and portfolio timeline.
          </p>
          <PlaybookButton href="/feed">Upload Photo Post</PlaybookButton>
        </PlaybookCard>

        <PlaybookCard eyebrow="Coming Next" title="Album collections">
          <p style={body}>
            Next activation: persisted albums, album privacy, tagged events,
            sports highlights, club photos, and profile display controls.
          </p>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
