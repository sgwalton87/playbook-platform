"use client";

import { useEffect, useState } from "react";
import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import { PlaybookButton, PlaybookHero, PlaybookPage } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Organization = { name: string; logo_url: string | null; category: string };
type Format = { name:string; title:string; subtitle:string; cta:string; caption:(name:string)=>string; background:string; accent:string };
const formats:Format[] = [
 {name:"Official Partnership",title:"OFFICIAL PLAYBOOK PARTNER",subtitle:"Together, we are building more opportunities.",cta:"DISCOVER THE PLAYBOOK",background:"#081D34",accent:"#F97316",
  caption:name=>`We're proud to be a verified Playbook Series Inc. partner! ${name} is joining a community creating opportunities for Scholars, families and future leaders. Explore Playbook and join the movement: https://app.playbookseriesinc.org/ #PlaybookSeries #CommunityPartners`},
 {name:"Opportunities Together",title:"POWER OPPORTUNITY",subtitle:"Community partnerships. Real possibilities.",cta:"LEARN MORE AT PLAYBOOK",background:"#172C49",accent:"#EABF73",
  caption:name=>`${name} + Playbook Series Inc.: building pathways to opportunity through community connection. Discover Playbook and share it with someone who should be part of our network: https://app.playbookseriesinc.org/ #PlaybookSeries #OpportunityForAll`},
 {name:"Invite Your Circle",title:"OUR CIRCLE. OUR FUTURE.",subtitle:"Bring your people into the Playbook community.",cta:"INVITE YOUR COMMUNITY",background:"#241C39",accent:"#F97316",
  caption:name=>`My community, meet Playbook! ${name} is a verified Playbook Series Inc. partner. Invite a friend, mentor, educator or organization to explore what's possible: https://app.playbookseriesinc.org/ #PlaybookSeries #GrowTheCircle`},
];
const publicHome="https://app.playbookseriesinc.org/";

