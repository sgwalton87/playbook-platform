\set ON_ERROR_STOP on
begin;
select false as assertion_passed \gset
\if :assertion_passed
\else
  do $$ begin raise exception 'CERTIFICATION_FAILURE_CANARY'; end $$;
\endif
rollback;
