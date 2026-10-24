import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
const read=(p:string)=>readFileSync(p,"utf8");
describe("Mobile Scholar acceptance regressions",()=>{
 it("Compass cannot squeeze guidance into an overflowing fixed-width row",()=>{
  const src=read("components/compass/CompassCoreCard.tsx");
  expect(src).toContain('gridTemplateColumns:"minmax(0,1fr)"');
  expect(src).toContain('overflowWrap:"anywhere"');
  expect(src).not.toContain('justifyContent:"space-between",gap:20');
 });
 it("incomplete onboarding shows recovery, not a blanket unauthorized error",()=>{
  const src=read("components/recommenders/RecommendationLearnerGate.tsx");
  expect(src).toContain('"onboarding"');
  expect(src).toContain('href="/start"');
  expect(src).toContain('profile.data.onboarding_completed?"allowed":"onboarding"');
 });
 it("My Tools is a real route and pinned in mobile navigation",()=>{
  expect(read("app/scholar/tools/page.tsx")).toContain("My Tools");
  expect(read("components/shell/UnifiedAppShell.tsx")).toContain('item.href === "/scholar/tools"');
 });
});
