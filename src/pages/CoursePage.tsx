import { useParams, Link } from "react-router-dom";
import { getCourseById, categories } from "@/data/courses";
import Header from "@/components/Header";
import QuizView from "@/components/QuizView";
import LessonView from "@/components/LessonView";
import StudyTools from "@/components/StudyTools";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, HelpCircle, BarChart3, BookmarkCheck, Clock3, Sparkles } from "lucide-react";
import { deleteLearningRecord, getSession, isSupabaseConfigured, loadLearningRecords, saveLearningRecord } from "@/lib/supabase";

type Tab = "lessons" | "quiz" | "study";
const CoursePage = () => {
  const { id } = useParams();
  const course = getCourseById(id || "");
  const [activeTab, setActiveTab] = useState<Tab>("lessons");
  const [activeLesson, setActiveLesson] = useState(0);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [examMode, setExamMode] = useState<"practice" | "timed">("practice");
  const [examMinutes, setExamMinutes] = useState(10);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [savedCourse, setSavedCourse] = useState(false);
  const [authRevision, setAuthRevision] = useState(0);

  useEffect(() => {
    const onAuthChanged = () => setAuthRevision(value => value + 1);
    window.addEventListener("quizvault:auth-changed", onAuthChanged);
    return () => window.removeEventListener("quizvault:auth-changed", onAuthChanged);
  }, []);

  useEffect(() => {
    if (!course) return;
    try {
      const localCompleted = JSON.parse(localStorage.getItem(`quizvault.lessons.${course.id}`) || "[]") as number[];
      setCompletedLessons(localCompleted);
      const saved = JSON.parse(localStorage.getItem("quizvault.savedCourses") || "[]") as string[];
      setSavedCourse(saved.includes(course.id));
      const session = getSession();
      if (session && isSupabaseConfigured) {
        void Promise.all([
          loadLearningRecords<{ lesson_index: number }>("lesson_progress", `select=lesson_index&course_id=eq.${encodeURIComponent(course.id)}`),
          loadLearningRecords<{ course_id: string }>("saved_courses", `select=course_id&course_id=eq.${encodeURIComponent(course.id)}`),
        ]).then(([remoteLessons, remoteSaved]) => {
          const remoteLessonIds = new Set(remoteLessons.map(item => item.lesson_index));
          const mergedLessons = [...new Set([...localCompleted, ...remoteLessonIds])];
          setCompletedLessons(mergedLessons);
          localStorage.setItem(`quizvault.lessons.${course.id}`, JSON.stringify(mergedLessons));
          // Backfill work completed while offline into the signed-in user's cloud record.
          for (const lessonIndex of localCompleted) {
            if (!remoteLessonIds.has(lessonIndex)) {
              void saveLearningRecord("rest/v1/lesson_progress", {
                user_id: session.user.id, course_id: course.id, lesson_index: lessonIndex,
              }).catch(error => console.error("Could not backfill lesson progress", error));
            }
          }
          const remoteHasCourse = remoteSaved.length > 0;
          if (remoteHasCourse && !saved.includes(course.id)) {
            const mergedSaved = [...new Set([...saved, course.id])];
            localStorage.setItem("quizvault.savedCourses", JSON.stringify(mergedSaved));
            setSavedCourse(true);
          } else if (!remoteHasCourse && saved.includes(course.id)) {
            void saveLearningRecord("rest/v1/saved_courses", {
              user_id: session.user.id, course_id: course.id,
            }).catch(error => console.error("Could not backfill saved course", error));
          }
        }).catch(error => console.error("Could not load synced learning progress", error));
      }
    } catch {
      setCompletedLessons([]);
    }
  }, [course?.id, authRevision]);

  const progress = useMemo(() => course ? Math.round((completedLessons.length / Math.max(1, course.lessons.length)) * 100) : 0, [course, completedLessons]);

  if (!course) {
    return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto flex flex-col items-center justify-center px-4 py-24"><h1 className="font-display text-2xl font-bold text-foreground">Course not found</h1><Link to="/" className="mt-4 text-primary hover:underline">← Back to courses</Link></div></div>;
  }

  const cat = categories.find(c => c.id === course.categoryId);
  const markLessonComplete = (lessonIndex: number) => {
    const next = completedLessons.includes(lessonIndex) ? completedLessons : [...completedLessons, lessonIndex];
    setCompletedLessons(next);
    localStorage.setItem(`quizvault.lessons.${course.id}`, JSON.stringify(next));
    const session = getSession();
    if (session) void saveLearningRecord("rest/v1/lesson_progress", {
      user_id: session.user.id, course_id: course.id, lesson_index: lessonIndex,
    }).catch(error => console.error("Could not sync lesson progress", error));
  };
  const toggleSavedCourse = () => {
    const current = JSON.parse(localStorage.getItem("quizvault.savedCourses") || "[]") as string[];
    const next = savedCourse ? current.filter(courseId => courseId !== course.id) : [...current, course.id];
    localStorage.setItem("quizvault.savedCourses", JSON.stringify(next));
    setSavedCourse(!savedCourse);
    const session = getSession();
    if (session && !savedCourse) void saveLearningRecord("rest/v1/saved_courses", {
      user_id: session.user.id, course_id: course.id,
    }).catch(error => console.error("Could not sync saved course", error));
    else if (session && savedCourse) void deleteLearningRecord("saved_courses", `course_id=eq.${encodeURIComponent(course.id)}`)
      .catch(error => console.error("Could not remove saved course from Supabase", error));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className={`bg-gradient-to-r ${cat?.color || "from-primary to-primary"} py-10 md:py-12`}>
        <div className="container mx-auto px-4">
          <Link to={`/?category=${course.categoryId}`} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to {cat?.name}</Link>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/75">{cat?.name || "Course"} · Independent learning</p>
              <h1 className="font-display text-3xl font-bold text-white md:text-4xl">{course.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">{course.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-white/90"><BookOpen className="h-4 w-4" /> {course.lessonsCount} lessons</span>
                <span className="flex items-center gap-1.5 text-sm text-white/90"><HelpCircle className="h-4 w-4" /> Practice questions</span>
                <span className="flex items-center gap-1.5 text-sm text-white/90"><BarChart3 className="h-4 w-4" /> {course.difficulty} starting level</span>
              </div>
            </div>
            <button onClick={toggleSavedCourse} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20">
              <BookmarkCheck className="h-4 w-4" /> {savedCourse ? "Saved to library" : "Save course"}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-7 md:py-8">
        <div className="mb-7 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-foreground">Your course progress</span><span className="text-sm font-bold text-primary">{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{completedLessons.length} of {course.lessons.length} lessons completed. Progress is saved on this device and syncs when signed in.</p>
        </div>

        <div className="mb-7 flex w-fit max-w-full flex-wrap gap-1 rounded-full bg-muted p-1">
          {([{ id: "lessons", label: "📖 Lessons" }, { id: "quiz", label: "🧠 Exams & practice" }, { id: "study", label: "✨ AI Study Studio" }] as {id:Tab;label:string}[]).map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{tab.label}</button>)}
        </div>

        <div className={activeTab === "study" ? "max-w-4xl" : "max-w-3xl"}>
          {activeTab === "lessons" && <div className="flex flex-col gap-4 animate-fade-in">
            <div className="mb-2"><h2 className="font-display text-xl font-bold text-foreground">Course lessons</h2><p className="mt-1 text-sm text-muted-foreground">Read each lesson, try the practice activity, then mark it complete to track your progress.</p></div>
            {course.lessons.map((lesson, i) => <LessonView key={i} lesson={lesson} index={i} isActive={activeLesson === i} isCompleted={completedLessons.includes(i)} onSelect={() => setActiveLesson(activeLesson === i ? -1 : i)} onComplete={() => markLessonComplete(i)} />)}
          </div>}

          {activeTab === "quiz" && <div className="animate-fade-in">
            <div className="mb-6 rounded-2xl border border-border bg-card p-4 md:p-5">
              <h2 className="font-display text-xl font-bold text-foreground">Exam setup</h2>
              <p className="mt-1 text-sm text-muted-foreground">Questions are randomized for each attempt. Higher levels use longer question sets.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-medium text-foreground">Difficulty
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-foreground">Mode
                  <select value={examMode} onChange={e => setExamMode(e.target.value as typeof examMode)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5">
                    <option value="practice">Practice with feedback</option><option value="timed">Timed exam</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-foreground">Time limit
                  <select value={examMinutes} onChange={e => setExamMinutes(Number(e.target.value))} disabled={examMode !== "timed"} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 disabled:opacity-50">
                    <option value={5}>5 minutes</option><option value={10}>10 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option>
                  </select>
                </label>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {Math.min(difficulty === "Beginner" ? 10 : difficulty === "Intermediate" ? 20 : 30, course.questions.filter(q => !q.difficulty || q.difficulty === difficulty).length || course.questions.length)} questions · {examMode === "timed" ? `${examMinutes} minute time limit` : "No time limit"}</p>
              {!course.questions.some(question => question.difficulty) && <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">This learning path currently uses a general subject question bank. The selected level changes exam length, but individual questions have not yet been independently level-rated.</p>}
            </div>
            <h2 className="mb-5 font-display text-xl font-bold text-foreground">{examMode === "timed" ? "Timed exam" : "Practice quiz"}: {course.title}</h2>
            <QuizView key={`${course.id}-${difficulty}-${examMode}-${examMinutes}`} questions={course.questions} courseTitle={course.title} courseId={course.id} difficulty={difficulty} mode={examMode} examMinutes={examMinutes} />
          </div>}

          {activeTab === "study" && <StudyTools courseTitle={course.title} />}
        </div>

        <p className="mt-8 flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> Learning material is for independent study and is not an accredited qualification or professional advice. AI-generated materials are labelled and should be checked against reliable sources.</p>
      </div>
    </div>
  );
};

export default CoursePage;
