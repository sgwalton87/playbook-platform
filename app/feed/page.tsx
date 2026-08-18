"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { FEED_PAGE_SIZE, appendUniqueFeedRows, chunkFeedIds, cursorFromLast, type FeedCursor } from "@/lib/feed/pagination";
import { supabase } from "@/lib/supabaseClient";

const CATEGORIES = ["All", "Leadership", "Finance", "Civic", "SEL", "College", "NIL", "Community"] as const;
type Category = (typeof CATEGORIES)[number];
type PendingMediaKind = "image" | "video" | null;
type TimelineVisibility = "public" | "private";

type PublicIdentity = {
  id: string;
  username: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: string;
};

type RawFeedPost = {
  id: string;
  user_id: string;
  post_type: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  visibility: string | null;
};

type FeedPost = {
  id: string;
  userId: string;
  author: string;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  title: string | null;
  body: string;
  imageUrl: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  visibility: TimelineVisibility;
  createdAt: string;
  category: Category;
  likes: number;
  liked: boolean;
  comments: Comment[];
};

function displayName(identity: Partial<PublicIdentity>) {
  return identity.full_name || [identity.first_name, identity.last_name].filter(Boolean).join(" ") || identity.username || "Playbook member";
}

function label(value: unknown) {
  return String(value || "Community").replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryFromPostType(value: unknown): Category {
  const normalized = String(value || "").trim().toLowerCase();
  const mapping: Record<string, Category> = {
    leadership: "Leadership",
    finance: "Finance",
    civic: "Civic",
    sel: "SEL",
    college: "College",
    nil: "NIL",
    community: "Community",
  };
  return mapping[normalized] || "Community";
}

function detectMediaKind(file: File | null): PendingMediaKind {
  if (!file) return null;
  if (["image/png", "image/jpeg", "image/webp"].includes(file.type)) return "image";
  if (["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) return "video";
  return null;
}

async function fetchFeedPage(cursor: FeedCursor | null) {
  const result = await supabase.rpc("get_feed_page", {
    p_cursor_created_at: cursor?.createdAt || null,
    p_cursor_id: cursor?.id || null,
    p_page_size: FEED_PAGE_SIZE,
  });
  if (result.error) throw new Error(result.error.message);
  return (result.data || []) as RawFeedPost[];
}

async function resolveIdentities(ids: Array<string | null | undefined>) {
  const identities = new Map<string, PublicIdentity>();
  for (const requestedIds of chunkFeedIds(ids)) {
    const result = await supabase.rpc("get_public_member_identities", { requested_ids: requestedIds });
    if (result.error) throw new Error(result.error.message);
    for (const identity of (result.data || []) as PublicIdentity[]) identities.set(identity.id, identity);
  }
  return identities;
}

async function hydrateFeedRows(rows: RawFeedPost[], viewerId: string, ownIdentity: PublicIdentity) {
  if (rows.length === 0) return [] as FeedPost[];
  const postIds = rows.map((post) => post.id);
  const [reactionResult, commentResult] = await Promise.all([
    supabase.from("feed_post_reactions").select("id,post_id,user_id,reaction").in("post_id", postIds),
    supabase.from("feed_post_comments").select("id,post_id,user_id,body,created_at").in("post_id", postIds).order("created_at", { ascending: true }),
  ]);
  if (reactionResult.error) throw new Error(reactionResult.error.message);
  if (commentResult.error) throw new Error(commentResult.error.message);

  const comments = commentResult.data || [];
  const identities = await resolveIdentities([
    ...rows.map((post) => post.user_id),
    ...comments.map((comment) => comment.user_id),
  ]);
  identities.set(viewerId, ownIdentity);

  const reactionsByPost = new Map<string, { count: number; liked: boolean }>();
  for (const reaction of reactionResult.data || []) {
    const current = reactionsByPost.get(reaction.post_id) || { count: 0, liked: false };
    current.count += 1;
    if (reaction.user_id === viewerId && reaction.reaction === "like") current.liked = true;
    reactionsByPost.set(reaction.post_id, current);
  }

  const commentsByPost = new Map<string, Comment[]>();
  for (const comment of comments) {
    const identity = identities.get(comment.user_id);
    const normalized: Comment = {
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      body: comment.body,
      created_at: comment.created_at,
      author: identity ? displayName(identity) : "Playbook member",
    };
    commentsByPost.set(comment.post_id, [...(commentsByPost.get(comment.post_id) || []), normalized]);
  }

  return rows.map((post): FeedPost => {
    const identity = identities.get(post.user_id);
    const reaction = reactionsByPost.get(post.id) || { count: 0, liked: false };
    const video = post.media_type === "video";
    return {
      id: post.id,
      userId: post.user_id,
      author: identity ? displayName(identity) : "Playbook member",
      username: identity?.username || null,
      avatarUrl: identity?.avatar_url || null,
      role: label(identity?.role),
      title: post.title || null,
      body: post.body || "",
      imageUrl: video ? null : (post.image_url || post.media_url || null),
      mediaUrl: video ? post.media_url : null,
      mediaType: post.media_type || (post.image_url ? "image" : null),
      visibility: post.visibility === "private" ? "private" : "public",
      createdAt: post.created_at,
      category: categoryFromPostType(post.post_type),
      likes: reaction.count,
      liked: reaction.liked,
      comments: commentsByPost.get(post.id) || [],
    };
  });
}

export default function FeedPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const feedSentinelRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userIdentity, setUserIdentity] = useState<PublicIdentity | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [tab, setTab] = useState<"feed" | "gallery">("feed");
  const [filter, setFilter] = useState<Category>("All");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("Community");
  const [visibility, setVisibility] = useState<TimelineVisibility>("public");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingMediaKind, setPendingMediaKind] = useState<PendingMediaKind>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [postEditBody, setPostEditBody] = useState("");
  const [postEditCategory, setPostEditCategory] = useState<Category>("Community");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading published Playbook stories…");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      router.replace("/login?next=/feed");
      return;
    }
    setUserId(user.id);

    const [profileResult, rows] = await Promise.all([
      supabase.from("profiles").select("id,username,full_name,first_name,last_name,role,avatar_url").eq("id", user.id).single(),
      fetchFeedPage(null),
    ]);
    if (profileResult.error) throw new Error(profileResult.error.message);

    const ownIdentity: PublicIdentity = {
      id: profileResult.data.id,
      username: profileResult.data.username,
      full_name: profileResult.data.full_name,
      first_name: profileResult.data.first_name,
      last_name: profileResult.data.last_name,
      role: profileResult.data.role,
      avatar_url: profileResult.data.avatar_url,
    };
    setUserIdentity(ownIdentity);

    const hydrated = await hydrateFeedRows(rows, user.id, ownIdentity);
    setPosts(hydrated);
    setHasMore(rows.length === FEED_PAGE_SIZE);

    const prefix = `${user.id}/gallery`;
    const galleryResult = await supabase.storage.from("photos").list(prefix, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (!galleryResult.error) {
      setGallery((galleryResult.data || []).filter((file) => file.name !== ".emptyFolderPlaceholder").map((file) => supabase.storage.from("photos").getPublicUrl(`${prefix}/${file.name}`).data.publicUrl));
    }

    setMessage(rows.length ? "Your timeline is current." : "No stories yet. Publish the first one.");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const id = window.setTimeout(() => { void load().catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Feed could not be loaded.");
      setLoading(false);
    }); }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !userId || !userIdentity || posts.length === 0) return;
    setLoadingMore(true);
    setError("");
    try {
      const cursor = cursorFromLast(posts);
      if (!cursor) return;
      const rows = await fetchFeedPage(cursor);
      const hydrated = await hydrateFeedRows(rows, userId, userIdentity);
      setPosts((current) => appendUniqueFeedRows(current, hydrated));
      setHasMore(rows.length === FEED_PAGE_SIZE);
      setMessage(rows.length ? "More stories loaded." : "You reached the end of the timeline.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "More stories could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, posts, userId, userIdentity]);

  useEffect(() => {
    const sentinel = feedSentinelRef.current;
    if (!sentinel || tab !== "feed" || !hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMore();
    }, { rootMargin: "320px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loading, loadingMore, tab]);

  function clearPendingMedia() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setPendingMediaKind(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function changeVisibility(next: TimelineVisibility) {
    if (next === "private" && pendingFile) {
      clearPendingMedia();
      setMessage("Only me stories are text-only until private media storage is available. Your selected media was removed.");
    }
    setVisibility(next);
    setError("");
  }

  function selectMedia(file: File | null) {
    if (visibility === "private") {
      setError("Only me stories are text-only. Switch to Public to attach an image or video.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (!file) return clearPendingMedia();
    const kind = detectMediaKind(file);
    if (!kind) {
      setError("Choose a JPEG, PNG, WebP, MP4, WebM, or QuickTime file.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const maxBytes = kind === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(kind === "video" ? "Video must be 50 MiB or smaller." : "Image must be 10 MiB or smaller.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setError("");
    setPendingFile(file);
    setPendingMediaKind(kind);
    setPendingPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto(file: File, folder: "feed" | "gallery") {
    if (!userId) return null;
    const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
    const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) || "photo";
    const path = `${userId}/${folder}/${Date.now()}-${stem}.${ext}`;
    const upload = await supabase.storage.from("photos").upload(path, file, { cacheControl: "3600", upsert: false });
    if (upload.error) throw new Error(upload.error.message);
    return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
  }

  async function uploadVideo(file: File) {
    if (!userId) return null;
    const ext = (file.name.split(".").pop() || "mp4").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "mp4";
    const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) || "video";
    const path = `${userId}/feed/${Date.now()}-${stem}.${ext}`;
    const upload = await supabase.storage.from("feed-videos").upload(path, file, { cacheControl: "3600", upsert: false });
    if (upload.error) throw new Error(upload.error.message);
    return supabase.storage.from("feed-videos").getPublicUrl(path).data.publicUrl;
  }

  async function publish() {
    if (!userId || (!body.trim() && !pendingFile)) return;
    if (visibility === "private" && pendingFile) {
      setError("Only me stories cannot attach public-bucket media.");
      return;
    }
    setBusy("publish"); setError("");
    try {
      const isVideo = visibility === "public" && pendingFile && pendingMediaKind === "video";
      const imageUrl = visibility === "public" && pendingFile && pendingMediaKind === "image" ? await uploadPhoto(pendingFile, "feed") : null;
      const videoUrl = isVideo && pendingFile ? await uploadVideo(pendingFile) : null;
      const result = await supabase.from("feed_posts").insert({
        user_id: userId,
        post_type: category.toLowerCase(),
        body: body.trim(),
        image_url: imageUrl,
        media_url: videoUrl,
        media_type: isVideo ? "video" : (imageUrl ? "image" : null),
        visibility,
      });
      if (result.error) throw new Error(result.error.message);
      const publishedVisibility = visibility;
      setBody(""); clearPendingMedia(); setCategory("Community"); setVisibility("public");
      await load();
      setMessage(publishedVisibility === "private" ? "Story saved to your private timeline." : (isVideo ? "Video story published to the public Playbook feed." : "Story published to the public Playbook feed."));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Story could not be published."); }
    finally { setBusy(null); }
  }

  async function uploadGallery(file?: File) {
    if (!file || !userId) return;
    setBusy("gallery"); setError("");
    try {
      const url = await uploadPhoto(file, "gallery");
      const result = await supabase.from("feed_posts").insert({ user_id: userId, post_type: "community", body: "", image_url: url, media_type: "image", visibility: "public" });
      if (result.error) throw new Error(result.error.message);
      await load(); setMessage("Gallery photo published.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Gallery photo could not be published."); }
    finally { setBusy(null); }
  }

  async function toggleLike(post: FeedPost) {
    setBusy(post.id); setError("");
    try {
      const response = await fetch("/api/social/reactions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId: post.id, reaction: "like" }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Reaction failed.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Reaction failed."); }
    finally { setBusy(null); }
  }

  async function sharePost(post: FeedPost) {
    if (post.visibility !== "public") return;
    const busyKey = `share:${post.id}`;
    setBusy(busyKey); setError("");
    const url = `${window.location.origin}/story/${post.id}`;
    let channel: "native" | "copy_link" | null = null;
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: post.title || "Playbook story", text: post.body.slice(0, 240), url });
          channel = "native";
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === "AbortError") return;
          throw cause;
        }
      } else {
        await navigator.clipboard.writeText(url);
        channel = "copy_link";
      }
      const response = await fetch("/api/social/shares", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId: post.id, channel }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Share completed, but Playbook could not record it.");
      setMessage(channel === "native" ? "Story shared." : "Story link copied.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Story could not be shared."); }
    finally { setBusy(null); }
  }

  function beginPostEdit(post: FeedPost) {
    setEditingPost(post.id);
    setPostEditBody(post.body);
    setPostEditCategory(post.category);
    setError("");
  }

  function cancelPostEdit() {
    setEditingPost(null);
    setPostEditBody("");
    setPostEditCategory("Community");
  }

  async function savePostEdit(post: FeedPost) {
    if (post.userId !== userId) return;
    const busyKey = `edit:${post.id}`;
    setBusy(busyKey); setError("");
    try {
      const response = await fetch("/api/social/posts", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: post.id, body: postEditBody, category: postEditCategory.toLowerCase() }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Story edit failed.");
      cancelPostEdit();
      await load();
      setMessage("Story updated.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Story edit failed."); }
    finally { setBusy(null); }
  }

  async function deletePost(post: FeedPost) {
    if (post.userId !== userId) return;
    const confirmed = window.confirm("Delete this story permanently? Comments, reactions, and share records tied to it will also be removed.");
    if (!confirmed) return;
    const busyKey = `delete:${post.id}`;
    setBusy(busyKey); setError("");
    try {
      const response = await fetch("/api/social/posts", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId: post.id }) });
      const result = await response.json() as { error?: string; warning?: string | null };
      if (!response.ok) throw new Error(result.error || "Story delete failed.");
      if (editingPost === post.id) cancelPostEdit();
      await load();
      if (result.warning) setError(result.warning);
      else setMessage("Story deleted.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Story delete failed."); }
    finally { setBusy(null); }
  }

  async function addComment(postId: string) {
    const draft = (commentDrafts[postId] || "").trim();
    if (!draft) return;
    setBusy(postId); setError("");
    try {
      const response = await fetch("/api/social/comments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId, body: draft }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Comment failed.");
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Comment failed."); }
    finally { setBusy(null); }
  }

  async function saveComment(comment: Comment) {
    const next = editDraft.trim(); if (!next) return;
    setBusy(comment.id); setError("");
    try {
      const response = await fetch("/api/social/comments", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ commentId: comment.id, body: next }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Comment update failed.");
      setEditingComment(null); setEditDraft(""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Comment update failed."); }
    finally { setBusy(null); }
  }

  async function deleteComment(comment: Comment) {
    setBusy(comment.id); setError("");
    try {
      const response = await fetch("/api/social/comments", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ commentId: comment.id }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Comment delete failed.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Comment delete failed."); }
    finally { setBusy(null); }
  }

  const visible = useMemo(() => filter === "All" ? posts : posts.filter((post) => post.category === filter), [filter, posts]);

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Community Newsfeed" title="Show the work. Share the win. Build the next connection." subtitle="Public stories use presentation-grade identity only. Private records, support conversations, and unpublished progress remain outside the public feed." />
      <PlaybookMetrics>
        <PlaybookMetric label="Timeline stories" value={String(posts.length)} />
        <PlaybookMetric label="Your gallery" value={String(gallery.length)} />
        <PlaybookMetric label="Categories" value="7" />
      </PlaybookMetrics>
      <div role="status" aria-live="polite" style={status}>{loading ? "Loading…" : message}</div>
      {error && <div role="alert" style={alert}>{error} <button onClick={() => void load()}>Retry</button></div>}

      <section style={tabRow} aria-label="Feed views">
        <button onClick={() => setTab("feed")} aria-pressed={tab === "feed"} style={tab === "feed" ? activeTab : tabButton}>Feed</button>
        <button onClick={() => setTab("gallery")} aria-pressed={tab === "gallery"} style={tab === "gallery" ? activeTab : tabButton}>Gallery</button>
      </section>

      {tab === "gallery" ? (
        <>
          <PlaybookCard eyebrow="Your public gallery" title="Photos you intentionally published">
            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy !== null} onChange={(event) => void uploadGallery(event.target.files?.[0])} />
          </PlaybookCard>
          {gallery.length === 0 ? <PlaybookCard eyebrow="Gallery" title="No gallery photos yet"><p style={copy}>Upload the first photo you want visible in your public Playbook story.</p></PlaybookCard> :
            <div style={galleryGrid}>{gallery.map((src) => <div key={src} style={galleryTile}><Image unoptimized fill src={src} alt="Published Playbook gallery item" style={{ objectFit: "cover" }} /></div>)}</div>}
        </>
      ) : (
        <>
          <PlaybookCard eyebrow="Publish" title={`What are you building${userIdentity ? `, ${userIdentity.first_name || "Scholar"}` : ""}?`}>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="Share progress, a milestone, a lesson, or a public opportunity update." style={composer} />
            <div style={composerControls}>
              <select value={category} onChange={(event) => setCategory(event.target.value as Category)} style={select} aria-label="Story category">
                {CATEGORIES.filter((value) => value !== "All").map((value) => <option key={value}>{value}</option>)}
              </select>
              <select value={visibility} onChange={(event) => changeVisibility(event.target.value as TimelineVisibility)} style={select} aria-label="Story visibility">
                <option value="public">Public</option>
                <option value="private">Only me</option>
              </select>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" aria-label="Add an image or video" disabled={visibility === "private"} onChange={(event) => selectMedia(event.target.files?.[0] || null)} />
              {pendingFile && <button type="button" onClick={clearPendingMedia} style={secondaryButton}>Remove media</button>}
              <button onClick={() => void publish()} disabled={busy !== null || (!body.trim() && !pendingFile)} style={primaryButton}>{busy === "publish" ? "Publishing…" : (visibility === "private" ? "Save only for me" : "Publish story")}</button>
            </div>
            {visibility === "private" && <p style={privacyNote}>Only me stories stay off the public feed. Media is disabled because current Feed media buckets are intentionally public.</p>}
            {pendingPreview && pendingMediaKind === "image" && <div style={preview}><Image unoptimized fill src={pendingPreview} alt="Selected upload preview" style={{ objectFit: "cover" }} /></div>}
            {pendingPreview && pendingMediaKind === "video" && <video controls preload="metadata" src={pendingPreview} aria-label="Selected video preview" style={videoPreview} />}
          </PlaybookCard>

          <section style={filterRow} aria-label="Filter stories">
            {CATEGORIES.map((value) => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} style={filter === value ? activeFilter : filterButton}>{value}</button>)}
          </section>

          {!loading && visible.length === 0 ? <PlaybookCard eyebrow="Feed" title="No stories in this category yet"><p style={copy}>Choose another category or publish the first story here.</p></PlaybookCard> :
            <PlaybookGrid min={330}>
              {visible.map((post) => (
                <PlaybookCard key={post.id} eyebrow={`${post.category} · ${post.role}${post.visibility === "private" ? " · Only me" : ""}`} title={post.title || post.author}>
                  <div style={authorRow}>
                    <div style={avatar}>{post.avatarUrl ? <Image unoptimized width={48} height={48} src={post.avatarUrl} alt="" style={avatarImage} /> : post.author.slice(0, 1).toUpperCase()}</div>
                    <div><strong style={{ color: "#0F172A" }}>{post.author}</strong>{post.username && <div><Link href={`/u/${post.username}`} style={profileLink}>@{post.username}</Link></div>}<small style={meta}>{new Date(post.createdAt).toLocaleString()}</small></div>
                  </div>

                  {editingPost === post.id ? (
                    <div style={postEditBox}>
                      <textarea value={postEditBody} onChange={(event) => setPostEditBody(event.target.value)} maxLength={4000} aria-label="Edit story text" style={composer} />
                      <div style={actions}>
                        <select value={postEditCategory} onChange={(event) => setPostEditCategory(event.target.value as Category)} aria-label="Edit story category" style={select}>
                          {CATEGORIES.filter((value) => value !== "All").map((value) => <option key={value}>{value}</option>)}
                        </select>
                        <button onClick={() => void savePostEdit(post)} disabled={busy === `edit:${post.id}`} style={primaryButton}>{busy === `edit:${post.id}` ? "Saving…" : "Save changes"}</button>
                        <button onClick={cancelPostEdit} disabled={busy === `edit:${post.id}`} style={secondaryButton}>Cancel</button>
                      </div>
                      <p style={privacyNote}>Edit changes story text and category only. Existing visibility and media stay unchanged.</p>
                    </div>
                  ) : <p style={postBody}>{post.body}</p>}

                  {post.imageUrl && <div style={postMedia}><Image unoptimized fill src={post.imageUrl} alt="Published story media" style={{ objectFit: "cover" }} /></div>}
                  {post.mediaType === "video" && post.mediaUrl && <video controls preload="metadata" src={post.mediaUrl} aria-label="Published Playbook story video" style={publishedVideo} />}

                  <div style={actions}>
                    <button disabled={busy === post.id} onClick={() => void toggleLike(post)} style={post.liked ? likedButton : secondaryButton}>{post.liked ? "♥" : "♡"} {post.likes}</button>
                    <PlaybookPill>{post.comments.length} comments</PlaybookPill>
                    {post.visibility === "public" && <button disabled={busy === `share:${post.id}`} onClick={() => void sharePost(post)} style={secondaryButton}>{busy === `share:${post.id}` ? "Sharing…" : "Share"}</button>}
                    {post.userId === userId && editingPost !== post.id && <button onClick={() => beginPostEdit(post)} disabled={busy !== null} style={textButton}>Edit post</button>}
                    {post.userId === userId && <button onClick={() => void deletePost(post)} disabled={busy === `delete:${post.id}`} style={dangerButton}>{busy === `delete:${post.id}` ? "Deleting…" : "Delete post"}</button>}
                  </div>

                  <div style={comments}>
                    {post.comments.map((comment) => <article key={comment.id} style={commentCard}>
                      <strong>{comment.author}</strong>
                      {editingComment === comment.id ? <>
                        <textarea value={editDraft} onChange={(event) => setEditDraft(event.target.value)} maxLength={4000} style={commentInput} />
                        <div style={actions}><button onClick={() => void saveComment(comment)} disabled={busy === comment.id} style={primaryButton}>Save</button><button onClick={() => { setEditingComment(null); setEditDraft(""); }} style={secondaryButton}>Cancel</button></div>
                      </> : <p style={commentText}>{comment.body}</p>}
                      {comment.user_id === userId && editingComment !== comment.id && <div style={actions}><button onClick={() => { setEditingComment(comment.id); setEditDraft(comment.body); }} style={textButton}>Edit</button><button onClick={() => void deleteComment(comment)} disabled={busy === comment.id} style={textButton}>Delete</button></div>}
                    </article>)}
                    <div style={commentComposer}>
                      <input value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={4000} placeholder="Write a comment" style={commentInput} />
                      <button disabled={busy === post.id || !(commentDrafts[post.id] || "").trim()} onClick={() => void addComment(post.id)} style={primaryButton}>Comment</button>
                    </div>
                  </div>
                </PlaybookCard>
              ))}
            </PlaybookGrid>}
          <div ref={feedSentinelRef} aria-hidden="true" style={sentinel} />
          {!loading && posts.length > 0 && <div role="status" aria-live="polite" style={paginationStatus}>{loadingMore ? "Loading more stories…" : hasMore ? "More stories will load as you continue." : "You reached the end of the timeline."}</div>}
        </>
      )}
    </PlaybookPage>
  );
}