function wrapLine(ctx:CanvasRenderingContext2D,value:string,max:number):string[] {
 const words=value.split(/\s+/).filter(Boolean);const lines:string[]=[];let line="";
 for(const word of words){const test=line?`${line} ${word}`:word;
  if(ctx.measureText(test).width>max && line){lines.push(line);line=word;}else line=test;}
 if(line)lines.push(line);return lines;
}
async function makePng(org:Organization,format:Format):Promise<Blob> {
 const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1080;
 const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Your browser cannot create an image.");
 ctx.fillStyle=format.background;ctx.fillRect(0,0,1080,1080);
 ctx.fillStyle=format.accent;ctx.fillRect(70,70,940,10);ctx.fillRect(70,1000,940,10);
 ctx.strokeStyle="#8195B5";ctx.lineWidth=2;ctx.strokeRect(40,40,1000,1000);
 try {
  const brandLogo=new Image();
  await new Promise<void>((resolve,reject)=>{brandLogo.onload=()=>resolve();brandLogo.onerror=()=>reject(new Error("Playbook mark unavailable"));brandLogo.src="/brand/playbook-logo.png";});
  ctx.drawImage(brandLogo,90,92,78,78);
 } catch { /* Keep readable Playbook wordmark if decorative mark cannot load. */ }
 ctx.fillStyle="#FFFFFF";ctx.font="bold 40px Arial";ctx.fillText("PLAYBOOK SERIES INC.",185,148);
 ctx.fillStyle=format.accent;ctx.font="bold 32px Arial";ctx.fillText(format.title,90,300);
 let logoRendered=false;
 if(org.logo_url){
  try {
   const u=new URL(org.logo_url);
   if(u.protocol==="https:"){
    const image=new Image();image.crossOrigin="anonymous";
    await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("Logo unavailable"));image.src=org.logo_url!;});
    const ratio=Math.min(180/image.width,150/image.height);
    ctx.drawImage(image,90,350,image.width*ratio,image.height*ratio);logoRendered=true;
   }
  } catch { /* Missing or cross-origin logo gracefully falls back to text. */ }
 }
 ctx.fillStyle="#FFFFFF";ctx.font="bold 78px Arial";
 const maxText=890,lines=wrapLine(ctx,org.name,maxText).slice(0,3);
 let y=logoRendered?620:480;
 for(const line of lines){ctx.fillText(line,90,y);y+=92;}
 ctx.fillStyle="#D8E4F4";ctx.font="32px Arial";
 const subtitle=wrapLine(ctx,format.subtitle,900);
 for(const line of subtitle){ctx.fillText(line,90,y+34);y+=48;}
 ctx.fillStyle=format.accent;ctx.fillRect(90,880,900,88);
 ctx.fillStyle=format.background;ctx.font="bold 32px Arial";ctx.fillText(format.cta,118,935);
 ctx.fillStyle="#FFFFFF";ctx.font="24px Arial";ctx.fillText("app.playbookseriesinc.org",90,1038);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png"));
 if(!blob)throw new Error("Could not render post image.");
 return blob;
}
export default function PartnerSharePage(){return <BrandPartnerVerificationGate><PartnerShareWorkspace/></BrandPartnerVerificationGate>}
function PartnerShareWorkspace(){
 const [org,setOrg]=useState<Organization|null>(null);
 const [selected,setSelected]=useState(0);
 const [status,setStatus]=useState("Loading verified organization…");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{let cancelled=false;
  void supabase.rpc("ensure_brand_partner_organization").then(({data,error})=>{
   if(cancelled)return;
   const item=Array.isArray(data)?data[0]:data;
   if(error||!item?.name){setStatus("Your verified organization could not be loaded. Return to Organization Profile and try again.");return;}
   setOrg({name:String(item.name),logo_url:typeof item.logo_url==="string"?item.logo_url:null,category:String(item.category??"")});
   setStatus("");
  });
  return()=>{cancelled=true;};
 },[]);
 const format=formats[selected];
 async function share(){
  if(!org)return;setBusy(true);setStatus("");
  try{
   const file=new File([await makePng(org,format)],"playbook-partner-post.png",{type:"image/png"});
   if(navigator.share&&navigator.canShare?.({files:[file]})){
    await navigator.share({files:[file],text:format.caption(org.name),title:format.name});
    setStatus("Share sheet opened. Select Instagram or another destination if available; publication is controlled by that app.");
   }else{
    setStatus("Direct app sharing is not available in this browser. Download the image and post it through Instagram or another app.");
   }
  }catch(error){setStatus(error instanceof Error?error.message:"Sharing was cancelled or unavailable.");}
  finally{setBusy(false);}
 }
 async function download(){
  if(!org)return;setBusy(true);setStatus("");
  try{const blob=await makePng(org,format);const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="playbook-partner-"+(selected+1)+".png";a.click();window.setTimeout(()=>URL.revokeObjectURL(url),2000);setStatus("Image generated for download. No social account was connected or post published.");}
  catch(error){setStatus(error instanceof Error?error.message:"Image generation failed.");}finally{setBusy(false);}
 }
 return <PlaybookPage>
  <PlaybookHero eyebrow="Brand Partner Growth" title="Share your Playbook partnership" subtitle="Three ready-to-share designs featuring your verified organization name and Playbook Series Inc. Your logo is optional; no Scholar data is used.">
   <PlaybookButton href="/brand-partner-os/organization" variant="secondary">Add or change company logo</PlaybookButton>
  </PlaybookHero>
  <main style={{maxWidth:1120,margin:"20px auto",padding:"0 16px 80px",color:"#0F172A"}}>
   {status&&<p role="status" aria-live="polite" style={{background:"#F1F5F9",color:"#0F172A",padding:14,borderRadius:10}}>{status}</p>}
   {org&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,310px),1fr))",gap:20}}>
    <section style={{display:"grid",gap:16,alignContent:"start"}}>
     <h2 style={{margin:0}}>Choose a post</h2>
     {formats.map((item,i)=><button key={item.name} type="button" aria-pressed={selected===i} onClick={()=>{setSelected(i);setStatus("");}}
      style={{textAlign:"left",border:selected===i?"3px solid #EA580C":"1px solid #CBD5E1",background:"#FFF",color:"#0F172A",padding:18,borderRadius:12,fontSize:17,fontWeight:800}}>
      {i+1}. {item.name}
     </button>)}
     {!org.logo_url&&<p style={{background:"#FFF7ED",color:"#7C2D12",padding:14,borderRadius:10}}>No company logo saved yet. This post will use your verified organization name with Playbook branding. A logo is not required.</p>}
     <label style={{fontWeight:750}}>Suggested caption
      <textarea readOnly value={format.caption(org.name)} rows={7} style={{display:"block",width:"100%",padding:12,marginTop:8,color:"#0F172A",background:"#FFF",border:"1px solid #94A3B8",borderRadius:10}} />
     </label>
     <button type="button" onClick={()=>void navigator.clipboard.writeText(format.caption(org.name)).then(()=>setStatus("Caption copied.")).catch(()=>setStatus("Copy unavailable in this browser."))} style={primary}>Copy caption</button>
     <button type="button" disabled={busy} onClick={()=>void download()} style={primary}>Download Instagram square image</button>
     <button type="button" disabled={busy} onClick={()=>void share()} style={primary}>Share using my phone or browser</button>
     <p style={{fontSize:14,lineHeight:1.6,color:"#475569"}}>Sharing uses the device share sheet when supported. Automated Instagram publishing requires a separately authorized Meta account connection and approved API permissions; this page does not claim to publish on your behalf.</p>
     <a href={publicHome} style={{color:"#174EA6"}}>Public Playbook link to share</a>
    </section>
    <section aria-label="Co-branded post preview" style={{aspectRatio:"1/1",background:format.background,color:"#FFF",borderRadius:18,padding:"clamp(22px,4vw,45px)",display:"flex",flexDirection:"column",justifyContent:"space-between",border:"6px solid #C8A96D"}}>
     <div style={{fontWeight:900,fontSize:20,letterSpacing:2,display:"flex",gap:12,alignItems:"center"}}><img src="/brand/playbook-logo.png" alt="" width="46" height="46" style={{objectFit:"contain"}} />PLAYBOOK SERIES INC.</div>
     <div><p style={{color:format.accent,fontWeight:900,letterSpacing:2,fontSize:16}}>{format.title}</p>
      {org.logo_url&&<img src={org.logo_url} alt={org.name+" logo"} style={{maxWidth:110,maxHeight:85,objectFit:"contain"}} />}
      <h2 style={{fontSize:"clamp(28px,4vw,52px)",overflowWrap:"anywhere",lineHeight:1.1,margin:"14px 0"}}>{org.name}</h2>
      <p style={{fontSize:"clamp(15px,2vw,23px)",lineHeight:1.4}}>{format.subtitle}</p></div>
     <div style={{background:format.accent,color:format.background,padding:15,borderRadius:8,fontWeight:900,textAlign:"center"}}>{format.cta}</div>
    </section>
   </div>}
  </main>
 </PlaybookPage>;
}
const primary:React.CSSProperties={padding:"14px 16px",background:"#0C2949",color:"#FFFFFF",border:0,borderRadius:10,fontWeight:850,fontSize:16,cursor:"pointer"};
