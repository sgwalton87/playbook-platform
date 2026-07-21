create table if not exists scholar_activity_events (
    id uuid primary key default gen_random_uuid(),
    scholar_id uuid not null references profiles(id) on delete cascade,
    actor_id uuid references profiles(id) on delete set null,

    event_type text not null,

    visibility text not null default 'public',

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);

create index if not exists idx_scholar_activity_events_scholar
on scholar_activity_events (scholar_id, created_at desc);

create index if not exists idx_scholar_activity_events_created
on scholar_activity_events (created_at desc);
