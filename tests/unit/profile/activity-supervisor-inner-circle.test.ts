import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
const read=(p:string)=>readFileSync(p,"utf8");
describe("Activity supervisor Inner Circle selection",()=>{
 it("only offers active owner-perspective network relationships",()=>{
  const src=read("components/profile/ActivityProfileField.tsx");
  expect(src).toContain('fetch("/api/support-relationships"');
  expect(src).toContain('r.perspective === "scholar" && r.status === "active"');
  expect(src).toContain('person.id');
  expect(src).toContain('supervisor_relationship_id');
 });
 it("detaches a selected connection when a supervisor email is manually edited",()=>{
  const src=read("components/profile/ActivityProfileField.tsx");
  expect(src).toContain('supervisor_email:e.target.value,supervisor_relationship_id:""');
  expect(src).toContain('connections.some(person=>person.id===entry.supervisor_relationship_id)');
 });
 it("preserves manual supervisor entry and safely handles failed network reads",()=>{
  const src=read("components/profile/ActivityProfileField.tsx");
  expect(src).toContain("Enter a supervisor manually");
  expect(src).toContain("You can still enter a supervisor manually.");
  expect(src).toContain('supervisor_relationship_id:""');
  expect(read("lib/onboarding/types.ts")).toContain("supervisor_relationship_id?: string");
 });
});
