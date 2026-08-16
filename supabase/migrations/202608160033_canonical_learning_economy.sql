-- Canonical Learning + Reward Economy
-- Durable course catalog, module progress, credentials, badges, and store
-- redemption. User-facing clients do not receive direct reward-mint authority.

create table if not exists public.learning_courses (
  slug text primary key,
  title text not null,
  description text not null,
  pillar text not null,
  image_url text,
  status text not null default 'published' check (status in ('draft','published','coming_soon','archived')),
  xp_per_module integer not null default 50 check (xp_per_module >= 0),
  coins_per_module integer not null default 20 check (coins_per_module >= 0),
  course_xp_bonus integer not null default 250 check (course_xp_bonus >= 0),
  course_coin_bonus integer not null default 100 check (course_coin_bonus >= 0),
  certificate_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.learning_courses(slug) on delete cascade,
  module_key text not null,
  position integer not null check (position > 0),
  title text not null,
  duration_minutes integer not null default 15 check (duration_minutes > 0),
  module_type text not null default 'lesson',
  summary text not null,
  content text not null,
  completion_mode text not null default 'acknowledge' check (completion_mode in ('acknowledge','reflection')),
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_slug, module_key),
  unique(course_slug, position)
);

create table if not exists public.learning_module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_slug text not null references public.learning_courses(slug) on delete cascade,
  module_key text not null,
  reflection text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, course_slug, module_key),
  foreign key (course_slug, module_key) references public.learning_modules(course_slug, module_key) on delete cascade
);

create table if not exists public.learning_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_slug text not null references public.learning_courses(slug) on delete cascade,
  credential_name text not null,
  issued_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb,
  unique(user_id, course_slug)
);

create table if not exists public.achievement_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null,
  badge_name text not null,
  description text not null,
  source_type text not null,
  source_id text not null,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_key, source_id)
);

