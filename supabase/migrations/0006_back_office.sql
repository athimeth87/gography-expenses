-- 0006_back_office.sql
-- Back-office layer: Payouts, Members & permissions, DB-managed Categories, System settings.
--
-- SAFE TO RUN: idempotent + additive only. Does NOT alter existing enums and does NOT
-- touch expenses.category, so existing data keeps working. Run in the Supabase SQL editor
-- (Dashboard → SQL) or via `supabase db push`.
--
-- Convention (matches migrations 0001-0005):
--   * RLS policies wrap auth.* in a subselect for plan caching: (select auth.uid())
--   * Admin is detected from the synced JWT claim: app_metadata.role = 'admin'
--   * Privileged writes from the app go through the service-role admin client
--     (createAdminClient) after requireRole('admin'); these policies are defence-in-depth.

begin;

-- ============================================================
-- 1) EXPENSES — payout + audit columns, filter/sort indexes
-- ============================================================
alter table public.expenses
  add column if not exists paid_at          timestamptz,
  add column if not exists paid_by          uuid references public.profiles(id),
  add column if not exists payout_method    text check (payout_method in ('bank_transfer','promptpay','cash')),
  add column if not exists payout_reference text,
  add column if not exists payout_batch_id  uuid;  -- FK wired in section 3

create index if not exists idx_expenses_status        on public.expenses (status);
create index if not exists idx_expenses_trip          on public.expenses (trip_id);
create index if not exists idx_expenses_user          on public.expenses (user_id);
create index if not exists idx_expenses_expense_date  on public.expenses (expense_date);
create index if not exists idx_expenses_currency      on public.expenses (currency);
create index if not exists idx_expenses_status_user   on public.expenses (status, user_id);
create index if not exists idx_expenses_approved_at   on public.expenses (approved_at);

-- ============================================================
-- 2) EXPENSE STATUS EVENTS — real audit trail (ส่ง → อนุมัติ → จ่าย)
-- ============================================================
create table if not exists public.expense_status_events (
  id          uuid primary key default gen_random_uuid(),
  expense_id  uuid not null references public.expenses(id) on delete cascade,
  from_status text,
  to_status   text not null,
  actor_id    uuid references public.profiles(id),
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_ese_expense on public.expense_status_events (expense_id, created_at);

alter table public.expense_status_events enable row level security;

drop policy if exists ese_admin_all on public.expense_status_events;
create policy ese_admin_all on public.expense_status_events
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists ese_owner_read on public.expense_status_events;
create policy ese_owner_read on public.expense_status_events
  for select to authenticated
  using (exists (
    select 1 from public.expenses e
    where e.id = expense_id and e.user_id = (select auth.uid())
  ));

-- ============================================================
-- 3) PAYOUT BATCHES — group expenses paid together
-- ============================================================
create table if not exists public.payout_batches (
  id               uuid primary key default gen_random_uuid(),
  created_by       uuid references public.profiles(id),
  payout_method    text not null check (payout_method in ('bank_transfer','promptpay','cash')),
  payout_reference text,
  paid_at          timestamptz not null default now(),
  total_thb        numeric not null default 0,
  item_count       int not null default 0,
  created_at       timestamptz not null default now()
);

alter table public.expenses drop constraint if exists expenses_payout_batch_fk;
alter table public.expenses
  add constraint expenses_payout_batch_fk
  foreign key (payout_batch_id) references public.payout_batches(id) on delete set null;
create index if not exists idx_expenses_payout_batch on public.expenses (payout_batch_id);

alter table public.payout_batches enable row level security;

drop policy if exists pb_admin_all on public.payout_batches;
create policy pb_admin_all on public.payout_batches
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists pb_member_read on public.payout_batches;
create policy pb_member_read on public.payout_batches
  for select to authenticated
  using (exists (
    select 1 from public.expenses e
    where e.payout_batch_id = payout_batches.id and e.user_id = (select auth.uid())
  ));

-- ============================================================
-- 4) PROFILES — disable/enable + audit columns
-- ============================================================
alter table public.profiles
  add column if not exists status      text not null default 'active' check (status in ('active','disabled')),
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_by uuid references public.profiles(id);

create index if not exists idx_profiles_role   on public.profiles (role);
create index if not exists idx_profiles_status on public.profiles (status);

-- ============================================================
-- 5) MEMBER INVITES — invite-by-email flow
-- ============================================================
create table if not exists public.member_invites (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  role       text not null default 'photographer' check (role in ('admin','photographer')),
  token      text not null unique default gen_random_uuid()::text,
  invited_by uuid references public.profiles(id),
  status     text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);
create index if not exists idx_member_invites_status on public.member_invites (status);

alter table public.member_invites enable row level security;

