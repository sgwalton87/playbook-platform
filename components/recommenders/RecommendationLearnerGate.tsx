"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { LEARNER_ROLES } from "@/lib/auth/learner-authority";

/** All three canonical learner roles can use recommendation workflows.
 * Server endpoints remain the final enforcement authority.
 */
export default function RecommendationLearnerGate({children}:{children:ReactNode}) {
  const [state,setState]=useState<"checking"|"allowed"|"login"|"restricted">("checking");
  useEffect(()=>{
    let alive=true;
    void (async()=>{
      try {
        const {data:{user},error}=await supabase.auth.getUser();
        if(!alive)return;
        if(error||!user){setState("login");return;}
        const profile=await supabase.from("profiles")
          .select("role,profile_mode,onboarding_completed")
          .eq("id",user.id).maybeSingle();
        if(!alive)return;
        const role=profile.data?.profile_mode??profile.data?.role;
        setState(!profile.error && profile.data?.onboarding_completed &&
          LEARNER_ROLES.some(allowed=>allowed===role)?"allowed":"restricted");
      }catch{if(alive)setState("restricted");}
    })();
    return ()=>{alive=false;};
  },[]);
  if(state==="allowed")return <>{children}</>;
  return <main style={{maxWidth:640,margin:"64px auto",padding:28,borderRadius:20,
    background:"#15120c",color:"#f5e6bf",border:"1px solid #a88742"}}>
    <p style={{letterSpacing:2,fontSize:12}}>THE PLAYBOOK · RECOMMENDATIONS</p>
    <h1>{state==="checking"?"Verifying your account…":state==="login"?"Sign in to continue":"Learner access required"}</h1>
    <p>{state==="restricted"?"This workspace requires a completed Scholar, Scholar-Athlete, or Transition-Aged Youth account.":"Recommendation letters are available only after your account is verified."}</p>
    {state==="login"&&<Link href="/login" style={{color:"#f1ce7d"}}>Sign in</Link>}
    {state==="restricted"&&<Link href="/dashboard" style={{color:"#f1ce7d"}}>Return to dashboard</Link>}
  </main>;
}
