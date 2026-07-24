"use client";

export default function AcademicDNAVisualizer({ dna }: { dna: LegacyValue }) {
  const signals = dna.strengths.slice(0, 7);

  return (
    <section style={card}>
      <p style={eyebrow}>Academic DNA</p>
      <h2 style={title}>Strengths becoming visible</h2>
      <p style={body}>{dna.confidence}% confidence from transcript and knowledge graph signals.</p>

      <div style={{display:"grid",gap:13,marginTop:18}}>
        {signals.map((signal: string, i: number) => {
          const value = Math.max(58, 94 - i * 6);
          return (
            <div key={signal}>
              <div style={row}><span>{signal}</span><strong>{value}%</strong></div>
              <div style={track}><div style={{...fill,width:`${value}%`}} /></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const title: React.CSSProperties = {fontSize:26,lineHeight:1.1,color:"#0F172A",margin:"8px 0"};
const body: React.CSSProperties = {fontSize:14,lineHeight:1.55,color:"#64748B"};
const row: React.CSSProperties = {display:"flex",justifyContent:"space-between",fontSize:13,color:"#334155",marginBottom:6};
const track: React.CSSProperties = {height:8,background:"#E2E8F0",borderRadius:999,overflow:"hidden"};
const fill: React.CSSProperties = {height:"100%",background:"#F97316",borderRadius:999,transition:"width .5s ease"};