create table if not exists public.reward_store_items (
  id text primary key,
  name text not null,
  description text not null,
  coin_cost integer not null check (coin_cost >= 0),
  inventory integer check (inventory is null or inventory >= 0),
  fulfillment_type text not null default 'manual' check (fulfillment_type in ('manual','digital','experience')),
  status text not null default 'active' check (status in ('active','paused','archived')),
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_store_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null references public.reward_store_items(id),
  coin_cost integer not null check (coin_cost >= 0),
  status text not null default 'pending' check (status in ('pending','fulfilled','cancelled','refunded')),
  redeemed_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.learning_courses enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_module_progress enable row level security;
alter table public.learning_credentials enable row level security;
alter table public.achievement_badges enable row level security;
alter table public.reward_store_items enable row level security;
alter table public.reward_store_redemptions enable row level security;

grant select on public.learning_courses, public.learning_modules, public.reward_store_items to authenticated;
grant select on public.learning_module_progress, public.learning_credentials, public.achievement_badges, public.reward_store_redemptions to authenticated;

drop policy if exists "Authenticated can view published learning courses" on public.learning_courses;
create policy "Authenticated can view published learning courses" on public.learning_courses for select to authenticated
using (status in ('published','coming_soon'));

drop policy if exists "Authenticated can view published learning modules" on public.learning_modules;
create policy "Authenticated can view published learning modules" on public.learning_modules for select to authenticated
using (exists (select 1 from public.learning_courses c where c.slug = course_slug and c.status in ('published','coming_soon')));

drop policy if exists "Users view own learning progress" on public.learning_module_progress;
create policy "Users view own learning progress" on public.learning_module_progress for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users view own learning credentials" on public.learning_credentials;
create policy "Users view own learning credentials" on public.learning_credentials for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users view own achievement badges" on public.achievement_badges;
create policy "Users view own achievement badges" on public.achievement_badges for select to authenticated using (user_id = auth.uid());

drop policy if exists "Authenticated can view active reward items" on public.reward_store_items;
create policy "Authenticated can view active reward items" on public.reward_store_items for select to authenticated using (status = 'active');

drop policy if exists "Users view own redemptions" on public.reward_store_redemptions;
create policy "Users view own redemptions" on public.reward_store_redemptions for select to authenticated using (user_id = auth.uid());

-- Seed canonical curriculum. These are durable records rather than React constants.
insert into public.learning_courses (slug,title,description,pillar,image_url,status,xp_per_module,coins_per_module,certificate_name,sort_order) values
('college-application-playbook','College Application Playbook','Build your college list, prepare applications, connect financial-aid milestones, and submit with confidence.','College','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80','published',50,20,'College Application Playbook Certificate',10),
('captains-mindset','Captain''s Mindset','Lead by example on and off the court with practical captaincy frameworks.','Leadership','https://images.unsplash.com/photo-1546519638405-a4c8b5bd3c5e?w=1200&q=80','published',50,20,'Captain''s Mindset Certificate',20),
('money-in-the-game','Money in the Game','Budgeting, saving, credit, taxes, investing, and NIL fundamentals for young athletes.','Finance','https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80','published',50,20,'Money in the Game Certificate',30),
('mind-of-an-athlete','Mind of an Athlete','Build resilience, process pressure, and strengthen identity beyond sport.','SEL','https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80','published',50,20,'Mind of an Athlete Certificate',40),
('social-emotional-foundations','Social-Emotional Foundations','Build emotional intelligence, self-awareness, communication, and resilience.','SEL',null,'coming_soon',50,20,'Social-Emotional Foundations Certificate',50),
('nil-readiness-for-athletes','NIL Readiness for Athletes','Learn personal branding, NIL opportunity evaluation, contracts, taxes, and compliance.','NIL',null,'coming_soon',50,20,'NIL Readiness for Athletes Certificate',60),
('civic-engagement-for-young-leaders','Civic Engagement for Young Leaders','Develop advocacy skills and learn how to create durable community change.','Civic',null,'coming_soon',50,20,'Civic Engagement for Young Leaders Certificate',70)
on conflict (slug) do update set title=excluded.title,description=excluded.description,pillar=excluded.pillar,image_url=excluded.image_url,status=excluded.status,xp_per_module=excluded.xp_per_module,coins_per_module=excluded.coins_per_module,certificate_name=excluded.certificate_name,sort_order=excluded.sort_order,updated_at=now();

insert into public.learning_modules (course_slug,module_key,position,title,duration_minutes,module_type,summary,content,completion_mode) values
('college-application-playbook','college-list',1,'Build Your College List',15,'planning','Identify reach, match, and likely schools that fit your goals.','Start with academic fit, affordability, location, campus culture, intended major, and opportunity. Build a balanced list rather than chasing rankings alone.','reflection'),
('college-application-playbook','accounts',2,'Create Your Application Accounts',20,'action','Create and secure the accounts used for applications.','Create your application portals, use a password manager, record deadlines, and make sure the email address attached to each account is one you check consistently.','acknowledge'),
('college-application-playbook','financial-aid',3,'FAFSA and Financial Aid',18,'milestone','Prepare the information needed for financial aid.','Identify the FAFSA contributors in your household, gather tax and identity documents, and record the date you expect to submit. Verify current deadlines directly with official sources.','reflection'),
('college-application-playbook','college-savings',4,'College Savings and CalKIDS',14,'milestone','Connect college-savings resources to your plan.','Review any existing college savings resources available to you and record what still needs to be claimed, connected, or verified.','reflection'),
('college-application-playbook','personal-statement',5,'Personal Statement Prep',22,'writing','Build a personal statement from evidence and reflection.','Choose a story that reveals how you think, grow, contribute, or persist. Draft around specific moments rather than generic claims.','reflection'),
('college-application-playbook','submit-track',6,'Submit and Track Applications',20,'project','Create your final application tracking routine.','For every application, track deadline, required documents, recommendation status, financial-aid steps, submission confirmation, and decision outcome.','reflection'),
('captains-mindset','captain',1,'What Makes a Captain?',12,'lesson','Separate title from leadership behavior.','A captain models standards before enforcing them. Identify the behaviors your teammates should be able to expect from you consistently.','reflection'),
('captains-mindset','accountability',2,'Accountability Starts With You',15,'lesson','Use self-accountability before team accountability.','Create a personal standard for preparation, communication, recovery after mistakes, and follow-through.','reflection'),
('captains-mindset','trust',3,'Building Trust With Your Team',18,'activity','Build trust intentionally.','Trust grows from repeated evidence: honesty, reliability, competence, repair after mistakes, and respect. Choose one trust behavior to practice this week.','reflection'),
('captains-mindset','adversity',4,'Leading Through Adversity',14,'reflection','Lead when the plan breaks.','Describe how you want to respond when your team is losing, when you are benched, or when conflict appears. Focus on controllable leadership behaviors.','reflection'),
('captains-mindset','communication',5,'Communication On and Off the Court',16,'lesson','Match communication to the moment.','Practice clear, specific, respectful communication. Separate correction from humiliation and urgency from panic.','reflection'),
('captains-mindset','leadership-playbook',6,'Your Leadership Playbook',20,'project','Turn the course into a personal leadership plan.','Write the standards, communication habits, accountability practices, and team contribution you will carry forward.','reflection'),
('money-in-the-game','money-101',1,'Money 101 for Athletes',10,'lesson','Understand cash flow before lifestyle.','Know what comes in, what must go out, what you owe in taxes, and what you are building for the future before increasing spending.','acknowledge'),
('money-in-the-game','budget',2,'Build Your First Budget',18,'activity','Create a budget based on your real numbers.','List monthly income, required expenses, flexible spending, saving, giving, and investing. Your budget should tell your money where to go before it disappears.','reflection'),
('money-in-the-game','saving-investing',3,'Saving vs Investing',15,'lesson','Use the right tool for the right time horizon.','Emergency and near-term money needs liquidity. Long-term wealth can take more market risk. Define one savings goal and one long-term investing goal.','reflection'),
('money-in-the-game','nil-basics',4,'NIL Basics for Under 18',20,'lesson','Understand NIL responsibilities before signing.','NIL income can create tax, contract, eligibility, guardian, school, and disclosure obligations. Never treat a social-media offer as risk-free money.','acknowledge'),
('money-in-the-game','taxes',5,'Taxes — Athletes Pay Them Too',14,'lesson','Prepare for taxes before spending gross income.','Set aside a percentage of self-employment or NIL income, keep records, and involve a qualified tax professional when needed.','acknowledge'),
('money-in-the-game','credit',6,'Credit Scores Explained',12,'lesson','Build credit without confusing credit with income.','Payment history, utilization, account age, credit mix, and new inquiries can affect credit. Never borrow simply to create a score.','acknowledge'),
('money-in-the-game','traps',7,'Avoiding Financial Traps',16,'activity','Recognize high-cost money mistakes.','Watch for predatory lending, lifestyle inflation, unnecessary fees, pressure purchases, bad contracts, and anyone demanding secrecy around money.','reflection'),
('money-in-the-game','financial-plan',8,'Your Financial Game Plan',22,'project','Turn the course into a personal financial plan.','Write your monthly budget, emergency-fund target, tax routine, credit rules, savings goals, investing questions, and people you will consult before major decisions.','reflection'),
('mind-of-an-athlete','emotions',1,'Understanding Your Emotions',12,'reflection','Name emotions without letting them drive every action.','Notice the emotion, name it, locate what triggered it, and choose the response that serves your goals rather than reacting automatically.','reflection'),
('mind-of-an-athlete','pressure',2,'Pressure and Performance',15,'activity','Create a repeatable pressure routine.','Build a short reset routine using breathing, cue words, body position, and attention to the next controllable action.','reflection'),
('mind-of-an-athlete','resilience',3,'Building Resilience',14,'lesson','Recover with evidence instead of slogans.','Resilience includes recovery, support, honest evaluation, rest, learning, and returning with a new plan.','reflection'),
('mind-of-an-athlete','identity',4,'Identity Beyond the Sport',18,'reflection','Strengthen identity beyond performance.','List the roles, values, relationships, interests, and contributions that still matter when your sport is not going well.','reflection'),
('mind-of-an-athlete','mental-plan',5,'Your Mental Performance Plan',20,'project','Build your personal mental-performance toolkit.','Document your pressure reset, recovery routine, support people, warning signs, identity anchors, and next action when you feel stuck.','reflection')
on conflict (course_slug,module_key) do update set position=excluded.position,title=excluded.title,duration_minutes=excluded.duration_minutes,module_type=excluded.module_type,summary=excluded.summary,content=excluded.content,completion_mode=excluded.completion_mode,updated_at=now();

insert into public.reward_store_items (id,name,description,coin_cost,inventory,fulfillment_type,status,sort_order) values
('profile-spotlight','Profile Spotlight','Feature your public Playbook profile in a rotating community spotlight after moderation review.',250,null,'digital','active',10),
('mentor-office-hour','Mentor Office Hour','Redeem for a request to schedule a 30-minute governed mentor office hour when capacity is available.',500,25,'experience','active',20),
('playbook-merch-credit','Playbook Merch Credit','A $10 merchandise credit fulfilled manually after eligibility and inventory confirmation.',750,100,'manual','active',30)
on conflict (id) do update set name=excluded.name,description=excluded.description,coin_cost=excluded.coin_cost,inventory=excluded.inventory,fulfillment_type=excluded.fulfillment_type,status=excluded.status,sort_order=excluded.sort_order,updated_at=now();

create or replace function private.record_learning_reward(
  learner_id uuid,
  reward_event text,
  reward_source text,
  reward_coins integer,
  reward_xp integer,
  reward_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext(learner_id::text || ':' || reward_event || ':' || reward_source));
  if exists (
    select 1 from public.coin_ledger l
    where l.scholar_id = learner_id and l.event_type = reward_event and l.source_id = reward_source
  ) then
    return false;
  end if;

  insert into public.coin_ledger (scholar_id,event_type,source_id,coins,xp,reason)
  values (learner_id,reward_event,reward_source,reward_coins,reward_xp,reward_reason);

  insert into public.reward_events (scholar_id,event_type,source_id,payload,processed)
  values (learner_id,reward_event,reward_source,jsonb_build_object('coins',reward_coins,'xp',reward_xp,'reason',reward_reason),true);

  update public.profiles
  set coin_balance = coalesce(coin_balance,0) + reward_coins,
      xp = coalesce(xp,0) + reward_xp,
      updated_at = now()
  where id = learner_id;

  return true;
end;
$$;

create or replace function public.complete_learning_module(
  requested_course_slug text,
  requested_module_key text,
  reflection_text text default null
)
returns table (
  module_completed boolean,
  course_completed boolean,
  coins_awarded integer,
  xp_awarded integer,
  credential_id uuid,
  badge_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner_id uuid := auth.uid();
  course_row public.learning_courses%rowtype;
  module_row public.learning_modules%rowtype;
  module_inserted boolean := false;
  course_now_complete boolean := false;
  module_rewarded boolean := false;
  course_rewarded boolean := false;
  credential uuid;
  badge uuid;
  total_required integer;
  total_done integer;
begin
  if learner_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;

  select * into course_row from public.learning_courses c
  where c.slug = requested_course_slug and c.status = 'published';
  if not found then raise exception 'Published course not found.' using errcode='P0002'; end if;

  select * into module_row from public.learning_modules m
  where m.course_slug = requested_course_slug and m.module_key = requested_module_key and m.required = true;
  if not found then raise exception 'Required module not found.' using errcode='P0002'; end if;

  if module_row.completion_mode = 'reflection' and length(trim(coalesce(reflection_text,''))) < 20 then
    raise exception 'A meaningful reflection of at least 20 characters is required.' using errcode='22023';
  end if;

  insert into public.learning_module_progress (user_id,course_slug,module_key,reflection)
  values (learner_id,requested_course_slug,requested_module_key,nullif(trim(coalesce(reflection_text,'')),''))
  on conflict (user_id,course_slug,module_key) do nothing;
  get diagnostics module_inserted = row_count;

  if module_inserted then
    module_rewarded := private.record_learning_reward(
      learner_id,'module.completed',requested_course_slug || ':' || requested_module_key,
      course_row.coins_per_module,course_row.xp_per_module,'Completed ' || module_row.title
    );
  end if;

  select count(*) into total_required from public.learning_modules m where m.course_slug=requested_course_slug and m.required=true;
  select count(*) into total_done from public.learning_module_progress p where p.user_id=learner_id and p.course_slug=requested_course_slug;
  course_now_complete := total_required > 0 and total_done >= total_required;

  if course_now_complete then
    insert into public.learning_credentials (user_id,course_slug,credential_name,evidence)
    values (learner_id,requested_course_slug,course_row.certificate_name,jsonb_build_object('completed_modules',total_done,'required_modules',total_required))
    on conflict (user_id,course_slug) do update set evidence=excluded.evidence
    returning id into credential;

    insert into public.achievement_badges (user_id,badge_key,badge_name,description,source_type,source_id)
    values (learner_id,'course-complete',course_row.title || ' Graduate','Completed all required modules in ' || course_row.title || '.','course',requested_course_slug)
    on conflict (user_id,badge_key,source_id) do update set description=excluded.description
    returning id into badge;

    course_rewarded := private.record_learning_reward(
      learner_id,'course.completed',requested_course_slug,
      course_row.course_coin_bonus,course_row.course_xp_bonus,'Completed ' || course_row.title
    );
  end if;

  return query select module_inserted,course_now_complete,
    (case when module_rewarded then course_row.coins_per_module else 0 end) + (case when course_rewarded then course_row.course_coin_bonus else 0 end),
    (case when module_rewarded then course_row.xp_per_module else 0 end) + (case when course_rewarded then course_row.course_xp_bonus else 0 end),
    credential,badge;
end;
$$;

create or replace function public.redeem_reward_store_item(requested_item_id text)
returns table (redemption_id uuid, remaining_coins integer, redemption_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner_id uuid := auth.uid();
  item public.reward_store_items%rowtype;
  current_coins integer;
  redemption uuid := gen_random_uuid();
begin
  if learner_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  select * into item from public.reward_store_items i where i.id=requested_item_id and i.status='active' for update;
  if not found then raise exception 'Reward item is unavailable.' using errcode='P0002'; end if;
  if item.inventory is not null and item.inventory <= 0 then raise exception 'Reward item is out of stock.' using errcode='P0001'; end if;

  select coalesce(sum(l.coins),0) into current_coins from public.coin_ledger l where l.scholar_id=learner_id;
  if current_coins < item.coin_cost then raise exception 'Insufficient Playbook Coins.' using errcode='P0001'; end if;

  insert into public.reward_store_redemptions (id,user_id,item_id,coin_cost,status)
  values (redemption,learner_id,item.id,item.coin_cost,'pending');
  insert into public.coin_ledger (scholar_id,event_type,source_id,coins,xp,reason)
  values (learner_id,'store.redemption',redemption::text,-item.coin_cost,25,'Redeemed ' || item.name);
  insert into public.reward_events (scholar_id,event_type,source_id,payload,processed)
  values (learner_id,'store.redemption',redemption::text,jsonb_build_object('item_id',item.id,'coins',-item.coin_cost,'xp',25),true);
  update public.profiles set coin_balance=coalesce(coin_balance,0)-item.coin_cost,xp=coalesce(xp,0)+25,updated_at=now() where id=learner_id;
  if item.inventory is not null then update public.reward_store_items set inventory=inventory-1,updated_at=now() where id=item.id; end if;

  return query select redemption,current_coins-item.coin_cost,'pending'::text;
end;
$$;

revoke all on function private.record_learning_reward(uuid,text,text,integer,integer,text) from public,anon,authenticated;
revoke all on function public.complete_learning_module(text,text,text) from public,anon,authenticated;
revoke all on function public.redeem_reward_store_item(text) from public,anon,authenticated;
grant execute on function public.complete_learning_module(text,text,text) to authenticated;
grant execute on function public.redeem_reward_store_item(text) to authenticated;
