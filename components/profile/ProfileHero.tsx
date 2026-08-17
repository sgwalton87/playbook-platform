"use client";

import { useEffect, useState } from "react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { supabase } from "@/lib/supabaseClient";

const T={
  navy:"#0F172A",
  cream:"#F8F7F4",
  surface:"#FFFFFF",
  line:"#E2E8F0",
  muted:"#64748B",
  orange:"#F97316",
  orangeL:"#FFF7ED",
  purple:"#8B5CF6",
  mono:"'Space Mono', monospace",
  sans:"'Hanken Grotesk', system-ui, sans-serif",
  anton:"'Anton', sans-serif"
};

type Props={
  profile:LegacyValue;
  router:LegacyValue;
};

export default function ProfileHero({profile,router}:Props){
  const [isOwner,setIsOwner]=useState(false);

  useEffect(()=>{
    let active=true;
    void supabase.auth.getUser().then(({data})=>{
      if(active)setIsOwner(Boolean(data.user?.id&&data.user.id===profile?.id));
    });
    return()=>{active=false;};
  },[profile?.id]);

  return(
    <div
      style={{
        background:T.surface,
        border:`1px solid ${T.line}`,
        borderRadius:20,
        padding:"24px 28px",
        marginBottom:14,
        display:"flex",
        alignItems:"center",
        gap:20,
        flexWrap:"wrap",
        position:"relative",
        overflow:"hidden"
      }}
    >
      <div
        style={{
          position:"absolute",
          top:0,
          right:0,
          width:200,
          height:"100%",
          background:`linear-gradient(90deg,transparent,${T.orangeL})`,
          pointerEvents:"none"
        }}
      />

      <div
        style={{
          padding:4,
          borderRadius:"50%",
          background:`linear-gradient(135deg,${T.orange},${T.purple})`,
          boxShadow:"0 14px 35px rgba(15,23,42,.18)"
        }}
      >
        <ProfileAvatar
          src={profile?.avatar_url}
          name={profile?.full_name||profile?.username||"Scholar"}
          size={112}
        />
      </div>

      <div style={{flex:1}}>
        <h2
          style={{
            fontFamily:T.anton,
            fontWeight:400,
            fontSize:32,
            textTransform:"uppercase",
            color:T.navy,
            lineHeight:1,
            marginBottom:6
          }}
        >
          {profile?.full_name||profile?.username||"Scholar"}
        </h2>

        <p
          style={{
            fontFamily:T.mono,
            fontSize:11,
            color:T.orange,
            marginBottom:4
          }}
        >
          @{profile?.username}
        </p>

        <p
          style={{
            fontSize:13,
            color:T.muted
          }}
        >
          {[profile?.school,profile?.sport].filter(Boolean).join(" · ")||"Public Scholar profile"}
        </p>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",position:"relative",zIndex:1}}>
        {isOwner&&<>
          <button onClick={()=>router.push("/profile")} style={actionButton}>Edit profile</button>
          <button onClick={()=>router.push("/profile/privacy")} style={privacyButton}>Privacy settings</button>
        </>}
        <button onClick={()=>router.push("/dashboard")} style={actionButton}>← Dashboard</button>
      </div>
    </div>
  );
}

const actionButton:React.CSSProperties={
  fontFamily:T.mono,
  fontSize:11,
  fontWeight:700,
  letterSpacing:"0.05em",
  textTransform:"uppercase",
  background:"transparent",
  border:`1.5px solid ${T.line}`,
  color:T.muted,
  borderRadius:999,
  padding:"9px 16px",
  cursor:"pointer"
};

const privacyButton:React.CSSProperties={
  ...actionButton,
  background:T.orangeL,
  borderColor:"#FED7AA",
  color:"#9A3412"
};
