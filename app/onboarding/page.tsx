"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");

  // 🔐 Check auth session
  useEffect(() => {
    async function checkUser() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  // 🚀 FULL HANDLE SUBMIT (VALIDATED + SAFE + PRODUCTION READY)
  async function handleSubmit() {
    setSubmitting(true);

    try {
      // 🔒 Get current user
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // 🧠 FRONTEND VALIDATION
      if (!username.trim()) {
        alert("Username is required");
        setSubmitting(false);
        return;
      }

      if (username.trim().length < 3) {
        alert("Username must be at least 3 characters");
        setSubmitting(false);
        return;
      }

      if (!fullName.trim()) {
        alert("Full name is required");
        setSubmitting(false);
        return;
      }

      // 🧼 CLEAN INPUTS
      const cleanUsername = username.toLowerCase().trim();
      const cleanFullName = fullName.trim();

      // 💾 UPDATE PROFILE
      const { error } = await supabase
        .from("profiles")
        .update({
          username: cleanUsername,
          full_name: cleanFullName,
          role,
          onboarding_complete: true,
        })
        .eq("id", user.id);

      // 🚨 HANDLE DB ERRORS
      if (error) {
        if (error.message.includes("duplicate")) {
          alert("That username is already taken. Try another one.");
        } else {
          console.error(error);
          alert("Something went wrong saving your profile.");
        }

        setSubmitting(false);
        return;
      }

      // 🎯 SUCCESS → DASHBOARD
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
      setSubmitting(false);
    }
  }

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading onboarding...
      </div>
    );
  }

  // 🧩 UI
  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h1>Complete your profile</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Finish onboarding"}
        </button>
      </div>
    </div>
  );
}