import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
const read=(path:string)=>readFileSync(path,"utf8");
describe("Scholar tutorial discoverability and honest progress",()=>{
 it("routes learners to the modular tutorial and tools",()=>{
  const nav=read("lib/navigation/roleNavigation.ts");
  expect(nav).toContain('label: "Playbook Tutorial", href: "/tutorial"');
  expect(nav).toContain('label: "My Tools", href: "/scholar/tools"');
  const tools=read("app/scholar/tools/page.tsx");
  expect(tools).toContain('href:"/tutorial"');
 });
 it("never claims unverified tutorial progress",()=>{
  const tutorial=read("components/tutorial/FirstLoginTour.tsx");
  expect(tutorial).not.toContain('getTutorialProgress(["home", "record"])');
  expect(tutorial).toContain("Progress is not presented until completion can be verified");
 });
});
