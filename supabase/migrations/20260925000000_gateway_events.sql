-- dave-lab shared database. App schema follows core.apps convention.
create schema if not exists app_hidden_url_gateway;

create table if not exists app_hidden_url_gateway.gateway_events (
  id text primary key,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  logo_path text not null default '/events/grok-bot/mark.svg',
  wordmark_path text not null default '/events/grok-bot/wordmark.png',
  destination_kind text not null default 'internal'
    check (destination_kind in ('internal', 'external')),
  destination_url text not null default '',
  internal_page text not null default 'grok-credits',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists app_hidden_url_gateway.gateway_event_emails (
  event_id text not null references app_hidden_url_gateway.gateway_events (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  primary key (event_id, email)
);

create table if not exists app_hidden_url_gateway.assets (
  path text primary key,
  content_type text not null,
  bytes bytea not null,
  created_at timestamptz not null default now()
);

create index if not exists gateway_events_active_idx
  on app_hidden_url_gateway.gateway_events (is_active, updated_at desc);

alter table app_hidden_url_gateway.gateway_events enable row level security;
alter table app_hidden_url_gateway.gateway_event_emails enable row level security;
alter table app_hidden_url_gateway.assets enable row level security;

revoke all on schema app_hidden_url_gateway from anon, authenticated;
revoke all on all tables in schema app_hidden_url_gateway from anon, authenticated;
