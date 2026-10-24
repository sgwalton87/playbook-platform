import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
const src=(p:string)=>readFileSync(p,"utf8");
describe("Scholar tool discoverability and Compass truth",()=>{
  it("exposes direct tools to Scholar and Scholar-Athlete and TAY navigation",()=>{
    const nav=src("lib/navigation/roleNavigation.ts");
    expect(nav).toContain('label: "My Tools", href: "/scholar/tools"');
    expect(nav).toContain('label: "Recommendation Requests", href: "/recommenders"');
    expect(nav).toContain('label: "Recommendation Vault", href: "/scholar/recommendations"');
    expect(nav).toContain('...SCHOLAR_TOOLS');
    expect(src("app/scholar/tools/page.tsx")).toContain('My Tools');
  });
  it("does not invent a 40 point trust floor or transcript credits",()=>{
    expect(src("lib/compass/CompassEngine.ts")).not.toContain("trustScore: input.trustScore || 40");
    const screen=src("app/compass/page.tsx");
    expect(screen).not.toContain("years_completed || 0) * 10");
    expect(screen).toContain("credits: 0");
    expect(src("components/compass/CompassCoreCard.tsx")).toContain("Score pending verified evidence");
  });
});
