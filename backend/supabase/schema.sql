create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  overview text,
  first_action text,
  due text,
  note text,
  initial_script text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists manuscripts (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  script text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists chat_entries (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists checkins (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  slot text check (slot in ('morning','noon','night')),
  mood int,
  energy int,
  note text,
  created_at timestamptz default now()
);

create table if not exists blockers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  tag text,
  title text,
  note text,
  created_at timestamptz default now()
);

alter table tasks
  add column if not exists order_index int default 0;

alter table manuscripts
  add column if not exists deleted_at timestamptz;

alter table chat_entries
  add column if not exists deleted_at timestamptz;
