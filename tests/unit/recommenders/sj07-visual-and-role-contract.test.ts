import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
const read=(p:string)=>readFileSync(p,"utf8");
describe("SJ-07 cross-role and visual regression gates",()=>{
  it("admits exactly the learner roles under the server contract",()=>{
    const gate=read("components/recommenders/RecommendationLearnerGate.tsx");
    expect(gate).toContain("LEARNER_ROLES.some");
    expect(gate).toContain("onboarding_completed");
    for(const screen of ["app/recommenders/page.tsx","app/scholar/recommendations/page.tsx"]){
      expect(read(screen)).toContain("<RecommendationLearnerGate>");
    }
  });
  it("uses the same scoped visual system on all recommendation screens",()=>{
    const css=read("components/recommenders/lor-portal.css");
    expect(css).toContain(".lor-shell");
    expect(css).toContain("@media(max-width:600px)");
    for(const screen of ["app/recommenders/page.tsx","app/recommenders/[requestId]/page.tsx","app/scholar/recommendations/page.tsx"]){
      const src=read(screen);
      expect(src).toContain("lor-portal.css");
      expect(src).toContain('className="lor-shell"');
    }
  });
  it("validates outbound invitations and never promises unsupported downloads or delivery",()=>{
    const route=read("app/api/recommenders/request/route.ts");
    expect(route).toContain("const contactEmail");
    expect(route).toContain("contactEmail===user.email.toLowerCase()");
    expect(read("app/recommenders/[requestId]/page.tsx")).not.toContain("Scholar can view and download");
    expect(read("app/recommenders/page.tsx")).toContain("does not send a letter to an institution");
  });
});
