import { Link } from 'react-router-dom';
import { Course, categories } from '@/data/courses';
import { BookOpen, HelpCircle } from 'lucide-react';

const difficultyColor: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

const CourseCard = ({ course }: { course: Course }) => {
  const cat = categories.find(c => c.id === course.categoryId);

  return (
    <Link
      to={`/course/${course.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className={`h-2 bg-gradient-to-r ${cat?.color || 'from-primary to-primary'}`} />
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat?.icon}</span>
          <span className="text-xs text-muted-foreground">{cat?.name}</span>
          <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${difficultyColor[course.difficulty]}`}>
            {course.difficulty}
          </span>
        </div>
        <h3 className="font-display text-base font-semibold text-foreground leading-tight">{course.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{course.description}</p>
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" /> {course.lessonsCount} lessons
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" /> {course.questionsCount} questions
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
