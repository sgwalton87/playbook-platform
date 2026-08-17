"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PublicPost = {
  id: string;
  title: string | null;
  body: string;
  imageUrl: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  author: string;
  role: string;
  category: string | null;
};

type PublicIdentity = {
  id: string;
  username: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
};

const CANONICAL_CATEGORIES = new Set(["leadership", "finance", "civic", "sel", "college", "nil", "community"]);

export default function PublicNewsFeed() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    async function loadPublicPosts() {
      const { data: rows, error } = await supabase
        .from("feed_posts")
        .select("id,user_id,title,body,image_url,media_url,media_type,created_at,post_type")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!active) return;
      if (error) {
        setState("error");
        return;
      }

      const authorIds = [...new Set((rows || []).map((post) => post.user_id).filter(Boolean))].slice(0, 100);
      const identityResult = authorIds.length
        ? await supabase.rpc("get_public_member_identities", { requested_ids: authorIds })
        : { data: [] as PublicIdentity[], error: null };

      if (!active) return;
      if (identityResult.error) {
        setState("error");
        return;
      }

      const authors = new Map(
        ((identityResult.data || []) as PublicIdentity[]).map((identity) => [
          identity.id,
          {
            name: identity.full_name || [identity.first_name, identity.last_name].filter(Boolean).join(" ") || identity.username || "Playbook community member",
            role: formatLabel(identity.role),
          },
        ]),
      );

      setPosts((rows || []).map((post) => {
        const author = authors.get(post.user_id) || { name: "Playbook community member", role: "Community" };
        const normalizedType = String(post.post_type || "").trim().toLowerCase();
        const video = post.media_type === "video";
        return {
          id: post.id,
          title: post.title || null,
          body: post.body || "",
          imageUrl: video ? null : (post.image_url || post.media_url || null),
          mediaUrl: video ? post.media_url : null,
          mediaType: post.media_type || (post.image_url ? "image" : null),
          createdAt: post.created_at,
          author: author.name,
          role: author.role,
          category: CANONICAL_CATEGORIES.has(normalizedType) ? formatLabel(normalizedType) : null,
        };
      }));
      setState("ready");
    }
    void loadPublicPosts();
    return () => { active = false; };
  }, []);

  if (state === "loading") return <FeedState label="Loading published community stories…" />;
  if (state === "error") return <FeedState label="The public feed is temporarily unavailable. No sample stories have been substituted." error />;
  if (posts.length === 0) return <FeedState label="No community stories have been published yet. Sign in to build the first verified story." />;

  return (
    <section style={grid} aria-label="Published Playbook community stories">
      {posts.map((post) => (
        <article key={post.id} style={card} data-testid="public-news-post">
          {post.imageUrl && (
            <div style={media}>
              <Image unoptimized fill sizes="(max-width: 760px) 100vw, 50vw" src={post.imageUrl} alt="" style={{ objectFit: "cover" }} />
            </div>
          )}
          {post.mediaType === "video" && post.mediaUrl && (
            <video controls preload="metadata" src={post.mediaUrl} aria-label="Published Playbook story video" style={videoMedia} />
          )}
          <div style={cardBody}>
            <div style={meta}>
              <span>{post.category ? `${post.category} · ${post.role}` : post.role}</span>
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </div>
            <h2 style={cardTitle}>{post.title || "From the Playbook community"}</h2>
            <p style={copy}>{post.body}</p>
            <div style={author}>Published by {post.author}</div>
          </div>
        </article>
      ))}
      <aside style={joinCard}>
        <p style={eyebrow}>Your story belongs here</p>
        <h2 style={joinTitle}>Build evidence. Share progress. Open the next door.</h2>
        <p style={joinCopy}>Join The Playbook to publish updates, celebrate milestones, and connect your journey to opportunity.</p>
        <Link href="/login?mode=signup" style={button}>Join The Playbook →</Link>
      </aside>
    </section>
  );
}

function FeedState({ label, error = false }: { label: string; error?: boolean }) {
  return (
    <section style={stateCard} role={error ? "alert" : "status"}>
      <span style={stateMark}>✦</span>
      <p style={stateCopy}>{label}</p>
      <Link href="/login?mode=signup" style={button}>Join The Playbook →</Link>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "Published"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatLabel(value: unknown) {
  return String(value || "Community").replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 16 };
const card: React.CSSProperties = { overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 360, background: "rgba(255,255,255,.075)", border: "1px solid rgba(255,255,255,.14)", borderRadius: "28px 8px 28px 8px" };
const media: React.CSSProperties = { position: "relative", minHeight: 220, background: "#102A4A" };
const videoMedia: React.CSSProperties = { width: "100%", maxHeight: 460, background: "#07172D" };
const cardBody: React.CSSProperties = { display: "flex", flex: 1, flexDirection: "column", padding: 24 };
const meta: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 15, color: "#FF9D5C", fontSize: 10, fontWeight: 950, letterSpacing: ".1em", textTransform: "uppercase" };
const cardTitle: React.CSSProperties = { margin: "20px 0 10px", color: "#FFFFFF", fontSize: 27, lineHeight: 1.05 };
const copy: React.CSSProperties = { margin: 0, flex: 1, color: "#C9D8E8", fontSize: 16, lineHeight: 1.65, whiteSpace: "pre-wrap" };
const author: React.CSSProperties = { marginTop: 24, paddingTop: 16, color: "#8FA7C1", borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 12, fontWeight: 800 };
const joinCard: React.CSSProperties = { padding: "clamp(28px,5vw,46px)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 360, color: "#09162A", background: "linear-gradient(145deg,#FFB27B,#FF7A2F)", borderRadius: "8px 28px 8px 28px" };
const eyebrow: React.CSSProperties = { margin: 0, fontSize: 10, fontWeight: 950, letterSpacing: ".15em", textTransform: "uppercase" };
const joinTitle: React.CSSProperties = { margin: "18px 0 12px", fontSize: "clamp(31px,4vw,48px)", lineHeight: .95 };
const joinCopy: React.CSSProperties = { margin: "0 0 24px", lineHeight: 1.6 };
const button: React.CSSProperties = { width: "fit-content", padding: "12px 17px", color: "#FFFFFF", background: "#07172D", borderRadius: 999, fontWeight: 950, textDecoration: "none" };
const stateCard: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "clamp(36px,7vw,74px)", textAlign: "center", background: "rgba(255,255,255,.075)", border: "1px solid rgba(255,255,255,.14)", borderRadius: "30px 8px 30px 8px" };
const stateMark: React.CSSProperties = { display: "block", color: "#FF7A2F", fontSize: 36 };
const stateCopy: React.CSSProperties = { maxWidth: 680, margin: "20px auto 26px", color: "#C9D8E8", fontSize: 18, lineHeight: 1.65 };
