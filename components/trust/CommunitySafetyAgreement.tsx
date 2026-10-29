import { COMMUNITY_CONDUCT_PARAGRAPHS } from "@/lib/trust/communityStandards";
export default function CommunitySafetyAgreement() {
 return <section><h3 style={{ marginTop: 0 }}>The Playbook Community Safety Agreement</h3>{COMMUNITY_CONDUCT_PARAGRAPHS.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</section>;
}
