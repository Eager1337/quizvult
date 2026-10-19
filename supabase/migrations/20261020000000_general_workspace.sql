-- General-purpose QuizVault workspace: private records and private object storage.
create table if not exists public.workspace_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('task', 'project', 'journey', 'trip', 'note')),
  title text not null check (length(trim(title)) between 1 and 200),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workspace_items_user_kind_updated_idx on public.workspace_items (user_id, kind, updated_at desc);
alter table public.workspace_items enable row level security;
drop policy if exists "Users manage their own workspace items" on public.workspace_items;
create policy "Users manage their own workspace items" on public.workspace_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.workspace_items to authenticated;

create table if not exists public.workspace_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 255),
  storage_path text not null unique,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null check (size_bytes >= 0 and size_bytes <= 52428800),
  created_at timestamptz not null default now()
);
create index if not exists workspace_files_user_created_idx on public.workspace_files (user_id, created_at desc);
alter table public.workspace_files enable row level security;
drop policy if exists "Users manage their own workspace files" on public.workspace_files;
create policy "Users manage their own workspace files" on public.workspace_files
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.workspace_files to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quizvault-private', 'quizvault-private', false, 52428800, null)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "Users upload workspace files" on storage.objects;
create policy "Users upload workspace files" on storage.objects for insert to authenticated
  with check (bucket_id = 'quizvault-private' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users read workspace files" on storage.objects;
create policy "Users read workspace files" on storage.objects for select to authenticated
  using (bucket_id = 'quizvault-private' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update workspace files" on storage.objects;
create policy "Users update workspace files" on storage.objects for update to authenticated
  using (bucket_id = 'quizvault-private' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'quizvault-private' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete workspace files" on storage.objects;
create policy "Users delete workspace files" on storage.objects for delete to authenticated
  using (bucket_id = 'quizvault-private' and (storage.foldername(name))[1] = auth.uid()::text);
