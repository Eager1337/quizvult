import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { courses } from "@/data/courses";
import { getSession, isSupabaseConfigured, loadLearningRecords, localProgressKey } from "@/lib/supabase";
import { ArrowLeft, BarChart3, BookOpen, CheckCircle2, Clock3, Trophy } from "lucide-react";

type LocalQuizProgress = { attempts: number; bestScore: number; completedAt?: string };
type RemoteAttempt = { course_id: string; score_percent: number; completed_at: string };
type RemoteLesson = { course_id: string; lesson_index: number };

const readLocalProgress = (courseId: string): LocalQuizProgress => {
  try {
    return JSON.parse(localStorage.getItem(localProgressKey(courseId)) || '{"attempts":0,"bestScore":0}') as LocalQuizProgress;
  } catch {
    return { attempts: 0, bestScore: 0 };
  }
};

const readLocalLessons = (courseId: string): number[] => {
  try {
    return JSON.parse(localStorage.getItem(`quizvault.lessons.${courseId}`) || "[]") as number[];
  } catch {
    return [];
  }
};

const ProgressPage = () => {
  const [attempts, setAttempts] = useState<RemoteAttempt[]>([]);
  const [remoteLessons, setRemoteLessons] = useState<RemoteLesson[]>([]);
  const [syncStatus, setSyncStatus] = useState<"local" | "loading" | "synced" | "error">("local");

  useEffect(() => {
    const session = getSession();
    if (!session || !isSupabaseConfigured) return;
    let active = true;
    setSyncStatus("loading");
    void Promise.all([
      loadLearningRecords<RemoteAttempt>("quiz_attempts", "select=course_id,score_percent,completed_at&order=completed_at.desc"),
      loadLearningRecords<RemoteLesson>("lesson_progress", "select=course_id,lesson_index"),
    ]).then(([remoteAttempts, lessons]) => {
      if (!active) return;
      setAttempts(remoteAttempts);
      setRemoteLessons(lessons);
      setSyncStatus("synced");
    }).catch(error => {
      console.error("Could not load synced progress", error);
      if (active) setSyncStatus("error");
    });
    return () => { active = false; };
  }, []);

  const rows = useMemo(() => courses.map(course => {
    const local = readLocalProgress(course.id);
    const courseAttempts = attempts.filter(attempt => attempt.course_id === course.id);
    const remoteBest = courseAttempts.reduce((best, attempt) => Math.max(best, Number(attempt.score_percent) || 0), 0);
    const localLessons = readLocalLessons(course.id);
    const syncedLessons = remoteLessons.filter(item => item.course_id === course.id).map(item => item.lesson_index);
    const completed = new Set([...localLessons, ...syncedLessons]).size;
    return {
      course,
      completed: Math.min(completed, course.lessons.length),
      progress: Math.round((Math.min(completed, course.lessons.length) / Math.max(1, course.lessons.length)) * 100),
      attempts: Math.max(courseAttempts.length, local.attempts),
      bestScore: Math.max(local.bestScore, remoteBest),
      lastAttempt: courseAttempts[0]?.completed_at || local.completedAt,
    };
  }).filter(row => row.completed > 0 || row.attempts > 0 || row.bestScore > 0)
    .sort((a, b) => b.progress - a.progress || b.bestScore - a.bestScore), [attempts, remoteLessons]);

  const totals = useMemo(() => ({
    started: rows.length,
    completedLessons: rows.reduce((sum, row) => sum + row.completed, 0),
    attempts: rows.reduce((sum, row) => sum + row.attempts, 0),
    bestScore: rows.length ? Math.max(...rows.map(row => row.bestScore)) : 0,
  }), [rows]);

  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Browse learning paths</Link>
      <div className="mt-5 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary"><BarChart3 className="h-6 w-6" /></div>
        <div><h1 className="font-display text-3xl font-bold text-foreground">My learning progress</h1><p className="mt-1 text-sm text-muted-foreground">Review completed lessons, exam attempts, and your best scores.</p></div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Learning paths started", value: totals.started, icon: <BookOpen className="h-5 w-5" /> },
          { label: "Lessons completed", value: totals.completedLessons, icon: <CheckCircle2 className="h-5 w-5" /> },
          { label: "Quiz attempts", value: totals.attempts, icon: <Clock3 className="h-5 w-5" /> },
          { label: "Best score", value: `${totals.bestScore}%`, icon: <Trophy className="h-5 w-5" /> },
        ].map(item => <div key={item.label} className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-primary">{item.icon}<span className="text-xs font-medium text-muted-foreground">{item.label}</span></div><p className="mt-3 font-display text-2xl font-bold text-foreground">{item.value}</p></div>)}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
        <span>{syncStatus === "synced" ? "Signed-in progress has been synced from Supabase." : syncStatus === "loading" ? "Loading synced progress…" : syncStatus === "error" ? "Could not load cloud progress; showing available local progress too." : "Showing progress saved on this device. Sign in to the AI Study Studio to enable cloud sync."}</span>
        {syncStatus === "error" && <button className="font-semibold text-primary hover:underline" onClick={() => window.location.reload()}>Retry</button>}
      </div>

      {rows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center"><BookOpen className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-3 font-display text-xl font-bold text-foreground">Your learning journey starts here</h2><p className="mt-2 text-sm text-muted-foreground">Complete a lesson or take a quiz to see your progress.</p><Link to="/" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Explore learning paths</Link></div> : <div className="mt-8 space-y-3">
        {rows.map(row => <article key={row.course.id} className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0"><Link to={`/course/${row.course.id}`} className="font-display text-lg font-bold text-foreground hover:text-primary">{row.course.title}</Link><p className="mt-1 text-xs text-muted-foreground">{row.course.categoryId.replace(/-/g, " ")} · {row.completed}/{row.course.lessons.length} lessons completed · {row.attempts} quiz attempts</p></div>
            <div className="flex items-center gap-4 text-sm"><span className="text-muted-foreground">Best score</span><strong className="text-foreground">{row.bestScore}%</strong><Link to={`/course/${row.course.id}`} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Continue</Link></div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${row.progress}%` }} /></div>
          {row.lastAttempt && <p className="mt-2 text-xs text-muted-foreground">Last quiz: {new Date(row.lastAttempt).toLocaleDateString()}</p>}
        </article>)}
      </div>}
    </main>
  </div>;
};

export default ProgressPage;
