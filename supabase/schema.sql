-- Khoroch — full schema, RLS policies, triggers and RPCs.
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- Safe to re-run: everything is idempotent.

-- ---------------------------------------------------------------------------
-- profiles — mirrors auth.users, auto-populated from Google metadata
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text,
  email      text,
  avatar_url text,
  language   text not null default 'en' check (language in ('en', 'bn')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- debts — money you owe ('owe') or are owed ('owed')
-- ---------------------------------------------------------------------------
create table if not exists public.debts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  direction  text not null check (direction in ('owe', 'owed')),
  name       text not null check (length(trim(name)) > 0),
  phone      text,
  amount     numeric(14, 2) not null check (amount > 0),
  remaining  numeric(14, 2) not null check (remaining >= 0),
  created_at timestamptz not null default now()
);
create index if not exists debts_user_id_idx on public.debts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- debt_payments — repayment ledger.
-- Stays empty until the "Add Payment" button is wired (out of scope this phase),
-- but the debt detail sheet already renders this history, and creating the table
-- now avoids a migration later. lastPayment/lastPaymentDate are DERIVED from
-- this table in the API layer, never stored on debts.
-- ---------------------------------------------------------------------------
create table if not exists public.debt_payments (
  id      uuid primary key default gen_random_uuid(),
  debt_id uuid not null references public.debts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  amount  numeric(14, 2) not null check (amount > 0),
  paid_at timestamptz not null default now()
);
create index if not exists debt_payments_debt_id_idx on public.debt_payments (debt_id, paid_at desc);

-- ---------------------------------------------------------------------------
-- goals — savings targets for specific items
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users on delete cascade,
  name                 text not null check (length(trim(name)) > 0),
  target               numeric(14, 2) not null check (target > 0),
  saved                numeric(14, 2) not null default 0 check (saved >= 0),
  deadline             date not null,
  icon                 text not null default 'Target',
  color                text not null default '#46D6A8',
  monthly_contribution numeric(14, 2) check (monthly_contribution > 0),
  created_at           timestamptz not null default now()
);
create index if not exists goals_user_id_idx on public.goals (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- bills — recurring monthly payments.
-- NOTE: there is no stored `status` column. Status is derived in the API layer:
--   paid_at is not null            -> 'paid'
--   due_date < today               -> 'overdue'
--   otherwise                      -> 'upcoming'
-- This keeps 'overdue' correct over time with no mark-as-paid UI.
-- ---------------------------------------------------------------------------
create table if not exists public.bills (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  category   text not null default 'Utility',
  icon       text not null default 'Receipt',
  amount     numeric(14, 2) not null check (amount > 0),
  due_date   date not null,
  paid_at    timestamptz,
  recurring  boolean not null default true,
  color      text not null default '#46D6A8',
  created_at timestamptz not null default now()
);
create index if not exists bills_user_id_idx on public.bills (user_id, due_date);

-- ---------------------------------------------------------------------------
-- Row Level Security.
-- The app ships a publishable key, so RLS is the ONLY thing protecting data.
-- Every table is locked to its owning user.
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.debts         enable row level security;
alter table public.debt_payments enable row level security;
alter table public.goals         enable row level security;
alter table public.bills         enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "own debts" on public.debts;
create policy "own debts" on public.debts
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The debt_id check matters: without it a user could pass their own user_id but
-- someone else's debt_id and write a payment onto a stranger's debt.
drop policy if exists "own debt_payments" on public.debt_payments;
create policy "own debt_payments" on public.debt_payments
  for all
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.debts d
       where d.id = debt_id and d.user_id = (select auth.uid())
    )
  );

drop policy if exists "own goals" on public.goals;
create policy "own goals" on public.goals
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own bills" on public.bills;
create policy "own bills" on public.bills
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever someone signs up.
-- Google puts the display name and picture in raw_user_meta_data.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Atomic goal deposit.
-- Doing this as a client-side read-modify-write would silently drop concurrent
-- deposits; this increments in a single statement instead.
-- security invoker => RLS still applies, so users can only touch their own goals.
-- ---------------------------------------------------------------------------
create or replace function public.add_to_goal(goal_id uuid, deposit numeric)
returns public.goals
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated public.goals;
begin
  if deposit is null or deposit <= 0 then
    raise exception 'deposit must be greater than zero';
  end if;

  update public.goals
     set saved = saved + deposit
   where id = goal_id
   returning * into updated;

  if updated.id is null then
    raise exception 'goal not found';
  end if;

  return updated;
end;
$$;

-- ---------------------------------------------------------------------------
-- Account deletion.
-- Google Play REQUIRES any app with account creation to offer in-app deletion,
-- so this is a store blocker, not a nicety.
--
-- Clients cannot touch auth.users directly, hence security definer. Deleting the
-- auth user cascades through every table via their `on delete cascade` foreign
-- keys, so this single statement removes all of the user's data.
--
-- auth.uid() is read *inside* the function, so a caller can only ever delete
-- themselves — there is no parameter to tamper with.
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