drop policy if exists mi_admin_all on public.member_invites;
create policy mi_admin_all on public.member_invites
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- 6) ROLE AUDIT — trace every permission change
-- ============================================================
create table if not exists public.role_audit (
  id             uuid primary key default gen_random_uuid(),
  target_user_id uuid references public.profiles(id),
  actor_id       uuid references public.profiles(id),
  action         text not null check (action in ('role_change','disable','enable','remove','invite')),
  from_role      text,
  to_role        text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_role_audit_target on public.role_audit (target_user_id, created_at);

alter table public.role_audit enable row level security;

drop policy if exists ra_admin_all on public.role_audit;
create policy ra_admin_all on public.role_audit
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- 7) CATEGORIES — move the hardcoded set into the DB
--    (Phase 1: mirror only. expenses.category stays as-is; a later
--     migration can add expenses.category_id FK once verified.)
-- ============================================================
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  name_th    text not null,
  label_en   text not null,
  icon       text not null default 'more-horizontal',
  color      text not null default '#0A2540',
  sort_order int not null default 0,
  is_active  boolean not null default true,
  is_system  boolean not null default false,   -- seed rows can't be deleted
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_categories_active_sort on public.categories (is_active, sort_order);

insert into public.categories (key, name_th, label_en, icon, color, sort_order, is_system) values
  ('fuel',  'น้ำมัน',      'Fuel',           'fuel',           '#0A2540', 1, true),
  ('hotel', 'ที่พัก',       'Hotel',          'bed',            '#2A4A75', 2, true),
  ('food',  'อาหาร',       'Food',           'utensils',       '#0F9D58', 3, true),
  ('trans', 'การเดินทาง',  'Transportation', 'bus',            '#1D4ED8', 4, true),
  ('park',  'ที่จอดรถ',     'Parking',        'square-parking', '#B7791F', 5, true),
  ('equip', 'อุปกรณ์',      'Equipment',      'camera',         '#C5363A', 6, true),
  ('other', 'อื่น ๆ',       'Other',          'more-horizontal','#6E7E9A', 7, true)
on conflict (key) do nothing;

alter table public.categories enable row level security;

drop policy if exists cat_read_all on public.categories;
create policy cat_read_all on public.categories
  for select to authenticated using (true);

drop policy if exists cat_admin_write on public.categories;
create policy cat_admin_write on public.categories
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- 8) ORG SETTINGS (single row) + notification channels + audit
-- ============================================================
create table if not exists public.org_settings (
  id                         boolean primary key default true check (id),  -- enforces a single row
  org_name                   text not null default 'GoGraphy',
  logo_path                  text,
  base_currency              text not null default 'THB',
  timezone                   text not null default 'Asia/Bangkok',
  require_receipt            boolean not null default true,
  auto_approve_enabled       boolean not null default false,
  auto_approve_threshold_thb numeric,
  approver_role              text not null default 'admin',
  allow_manual_exchange_rate boolean not null default true,
  date_format                text not null default 'YYYY-MM-DD',
  ui_language                text not null default 'th',
  updated_at                 timestamptz not null default now(),
  updated_by                 uuid references public.profiles(id)
);
insert into public.org_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.notification_channels (
  id                 uuid primary key default gen_random_uuid(),
  channel            text not null unique check (channel in ('line','email','telegram')),
  enabled            boolean not null default false,
  target             text,
  notify_on_new      boolean not null default true,
  notify_on_approved boolean not null default true,
  notify_on_rejected boolean not null default true,
  updated_at         timestamptz not null default now()
);
insert into public.notification_channels (channel, enabled) values
  ('line', false), ('email', false), ('telegram', false)
on conflict (channel) do nothing;

create table if not exists public.settings_audit (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles(id),
  field_key  text not null,
  old_value  text,
  new_value  text,
  created_at timestamptz not null default now()
);

alter table public.org_settings          enable row level security;
alter table public.notification_channels enable row level security;
alter table public.settings_audit        enable row level security;

drop policy if exists os_admin_all on public.org_settings;
create policy os_admin_all on public.org_settings
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists nc_admin_all on public.notification_channels;
create policy nc_admin_all on public.notification_channels
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists sa_admin_all on public.settings_audit;
create policy sa_admin_all on public.settings_audit
  for all to authenticated
  using      (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

commit;

-- ============================================================
-- 9) OPTIONAL — storage bucket for the workspace logo.
--    Uncomment and run if you want logo upload on the Settings page.
-- ============================================================
-- insert into storage.buckets (id, name, public)
--   values ('org-assets', 'org-assets', false)
--   on conflict (id) do nothing;
--
-- drop policy if exists "org-assets admin all" on storage.objects;
-- create policy "org-assets admin all" on storage.objects
--   for all to authenticated
--   using      (bucket_id = 'org-assets' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
--   with check (bucket_id = 'org-assets' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