const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 12px", color: "#334155" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", padding: 12, border: "1px solid #FCA5A5", borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const tabRow: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", display: "flex", gap: 8 };
const tabButton: React.CSSProperties = { border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", borderRadius: 999, padding: "10px 16px", fontWeight: 900, cursor: "pointer" };
const activeTab: React.CSSProperties = { ...tabButton, background: "#0F172A", color: "#FFFFFF" };
const composer: React.CSSProperties = { width: "100%", minHeight: 120, resize: "vertical", border: "1px solid #CBD5E1", borderRadius: 14, padding: 14, color: "#0F172A", background: "#F8FAFC" };
const composerControls: React.CSSProperties = { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" };
const select: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 12, padding: "10px 12px", background: "#FFFFFF", color: "#0F172A" };
const privacyNote: React.CSSProperties = { margin: "12px 0 0", padding: 12, borderRadius: 12, background: "#F8FAFC", color: "#475569", lineHeight: 1.5 };
const preview: React.CSSProperties = { position: "relative", marginTop: 14, minHeight: 220, borderRadius: 18, overflow: "hidden", background: "#E2E8F0" };
const videoPreview: React.CSSProperties = { width: "100%", maxHeight: 420, marginTop: 14, borderRadius: 18, background: "#0F172A" };
const filterRow: React.CSSProperties = { maxWidth: 1180, margin: "18px auto", display: "flex", gap: 8, flexWrap: "wrap" };
const filterButton: React.CSSProperties = { ...tabButton, padding: "8px 12px", fontSize: 12 };
const activeFilter: React.CSSProperties = { ...filterButton, background: "#F97316", color: "#FFFFFF", borderColor: "#F97316" };
const authorRow: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", marginBottom: 14 };
const avatar: React.CSSProperties = { width: 48, height: 48, borderRadius: 16, display: "grid", placeItems: "center", overflow: "hidden", background: "#0F172A", color: "#F97316", fontWeight: 950 };
const avatarImage: React.CSSProperties = { width: 48, height: 48, objectFit: "cover" };
const profileLink: React.CSSProperties = { color: "#EA580C", textDecoration: "none", fontWeight: 850, fontSize: 12 };
const meta: React.CSSProperties = { color: "#94A3B8" };
const postBody: React.CSSProperties = { color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap" };
const postEditBox: React.CSSProperties = { margin: "10px 0 4px", padding: 12, borderRadius: 14, border: "1px solid #CBD5E1", background: "#F8FAFC" };
const postMedia: React.CSSProperties = { position: "relative", minHeight: 260, borderRadius: 18, overflow: "hidden", margin: "14px 0", background: "#E2E8F0" };
const publishedVideo: React.CSSProperties = { width: "100%", maxHeight: 520, borderRadius: 18, margin: "14px 0", background: "#0F172A" };
const actions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "9px 13px", fontWeight: 900, cursor: "pointer" };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFFFFF" };
const secondaryButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" };
const likedButton: React.CSSProperties = { ...secondaryButton, borderColor: "#FDBA74", background: "#FFF7ED", color: "#C2410C" };
const textButton: React.CSSProperties = { border: 0, background: "transparent", color: "#EA580C", fontWeight: 850, cursor: "pointer", padding: 0 };
const dangerButton: React.CSSProperties = { ...baseButton, border: "1px solid #FCA5A5", background: "#FFF1F2", color: "#B91C1C" };
const comments: React.CSSProperties = { marginTop: 16, paddingTop: 12, borderTop: "1px solid #E2E8F0" };
const commentCard: React.CSSProperties = { marginBottom: 10, padding: 12, borderRadius: 12, background: "#F8FAFC", color: "#0F172A" };
const commentText: React.CSSProperties = { margin: "6px 0 0", color: "#475569", lineHeight: 1.5 };
const commentComposer: React.CSSProperties = { display: "flex", gap: 8, marginTop: 12, alignItems: "center" };
const commentInput: React.CSSProperties = { flex: 1, minWidth: 0, border: "1px solid #CBD5E1", borderRadius: 12, padding: "10px 12px", background: "#FFFFFF", color: "#0F172A" };
const galleryGrid: React.CSSProperties = { maxWidth: 1180, margin: "18px auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 };
const galleryTile: React.CSSProperties = { position: "relative", minHeight: 240, borderRadius: 20, overflow: "hidden", background: "#E2E8F0" };
const sentinel: React.CSSProperties = { height: 1, maxWidth: 1180, margin: "0 auto" };
const paginationStatus: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 0", textAlign: "center", color: "#64748B", fontSize: 13, fontWeight: 750 };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
