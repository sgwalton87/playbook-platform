-- Converge the remaining authored static course prototypes onto canonical Learning.

insert into public.learning_courses(
  slug,title,description,pillar,status,xp_per_module,coins_per_module,
  course_xp_bonus,course_coin_bonus,certificate_name,sort_order
) values
(
  'community-safety-no-bullying',
  'Community Safety: No Bullying, Harassment, or Harm',
  'A required Playbook course that teaches scholars and community members how to prevent bullying, cyberbullying, harassment, retaliation, and harmful conduct.',
  'Community','published',25,10,100,40,'Community Safety Champion Certificate',5
),
(
  'athletes-abroad-global-hub',
  'Athletes Abroad Hub: The Global Home Court',
  'A Playbook course for American athletes playing overseas or preparing to go abroad. Learn how to build your global network, protect your career, manage life overseas, and plan for life after sport.',
  'Athlete Abroad','published',30,12,150,60,'Global Home Court Builder Certificate',25
)
on conflict(slug) do update set
  title=excluded.title,description=excluded.description,pillar=excluded.pillar,status='published',
  xp_per_module=excluded.xp_per_module,coins_per_module=excluded.coins_per_module,
  course_xp_bonus=excluded.course_xp_bonus,course_coin_bonus=excluded.course_coin_bonus,
  certificate_name=excluded.certificate_name,sort_order=excluded.sort_order,updated_at=now();

