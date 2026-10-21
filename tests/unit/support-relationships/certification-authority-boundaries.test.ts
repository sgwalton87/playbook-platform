// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect,it } from 'vitest';
it('enforces reward deduplication and closes direct Event mutations while preserving reads',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create table public.coin_ledger(scholar_id uuid,event_type text,source_id text);create table public.community_events(id int);grant all on public.community_events to public,anon,authenticated;`);
  await db.exec(readFileSync('supabase/migrations/20261021033355_certification_authority_boundaries.sql','utf8'));
  const row=(await db.query("select has_table_privilege('authenticated','public.community_events','SELECT') as read,has_table_privilege('authenticated','public.community_events','INSERT,UPDATE,DELETE') as write")).rows[0];
  expect(row).toEqual({read:true,write:false});
  await db.exec("insert into public.coin_ledger values('00000000-0000-0000-0000-000000000001','course','source');");
  await expect(db.exec("insert into public.coin_ledger values('00000000-0000-0000-0000-000000000001','course','source');")).rejects.toThrow('unique');
  await db.exec("insert into public.coin_ledger values('00000000-0000-0000-0000-000000000002','course','source');");
 }finally{await db.close();}
},30000);

it('caches the fresh A-G owner policies without changing read or reassignment authority',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create schema auth;grant usage on schema auth to authenticated;
   create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
   create table public.coin_ledger(scholar_id uuid,event_type text,source_id text);create table public.community_events(id int);
   create table public.onboarding_options(created_by uuid,value text);alter table public.onboarding_options enable row level security;
   grant insert on public.onboarding_options to authenticated;
   create policy "Authenticated users can add options" on public.onboarding_options for insert to authenticated with check(auth.uid()=created_by);
   create table public.ag_progress(user_id uuid,note text);alter table public.ag_progress enable row level security;
   grant select,insert,update on public.ag_progress to authenticated;
   create policy "Students can view own ag progress" on public.ag_progress for select to authenticated using(auth.uid()=user_id);
   create policy "Students can update own ag progress" on public.ag_progress for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
   insert into public.ag_progress values('00000000-0000-0000-0000-000000000001','owner'),('00000000-0000-0000-0000-000000000002','other');`);
  await db.exec(readFileSync('supabase/migrations/20261021033355_certification_authority_boundaries.sql','utf8'));
  await db.exec("set test.uid='00000000-0000-0000-0000-000000000001';set role authenticated;");
  await db.exec("insert into public.onboarding_options values('00000000-0000-0000-0000-000000000001','owned')");
  await expect(db.exec("insert into public.onboarding_options values('00000000-0000-0000-0000-000000000002','forged')")).rejects.toThrow('row-level security');
  expect((await db.query('select note from public.ag_progress')).rows).toEqual([{note:'owner'}]);
  expect((await db.query("update public.ag_progress set note='forged' where user_id='00000000-0000-0000-0000-000000000002' returning note")).rows).toEqual([]);
  await expect(db.query("update public.ag_progress set user_id='00000000-0000-0000-0000-000000000002'")).rejects.toThrow('row-level security');
 }finally{await db.close();}
},30000);
