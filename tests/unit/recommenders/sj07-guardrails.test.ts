import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root=process.cwd();
const source=(path:string)=>readFileSync(join(root,path),"utf8");
const migration=source("supabase/migrations/202610230010_sj07_private_recommendation_artifacts.sql");
const requestRoute=source("app/api/recommenders/request/route.ts");
const vaultRoute=source("app/api/recommendations/vault/route.ts");
const recommenderRoute=source("app/api/recommenders/[requestId]/letter/route.ts");

describe("SJ-07 governed recommendation boundary",()=>{
  it("retains the existing request authority and authenticates recipients",()=>{
    expect(requestRoute).toContain('from("recommender_requests")');
    expect(requestRoute).toContain('from("support_relationships")');
    expect(requestRoute).toContain('"support_tasks"');
    expect(recommenderRoute).toContain('email_confirmed_at');
    expect(migration).toContain('u.email_confirmed_at is not null');
    expect(migration).toContain('lower(trim(r.recommender_email)) <> v_user_email');
  });
  it("keeps immutable letter contents behind RLS and server-side claims",()=>{
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on public.recommendation_letter_artifacts from public, anon, authenticated");
    expect(migration).toContain("p_confidentiality in ('open','confidential')");
    expect(migration).toContain("a.confidentiality='open'");
    expect(migration).not.toContain("'letter_text',p_letter");
    expect(migration).not.toContain("'letter_text',trim(p_letter)");
  });
  it("uses Scholar Vault with metadata-only confidential references",()=>{
    expect(migration).toContain("insert into public.scholar_vault_items");
    expect(migration).toContain("Applications & Career / Recommendations");
    expect(migration).toContain("create or replace function public.attach_recommendation_to_application");
    expect(migration).toContain("a.scholar_id=auth.uid()");
    expect(migration).toContain("recommendation_request_ids");
    expect(vaultRoute).toContain('requireLearnerAuthority');
    expect(vaultRoute).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });
  it("requires authenticated role-scoped submission and avoids auto-publication",()=>{
    expect(recommenderRoute).toContain('requireUser');
    expect(recommenderRoute).toContain('submit_recommendation_letter');
    expect(recommenderRoute).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(migration).not.toContain("visibility,'public'");
  });
});
