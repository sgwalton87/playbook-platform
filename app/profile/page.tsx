"use client";
import { useEffect, useState, useCallback } from "react";
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
const PILLARS=[
  {key:"leadership",label:"Leadership",icon:"★",color:"#F97316",desc:"Develop your voice, build your team, and lead on and off the field. Captaincy, accountability, communication, and leaving a legacy."},
  {key:"finance",label:"Financial Literacy",icon:"$",color:"#3B82F6",desc:"Learn to budget, save, invest, and understand NIL basics. Build generational wealth starting from your first paycheck."},
  {key:"civic",label:"Civic Engagement",icon:"✓",color:"#10B981",desc:"Create change in your community through youth advocacy, service projects, and understanding your power as a citizen."},
  {key:"sel",label:"Social-Emotional Learning",icon:"♥",color:"#8B5CF6",desc:"Strengthen your mental health, resilience, and identity beyond sport. Tools to manage pressure, build relationships, and thrive."},
];
const MAJOR_FIELDS=["Accounting","Aerospace Engineering","African American Studies","Agriculture","Anthropology","Architecture","Art & Design","Biology","Business Administration","Chemistry","Civil Engineering","Communications","Computer Science","Criminal Justice","Data Science","Early Childhood Education","Economics","Education","Electrical Engineering","English Literature","Environmental Science","Fashion Design","Film & Media Studies","Finance","Forensic Science","Graphic Design","Health Sciences","History","Hospitality Management","Human Development","Information Technology","International Relations","Journalism","Kinesiology / Sports Science","Law (Pre-Law)","Liberal Arts","Marketing","Mathematics","Mechanical Engineering","Medicine (Pre-Med)","Music","Neuroscience","Nursing","Nutrition & Dietetics","Philosophy","Physical Therapy","Physics","Political Science","Psychology","Public Health","Public Policy","Real Estate","Social Work","Sociology","Software Engineering","Sports Management","Theater Arts","Urban Planning","Veterinary Science (Pre-Vet)","Other / Undecided"];

