"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CanonicalAuthShell from "@/components/auth/CanonicalAuthShell";

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
      setError(error.message);
      return;
    }

    alert("Password updated successfully!");
    router.push("/login");
  };

  return (
    <CanonicalAuthShell eyebrow="Account security" title="Reset your password." description="Protect your Scholar Record and return to the work that moves your future forward.">
      <h1 style={{fontSize:38,margin:"0 0 10px"}}>Choose a new password</h1>
      <p style={{color:"#b8c8da",lineHeight:1.6}}>Use a strong password you do not use anywhere else.</p>

      <input
        aria-label="New password"
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{width:"100%",margin:"18px 0",padding:"15px 18px",borderRadius:14,border:"1px solid rgba(255,255,255,.24)",background:"rgba(255,255,255,.08)",color:"#fff",fontSize:17}}
      />

      <button onClick={handleUpdatePassword} disabled={loading} style={{width:"100%",padding:"16px 22px",border:0,borderRadius:10,background:"#c2410c",color:"#fff",fontWeight:900,fontSize:17}}>
        Update Password
      </button>

      {error && <p role="alert" style={{ color: "#ffb08c" }}>{error}</p>}
    </CanonicalAuthShell>
  );
}
