"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { addReward } from "@/lib/gamification";
import { computeBadges } from "@/lib/badges";
import { updateStreak } from "@/lib/streak";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<string | null>(null);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) return router.replace("/login");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);

      // 🔥 streak system
      const streak = await updateStreak(user.id);

      // 🎁 daily login reward
      await addReward(user.id, { coins: 10, xp: 20 });

      setToast(`🔥 Streak: ${streak} days (+10 coins)`);

      const newBadges = computeBadges(data);
      setBadges(newBadges);

      setLoading(false);
    };

    load();
  }, []);

  const handleActionReward = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const updated = await addReward(user.id, {
      coins: 25,
      xp: 50,
    });

    const newBadges = computeBadges(updated);
    setBadges(newBadges);

    setToast("+25 coins +50 XP earned!");
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <main style={{ padding: 20 }}>
      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "#000",
          color: "#fff",
          padding: 12,
          borderRadius: 8
        }}>
          {toast}
        </div>
      )}

      <h1>Dashboard</h1>

      <h2>Welcome, {profile?.first_name || "User"} 👋</h2>

      <h3>💰 Coins: {profile?.coin_balance}</h3>
      <h3>⚡ XP: {profile?.xp}</h3>
      <h3>🏆 Level: {profile?.level}</h3>

      <h3>🏅 Badges</h3>
      <div>
        {badges.map((b) => (
          <div key={b}>🏅 {b}</div>
        ))}
      </div>

      <button onClick={handleActionReward}>
        Complete Action (+XP +Coins)
      </button>
    </main>
  );
}