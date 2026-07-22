"use client";

import ScholarOpportunityGraphSection from "@/components/scholar/ScholarOpportunityGraphSection";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileAvatar from "@/components/ProfileAvatar";
import { ConnectionButton } from "@/components/network";
import { checkBadges } from "@/lib/badges";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileStats from "@/components/profile/ProfileStats";
import AboutCard from "@/components/profile/AboutCard";
import ScholarRecordDashboard from "@/components/scholar/ScholarRecordDashboard";
import PortfolioEngine from "@/components/portfolio/PortfolioEngine";
import TrustScoreCard from "@/components/trust/TrustScoreCard";
import { buildScholarRecord, type RawCommunityActivity } from "@/lib/scholar";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",amber:"#F59E0B",purple:"#8B5CF6",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};
const SURL="https://oexgxnybeixwadgtdtzp.supabase.co";

const CERT_META:Record<string,{color:string;era:string;rarity:string;rarityColor:string;gradient:string}>={
  "captains-mindset":{color:T.orange,era:"ERA 1/4",rarity:"UNCOMMON",rarityColor:T.orange,gradient:"linear-gradient(135deg,#F59E0B,#F97316,#8B5CF6,#3B82F6)"},
  "money-in-the-game":{color:T.blue,era:"ERA 2/4",rarity:"COMMON",rarityColor:"#94A3B8",gradient:"linear-gradient(135deg,#3B82F6,#8B5CF6,#10B981,#3B82F6)"},
  "mind-of-an-athlete":{color:T.purple,era:"ERA 3/4",rarity:"UNCOMMON",rarityColor:T.orange,gradient:"linear-gradient(135deg,#8B5CF6,#EC4899,#3B82F6,#8B5CF6)"},
  "community-leader":{color:T.green,era:"ERA 4/4",rarity:"RARE",rarityColor:T.amber,gradient:"linear-gradient(135deg,#10B981,#3B82F6,#F59E0B,#10B981)"},
};

