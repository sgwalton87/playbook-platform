// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const migration = readFileSync("supabase/migrations/20261028184949_brand_verification_admin_archive.sql", "utf8");
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
let db: PGlite;
async function actor(n: number) { await db.exec(`reset role; set test.uid='${id(n)}'; set role authenticated;`); }
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create schema auth; create schema private; create schema storage;
    grant usage on schema auth,private,storage to authenticated;
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
    create table public.profiles(id uuid primary key,role text,profile_mode text);
    alter table public.profiles enable row level security;
    grant select on public.profiles to authenticated;
    create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
    create function private.current_user_is_verification_reviewer() returns boolean language sql security definer set search_path='' as $$select exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin'))$$;
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,created_at timestamptz default now());
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to authenticated;
    create policy broad_legacy_read on storage.objects for select to authenticated using(true);
    create policy broad_legacy_mutation on storage.objects for all to authenticated using(true) with check(true);
    create table public.brand_partner_verification_requests(id uuid primary key,brand_user_id uuid,organization_name text,status text,submitted_at timestamptz);
  `);
  await db.exec(migration);
  await db.exec(`create trigger brand_evidence_before_approval before insert or update of status on public.brand_partner_verification_requests for each row execute function private.require_brand_partner_evidence_before_approval();
    insert into public.profiles values('${id(1)}','brand-partner','brand-partner'),('${id(2)}','admin',null),('${id(3)}','scholar','admin');
    insert into storage.objects(id,bucket_id,name,created_at) values('${id(10)}','brand-verification-evidence','${id(1)}/business-card-${id(11)}.jpg','2020-01-01'),('${id(20)}','photos','photo.jpg',now());
    insert into public.brand_partner_verification_requests values('${id(30)}','${id(1)}','Example Brand','pending','2020-01-01');`);
}, 30000);
afterAll(async () => { await db.close(); });

describe.sequential("retained admin-only Brand Partner document folder", () => {
  it("gives the uploader only receipts and denies file reads even under broad legacy policies", async () => {
    await actor(1);
    expect((await db.query("select * from public.get_own_brand_verification_documents()" )).rows).toEqual([{ name: `business-card-${id(11)}.jpg`, archived: false }]);
    expect((await db.query("select id from storage.objects where bucket_id='brand-verification-evidence'")).rows).toEqual([]);
    await expect(db.query("select * from public.get_brand_verification_documents()" )).rejects.toThrow("reviewer authority");
    await expect(db.query("select public.open_brand_verification_document($1)", [id(10)])).rejects.toThrow("reviewer authority");
    await expect(db.query("select public.archive_brand_verification_document($1,'not authorized')", [id(10)])).rejects.toThrow("reviewer authority");
  });
  it("does not trust a user-selected admin profile mode", async () => {
    await actor(3);
    await expect(db.query("select * from public.get_brand_verification_documents()" )).rejects.toThrow("reviewer authority");
  });
  it("retains old documents and keeps them accessible after review is closed", async () => {
    await db.exec(`reset role; update public.brand_partner_verification_requests set status='approved';`);
    await actor(2);
    const rows = await db.query<{ verification_status: string }>("select * from public.get_brand_verification_documents()");
    expect(rows.rows[0].verification_status).toBe("approved");
    expect((await db.query("select public.open_brand_verification_document($1) as path", [id(10)])).rows).toEqual([{ path: `${id(1)}/business-card-${id(11)}.jpg` }]);
    await db.query("delete from storage.objects where id=$1", [id(10)]);
    expect((await db.query("select id from storage.objects where id=$1", [id(10)])).rows).toHaveLength(1);
  });
  it("archives with audit history and preserves read access and bytes", async () => {
    await actor(2);
    await expect(db.query("select public.archive_brand_verification_document($1,'  ')", [id(10)])).rejects.toThrow("reason");
    await db.query("select public.archive_brand_verification_document($1,'Review complete; retain evidence')", [id(10)]);
    await db.query("select public.archive_brand_verification_document($1,'Duplicate archive')", [id(10)]);
    expect((await db.query("select * from public.get_brand_verification_documents()" )).rows).toHaveLength(0);
    expect((await db.query("select * from public.get_brand_verification_documents(null,true,0)" )).rows).toHaveLength(1);
    await db.query("select public.open_brand_verification_document($1)", [id(10)]);
    expect((await db.query("select * from public.brand_verification_document_events where action='archived'")).rows).toHaveLength(1);
    await db.exec("reset role");
    await expect(db.query("delete from storage.objects where id=$1", [id(10)])).rejects.toThrow("archive instead");
    await expect(db.query("update storage.objects set name='moved.jpg' where id=$1", [id(10)])).rejects.toThrow("archive instead");
    await db.query("delete from storage.objects where id=$1", [id(20)]);
    expect((await db.query("select id from storage.objects where id=$1", [id(20)])).rows).toHaveLength(0);
  });
  it("excludes archived evidence from new approvals and rechecks revoked admin access", async () => {
    await db.exec("reset role; update public.brand_partner_verification_requests set status='pending';");
    await expect(db.exec("update public.brand_partner_verification_requests set status='approved';")).rejects.toThrow("Active company letterhead");
    await actor(1);
    expect((await db.query("select * from public.get_own_brand_verification_documents()" )).rows[0]).toHaveProperty("archived", true);
    await db.exec(`reset role; update public.profiles set role='scholar' where id='${id(2)}';`);
    await actor(2);
    await expect(db.query("select public.open_brand_verification_document($1)", [id(10)])).rejects.toThrow("reviewer authority");
  });
});
