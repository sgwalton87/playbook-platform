"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import CollegeSearch from "@/components/CollegeSearch";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",purple:"#8B5CF6",amber:"#F59E0B",mono:"'Space Mono',monospace",sans:"'Hanken Grotesk',system-ui,sans-serif",anton:"'Anton',sans-serif"};
const SPORTS=["Basketball","Football","Soccer","Track & Field","Baseball","Softball","Swimming","Volleyball","Tennis","Cross Country","Wrestling","Lacrosse","Golf","Gymnastics","Cheer","Dance","Other"];
const TEAM_LEVELS=["Middle School","Junior Varsity (JV)","Varsity","Club / AAU","Travel Team","College","Semi-Pro","Professional"];
const GENDERS=["Male","Female","Non-binary","Prefer not to say"];
const RACES=["Black / African American","Hispanic / Latino","White","Asian","Native American / Alaska Native","Native Hawaiian / Pacific Islander","Two or more races","Prefer not to say"];
const INCOME=["Under $25,000","$25,000–$49,999","$50,000–$74,999","$75,000–$99,999","$100,000+","Prefer not to say"];
const GRADES=["6th Grade","7th Grade","8th Grade","9th Grade","10th Grade","11th Grade","12th Grade","College Freshman","College Sophomore","College Junior","College Senior"];
const RECRUITING_STATUS=["Not started","Actively recruiting","Have offers","Committed","Signed NLI","Transfer Student"];
const COLLEGE_LEVELS=["NCAA Division I","NCAA Division II","NCAA Division III","NAIA","JUCO / Community College","Any level","Not pursuing college athletics","Professional - Overseas"];
const FOLLOWER_RANGES=["Under 1,000","1,000–5,000","5,000–10,000","10,000–50,000","50,000–100,000","100,000+"];
const BRAND_INTERESTS=["Sports & fitness","Fashion & style","Food & nutrition","Gaming","Music","Education","Community & social impact","Lifestyle","Tech","Other"];
const DEAL_TYPES=["Product gifting","Paid social post","Brand ambassador","Event appearance","Content creation","Licensing"];
const PILLARS=[{key:"leadership",label:"Leadership",icon:"★"},{key:"finance",label:"Financial Literacy",icon:"$"},{key:"civic",label:"Civic Engagement",icon:"✓"},{key:"sel",label:"Social-Emotional Learning",icon:"♥"}];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [district, setDistrict] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [weightedGpa, setWeightedGpa] = useState("");
  const [unweightedGpa, setUnweightedGpa] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [ell, setEll] = useState(false);
  const [dreamSchool, setDreamSchool] = useState("");
  const [satScore, setSatScore] = useState("");
  const [actScore, setActScore] = useState("");
  const [intendedMajor, setIntendedMajor] = useState("");
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [teamLevel, setTeamLevel] = useState("");
  const [travelTeam, setTravelTeam] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [highlightReelUrl, setHighlightReelUrl] = useState("");
  const [recruitingStatus, setRecruitingStatus] = useState("");
  const [desiredCollegeLevel, setDesiredCollegeLevel] = useState("");
  const [athleteEmail, setAthleteEmail] = useState("");
  const [campsAttended, setCampsAttended] = useState("");
  const [nilInstagram, setNilInstagram] = useState("");
  const [nilTiktok, setNilTiktok] = useState("");
  const [nilTwitter, setNilTwitter] = useState("");
  const [nilFollowerRange, setNilFollowerRange] = useState("");
  const [nilBrandInterests, setNilBrandInterests] = useState<string[]>([]);
  const [nilWorkedWithBrands, setNilWorkedWithBrands] = useState(false);
  const [nilDealTypes, setNilDealTypes] = useState<string[]>([]);
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [hudl, setHudl] = useState("");
  const [youtube, setYoutube] = useState("");
  const [pillars, setPillars] = useState<string[]>([]);
  const [race, setRace] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");
  const [firstGen, setFirstGen] = useState(false);
  const [freeLunch, setFreeLunch] = useState(false);
  const [migrant, setMigrant] = useState(false);
  const [fosterYouth, setFosterYouth] = useState(false);
  const [unhoused, setUnhoused] = useState(false);
  const [iep, setIep] = useState(false);

  useEffect(()=>{
    (async()=>{
      const{data:u}=await supabase.auth.getUser();
      if(!u.user){router.replace("/login");return;}
      const{data:p}=await supabase.from("profiles").select("*").eq("id",u.user.id).single();
      if(!p){router.replace("/onboarding");return;}
      setProfile(p);
      setFirstName(p.first_name||"");setLastName(p.last_name||"");setBio(p.bio||"");setAvatarUrl(p.avatar_url||"");setGender(p.gender||"");setDob(p.date_of_birth||"");
      setSchool(p.school||"");setGrade(p.grade||"");setDistrict(p.school_district||"");setGradYear(p.grad_year||"");setWeightedGpa(p.weighted_gpa||"");setUnweightedGpa(p.unweighted_gpa||"");setCity(p.city||"");setZipCode(p.zip_code||"");setEll(p.english_language_learner||false);setDreamSchool(p.dream_school||"");setSatScore(p.sat_score||"");setActScore(p.act_score||"");setIntendedMajor(p.intended_major||"");
      setSport(p.sport||"");setPosition(p.position||"");setHeight(p.height||"");setWeight(p.weight||"");setJerseyNumber(p.jersey_number||"");setTeamLevel(p.team_level||"");setTravelTeam(p.travel_team||"");setCoachName(p.coach_name||"");setCoachEmail(p.coach_email||"");setHighlightReelUrl(p.highlight_reel_url||"");setRecruitingStatus(p.recruiting_status||"");setDesiredCollegeLevel(p.desired_college_level||"");setAthleteEmail(p.athlete_email||"");setCampsAttended(p.camps_attended||"");
      setNilInstagram(p.nil_instagram||"");setNilTiktok(p.nil_tiktok||"");setNilTwitter(p.nil_twitter||"");setNilFollowerRange(p.nil_follower_range||"");setNilBrandInterests(p.nil_brand_interests||[]);setNilWorkedWithBrands(p.nil_worked_with_brands||false);setNilDealTypes(p.nil_deal_types||[]);
      setInstagram(p.instagram||"");setTiktok(p.tiktok||"");setTwitter(p.twitter||"");setHudl(p.hudl||"");setYoutube(p.youtube||"");
      setPillars(p.pillars||[]);
      setRace(p.race||"");setHouseholdIncome(p.household_income||"");setFirstGen(p.first_generation||false);setFreeLunch(p.free_reduced_lunch||false);setMigrant(p.migrant_student||false);setFosterYouth(p.foster_youth||false);setUnhoused(p.unhoused||false);setIep(p.has_iep||false);
      setLoading(false);
    })();
  },[]);

  const uploadAvatar=async(file:File)=>{
    if(!profile?.id)return;
    setUploading(true);
    const ext=file.name.split(".").pop();
    const path=`${profile.id}/avatar.${ext}`;
    const{error}=await supabase.storage.from("avatars").upload(path,file,{upsert:true});
    if(!error){const{data}=supabase.storage.from("avatars").getPublicUrl(path);setAvatarUrl(data.publicUrl);await supabase.from("profiles").update({avatar_url:data.publicUrl}).eq("id",profile.id);}
    setUploading(false);
  };

  const save=async()=>{
    if(!profile?.id)return;
    setSaving(true);
    await supabase.from("profiles").update({
      first_name:firstName,last_name:lastName,full_name:`${firstName} ${lastName}`.trim(),bio,gender,date_of_birth:dob||null,
      school,grade,school_district:district,grad_year:gradYear,weighted_gpa:weightedGpa||null,unweighted_gpa:unweightedGpa||null,city,zip_code:zipCode,english_language_learner:ell,dream_school:dreamSchool||null,sat_score:satScore||null,act_score:actScore||null,intended_major:intendedMajor||null,
      sport:sport||null,position:position||null,height:height||null,weight:weight||null,jersey_number:jerseyNumber||null,team_level:teamLevel||null,travel_team:travelTeam||null,coach_name:coachName||null,coach_email:coachEmail||null,highlight_reel_url:highlightReelUrl||null,recruiting_status:recruitingStatus||null,desired_college_level:desiredCollegeLevel||null,athlete_email:athleteEmail||null,camps_attended:campsAttended||null,
      nil_instagram:nilInstagram||null,nil_tiktok:nilTiktok||null,nil_twitter:nilTwitter||null,nil_follower_range:nilFollowerRange||null,nil_brand_interests:nilBrandInterests.length>0?nilBrandInterests:null,nil_worked_with_brands:nilWorkedWithBrands,nil_deal_types:nilDealTypes.length>0?nilDealTypes:null,
      instagram:instagram||null,tiktok:tiktok||null,twitter:twitter||null,hudl:hudl||null,youtube:youtube||null,
      pillars,race:race||null,household_income:householdIncome||null,first_generation:firstGen,free_reduced_lunch:freeLunch,migrant_student:migrant,foster_youth:fosterYouth,unhoused,has_iep:iep,
    }).eq("id",profile.id);
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),3000);
  };

  if(loading)return<AppShell><div style={{padding:40,fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading profile...</div></AppShell>;

  const isAthlete=profile?.role==="scholar-athlete";
  const inp:React.CSSProperties={width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:10,padding:"11px 13px",fontSize:14,color:T.ink,fontFamily:T.sans,outline:"none"};
  const sel:React.CSSProperties={...inp,cursor:"pointer",appearance:"none" as const};
  const lbl:React.CSSProperties={fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:T.muted,display:"block",marginBottom:5};
  const chk=(active:boolean):React.CSSProperties=>({display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:9,border:`1.5px solid ${active?T.orange:T.line}`,background:active?T.orangeL:"transparent",cursor:"pointer",fontSize:13,color:active?T.orange:T.ink,transition:"all 0.12s"});

  const SECTIONS=[
    {key:"personal",label:"Personal",icon:"👤"},
    {key:"academic",label:"Academic",icon:"📚"},
    {key:"college",label:"College Goals",icon:"🎓"},
    ...(isAthlete?[{key:"athletic",label:"Athletic",icon:"🏅"},{key:"recruiting",label:"Recruiting",icon:"🏆"},{key:"nil",label:"NIL",icon:"💰"}]:[]),
    {key:"social",label:"Social",icon:"📱"},
    {key:"pillars",label:"Pillars",icon:"★"},
    {key:"background",label:"Background",icon:"🔒"},
  ];

  const Card=({children,title,subtitle}:{children:React.ReactNode;title:string;subtitle?:string})=>(
    <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"20px 22px",marginBottom:16}}>
      <div style={{marginBottom:16}}><h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,lineHeight:1}}>{title}</h2>{subtitle&&<p style={{fontSize:12,color:T.muted,marginTop:4}}>{subtitle}</p>}</div>
      {children}
    </div>
  );
  const G2=({children,mt}:{children:React.ReactNode;mt?:number})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:mt||0}}>{children}</div>;
  const F=({label,children,mt}:{label:string;children:React.ReactNode;mt?:number})=><div style={{marginTop:mt||0}}><label style={lbl}>{label}</label>{children}</div>;
  const Tog=({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void})=><div onClick={()=>onChange(!value)} style={chk(value)}><div style={{width:18,height:18,borderRadius:4,border:`2px solid ${value?T.orange:T.line}`,background:value?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{value&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>{label}</div>;
  const MS=({options,value,onChange}:{options:string[];value:string[];onChange:(v:string[])=>void})=><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{options.map(o=>{const a=value.includes(o);return<button key={o} onClick={()=>onChange(a?value.filter(x=>x!==o):[...value,o])} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",padding:"6px 11px",borderRadius:999,border:`1.5px solid ${a?T.orange:T.line}`,background:a?T.orangeL:"transparent",color:a?T.orange:T.muted,cursor:"pointer"}}>{o}</button>;})}</div>;

  return(
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}input:focus,select:focus,textarea:focus{border-color:${T.orange}!important;outline:none;}input::placeholder,textarea::placeholder{color:${T.faint};}select{appearance:none;}`}</style>
      <div style={{maxWidth:820,padding:"28px 32px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <div><p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,marginBottom:5}}>Your account</p><h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:32,textTransform:"uppercase",color:T.ink,lineHeight:.95}}>Edit Profile</h1></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {saved&&<span style={{fontFamily:T.mono,fontSize:11,color:T.green,fontWeight:700}}>✓ Saved!</span>}
            <button onClick={save} disabled={saving} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:saving?T.line:T.orange,color:saving?T.muted:"#fff",border:"none",borderRadius:12,padding:"12px 22px",cursor:saving?"default":"pointer"}}>{saving?"Saving...":"Save changes →"}</button>
          </div>
        </div>

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
          {SECTIONS.map(s=>(
            <button key={s.key} onClick={()=>setActiveSection(s.key)} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",padding:"8px 14px",borderRadius:999,border:`1.5px solid ${activeSection===s.key?T.orange:T.line}`,background:activeSection===s.key?T.orangeL:"transparent",color:activeSection===s.key?T.orange:T.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {activeSection==="personal"&&<Card title="Personal info">
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,padding:"16px",background:T.surface2,borderRadius:12}}>
            <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",background:T.line,flexShrink:0,border:`2px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {avatarUrl?<img src={avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontFamily:T.anton,fontSize:28,color:T.faint}}>{firstName[0]||"?"}</span>}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:4}}>{firstName} {lastName}</div>
              <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:8}}>@{profile?.username||"no username"} · {profile?.role}</div>
              <label style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.navy,color:"#fff",borderRadius:999,padding:"7px 14px",cursor:"pointer",display:"inline-block"}}>{uploading?"Uploading...":"Change photo"}<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&uploadAvatar(e.target.files[0])} style={{display:"none"}} disabled={uploading}/></label>
            </div>
          </div>
          <G2><F label="First name"><input style={inp} value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name"/></F><F label="Last name"><input style={inp} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name"/></F></G2>
          <F label="Bio" mt={14}><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell the community about yourself..." rows={3} style={{...inp,resize:"vertical" as const}}/></F>
          <G2 mt={14}><F label="Gender"><select style={sel} value={gender} onChange={e=>setGender(e.target.value)}><option value="">Select...</option>{GENDERS.map(g=><option key={g}>{g}</option>)}</select></F><F label="Date of birth"><input type="date" style={inp} value={dob} onChange={e=>setDob(e.target.value)}/></F></G2>
        </Card>}

        {activeSection==="academic"&&<Card title="Academic profile" subtitle="Your school information and academic records">
          <G2><F label="School name"><input style={inp} value={school} onChange={e=>setSchool(e.target.value)} placeholder="Lincoln High School"/></F><F label="School district"><input style={inp} value={district} onChange={e=>setDistrict(e.target.value)} placeholder="Oakland Unified"/></F></G2>
          <G2 mt={14}><F label="Grade"><select style={sel} value={grade} onChange={e=>setGrade(e.target.value)}><option value="">Select grade...</option>{GRADES.map(g=><option key={g}>{g}</option>)}</select></F><F label="Graduation year"><select style={sel} value={gradYear} onChange={e=>setGradYear(e.target.value)}><option value="">Select year...</option>{Array.from({length:10},(_,i)=>(new Date().getFullYear()+i).toString()).map(y=><option key={y}>{y}</option>)}</select></F></G2>
          <G2 mt={14}><F label="City"><input style={inp} value={city} onChange={e=>setCity(e.target.value)} placeholder="Oakland"/></F><F label="ZIP code"><input style={inp} value={zipCode} onChange={e=>setZipCode(e.target.value)} placeholder="94601"/></F></G2>
          <G2 mt={14}><F label="Weighted GPA"><input style={inp} value={weightedGpa} onChange={e=>setWeightedGpa(e.target.value)} placeholder="3.8"/></F><F label="Unweighted GPA"><input style={inp} value={unweightedGpa} onChange={e=>setUnweightedGpa(e.target.value)} placeholder="3.5"/></F></G2>
          <G2 mt={14}><F label="SAT score"><input style={inp} value={satScore} onChange={e=>setSatScore(e.target.value)} placeholder="1200"/></F><F label="ACT score"><input style={inp} value={actScore} onChange={e=>setActScore(e.target.value)} placeholder="26"/></F></G2>
          <F label="Intended major" mt={14}><input style={inp} value={intendedMajor} onChange={e=>setIntendedMajor(e.target.value)} placeholder="Pre-med, Computer Science..."/></F>
          <div style={{marginTop:14}}><Tog label="I am an English Language Learner (ELL)" value={ell} onChange={setEll}/></div>
        </Card>}

        {activeSection==="college"&&<Card title="College goals" subtitle="Your dream school and college plans">
          <F label="Dream school"><CollegeSearch value={dreamSchool} onChange={setDreamSchool} placeholder="Search colleges..."/></F>
        </Card>}

        {activeSection==="athletic"&&isAthlete&&<Card title="Athletic profile" subtitle="Your sport, stats, and team information">
          <F label="Primary sport"><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:2}}>{SPORTS.map(s=>{const a=sport===s;return<button key={s} onClick={()=>setSport(s)} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",padding:"7px 12px",borderRadius:999,border:`1.5px solid ${a?T.orange:T.line}`,background:a?T.orangeL:"transparent",color:a?T.orange:T.muted,cursor:"pointer"}}>{s}</button>;})}</div></F>
          <G2 mt={14}><F label="Position / event"><input style={inp} value={position} onChange={e=>setPosition(e.target.value)} placeholder="Point Guard, 100m..."/></F><F label="Jersey number"><input style={inp} value={jerseyNumber} onChange={e=>setJerseyNumber(e.target.value)} placeholder="11"/></F></G2>
          <G2 mt={14}><F label="Height"><input style={inp} value={height} onChange={e=>setHeight(e.target.value)} placeholder='5&apos;11"'/></F><F label="Weight (lbs)"><input style={inp} value={weight} onChange={e=>setWeight(e.target.value)} placeholder="155"/></F></G2>
          <F label="Team level" mt={14}><select style={sel} value={teamLevel} onChange={e=>setTeamLevel(e.target.value)}><option value="">Select level...</option>{TEAM_LEVELS.map(l=><option key={l}>{l}</option>)}</select></F>
          <F label="Travel / club team" mt={14}><input style={inp} value={travelTeam} onChange={e=>setTravelTeam(e.target.value)} placeholder="Oakland Soldiers"/></F>
          <G2 mt={14}><F label="Coach name"><input style={inp} value={coachName} onChange={e=>setCoachName(e.target.value)} placeholder="Coach Smith"/></F><F label="Coach email"><input type="email" style={inp} value={coachEmail} onChange={e=>setCoachEmail(e.target.value)} placeholder="coach@school.edu"/></F></G2>
        </Card>}

        {activeSection==="recruiting"&&isAthlete&&<Card title="Recruiting profile" subtitle="Your recruiting status and college athletic goals">
          <G2><F label="Recruiting status"><select style={sel} value={recruitingStatus} onChange={e=>setRecruitingStatus(e.target.value)}><option value="">Select status...</option>{RECRUITING_STATUS.map(s=><option key={s}>{s}</option>)}</select></F><F label="Desired college level"><select style={sel} value={desiredCollegeLevel} onChange={e=>setDesiredCollegeLevel(e.target.value)}><option value="">Select level...</option>{COLLEGE_LEVELS.map(l=><option key={l}>{l}</option>)}</select></F></G2>
          <F label="Athletic / recruiting email" mt={14}><input type="email" style={inp} value={athleteEmail} onChange={e=>setAthleteEmail(e.target.value)} placeholder="yourname@email.com"/></F>
          <F label="Highlight reel URL" mt={14}><input style={inp} value={highlightReelUrl} onChange={e=>setHighlightReelUrl(e.target.value)} placeholder="https://hudl.com/v/..."/></F>
          <F label="Showcases / camps attended" mt={14}><input style={inp} value={campsAttended} onChange={e=>setCampsAttended(e.target.value)} placeholder="Nike EYBL, Under Armour Next..."/></F>
        </Card>}

        {activeSection==="nil"&&isAthlete&&<Card title="NIL profile" subtitle="Your social media and brand partnership information">
          <G2><F label="Instagram handle"><input style={inp} value={nilInstagram} onChange={e=>setNilInstagram(e.target.value)} placeholder="@handle"/></F><F label="TikTok handle"><input style={inp} value={nilTiktok} onChange={e=>setNilTiktok(e.target.value)} placeholder="@handle"/></F></G2>
          <G2 mt={14}><F label="Twitter / X handle"><input style={inp} value={nilTwitter} onChange={e=>setNilTwitter(e.target.value)} placeholder="@handle"/></F><F label="Total followers"><select style={sel} value={nilFollowerRange} onChange={e=>setNilFollowerRange(e.target.value)}><option value="">Select range...</option>{FOLLOWER_RANGES.map(r=><option key={r}>{r}</option>)}</select></F></G2>
          <F label="Brand interests" mt={14}><MS options={BRAND_INTERESTS} value={nilBrandInterests} onChange={setNilBrandInterests}/></F>
          <F label="Preferred deal types" mt={14}><MS options={DEAL_TYPES} value={nilDealTypes} onChange={setNilDealTypes}/></F>
          <div style={{marginTop:14}}><Tog label="I have previously worked with brands or sponsors" value={nilWorkedWithBrands} onChange={setNilWorkedWithBrands}/></div>
        </Card>}

        {activeSection==="social"&&<Card title="Social media" subtitle="Your public social media handles">
          <G2><F label="Instagram"><input style={inp} value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="@handle"/></F><F label="TikTok"><input style={inp} value={tiktok} onChange={e=>setTiktok(e.target.value)} placeholder="@handle"/></F></G2>
          <G2 mt={14}><F label="Twitter / X"><input style={inp} value={twitter} onChange={e=>setTwitter(e.target.value)} placeholder="@handle"/></F><F label="Hudl"><input style={inp} value={hudl} onChange={e=>setHudl(e.target.value)} placeholder="https://hudl.com/..."/></F></G2>
          <F label="YouTube" mt={14}><input style={inp} value={youtube} onChange={e=>setYoutube(e.target.value)} placeholder="https://youtube.com/..."/></F>
        </Card>}

        {activeSection==="pillars"&&<Card title="Your pillars" subtitle="Select the areas that interest you most — these drive your course suggestions">
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {PILLARS.map(p=>{const a=pillars.includes(p.key);return(
              <div key={p.key} onClick={()=>setPillars(prev=>prev.includes(p.key)?prev.filter(x=>x!==p.key):[...prev,p.key])} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:`1.5px solid ${a?T.orange:T.line}`,background:a?T.orangeL:"transparent",cursor:"pointer",transition:"all 0.12s"}}>
                <div style={{width:36,height:36,borderRadius:9,background:a?T.orange:T.line,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:a?"#fff":T.muted,flexShrink:0}}>{p.icon}</div>
                <div style={{flex:1,fontSize:14,fontWeight:700,color:a?T.orange:T.ink}}>{p.label}</div>
                <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${a?T.orange:T.line}`,background:a?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{a&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}</div>
              </div>
            );})}
          </div>
        </Card>}

        {activeSection==="background"&&<Card title="Background info" subtitle="Private — used only to secure funding and resources for scholars. Never shown publicly.">
          <div style={{background:"#EFF6FF",borderRadius:10,padding:"12px 14px",fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:18,borderLeft:`3px solid ${T.blue}`}}>🔒 This information helps Playbook Series secure grants and resources specifically for you. It is completely private and never shared publicly.</div>
          <G2><F label="Race / ethnicity"><select style={sel} value={race} onChange={e=>setRace(e.target.value)}><option value="">Select...</option>{RACES.map(r=><option key={r}>{r}</option>)}</select></F><F label="Household income"><select style={sel} value={householdIncome} onChange={e=>setHouseholdIncome(e.target.value)}><option value="">Select...</option>{INCOME.map(i=><option key={i}>{i}</option>)}</select></F></G2>
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
            <Tog label="First-generation college student" value={firstGen} onChange={setFirstGen}/>
            <Tog label="Free or reduced-price lunch eligible" value={freeLunch} onChange={setFreeLunch}/>
            <Tog label="Migrant student" value={migrant} onChange={setMigrant}/>
            <Tog label="Foster youth / former foster care" value={fosterYouth} onChange={setFosterYouth}/>
            <Tog label="Experiencing housing instability" value={unhoused} onChange={setUnhoused}/>
            <Tog label="I have an IEP or 504 plan" value={iep} onChange={setIep}/>
          </div>
        </Card>}

        <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center",paddingTop:8}}>
          {saved&&<span style={{fontFamily:T.mono,fontSize:11,color:T.green,fontWeight:700}}>✓ All changes saved!</span>}
          <button onClick={save} disabled={saving} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:saving?T.line:T.orange,color:saving?T.muted:"#fff",border:"none",borderRadius:12,padding:"13px 24px",cursor:saving?"default":"pointer"}}>{saving?"Saving...":"Save changes →"}</button>
        </div>
      </div>
    </AppShell>
  );
}
