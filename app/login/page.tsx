"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",blueL:"#EFF6FF",green:"#10B981",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};

const ROLES=[
  {key:"scholar",label:"Scholar",icon:"📖",desc:"A student focused on academic excellence",needsParent:true,needsEdu:false,needsAdmin:false},
  {key:"scholar-athlete",label:"Scholar-Athlete",icon:"🏅",desc:"A student competing in sports while excelling academically",needsParent:true,needsEdu:false,needsAdmin:false},
  {key:"transition-youth",label:"Transition-Aged Youth (18–24)",icon:"🚀",desc:"Young adults building careers and independence",needsParent:false,needsEdu:true,needsAdmin:false},
  {key:"mentor",label:"K-12 Mentor / Counselor / Advisor",icon:"🧭",desc:"Educators and counselors supporting student growth",needsParent:false,needsEdu:true,needsAdmin:false},
  {key:"coach",label:"Coach",icon:"🏆",desc:"Athletic coaches supporting scholar-athletes",needsParent:false,needsEdu:true,needsAdmin:true},
  {key:"college-admin",label:"College Administrator",icon:"🎓",desc:"College staff and administrators",needsParent:false,needsEdu:true,needsAdmin:false},
  {key:"other",label:"Other",icon:"✦",desc:"Community members and partners — requires special approval",needsParent:false,needsEdu:false,needsAdmin:true},
];

