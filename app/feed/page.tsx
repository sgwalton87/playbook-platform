"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",purple:"#8B5CF6",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};
const FILTERS=["All","Leadership","Finance","Civic","SEL"];
const LEADERS=[{name:"Jordan M.",initials:"JM",color:T.green,img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",xp:890,rank:1},{name:"Aisha T.",initials:"AT",color:T.blue,img:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",xp:760,rank:2},{name:"Marcus D.",initials:"MD",color:T.purple,img:null,xp:640,rank:3},{name:"You",initials:"SW",color:T.orange,img:null,xp:340,rank:4}];
const SURL="https://oexgxnybeixwadgtdtzp.supabase.co";

export default function FeedPage() {
  const router=useRouter();
  const postFileRef=useRef<HTMLInputElement>(null);
  const galleryFileRef=useRef<HTMLInputElement>(null);
  const [posts,setPosts]=useState<any[]>([]);
  const [filter,setFilter]=useState("All");
  const [newPost,setNewPost]=useState("");
  const [userName,setUserName]=useState("Scholar");
  const [userInitials,setUserInitials]=useState("SW");
  const [userId,setUserId]=useState<string|null>(null);
  const [tab,setTab]=useState<"feed"|"gallery">("feed");
  const [pendingPhoto,setPendingPhoto]=useState<string|null>(null);
  const [pendingFile,setPendingFile]=useState<File|null>(null);
  const [gallery,setGallery]=useState<string[]>([]);
  const [lightbox,setLightbox]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [uploading,setUploading]=useState(false);

  useEffect(()=>{
    (async()=>{
      const{data:u}=await supabase.auth.getUser();
      if(!u.user){router.replace("/login");return;}
      setUserId(u.user.id);

      const{data:p}=await supabase.from("profiles").select("first_name,full_name").eq("id",u.user.id).single();
      const name=p?.full_name||p?.first_name||"Scholar";
      setUserName(p?.first_name||"Scholar");
      setUserInitials(name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2));

      // Load from feed_posts — the real table
      const{data:dbPosts,error}=await supabase
        .from("feed_posts")
        .select("id,user_id,post_type,title,body,image_url,media_url,created_at,visibility")
        .eq("visibility","public")
        .order("created_at",{ascending:false})
        .limit(50);

      if(error)console.error("Feed error:",error.message);

      if(dbPosts&&dbPosts.length>0){
        const authorIds=[...new Set(dbPosts.map((p:any)=>p.user_id))];
        const{data:authorProfiles}=await supabase.from("profiles").select("id,first_name,last_name,full_name,username,role,avatar_url").in("id",authorIds);
        const profileMap:Record<string,string>={};
        authorProfiles?.forEach((ap:any)=>{
          profileMap[ap.id]={
            name: ap.full_name || [ap.first_name, ap.last_name].filter(Boolean).join(" ") || ap.username || "Scholar",
            role: ap.role || "Scholar",
            avatar_url: ap.avatar_url || null,
            username: ap.username || null,
          };
        });

        setPosts(dbPosts.map((post:any)=>{
          const authorProfile=profileMap[post.user_id]||{name:"Scholar",role:"Scholar",avatar_url:null,username:null};
          const authorName=authorProfile.name;
          const initials=authorName.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2);
          const d=new Date(post.created_at);
          const timeStr=d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" · "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
          const imgUrl=post.image_url||post.media_url||null;
          return{
            id:post.id,author:authorName,initials,
            color:post.user_id===u.user.id?T.orange:T.blue,
            role:authorProfile.role,time:timeStr,
            title:post.title||null,
            content:post.body||"",
            pillar:"Leadership",pillarColor:T.orange,
            coverImg:imgUrl,likes:0,comments:0,liked:false,
            isOwn:post.user_id===u.user.id,
          };
        }));
      }

      // Load gallery from Supabase Storage
      const{data:files}=await supabase.storage.from("photos").list("gallery",{limit:100,sortBy:{column:"created_at",order:"desc"}});
      if(files&&files.length>0){
        setGallery(files.filter((f:any)=>f.name!==".emptyFolderPlaceholder").map((f:any)=>`${SURL}/storage/v1/object/public/photos/gallery/${f.name}`));
      }

      // Also pull feed post images into gallery
      const{data:photoPosts}=await supabase.from("feed_posts").select("image_url,media_url").not("image_url","is",null).limit(50);
      if(photoPosts){
        const photoUrls=photoPosts.map((p:any)=>p.image_url||p.media_url).filter(Boolean);
        if(photoUrls.length>0)setGallery(prev=>[...photoUrls,...prev]);
      }

      setLoading(false);
    })();
  },[]);

  const uploadPhoto=async(photoFile:File,folder:string):Promise<string|null>=>{
    const ext=photoFile.name.split(".").pop()||"jpg";
    const filename=`${folder}/${Date.now()}.${ext}`;
    const{error}=await supabase.storage.from("photos").upload(filename,photoFile,{cacheControl:"3600",upsert:true});
    if(error){console.error("Upload error:",error.message);return null;}
    return`${SURL}/storage/v1/object/public/photos/${filename}`;
  };

  const handlePostFileSelect=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    setPendingFile(f);setPendingPhoto(URL.createObjectURL(f));
  };

  const handlePost=async()=>{
    if(!newPost.trim()&&!pendingFile)return;
    setUploading(true);
    let imageUrl:string|null=null;

    if(pendingFile){
      imageUrl=await uploadPhoto(pendingFile,"feed");
      // Also save to gallery folder
      if(imageUrl)setGallery(prev=>[imageUrl!,...prev]);
    }

    // Save to feed_posts with correct columns
    const{data:saved,error}=await supabase.from("feed_posts").insert({
      user_id:userId,
      post_type:"text",
      body:newPost,
      image_url:imageUrl,
      visibility:"public",
    }).select().single();

    if(error)console.error("Post error:",error.message);

    setPosts(prev=>[{
      id:saved?.id||Date.now().toString(),
      author:userName,initials:userInitials,color:T.orange,
      role:userRole,time:"Just now",
      title:null,content:newPost,
      pillar:"Leadership",pillarColor:T.orange,
      coverImg:imageUrl,likes:0,comments:0,liked:false,isOwn:true,
    },...prev]);

    setNewPost("");setPendingPhoto(null);setPendingFile(null);
    if(postFileRef.current)postFileRef.current.value="";
    setUploading(false);
  };

  const handleGalleryUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    setUploading(true);
    const url=await uploadPhoto(f,"gallery");
    if(url){
      setGallery(prev=>[url,...prev]);
      // Also save as a photo post to feed_posts
      await supabase.from("feed_posts").insert({
        user_id:userId,post_type:"photo",
        body:"",image_url:url,visibility:"public",
      });
    }
    if(galleryFileRef.current)galleryFileRef.current.value="";
    setUploading(false);
  };

  const toggleLike=(id:string)=>setPosts(p=>p.map(x=>x.id===id?{...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}:x));
  const filtered=filter==="All"?posts:posts.filter(p=>p.pillar===filter);

  if(loading)return<div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading feed...</div>;

  return(
    <div style={{minHeight:"100vh",background:T.cream,fontFamily:T.sans,color:T.ink}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::selection{background:${T.orange};color:#fff;}
        .pb-post:hover{border-color:${T.orange}!important;}
        .pb-like:hover{color:${T.orange}!important;}
        .pb-gal:hover{opacity:.8!important;transform:scale(1.03);}
        .pb-upload:hover{border-color:${T.orange}!important;background:${T.orangeL}!important;}
        textarea{resize:none;}textarea::placeholder{color:${T.faint};}textarea:focus{border-color:${T.orange}!important;outline:none;}
      `}</style>

      {lightbox&&(
        <div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.93)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <img src={lightbox} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:12}}/>
          <button onClick={()=>setLightbox(null)} style={{position:"absolute",top:20,right:24,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",borderRadius:"50%",width:40,height:40}}>✕</button>
        </div>
      )}

      <div style={{padding:"32px 36px",maxWidth:1080}}>
        <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>The network</p>
        <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(32px,4vw,48px)",textTransform:"uppercase",color:T.ink,lineHeight:.95,marginBottom:20}}>Activity Feed</h1>

        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {(["feed","gallery"]as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:tab===t?T.navy:"transparent",color:tab===t?"#F8F7F4":T.muted,border:`1.5px solid ${tab===t?T.navy:T.line}`,borderRadius:999,padding:"9px 20px",cursor:"pointer",transition:"all 0.15s"}}>
              {t==="feed"?"📣 Feed":`📸 Gallery (${gallery.length})`}
            </button>
          ))}
        </div>

        {tab==="feed"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20}}>
            <div>
              <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:18,padding:"18px 20px",marginBottom:16}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.anton,fontSize:15,color:"#fff",flexShrink:0}}>{userInitials}</div>
                  <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Share something with the network..." rows={3} style={{flex:1,background:T.surface2,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"10px 14px",fontSize:14,color:T.ink,fontFamily:T.sans,transition:"border-color 0.15s",width:"100%"}}/>
                </div>
                {pendingPhoto&&(
                  <div style={{position:"relative",marginBottom:12,borderRadius:12,overflow:"hidden",maxHeight:220}}>
                    <img src={pendingPhoto} alt="Preview" style={{width:"100%",objectFit:"cover",display:"block",maxHeight:220}}/>
                    <button onClick={()=>{setPendingPhoto(null);setPendingFile(null);if(postFileRef.current)postFileRef.current.value="";}} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <label className="pb-upload" style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:pendingPhoto?T.orange:T.muted,background:pendingPhoto?T.orangeL:T.surface2,border:`1.5px solid ${pendingPhoto?T.orange:T.line}`,borderRadius:999,padding:"9px 16px",cursor:"pointer",transition:"all 0.15s"}}>
                    📷 {pendingPhoto?"Photo attached":"Add photo"}
                    <input ref={postFileRef} type="file" accept="image/*" onChange={handlePostFileSelect} style={{display:"none"}}/>
                  </label>
                  <button onClick={handlePost} disabled={uploading||(!newPost.trim()&&!pendingFile)} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:(newPost.trim()||pendingFile)&&!uploading?T.orange:T.line,color:(newPost.trim()||pendingFile)&&!uploading?"#fff":T.faint,border:"none",borderRadius:999,padding:"10px 22px",cursor:(newPost.trim()||pendingFile)&&!uploading?"pointer":"default",transition:"all 0.15s"}}>
                    {uploading?"Uploading...":"Post →"}
                  </button>
                </div>
              </div>

              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {FILTERS.map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:filter===f?T.navy:"transparent",color:filter===f?"#F8F7F4":T.muted,border:`1.5px solid ${filter===f?T.navy:T.line}`,borderRadius:999,padding:"7px 14px",cursor:"pointer",transition:"all 0.15s"}}>{f}</button>
                ))}
              </div>

              {filtered.length===0?(
                <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"48px 24px",textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:14}}>📣</div>
                  <h3 style={{fontFamily:T.anton,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:8}}>Nothing here yet</h3>
                  <p style={{fontFamily:T.mono,fontSize:11,color:T.faint}}>Be the first to post something to the network.</p>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {filtered.map(post=>(
                    <div key={post.id} className="pb-post" style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:18,overflow:"hidden",transition:"border-color 0.15s"}}>
                      {post.coverImg&&(
                        <div style={{position:"relative",maxHeight:280,overflow:"hidden",cursor:"pointer"}} onClick={()=>setLightbox(post.coverImg)}>
                          <img src={post.coverImg} alt="" style={{width:"100%",objectFit:"cover",display:"block",maxHeight:280}}/>
                          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 50%,rgba(15,23,42,.6) 100%)"}}/>
                        </div>
                      )}
                      <div style={{padding:"16px 18px"}}>
                        <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                          <div style={{width:40,height:40,borderRadius:"50%",background:post.color,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.anton,fontSize:15,color:"#fff"}}>{post.initials}</div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:14,fontWeight:700,color:T.ink}}>{post.author}</span>
                              {post.isOwn&&<span style={{fontFamily:T.mono,fontSize:9,color:T.faint}}>· you</span>}
                            </div>
                            <div style={{fontFamily:T.mono,fontSize:10,color:T.faint,marginTop:2}}>{post.role} · {post.time}</div>
                          </div>
                        </div>
                        {post.title&&<div style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>{post.title}</div>}
                        {post.content&&<p style={{fontSize:15,lineHeight:1.65,color:T.ink,marginBottom:14}}>{post.content}</p>}
                        <div style={{display:"flex",gap:16,borderTop:`1px solid ${T.line}`,paddingTop:12}}>
                          <button onClick={()=>toggleLike(post.id)} className="pb-like" style={{display:"flex",alignItems:"center",gap:6,fontFamily:T.mono,fontSize:11,fontWeight:700,background:"transparent",border:"none",color:post.liked?T.orange:T.faint,cursor:"pointer",padding:0,transition:"color 0.15s"}}>{post.liked?"♥":"♡"} {post.likes}</button>
                          <button style={{display:"flex",alignItems:"center",gap:6,fontFamily:T.mono,fontSize:11,fontWeight:700,background:"transparent",border:"none",color:T.faint,cursor:"pointer",padding:0}}>💬 {post.comments}</button>
                          {post.coverImg&&<button onClick={()=>setLightbox(post.coverImg)} style={{display:"flex",alignItems:"center",gap:6,fontFamily:T.mono,fontSize:11,fontWeight:700,background:"transparent",border:"none",color:T.faint,cursor:"pointer",padding:0,marginLeft:"auto"}}>🔍 View</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.muted}}>Photo gallery</p>
                  <button onClick={()=>setTab("gallery")} style={{fontFamily:T.mono,fontSize:9,fontWeight:700,color:T.orange,background:"none",border:"none",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase"}}>See all →</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:10}}>
                  {gallery.slice(0,6).map((img,i)=>(
                    <div key={i} onClick={()=>setLightbox(img)} style={{aspectRatio:"1",borderRadius:8,overflow:"hidden",cursor:"pointer"}}>
                      <img src={img} alt="" className="pb-gal" style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"all 0.2s"}}/>
                    </div>
                  ))}
                </div>
                <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.surface2,border:`1px solid ${T.line}`,borderRadius:10,padding:"9px",cursor:"pointer",width:"100%"}}>
                  📷 Add to gallery
                  <input type="file" accept="image/*" onChange={handleGalleryUpload} style={{display:"none"}}/>
                </label>
              </div>

              <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"16px 18px"}}>
                <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Top scholars</p>
                {LEADERS.map((l,i)=>(
                  <div key={l.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<LEADERS.length-1?`1px solid ${T.line}`:"none"}}>
                    <span style={{fontFamily:T.mono,fontSize:11,color:l.rank<=3?T.orange:T.faint,width:18,fontWeight:700}}>{l.rank<=3?["🥇","🥈","🥉"][l.rank-1]:`#${l.rank}`}</span>
                    <div style={{width:30,height:30,borderRadius:"50%",background:l.color,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>
                      {l.img?<img src={l.img} alt={l.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:l.initials}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:l.name==="You"?T.orange:T.ink}}>{l.name}</div>
                      <div style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{l.xp} XP</div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>router.push("/leaderboard")} style={{width:"100%",marginTop:12,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",border:`1px solid ${T.line}`,color:T.muted,borderRadius:10,padding:"9px",cursor:"pointer"}}>Full leaderboard →</button>
              </div>

              <div style={{background:T.navy,borderRadius:16,padding:"16px 18px"}}>
                <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.orange,marginBottom:12}}>Quick links</p>
                {[{l:"My dashboard",p:"/dashboard"},{l:"Course library",p:"/courses"},{l:"Mentorship",p:"/mentorship"},{l:"My profile",p:"/profile"}].map(({l,p})=>(
                  <button key={l} onClick={()=>router.push(p)} style={{display:"block",width:"100%",textAlign:"left",fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",background:"transparent",border:"none",color:"rgba(248,247,244,.45)",cursor:"pointer",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}>{l} →</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="gallery"&&(
          <div>
            <label className="pb-upload" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:T.surface,border:`2px dashed ${T.line}`,borderRadius:18,padding:"36px 24px",marginBottom:24,cursor:"pointer",transition:"all 0.2s",textAlign:"center"}}>
              {uploading?<div style={{fontFamily:T.mono,fontSize:13,color:T.orange}}>Uploading...</div>:<>
                <div style={{fontSize:40}}>📸</div>
                <div style={{fontFamily:T.anton,fontSize:22,textTransform:"uppercase",color:T.ink}}>Add to your gallery</div>
                <div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>Upload from your photo library · Saved permanently</div>
                <div style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",borderRadius:999,padding:"11px 24px",marginTop:4}}>Choose from library</div>
              </>}
              <input ref={galleryFileRef} type="file" accept="image/*" onChange={handleGalleryUpload} style={{display:"none"}}/>
            </label>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted}}>{gallery.length} photos</p>
              <button onClick={()=>setTab("feed")} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",border:`1px solid ${T.line}`,color:T.muted,borderRadius:999,padding:"7px 14px",cursor:"pointer"}}>← Back to feed</button>
            </div>
            {gallery.length===0?(
              <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"48px 24px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:14}}>📷</div>
                <p style={{fontFamily:T.mono,fontSize:12,color:T.faint}}>No photos yet. Upload your first one above!</p>
              </div>
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
    </div>
  );
}
