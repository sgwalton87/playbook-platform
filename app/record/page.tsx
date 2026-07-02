"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CreateAchievementForm from "@/components/playbook-record/CreateAchievementForm";

export default function RecordPage() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setProfileId(data.user?.id || null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <main style={{padding:40}}>Loading...</main>;

  if (!profileId) {
    return (
      <main style={{padding:40}}>
        <h1>Sign in required</h1>
        <p>You must be signed in to update your Playbook Record.</p>
      </main>
    );
  }

  return (
    <main style={{minHeight:"100vh",background:"#F8F7F4",padding:"36px",fontFamily:"system-ui, sans-serif"}}>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <CreateAchievementForm profileId={profileId} />
      </div>
    </main>
  );
}
