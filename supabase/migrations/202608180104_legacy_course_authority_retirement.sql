-- Conditionally promote rich historical curriculum, then retire pre-canonical authority.
-- Fresh installs have no legacy tables and therefore skip this promotion safely.

do $$
begin
  if to_regclass('public.courses') is not null and to_regclass('public.course_modules') is not null then
    execute $sql$
      insert into public.learning_courses(
        slug,title,description,pillar,image_url,status,xp_per_module,coins_per_module,
        course_xp_bonus,course_coin_bonus,certificate_name,sort_order
      )
      select c.slug,c.title,c.description,coalesce(nullif(c.pillar,''),'Leadership'),
        coalesce(c.image_url,c.cover_url),'published',
        greatest(coalesce(c.xp_reward,750)/greatest(coalesce(c.lesson_count,15),1),0),
        greatest(coalesce(c.coin_reward,300)/greatest(coalesce(c.lesson_count,15),1),0),
        greatest(coalesce(c.xp_reward,750),0),greatest(coalesce(c.coin_reward,300),0),
        c.title || ' Certificate',15
      from public.courses c where c.slug='15-week-leadership-program'
      on conflict(slug) do update set
        title=excluded.title,description=excluded.description,pillar=excluded.pillar,
        image_url=excluded.image_url,status='published',xp_per_module=excluded.xp_per_module,
        coins_per_module=excluded.coins_per_module,course_xp_bonus=excluded.course_xp_bonus,
        course_coin_bonus=excluded.course_coin_bonus,certificate_name=excluded.certificate_name,
        sort_order=excluded.sort_order,updated_at=now()
    $sql$;

    execute $sql$
      insert into public.learning_courses(
        slug,title,description,pillar,image_url,status,xp_per_module,coins_per_module,
        course_xp_bonus,course_coin_bonus,certificate_name,sort_order
      )
      select c.slug,c.title,c.description,coalesce(nullif(c.pillar,''),'Civic'),
        coalesce(c.image_url,c.cover_url),'published',
        greatest(coalesce(c.xp_reward,500)/greatest(coalesce(c.lesson_count,10),1),0),
        greatest(coalesce(c.coin_reward,200)/greatest(coalesce(c.lesson_count,10),1),0),
        greatest(coalesce(c.xp_reward,500),0),greatest(coalesce(c.coin_reward,200),0),
        'Civic Engagement for Young Leaders Certificate',70
      from public.courses c where c.slug='civic-engagement-for-young-leaders'
      on conflict(slug) do update set
        title=excluded.title,description=excluded.description,pillar=excluded.pillar,
        image_url=excluded.image_url,status='published',xp_per_module=excluded.xp_per_module,
        coins_per_module=excluded.coins_per_module,course_xp_bonus=excluded.course_xp_bonus,
        course_coin_bonus=excluded.course_coin_bonus,certificate_name=excluded.certificate_name,
        sort_order=excluded.sort_order,updated_at=now()
    $sql$;

    execute $sql$
      insert into public.learning_modules(
        course_slug,module_key,position,title,duration_minutes,module_type,summary,content,
        completion_mode,required,learning_objectives,activity,knowledge_checkpoint,interactions
      )
      select m.course_slug,'module-' || lpad(m.module_order::text,2,'0'),m.module_order,m.title,
        greatest(coalesce(m.duration_mins,15),1),coalesce(nullif(m.module_type,''),'lesson'),
        left(regexp_replace(coalesce(m.content,m.title),'\s+',' ','g'),240),
        coalesce(m.content,m.title),'reflection',true,coalesce(m.learning_objectives,'[]'::jsonb),m.activity,
        case when m.knowledge_checkpoint is null then null else m.knowledge_checkpoint - 'correct_index' end,
        coalesce(m.interactions,'[]'::jsonb)
      from public.course_modules m
      where m.course_slug in ('15-week-leadership-program','civic-engagement-for-young-leaders')
      on conflict(course_slug,module_key) do update set
        position=excluded.position,title=excluded.title,duration_minutes=excluded.duration_minutes,
        module_type=excluded.module_type,summary=excluded.summary,content=excluded.content,
        completion_mode=excluded.completion_mode,required=true,
        learning_objectives=excluded.learning_objectives,activity=excluded.activity,
        knowledge_checkpoint=excluded.knowledge_checkpoint,interactions=excluded.interactions,
        updated_at=now()
    $sql$;

    execute $sql$
      insert into private.learning_module_checkpoint_answers(course_slug,module_key,correct_index,explanation)
      select m.course_slug,'module-' || lpad(m.module_order::text,2,'0'),
        (m.knowledge_checkpoint->>'correct_index')::integer,
        nullif(m.knowledge_checkpoint->>'explanation','')
      from public.course_modules m
      where m.course_slug in ('15-week-leadership-program','civic-engagement-for-young-leaders')
        and m.knowledge_checkpoint ? 'correct_index'
      on conflict(course_slug,module_key) do update set
        correct_index=excluded.correct_index,explanation=excluded.explanation
    $sql$;

    execute $sql$
      update public.course_modules
      set knowledge_checkpoint = knowledge_checkpoint - 'correct_index'
      where course_slug in ('15-week-leadership-program','civic-engagement-for-young-leaders')
        and knowledge_checkpoint ? 'correct_index'
    $sql$;
  end if;

  if to_regclass('public.course_modules') is not null then
    execute 'revoke insert,update,delete on table public.course_modules from anon,authenticated';
    execute $sql$comment on table public.course_modules is
      'Legacy pre-canonical module store retained for historical preservation only. Canonical learner authority is learning_modules.'$sql$;
  end if;

  if to_regclass('public.courses') is not null then
    execute $sql$
      update public.courses set is_available=false, updated_at=now()
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
