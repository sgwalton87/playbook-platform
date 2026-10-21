// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
it('removes default and column-level invitation mutation grants without removing read/create', async () => {
 const db=new PGlite();
 try {
  await db.exec(`create role anon; create role authenticated; create table public.support_invitations(id int,status text); grant all on public.support_invitations to public,anon,authenticated; grant update(status) on public.support_invitations to authenticated;`);
  await db.exec(readFileSync('supabase/migrations/20261021021256_support_invitation_privilege_closure.sql','utf8'));
  const r=await db.query<{read:boolean;create:boolean;update:boolean;remove:boolean;column_update:boolean;anonymous:boolean}>(`select has_table_privilege('authenticated','public.support_invitations','SELECT') as read,has_table_privilege('authenticated','public.support_invitations','INSERT') as create,has_table_privilege('authenticated','public.support_invitations','UPDATE') as update,has_table_privilege('authenticated','public.support_invitations','DELETE') as remove,has_column_privilege('authenticated','public.support_invitations','status','UPDATE') as column_update,has_table_privilege('anon','public.support_invitations','SELECT') as anonymous`);
  expect(r.rows[0]).toEqual({read:true,create:true,update:false,remove:false,column_update:false,anonymous:false});
 } finally {await db.close();}
},30000);
