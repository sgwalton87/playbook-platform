"use client";

const T = {
  surface:"#FFFFFF",
  line:"#E2E8F0",
  ink:"#0F172A",
  muted:"#64748B",
  mono:"'Space Mono', monospace",
  anton:"'Anton', sans-serif",
};

type Props = {
  profile:any;
  certificates:any[];
  badges:any[];
  posts:any[];
};

export default function ProfileStats({
  profile,
  certificates,
  badges,
  posts,
}:Props){

  const stats=[
    {icon:"⚡",label:"XP",value:profile?.xp??0},
    {icon:"💰",label:"Coins",value:profile?.coin_balance??0},
    {icon:"🎓",label:"Certs",value:certificates.length},
    {icon:"🏅",label:"Badges",value:badges.length},
    {icon:"💬",label:"Posts",value:posts.length},
  ];

  return(
    <div
      style={{
        display:"grid",
        gridTemplateColumns:"repeat(5,1fr)",
        gap:10,
        marginBottom:14,
      }}
    >
      {stats.map(({icon,label,value})=>(
        <div
          key={label}
          style={{
            background:T.surface,
            border:`1px solid ${T.line}`,
            borderRadius:14,
            padding:"14px",
          }}
        >
          <div style={{fontSize:20,marginBottom:6}}>
            {icon}
          </div>

          <div
            style={{
              fontFamily:T.mono,
              fontSize:9,
              letterSpacing:"0.1em",
              textTransform:"uppercase",
              color:T.muted,
              marginBottom:3,
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontFamily:T.anton,
              fontSize:26,
              color:T.ink,
              lineHeight:1,
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
