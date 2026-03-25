import { useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import CategoryCard from '@/components/CategoryCard';
import CourseCard from '@/components/CourseCard';
import { categories, courses, getCoursesByCategory, searchCourses } from '@/data/courses';
import { GraduationCap, Sparkles, BookOpen, Search } from 'lucide-react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const filteredCourses = useMemo(() => {
    if (searchQuery) return searchCourses(searchQuery);
    if (categoryFilter) return getCoursesByCategory(categoryFilter);
    return [];
  }, [categoryFilter, searchQuery]);

  const activeCat = categories.find(c => c.id === categoryFilter);
  const showBrowse = !categoryFilter && !searchQuery;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {showBrowse && (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden py-20 md:py-28" style={{ background: 'var(--hero-gradient)' }}>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-2xl animate-fade-in">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90 mb-6 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" /> 500+ Free Courses & Quizzes
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
                  Learn Anything.<br />
                  <span className="text-accent">Quiz Yourself.</span>
                </h1>
                <p className="mt-4 text-lg text-white/70 max-w-lg">
                  From ethical hacking to economics, trading to philosophy — master any subject with free lessons and interactive quizzes.
                </p>
                <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm p-2 max-w-md border border-white/10">
                  <Search className="h-5 w-5 text-white/60 ml-3" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && localSearch.trim()) {
                        window.location.href = `/?search=${encodeURIComponent(localSearch.trim())}`;
                      }
                    }}
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40 text-sm py-2"
                  />
                  <button
                    onClick={() => {
                      if (localSearch.trim()) window.location.href = `/?search=${encodeURIComponent(localSearch.trim())}`;
                    }}
                    className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 right-40 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
          </section>

          {/* Stats */}
          <section className="container mx-auto px-4 -mt-8 relative z-20">
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { icon: <BookOpen className="h-5 w-5" />, value: '500+', label: 'Courses' },
                { icon: <GraduationCap className="h-5 w-5" />, value: '20', label: 'Categories' },
                { icon: <Sparkles className="h-5 w-5" />, value: '100%', label: 'Free' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-2xl bg-card border border-border p-4 shadow-sm">
                  <div className="text-primary">{stat.icon}</div>
                  <span className="font-display text-xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="container mx-auto px-4 py-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>

          {/* Popular Courses */}
          <section className="container mx-auto px-4 pb-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Popular Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.slice(0, 12).map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        </>
      )}

      {!showBrowse && (
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <a href="/" className="text-sm text-primary hover:underline">← All Categories</a>
            <h2 className="font-display text-2xl font-bold text-foreground mt-2">
              {searchQuery ? `Search results for "${searchQuery}"` : `${activeCat?.icon} ${activeCat?.name}`}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{filteredCourses.length} courses found</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No courses found. Try a different search.</p>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            QuizVault — 500+ Free Courses & Quizzes. Learn anything, anytime.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
