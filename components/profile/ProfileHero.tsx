"use client";

import ProfileAvatar from "@/components/ProfileAvatar";

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
          name={`${profile?.first_name||""} ${profile?.last_name||""}`}
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
          {profile?.first_name} {profile?.last_name}
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
          {profile?.school || "School not listed"} · {profile?.sport || "Sport not listed"}
        </p>
      </div>

      <button
        onClick={()=>router.push("/dashboard")}
        style={{
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
        }}
      >
        ← Dashboard
      </button>
    </div>
  );
}
