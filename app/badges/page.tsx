"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BadgesPage() {
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();

if (!data.user) {
  return;
}

const { data: profile } = await supabase
  .from("profiles")
  .select("badges")
  .eq("id", data.user.id)
  .single();

      setBadges(profile?.badges || []);
    };

    load();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>🏆 Badge Vault</h1>

      {badges.map((b) => (
        <div
          key={b}
          style={{
            padding: 12,
            margin: 8,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          🏅 {b}
        </div>
      ))}
    </main>
  );
}