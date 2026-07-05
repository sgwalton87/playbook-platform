"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export default function AlbumsPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [userId, setUserId] = useState("");
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [title, setTitle] = useState("My Playbook Story");
  const [category, setCategory] = useState("story");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAlbums(uid?: string) {
    const resolved = uid || userId;
    if (!resolved) return;

    const res = await fetch(`/api/albums?userId=${resolved}`);
    const json = await res.json();
    setAlbums(json.albums || []);

    if (!selectedAlbumId && json.albums?.[0]?.id) {
      setSelectedAlbumId(json.albums[0].id);
    }
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      setUserId(uid);
      await loadAlbums(uid);
    }

    init();
  }, []);

  async function createAlbum() {
    if (!userId || !title.trim()) return;
    setBusy(true);

    await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, category, visibility: "public" }),
    });

    await loadAlbums(userId);
    setBusy(false);
  }

  async function uploadPhoto(file?: File) {
    if (!file || !userId || !selectedAlbumId) return;
    setBusy(true);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `gallery/${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (error) {
      alert(error.message);
      setBusy(false);
      return;
    }

    const imageUrl = `${SURL}/storage/v1/object/public/photos/${path}`;

    await fetch("/api/albums/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        albumId: selectedAlbumId,
        userId,
        imageUrl,
        caption,
        makeCover: true,
      }),
    });

    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
    await loadAlbums(userId);
    setBusy(false);
  }

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Photo Albums"
        title="Your scholar story is bigger than grades."
        subtitle="Create albums for sports, clubs, community events, service, campus visits, performances, leadership, and milestones."
      />

      <PlaybookGrid>
        <PlaybookCard eyebrow="Create Album" title="Start a collection">
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
            <option value="story">Story</option>
            <option value="athletics">Athletics</option>
            <option value="clubs">Clubs</option>
            <option value="service">Service</option>
            <option value="academics">Academics</option>
            <option value="events">Events</option>
            <option value="campus_visits">Campus Visits</option>
          </select>
          <button onClick={createAlbum} disabled={busy} style={button}>Create Album</button>
        </PlaybookCard>

        <PlaybookCard eyebrow="Upload Photo" title="Add to album">
          <select value={selectedAlbumId} onChange={(e) => setSelectedAlbumId(e.target.value)} style={input}>
            <option value="">Choose album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>{album.title}</option>
            ))}
          </select>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" style={input} />
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
        </PlaybookCard>
      </PlaybookGrid>

      <section style={albumGrid}>
        {albums.map((album) => (
          <article key={album.id} style={albumCard}>
            {album.cover_url && <img src={album.cover_url} alt="" style={cover} />}
            <div style={{ padding: 16 }}>
              <h2 style={{ margin: 0 }}>{album.title}</h2>
              <p style={body}>{album.description || "No description yet."}</p>
              <PlaybookPill>{album.category}</PlaybookPill>
              <div style={photoGrid}>
                {(album.profile_album_photos || []).map((photo: any) => (
                  <div key={photo.id}>
                    <img src={photo.image_url} alt="" style={thumb} />
                    {photo.caption && <p style={captionStyle}>{photo.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </PlaybookPage>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
};

const button: React.CSSProperties = {
  border: 0,
  borderRadius: 12,
  background: "#0F172A",
  color: "#F8F7F4",
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const albumGrid: React.CSSProperties = {
  maxWidth: 1180,
  margin: "18px auto 0",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const albumCard: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 20,
  overflow: "hidden",
};

const cover: React.CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
};

const photoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
  marginTop: 14,
};

const thumb: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1",
  objectFit: "cover",
  borderRadius: 10,
};

const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const captionStyle: React.CSSProperties = { color: "#64748B", fontSize: 11, marginTop: 4 };
