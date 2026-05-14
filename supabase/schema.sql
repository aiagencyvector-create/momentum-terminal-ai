-- Momentum Terminal AI — Schema do Main Brain
-- Aplique no SQL Editor do seu projeto Supabase.

create extension if not exists vector with schema extensions;
create extension if not exists "uuid-ossp";

-- ============================================================================
-- Tabelas
-- ============================================================================

create table if not exists public.brain_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  title text not null,
  source_path text,
  content text not null,
  embedding extensions.vector(1536),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brain_documents_user_idx on public.brain_documents(user_id);
create index if not exists brain_documents_embedding_idx
  on public.brain_documents using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100);

create table if not exists public.brain_edges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_id uuid not null references public.brain_documents(id) on delete cascade,
  to_id uuid not null references public.brain_documents(id) on delete cascade,
  relation text,
  weight float not null default 1.0,
  created_at timestamptz not null default now(),
  unique (user_id, from_id, to_id, relation)
);

create index if not exists brain_edges_user_idx on public.brain_edges(user_id);
create index if not exists brain_edges_from_idx on public.brain_edges(from_id);

-- ============================================================================
-- Row-Level Security (cada usuário só vê os próprios documentos)
-- ============================================================================

alter table public.brain_documents enable row level security;
alter table public.brain_edges enable row level security;

drop policy if exists "users select own docs" on public.brain_documents;
create policy "users select own docs" on public.brain_documents
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own docs" on public.brain_documents;
create policy "users insert own docs" on public.brain_documents
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own docs" on public.brain_documents;
create policy "users update own docs" on public.brain_documents
  for update using (auth.uid() = user_id);

drop policy if exists "users delete own docs" on public.brain_documents;
create policy "users delete own docs" on public.brain_documents
  for delete using (auth.uid() = user_id);

drop policy if exists "users select own edges" on public.brain_edges;
create policy "users select own edges" on public.brain_edges
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own edges" on public.brain_edges;
create policy "users insert own edges" on public.brain_edges
  for insert with check (auth.uid() = user_id);

drop policy if exists "users delete own edges" on public.brain_edges;
create policy "users delete own edges" on public.brain_edges
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- Função de busca semântica (cosine similarity)
-- ============================================================================

create or replace function public.match_brain(
  query_embedding extensions.vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  source_path text,
  content text,
  tags text[],
  similarity float
)
language sql stable security invoker
as $$
  select
    d.id,
    d.title,
    d.source_path,
    d.content,
    d.tags,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.brain_documents d
  where d.user_id = auth.uid()
    and d.embedding is not null
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- Trigger para atualizar updated_at
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_brain_documents_updated_at on public.brain_documents;
create trigger trg_brain_documents_updated_at
  before update on public.brain_documents
  for each row execute function public.set_updated_at();
