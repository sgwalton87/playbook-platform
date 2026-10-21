// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';

it('enforces consent, listing eligibility, ownership, partner isolation and withdrawal in PostgreSQL', async () => {
 const db = new PGlite();
 try {
 await db.exec(`
 create role anon; create role authenticated; create schema auth; create schema private;
 grant usage on schema public,private,auth to authenticated,anon;
 create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
 create function private.current_user_is_onboarded_learner() returns boolean language sql as $$ select auth.uid()='00000000-0000-0000-0000-000000000001'::uuid $$;
 create function private.current_user_has_brand_campaign_authority() returns boolean language sql as $$ select auth.uid() is not null $$;
 create table public.profiles(id uuid primary key,full_name text,first_name text,last_name text);
 create table public.application_workspaces(id uuid primary key,scholar_id uuid,status text,opportunity_id text);
 create table public.brand_partners(id uuid primary key,brand_user_id uuid,active boolean);
 create table public.marketplace_opportunities(id uuid primary key,partner_id uuid,status text,deadline date,title text,opportunity_type text);
 insert into public.profiles values ('00000000-0000-0000-0000-000000000001','Scholar',null,null);
 insert into public.profiles values ('00000000-0000-0000-0000-000000000002','Partner',null,null);
 insert into public.brand_partners values ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002',true);
 insert into public.marketplace_opportunities values ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000003','published',current_date,'Opportunity','job');
 insert into public.application_workspaces values ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','submitted','00000000-0000-0000-0000-000000000004');
 `);
 await db.exec(readFileSync('supabase/migrations/20260818234500_marketplace_applicant_consent_tracking.sql','utf8'));
 await db.exec("set test.uid='00000000-0000-0000-0000-000000000001'; select public.share_marketplace_application('00000000-0000-0000-0000-000000000005');");
 await db.exec(readFileSync('supabase/migrations/'+readdirSync('supabase/migrations').find(n=>n.endsWith('_marketplace_consent_hardening.sql')),'utf8'));
 expect((await db.query<{consent_status:string;consent_version:string|null}>('select consent_status,consent_version from public.marketplace_application_shares')).rows[0]).toEqual({consent_status:'revoked',consent_version:null});
 const actor = async (id:string) => { await db.exec(`reset role; set test.uid='${id}'; set role authenticated;`); };
 const owner='00000000-0000-0000-0000-000000000001',partner='00000000-0000-0000-0000-000000000002';
 const ws="'00000000-0000-0000-0000-000000000005'";
 const share=`select * from public.share_marketplace_application(${ws},'marketplace-applicant-share-v1')`;
 await actor(owner);
 await expect(db.query(`select * from public.share_marketplace_application(${ws},'old')`)).rejects.toThrow();
 await expect(db.query(`select * from public.share_marketplace_application(${ws})`)).rejects.toThrow();
 for (const state of ['closed','expired','inactive','draft']) {
  await db.exec('reset role');
  await db.exec(`update public.marketplace_opportunities set status='${state==='closed'?'closed':'published'}',deadline=${state==='expired'?"current_date-1":"current_date"}; update public.brand_partners set active=${state!=='inactive'}; update public.application_workspaces set status='${state==='draft'?'building':'submitted'}';`);
  await actor(owner); await expect(db.query(share)).rejects.toThrow();
 }
 await db.exec("reset role; update public.application_workspaces set status='submitted'; update public.brand_partners set active=true;");
 await actor(partner); await expect(db.query(share)).rejects.toThrow();
 await actor(owner); const saved=await db.query<{id:string}>(share); const id=saved.rows[0].id;
 await actor(partner); expect((await db.query('select * from public.get_marketplace_applicants()')).rows).toHaveLength(1);
 await actor('00000000-0000-0000-0000-000000000009'); expect((await db.query('select * from public.get_marketplace_applicants()')).rows).toHaveLength(0);
 await expect(db.query(`select * from public.set_marketplace_applicant_outcome('${id}','selected',null)`)).rejects.toThrow();
 await actor(partner); await db.query(`select * from public.set_marketplace_applicant_outcome('${id}','selected',null)`);
 await db.exec("reset role; update public.marketplace_opportunities set status='closed';");
 await actor(owner); await db.query(`select * from public.revoke_marketplace_application_share(${ws})`);
 await actor(partner); expect((await db.query('select * from public.get_marketplace_applicants()')).rows).toHaveLength(0);
 await expect(db.query(`select * from public.set_marketplace_applicant_outcome('${id}','selected',null)`)).rejects.toThrow();
 await db.exec("reset role; update public.marketplace_opportunities set status='published';");
 await actor(owner); await db.query(share);
 await expect(db.query('select * from private.marketplace_consent_events')).rejects.toThrow();
 await db.exec("reset role; set role anon;"); await expect(db.query(share)).rejects.toThrow();
 await db.exec('reset role');
 expect((await db.query<{count:number}>('select count(*)::int as count from private.marketplace_consent_events')).rows[0].count).toBeGreaterThanOrEqual(7);
 } finally { await db.close(); }
},30000);
