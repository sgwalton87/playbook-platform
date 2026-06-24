"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Confetti from "react-confetti";

const ONBOARDING_steps_BY_ROLE = {
  scholar: [
    "School & Location",
    "Academic Profile",
    "College Goals",
    "Your Pillars",
  ],

  scholar_athlete: [
    "School & Location",
    "Athletic Profile",
    "Recruiting Profile",
    "Academic Profile",
    "College Goals",
    "Your Pillars",
  ],

  tay: [
    "Background",
    "Support Needs",
    "Education Goals",
    "Your Pillars",
  ],

  mentor: [
    "Professional Profile",
    "Mentorship Focus",
    "Availability",
    "Verification",
  ],

  coach: [
    "Team / Organization",
    "Athletic Focus",
    "Students You Support",
    "Verification",
  ],

  academic_advisor: [
    "Organization",
    "Caseload",
    "Academic Focus",
    "Verification",
  ],
};
const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",blueL:"#EFF6FF",green:"#10B981",purple:"#8B5CF6",amber:"#F59E0B",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};
const SPORT_CONFIG:Record<string,{label:string;options:string[]}>={
  "Basketball":{label:"Position",options:["Point Guard","Shooting Guard","Small Forward","Power Forward","Center","Guard","Forward","Guard-Forward","Forward-Center"]},
  "Football":{label:"Position",options:["Quarterback","Running Back","Fullback","Wide Receiver","Tight End","Offensive Lineman","Defensive End","Defensive Tackle","Linebacker","Cornerback","Safety","Kicker","Punter","Returner"]},
  "Soccer":{label:"Position",options:["Goalkeeper","Center Back","Right Back","Left Back","Defensive Midfielder","Central Midfielder","Attacking Midfielder","Right Winger","Left Winger","Striker","Forward"]},
  "Baseball":{label:"Position",options:["Pitcher","Catcher","First Base","Second Base","Third Base","Shortstop","Left Field","Center Field","Right Field","Designated Hitter","Utility"]},
  "Softball":{label:"Position",options:["Pitcher","Catcher","First Base","Second Base","Third Base","Shortstop","Left Field","Center Field","Right Field","Designated Player","Utility"]},
  "Track & Field":{label:"Event",options:["100m","200m","400m","800m","1500m","Mile","5000m","10000m","110m Hurdles","100m Hurdles","400m Hurdles","3000m Steeplechase","4x100m Relay","4x400m Relay","High Jump","Pole Vault","Long Jump","Triple Jump","Shot Put","Discus","Hammer Throw","Javelin","Heptathlon","Decathlon","Cross Country","Race Walk"]},
  "Swimming":{label:"Event",options:["50m Freestyle","100m Freestyle","200m Freestyle","400m Freestyle","800m Freestyle","1500m Freestyle","100m Backstroke","200m Backstroke","100m Breaststroke","200m Breaststroke","100m Butterfly","200m Butterfly","200m IM","400m IM","4x100m Relay","4x200m Relay","4x100m Medley Relay","Open Water"]},
  "Volleyball":{label:"Position",options:["Setter","Outside Hitter","Middle Blocker","Opposite Hitter","Libero","Defensive Specialist","Serving Specialist"]},
  "Tennis":{label:"Specialty",options:["Singles","Doubles","Mixed Doubles","All-around"]},
  "Cross Country":{label:"Distance",options:["5K","6K","8K","10K","All distances"]},
  "Wrestling":{label:"Weight class",options:["106 lbs","113 lbs","120 lbs","126 lbs","132 lbs","138 lbs","144 lbs","150 lbs","157 lbs","165 lbs","175 lbs","190 lbs","215 lbs","285 lbs"]},
  "Lacrosse":{label:"Position",options:["Attack","Midfield","Defense","Goalkeeper","FOGO (Face-off)"]},
  "Golf":{label:"Format",options:["Stroke play","Match play","Team format","All formats"]},
  "Gymnastics":{label:"Event",options:["All-around","Floor Exercise","Vault","Uneven Bars","Balance Beam","Pommel Horse","Still Rings","Parallel Bars","High Bar","Trampoline","Rhythmic"]},
  "Cheer":{label:"Specialty",options:["Tumbling","Stunting","Jumps","Dance","Flyer","Base","Back Spot","All-around"]},
  "Dance":{label:"Style",options:["Hip Hop","Jazz","Contemporary","Ballet","Pom","Kick","Lyrical","Tap","Ballroom","Competitive All-Star"]},
  "Other":{label:"Position / Event",options:[]},
};

const HEIGHTS = [
  "4'8","4'9","4'10","4'11",
  "5'0","5'1","5'2","5'3","5'4","5'5","5'6","5'7","5'8","5'9","5'10","5'11",
  "6'0","6'1","6'2","6'3","6'4","6'5","6'6","6'7","6'8","6'9","6'10","6'11",
  "7'0+"
];

const WEIGHTS = Array.from({ length: 211 }, (_, i) => `${90 + i} lbs`);

const RECRUITING_INTEREST = [
  "Actively being recruited",
  "Interested in playing in college",
  "Exploring options",
  "Unsure"
];


const SALARY_RANGES = [
  "Under $35,000",
  "$35,000–$49,999",
  "$50,000–$74,999",
  "$75,000–$99,999",
  "$100,000–$149,999",
  "$150,000+"
];

const ACTIVITY_TYPES = [
  "Club",
  "Volunteer Work",
  "Job",
  "Internship",
  "Leadership",
  "Arts",
  "Faith / Community Group",
  "Family Responsibility",
  "Award / Recognition",
  "Other"
];

