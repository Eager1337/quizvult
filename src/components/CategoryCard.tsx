import { Link } from 'react-router-dom';
import { Category, getCoursesByCategory } from '@/data/courses';

const CategoryCard = ({ category }: { category: Category }) => {
  const count = getCoursesByCategory(category.id).length;

  return (
    <Link
      to={`/?category=${category.id}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
      style={{ boxShadow: 'var(--card-hover-shadow)' }}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} text-2xl`}>
        {category.icon}
      </div>
      <h3 className="font-display text-sm font-semibold text-foreground text-center">{category.name}</h3>
      <span className="text-xs text-muted-foreground">{count} courses</span>
    </Link>
  );
};

export default CategoryCard;
