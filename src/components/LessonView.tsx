import { Lesson } from '@/data/courses';
import { Clock, ChevronRight } from 'lucide-react';

const LessonView = ({ lesson, index, isActive, onSelect }: {
  lesson: Lesson;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) => {
  return (
    <div>
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
          isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-sm font-semibold text-foreground truncate">{lesson.title}</h4>
          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" /> {lesson.duration}
          </span>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`} />
      </button>

      {isActive && (
        <div className="mt-3 rounded-xl bg-card border border-border p-6 animate-slide-up">
          <div className="prose prose-sm max-w-none text-foreground">
            {lesson.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} className="font-display text-lg font-semibold text-foreground mt-4 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith('- ')) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.slice(2)}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonView;
