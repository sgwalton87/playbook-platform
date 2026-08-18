-- Retire the prototype course authority after canonical Learning convergence.
-- Historical rows remain for preservation/reconciliation, but they are no longer
-- an active catalog or client mutation surface.

-- Correct checkpoint answers were migrated into private canonical authority in
-- the preceding convergence migration. Remove them from the historical public
-- JSON so an old Data API read cannot disclose assessment answers.
update public.course_modules
set knowledge_checkpoint = knowledge_checkpoint - 'correct_index'
where course_slug in ('15-week-leadership-program','civic-engagement-for-young-leaders')
  and knowledge_checkpoint ? 'correct_index';

-- Any legacy catalog row that now has a canonical Learning counterpart is not an
-- active course listing. Remaining zero-content prototype shells are also kept
-- non-available so the canonical catalog is the only learner discovery source.
update public.courses
set is_available=false, updated_at=now()
where coalesce(is_available,true)=true;

-- Learners must never write to historical course/progress/response tables after
-- convergence. Service/database roles retain maintenance access for preservation.
revoke insert,update,delete on table public.courses from anon,authenticated;
revoke insert,update,delete on table public.course_modules from anon,authenticated;
revoke insert,update,delete on table public.course_progress from anon,authenticated;
revoke insert,update,delete on table public.course_module_responses from anon,authenticated;

comment on table public.courses is
  'Legacy pre-canonical course catalog retained for historical preservation only. Canonical learner authority is learning_courses.';
comment on table public.course_modules is
  'Legacy pre-canonical module store retained for historical preservation only. Canonical learner authority is learning_modules.';
comment on table public.course_progress is
  'Legacy pre-canonical progress store retained for historical preservation only. Canonical learner authority is learning_module_progress.';
comment on table public.course_module_responses is
  'Legacy pre-canonical response store retained for historical preservation only. Canonical learner authority is learning_module_responses.';
