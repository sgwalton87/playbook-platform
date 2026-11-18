"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Organization = {
 name:string; summary:string|null;website_url:string|null;logo_url:string|null;
 location:string|null;partnership_focus:string[];
};
export default function BrandPartnerLogoControl(){
 const [organization,setOrganization]=useState<Organization|null>(null);
 const [status,setStatus]=useState("Loading company branding…");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;
  void supabase.rpc("ensure_brand_partner_organization").then(({data,error})=>{
   if(!active)return;
   const row=Array.isArray(data)?data[0]:data;
   if(error||!row?.name){setStatus("Company logo upload is available after verification. You can also manage a private organization draft in Organization Profile.");return;}
   setOrganization(row as Organization);setStatus("");
  });
  return()=>{active=false;};
 },[]);
 async function upload(file?:File){
  if(!file||!organization||busy)return;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>3*1024*1024||file.size===0){
   setStatus("Choose PNG, JPG, or WEBP under 3 MB.");return;
  }
  setBusy(true);setStatus("Uploading company logo…");
  try{
   const {data:{user}}=await supabase.auth.getUser();
   if(!user)throw new Error("Sign in to update your company branding.");
   const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
   const path=`${user.id}/logo-${crypto.randomUUID()}.${ext}`;
   const result=await supabase.storage.from("brand-organization-logos").upload(path,file,{contentType:file.type,upsert:false});
   if(result.error)throw new Error(result.error.message);
   const url=supabase.storage.from("brand-organization-logos").getPublicUrl(path).data.publicUrl;
   if(!url)throw new Error("Public organization logo URL unavailable.");
   const update=await supabase.rpc("update_brand_partner_organization",{
    requested_summary:organization.summary,
    requested_website_url:organization.website_url,
    requested_logo_url:url,
    requested_location:organization.location,
    requested_partnership_focus:organization.partnership_focus??[],
   });
   if(update.error)throw new Error("File uploaded, but profile update was not confirmed: "+update.error.message);
   const verification=await supabase.rpc("ensure_brand_partner_organization");
   const row=Array.isArray(verification.data)?verification.data[0]:verification.data;
   if(verification.error||row?.logo_url!==url)throw new Error("Logo update could not be verified. Check Organization Profile before leaving.");
   setOrganization(row as Organization);setStatus("Company logo saved and verified. Your Playbook partnership posts can now use it.");
  }catch(error){setStatus(error instanceof Error?error.message:"Company logo upload failed.");}
  finally{setBusy(false);}
 }
 return <section aria-label="Company logo on My Profile" style={{display:"grid",gap:10,marginTop:16,padding:16,borderRadius:12,border:"1px solid #FDBA74",background:"#FFFFFF",color:"#0F172A"}}>
  <h3 style={{margin:0,fontSize:19}}>Company logo</h3>
  {organization?.logo_url&&<img src={organization.logo_url} alt={organization.name+" current logo"} style={{width:90,height:90,objectFit:"contain",background:"#FFFFFF",border:"1px solid #CBD5E1",borderRadius:10}} />}
  <label style={{display:"grid",gap:7,fontWeight:750}}>Upload or replace logo
   <input aria-label="Upload or replace company logo" type="file" accept=".png,.jpg,.jpeg,.webp" disabled={busy||!organization} onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value="";void upload(file);}} style={{padding:10,border:"1px solid #94A3B8",borderRadius:8,color:"#0F172A",background:"#FFFFFF"}} />
  </label>
  <small style={{color:"#475569"}}>Logo is public marketplace artwork. Do not upload private verification evidence. JPG, PNG or WEBP, up to 3 MB.</small>
  <p role="status" aria-live="polite" style={{margin:0,color:"#0F172A",fontWeight:700}}>{status}</p>
 </section>;
}
