import { useParams, Link } from 'react-router-dom';
import { getCourseById, categories } from '@/data/courses';
import Header from '@/components/Header';
import QuizView from '@/components/QuizView';
import LessonView from '@/components/LessonView';
import { useState } from 'react';
import { ArrowLeft, BookOpen, HelpCircle, BarChart3 } from 'lucide-react';

const CoursePage = () => {
  const { id } = useParams();
  const course = getCourseById(id || '');
  const [activeTab, setActiveTab] = useState<'lessons' | 'quiz'>('lessons');
  const [activeLesson, setActiveLesson] = useState(0);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto flex flex-col items-center justify-center py-24 px-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Course not found</h1>
          <Link to="/" className="mt-4 text-primary hover:underline">← Back to courses</Link>
        </div>
      </div>
    );
  }

  const cat = categories.find(c => c.id === course.categoryId);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className={`bg-gradient-to-r ${cat?.color || 'from-primary to-primary'} py-12`}>
        <div className="container mx-auto px-4">
          <Link to={`/?category=${course.categoryId}`} className="inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to {cat?.name}
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{course.title}</h1>
          <p className="mt-2 text-white/80 max-w-xl text-sm">{course.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm text-white/90">
              <BookOpen className="h-4 w-4" /> {course.lessonsCount} Lessons
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/90">
              <HelpCircle className="h-4 w-4" /> {course.questionsCount} Questions
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/90">
              <BarChart3 className="h-4 w-4" /> {course.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-1 rounded-full bg-muted p-1 w-fit mb-8">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
              activeTab === 'lessons' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📖 Free Lessons
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
              activeTab === 'quiz' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🧠 Take Quiz
          </button>
        </div>

        <div className="max-w-3xl">
          {activeTab === 'lessons' ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Free Lessons</h2>
              {course.lessons.map((lesson, i) => (
                <LessonView
                  key={i}
                  lesson={lesson}
                  index={i}
                  isActive={activeLesson === i}
                  onSelect={() => setActiveLesson(activeLesson === i ? -1 : i)}
                />
              ))}
            </div>
          ) : (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Quiz: {course.title}</h2>
              <QuizView questions={course.questions} courseTitle={course.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
