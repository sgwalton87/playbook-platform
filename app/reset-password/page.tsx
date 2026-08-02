"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { reportClientFailure } from "@/lib/observability/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePassword = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      reportClientFailure("client_error", "RecoveryFailure");
      setError(error.message);
      return;
    }

    alert("Password updated successfully!");
    router.push("/login");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleUpdatePassword} disabled={loading}>
        Update Password
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
