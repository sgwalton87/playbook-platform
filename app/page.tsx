"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setUser(data.session.user);
      setLoading(false);
    };

    load();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>{user?.email}</p>

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}