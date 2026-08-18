"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PlaybookCard, PlaybookPage } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type PublicIdentity = {
  id: string;
  username: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
};

type Story = {
  id: string;
  title: string | null;
  body: string;
  imageUrl: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  author: string;
  username: string | null;
  role: string;
};

export default function PublicStoryPage() {
  const params = useParams<{ id: string }>();
  const postId = String(params?.id || "");
  const [story, setStory] = useState<Story | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!postId) { setState("missing"); return; }
      const { data: post, error } = await supabase
        .from("feed_posts")
        .select("id,user_id,title,body,image_url,media_url,media_type,created_at,visibility")
        .eq("id", postId)
        .eq("visibility", "public")
        .maybeSingle();
      if (!active) return;
      if (error) { setState("error"); return; }
      if (!post) { setState("missing"); return; }

      const identityResult = await supabase.rpc("get_public_member_identities", { requested_ids: [post.user_id] });
      if (!active) return;
      if (identityResult.error) { setState("error"); return; }
      const identity = ((identityResult.data || [])[0] || null) as PublicIdentity | null;
      const video = post.media_type === "video";
      setStory({
        id: post.id,
        title: post.title || null,
        body: post.body || "",
        imageUrl: video ? null : (post.image_url || post.media_url || null),
        mediaUrl: video ? post.media_url : null,
        mediaType: post.media_type || (post.image_url ? "image" : null),
        createdAt: post.created_at,
        author: identity ? (identity.full_name || [identity.first_name, identity.last_name].filter(Boolean).join(" ") || identity.username || "Playbook community member") : "Playbook community member",
        username: identity?.username || null,
        role: String(identity?.role || "Community").replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      });
      setState("ready");
    }
    void load();
    return () => { active = false; };
  }, [postId]);

  return (
    <PlaybookPage>
      <div style={shell}>
        <Link href="/public-newsfeed" style={back}>← Public News Feed</Link>
        {state === "loading" && <PlaybookCard eyebrow="Public story" title="Loading story…"><p style={copy}>Retrieving the published Playbook story.</p></PlaybookCard>}
        {state === "missing" && <PlaybookCard eyebrow="Public story" title="This story is not public"><p style={copy}>It may be private, removed, or unavailable. Private Playbook stories are never exposed through shared links.</p></PlaybookCard>}
        {state === "error" && <PlaybookCard eyebrow="Public story" title="Story temporarily unavailable"><p style={copy}>The story could not be loaded. No sample content has been substituted.</p></PlaybookCard>}
        {state === "ready" && story && (
          <PlaybookCard eyebrow={`${story.role} · Published story`} title={story.title || story.author}>
            <div style={authorLine}>
              <strong>{story.author}</strong>
              {story.username && <Link href={`/u/${story.username}`} style={profileLink}>@{story.username}</Link>}
              <time dateTime={story.createdAt} style={meta}>{new Date(story.createdAt).toLocaleString()}</time>
            </div>
            <p style={body}>{story.body}</p>
            {story.imageUrl && <div style={imageWrap}><Image unoptimized fill src={story.imageUrl} alt="Published Playbook story media" style={{ objectFit: "cover" }} /></div>}
            {story.mediaType === "video" && story.mediaUrl && <video controls preload="metadata" src={story.mediaUrl} aria-label="Published Playbook story video" style={video} />}
          </PlaybookCard>
        )}
        <div style={join}><Link href="/login?mode=signup" style={joinLink}>Join The Playbook →</Link></div>
      </div>
    </PlaybookPage>
  );
}

const shell: React.CSSProperties = { maxWidth: 860, margin: "0 auto", padding: "24px 0 50px" };
const back: React.CSSProperties = { display: "inline-block", marginBottom: 18, color: "#EA580C", fontWeight: 900, textDecoration: "none" };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.65 };
const authorLine: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18, color: "#0F172A" };
const profileLink: React.CSSProperties = { color: "#EA580C", fontWeight: 850, textDecoration: "none" };
const meta: React.CSSProperties = { color: "#94A3B8", fontSize: 12 };
const body: React.CSSProperties = { color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" };
const imageWrap: React.CSSProperties = { position: "relative", minHeight: 360, marginTop: 18, borderRadius: 20, overflow: "hidden", background: "#E2E8F0" };
const video: React.CSSProperties = { width: "100%", maxHeight: 620, marginTop: 18, borderRadius: 20, background: "#0F172A" };
const join: React.CSSProperties = { marginTop: 22, textAlign: "center" };
const joinLink: React.CSSProperties = { display: "inline-block", padding: "12px 18px", borderRadius: 999, background: "#0F172A", color: "#FFFFFF", fontWeight: 900, textDecoration: "none" };