const SPORTS=Object.keys(SPORT_CONFIG);
const CA_DISTRICTS=["Abc Unified","Acalanes Union High","Adelanto Elementary","Alhambra Unified","Alisal Union Elementary","Alta Loma Elementary","Anaheim Elementary","Anaheim Union High","Antelope Valley Union High","Apple Valley Unified","Arcadia Unified","Azusa Unified","Bakersfield City Elementary","Baldwin Park Unified","Bassett Unified","Beaumont Unified","Berkeley Unified","Beverly Hills Unified","Brentwood Union Elementary","Burbank Unified","Cabrillo Unified","Cajon Valley Union","Calexico Unified","Campbell Union High","Capistrano Unified","Castro Valley Unified","Chaffey Joint Union High","Chino Valley Unified","Chula Vista Elementary","Claremont Unified","Colton Joint Unified","Compton Unified","Conejo Valley Unified","Corona-Norco Unified","Coronado Unified","Covina-Valley Unified","Culver City Unified","Cupertino Union Elementary","Davis Joint Unified","Del Norte County Unified","Desert Sands Unified","Downey Unified","Duarte Unified","East Side Union High","El Monte City Elementary","El Monte Union High","El Rancho Unified","Elk Grove Unified","Escondido Union High","Etiwanda Elementary","Fontana Unified","Fremont Union High","Fresno Unified","Fullerton Joint Union High","Garden Grove Unified","Gilroy Unified","Glendale Unified","Glendora Unified","Grant Joint Union High","Grossmont Union High","Hacienda La Puente Unified","Hawthorne Elementary","Hayward Unified","Hemet Unified","Huntington Beach Union High","Inglewood Unified","Irvine Unified","Jurupa Unified","Kings Canyon Joint Unified","La Mesa-Spring Valley","Laguna Beach Unified","Lake Elsinore Unified","Lancaster Elementary","Las Virgenes Unified","Lodi Unified","Lompoc Unified","Long Beach Unified","Los Angeles Unified","Los Banos Unified","Lynwood Unified","Manteca Unified","Madera Unified","Menifee Union","Merced Union High","Modesto City High","Monrovia Unified","Montebello Unified","Monterey Peninsula Unified","Moorpark Unified","Moreno Valley Unified","Morgan Hill Unified","Mount Diablo Unified","Murrieta Valley Unified","Napa Valley Unified","Newport-Mesa Unified","Norwalk-La Mirada Unified","Novato Unified","Oakland Unified","Oceanside Unified","Ontario-Montclair Elementary","Orange Unified","Oxnard Union High","Palm Springs Unified","Palmdale Elementary","Palo Alto Unified","Paramount Unified","Pasadena Unified","Perris Union High","Pittsburg Unified","Placentia-Yorba Linda Unified","Pomona Unified","Poway Unified","Redlands Unified","Redondo Beach Unified","Rialto Unified","Riverside Unified","Sacramento City Unified","Saddleback Valley Unified","Salinas Union High","San Bernardino City Unified","San Diego Unified","San Francisco Unified","San Jose Unified","San Juan Unified","San Lorenzo Unified","San Marcos Unified","San Mateo Union High","Santa Ana Unified","Santa Barbara High","Santa Clara Unified","Santa Maria Joint Union High","Santa Monica-Malibu Unified","Sequoia Union High","Simi Valley Unified","Stockton Unified","Sunnyvale Elementary","Sweetwater Union High","Temecula Valley Unified","Tracy Joint Unified","Turlock Unified","Tustin Unified","Ukiah Unified","Vacaville Unified","Val Verde Unified","Vallejo City Unified","Victor Valley Union High","Visalia Unified","Vista Unified","Walnut Valley Unified","West Contra Costa Unified","West Covina Unified","Whittier Union High","William S. Hart Union High","Woodland Joint Unified","Yucaipa-Calimesa Joint Unified","Other (not listed)"];
const CA_CITIES=["Alameda","Antioch","Berkeley","Brentwood","Compton","Concord","Daly City","Davis","East Palo Alto","El Monte","Elk Grove","Escondido","Fontana","Fremont","Fresno","Fullerton","Garden Grove","Glendale","Hayward","Huntington Beach","Inglewood","Irvine","Lancaster","Long Beach","Los Angeles","Modesto","Moreno Valley","Oakland","Oceanside","Ontario","Orange","Oxnard","Palmdale","Pasadena","Pomona","Rancho Cucamonga","Richmond","Riverside","Roseville","Sacramento","Salinas","San Bernardino","San Diego","San Francisco","San Jose","Santa Ana","Santa Clara","Santa Clarita","Santa Rosa","Simi Valley","Stockton","Sunnyvale","Thousand Oaks","Torrance","Vallejo","Victorville","Visalia","Other"];
const GRADES=["6th Grade","7th Grade","8th Grade","9th Grade","10th Grade","11th Grade","12th Grade","College Freshman","College Sophomore","College Junior","College Senior"];
const RACES=["Black / African American","Hispanic / Latino","White","Asian","Native American / Alaska Native","Native Hawaiian / Pacific Islander","Two or more races","Prefer not to say"];
const GENDERS=["Male","Female","Non-binary","Prefer not to say"];
const INCOME=["Under $25,000","$25,000–$49,999","$50,000–$74,999","$75,000–$99,999","$100,000+","Prefer not to say"];
const TEAM_LEVELS=["Middle School","Junior Varsity (JV)","Varsity","Club / AAU","Travel Team","College","Semi-Pro","Professional"];
const PILLARS=[{key:"leadership",label:"Leadership",icon:"★",desc:"Captaincy, accountability, leading on and off the court"},{key:"finance",label:"Financial Literacy",icon:"$",desc:"Budgeting, NIL basics, building wealth"},{key:"civic",label:"Civic Engagement",icon:"✓",desc:"Youth advocacy, community projects, making change"},{key:"sel",label:"Social-Emotional Learning",icon:"♥",desc:"Mental wellness, resilience, identity beyond sport"}];

function SearchDropdown({options,value,onChange,placeholder,onAddNew}:{options:string[];value:string;onChange:(v:string)=>void;placeholder:string;onAddNew?:(v:string)=>void}) {
  const [query,setQuery]=useState(value);
  const [open,setOpen]=useState(false);
  const filtered=options.filter(o=>o.toLowerCase().includes(query.toLowerCase())).slice(0,10);
  const showAdd=onAddNew&&query.length>2&&!options.some(o=>o.toLowerCase()===query.toLowerCase());
  return(
    <div style={{position:"relative"}}>
      <input value={query} onChange={e=>{setQuery(e.target.value);onChange(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),200)} placeholder={placeholder} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:T.ink,fontFamily:T.sans,outline:"none"}}/>
      {open&&(filtered.length>0||showAdd)&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:T.surface,border:`1px solid ${T.line}`,borderRadius:10,zIndex:200,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.12)",marginTop:4,maxHeight:260,overflowY:"auto"}}>
          {filtered.map(o=>(
            <div key={o} onMouseDown={()=>{setQuery(o);onChange(o);setOpen(false);}} style={{padding:"11px 14px",fontSize:14,color:T.ink,cursor:"pointer",borderBottom:`1px solid ${T.line}`}} onMouseEnter={e=>(e.currentTarget.style.background=T.orangeL)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>{o}</div>
          ))}
          {showAdd&&<div onMouseDown={()=>{onChange(query);onAddNew!(query);setOpen(false);}} style={{padding:"11px 14px",fontSize:14,color:T.orange,cursor:"pointer",fontWeight:700,background:T.orangeL,borderTop:`1px solid ${T.line}`}}>+ Add "{query}"</div>}
        </div>
      )}
    </div>
  );
}

