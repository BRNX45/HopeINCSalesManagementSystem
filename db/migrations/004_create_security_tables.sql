-- 004_create_security_tables.sql

create table app_user (
  id serial primary key,
  auth_id uuid unique,
  email text not null unique,
  full_name text not null,
  record_status text not null default 'INACTIVE',
  created_at timestamptz not null default now()
);

create table app_module (
  id serial primary key,
  code text not null unique,
  name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table user_module (
  id serial primary key,
  user_id integer not null references app_user(id),
  module_id integer not null references app_module(id),
  created_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create table rights (
  id serial primary key,
  code text not null unique,
  name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table user_module_rights (
  id serial primary key,
  user_module_id integer not null references user_module(id),
  rights_id integer not null references rights(id),
  can boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_module_id, rights_id)
);
