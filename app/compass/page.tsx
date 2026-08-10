"use client";

import CompassCoreCard from "@/components/compass/CompassCoreCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CompassPage() {
  const [courses, setCourses] = useState<LegacyValue[]>([]);
  const [dataState, setDataState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    async function loadRecord() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError) return setDataState("error");
      if (!auth.user) return setDataState("ready");
      const { data, error } = await supabase
        .from("ag_progress")
        .select("subject,subject_name,years_completed,current_course")
        .eq("user_id", auth.user.id);
      if (!active) return;
      if (error) return setDataState("error");
      setCourses((data || []).map((record) => ({
        name: record.current_course || record.subject_name || record.subject,
        subject: record.subject,
        credits: Number(record.years_completed || 0) * 10,
        completed: Number(record.years_completed || 0) > 0,
      })));
      setDataState("ready");
    }
    void loadRecord();
    return () => { active = false; };
  }, []);

  return (
    <>
<main style={{minHeight:"100vh",background:"#F8F7F4",padding:36}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <CompassCoreCard courses={courses} trustScore={0} dataState={dataState} />
      </div>
    </main>
    </>
  );
}
