/**
 * Presentation only. Confidentiality authority is enforced by the Vault RPC,
 * never by the presence of this seal.
 */
export default function ConfidentialPlaybookSeal() {
  return (
    <div role="img" aria-label="Playbook sealed confidential recommendation: contents are not accessible to the Scholar"
      style={{width:116,height:116,borderRadius:"50%",border:"3px double #A67C23",
        background:"radial-gradient(circle at 35% 25%, #fff5cb 0%, #d9ac45 38%, #926319 100%)",
        display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"inset 0 0 0 5px #f6e3a4, inset 0 0 0 7px #825e1d",
        color:"#3b290c",flexShrink:0}}>
      <div style={{textAlign:"center",maxWidth:90}}>
        <span style={{display:"block",fontSize:10,fontWeight:900,letterSpacing:1}}>PLAYBOOK</span>
        <span style={{display:"block",fontSize:28,lineHeight:1.2,fontWeight:900}}>P</span>
        <span style={{display:"block",fontSize:9,fontWeight:900,letterSpacing:1}}>SEALED</span>
        <span style={{display:"block",fontSize:8,fontWeight:800,letterSpacing:.6}}>CONFIDENTIAL</span>
      </div>
    </div>
  );
}
