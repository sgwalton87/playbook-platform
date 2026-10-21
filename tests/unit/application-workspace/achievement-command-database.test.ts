// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('creates the complete achievement atomically, enforces ownership and rejects conflicting retries', async () => {
  const db = new PGlite();
  const owner = '00000000-0000-0000-0000-000000000001';
  const other = '00000000-0000-0000-0000-000000000002';
  const request = '00000000-0000-0000-0000-000000000003';
  const input = { title: 'Community service', category: 'service', evidenceUrl: 'https://example.org/proof', reflection: 'I learned to listen.' };
  const call = (id = request, profile = owner, payload: object = input) => db.query<{id: string}>(
    'select (public.create_achievement_with_evidence($1::uuid,$2::uuid,$3::jsonb)).id', [id, profile, JSON.stringify(payload)],
  );
  const counts = async () => {
    await db.exec('reset role');
    const result = await db.query<{n: number}>(`select count(*)::int as n from public.playbook_records
      union all select count(*)::int from public.achievements
      union all select count(*)::int from public.evidence_packs
      union all select count(*)::int from public.evidence
      union all select count(*)::int from public.reflections
      union all select count(*)::int from public.timeline_events
      union all select count(*)::int from private.achievement_command_receipts`);
    await db.exec('set role authenticated');
    return result.rows.map(row => row.n);
  };
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      grant usage on schema auth to anon,authenticated;
      create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
      create table public.profiles(id uuid primary key);
      insert into public.profiles values ('${owner}'),('${other}');`);
    // PGlite has built-in gen_random_uuid; the optional pgcrypto extension is unavailable.
    await db.exec(readFileSync('supabase/migrations/20260701_playbook_graph.sql', 'utf8').replace('create extension if not exists pgcrypto;', ''));
    await db.exec(readFileSync('supabase/migrations/20261021023624_achievement_atomic_command.sql', 'utf8'));
    await db.exec(`set test.uid='${owner}'; set role authenticated;`);
    await expect(call(request, other)).rejects.toThrow('owner');
    await expect(call(request, owner, {...input, title: ''})).rejects.toThrow('length');
    await expect(call(request, owner, {...input, evidenceUrl: 'javascript:alert(1)'})).rejects.toThrow('HTTP');
    await expect(call(request, owner, {...input, verified: true})).rejects.toThrow('Unsupported');
    await expect(call(request, owner, {...input, title: 5})).rejects.toThrow('strings');
    await expect(call(request, owner, {...input, category: 'invented'})).rejects.toThrow();
    expect(await counts()).toEqual([0,0,0,0,0,0,0]);

    // A failure at the final insert must roll back every earlier write, including first-record creation.
    await db.exec(`reset role; create function public.reject_test_timeline() returns trigger language plpgsql as $$
      begin raise exception 'injected timeline failure'; end; $$;
      create trigger reject_test_timeline before insert on public.timeline_events for each row execute function public.reject_test_timeline();
      set role authenticated;`);
    await expect(call()).rejects.toThrow('injected timeline failure');
    expect(await counts()).toEqual([0,0,0,0,0,0,0]);
    await db.exec('reset role; drop trigger reject_test_timeline on public.timeline_events; set role authenticated;');
    const first = await call();
    expect((await call()).rows[0].id).toBe(first.rows[0].id);
    expect(await counts()).toEqual([1,1,1,1,1,1,1]);
    await expect(call(request, owner, {...input, title: 'Different'})).rejects.toThrow('different content');
    expect(await counts()).toEqual([1,1,1,1,1,1,1]);
    await expect(db.query('select * from private.achievement_command_receipts')).rejects.toThrow();
    await db.exec(`reset role; set test.uid='${other}'; set role authenticated;`);
    await expect(call()).rejects.toThrow('owner');
    await db.exec("reset role; set test.uid=''; set role authenticated;");
    await expect(call()).rejects.toThrow('owner');
    await db.exec(`reset role; set test.uid='${owner}'; set role anon;`);
    await expect(call()).rejects.toThrow('permission');
    await db.exec('reset role');
    await db.query('update public.achievements set deleted_at=now() where id=$1', [first.rows[0].id]);
    await db.exec('set role authenticated');
    await expect(call()).rejects.toThrow('no longer available');
    await db.exec('reset role');
    await db.query('delete from public.achievements where id=$1', [first.rows[0].id]);
    await db.exec('set role authenticated');
    await expect(call()).rejects.toThrow('no longer available');
    // The command tombstone prevents resurrection after hard deletion.
    expect(await counts()).toEqual([1,0,0,0,0,1,1]);
    await db.exec(`reset role; insert into public.playbook_records(profile_id) values('${owner}'); set role authenticated;`);
    await expect(call('00000000-0000-0000-0000-000000000004')).rejects.toThrow('reconciliation');
  } finally { await db.close(); }
}, 30000);
