"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<LegacyValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      const { data } = await supabase.from("profiles").select("*");

      setUsers(data || []);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) return <div>Loading admin panel...</div>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <h3>Total Users: {users.length}</h3>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Coins</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.role}</td>
              <td>{u.coin_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}