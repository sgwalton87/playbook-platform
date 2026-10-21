// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect,it } from 'vitest';
const migration=readFileSync('supabase/migrations/20261021031303_mentor_validation_authority_convergence.sql','utf8');
const id=(n:number)=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
async function setup(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create schema auth;create schema private;
 grant usage on schema auth,private to authenticated;
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
 create table public.support_invitations(id uuid primary key,scholar_id uuid,relationship text,status text,invitee_user_id uuid,invitee_email text);
 create table public.support_relationships(id uuid primary key default gen_random_uuid(),scholar_id uuid,supporter_id uuid,supporter_email text,supporter_name text,relationship text,permissions jsonb,source_invitation_id uuid unique,status text check(status in ('active','removed','blocked')),created_at timestamptz default now());
 alter table public.support_relationships enable row level security;
 create policy own_support on public.support_relationships for select to authenticated using(scholar_id=auth.uid() or supporter_id=auth.uid());
 grant select on public.support_relationships to authenticated;
 create function private.claim_support_invitation(text,text) returns text language sql as $$select 'preserved-hardened-claim'::text$$;
 insert into public.support_invitations values('${id(101)}','${id(1)}','mentor','accepted',null,'mentor@example.invalid');
 insert into public.support_relationships(id,scholar_id,supporter_id,relationship,status) values
 ('${id(201)}','${id(1)}','${id(3)}','parent_guardian','active'),
 ('${id(202)}','${id(1)}','${id(4)}','educator','active'),
 ('${id(203)}','${id(1)}','${id(5)}','counselor','active');`);
 const before=(await db.query<{source:string}>("select pg_get_functiondef('private.claim_support_invitation(text,text)'::regprocedure) as source")).rows[0].source;
 await db.exec(migration);
 expect((await db.query<{source:string}>("select pg_get_functiondef('private.claim_support_invitation(text,text)'::regprocedure) as source")).rows[0].source).toBe(before);
 await db.exec(`insert into public.mentor_validation_requests(id,invitation_id,scholar_id,mentor_user_id,mentor_email) values('${id(100)}','${id(101)}','${id(1)}','${id(2)}','mentor@example.invalid');`);
 return db;
}
async function actor(db:PGlite,n:number){await db.exec(`reset role;set test.uid='${id(n)}';set role authenticated;`);}
const approve=(db:PGlite)=>db.query<{approval_count:number;privileged_validator:boolean;threshold_met:boolean}>(`select * from public.approve_mentor_validation('${id(100)}')`);
const finalize=(db:PGlite)=>db.query(`select * from public.finalize_mentor_validation('${id(100)}')`);

it('requires one privileged approval, activates once and never resurrects revoked access',async()=>{
 const db=await setup();try{
  await actor(db,6);await expect(approve(db)).rejects.toThrow('Only active');
  await actor(db,2);await expect(approve(db)).rejects.toThrow('own request');await expect(finalize(db)).rejects.toThrow('threshold');
  await actor(db,3);const result=await approve(db);expect(result.rows[0]).toMatchObject({privileged_validator:true,threshold_met:true});
  await expect(finalize(db)).rejects.toThrow('Only the invited mentor');
  await actor(db,2);await finalize(db);await finalize(db);
  await db.exec('reset role');
  const relationships=await db.query<{permissions:string[];status:string}>(`select permissions,status from public.support_relationships where source_invitation_id='${id(101)}'`);
  expect(relationships.rows).toEqual([{permissions:['view_progress','recommend_actions','support_tasks'],status:'active'}]);
  await db.exec(`update public.support_relationships set status='removed' where source_invitation_id='${id(101)}'`);
  await actor(db,2);await expect(finalize(db)).rejects.toThrow('no longer active');
 }finally{await db.close();}
},30000);

it('requires two distinct active ordinary validators and rechecks revocation at activation',async()=>{
 const db=await setup();try{
  await actor(db,4);expect((await approve(db)).rows[0].threshold_met).toBe(false);
  expect((await approve(db)).rows[0].threshold_met).toBe(false);
  await actor(db,5);expect((await approve(db)).rows[0].threshold_met).toBe(true);
  await db.exec(`reset role;update public.support_relationships set status='removed' where id='${id(202)}';`);
  await actor(db,2);await expect(finalize(db)).rejects.toThrow('threshold');
  await db.exec(`reset role;update public.support_relationships set status='active' where id='${id(202)}';`);
  await actor(db,2);await finalize(db);
 }finally{await db.close();}
},30000);

it('bounds reads and direct writes and rejects unaccepted source invitations',async()=>{
 const db=await setup();try{
  await actor(db,6);expect((await db.query('select * from public.mentor_validation_requests')).rows).toEqual([]);
  await actor(db,1);expect((await db.query('select * from public.mentor_validation_requests')).rows).toHaveLength(1);
  await actor(db,3);await expect(db.query(`insert into public.mentor_validation_approvals(request_id,approver_relationship_id,approver_user_id,relationship_snapshot) values('${id(100)}','${id(201)}','${id(3)}','parent_guardian')`)).rejects.toThrow('permission');
  await expect(db.query("update public.mentor_validation_requests set status='approved'")).rejects.toThrow('permission');
  await db.exec(`reset role;update public.support_invitations set status='pending';`);
  await actor(db,3);await expect(approve(db)).rejects.toThrow('governed accepted invitation');
  await db.exec("reset role;set test.uid='';set role authenticated;");await expect(approve(db)).rejects.toThrow('Authentication required');
  await db.exec('reset role;set role anon');await expect(finalize(db)).rejects.toThrow('permission');
 }finally{await db.close();}
},30000);