function SmallCertCard({cert}:{cert:any}) {
  const meta=CERT_META[cert.course_slug]||{color:T.orange,era:"ERA 1/4",rarity:"UNCOMMON",rarityColor:T.orange,gradient:"linear-gradient(135deg,#F59E0B,#F97316,#8B5CF6,#3B82F6)"};
  return(
    <div style={{position:"relative",borderRadius:12,padding:2,background:meta.gradient,boxShadow:"0 8px 24px rgba(0,0,0,.2)",width:120,flexShrink:0}}>
      <div style={{background:T.navy,borderRadius:10,padding:"12px 10px",minHeight:160,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{display:"flex",justifyContent:"space-between",width:"100%",marginBottom:8}}>
          <span style={{fontFamily:T.mono,fontSize:7,color:"rgba(255,255,255,.4)",letterSpacing:"0.1em"}}>{meta.era}</span>
          <span style={{fontFamily:T.mono,fontSize:7,background:meta.rarityColor,color:meta.rarity==="COMMON"?"#0F172A":"#fff",padding:"1px 5px",borderRadius:3,fontWeight:700}}>{meta.rarity}</span>
        </div>
        <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:`2px solid ${meta.color}`,boxShadow:`0 0 12px ${meta.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:8}}>🎓</div>
        <div style={{fontFamily:T.anton,fontSize:9,color:meta.color,textTransform:"uppercase",textAlign:"center",letterSpacing:"0.04em",marginBottom:3,lineHeight:1.2}}>{cert.certificate_name}</div>
        <div style={{fontFamily:T.mono,fontSize:7,color:"rgba(255,255,255,.25)",marginTop:"auto",paddingTop:6,borderTop:"1px solid rgba(255,255,255,.08)",width:"100%",textAlign:"center",letterSpacing:"0.06em"}}>PLAYBOOK VALIDATED</div>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const router=useRouter();
  const params=useParams();
  const username=params?.username as string;
  const postFileRef=useRef<HTMLInputElement>(null);
  const galleryFileRef=useRef<HTMLInputElement>(null);
  const [viewerId,setViewerId]=useState("");
  const [profile,setProfile]=useState<any>(null);
  const [badges,setBadges]=useState<any[]>([]);
  const [certificates,setCertificates]=useState<any[]>([]);
  const [posts,setPosts]=useState<any[]>([]);
  const [gallery,setGallery]=useState<string[]>([]);
  const [activities,setActivities]=useState<RawCommunityActivity[]>([]);
  const [newPost,setNewPost]=useState("");
  const [posting,setPosting]=useState(false);
  const [loading,setLoading]=useState(true);
  const [lightbox,setLightbox]=useState<string|null>(null);
  const [pendingPhoto,setPendingPhoto]=useState<string|null>(null);
  const [pendingFile,setPendingFile]=useState<File|null>(null);
  const [tab,setTab]=useState<"feed"|"gallery">("feed");
  const [uploading,setUploading]=useState(false);

  useEffect(()=>{
    (async()=>{
      const{data:userData}=await supabase.auth.getUser();
      if(userData.user)setViewerId(userData.user.id);
      const{data:profileData,error}=await supabase.from("profiles").select("*").ilike("username",username).maybeSingle();
      if(error||!profileData){setLoading(false);return;}
      const[{data:certData},{data:badgeData},{data:feedData}]=await Promise.all([
        supabase.from("certificates").select("*").eq("user_id",profileData.id).order("issued_at",{ascending:false}),
        supabase.from("user_badges").select("id,awarded_at,badges(id,name,description,image_url)").eq("user_id",profileData.id).order("awarded_at",{ascending:false}),
        supabase.from("feed_posts").select("*").eq("user_id",profileData.id).or("visibility.eq.public,visibility.is.null").order("created_at",{ascending:false}).limit(50),
      ]);
      const {data:activityData}=await supabase.from("student_activities").select("*").eq("student_id",profileData.id).order("created_at",{ascending:false});
      const profileBadges=checkBadges(profileData);
      const combinedBadges=[
        ...profileBadges.map((name:string)=>({id:`profile-${name}`,displayName:name})),
        ...(badgeData||[]).map((item:any)=>({id:item.id,displayName:item.badges?.name})),
      ].filter(b=>b.displayName);
      setProfile(profileData);
      setCertificates(certData||[]);
      setBadges(combinedBadges);
      setPosts(feedData||[]);
      setActivities((activityData||[]) as RawCommunityActivity[]);
      const photoPostUrls=(feedData||[]).filter((p:any)=>p.image_url).map((p:any)=>p.image_url);
      const{data:files}=await supabase.storage.from("photos").list("gallery",{limit:100,sortBy:{column:"created_at",order:"desc"}});
      const storageUrls=(files||[]).filter((f:any)=>f.name!==".emptyFolderPlaceholder").map((f:any)=>`${SURL}/storage/v1/object/public/photos/gallery/${f.name}`);
      setGallery([...photoPostUrls,...storageUrls]);
      setLoading(false);
    })();
  },[username]);

  useEffect(()=>{
    if(!profile?.id)return;
    const channel=supabase.channel(`public-profile-${profile.id}`)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"feed_posts",filter:`user_id=eq.${profile.id}`},(payload)=>{
        setPosts(curr=>curr.some(p=>p.id===payload.new.id)?curr:[payload.new,...curr]);
        if(payload.new.image_url)setGallery(prev=>[payload.new.image_url,...prev]);
      })
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"certificates",filter:`user_id=eq.${profile.id}`},(payload)=>{
        setCertificates(curr=>curr.some(c=>c.id===payload.new.id)?curr:[payload.new,...curr]);
      })
      .subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[profile?.id]);

  const uploadPhoto=async(photoFile:File,folder:string):Promise<string|null>=>{
    const ext=photoFile.name.split(".").pop()||"jpg";
    const filename=`${folder}/${Date.now()}.${ext}`;
    const{error}=await supabase.storage.from("photos").upload(filename,photoFile,{cacheControl:"3600",upsert:true});
    if(error){console.error(error.message);return null;}
    return`${SURL}/storage/v1/object/public/photos/${filename}`;
  };

  const handleFileSelect=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    setPendingFile(f);setPendingPhoto(URL.createObjectURL(f));
  };

  const createPost=async()=>{
    if(!newPost.trim()&&!pendingFile)return;
    if(!viewerId||!profile?.id)return;
    if(viewerId!==profile.id){alert("You can only post from your own profile.");return;}
    setPosting(true);
    let imageUrl:string|null=null;
    if(pendingFile){imageUrl=await uploadPhoto(pendingFile,"feed");if(imageUrl)setGallery(prev=>[imageUrl!,...prev]);}
    const{data,error}=await supabase.from("feed_posts").insert({user_id:viewerId,post_type:"text",title:newPost.trim()?"Community Post":null,body:newPost.trim(),image_url:imageUrl,visibility:"public"}).select("*").single();
    if(error){alert(error.message);setPosting(false);return;}
    if(data)setPosts(curr=>curr.some(p=>p.id===data.id)?curr:[data,...curr]);
    setNewPost("");setPendingPhoto(null);setPendingFile(null);
    if(postFileRef.current)postFileRef.current.value="";
    setPosting(false);
  };

  const handleGalleryUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    setUploading(true);
    const url=await uploadPhoto(f,"gallery");
    if(url){setGallery(prev=>[url,...prev]);await supabase.from("feed_posts").insert({user_id:viewerId,post_type:"photo",body:"",image_url:url,visibility:"public"});}
    if(galleryFileRef.current)galleryFileRef.current.value="";
    setUploading(false);
  };

  if(loading)return<div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading profile...</div>;
  if(!profile)return<div style={{padding:40,fontFamily:T.sans}}><h2>Profile not found</h2><button onClick={()=>router.push("/dashboard")}>Back</button></div>;
  const isOwn=viewerId===profile.id;
  const scholarRecord=buildScholarRecord({
    profile,
    certificates,
    badges,
    activities,
    posts,
  });

  return(
    <div style={{minHeight:"100vh",background:T.cream,fontFamily:T.sans,color:T.ink,padding:"32px 36px",maxWidth:900,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}::selection{background:${T.orange};color:#fff;}.pb-post:hover{border-color:${T.orange}!important;}.pb-gal:hover{opacity:.8!important;transform:scale(1.03);}textarea{resize:vertical;}textarea::placeholder{color:${T.faint};}textarea:focus{border-color:${T.orange}!important;outline:none;}.pb-cert-sm{transition:transform 0.2s;}.pb-cert-sm:hover{transform:translateY(-6px) rotate(-1deg);}`}</style>

      {lightbox&&(<div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.93)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={lightbox} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:12}}/><button onClick={()=>setLightbox(null)} style={{position:"absolute",top:20,right:24,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",borderRadius:"50%",width:40,height:40}}>✕</button></div>)}

      <ProfileHero
        profile={profile}
        router={router}
      />

      <ScholarRecordDashboard record={scholarRecord} />

      <TrustScoreCard record={scholarRecord} />

      <ScholarOpportunityGraphSection />

      <PortfolioEngine record={scholarRecord} />

      <ProfileStats
        profile={profile}
        certificates={certificates}
        badges={badges}
        posts={posts}
      />

      {/* 3 — About + Academics */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <AboutCard profile={profile} />
        <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:20,padding:"20px 24px"}}>
          <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>Academics</p>
          {[["GPA",profile?.gpa],["SAT",profile?.sat_score],["ACT",profile?.act_score],["Dream School",profile?.dream_school],["Coach",profile?.coach_name],["Travel Team",profile?.travel_team]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.line}`}}>
              <span style={{fontSize:12,color:T.muted}}>{l}</span>
              <span style={{fontSize:12,fontWeight:600,color:T.ink}}>{v||"—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 — Badges */}
      <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:20,padding:"20px 24px",marginBottom:14}}>
        <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>Badges</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {badges.length>0?badges.map(badge=>(
            <span key={badge.id} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,padding:"6px 12px",borderRadius:999,background:T.orangeL,border:`1px solid ${T.orange}22`,color:T.orange}}>🏅 {badge.displayName}</span>
          )):<p style={{fontSize:13,color:T.faint}}>No badges yet.</p>}
        </div>
      </div>

      {/* 5 — Certificates — SMALL collectible cards */}
      <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:20,padding:"20px 24px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted}}>Certificates</p>
          {certificates.length>0&&<button onClick={()=>router.push("/certificates")} style={{fontFamily:T.mono,fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.orange,background:"none",border:"none",cursor:"pointer"}}>View all →</button>}
        </div>
        {certificates.length>0?(
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {certificates.map(cert=>(
              <div key={cert.id} className="pb-cert-sm" onClick={()=>router.push("/certificates")} style={{cursor:"pointer"}}>
                <SmallCertCard cert={cert}/>
                <div style={{marginTop:8,textAlign:"center"}}>
                  <div style={{fontFamily:T.mono,fontSize:8,color:T.muted,letterSpacing:"0.06em",textTransform:"uppercase"}}>{cert.certificate_name}</div>
                  <div style={{fontFamily:T.mono,fontSize:7,color:T.faint,marginTop:2}}>{new Date(cert.issued_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                </div>
              </div>
            ))}
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:28}}>🔒</div>
            <div>
              <p style={{fontSize:13,color:T.faint,lineHeight:1.6}}>No certificates yet. Complete a course to earn your first collectible card.</p>
              <button onClick={()=>router.push("/courses")} style={{marginTop:8,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"8px 14px",cursor:"pointer"}}>Go to courses →</button>
            </div>
          </div>
        )}
      </div>

      {/* 6 — Feed + Gallery LAST */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {(["feed","gallery"]as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:tab===t?T.navy:"transparent",color:tab===t?"#F8F7F4":T.muted,border:`1.5px solid ${tab===t?T.navy:T.line}`,borderRadius:999,padding:"9px 18px",cursor:"pointer",transition:"all 0.15s"}}>
            {t==="feed"?`📣 Posts (${posts.length})`:`📸 Gallery (${gallery.length})`}
          </button>
        ))}
      </div>

      {tab==="feed"&&(
        <div>
          {isOwn&&(
            <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:18,padding:"18px 20px",marginBottom:16}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                <ProfileAvatar src={profile?.avatar_url} name={`${profile?.first_name||""}`} size={40}/>
                <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Post something to your public community feed..." rows={3} style={{flex:1,background:T.surface2,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"10px 14px",fontSize:14,color:T.ink,fontFamily:T.sans,transition:"border-color 0.15s",width:"100%"}}/>
              </div>
              {pendingPhoto&&(
                <div style={{position:"relative",marginBottom:12,borderRadius:12,overflow:"hidden",maxHeight:220}}>
                  <img src={pendingPhoto} alt="Preview" style={{width:"100%",objectFit:"cover",display:"block",maxHeight:220}}/>
                  <button onClick={()=>{setPendingPhoto(null);setPendingFile(null);if(postFileRef.current)postFileRef.current.value="";}} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <label style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:pendingPhoto?T.orange:T.muted,background:pendingPhoto?T.orangeL:T.surface2,border:`1.5px solid ${pendingPhoto?T.orange:T.line}`,borderRadius:999,padding:"9px 16px",cursor:"pointer",transition:"all 0.15s"}}>
                  📷 {pendingPhoto?"Photo attached":"Add photo"}
                  <input ref={postFileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{display:"none"}}/>
                </label>
                <button onClick={createPost} disabled={posting||(!newPost.trim()&&!pendingFile)} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:(newPost.trim()||pendingFile)&&!posting?T.orange:T.line,color:(newPost.trim()||pendingFile)&&!posting?"#fff":T.faint,border:"none",borderRadius:999,padding:"10px 22px",cursor:(newPost.trim()||pendingFile)&&!posting?"pointer":"default",transition:"all 0.15s"}}>
                  {posting?"Posting...":"Post →"}
                </button>
              </div>
            </div>
          )}
          {posts.length===0?(
            <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"48px 24px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:14}}>📣</div><p style={{fontFamily:T.mono,fontSize:12,color:T.faint}}>No public posts yet.</p></div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {posts.map(post=>(
                <div key={post.id} className="pb-post" style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:18,overflow:"hidden",transition:"border-color 0.15s"}}>
                  {post.image_url&&(<div style={{position:"relative",maxHeight:280,overflow:"hidden",cursor:"pointer"}} onClick={()=>setLightbox(post.image_url)}><img src={post.image_url} alt="" style={{width:"100%",objectFit:"cover",display:"block",maxHeight:280}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 50%,rgba(15,23,42,.5) 100%)"}}/></div>)}
                  <div style={{padding:"16px 18px"}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                      <ProfileAvatar src={profile?.avatar_url} name={`${profile?.first_name||""}`} size={38}/>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{profile?.first_name} {profile?.last_name}</div>
                        <div style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>@{profile?.username} · {new Date(post.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                      </div>
                    </div>
                    {post.title&&<div style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>{post.title}</div>}
                    {post.body&&<p style={{fontSize:15,lineHeight:1.65,color:T.ink,marginBottom:14}}>{post.body}</p>}
                    <div style={{display:"flex",gap:16,borderTop:`1px solid ${T.line}`,paddingTop:12}}>
                      <span style={{fontFamily:T.mono,fontSize:11,color:T.faint}}>♡ {post.like_count||0}</span>
                      <span style={{fontFamily:T.mono,fontSize:11,color:T.faint}}>💬 {post.comment_count||0}</span>
                      {post.image_url&&<button onClick={()=>setLightbox(post.image_url)} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,background:"transparent",border:"none",color:T.faint,cursor:"pointer",padding:0,marginLeft:"auto"}}>🔍 View</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="gallery"&&(
        <div>
          {isOwn&&(
            <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:T.surface,border:`2px dashed ${T.line}`,borderRadius:18,padding:"32px 24px",marginBottom:20,cursor:"pointer",textAlign:"center"}}>
              {uploading?<div style={{fontFamily:T.mono,fontSize:13,color:T.orange}}>Uploading...</div>:<>
                <div style={{fontSize:36}}>📸</div>
                <div style={{fontFamily:T.anton,fontSize:20,textTransform:"uppercase",color:T.ink}}>Add to your gallery</div>
                <div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>Upload from your photo library</div>
                <div style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",borderRadius:999,padding:"10px 22px",marginTop:4}}>Choose from library</div>
              </>}
              <input ref={galleryFileRef} type="file" accept="image/*" onChange={handleGalleryUpload} style={{display:"none"}}/>
            </label>
          )}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted}}>{gallery.length} photos</p>
          </div>
          {gallery.length===0?(
            <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"48px 24px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:14}}>📷</div><p style={{fontFamily:T.mono,fontSize:12,color:T.faint}}>No photos yet.</p></div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {gallery.map((img,i)=>(
                <div key={i} onClick={()=>setLightbox(img)} style={{aspectRatio:"1",borderRadius:14,overflow:"hidden",cursor:"pointer",background:T.line}}>
                  <img src={img} alt={`Photo ${i+1}`} className="pb-gal" style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"all 0.2s"}}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
