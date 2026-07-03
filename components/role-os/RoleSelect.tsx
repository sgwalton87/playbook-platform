"use client";

import { supabase } from "@/lib/supabaseClient";
import { roleOptions } from "@/lib/role-os/roleRoutes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoleSelect() {
  const router = useRouter();
  const [saving, setSaving] = useState("");

  async function choose(role: string, href: string) {
    setSaving(role);

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        role,
        updated_at: new Date().toISOString(),
      });
    }

    router.push(href);
  }

  return (
    <main style={{minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"}}>
      <section style={{maxWidth:1100,margin:"0 auto 22px"}}>
        <p style={{fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316"}}>Choose Your Playbook OS</p>
        <h1 style={{fontSize:52,lineHeight:1,color:"#0F172A",margin:"8px 0"}}>Every role gets a unique experience.</h1>
        <p style={{color:"#64748B",fontSize:16,lineHeight:1.6,maxWidth:760}}>
          Select how you support the scholar. Playbook will route you to the right operating system.
        </p>
      </section>

      <section style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
        {roleOptions.map(option => (
          <button
            key={option.role}
            onClick={() => choose(option.role, option.href)}
            style={{textAlign:"left",background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,cursor:"pointer",boxShadow:"0 16px 40px rgba(15,23,42,.06)"}}
          >
            <p style={{fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0}}>{option.role}</p>
            <h2 style={{fontSize:26,color:"#0F172A",margin:"8px 0"}}>{option.label} OS</h2>
            <p style={{fontSize:14,color:"#64748B",lineHeight:1.55}}>{option.description}</p>
            <strong style={{color:"#0F172A"}}>{saving === option.role ? "Saving..." : "Enter →"}</strong>
          </button>
        ))}
      </section>
    </main>
  );
}
