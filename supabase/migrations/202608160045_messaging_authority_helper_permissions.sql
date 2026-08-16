-- RLS expressions execute as the calling authenticated role and therefore need
-- EXECUTE on their referenced helper. The helper remains in the non-exposed
-- private schema and is not published as a public RPC.
revoke all on function private.pbos_user_has_active_conversation_access(uuid, uuid) from public, anon;
grant execute on function private.pbos_user_has_active_conversation_access(uuid, uuid) to authenticated;
