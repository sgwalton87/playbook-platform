"use client";

import Link from "next/link";

export default function OpportunityGalaxy({ opportunities }: { opportunities: LegacyValue }) {
  const matches = opportunities.matches.slice(0, 7);

  return (
    <section style={card}>
      <p style={eyebrow}>Opportunity Galaxy</p>
      <h2 style={title}>Future pathways in orbit</h2>

      <div style={galaxy}>
        <div style={orbitOne} />
        <div style={orbitTwo} />
        <div style={you}>YOU</div>

        {matches.map((match: LegacyValue, i: number) => (
          <Link key={match.opportunity.id} href="/opportunities" style={{...star, transform:`rotate(${i*51}deg) translate(125px) rotate(-${i*51}deg)`}}>
            {match.opportunity.type.replace("_", " ")}
          </Link>
        ))}
      </div>
    </section>
  );
}

const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const title: React.CSSProperties = {fontSize:26,lineHeight:1.1,color:"#0F172A",margin:"8px 0"};
const galaxy: React.CSSProperties = {height:320,position:"relative",display:"grid",placeItems:"center",overflow:"hidden"};
const orbitOne: React.CSSProperties = {position:"absolute",width:170,height:170,border:"1px dashed #CBD5E1",borderRadius:999};
const orbitTwo: React.CSSProperties = {position:"absolute",width:260,height:260,border:"1px dashed #E2E8F0",borderRadius:999};
const you: React.CSSProperties = {width:80,height:80,borderRadius:999,background:"#0F172A",color:"#fff",display:"grid",placeItems:"center",fontWeight:950,zIndex:2,boxShadow:"0 20px 40px rgba(15,23,42,.25)"};
const star: React.CSSProperties = {position:"absolute",fontSize:11,background:"#FFF7ED",color:"#F97316",border:"1px solid #FED7AA",borderRadius:999,padding:"8px 10px",fontWeight:900,textDecoration:"none",zIndex:3};
