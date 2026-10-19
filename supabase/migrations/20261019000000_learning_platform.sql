-- QuizVault learning data. Run this migration in the linked Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_courses (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  lesson_index integer not null check (lesson_index >= 0),
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_index)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  mode text not null default 'practice' check (mode in ('practice', 'timed')),
  difficulty text not null default 'Beginner' check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  question_count integer not null check (question_count > 0),
  correct_count integer not null check (correct_count >= 0 and correct_count <= question_count),
  score_percent numeric(5,2) not null check (score_percent >= 0 and score_percent <= 100),
  incorrect_question_ids jsonb not null default '[]'::jsonb,
  duration_seconds integer check (duration_seconds >= 0),
  completed_at timestamptz not null default now()
);

create table if not exists public.question_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  question_hash text not null,
  question_text text not null,
  question_data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id, question_hash)
);

create table if not exists public.ai_study_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artifact_type text not null check (artifact_type in ('quiz', 'explanation', 'flashcards', 'summary')),
  title text not null,
  source_name text,
  generated_content jsonb not null,
  is_ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saved_courses enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.question_bookmarks enable row level security;
alter table public.ai_study_artifacts enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Users manage their saved courses" on public.saved_courses;
create policy "Users manage their saved courses" on public.saved_courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage their lesson progress" on public.lesson_progress;
create policy "Users manage their lesson progress" on public.lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage their quiz attempts" on public.quiz_attempts;
create policy "Users manage their quiz attempts" on public.quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage their question bookmarks" on public.question_bookmarks;
create policy "Users manage their question bookmarks" on public.question_bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage their AI study artifacts" on public.ai_study_artifacts;
create policy "Users manage their AI study artifacts" on public.ai_study_artifacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.profiles, public.saved_courses, public.lesson_progress, public.quiz_attempts, public.question_bookmarks, public.ai_study_artifacts to authenticated;

create index if not exists quiz_attempts_user_course_completed_idx
  on public.quiz_attempts (user_id, course_id, completed_at desc);
create index if not exists ai_study_artifacts_user_created_idx
  on public.ai_study_artifacts (user_id, created_at desc);

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.create_profile_for_new_user();