function UsernameField({value,onChange,onStatusChange}:{value:string;onChange:(v:string)=>void;onStatusChange:(s:"idle"|"taken"|"available")=>void}) {
  const [status,setStatus]=useState<"idle"|"checking"|"taken"|"available">("idle");
  const debounceRef=useState<NodeJS.Timeout|null>(null);
  const check=useCallback(async(val:string)=>{
    if(!val||val.length<3){setStatus("idle");onStatusChange("idle");return;}
    setStatus("checking");
    const{data}=await supabase.from("profiles").select("id").ilike("username",val.replace("@","").toLowerCase()).maybeSingle();
    const s=data?"taken":"available";
    setStatus(s);onStatusChange(s);
  },[onStatusChange]);
  const handleChange=(val:string)=>{
    onChange(val);
    if(debounceRef[0])clearTimeout(debounceRef[0]);
    debounceRef[1](setTimeout(()=>check(val),600));
  };
  const clean=value.replace("@","");
  return(
    <div>
      <div style={{position:"relative"}}>
        <input value={value} onChange={e=>handleChange(e.target.value)} placeholder="@yourhandle" style={{width:"100%",background:T.surface,border:`1.5px solid ${status==="taken"?"#DC2626":status==="available"?T.green:T.line}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:T.ink,fontFamily:T.sans,outline:"none"}}/>
        {status==="checking"&&<span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontFamily:T.mono,fontSize:10,color:T.faint}}>checking…</span>}
      </div>
      {status==="available"&&<p style={{fontFamily:T.mono,fontSize:10,color:T.green,marginTop:6,fontWeight:700}}>✓ @{clean} is available!</p>}
      {status==="taken"&&<p style={{fontFamily:T.mono,fontSize:10,color:"#DC2626",marginTop:6,fontWeight:700}}>✗ @{clean} is already taken — try another</p>}
      {value.length>0&&value.length<3&&<p style={{fontFamily:T.mono,fontSize:10,color:T.faint,marginTop:6}}>Username must be at least 3 characters</p>}
    </div>
  );
}

function VideoGate({onComplete}:{onComplete:()=>void}) {
  const [progress,setProgress]=useState(0);
  const [done,setDone]=useState(false);
  const [countdown,setCountdown]=useState(3);
  useEffect(()=>{const i=setInterval(()=>setProgress(p=>{if(p>=100){clearInterval(i);setDone(true);return 100;}return p+2;}),1000);return()=>clearInterval(i);},[]);
  useEffect(()=>{if(!done)return;if(countdown<=0){onComplete();return;}const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t);},[done,countdown,onComplete]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,background:T.navy,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&display=swap');`}</style>
      <div style={{width:80,height:80,borderRadius:20,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32}}><span style={{fontFamily:"Anton,sans-serif",fontSize:44,color:"#fff"}}>P</span></div>
      {!done?(<>
        <p style={{fontFamily:T.mono,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,marginBottom:16}}>Welcome to Playbook Series Inc.</p>
        <h1 style={{fontFamily:"Anton,sans-serif",fontWeight:400,fontSize:"clamp(32px,5vw,56px)",textTransform:"uppercase",color:"#F8F7F4",textAlign:"center",lineHeight:.95,marginBottom:40}}>Your journey<br/><span style={{color:T.orange}}>starts now.</span></h1>
        <div style={{width:"100%",maxWidth:400}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:T.mono,fontSize:11,color:"rgba(248,247,244,.5)"}}>Intro video</span><span style={{fontFamily:T.mono,fontSize:11,color:T.orange,fontWeight:700}}>{progress}%</span></div>
          <div style={{background:"rgba(255,255,255,.1)",borderRadius:999,height:4,overflow:"hidden"}}><div style={{background:T.orange,height:"100%",width:`${progress}%`,borderRadius:999,transition:"width 0.5s linear"}}/></div>
          <p style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.3)",textAlign:"center",marginTop:12}}>Please watch the full intro to continue</p>
        </div>
      </>):(<>
        <h2 style={{fontFamily:"Anton,sans-serif",fontWeight:400,fontSize:"clamp(28px,4vw,48px)",textTransform:"uppercase",color:"#F8F7F4",textAlign:"center",lineHeight:.95,marginBottom:16}}>Welcome to the<br/><span style={{color:T.orange}}>network!</span></h2>
        <p style={{fontFamily:T.mono,fontSize:12,color:"rgba(255,255,255,.5)",letterSpacing:"0.06em"}}>Building your profile in {countdown}…</p>
        <div style={{marginTop:20,width:48,height:48,borderRadius:"50%",border:`3px solid ${T.orange}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"Anton,sans-serif",fontSize:22,color:T.orange}}>{countdown}</span></div>
      </>)}
    </div>
  );
}

function ProfileCreation({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(i);
          setTimeout(onComplete, 700);
          return 100;
        }
        return p + 5;
      });
    }, 120);

    return () => clearInterval(i);
  }, [onComplete]);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.navy,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: T.sans
    }}>
      <h1 style={{ fontFamily: T.anton, fontSize: 44 }}>
        Creating Your Profile
      </h1>

      <p style={{ fontFamily: T.mono, color: T.orange, marginTop: 12 }}>
        Building your scholar dashboard...
      </p>

      <div style={{
        width: 280,
        height: 8,
        background: "rgba(255,255,255,.15)",
        borderRadius: 999,
        marginTop: 24,
        overflow: "hidden"
      }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: T.orange,
          transition: "width .2s"
        }} />
      </div>

      <p style={{ fontFamily: T.mono, marginTop: 12 }}>
        {progress}%
      </p>
    </div>
  );
}

function SuccessScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.cream,
      color: T.ink,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: T.sans
    }}>
      <Confetti />

      <h1 style={{ fontFamily: T.anton, fontSize: 48 }}>
        Profile Created!
      </h1>

      <p style={{ fontFamily: T.mono, color: T.orange }}>
        Welcome to Playbook.
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  const router=useRouter();
  const [phase,setPhase]=useState<"video"|"data"|"creating"|"success">("video");  const [step,setStep]=useState(0);
  const [saving,setSaving]=useState(false);
  const [userId,setUserId]=useState<string|null>(null);
  const [xpEarned,setXpEarned]=useState(0);
  const [toast,setToast]=useState<string|null>(null);
  const [districtOptions,setDistrictOptions]=useState<string[]>(CA_DISTRICTS);
  const [cityOptions,setCityOptions]=useState<string[]>(CA_CITIES);
  const [school,setSchool]=useState("");const [grade,setGrade]=useState("");const [gpa,setGpa]=useState("");const [city,setCity]=useState("");const [zipCode,setZipCode]=useState("");const [usState,setUsState]=useState("CA");const [district,setDistrict]=useState("");const [gradYear,setGradYear]=useState("");const [dreamSchool,setDreamSchool]=useState("");const [ell,setEll]=useState(false);
  const [sport,setSport]=useState("");const [position,setPosition]=useState("");const [jersey,setJersey]=useState("");const [height,setHeight]=useState("");const [weight,setWeight]=useState("");const [teamLevel,setTeamLevel]=useState("");const [travelTeam,setTravelTeam]=useState("");const [coachName,setCoachName]=useState("");const [coachEmail,setCoachEmail]=useState("");
  const [gender,setGender]=useState("");const [race,setRace]=useState("");const [householdIncome,setHouseholdIncome]=useState("");const [firstGen,setFirstGen]=useState(false);const [freeLunch,setFreeLunch]=useState(false);const [migrant,setMigrant]=useState(false);const [fosterYouth,setFosterYouth]=useState(false);const [unhoused,setUnhoused]=useState(false);const [iep,setIep]=useState(false);const [bio,setBio]=useState("");
  const [pillars,setPillars]=useState<string[]>([]);const [username,setUsername]=useState("");const [usernameStatus,setUsernameStatus]=useState<"idle"|"taken"|"available">("idle");
  const [role,setRole]=useState("scholar");
const [highSchoolTeam,setHighSchoolTeam]=useState("");
const [athleteEmail,setAthleteEmail]=useState("");
const [highlightVideo,setHighlightVideo]=useState("");
const [recruitingInterest,setRecruitingInterest]=useState("");

const [activityType,setActivityType]=useState("");
const [activityName,setActivityName]=useState("");
const [activityRole,setActivityRole]=useState("");
const [activityOrg,setActivityOrg]=useState("");
const [activityHours,setActivityHours]=useState("");
const [activityDescription,setActivityDescription]=useState("");

const [weightedGpa,setWeightedGpa]=useState("");
const [unweightedGpa,setUnweightedGpa]=useState("");
const [currentMath,setCurrentMath]=useState("");
const [currentEnglish,setCurrentEnglish]=useState("");
const [currentScience,setCurrentScience]=useState("");

const [collegeGoal,setCollegeGoal]=useState("");
const [idealProfession,setIdealProfession]=useState("");
const [desiredSalaryRange,setDesiredSalaryRange]=useState("");
const [activities,setActivities]=useState<any[]>([]);
const [careerOptions,setCareerOptions] = useState<any[]>([]);

const isScholarAthlete = role === "scholar-athlete";

const steps = isScholarAthlete
  ? [
      "School & Location",
      "Athletic Profile",
      "Academic Profile",
      "Background",
      "College & Career Goals",
      "Recruiting Profile",
      "Activities & Service",
      "Your Pillars",
    ]
  : [
      "School & Location",
      "Academic Profile",
      "Background",
      "College & Career Goals",
      "Activities & Service",
      "Your Pillars",
    ];

 useEffect(() => {
  supabase.auth.getUser().then(async ({ data }) => {
    if (!data.user) {
      router.replace("/login");
      return;
    }

    setUserId(data.user.id);

    const { data: p } = await supabase
  .from("profiles")
  .select("onboarded,username,role,registration_type")
  .eq("id", data.user.id)
  .single();

  const { data: careers } = await supabase
  .from("careers")
  .select("title")
  .order("title");

console.log("CAREERS LOADED:", careers?.length, careers?.slice(0, 5));

if (careers) {
  setCareerOptions(careers);
}

if (p?.onboarded) {
  router.replace("/dashboard");
  return;
}

if (p?.username) setUsername(p.username);

if (p?.role) {
  setRole(p.role);
}

    const { data: custom } = await supabase
      .from("custom_options")
      .select("category,value");

    if (custom) {
      const d = custom
        .filter((c: any) => c.category === "district")
        .map((c: any) => c.value);

      const ci = custom
        .filter((c: any) => c.category === "city")
        .map((c: any) => c.value);

      if (d.length) {
        setDistrictOptions((prev) => [...new Set([...prev, ...d])]);
      }

      if (ci.length) {
        setCityOptions((prev) => [...new Set([...prev, ...ci])]);
      }
    }
  });
}, [router]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),3500);return()=>clearTimeout(t);},[toast]);

  const addCustomOption=async(category:string,value:string)=>{
    if(!userId||!value.trim())return;
    await supabase.from("custom_options").upsert({category,value:value.trim(),added_by:userId},{onConflict:"category,value"});
  };

  const awardXP=async(xp:number,label:string)=>{
  if(!userId)return;

  const {data:p}=await supabase
    .from("profiles")
    .select("xp,coin_balance")
    .eq("id",userId)
    .single();

  await supabase
    .from("profiles")
    .upsert({
      id:userId,
      xp:(p?.xp||0)+xp,
      coin_balance:(p?.coin_balance||0)+Math.floor(xp/5)
    })
    .eq("id",userId);

  setXpEarned(prev=>prev+xp);
  setToast(`⚡ +${xp} XP earned for completing ${label}!`);
};

  const handleNext=async()=>{
    const xpMap=[50,75,100,125];const labels=["School & Location","Athletic Profile","Background","Your Pillars"];
    await awardXP(xpMap[step],labels[step]);setStep(s=>s+1);
  };


  const addActivity=()=>{
    if(!activityType || !activityName.trim()){
      setToast("Add an activity type and name first.");
      return;
    }

    setActivities(prev=>[
      ...prev,
      {
        activity_type:activityType,
        activity_name:activityName.trim(),
        role_title:activityRole || null,
        organization:activityOrg || null,
        total_hours:activityHours ? Number(activityHours) : null,
        description:activityDescription || null,
      }
    ]);

    setActivityType("");
    setActivityName("");
    setActivityRole("");
    setActivityOrg("");
    setActivityHours("");
    setActivityDescription("");

    setToast("Activity added. You can add another or continue.");
  };

  const handleSave=async()=>{
  if(!userId)return;

  if(usernameStatus==="taken"){
    setToast("Please choose a different username.");
    return;
  }

  setSaving(true);

  if (travelTeam.trim()) {
    await supabase.from("club_teams").upsert(
      {
        name: travelTeam.trim(),
        sport,
        city,
        state: usState,
        created_by: userId,
      },
      { onConflict: "name" }
    );
  }

  if (activityType && activityName.trim()) {
    await supabase.from("student_activities").insert({
      student_id: userId,
      activity_type: activityType,
      activity_name: activityName.trim(),
      role_title: activityRole || null,
      organization: activityOrg || null,
      total_hours: activityHours ? Number(activityHours) : null,
      description: activityDescription || null,
    });
  }
  console.log({
  dreamSchool,
  idealProfession,
  desiredSalaryRange
});

  const {error:saveErr}=await supabase.from("profiles").upsert({
    id:userId,
    username:username.replace("@","").toLowerCase()||null,
    school:school||null,
    gpa:gpa||null,
    zip_code:zipCode||null,
    school_district:district||null,
    grad_year:gradYear||null,
    dream_school:dreamSchool||null,
    ideal_profession:idealProfession||null,
    desired_salary_range:desiredSalaryRange||null,
    english_language_learner:ell,
    sport:sport||null,
    position:position||null,
    jersey_number:jersey||null,
    height:height||null,
    weight:weight||null,
    team_level:teamLevel||null,
    travel_team:travelTeam||null,
    coach_name:coachName||null,
    coach_email:coachEmail||null,
    gender:gender||null,
    household_income:householdIncome||null,
    first_generation:firstGen,
    free_reduced_lunch:freeLunch,
    migrant_student:migrant,
    foster_youth:fosterYouth,
    unhoused:unhoused,
    has_iep:iep,
    bio:bio||null,
    pillars:pillars||[],
    highlight_reel_url:highlightVideo||null,
    athlete_email:athleteEmail||null,
    recruiting_status:recruitingStatus||null,
    desired_college_level:desiredCollegeLevel||null,
    camps_attended:campsAttended||null,
    nil_instagram:nilInstagram||null,
    nil_tiktok:nilTiktok||null,
    nil_twitter:nilTwitter||null,
    nil_follower_range:nilFollowerRange||null,
    nil_brand_interests:nilBrandInterests.length>0?nilBrandInterests:null,
    nil_worked_with_brands:nilWorkedWithBrands,
    nil_deal_types:nilDealTypes.length>0?nilDealTypes:null,
    onboarded:true,
    onboarding_complete:true,
  });
  if(saveErr){console.error("SAVE FAILED:",JSON.stringify(saveErr));alert("Save failed: "+saveErr.message);setSaving(false);return;}
  console.log("SAVE SUCCESS");
  setSaving(false);
  setPhase("creating");
};

const sportConfig=sport&&SPORT_CONFIG[sport]?SPORT_CONFIG[sport]:null;

if(phase==="video" && false) {
  return <VideoGate onComplete={() => setPhase("data")} />;
}

if(phase==="creating") {
  return (
    <ProfileCreation
      onComplete={() => setPhase("success")}
    />
  );
}

if(phase==="success") {
  return (
    <SuccessScreen
  onDone={() => {
    sessionStorage.setItem("pb_profile_created", "1");
    router.replace("/dashboard");
  }}
/>
  );
}

  const inp={width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:T.ink,fontFamily:T.sans,outline:"none",transition:"border-color 0.15s"} as React.CSSProperties;
  const sel={...inp,cursor:"pointer",appearance:"none" as const} as React.CSSProperties;
  const lbl={fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:T.muted,display:"block",marginBottom:6};
  const chk=(active:boolean)=>({display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,border:`1.5px solid ${active?T.orange:T.line}`,background:active?T.orangeL:"transparent",cursor:"pointer",transition:"all 0.12s",fontSize:13,color:active?T.orange:T.ink} as React.CSSProperties);
  const currentStepName = steps[step];

const requiredByStep: Record<string, () => boolean> = {
  "School & Location": () =>
    !!school.trim() &&
    !!district.trim() &&
    !!grade &&
    !!gradYear &&
    !!city.trim() &&
    !!zipCode.trim() &&
    !!usState,

  "Athletic Profile": () =>
    isScholarAthlete && !!sport &&
        !!position &&
        !!height &&
        !!weight &&
        !!travelTeam.trim(),

  "Academic Profile": () =>
    !!gpa.trim(),

  "Background": () =>
    !!gender &&
    !!race &&
    !!householdIncome,

  "College & Career Goals": () =>
    !!dreamSchool.trim(),

  "Recruiting Profile": () =>
    !isScholarAthlete
      ? true
      : !!highSchoolTeam.trim() &&
        !!coachName.trim() &&
        !!coachEmail.trim() &&
        !!athleteEmail.trim() &&
        !!highlightVideo.trim() &&
        !!recruitingInterest,

  "Your Pillars": () =>
    pillars.length > 0 &&
    username.length >= 3 &&
    usernameStatus !== "taken",
};

const canProceed = requiredByStep[currentStepName]
  ? requiredByStep[currentStepName]()
  : true;
  
  return(
    <div style={{minHeight:"100vh",background:T.cream,fontFamily:T.sans,color:T.ink,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input:focus,select:focus,textarea:focus{border-color:${T.orange}!important;outline:none;}input::placeholder,textarea::placeholder{color:${T.faint};}select{appearance:none;}`}</style>
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:T.navy,color:"#F8F7F4",padding:"13px 18px",borderRadius:14,fontFamily:T.mono,fontSize:12,fontWeight:700,boxShadow:"0 8px 32px rgba(15,23,42,.35)"}}>{toast}</div>}
      <div style={{width:"100%",maxWidth:560}}>
        {xpEarned>0&&<div style={{background:T.navy,borderRadius:12,padding:"10px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontFamily:T.mono,fontSize:11,color:"rgba(248,247,244,.6)"}}>XP earned so far</span><span style={{fontFamily:T.anton,fontSize:22,color:T.orange}}>+{xpEarned} XP</span></div>}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,justifyContent:"center"}}>
          <div style={{width:34,height:34,borderRadius:8,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:T.anton,fontSize:18,color:"#fff"}}>P</span></div>
          <div><div style={{fontFamily:T.anton,fontSize:16,color:T.ink}}>PLAYBOOK</div><div style={{fontFamily:T.mono,fontSize:7,letterSpacing:"0.3em",color:T.orange}}>SERIES INC.</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${steps.length},1fr)`,gap:6,marginBottom:24}}>
          {steps.map((s,i)=>(<div key={s}><div style={{height:3,borderRadius:999,background:i<=step?T.orange:T.line,transition:"background 0.2s"}}/><div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:i===step?T.orange:T.faint,marginTop:5}}>{s}</div></div>))}
        </div>
        <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:20,padding:"28px 26px"}}>
          <div style={{background:T.surface2,borderRadius:8,padding:"8px 14px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>Complete this step to earn</span>
            <span style={{fontFamily:T.mono,fontSize:12,fontWeight:700,color:T.orange}}>+{[50,75,100,125][step]} XP</span>
          </div>

          {currentStepName==="School & Location"&&(<div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Step {step + 1} of {steps.length}</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:18,lineHeight:1}}>School & Location</h1>
            <div style={{marginBottom:14}}><label style={lbl}>School name *</label><input style={inp} placeholder="Lincoln High School" value={school} onChange={e=>setSchool(e.target.value)}/></div>
            <div style={{marginBottom:14}}><label style={lbl}>School district</label><SearchDropdown options={districtOptions} value={district} onChange={setDistrict} placeholder="Search CA districts or type yours..." onAddNew={v=>{setDistrictOptions(p=>[...new Set([...p,v])]);addCustomOption("district",v);}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={lbl}>Grade *</label><select style={sel} value={grade} onChange={e=>setGrade(e.target.value)}><option value="">Select grade...</option>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
              <div><label style={lbl}>Grad year</label><select style={sel} value={gradYear} onChange={e=>setGradYear(e.target.value)}><option value="">Select year...</option>{Array.from({length:10},(_,i)=>(new Date().getFullYear()+i).toString()).map(y=><option key={y}>{y}</option>)}</select></div>
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>City *</label><SearchDropdown options={cityOptions} value={city} onChange={setCity} placeholder="Start typing your city..." onAddNew={v=>{setCityOptions(p=>[...new Set([...p,v])]);addCustomOption("city",v);}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={lbl}>State</label><select style={sel} value={usState} onChange={e=>setUsState(e.target.value)}>{["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={lbl}>ZIP code</label><input style={inp} placeholder="94601" value={zipCode} onChange={e=>setZipCode(e.target.value)}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={lbl}>GPA</label><input style={inp} placeholder="3.5" value={gpa} onChange={e=>setGpa(e.target.value)}/></div>
              <div><label style={lbl}>Dream school</label><input style={inp} placeholder="Howard University" value={dreamSchool} onChange={e=>setDreamSchool(e.target.value)}/></div>
            </div>
            <div onClick={()=>setEll(!ell)} style={chk(ell)}><div style={{width:20,height:20,borderRadius:5,border:`2px solid ${ell?T.orange:T.line}`,background:ell?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{ell&&<span style={{color:"#fff",fontSize:12}}>✓</span>}</div>I am an English Language Learner (ELL)</div>
          </div>)}

          {currentStepName==="Athletic Profile"&&isScholarAthlete&&(<div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Step {step + 1} of {steps.length}</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:18,lineHeight:1}}>Athletic Profile</h1>
            <div style={{marginBottom:14}}>
              <label style={lbl}>Primary sport *</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {SPORTS.map(s=>(
                  <button key={s} onClick={()=>{setSport(s);setPosition("");}} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",padding:"7px 12px",borderRadius:999,border:`1.5px solid ${sport===s?T.orange:T.line}`,background:sport===s?T.orangeL:"transparent",color:sport===s?T.orange:T.muted,cursor:"pointer",transition:"all 0.12s"}}>{s}</button>
                ))}
              </div>
            </div>
            {sport&&sportConfig&&(<div style={{marginBottom:14}}>
              <label style={lbl}>{sportConfig.label}{sportConfig.options.length>0?"":" (type yours)"}</label>
              {sportConfig.options.length>0?(
                <select style={sel} value={position} onChange={e=>setPosition(e.target.value)}><option value="">Select {sportConfig.label.toLowerCase()}...</option>{sportConfig.options.map(o=><option key={o}>{o}</option>)}<option value="Other">Other</option></select>
              ):(
                <input style={inp} placeholder={`Enter your ${sportConfig.label.toLowerCase()}`} value={position} onChange={e=>setPosition(e.target.value)}/>
              )}
            </div>)}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={lbl}>Jersey #</label><input style={inp} placeholder="11" value={jersey} onChange={e=>setJersey(e.target.value)}/></div>
              <div><label style={lbl}>Team level</label><select style={sel} value={teamLevel} onChange={e=>setTeamLevel(e.target.value)}><option value="">Select level...</option>{TEAM_LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div>
  <label style={lbl}>Height *</label>
  <select style={sel} value={height} onChange={e=>setHeight(e.target.value)}>
    <option value="">Select height...</option>
    {HEIGHTS.map(h=><option key={h}>{h}</option>)}
  </select>
</div>

<div>
  <label style={lbl}>Weight *</label>
  <select style={sel} value={weight} onChange={e=>setWeight(e.target.value)}>
    <option value="">Select weight...</option>
    {WEIGHTS.map(w=><option key={w}>{w}</option>)}
  </select>
</div>
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>Travel / Club team</label><input style={inp} placeholder="Oakland Soldiers" value={travelTeam} onChange={e=>setTravelTeam(e.target.value)}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>Coach name</label><input style={inp} placeholder="Coach Smith" value={coachName} onChange={e=>setCoachName(e.target.value)}/></div>
              <div><label style={lbl}>Coach email</label><input type="email" style={inp} placeholder="coach@school.edu" value={coachEmail} onChange={e=>setCoachEmail(e.target.value)}/></div>
            </div>
          </div>)}

          {currentStepName==="Background"&&(<div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Step {step + 1} of {steps.length}</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:10,lineHeight:1}}>Demographic Info<br/><span style={{color:T.orange}}>Optional, but important</span></h1>
            <div style={{background:T.blueL,borderRadius:10,padding:"12px 14px",fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:18,borderLeft:`3px solid ${T.blue}`}}>🔒 This information helps keep the platform free, secure funding, and better support scholars. It is never shown publicly.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={lbl}>Gender</label><select style={sel} value={gender} onChange={e=>setGender(e.target.value)}><option value="">Select...</option>{GENDERS.map(g=><option key={g}>{g}</option>)}</select></div>
              <div><label style={lbl}>Race / Ethnicity</label><select style={sel} value={race} onChange={e=>setRace(e.target.value)}><option value="">Select...</option>{RACES.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div style={{marginBottom:18}}><label style={lbl}>Household income</label><select style={sel} value={householdIncome} onChange={e=>setHouseholdIncome(e.target.value)}><option value="">Select...</option>{INCOME.map(i=><option key={i}>{i}</option>)}</select></div>
            <label style={lbl}>Check all that apply</label>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {[{label:"First-generation college student",val:firstGen,set:setFirstGen},{label:"Free or reduced-price lunch eligible",val:freeLunch,set:setFreeLunch},{label:"Migrant student",val:migrant,set:setMigrant},{label:"Foster youth / former foster care",val:fosterYouth,set:setFosterYouth},{label:"Experiencing housing instability",val:unhoused,set:setUnhoused},{label:"I have an IEP or 504 plan",val:iep,set:setIep}].map(({label,val,set})=>(
                <div key={label} onClick={()=>set(!val)} style={chk(val)}><div style={{width:20,height:20,borderRadius:5,border:`2px solid ${val?T.orange:T.line}`,background:val?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{val&&<span style={{color:"#fff",fontSize:12}}>✓</span>}</div><span>{label}</span></div>
              ))}
            </div>
            <div><label style={lbl}>Bio (optional)</label><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} style={{...inp,resize:"vertical" as const}}/></div>
          </div>)}

          
{currentStepName==="Recruiting Profile"&&isScholarAthlete&&(<div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Step {step + 1} of {steps.length}</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:6,lineHeight:1}}>Recruiting <span style={{color:T.orange}}>Profile</span></h1>
            <p style={{fontSize:13,color:T.muted,marginBottom:18,lineHeight:1.6}}>All fields are optional and can be updated anytime from your profile.</p>
            <div style={{background:T.orangeL,border:`1px solid ${T.orange}22`,borderRadius:10,padding:"12px 14px",marginBottom:20,fontFamily:T.mono,fontSize:10,color:T.orange,letterSpacing:"0.06em",textTransform:"uppercase"}}>🏆 Recruiting Info</div>
            <div style={{marginBottom:14}}><label style={lbl}>Recruiting status</label><select style={sel} value={recruitingStatus} onChange={e=>setRecruitingStatus(e.target.value)}><option value="">Select status...</option>{["Not started","Actively recruiting","Have offers","Committed","Signed NLI"].map(o=><option key={o}>{o}</option>)}</select></div>
            <div style={{marginBottom:14}}><label style={lbl}>Desired college level</label><select style={sel} value={desiredCollegeLevel} onChange={e=>setDesiredCollegeLevel(e.target.value)}><option value="">Select level...</option>{["NCAA Division I","NCAA Division II","NCAA Division III","NAIA","JUCO / Community College","Any level","Not pursuing college athletics"].map(o=><option key={o}>{o}</option>)}</select></div>
            <div style={{marginBottom:14}}><label style={lbl}>Athletic / recruiting email</label><input style={inp} type="email" placeholder="yourname@email.com" value={athleteEmail} onChange={e=>setAthleteEmail(e.target.value)}/></div>
            <div style={{marginBottom:14}}><label style={lbl}>Highlight reel URL (Hudl, YouTube, etc.)</label><input style={inp} placeholder="https://hudl.com/v/..." value={highlightVideo} onChange={e=>setHighlightVideo(e.target.value)}/></div>
            <div style={{marginBottom:20}}><label style={lbl}>Showcases / camps attended</label><input style={inp} placeholder="Nike EYBL, Under Armour Next..." value={campsAttended} onChange={e=>setCampsAttended(e.target.value)}/></div>
            <div style={{background:T.orangeL,border:`1px solid ${T.orange}22`,borderRadius:10,padding:"12px 14px",marginBottom:20,fontFamily:T.mono,fontSize:10,color:T.orange,letterSpacing:"0.06em",textTransform:"uppercase"}}>💰 NIL Profile</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={lbl}>Instagram</label><input style={inp} placeholder="@handle" value={nilInstagram} onChange={e=>setNilInstagram(e.target.value)}/></div>
              <div><label style={lbl}>TikTok</label><input style={inp} placeholder="@handle" value={nilTiktok} onChange={e=>setNilTiktok(e.target.value)}/></div>
              <div><label style={lbl}>Twitter / X</label><input style={inp} placeholder="@handle" value={nilTwitter} onChange={e=>setNilTwitter(e.target.value)}/></div>
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>Total followers (across platforms)</label><select style={sel} value={nilFollowerRange} onChange={e=>setNilFollowerRange(e.target.value)}><option value="">Select range...</option>{["Under 1,000","1,000–5,000","5,000–10,000","10,000–50,000","50,000–100,000","100,000+"].map(o=><option key={o}>{o}</option>)}</select></div>
            <div style={{marginBottom:14}}>
              <label style={lbl}>Brand interests / niche</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{["Sports & fitness","Fashion & style","Food & nutrition","Gaming","Music","Education","Community & social impact","Lifestyle","Tech","Other"].map(interest=>{const active=nilBrandInterests.includes(interest);return <button key={interest} onClick={()=>setNilBrandInterests(prev=>prev.includes(interest)?prev.filter(x=>x!==interest):[...prev,interest])} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",padding:"7px 12px",borderRadius:999,border:`1.5px solid ${active?T.orange:T.line}`,background:active?T.orangeL:"transparent",color:active?T.orange:T.muted,cursor:"pointer",transition:"all 0.12s"}}>{interest}</button>;})}</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={lbl}>Preferred deal types</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{["Product gifting","Paid social post","Brand ambassador","Event appearance","Content creation","Licensing"].map(deal=>{const active=nilDealTypes.includes(deal);return <button key={deal} onClick={()=>setNilDealTypes(prev=>prev.includes(deal)?prev.filter(x=>x!==deal):[...prev,deal])} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",padding:"7px 12px",borderRadius:999,border:`1.5px solid ${active?T.orange:T.line}`,background:active?T.orangeL:"transparent",color:active?T.orange:T.muted,cursor:"pointer",transition:"all 0.12s"}}>{deal}</button>;})}</div>
            </div>
            <div onClick={()=>setNilWorkedWithBrands(!nilWorkedWithBrands)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,border:`1.5px solid ${nilWorkedWithBrands?T.orange:T.line}`,background:nilWorkedWithBrands?T.orangeL:"transparent",cursor:"pointer",transition:"all 0.12s",fontSize:13,color:nilWorkedWithBrands?T.orange:T.ink}}>
              <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${nilWorkedWithBrands?T.orange:T.line}`,background:nilWorkedWithBrands?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{nilWorkedWithBrands&&<span style={{color:"#fff",fontSize:12}}>✓</span>}</div>
              I have previously worked with brands or sponsors
            </div>
          </div>)}

          
{currentStepName==="Academic Profile"&&(<div>
  <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Academic Profile</p>
  <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:18,lineHeight:1}}>Academic Profile</h1>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Weighted GPA *</label>
    <input style={inp} placeholder="4.1" value={weightedGpa} onChange={e=>setWeightedGpa(e.target.value)} />
  </div>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Unweighted GPA *</label>
    <input style={inp} placeholder="3.5" value={unweightedGpa} onChange={e=>setUnweightedGpa(e.target.value)} />
  </div>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Current Math *</label>
    <input style={inp} placeholder="Algebra II, Geometry, Pre-Calculus..." value={currentMath} onChange={e=>setCurrentMath(e.target.value)} />
  </div>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Current English *</label>
    <input style={inp} placeholder="English 10, AP Lang..." value={currentEnglish} onChange={e=>setCurrentEnglish(e.target.value)} />
  </div>

  <div>
    <label style={lbl}>Current Science *</label>
    <input style={inp} placeholder="Biology, Chemistry, Physics..." value={currentScience} onChange={e=>setCurrentScience(e.target.value)} />
  </div>
</div>)}


