import PlaybookLogo from "@/components/brand/PlaybookLogo";

/**
 * Brand-consistent visual confidentiality marker. The actual permission
 * boundary remains the Vault RPC and never depends on this component.
 */
export default function ConfidentialPlaybookSeal() {
  return (
    <div
      role="group"
      aria-label="Playbook sealed confidential recommendation. Letter contents are not accessible to the Scholar."
      style={{
        width: 154, minHeight: 174, flexShrink: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 9, borderRadius: 20, border: "2px solid #AF842A",
        background: "linear-gradient(135deg, #151515 0%, #282015 60%, #100E0B 100%)",
        boxShadow: "inset 0 0 0 2px #E6C16C",
        color: "#F4D48C", textAlign: "center",
      }}
    >
      <PlaybookLogo size={112} />
      <span style={{
        marginTop: 3, fontSize: 10, fontWeight: 900, letterSpacing: "0.14em",
        borderTop: "1px solid #D5A447", paddingTop: 7,
      }}>SEALED · CONFIDENTIAL</span>
      <span style={{fontSize: 9, marginTop: 3}}>Recommender-controlled</span>
    </div>
  );
}
