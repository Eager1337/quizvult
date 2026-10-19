# QuizVault

QuizVault is a self-paced learning catalogue with lessons, practice questions, progress tracking, and an AI Study Studio. It is a learning aid, not an accredited education provider. Course paths and some lessons are generated from subject-specific teaching templates; question banks are category-level and should receive editorial review before being described as exam-grade.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project.
4. Run `npm run dev`.

Without Supabase environment variables, the catalogue and local-device progress still work. Authentication, cross-device persistence, and AI study generation require a configured Supabase project.

## Supabase setup

1. Apply `supabase/migrations/20261019000000_learning_platform.sql` in the Supabase SQL Editor or with the Supabase CLI.
2. Apply `supabase/migrations/20261020000000_general_workspace.sql` to add workspace items, file metadata, a private `quizvault-private` Storage bucket, and owner-only RLS policies.
3. Enable Email authentication in Supabase Auth and configure your site's redirect/confirmation URLs.
4. Add these deployment environment variables to Vercel:
   - `VITE_SUPABASE_URL`: your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: the project's public anon/publishable key. Never put a service-role key in the browser.
5. Deploy the Edge Function in `supabase/functions/study-assistant/index.ts`.
6. Configure Edge Function secrets on the server:
   - `GEMINI_API_KEY`: your Google AI Studio API key.
   - `APP_ORIGIN`: your deployed app origin, such as `https://your-app.example`.
7. Keep row-level security enabled. The migrations restrict learning records, workspace items, file metadata, and private file objects to the signed-in owner.

Example CLI commands, if the Supabase CLI is installed and linked:

```sh
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase secrets set GEMINI_API_KEY=your_key APP_ORIGIN=https://your-app.example
supabase functions deploy study-assistant
```

## Current learning features

- Hand-authored, sequenced lessons and leveled question banks for Python Programming, Web Development 101, Algebra Basics, and Network Security; other catalogue entries currently use category-level teaching scaffolds with practice prompts and further-reading guidance.
- Randomized practice and timed exams, difficulty-based question pools, incorrect-answer review, and question bookmarks.
- Local-device progress that works offline; signed-in lesson completions, saved courses, bookmarks, and quiz attempts sync to Supabase.
- AI-generated quizzes, explanations, summaries, and flashcards from pasted notes or PDF/TXT/Markdown uploads. AI output is labelled and should be reviewed for accuracy.

## Personal workspace

- `/workspace` provides a general-purpose dashboard for personal users, students, professionals, business owners, job seekers, and travelers.
- Workspace areas include private document uploads/downloads/deletion, tasks with due dates, projects, personal milestones, travel plans, and AI text summarization/explanation. Learning tools remain available separately.
- File upload requires a signed-in Supabase account and the workspace migration; uploads are stored in a non-public Storage bucket with per-user folder policies. Current UI upload limit is 50 MB per file. Local-only tasks and plans remain in that browser and do not become cloud-backed until signed in.
- AI document tools currently accept pasted text; the existing study assistant handles the request. Direct PDF file-to-AI processing is not included in the workspace UI yet.

## Quality and safety notes

- AI output is not a substitute for a textbook, qualified instructor, or professional advice.
- No course is represented as accredited or certification-ready.
- Ethical hacking material is for authorized labs and defensive learning only.
- Trading material is educational and does not guarantee returns.
- A GitHub Actions workflow runs the test suite, application and configuration TypeScript checks, lint, and production build on pushes and pull requests to `main`. Confirm its run result before release. Review question banks with subject-matter experts and test authentication, RLS, and Edge Function deployment in the actual Supabase project.