{currentStepName==="College & Career Goals"&&(<div>
  <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>
    Step {step + 1} of {steps.length}
  </p>

  <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:18,lineHeight:1}}>
    College & Career Goals
  </h1>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Dream school / college goal *</label>
    <input style={inp} placeholder="Cal Berkeley" value={dreamSchool} onChange={e=>setDreamSchool(e.target.value)} />
  </div>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Ideal profession</label>
    <select style={sel} value={idealProfession} onChange={e=>setIdealProfession(e.target.value)}>
      <option value="">Select ideal profession...</option>
      {careerOptions.map((career:any)=>(
        <option key={career.title} value={career.title}>
          {career.title}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label style={lbl}>Desired annual salary</label>
    <select style={sel} value={desiredSalaryRange} onChange={e=>setDesiredSalaryRange(e.target.value)}>
      <option value="">Select salary range...</option>
      {SALARY_RANGES.map(r=><option key={r}>{r}</option>)}
    </select>
  </div>
</div>)}


{currentStepName==="Activities & Service"&&(<div>
  <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Optional</p>
  <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:10,lineHeight:1}}>Activities & Service</h1>

  <p style={{fontSize:13,color:T.muted,marginBottom:18,lineHeight:1.6}}>
    Add clubs, extracurriculars, volunteer work, jobs, internships, awards, or leadership roles.
  </p>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Activity type</label>
    <select style={sel} value={activityType} onChange={e=>setActivityType(e.target.value)}>
      <option value="">Select...</option>
      {ACTIVITY_TYPES.map(a=><option key={a}>{a}</option>)}
    </select>
  </div>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Activity name</label>
    <input style={inp} placeholder="Student Government, Food Bank, Internship..." value={activityName} onChange={e=>setActivityName(e.target.value)} />
  </div>

  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
    <div>
      <label style={lbl}>Role / title</label>
      <input style={inp} placeholder="President, Volunteer, Intern..." value={activityRole} onChange={e=>setActivityRole(e.target.value)} />
    </div>
    <div>
      <label style={lbl}>Organization</label>
      <input style={inp} placeholder="School, nonprofit, company..." value={activityOrg} onChange={e=>setActivityOrg(e.target.value)} />
    </div>
  </div>

  <div style={{marginBottom:14}}>
    <label style={lbl}>Total hours</label>
    <input style={inp} placeholder="25" value={activityHours} onChange={e=>setActivityHours(e.target.value)} />
  </div>

  <div>
    <label style={lbl}>Description</label>
    <textarea rows={3} style={{...inp,resize:"vertical" as const}} placeholder="What did you do?" value={activityDescription} onChange={e=>setActivityDescription(e.target.value)} />
  </div>

  <button type="button" onClick={addActivity} style={{marginTop:14,width:"100%",fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.navy,color:"#fff",border:"none",borderRadius:12,padding:"13px",cursor:"pointer"}}>
    + Add Activity
  </button>

  {activities.length>0&&(
    <div style={{marginTop:14,fontSize:12,color:T.muted}}>
      {activities.length} activit{activities.length===1?"y":"ies"} added.
    </div>
  )}
</div>)}

