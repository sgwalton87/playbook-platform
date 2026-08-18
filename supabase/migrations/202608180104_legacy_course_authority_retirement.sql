-- Retire pre-canonical course authority only when historical tables exist.
-- Fresh installs have no legacy tables and therefore require no retirement work.

do $$
begin
  if to_regclass('public.course_modules') is not null then
    execute $sql$
      update public.course_modules
      set knowledge_checkpoint = knowledge_checkpoint - 'correct_index'
      where course_slug in ('15-week-leadership-program','civic-engagement-for-young-leaders')
        and knowledge_checkpoint ? 'correct_index'
    $sql$;
    execute 'revoke insert,update,delete on table public.course_modules from anon,authenticated';
    execute $sql$comment on table public.course_modules is
      'Legacy pre-canonical module store retained for historical preservation only. Canonical learner authority is learning_modules.'$sql$;
  end if;

  if to_regclass('public.courses') is not null then
    execute $sql$
      update public.courses
      set is_available=false, updated_at=now()
      where coalesce(is_available,true)=true
    $sql$;
    execute 'revoke insert,update,delete on table public.courses from anon,authenticated';
    execute $sql$comment on table public.courses is
      'Legacy pre-canonical course catalog retained for historical preservation only. Canonical learner authority is learning_courses.'$sql$;
  end if;

  if to_regclass('public.course_progress') is not null then
    execute 'revoke insert,update,delete on table public.course_progress from anon,authenticated';
    execute $sql$comment on table public.course_progress is
      'Legacy pre-canonical progress store retained for historical preservation only. Canonical learner authority is learning_module_progress.'$sql$;
  end if;

  if to_regclass('public.course_module_responses') is not null then
    execute 'revoke insert,update,delete on table public.course_module_responses from anon,authenticated';
    execute $sql$comment on table public.course_module_responses is
      'Legacy pre-canonical response store retained for historical preservation only. Canonical learner authority is learning_module_responses.'$sql$;
  end if;
end $$;
