\set ON_ERROR_STOP on
begin;

select coalesce((select not public and file_size_limit=10485760 from storage.buckets where id='pbos-message-attachments'),false) as bucket_ok \gset
\if :bucket_ok
\else
  \echo 'attachment bucket privacy or size limit is incorrect'
  \quit 1
\endif

select count(*)=4 as metadata_policy_count
from pg_policies
where schemaname='public' and tablename='pbos_message_attachments'
  and roles='{authenticated}' \gset
\if :metadata_policy_count
\else
  \echo 'attachment metadata policies must be authenticated-only'
  \quit 1
\endif

select count(*)=3 as storage_policy_count
from pg_policies
where schemaname='storage' and tablename='objects'
  and policyname in ('Current participants upload message attachments','Current participants read message attachments','Uploaders delete staged message attachment objects')
  and roles='{authenticated}' \gset
\if :storage_policy_count
\else
  \echo 'attachment storage policies must be authenticated-only'
  \quit 1
\endif

select not has_table_privilege('anon','public.pbos_message_attachments','SELECT')
   and not has_table_privilege('anon','public.pbos_message_attachments','INSERT')
   and not has_table_privilege('anon','public.pbos_message_attachments','UPDATE')
   and not has_table_privilege('anon','public.pbos_message_attachments','DELETE') as anon_zero \gset
\if :anon_zero
\else
  \echo 'anonymous attachment grants must be zero'
  \quit 1
\endif

select has_table_privilege('authenticated','public.pbos_message_attachments','SELECT')
   and has_table_privilege('authenticated','public.pbos_message_attachments','INSERT')
   and has_table_privilege('authenticated','public.pbos_message_attachments','DELETE')
   and not has_table_privilege('authenticated','public.pbos_message_attachments','UPDATE') as auth_table_shape \gset
\if :auth_table_shape
\else
  \echo 'authenticated attachment table grants are incorrect'
  \quit 1
\endif

select count(*)=1 and min(column_name)='message_id' as auth_update_message_only
from information_schema.column_privileges
where table_schema='public' and table_name='pbos_message_attachments'
  and grantee='authenticated' and privilege_type='UPDATE' \gset
\if :auth_update_message_only
\else
  \echo 'authenticated attachment update must be message_id only'
  \quit 1
\endif

select not exists (
  select 1 from information_schema.column_privileges
  where table_schema='public' and table_name='pbos_message_attachments' and grantee='anon'
) as anon_columns_zero \gset
\if :anon_columns_zero
\else
  \echo 'anonymous attachment column grants must be zero'
  \quit 1
\endif

rollback;