{currentStepName==="Your Pillars"&&(<div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Step {step + 1} of {steps.length}</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:10,lineHeight:1}}>Your Pillars</h1>
            <p style={{fontSize:13,color:T.muted,marginBottom:20,lineHeight:1.6}}>Select what interests you most — we will suggest courses on your dashboard based on your choices.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
              {PILLARS.map(p=>{
                const active=pillars.includes(p.key);
                return(<div key={p.key} onClick={()=>setPillars(prev=>prev.includes(p.key)?prev.filter(x=>x!==p.key):[...prev,p.key])} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:`1.5px solid ${active?T.orange:T.line}`,background:active?T.orangeL:"transparent",cursor:"pointer",transition:"all 0.12s"}}>
                  <div style={{width:36,height:36,borderRadius:9,background:active?T.orange:T.line,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:active?"#fff":T.muted,flexShrink:0}}>{p.icon}</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:active?T.orange:T.ink}}>{p.label}</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>{p.desc}</div></div>
                  <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${active?T.orange:T.line}`,background:active?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{active&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}</div>
                </div>);
              })}
            </div>
            <div><label style={lbl}>Choose a username *</label><UsernameField value={username} onChange={setUsername} onStatusChange={setUsernameStatus}/></div>
          </div>)}

          <div style={{display:"flex",gap:10,marginTop:24}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:"transparent",color:T.muted,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"13px 20px",cursor:"pointer"}}>← Back</button>}
            {step < steps.length - 1?(<button onClick={handleNext} disabled={!canProceed} style={{flex:1,fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:canProceed?T.orange:T.line,color:canProceed?"#fff":T.muted,border:"none",borderRadius:12,padding:"13px",cursor:canProceed?"pointer":"default",transition:"all 0.15s"}}>Save & Continue +{[50,75,100,125][step]} XP →</button>
            ):(<button onClick={handleSave} disabled={saving||!canProceed} style={{flex:1,fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:saving||pillars.length===0||username.length<3||usernameStatus==="taken"?T.line:T.orange,color:saving||pillars.length===0||username.length<3||usernameStatus==="taken"?T.muted:"#fff",border:"none",borderRadius:12,padding:"13px",cursor:"pointer",transition:"all 0.15s"}}>{saving?"Saving...":"Complete profile +125 XP →"}</button>)}
          </div>
          <p style={{textAlign:"center",marginTop:12,fontSize:11,color:T.faint}}>You can update this anytime in your profile settings</p>
        </div>
      </div>
    </div>
  );
}