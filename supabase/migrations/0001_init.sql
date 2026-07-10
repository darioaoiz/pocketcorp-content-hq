-- PocketCorp Content HQ — esquema inicial
-- Proyecto Supabase de un solo usuario, sin multi-tenant.
-- Todo el acceso a estas tablas se hace desde el servidor con la service
-- role key (ver lib/supabase/server.ts) — RLS queda habilitado pero sin
-- policies para anon/authenticated, de forma que el unico camino de acceso
-- es el backend de la app, nunca el cliente directamente.

create extension if not exists "pgcrypto";

-- ── admin_users ─────────────────────────────────────────────────────────
-- Una sola fila esperada. Se crea con `npm run create-admin` (nunca desde
-- la UI ni desde variables de entorno en texto plano).
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- ── brand_bible_versions ────────────────────────────────────────────────
-- Cada guardado desde el panel crea una fila nueva (nunca se hace UPDATE
-- del contenido de una version existente) y mueve is_current a la nueva.
create table if not exists brand_bible_versions (
  id uuid primary key default gen_random_uuid(),
  version_number integer not null,
  identity text not null default '',
  offering text not null default '',
  target_audience text not null default '',
  voice_tone text not null default '',
  content_pillars text[] not null default '{}',
  prohibitions text[] not null default '{}',
  raw_notes text,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  unique (version_number)
);

alter table brand_bible_versions enable row level security;

-- Garantiza que solo una version este marcada como vigente a la vez.
create unique index if not exists brand_bible_versions_single_current
  on brand_bible_versions (is_current)
  where is_current;

-- ── directors ────────────────────────────────────────────────────────────
create table if not exists directors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text,
  color_hex text not null,
  higgsfield_character_id text,
  created_at timestamptz not null default now()
);

alter table directors enable row level security;

-- ── content_items ────────────────────────────────────────────────────────
create type platform as enum ('instagram', 'linkedin');

create type content_estado as enum (
  'borrador',
  'copy_generado',
  'creativo_generado',
  'pendiente_aprobacion',
  'aprobado'
);

create type creative_job_status as enum (
  'idle',
  'queued',
  'in_progress',
  'failed',
  'completed'
);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  platform platform not null,
  pilar text not null,
  idea_breve text,
  copy text,
  estado content_estado not null default 'borrador',
  fecha_planificada date not null,
  director_ids uuid[] not null default '{}',
  image_url text,
  image_storage_path text,
  higgsfield_request_id text,
  creative_job_status creative_job_status not null default 'idle',
  brand_bible_version_id uuid references brand_bible_versions (id),
  user_notes text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table content_items enable row level security;

create index if not exists content_items_fecha_idx on content_items (fecha_planificada);
create index if not exists content_items_estado_idx on content_items (estado);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger content_items_set_updated_at
  before update on content_items
  for each row
  execute function set_updated_at();

-- ── Seed: Brand Bible vacio (placeholder, se llena desde la UI) ──────────
insert into brand_bible_versions (version_number, identity, offering, target_audience, voice_tone, content_pillars, prohibitions, raw_notes, is_current)
select 1, '', '', '', '', '{}', '{}', 'Brand Bible aun no completado. Llenalo desde /brand-bible antes de generar copy.', true
where not exists (select 1 from brand_bible_versions);

-- ── Seed: roster de directores ────────────────────────────────────────────
-- Colores confirmados por el usuario: Max, Linda, Armando, Eva, Vladimir.
-- Luis, Sofia, Paola y Hugo llevan un color propuesto de la misma familia
-- neon — a confirmar/ajustar desde /directors.
insert into directors (name, role, color_hex)
values
  ('Max', 'Asistente General / Home', '#00FF66'),
  ('Linda', 'Marketing Visual', '#00E5FF'),
  ('Vladimir', 'Ventas', '#FF4F12'),
  ('Eva', 'Gerencia y Operaciones', '#FF2E93'),
  ('Armando', 'Finanzas y Balances', '#FFC72C'),
  ('Luis', null, '#B026FF'),
  ('Sofia', null, '#FFF200'),
  ('Paola', null, '#0047FF'),
  ('Hugo', null, '#FF6EC7')
on conflict (name) do nothing;