insert into public.learning_modules(
  course_slug,module_key,position,title,duration_minutes,module_type,summary,content,
  completion_mode,required,learning_objectives,activity,knowledge_checkpoint,interactions
) values
('community-safety-no-bullying','module-01',1,'What safety means in The Playbook',5,'lesson','Define safety and belonging in Playbook.','The Playbook is built for opportunity, learning, mentorship, and belonging. Safety means every member can participate without being targeted, humiliated, threatened, excluded, or harassed.','reflection',true,'[]',null,null,'[]'),
('community-safety-no-bullying','module-02',2,'Bullying and cyberbullying',5,'lesson','Recognize bullying and cyberbullying.','Bullying can happen through repeated insults, rumors, threats, embarrassing posts, screenshots, exclusion, group targeting, or unwanted contact. Cyberbullying includes harmful conduct through messages, comments, posts, group chats, images, or digital tools.','reflection',true,'[]',null,null,'[]'),
('community-safety-no-bullying','module-03',3,'Harassment, discrimination, and retaliation',5,'lesson','Recognize harassment, discrimination, and retaliation.','Harassment includes conduct based on identity, background, race, ethnicity, gender, sexuality, disability, religion, language, income, housing status, or other protected or personal characteristics. Retaliation means punishing or targeting someone because they reported harm or asked for help.','reflection',true,'[]',null,null,'[]'),
('community-safety-no-bullying','module-04',4,'How to be an upstander',5,'lesson','Practice safe upstander behavior.','An upstander does not join harmful behavior. They interrupt harm safely, support the person targeted, document concerns when appropriate, and report serious issues through trusted channels.','reflection',true,'[]',null,null,'[]'),
('community-safety-no-bullying','module-05',5,'The Playbook commitment',5,'lesson','Commit to Playbook community safety.','Every member agrees to participate without bullying, harassment, threats, cyberbullying, discrimination, or retaliation. Violations may lead to content removal, restrictions, suspension, or account removal.','reflection',true,'[]',null,null,'[]'),
('community-safety-no-bullying','checkpoint-01',6,'Community Safety Check 1',3,'assessment','Recognize harmful conduct.','Use the lesson evidence to choose the safest answer.','acknowledge',true,'[]',null,'{"type":"multiple_choice","prompt":"Which behavior violates The Playbook Community Safety Agreement?","options":["Respectfully disagreeing","Asking for help","Posting embarrassing information about someone without permission","Inviting a mentor"]}'::jsonb,'[]'),
('community-safety-no-bullying','checkpoint-02',7,'Community Safety Check 2',3,'assessment','Respond appropriately to a bullying report.','Use the lesson evidence to choose the safest answer.','acknowledge',true,'[]',null,'{"type":"multiple_choice","prompt":"What should you do if someone reports bullying?","options":["Retaliate against them","Ignore them","Take the concern seriously and use appropriate reporting/support tools","Share their report publicly"]}'::jsonb,'[]'),
('community-safety-no-bullying','checkpoint-03',8,'Community Safety Check 3',3,'assessment','Identify upstander behavior.','Use the lesson evidence to choose the safest answer.','acknowledge',true,'[]',null,'{"type":"multiple_choice","prompt":"What is an upstander?","options":["Someone who joins the bullying","Someone who safely interrupts harm or gets help","Someone who spreads rumors","Someone who ignores everything"]}'::jsonb,'[]'),
('athletes-abroad-global-hub','module-01',1,'Go Abroad',5,'lesson','Build the athlete passport for global opportunities.','Prepare your athlete passport: film, resume, stats, references, transcripts, contract history, target countries, team research, and verified contacts.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-02',2,'Living Abroad',5,'lesson','Prepare a sustainable life system overseas.','Build your life system overseas: housing, transportation, healthcare, language, culture, food, safety, money movement, local laws, and emergency contacts.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-03',3,'Life After Sport',5,'lesson','Plan beyond the athletic career.','Your athletic career is one chapter. Begin planning your next chapter through financial literacy, business building, licensing, graduate school, coaching, entrepreneurship, media, and global relationships.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-04',4,'My Global Hub',5,'activity','Identify the information needed to stay grounded overseas.','Track your current team, country, season status, local time, U.S. home time, next game, documents, contacts, and next actions in one dashboard.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-05',5,'My Circle',5,'lesson','Build a trusted support circle before departure.','Your circle includes teammates, American athletes nearby, alumni, mentors, agents, advisors, coaches, family, and trusted professionals. The goal is to avoid isolation while abroad.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-06',6,'Global Locker Room',5,'lesson','Use community to reduce isolation overseas.','The Global Locker Room is the community space: country channels, sport channels, women’s network, veteran athlete groups, new arrival groups, and Summit cohorts.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-07',7,'My Business',5,'lesson','Prepare for the business side of playing abroad.','Athletes abroad need to understand contracts, taxes, agent fees, housing terms, endorsements, NIL, brand partnerships, and business development.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-08',8,'My Life Abroad',5,'lesson','Prepare for practical and emotional life overseas.','Success overseas depends on more than talent. Learn how to navigate healthcare, safety, culture, loneliness, homesickness, transportation, food, weather, visas, and communication.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','module-09',9,'Athletes Abroad Summit',5,'lesson','Extend in-person relationships into a year-round network.','The Summit creates the in-person relationships. The Playbook-powered Athletes Abroad Hub keeps those relationships active all year through meetings, replays, groups, resources, and network connections.','reflection',true,'[]',null,null,'[]'),
('athletes-abroad-global-hub','checkpoint-01',10,'Global Home Court Check 1',3,'assessment','Identify the three-stage Athletes Abroad model.','Use the course evidence to choose the best answer.','acknowledge',true,'[]',null,'{"type":"multiple_choice","prompt":"What are the three main stages of the Athletes Abroad Hub model?","options":["Recruit, Sign, Retire","Go Abroad, Living Abroad, Life After Sport","Train, Play, Win","Apply, Travel, Return"]}'::jsonb,'[]'),
('athletes-abroad-global-hub','checkpoint-02',11,'Global Home Court Check 2',3,'assessment','Explain the role of the Global Locker Room.','Use the course evidence to choose the best answer.','acknowledge',true,'[]',null,'{"type":"multiple_choice","prompt":"Why is the Global Locker Room important?","options":["It replaces the team coach","It helps athletes build community, country channels, support groups, and year-round connection","It only stores game film","It is only for fans"]}'::jsonb,'[]'),
('athletes-abroad-global-hub','checkpoint-03',12,'Global Home Court Check 3',3,'assessment','Identify business information athletes should track.','Use the course evidence to choose the best answer.','acknowledge',true,'[]',null,'{"type":"multiple_choice","prompt":"What should athletes track in My Business?","options":["Only workouts","Contracts, taxes, agent fees, brand deals, housing terms, and business opportunities","Only social media followers","Only game scores"]}'::jsonb,'[]')
on conflict(course_slug,module_key) do update set
  position=excluded.position,title=excluded.title,duration_minutes=excluded.duration_minutes,
  module_type=excluded.module_type,summary=excluded.summary,content=excluded.content,
  completion_mode=excluded.completion_mode,required=true,learning_objectives=excluded.learning_objectives,
  activity=excluded.activity,knowledge_checkpoint=excluded.knowledge_checkpoint,
  interactions=excluded.interactions,updated_at=now();

insert into private.learning_module_checkpoint_answers(course_slug,module_key,correct_index,explanation) values
('community-safety-no-bullying','checkpoint-01',2,'Posting embarrassing information about someone without permission is harmful conduct.'),
('community-safety-no-bullying','checkpoint-02',2,'Take reports seriously and use appropriate reporting and support tools.'),
('community-safety-no-bullying','checkpoint-03',1,'An upstander safely interrupts harm or gets help.'),
('athletes-abroad-global-hub','checkpoint-01',1,'The pathway is Go Abroad, Living Abroad, and Life After Sport.'),
('athletes-abroad-global-hub','checkpoint-02',1,'The Global Locker Room provides community, channels, support groups, and year-round connection.'),
('athletes-abroad-global-hub','checkpoint-03',1,'Athletes should track contracts, taxes, agent fees, brand deals, housing terms, and business opportunities.')
on conflict(course_slug,module_key) do update set correct_index=excluded.correct_index,explanation=excluded.explanation;
