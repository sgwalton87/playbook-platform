"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Post = {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  role: string;
  time: string;
  content: string;
  pillar: string;
  pillarColor: string;
  likes: number;
  comments: number;
  liked: boolean;
};

const SAMPLE_POSTS: Post[] = [
  {
    id: "1",
    author: "Coach J. Reed",
    initials: "JR",
    avatarColor: "#ff6a2c",
    role: "Founder & ED",
    time: "1 hour ago",
    content:
      "Leadership isn't about being in charge. It's about taking care of those in your charge. Every captain on and off the court knows this. What does leadership mean to you today?",
    pillar: "Leadership",
    pillarColor: "#ff6a2c",
    likes: 24,
    comments: 6,
    liked: false,
  },
  {
    id: "2",
    author: "Stephisha W.",
    initials: "SW",
    avatarColor: "#1D9E75",
    role: "Scholar-Athlete",
    time: "3 hours ago",
    content:
      "Just completed Module 3 of Captain's Mindset. The section on accountability hit different. If you haven't started it yet — run it.",
    pillar: "Leadership",
    pillarColor: "#ff6a2c",
    likes: 18,
    comments: 4,
    liked: true,
  },
  {
    id: "3",
    author: "M. Alvarez",
    initials: "MA",
    avatarColor: "#378ADD",
    role: "Head of Curriculum",
    time: "Yesterday",
    content:
      "New financial literacy module dropping next week: Credit & Debt 101. We built it specifically for athletes thinking about NIL deals. Stay ready.",
    pillar: "Finance",
    pillarColor: "#1D9E75",
    likes: 41,
    comments: 12,
    liked: false,
  },
];

const surface = "#1a1512";
const surface2 = "#241c16";
const ink = "#f6f0e7";
const muted = "#a89a8b";
const faint = "#6f6151";
const line = "#332a22";
const accent = "#ff6a2c";
const onaccent = "#170a04";
const mono = "'Space Mono', monospace";
const anton = "'Anton', sans-serif";

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [filter, setFilter] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState("Scholar");

  const FILTERS = ["All", "Leadership", "Finance", "Civic", "SEL"];

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", data.user.id)
        .single();

      if (profile?.first_name) setUserName(profile.first_name);

      setAuthed(true);
    });
  }, [router]);

  const toggleLike = (id: string) => {
    setPosts((p) =>
      p.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: userName,
      initials: userName.slice(0, 2).toUpperCase(),
      avatarColor: accent,
      role: "Scholar-Athlete",
      time: "Just now",
      content: newPost,
      pillar: "SEL",
      pillarColor: "#D4537E",
      likes: 0,
      comments: 0,
      liked: false,
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  const filtered =
    filter === "All" ? posts : posts.filter((p) => p.pillar === filter);

  if (!authed) {
    return <div style={{ padding: 24 }}>Loading feed...</div>;
  }

  return (
    <AppShell title="Feed">
      <style>{`
        textarea { resize: none; }
        textarea::placeholder { color: ${faint}; }
      `}</style>

      <main
        style={{
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 24,
        }}
      >
        <div>
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: accent,
                marginBottom: 8,
              }}
            >
              The network
            </p>

            <h1
              style={{
                fontFamily: anton,
                fontWeight: 400,
                fontSize: "clamp(32px,4vw,48px)",
                lineHeight: 0.95,
                textTransform: "uppercase",
                color: ink,
                marginBottom: 20,
              }}
            >
              Activity feed
            </h1>

            <div
              style={{
                background: surface,
                border: `1px solid ${line}`,
                borderRadius: 16,
                padding: "16px 18px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: anton,
                    fontSize: 14,
                    color: onaccent,
                    flexShrink: 0,
                  }}
                >
                  {userName.slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something with the network..."
                    rows={3}
                    style={{
                      width: "100%",
                      background: surface2,
                      border: `1px solid ${line}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: ink,
                      fontFamily: "inherit",
                      outline: "none",
                      marginBottom: 10,
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handlePost}
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        background: newPost.trim() ? accent : line,
                        color: newPost.trim() ? onaccent : faint,
                        border: "none",
                        borderRadius: 999,
                        padding: "10px 20px",
                        cursor: newPost.trim() ? "pointer" : "default",
                      }}
                    >
                      Post to feed
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: filter === f ? accent : "transparent",
                    color: filter === f ? onaccent : muted,
                    border: `1px solid ${filter === f ? accent : line}`,
                    borderRadius: 999,
                    padding: "7px 14px",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((post) => (
              <div
                key={post.id}
                style={{
                  background: surface,
                  border: `1px solid ${line}`,
                  borderRadius: 18,
                  padding: "20px 22px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: post.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: anton,
                      fontSize: 16,
                      color: onaccent,
                      flexShrink: 0,
                    }}
                  >
                    {post.initials}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700 }}>
                        {post.author}
                      </span>

                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: post.pillarColor,
                          background: surface2,
                          padding: "2px 7px",
                          borderRadius: 999,
                        }}
                      >
                        {post.pillar}
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: faint,
                        marginTop: 2,
                      }}
                    >
                      {post.role} · {post.time}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: ink,
                    marginBottom: 16,
                  }}
                >
                  {post.content}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    borderTop: `1px solid ${line}`,
                    paddingTop: 14,
                  }}
                >
                  <button
                    onClick={() => toggleLike(post.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: post.liked ? accent : faint,
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: mono,
                      fontWeight: 700,
                    }}
                  >
                    {post.liked ? "♥" : "♡"} {post.likes}
                  </button>

                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: faint,
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: mono,
                      fontWeight: 700,
                    }}
                  >
                    💬 {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: surface,
              border: `1px solid ${line}`,
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: muted,
                marginBottom: 14,
              }}
            >
              Quick links
            </p>

            {[
              { label: "Dashboard", path: "/dashboard" },
              { label: "Courses", path: "/courses" },
              { label: "Mentorship", path: "/mentorship" },
              { label: "Profile", path: "/profile" },
            ].map(({ label, path }) => (
              <button
                key={label}
                onClick={() => router.push(path)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "none",
                  color: muted,
                  cursor: "pointer",
                  padding: "9px 0",
                  borderBottom: `1px solid ${line}`,
                }}
              >
                {label} →
              </button>
            ))}
          </div>
        </aside>
      </main>
    </AppShell>
  );
}