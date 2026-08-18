import Link from "next/link";

export default function ScholarshipNotFound(){return <main style={{minHeight:"60vh",display:"grid",placeItems:"center",padding:32}}><section style={{maxWidth:640,textAlign:"center"}}><h1>Scholarship not found</h1><p style={{color:"#64748B"}}>This scholarship is not available in the published Playbook catalog.</p><Link href="/scholarships">Return to scholarships</Link></section></main>;}
