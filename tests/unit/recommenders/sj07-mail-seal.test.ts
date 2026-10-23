import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const read=(path:string)=>readFileSync(join(process.cwd(),path),"utf8");

describe("SJ-07 LOR sender and confidential seal contract",()=>{
  it("uses a dedicated recommendation sender and keeps noreply distinct",()=>{
    expect(read("lib/email/emailConfig.ts")).toContain('PLAYBOOK_EMAIL_LOR || "LOR@playbookseriesinc.org"');
    expect(read("lib/email/emailConfig.ts")).toContain('PLAYBOOK_EMAIL_NOREPLY || "noreply@playbookseriesinc.org"');
    expect(read("app/api/recommenders/request/route.ts")).toContain('fromType: "lor"');
    expect(read("lib/email/emailService.ts")).toContain('input.fromType === "lor"');
  });
  it("only displays the gold sealed indicator for confidential letters",()=>{
    const ui=read("app/scholar/recommendations/page.tsx");
    expect(ui).toContain('letter.confidentiality==="confidential" && <ConfidentialPlaybookSeal />');
    expect(ui).toContain('letter.confidentiality==="open"&&<button');
    const seal=read("components/recommenders/ConfidentialPlaybookSeal.tsx");
    expect(seal).toContain('aria-label="Playbook sealed confidential recommendation');
    expect(seal).toContain("CONFIDENTIAL");
  });
  it("does not make the visual seal a security boundary",()=>{
    const migration=read("supabase/migrations/202610230010_sj07_private_recommendation_artifacts.sql");
    expect(migration).toContain("a.confidentiality='open'");
    expect(migration).toContain("revoke all on public.recommendation_letter_artifacts from public, anon, authenticated");
  });
});
