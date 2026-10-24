import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";

describe("Activity profile onboarding UX and persistence contract",()=>{
  const source=readFileSync("components/profile/ActivityProfileField.tsx","utf8");
  it("presents collapsed expandable activity cards on mobile",()=>{
    expect(source).toContain('aria-expanded={isOpen}');
    expect(source).toContain('aria-controls={');
    expect(source).toContain('setExpanded(isOpen ? null : index)');
    expect(source).toContain('setExpanded(entries.length)');
  });
  it("provides a real category dropdown without mutating legacy categories until chosen",()=>{
    expect(source).toContain('<select style={input}');
    expect(source).toContain('Choose a category');
    expect(source).toContain('Previously saved category:');
    expect(source).not.toContain('list="playbook-activity-category-options"');
  });
  it("preserves supervisor contact fields as optional data",()=>{
    const schema=readFileSync("lib/onboarding/types.ts","utf8");
    expect(schema).toContain("supervisor_email?: string");
    expect(schema).toContain("supervisor_telephone?: string");
    for(const label of ["# Hours","Activity Supervisor","Supervisor Email (optional)","Supervisor Telephone (optional)"])expect(source).toContain(label);
    expect(source).toContain('type="email"');
    expect(source).toContain('type="tel"');
  });
  it("keeps the canonical parent-managed save process and removal",()=>{
    expect(source).toContain('onChange(entries.map(');
    expect(source).toContain('onChange(entries.filter(');
    expect(source).toContain('Save & verify');
    const parent=readFileSync("components/profile/RoleProfileEditor.tsx","utf8");
    expect(parent).toContain("stableProfileSnapshot");
    expect(parent).toContain('Saved and verified.');
  });
});