export default function LoginPage() {
  const router=useRouter();
  const [mode,setMode]=useState<"login"|"signup">("signup");
  const [step,setStep]=useState<"role"|"details">("role");
  const [selectedRole,setSelectedRole]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [dob,setDob]=useState("");
  const [parentEmail,setParentEmail]=useState("");
  const [parentCoachEmail,setParentCoachEmail]=useState("");
  const [eduEmail,setEduEmail]=useState("");
  const [otherReason,setOtherReason]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const getAge=(d:string)=>{if(!d)return null;return Math.floor((Date.now()-new Date(d).getTime())/(1000*60*60*24*365.25));};
  const age=getAge(dob);
  const role=ROLES.find(r=>r.key===selectedRole);
  const isUnder18=age!==null&&age<18;
  const showParent=!!(role?.needsParent&&isUnder18);
  const needsEdu=!!role?.needsEdu;
  const isEdu=(e:string)=>e.toLowerCase().endsWith(".edu");

  const getVerifStatus=()=>{
    if(!role||(!role.needsEdu&&!role.needsAdmin))return"approved";
    if(role.needsEdu&&(isEdu(email)||isEdu(eduEmail)))return"approved";
    return"pending";
  };

  const handleLogin=async()=>{
    setLoading(true);setError("");
    const{error:e}=await supabase.auth.signInWithPassword({email,password});
    if(e){setError(e.message);setLoading(false);return;}
    router.replace("/dashboard");
  };

  const handleSignup=async()=>{
    if(!firstName.trim()||!email.trim()||!password.trim()||!selectedRole){setError("Please fill in all required fields.");return;}
    if(password.length<6){setError("Password must be at least 6 characters.");return;}
    if(!dob){setError("Date of birth is required.");return;}
    if(age!==null&&age<11){setError("You must be at least 11 to join.");return;}
    if(showParent&&!parentEmail&&!parentCoachEmail){setError("A parent/guardian or coach email is required for students under 18.");return;}
    if(needsEdu&&!isEdu(email)&&!eduEmail){setError("Please provide a .edu email for verification.");return;}
    if(needsEdu&&eduEmail&&!isEdu(eduEmail)){setError("Your .edu email must end in .edu");return;}

    setLoading(true);setError("");

    const{data,error:signupError}=await supabase.auth.signUp({email,password,options:{data:{first_name:firstName,last_name:lastName}}});

    if(signupError){
      console.error("Signup error:",signupError);
      if(signupError.message.toLowerCase().includes("already")){
        setError("An account with this email already exists. Please log in instead.");
      } else {
        setError(signupError.message);
      }
      setLoading(false);return;
    }

    if(!data?.user){
      setError("Account creation failed. Please try again.");
      setLoading(false);return;
    }

    const uid=data.user.id;
    const verifStatus=getVerifStatus();
    const now=new Date().toISOString();
    const expires=new Date(Date.now()+14*24*60*60*1000).toISOString();

    const{error:profileError}=await supabase.from("profiles").upsert({
      id:uid,
      first_name:firstName,
      last_name:lastName,
      full_name:`${firstName} ${lastName}`.trim(),
      role:selectedRole,
      verification_status:verifStatus,
      verification_requested_at:verifStatus==="pending"?now:null,
      verification_expires_at:verifStatus==="pending"?expires:null,
      verified_at:verifStatus==="approved"?now:null,
      edu_email:eduEmail||null,
      date_of_birth:dob,
      onboarded:false,
    });

    if(profileError){
      console.error("Profile error:",profileError);
      setError("Profile setup failed: "+profileError.message);
      setLoading(false);return;
    }

    if(verifStatus==="pending"){
      await supabase.from("pending_verifications").insert({
        user_id:uid,role:selectedRole,
        full_name:`${firstName} ${lastName}`.trim(),
        email,edu_email:eduEmail||null,
        reason:otherReason||null,
        status:"pending",expires_at:expires,
      });
      fetch("/api/notify-admin",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"new_pending",userName:`${firstName} ${lastName}`.trim(),userEmail:email,role:selectedRole,eduEmail:eduEmail||null,reason:otherReason||null})
      }).catch(console.error);
    }

    if(isUnder18&&(parentEmail||parentCoachEmail)){
      fetch("/api/notify-guardian",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({parentEmail:parentEmail||null,coachEmail:parentCoachEmail||null,studentName:`${firstName} ${lastName}`.trim(),studentAge:age,school:"",sport:""})
      }).catch(console.error);
    }

    setLoading(false);
    router.replace("/onboarding");
  };

  const inp={width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:10,padding:"13px 14px",fontSize:14,color:T.ink,fontFamily:T.sans,outline:"none",transition:"border-color 0.15s"} as React.CSSProperties;
  const lbl={fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:T.muted,display:"block",marginBottom:6};

  return(
    <div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px",fontFamily:T.sans}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input:focus,select:focus,textarea:focus{border-color:${T.orange}!important;outline:none;}input::placeholder,textarea::placeholder{color:${T.faint};}.rc:hover{border-color:${T.orange}!important;background:${T.orangeL}!important;}`}</style>
      <div style={{width:"100%",maxWidth:520}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,justifyContent:"center"}}>
          <div style={{width:36,height:36,borderRadius:9,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:T.anton,fontSize:20,color:"#fff"}}>P</span></div>
          <div><div style={{fontFamily:T.anton,fontSize:18,color:T.ink}}>PLAYBOOK</div><div style={{fontFamily:T.mono,fontSize:7,letterSpacing:"0.3em",color:T.orange}}>SERIES INC.</div></div>
        </div>
        <div style={{display:"flex",background:T.surface2,borderRadius:12,padding:4,marginBottom:24,border:`1px solid ${T.line}`}}>
          {(["signup","login"]as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");setStep("role");}} style={{flex:1,fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:mode===m?T.orange:"transparent",color:mode===m?"#fff":T.muted,border:"none",borderRadius:9,padding:"11px",cursor:"pointer",transition:"all 0.15s"}}>
              {m==="login"?"Log in":"Sign up free"}
            </button>
          ))}
        </div>
        <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:20,padding:"28px 26px"}}>

          {/* LOGIN */}
          {mode==="login"&&(
            <div>
              <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:20,lineHeight:1}}>Welcome back</h1>
              <div style={{marginBottom:14}}><label style={lbl}>Email</label><input type="email" style={inp} placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
              <div style={{marginBottom:20}}><label style={lbl}>Password</label><input type="password" style={inp} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/></div>
              {error&&<p style={{fontSize:13,color:"#DC2626",marginBottom:14}}>{error}</p>}
              <button onClick={handleLogin} disabled={loading} style={{width:"100%",fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:12,padding:"14px",cursor:"pointer"}}>{loading?"Logging in...":"Log in →"}</button>
            </div>
          )}

          {/* SIGNUP STEP 1 — Role */}
          {mode==="signup"&&step==="role"&&(
            <div>
              <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:6,lineHeight:1}}>Who are you?</h1>
              <p style={{fontSize:13,color:T.muted,marginBottom:20,lineHeight:1.6}}>Select your role to get the right experience built for you.</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {ROLES.map(r=>(
                  <div key={r.key} className="rc" onClick={()=>setSelectedRole(r.key)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:12,border:`1.5px solid ${selectedRole===r.key?T.orange:T.line}`,background:selectedRole===r.key?T.orangeL:"transparent",cursor:"pointer",transition:"all 0.12s"}}>
                    <span style={{fontSize:22,flexShrink:0}}>{r.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:selectedRole===r.key?T.orange:T.ink}}>{r.label}</div>
                      <div style={{fontSize:12,color:T.muted,marginTop:2}}>{r.desc}</div>
                    </div>
                    {(r.needsEdu||r.needsAdmin)&&(
                      <span style={{fontFamily:T.mono,fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:r.needsEdu?T.blueL:T.orangeL,color:r.needsEdu?T.blue:T.orange,padding:"3px 8px",borderRadius:999,flexShrink:0,whiteSpace:"nowrap"as const}}>
                        {r.needsEdu?".edu required":"Admin approval"}
                      </span>
                    )}
                    <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${selectedRole===r.key?T.orange:T.line}`,background:selectedRole===r.key?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {selectedRole===r.key&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setStep("details")} disabled={!selectedRole} style={{width:"100%",fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:selectedRole?T.orange:T.line,color:selectedRole?"#fff":T.muted,border:"none",borderRadius:12,padding:"14px",cursor:selectedRole?"pointer":"default",transition:"all 0.15s"}}>Continue →</button>
            </div>
          )}

          {/* SIGNUP STEP 2 — Details */}
          {mode==="signup"&&step==="details"&&(
            <div>
              <button onClick={()=>setStep("role")} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",border:"none",color:T.muted,cursor:"pointer",marginBottom:16,padding:0}}>← Change role</button>
              <div style={{display:"flex",alignItems:"center",gap:10,background:T.orangeL,border:`1px solid ${T.orange}22`,borderRadius:10,padding:"10px 14px",marginBottom:20}}>
                <span style={{fontSize:18}}>{role?.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.orange}}>{role?.label}</div>
                  {(needsEdu||role?.needsAdmin)&&<div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginTop:2}}>VERIFICATION REQUIRED BEFORE FULL ACCESS</div>}
                </div>
              </div>
              <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:26,textTransform:"uppercase",color:T.ink,marginBottom:18,lineHeight:1}}>Create your account</h1>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div><label style={lbl}>First name *</label><input style={inp} placeholder="Stephisha" value={firstName} onChange={e=>setFirstName(e.target.value)}/></div>
                <div><label style={lbl}>Last name</label><input style={inp} placeholder="Walton" value={lastName} onChange={e=>setLastName(e.target.value)}/></div>
              </div>
              <div style={{marginBottom:14}}><label style={lbl}>Email *</label><input type="email" style={inp} placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
              <div style={{marginBottom:14}}><label style={lbl}>Password *</label><input type="password" style={inp} placeholder="At least 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/></div>
              <div style={{marginBottom:14}}><label style={lbl}>Date of birth *</label><input type="date" style={inp} value={dob} onChange={e=>setDob(e.target.value)}/></div>

              {showParent&&(
                <div style={{background:T.orangeL,border:`1.5px solid ${T.orange}44`,borderRadius:12,padding:"16px",marginBottom:14}}>
                  <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.orange,marginBottom:4}}>Under 18 — required</p>
                  <p style={{fontSize:13,color:T.muted,marginBottom:14,lineHeight:1.6}}>We will notify a parent/guardian or coach when your account is created.</p>
                  <div style={{marginBottom:12}}><label style={lbl}>Parent / guardian email</label><input type="email" style={inp} placeholder="parent@email.com" value={parentEmail} onChange={e=>setParentEmail(e.target.value)}/></div>
                  <div><label style={lbl}>Coach email (optional)</label><input type="email" style={inp} placeholder="coach@school.edu" value={parentCoachEmail} onChange={e=>setParentCoachEmail(e.target.value)}/></div>
                </div>
              )}

              {needsEdu&&!isEdu(email)&&(
                <div style={{background:T.blueL,border:`1.5px solid ${T.blue}44`,borderRadius:12,padding:"16px",marginBottom:14}}>
                  <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.blue,marginBottom:4}}>.edu verification required</p>
                  <p style={{fontSize:13,color:T.muted,marginBottom:14,lineHeight:1.6}}>{selectedRole==="coach"?"Coaches without a .edu will be reviewed by our admin team.":"Please enter your institutional .edu email to be auto-approved."}</p>
                  <div><label style={lbl}>.edu email</label><input type="email" style={inp} placeholder="you@school.edu" value={eduEmail} onChange={e=>setEduEmail(e.target.value)}/></div>
                  {eduEmail&&isEdu(eduEmail)&&<p style={{fontFamily:T.mono,fontSize:10,color:T.green,marginTop:8,fontWeight:700}}>✓ .edu detected — you will be auto-approved!</p>}
                </div>
              )}

              {needsEdu&&isEdu(email)&&(
                <div style={{background:"#ECFDF5",border:`1px solid ${T.green}44`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                  <p style={{fontFamily:T.mono,fontSize:10,color:T.green,fontWeight:700}}>✓ .edu email detected — you will be auto-approved!</p>
                </div>
              )}

              {selectedRole==="other"&&(
                <div style={{marginBottom:14}}>
                  <label style={lbl}>Why are you joining? *</label>
                  <textarea value={otherReason} onChange={e=>setOtherReason(e.target.value)} placeholder="Tell us about yourself and why you would like to join..." rows={3} style={{...inp,resize:"vertical" as const}}/>
                </div>
              )}

              {getVerifStatus()==="pending"&&(
                <div style={{background:T.surface2,borderRadius:10,padding:"12px 14px",marginBottom:14,borderLeft:`3px solid ${T.blue}`}}>
                  <p style={{fontSize:12,color:T.muted,lineHeight:1.65}}>After signing up you will complete your profile. Full access is pending verification — if not verified within 14 days your request will be cancelled.</p>
                </div>
              )}

              {error&&<p style={{fontSize:13,color:"#DC2626",marginBottom:14,padding:"10px 14px",background:"#FEF2F2",borderRadius:8}}>{error}</p>}

              <button onClick={handleSignup} disabled={loading} style={{width:"100%",fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:12,padding:"14px",cursor:loading?"default":"pointer",opacity:loading?0.7:1,transition:"all 0.15s"}}>
                {loading?"Creating account...":"Create account →"}
              </button>
              <p style={{textAlign:"center",marginTop:14,fontSize:12,color:T.faint,lineHeight:1.6}}>By signing up you agree to our Terms of Service. Student data is private and never sold.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
