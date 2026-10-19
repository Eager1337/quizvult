import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/courses";
import { deleteLearningRecord, getSession, isSupabaseConfigured, loadLearningRecords } from "@/lib/supabase";
import { BookmarkCheck, BookOpen, Trash2 } from "lucide-react";

const SavedCourses = () => {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const localIds = (() => {
      try { return JSON.parse(localStorage.getItem("quizvault.savedCourses") || "[]") as string[]; }
      catch { return []; }
    })();
    setSavedIds(localIds);
    const session = getSession();
    if (session && isSupabaseConfigured) {
      void loadLearningRecords<{ course_id: string }>("saved_courses", "select=course_id")
        .then(records => {
          if (!active) return;
          const merged = [...new Set([...localIds, ...records.map(record => record.course_id)])];
          setSavedIds(merged);
          localStorage.setItem("quizvault.savedCourses", JSON.stringify(merged));
        })
        .catch(error => console.error("Could not load saved courses", error))
        .finally(() => { if (active) setLoading(false); });
    } else setLoading(false);
    return () => { active = false; };
  }, []);

  const savedCourses = courses.filter(course => savedIds.includes(course.id));
  const removeCourse = (courseId: string) => {
    const next = savedIds.filter(id => id !== courseId);
    setSavedIds(next);
    localStorage.setItem("quizvault.savedCourses", JSON.stringify(next));
    if (getSession()) void deleteLearningRecord("saved_courses", `course_id=eq.${encodeURIComponent(courseId)}`)
      .catch(error => console.error("Could not remove saved course from Supabase", error));
  };

  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-10">
      <Link to="/" className="text-sm font-medium text-primary hover:underline">← Browse learning paths</Link>
      <div className="mt-5 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary"><BookmarkCheck className="h-6 w-6" /></div>
        <div><h1 className="font-display text-3xl font-bold text-foreground">Saved learning paths</h1><p className="mt-1 text-sm text-muted-foreground">Keep courses you want to return to.</p></div>
      </div>
      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading saved courses…</p>}
      {!loading && savedCourses.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-3 font-display text-xl font-bold text-foreground">Nothing saved yet</h2><p className="mt-2 text-sm text-muted-foreground">Open a learning path and choose “Save course” to keep it here.</p><Link to="/" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Explore courses</Link>
      </div>}
      {savedCourses.length > 0 && <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {savedCourses.map(course => <div key={course.id} className="relative">
          <CourseCard course={course} />
          <button onClick={() => removeCourse(course.id)} className="absolute right-3 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive" aria-label={`Remove ${course.title} from saved courses`}><Trash2 className="h-3.5 w-3.5" /> Remove</button>
        </div>)}
      </div>}
    </main>
  </div>;
};

export default SavedCourses;
