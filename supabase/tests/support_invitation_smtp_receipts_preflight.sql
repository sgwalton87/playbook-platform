-- Run against a disposable database with the invitation and SMTP receipt migrations applied.
begin;

do $$
declare
  client_role text;
begin
  foreach client_role in array array['anon', 'authenticated'] loop
    if has_table_privilege(client_role, 'public.support_invitation_smtp_receipts', 'SELECT,INSERT,UPDATE,DELETE') then
      raise exception 'Client role unexpectedly has receipt privileges: %', client_role;
    end if;
  end loop;
  if not exists (
    select from pg_class
    where oid = 'public.support_invitation_smtp_receipts'::regclass and relrowsecurity
  ) then
    raise exception 'SMTP receipts must have RLS enabled';
  end if;
  if has_table_privilege('service_role', 'public.support_invitation_smtp_receipts', 'UPDATE,DELETE,TRUNCATE') then
    raise exception 'SMTP receipts should be append-only for the server role';
  end if;
end $$;

insert into public.support_invitations
  (id, scholar_id, invitee_name, invitee_email, relationship, token, destination)
values ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000022',
  'Fixture', 'mentor@example.invalid', 'mentor', 'smtp-receipt-test', '/invitations/received');

set local role service_role;
insert into public.support_invitation_smtp_receipts (invitation_id, message_id)
values ('00000000-0000-4000-8000-000000000021', 'fixture@example.invalid');

do $$
begin
  if not exists (
    select from public.support_invitation_smtp_receipts
    where invitation_id = '00000000-0000-4000-8000-000000000021'
      and message_id = 'fixture@example.invalid' and accepted_at is not null
  ) then
    raise exception 'Server could not correlate the persisted receipt to the invitation';
  end if;

  begin
    insert into public.support_invitation_smtp_receipts (invitation_id, message_id)
    values ('00000000-0000-4000-8000-000000000021', 'duplicate@example.invalid');
    raise exception 'Duplicate receipt was allowed';
  exception when unique_violation then null;
  end;

  begin
    insert into public.support_invitation_smtp_receipts (invitation_id, message_id)
    values ('00000000-0000-4000-8000-000000000023', 'orphan@example.invalid');
    raise exception 'Orphan receipt was allowed';
  exception when foreign_key_violation then null;
  end;
end $$;

rollback;
