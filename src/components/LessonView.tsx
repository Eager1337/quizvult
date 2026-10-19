import { Lesson } from "@/data/courses";
import { Clock, ChevronRight, CheckCircle2 } from "lucide-react";

const LessonView = ({ lesson, index, isActive, onSelect, isCompleted = false, onComplete }: {
  lesson: Lesson;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  isCompleted?: boolean;
  onComplete?: () => void;
}) => {
  return (
    <div>
      <button onClick={onSelect} aria-expanded={isActive} className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-primary text-primary-foreground"}`}>
          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-display text-sm font-semibold text-foreground">{lesson.title}</h4>
          <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {lesson.duration} {isCompleted ? "· Completed" : ""}</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? "rotate-90" : ""}`} />
      </button>
      {isActive && <div className="mt-3 rounded-xl border border-border bg-card p-5 animate-slide-up md:p-6">
        <div className="prose prose-sm max-w-none text-foreground">
          {lesson.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) return <h2 key={i} className="mb-2 mt-4 font-display text-lg font-semibold text-foreground">{line.slice(3)}</h2>;
            if (line.startsWith("- ")) return <p key={i} className="ml-2 text-sm leading-relaxed text-muted-foreground">• {line.slice(2)}</p>;
            if (line.startsWith("```")) return null;
            if (line.trim() === "") return <div key={i} className="h-2" />;
            if (line.startsWith("**") && line.includes("**:")) return <p key={i} className="text-sm leading-relaxed text-foreground">{line}</p>;
            return <p key={i} className="text-sm leading-relaxed text-muted-foreground">{line}</p>;
          })}
        </div>
        {onComplete && <button onClick={onComplete} disabled={isCompleted} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:bg-emerald-100 disabled:text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {isCompleted ? "Lesson completed" : "Mark lesson complete"}
        </button>}
      </div>}
    </div>
  );
};

export default LessonView;
