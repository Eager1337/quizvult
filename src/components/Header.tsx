import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, BookmarkCheck, BarChart3 } from 'lucide-react';

const Header = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
            Q
          </div>
          <span className="font-display text-xl font-bold text-foreground">QuizVault</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search learning paths..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </form>

        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Courses</Link>
          <Link to="/saved" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"><BookmarkCheck className="h-4 w-4" /> Saved</Link>\n          <Link to="/progress" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"><BarChart3 className="h-4 w-4" /> Progress</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
