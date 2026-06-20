"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔐 LOGIN
  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getSession();

    setLoading(false);

    if (data.session) {
      router.replace("/dashboard");
    } else {
      setError("Session not ready. Try again.");
    }
  };

  // 🆕 SIGNUP
  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    alert("Check your email to confirm account.");
    setMode("login");
  };

  return (
    <main style={{ padding: 20, maxWidth: 420 }}>
      <h1>{mode === "login" ? "Login" : "Sign Up"}</h1>

      {mode === "signup" && (
        <>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </>
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {mode === "login" ? (
        <button onClick={handleLogin} disabled={loading}>
          Login
        </button>
      ) : (
        <button onClick={handleSignUp} disabled={loading}>
          Sign Up
        </button>
      )}

      <p style={{ marginTop: 10 }}>
        {mode === "login" ? (
          <span onClick={() => setMode("signup")}>
            No account? Sign up
          </span>
        ) : (
          <span onClick={() => setMode("login")}>
            Already have account? Login
          </span>
        )}
      </p>
    </main>
  );
}