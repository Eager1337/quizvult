import { useState } from "react";
import { FileText, Sparkles, Upload, BookOpen, Brain, Layers, Loader2 } from "lucide-react";
import { getSession, invokeStudyAssistant, isSupabaseConfigured, signIn, signOut, signUp } from "@/lib/supabase";

type ToolKind = "quiz" | "explanation" | "flashcards" | "summary";
const toolOptions: { id: ToolKind; label: string; icon: typeof Brain }[] = [
  { id: "quiz", label: "Generate quiz", icon: Brain },
  { id: "explanation", label: "Explain a topic", icon: BookOpen },
  { id: "flashcards", label: "Make flashcards", icon: Layers },
  { id: "summary", label: "Summarize notes", icon: FileText },
];

const StudyTools = ({ courseTitle }: { courseTitle: string }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState(getSession()?.user.email || "");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [kind, setKind] = useState<ToolKind>("quiz");
  const [topic, setTopic] = useState(courseTitle);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = authMode === "signup" ? await signUp(email, password) : await signIn(email, password);
      if (authMode === "signup" && !getSession()) {
        setUserEmail("");
        setError("Account created. Check your email to confirm it, then sign in to use AI study tools.");
      } else {
        setUserEmail(user.email || email);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setError("");
    setResult(null);
    if (!getSession()) {
      setError("Sign in before generating study materials.");
      return;
    }
    if (!notes.trim() && !file) {
      setError("Paste your notes or upload a PDF or text file first.");
      return;
    }
    setLoading(true);
    try {
      let fileBase64: string | undefined;
      let mimeType: string | undefined;
      if (file) {
        if (file.size > 9 * 1024 * 1024) throw new Error("Choose a file smaller than 9 MB.");
        if (file.type !== "application/pdf" && file.type !== "text/plain" && !file.name.endsWith(".md")) {
          throw new Error("Supported files: PDF, TXT, or Markdown (.md).");
        }
        mimeType = file.type === "application/pdf" ? "application/pdf" : "text/plain";
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
          reader.onerror = () => reject(new Error("Could not read this file."));
          reader.readAsDataURL(file);
        });
      }
      const response = await invokeStudyAssistant({
        kind,
        topic: topic.trim() || courseTitle,
        sourceText: notes,
        sourceName: file?.name || "Pasted notes",
        ...(fileBase64 ? { fileBase64, mimeType } : {}),
      });
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate study material.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><Sparkles className="h-6 w-6" /></div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">AI Study Studio</h2>
            <p className="mt-1 text-sm text-muted-foreground">Turn your own notes into practice questions, clear explanations, summaries, and flashcards.</p>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-foreground">
            Backend setup required: configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.
          </p>
        )}

        {!userEmail ? (
          <form onSubmit={handleAuth} className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-foreground">Email
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="you@example.com" />
            </label>
            <label className="text-sm font-medium text-foreground">Password
              <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="At least 8 characters" />
            </label>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <button disabled={loading || !isSupabaseConfigured} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {loading ? "Please wait…" : authMode === "signin" ? "Sign in" : "Create account"}
              </button>
              <button type="button" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")} className="text-sm text-primary hover:underline">
                {authMode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted p-3">
            <p className="text-sm text-foreground">Signed in as <strong>{userEmail}</strong></p>
            <button onClick={() => { signOut(); setUserEmail(""); setResult(null); }} className="text-sm text-primary hover:underline">Sign out</button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          {toolOptions.map(option => {
            const Icon = option.icon;
            return <button key={option.id} type="button" onClick={() => setKind(option.id)} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition-colors ${kind === option.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/40"}`}>
              <Icon className="h-4 w-4 shrink-0" />{option.label}
            </button>;
          })}
        </div>

        <label className="mt-5 block text-sm font-medium text-foreground">Topic
          <input value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="What are you studying?" />
        </label>
        <label className="mt-4 block text-sm font-medium text-foreground">Paste notes or source text
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6} maxLength={80000} className="mt-1 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm" placeholder="Paste class notes, a chapter extract, or key concepts here…" />
        </label>
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-4 hover:border-primary/50">
          <Upload className="h-5 w-5 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">{file ? file.name : "Upload a PDF, TXT, or Markdown file"}</span>
            <span className="block text-xs text-muted-foreground">Maximum 9 MB. Your material is sent to the configured AI provider to process.</span>
          </span>
          <input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} />
        </label>
        {file && <button onClick={() => setFile(null)} className="mt-2 text-xs text-muted-foreground underline">Remove file</button>}

        {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        <button type="button" onClick={generate} disabled={loading || !userEmail || (!notes.trim() && !file)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Creating study material…" : "Generate study material"}
        </button>
      </div>

      {result !== null && <div className="rounded-2xl border border-border bg-card p-5 md:p-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" /> AI-generated content · Review for accuracy</div>
        <p className="mt-1 text-xs text-muted-foreground">Created from your supplied material. Check important facts against your course sources.</p>
        <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted p-4 text-sm text-foreground">{JSON.stringify(result, null, 2)}</pre>
      </div>}
    </section>
  );
};

export default StudyTools;
