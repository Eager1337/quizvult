import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, BookmarkCheck, BarChart3, LayoutDashboard } from "lucide-react";

const Header = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">Q</div>
          <span className="font-display text-xl font-bold text-foreground">QuizVault</span>
        </Link>
        <form onSubmit={handleSearch} className="hidden w-72 items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search learning paths..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
        </form>
        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-4">
          <Link to="/workspace" aria-label="Personal workspace" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80"><LayoutDashboard className="h-4 w-4" /><span>Workspace</span></Link>
          <Link to="/" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">Learn</Link>
          <Link to="/saved" aria-label="Saved learning paths" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><BookmarkCheck className="h-4 w-4" /><span className="hidden md:inline">Saved</span></Link>
          <Link to="/progress" aria-label="Learning progress" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><BarChart3 className="h-4 w-4" /><span className="hidden md:inline">Progress</span></Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
