// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll,afterAll,describe,it,expect } from "vitest";
const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
let db:PGlite;
async function actor(n:number){await db.exec(`reset role;set test.uid='${id(n)}';set role authenticated;`);}
async function decide(outcome:string,reason:string,action:number,flags=true){return db.query<{result:{communicationId:string;deliveryStatus:string;replayed?:boolean}}>("select public.complete_brand_review($1,$2,$3,$4,$5,$6,$7,$8,$9) as result",[id(30),outcome,reason,"Public reviewer message","PRIVATE STAFF NOTE",id(action),flags,flags,flags]);}
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create schema auth;create schema private;create schema storage;
 grant usage on schema auth,private,storage to authenticated;
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
 create table auth.users(id uuid primary key,email text);
 create table public.profiles(id uuid primary key,role text,profile_mode text);
 alter table public.profiles enable row level security;grant select on public.profiles to authenticated;
 create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
 create function private.current_user_is_verification_reviewer() returns boolean language sql security definer set search_path='' as $$select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','founder'))$$;
 create table storage.objects(id uuid primary key,bucket_id text,name text,created_at timestamptz default now());alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to authenticated;
 create policy storage_admin on storage.objects for select to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
 create table public.brand_partner_verification_requests(id uuid primary key,brand_user_id uuid unique,organization_name text,status text,submitted_at timestamptz default now(),reviewed_at timestamptz,review_notes text,campaign_scope_approved boolean default false,compliance_scope_approved boolean default false,updated_at timestamptz default now());
 alter table public.brand_partner_verification_requests enable row level security;grant select on public.brand_partner_verification_requests to authenticated;
 create policy request_owner on public.brand_partner_verification_requests for select to authenticated using(brand_user_id=auth.uid());
 create table public.verification_review_events(request_type text,request_id uuid,subject_user_id uuid,reviewer_user_id uuid,previous_status text,new_status text,review_notes text);
 insert into public.profiles values('${id(1)}','brand-partner','brand-partner'),('${id(2)}','admin',null),('${id(3)}','family','admin');
 insert into auth.users values('${id(1)}','partner@example.invalid');
 insert into storage.objects values('${id(10)}','brand-verification-evidence','${id(1)}/business-card-${id(11)}.jpg',now());
 insert into public.brand_partner_verification_requests(id,brand_user_id,organization_name,status) values('${id(30)}','${id(1)}','Example Brand','pending');`);
 const legacy=readFileSync('supabase/migrations/202608160052_verification_review_definer_surface_hardening.sql','utf8');
 const start=legacy.indexOf('create or replace function private.review_verification_request(');await db.exec(legacy.slice(start,legacy.indexOf('$$;',start)+3));
 await db.exec(readFileSync('supabase/migrations/20261028184949_brand_verification_admin_archive.sql','utf8'));
 await db.exec(readFileSync('supabase/migrations/20261028192445_brand_document_admin_read_cutover.sql','utf8'));
 await db.exec(`create trigger brand_evidence_before_approval before insert or update of status on public.brand_partner_verification_requests for each row execute function private.require_brand_partner_evidence_before_approval();`);
 await db.exec(readFileSync('supabase/migrations/20261028191001_brand_review_communications.sql','utf8'));
},30000);
afterAll(async()=>{await db.close();});
describe.sequential('governed review decisions and durable communication outbox',()=>{
 it('rejects owners and spoofed admin profile modes before exposing private notes or comms',async()=>{
  await actor(1);await expect(db.query('select public.get_brand_review_context($1)',[id(30)])).rejects.toThrow('reviewer authority');
  await expect(decide('approved','',40)).rejects.toThrow('reviewer authority');
  await expect(db.query('select * from public.verification_communications')).rejects.toThrow('permission');
  await actor(3);await expect(db.query('select public.list_brand_review_communications()')).rejects.toThrow('reviewer authority');
 });
 it('requires declarations and human resolution before approval, without changing role or sending mail',async()=>{
  await actor(2);await expect(decide('approved','',40)).rejects.toThrow('declarations');
  await actor(1);await db.query(`insert into public.brand_partner_registration_details values($1,'California','LLC','123','{"minors":"no","financial":"no","violence":"yes","pending":"private_review","restrictions":"no"}',true,now())`,[id(1)]);
  await actor(2);await expect(decide('approved','',40)).rejects.toThrow('Human registration');
 });
 it('records a specific additional-information message and separate private notes atomically; retries are idempotent',async()=>{
  await actor(2);await expect(decide('needs_information','invalid',41)).rejects.toThrow('reason');
  const first=await decide('needs_information','registration_details',41);expect(first.rows[0].result.communicationId).toBe(id(41));
  expect((await decide('needs_information','registration_details',41)).rows[0].result.replayed).toBe(true);
  const context=await db.query<{data:{notes:unknown[];communications:Array<Record<string,unknown>>}}>('select public.get_brand_review_context($1) as data',[id(30)]);
  expect(context.rows[0].data.notes).toHaveLength(1);expect(context.rows[0].data.communications).toHaveLength(1);expect(context.rows[0].data.communications[0]).not.toHaveProperty('claim_token');
  await actor(1);expect((await db.query<{public_message:string}>('select public_message from public.brand_partner_review_context')).rows).toEqual([{public_message:'Public reviewer message'}]);
  expect((await db.query('select * from public.verification_internal_notes')).rows).toHaveLength(0);
 });
 it('requires explicit document and scope checks, then activates only the existing role and queues invitation',async()=>{
  await actor(2);
  await db.query('select public.record_brand_registry_review($1,$2)',[id(30),{human_outcome:'matched_active',source_url:'https://bizfileonline.sos.ca.gov/search/business',review_note:'Exact entity and safety reviewed individually.',safety_reviewed:true}]);
  await expect(decide('approved','',42,false)).rejects.toThrow('Explicit document');
  expect((await decide('approved','',42)).rows[0].result.deliveryStatus).toBe('queued');
  await db.exec('reset role');const request=(await db.query<{status:string;campaign_scope_approved:boolean;compliance_scope_approved:boolean}>('select status,campaign_scope_approved,compliance_scope_approved from public.brand_partner_verification_requests')).rows[0];
  expect(request).toEqual({status:'approved',campaign_scope_approved:true,compliance_scope_approved:true});
  expect((await db.query<{role:string}>('select role from public.profiles where id=$1',[id(1)])).rows[0].role).toBe('brand-partner');
 });
 it('uses sender leases and never blindly resends a sent or uncertain message',async()=>{
  await actor(2);
  const claim=(await db.query<{data:{claim_token:string;recipient_email:string}}>('select public.claim_brand_review_email($1) as data',[id(42)])).rows[0].data;
  expect(claim.recipient_email).toBe('partner@example.invalid');
  expect((await db.query<{data:unknown}>('select public.claim_brand_review_email($1) as data',[id(42)])).rows[0].data).toBeNull();
  await expect(db.query("select public.finish_brand_review_email($1,$2,'sent',null,'test-id')",[id(42),id(99)])).rejects.toThrow('lease');
  await db.query("select public.finish_brand_review_email($1,$2,'delivery_unknown','Verify mailbox',null)",[id(42),claim.claim_token]);
  expect((await db.query<{data:unknown}>('select public.claim_brand_review_email($1) as data',[id(42)])).rows[0].data).toBeNull();
  await db.query('select public.add_brand_review_note($1,$2)',[id(30),'Follow-up private note after closed review.']);
 });
 it('preserves delivery failures for safe retry and invalidates a changed submission',async()=>{
  await actor(2);const claim=(await db.query<{data:{claim_token:string}}>('select public.claim_brand_review_email($1) as data',[id(41)])).rows[0].data;
  await db.query("select public.finish_brand_review_email($1,$2,'failed','Not accepted',null)",[id(41),claim.claim_token]);
  const retry=(await db.query<{data:{claim_token:string;attempt_count:number}}>('select public.claim_brand_review_email($1) as data',[id(41)])).rows[0].data;expect(retry.attempt_count).toBe(2);
  await db.query("select public.finish_brand_review_email($1,$2,'sent',null,'mail-id')",[id(41),retry.claim_token]);
  expect((await db.query<{data:unknown}>('select public.claim_brand_review_email($1) as data',[id(41)])).rows[0].data).toBeNull();
  await db.exec("reset role;update public.brand_partner_verification_requests set status='pending',submitted_at=now()+interval '1 hour';");
  await actor(2);const context=(await db.query<{data:{registry:{human_outcome:string;safety_reviewed:boolean}}}>('select public.get_brand_review_context($1) as data',[id(30)])).rows[0].data;
  expect(context.registry).toMatchObject({human_outcome:'needs_review',safety_reviewed:false});
 });
});
