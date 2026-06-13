-- Enable Row Level Security
create table public.reminders (
  id                text primary key,
  user_id           uuid references auth.users(id) on delete cascade not null,
  title             text not null,
  category          text not null,
  due_date          timestamptz not null,
  amount            numeric,
  currency          text,
  contact           jsonb,
  lead_times        jsonb not null default '[]',
  notes             text,
  is_archived       boolean not null default false,
  calendar_event_id text,
  notification_ids  jsonb not null default '[]',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "Users can only access their own reminders"
  on public.reminders for all
  using (auth.uid() = user_id);