const inp:React.CSSProperties={width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:10,padding:"11px 13px",fontSize:14,color:T.ink,fontFamily:"'Hanken Grotesk',system-ui,sans-serif",outline:"none"};
const sel:React.CSSProperties={...inp,cursor:"pointer",appearance:"none" as const};
const lbl:React.CSSProperties={fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:T.muted,display:"block",marginBottom:5};

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
  const [favoriteQuote, setFavoriteQuote] = useState("");

  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [district, setDistrict] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [weightedGpa, setWeightedGpa] = useState("");
  const [unweightedGpa, setUnweightedGpa] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [ell, setEll] = useState(false);
  const [satScore, setSatScore] = useState("");
  const [actScore, setActScore] = useState("");
  const [intendedMajor, setIntendedMajor] = useState("");

  const [dreamSchool, setDreamSchool] = useState("");
  const [collegeList, setCollegeList] = useState<string[]>(Array(9).fill(""));

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
      setFirstName(p.first_name||""); setLastName(p.last_name||""); setBio(p.bio||""); setAvatarUrl(p.avatar_url||""); setGender(p.gender||""); setDob(p.date_of_birth||""); setFavoriteQuote(p.favorite_quote||"");
      setSchool(p.school||""); setGrade(p.grade||""); setDistrict(p.school_district||""); setGradYear(p.grad_year||""); setWeightedGpa(p.weighted_gpa||p.gpa||""); setUnweightedGpa(p.unweighted_gpa||""); setCity(p.city||""); setZipCode(p.zip_code||""); setEll(p.english_language_learner||false); setSatScore(p.sat_score||""); setActScore(p.act_score||""); setIntendedMajor(p.intended_major||"");
      setDreamSchool(p.dream_school||"");
      setCollegeList([p.college_list_2||"",p.college_list_3||"",p.college_list_4||"",p.college_list_5||"",p.college_list_6||"",p.college_list_7||"",p.college_list_8||"",p.college_list_9||"",p.college_list_10||""]);
      setSport(p.sport||""); setPosition(p.position||""); setHeight(p.height||""); setWeight(p.weight||""); setJerseyNumber(p.jersey_number||""); setTeamLevel(p.team_level||""); setTravelTeam(p.travel_team||""); setCoachName(p.coach_name||""); setCoachEmail(p.coach_email||"");
      setHighlightReelUrl(p.highlight_reel_url||""); setRecruitingStatus(p.recruiting_status||""); setDesiredCollegeLevel(p.desired_college_level||""); setAthleteEmail(p.athlete_email||""); setCampsAttended(p.camps_attended||"");
      setNilInstagram(p.nil_instagram||""); setNilTiktok(p.nil_tiktok||""); setNilTwitter(p.nil_twitter||""); setNilFollowerRange(p.nil_follower_range||""); setNilBrandInterests(p.nil_brand_interests||[]); setNilWorkedWithBrands(p.nil_worked_with_brands||false); setNilDealTypes(p.nil_deal_types||[]);
      setInstagram(p.instagram||""); setTiktok(p.tiktok||""); setTwitter(p.twitter||""); setHudl(p.hudl||""); setYoutube(p.youtube||"");
      setPillars(p.pillars||[]);
      setRace(p.race||""); setHouseholdIncome(p.household_income||""); setFirstGen(p.first_generation||false); setFreeLunch(p.free_reduced_lunch||false); setMigrant(p.migrant_student||false); setFosterYouth(p.foster_youth||false); setUnhoused(p.unhoused||false); setIep(p.has_iep||false);
      setLoading(false);
    })();
  },[]);

  const uploadAvatar=useCallback(async(file:File)=>{
    if(!profile?.id)return;
    setUploading(true);
    const ext=file.name.split(".").pop();
    const path=`${profile.id}/avatar.${ext}`;
    const{error}=await supabase.storage.from("avatars").upload(path,file,{upsert:true});
    if(!error){const{data}=supabase.storage.from("avatars").getPublicUrl(path);setAvatarUrl(data.publicUrl);await supabase.from("profiles").update({avatar_url:data.publicUrl}).eq("id",profile.id);}
    setUploading(false);
  },[profile?.id]);

  const save=useCallback(async()=>{
    if(!profile?.id)return;
    setSaving(true);
    await supabase.from("profiles").update({
      first_name:firstName,last_name:lastName,full_name:`${firstName} ${lastName}`.trim(),bio,gender,date_of_birth:dob||null,favorite_quote:favoriteQuote||null,
      school,grade,school_district:district,grad_year:gradYear,weighted_gpa:weightedGpa||null,unweighted_gpa:unweightedGpa||null,city,zip_code:zipCode,english_language_learner:ell,dream_school:dreamSchool||null,sat_score:satScore||null,act_score:actScore||null,intended_major:intendedMajor||null,
      college_list_2:collegeList[0]||null,college_list_3:collegeList[1]||null,college_list_4:collegeList[2]||null,college_list_5:collegeList[3]||null,college_list_6:collegeList[4]||null,college_list_7:collegeList[5]||null,college_list_8:collegeList[6]||null,college_list_9:collegeList[7]||null,college_list_10:collegeList[8]||null,
      sport:sport||null,position:position||null,height:height||null,weight:weight||null,jersey_number:jerseyNumber||null,team_level:teamLevel||null,travel_team:travelTeam||null,coach_name:coachName||null,coach_email:coachEmail||null,
      highlight_reel_url:highlightReelUrl||null,recruiting_status:recruitingStatus||null,desired_college_level:desiredCollegeLevel||null,athlete_email:athleteEmail||null,camps_attended:campsAttended||null,
      nil_instagram:nilInstagram||null,nil_tiktok:nilTiktok||null,nil_twitter:nilTwitter||null,nil_follower_range:nilFollowerRange||null,nil_brand_interests:nilBrandInterests.length>0?nilBrandInterests:null,nil_worked_with_brands:nilWorkedWithBrands,nil_deal_types:nilDealTypes.length>0?nilDealTypes:null,
      instagram:instagram||null,tiktok:tiktok||null,twitter:twitter||null,hudl:hudl||null,youtube:youtube||null,
      pillars,race:race||null,household_income:householdIncome||null,first_generation:firstGen,free_reduced_lunch:freeLunch,migrant_student:migrant,foster_youth:fosterYouth,unhoused,has_iep:iep,
    }).eq("id",profile.id);
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),3000);
  },[profile?.id,firstName,lastName,bio,gender,dob,favoriteQuote,school,grade,district,gradYear,weightedGpa,unweightedGpa,city,zipCode,ell,dreamSchool,satScore,actScore,intendedMajor,collegeList,sport,position,height,weight,jerseyNumber,teamLevel,travelTeam,coachName,coachEmail,highlightReelUrl,recruitingStatus,desiredCollegeLevel,athleteEmail,campsAttended,nilInstagram,nilTiktok,nilTwitter,nilFollowerRange,nilBrandInterests,nilWorkedWithBrands,nilDealTypes,instagram,tiktok,twitter,hudl,youtube,pillars,race,householdIncome,firstGen,freeLunch,migrant,fosterYouth,unhoused,iep]);

  if(loading)return<AppShell><div style={{padding:40,fontFamily:"'Space Mono',monospace",fontSize:12,color:T.faint}}>Loading profile...</div></AppShell>;

  const isAthlete=profile?.role==="scholar-athlete";

  const SECTIONS=[
    {key:"personal",label:"Personal",icon:"👤"},
    {key:"academic",label:"Academic",icon:"📚"},
    {key:"college",label:"College Goals",icon:"🎓"},
    ...(isAthlete?[{key:"athletic",label:"Athletic",icon:"🏅"},{key:"recruiting",label:"Recruiting",icon:"🏆"},{key:"nil",label:"NIL",icon:"💰"}]:[]),
    {key:"social",label:"Social",icon:"📱"},
    {key:"pillars",label:"Pillars",icon:"★"},
    {key:"background",label:"Background",icon:"🔒"},
  ];

  const toggleMulti=(arr:string[],val:string,setter:(v:string[])=>void)=>{
    setter(arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]);
  };

  return(
    <AppShell>
      <div style={{padding:"28px 32px",boxSizing:"border-box"}}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}input:focus,select:focus,textarea:focus{border-color:${T.orange}!important;outline:none;}input::placeholder,textarea::placeholder{color:${T.faint};}select{appearance:none;}.tog:hover{border-color:${T.orange}!important;}`}</style>
      <div style={{}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,marginBottom:5}}>Your account</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:32,textTransform:"uppercase",color:T.ink,lineHeight:.95}}>Edit Profile</h1>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {saved&&<span style={{fontFamily:T.mono,fontSize:11,color:T.green,fontWeight:700}}>✓ Saved!</span>}
            <button onClick={save} disabled={saving} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:saving?T.line:T.orange,color:saving?T.muted:"#fff",border:"none",borderRadius:12,padding:"12px 22px",cursor:saving?"default":"pointer"}}>
              {saving?"Saving...":"Save changes →"}
            </button>
          </div>
        </div>

        {/* Section nav */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
          {SECTIONS.map(s=>(
            <button key={s.key} onClick={()=>setActiveSection(s.key)}
              style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",padding:"8px 14px",borderRadius:999,border:`1.5px solid ${activeSection===s.key?T.orange:T.line}`,background:activeSection===s.key?T.orangeL:"transparent",color:activeSection===s.key?T.orange:T.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* PERSONAL */}
        {activeSection==="personal"&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:18}}>Personal Info</h2>

            {/* Avatar — larger */}
            <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,padding:"20px",background:T.surface2,borderRadius:14}}>
              <div style={{width:110,height:110,borderRadius:"50%",overflow:"hidden",background:T.line,flexShrink:0,border:`3px solid ${T.orange}33`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {avatarUrl?<img src={avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontFamily:T.anton,fontSize:40,color:T.faint}}>{firstName[0]||"?"}</span>}
              </div>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:3}}>{firstName} {lastName}</div>
                <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:12}}>@{profile?.username||"no username"} · {profile?.role}</div>
                <label style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.navy,color:"#fff",borderRadius:999,padding:"9px 18px",cursor:"pointer",display:"inline-block"}}>
                  {uploading?"Uploading...":"Change photo"}
                  <input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&uploadAvatar(e.target.files[0])} style={{display:"none"}} disabled={uploading}/>
                </label>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>First name</label><input style={inp} value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name"/></div>
              <div><label style={lbl}>Last name</label><input style={inp} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name"/></div>
            </div>

            <div style={{marginTop:14}}>
              <label style={lbl}>Favorite quote (shows on your public profile)</label>
              <input style={inp} value={favoriteQuote} onChange={e=>setFavoriteQuote(e.target.value)} placeholder={`"The only way to do great work is to love what you do." — Steve Jobs`}/>
            </div>

            <div style={{marginTop:14}}>
              <label style={lbl}>Bio</label>
              <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell the community about yourself..." rows={3} style={{...inp,resize:"vertical" as const}}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div>
                <label style={lbl}>Gender</label>
                <select style={sel} value={gender} onChange={e=>setGender(e.target.value)}>
                  <option value="">Select...</option>
                  {GENDERS.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Date of birth</label><input type="date" style={inp} value={dob} onChange={e=>setDob(e.target.value)}/></div>
            </div>
          </div>
        )}

        {/* ACADEMIC */}
        {activeSection==="academic"&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>Academic Profile</h2>
            <p style={{fontSize:12,color:T.muted,marginBottom:18}}>Your school information and academic records</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>School name</label><input style={inp} value={school} onChange={e=>setSchool(e.target.value)} placeholder="Lincoln High School"/></div>
              <div><label style={lbl}>School district</label><input style={inp} value={district} onChange={e=>setDistrict(e.target.value)} placeholder="Oakland Unified"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div>
                <label style={lbl}>Grade</label>
                <select style={sel} value={grade} onChange={e=>setGrade(e.target.value)}>
                  <option value="">Select grade...</option>
                  {GRADES.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Graduation year</label>
                <select style={sel} value={gradYear} onChange={e=>setGradYear(e.target.value)}>
                  <option value="">Select year...</option>
                  {Array.from({length:10},(_,i)=>(new Date().getFullYear()+i).toString()).map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div><label style={lbl}>City</label><input style={inp} value={city} onChange={e=>setCity(e.target.value)} placeholder="Oakland"/></div>
              <div><label style={lbl}>ZIP code</label><input style={inp} value={zipCode} onChange={e=>setZipCode(e.target.value)} placeholder="94601"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div><label style={lbl}>Weighted GPA</label><input style={inp} value={weightedGpa} onChange={e=>setWeightedGpa(e.target.value)} placeholder="3.8"/></div>
              <div><label style={lbl}>Unweighted GPA</label><input style={inp} value={unweightedGpa} onChange={e=>setUnweightedGpa(e.target.value)} placeholder="3.5"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div><label style={lbl}>SAT score</label><input style={inp} value={satScore} onChange={e=>setSatScore(e.target.value)} placeholder="1200"/></div>
              <div><label style={lbl}>ACT score</label><input style={inp} value={actScore} onChange={e=>setActScore(e.target.value)} placeholder="26"/></div>
            </div>
            <div style={{marginTop:14}}>
              <label style={lbl}>Intended major / field of study (optional)</label>
              <select style={sel} value={intendedMajor} onChange={e=>setIntendedMajor(e.target.value)}>
                <option value="">Select a field or leave blank if undecided...</option>
                {MAJOR_FIELDS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{marginTop:14}}>
              <div onClick={()=>setEll(!ell)} className="tog" style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:9,border:`1.5px solid ${ell?T.orange:T.line}`,background:ell?T.orangeL:"transparent",cursor:"pointer",fontSize:13,color:ell?T.orange:T.ink,transition:"all 0.12s"}}>
                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${ell?T.orange:T.line}`,background:ell?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{ell&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>
                I am an English Language Learner (ELL)
              </div>
            </div>
          </div>
        )}

        {/* COLLEGE GOALS */}
        {activeSection==="college"&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>College Goals</h2>
            <p style={{fontSize:12,color:T.muted,marginBottom:18}}>Your dream school and college list</p>

            <div>
              <label style={lbl}>🌟 Dream school (#1)</label>
              <CollegeSearch value={dreamSchool} onChange={setDreamSchool} placeholder="Search your dream school..."/>
            </div>

            <div style={{marginTop:20,padding:"16px",background:T.surface2,borderRadius:12}}>
              <label style={{...lbl,marginBottom:12}}>College list — top 10 (optional)</label>
              <p style={{fontSize:12,color:T.muted,marginBottom:14}}>Add up to 9 more schools to your list. These will show on your profile and transcript.</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {collegeList.map((val,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontFamily:T.mono,fontSize:11,fontWeight:700,color:T.orange,width:24,flexShrink:0}}>#{i+2}</div>
                    <div style={{flex:1}}>
                      <CollegeSearch
                        value={val}
                        onChange={v=>{const updated=[...collegeList];updated[i]=v;setCollegeList(updated);}}
                        placeholder={`Search school #${i+2}...`}
                      />
                    </div>
                    {val&&<button onClick={()=>{const updated=[...collegeList];updated[i]="";setCollegeList(updated);}} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:16,padding:"0 4px"}}>✕</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ATHLETIC */}
        {activeSection==="athletic"&&isAthlete&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>Athletic Profile</h2>
            <p style={{fontSize:12,color:T.muted,marginBottom:18}}>Your sport, stats, and team information</p>

            <label style={lbl}>Primary sport</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {SPORTS.map(s=>{const a=sport===s;return<button key={s} onClick={()=>setSport(s)} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",padding:"7px 12px",borderRadius:999,border:`1.5px solid ${a?T.orange:T.line}`,background:a?T.orangeL:"transparent",color:a?T.orange:T.muted,cursor:"pointer"}}>{s}</button>;})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>Position / event</label><input style={inp} value={position} onChange={e=>setPosition(e.target.value)} placeholder="Point Guard, 100m..."/></div>
              <div><label style={lbl}>Jersey number</label><input style={inp} value={jerseyNumber} onChange={e=>setJerseyNumber(e.target.value)} placeholder="11"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div><label style={lbl}>Height</label><input style={inp} value={height} onChange={e=>setHeight(e.target.value)} placeholder='5&apos;11"'/></div>
              <div><label style={lbl}>Weight (lbs)</label><input style={inp} value={weight} onChange={e=>setWeight(e.target.value)} placeholder="155"/></div>
            </div>
            <div style={{marginTop:14}}>
              <label style={lbl}>Team level</label>
              <select style={sel} value={teamLevel} onChange={e=>setTeamLevel(e.target.value)}><option value="">Select level...</option>{TEAM_LEVELS.map(l=><option key={l}>{l}</option>)}</select>
            </div>
            <div style={{marginTop:14}}><label style={lbl}>Travel / club team</label><input style={inp} value={travelTeam} onChange={e=>setTravelTeam(e.target.value)} placeholder="Oakland Soldiers"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div><label style={lbl}>Coach name</label><input style={inp} value={coachName} onChange={e=>setCoachName(e.target.value)} placeholder="Coach Smith"/></div>
              <div><label style={lbl}>Coach email</label><input type="email" style={inp} value={coachEmail} onChange={e=>setCoachEmail(e.target.value)} placeholder="coach@school.edu"/></div>
            </div>
          </div>
        )}

        {/* RECRUITING */}
        {activeSection==="recruiting"&&isAthlete&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>Recruiting Profile</h2>
            <p style={{fontSize:12,color:T.muted,marginBottom:18}}>Your recruiting status and college athletic goals</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>Recruiting status</label><select style={sel} value={recruitingStatus} onChange={e=>setRecruitingStatus(e.target.value)}><option value="">Select status...</option>{RECRUITING_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={lbl}>Desired college level</label><select style={sel} value={desiredCollegeLevel} onChange={e=>setDesiredCollegeLevel(e.target.value)}><option value="">Select level...</option>{COLLEGE_LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <div style={{marginTop:14}}><label style={lbl}>Athletic / recruiting email</label><input type="email" style={inp} value={athleteEmail} onChange={e=>setAthleteEmail(e.target.value)} placeholder="yourname@email.com"/></div>
            <div style={{marginTop:14}}><label style={lbl}>Highlight reel URL</label><input style={inp} value={highlightReelUrl} onChange={e=>setHighlightReelUrl(e.target.value)} placeholder="https://hudl.com/v/..."/></div>
            <div style={{marginTop:14}}><label style={lbl}>Showcases / camps attended</label><input style={inp} value={campsAttended} onChange={e=>setCampsAttended(e.target.value)} placeholder="Nike EYBL, Under Armour Next..."/></div>
          </div>
        )}

        {/* NIL */}
        {activeSection==="nil"&&isAthlete&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>NIL Profile</h2>
            <p style={{fontSize:12,color:T.muted,marginBottom:18}}>Your social media and brand partnership information</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>Instagram handle</label><input style={inp} value={nilInstagram} onChange={e=>setNilInstagram(e.target.value)} placeholder="@handle"/></div>
              <div><label style={lbl}>TikTok handle</label><input style={inp} value={nilTiktok} onChange={e=>setNilTiktok(e.target.value)} placeholder="@handle"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div><label style={lbl}>Twitter / X handle</label><input style={inp} value={nilTwitter} onChange={e=>setNilTwitter(e.target.value)} placeholder="@handle"/></div>
              <div><label style={lbl}>Total followers</label><select style={sel} value={nilFollowerRange} onChange={e=>setNilFollowerRange(e.target.value)}><option value="">Select range...</option>{FOLLOWER_RANGES.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div style={{marginTop:14}}>
              <label style={lbl}>Brand interests</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {BRAND_INTERESTS.map(o=>{const a=nilBrandInterests.includes(o);return<button key={o} onClick={()=>toggleMulti(nilBrandInterests,o,setNilBrandInterests)} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",padding:"6px 11px",borderRadius:999,border:`1.5px solid ${a?T.orange:T.line}`,background:a?T.orangeL:"transparent",color:a?T.orange:T.muted,cursor:"pointer"}}>{o}</button>;})}
              </div>
            </div>
            <div style={{marginTop:14}}>
              <label style={lbl}>Preferred deal types</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {DEAL_TYPES.map(o=>{const a=nilDealTypes.includes(o);return<button key={o} onClick={()=>toggleMulti(nilDealTypes,o,setNilDealTypes)} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",padding:"6px 11px",borderRadius:999,border:`1.5px solid ${a?T.orange:T.line}`,background:a?T.orangeL:"transparent",color:a?T.orange:T.muted,cursor:"pointer"}}>{o}</button>;})}
              </div>
            </div>
            <div style={{marginTop:14}}>
              <div onClick={()=>setNilWorkedWithBrands(!nilWorkedWithBrands)} className="tog" style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:9,border:`1.5px solid ${nilWorkedWithBrands?T.orange:T.line}`,background:nilWorkedWithBrands?T.orangeL:"transparent",cursor:"pointer",fontSize:13,color:nilWorkedWithBrands?T.orange:T.ink}}>
                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${nilWorkedWithBrands?T.orange:T.line}`,background:nilWorkedWithBrands?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{nilWorkedWithBrands&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>
                I have previously worked with brands or sponsors
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL */}
        {activeSection==="social"&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>Social Media</h2>
            <p style={{fontSize:12,color:T.muted,marginBottom:18}}>Your public social media handles — these appear on your public profile</p>

            {/* Saved handles display */}
            {(instagram||tiktok||twitter||hudl||youtube)&&(
              <div style={{background:T.navy,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
                <div style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Connected accounts</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {instagram&&<a href={`https://instagram.com/${instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.08)",borderRadius:999,padding:"6px 12px",textDecoration:"none"}}><span style={{fontSize:14}}>📸</span><span style={{fontFamily:T.mono,fontSize:11,color:"#F8F7F4",fontWeight:700}}>{instagram}</span></a>}
                  {tiktok&&<a href={`https://tiktok.com/${tiktok.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.08)",borderRadius:999,padding:"6px 12px",textDecoration:"none"}}><span style={{fontSize:14}}>🎵</span><span style={{fontFamily:T.mono,fontSize:11,color:"#F8F7F4",fontWeight:700}}>{tiktok}</span></a>}
                  {twitter&&<a href={`https://twitter.com/${twitter.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.08)",borderRadius:999,padding:"6px 12px",textDecoration:"none"}}><span style={{fontSize:14}}>🐦</span><span style={{fontFamily:T.mono,fontSize:11,color:"#F8F7F4",fontWeight:700}}>{twitter}</span></a>}
                  {hudl&&<a href={hudl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.08)",borderRadius:999,padding:"6px 12px",textDecoration:"none"}}><span style={{fontSize:14}}>🎬</span><span style={{fontFamily:T.mono,fontSize:11,color:"#F8F7F4",fontWeight:700}}>Hudl</span></a>}
                  {youtube&&<a href={youtube} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.08)",borderRadius:999,padding:"6px 12px",textDecoration:"none"}}><span style={{fontSize:14}}>▶️</span><span style={{fontFamily:T.mono,fontSize:11,color:"#F8F7F4",fontWeight:700}}>YouTube</span></a>}
                </div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>Instagram</label><input style={inp} value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="@handle"/></div>
              <div><label style={lbl}>TikTok</label><input style={inp} value={tiktok} onChange={e=>setTiktok(e.target.value)} placeholder="@handle"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div><label style={lbl}>Twitter / X</label><input style={inp} value={twitter} onChange={e=>setTwitter(e.target.value)} placeholder="@handle"/></div>
              <div><label style={lbl}>Hudl</label><input style={inp} value={hudl} onChange={e=>setHudl(e.target.value)} placeholder="https://hudl.com/..."/></div>
            </div>
            <div style={{marginTop:14}}><label style={lbl}>YouTube</label><input style={inp} value={youtube} onChange={e=>setYoutube(e.target.value)} placeholder="https://youtube.com/..."/></div>
          </div>
        )}

        {/* PILLARS */}
        {activeSection==="pillars"&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>Your Pillars</h2>
            <p style={{fontSize:12,color:T.muted,marginBottom:20}}>Select the areas that interest you most — your dashboard and courses will be personalized around your choices.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {PILLARS.map((p:any)=>{const a=pillars.includes(p.key);return(
                <div key={p.key} onClick={()=>setPillars(prev=>prev.includes(p.key)?prev.filter(x=>x!==p.key):[...prev,p.key])}
                  style={{display:"flex",gap:14,padding:"16px 18px",borderRadius:14,border:`1.5px solid ${a?p.color:T.line}`,background:a?p.color+"0f":"transparent",cursor:"pointer",transition:"all 0.15s"}}>
                  <div style={{width:44,height:44,borderRadius:11,background:a?p.color:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:a?"#fff":T.muted,flexShrink:0,transition:"all 0.15s"}}>{p.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:a?p.color:T.ink,marginBottom:4}}>{p.label}</div>
                    <div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>{p.desc}</div>
                  </div>
                  <div style={{width:24,height:24,borderRadius:7,border:`2px solid ${a?p.color:T.line}`,background:a?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,transition:"all 0.15s"}}>{a&&<span style={{fontSize:13,color:"#fff"}}>✓</span>}</div>
                </div>
              );})}
            </div>
            {pillars.length>0&&(
              <div style={{marginTop:16,background:T.navy,borderRadius:12,padding:"12px 16px"}}>
                <div style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.5)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Your selected pillars</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {pillars.map(k=>{const p=PILLARS.find((x:any)=>x.key===k);if(!p)return null;return(
                    <span key={k} style={{background:(p as any).color,color:"#fff",borderRadius:999,padding:"4px 12px",fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{(p as any).icon} {(p as any).label}</span>
                  );})}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BACKGROUND */}
        {activeSection==="background"&&(
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:16,padding:"22px"}}>
            <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:20,textTransform:"uppercase",color:T.ink,marginBottom:4}}>Background Info</h2>
            <div style={{background:"#EFF6FF",borderRadius:10,padding:"12px 14px",fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:18,borderLeft:`3px solid ${T.blue}`}}>🔒 Private — used only to secure grants and resources for scholars. Never shown publicly.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>Race / ethnicity</label><select style={sel} value={race} onChange={e=>setRace(e.target.value)}><option value="">Select...</option>{RACES.map(r=><option key={r}>{r}</option>)}</select></div>
              <div><label style={lbl}>Household income</label><select style={sel} value={householdIncome} onChange={e=>setHouseholdIncome(e.target.value)}><option value="">Select...</option>{INCOME.map(i=><option key={i}>{i}</option>)}</select></div>
            </div>
            <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"First-generation college student",val:firstGen,set:setFirstGen},
                {label:"Free or reduced-price lunch eligible",val:freeLunch,set:setFreeLunch},
                {label:"Migrant student",val:migrant,set:setMigrant},
                {label:"Foster youth / former foster care",val:fosterYouth,set:setFosterYouth},
                {label:"Experiencing housing instability",val:unhoused,set:setUnhoused},
                {label:"I have an IEP or 504 plan",val:iep,set:setIep},
              ].map(({label,val,set})=>(
                <div key={label} onClick={()=>set(!val)} className="tog" style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:9,border:`1.5px solid ${val?T.orange:T.line}`,background:val?T.orangeL:"transparent",cursor:"pointer",fontSize:13,color:val?T.orange:T.ink,transition:"all 0.12s"}}>
                  <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${val?T.orange:T.line}`,background:val?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{val&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save bottom */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center",paddingTop:16}}>
          {saved&&<span style={{fontFamily:T.mono,fontSize:11,color:T.green,fontWeight:700}}>✓ All changes saved!</span>}
          <button onClick={save} disabled={saving} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:saving?T.line:T.orange,color:saving?T.muted:"#fff",border:"none",borderRadius:12,padding:"13px 24px",cursor:saving?"default":"pointer"}}>
            {saving?"Saving...":"Save changes →"}
          </button>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
