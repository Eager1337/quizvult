import { useEffect, useState } from "react";
import { FileText, Sparkles, Upload, BookOpen, Brain, Layers, Loader2 } from "lucide-react";
import { getSession, invokeStudyAssistant, isSupabaseConfigured, loadLearningRecords, signIn, signOut, signUp } from "@/lib/supabase";

type ToolKind = "quiz" | "explanation" | "flashcards" | "summary";\ntype SavedArtifact = { id: string; title: string; artifact_type: ToolKind; created_at: string; generated_content: unknown };
const toolOptions: { id: ToolKind; label: string; icon: typeof Brain }[] = [
  { id: "quiz", label: "Generate quiz", icon: Brain },
  { id: "explanation", label: "Explain a topic", icon: BookOpen },
  { id: "flashcards", label: "Make flashcards", icon: Layers },
  { id: "summary", label: "Summarize notes", icon: FileText },
];

type AIQuestion = { question: string; options: string[]; correctIndex: number; explanation?: string };
type AICard = { front: string; back: string };

const GeneratedContentView = ({ kind, payload }: { kind: ToolKind; payload: unknown }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const title = typeof data.title === "string" ? data.title : "Study material";
  const questions = Array.isArray(data.questions) ? data.questions.filter((item): item is AIQuestion =>
    Boolean(item && typeof item === "object" && typeof (item as AIQuestion).question === "string" &&
      Array.isArray((item as AIQuestion).options) && Number.isInteger((item as AIQuestion).correctIndex) &&
      (item as AIQuestion).correctIndex >= 0 && (item as AIQuestion).correctIndex < (item as AIQuestion).options.length)
  ) : [];
  const cards = Array.isArray(data.cards) ? data.cards.filter((item): item is AICard =>
    Boolean(item && typeof item === "object" && typeof (item as AICard).front === "string" && typeof (item as AICard).back === "string")
  ) : [];
  const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.correctIndex ? 1 : 0), 0);

  if (kind === "quiz" && questions.length) return <div className="mt-5 space-y-5">
    <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
    <p className="text-xs text-muted-foreground">AI-generated practice quiz · Check the explanations and verify important facts with your source material.</p>
    {questions.map((question, index) => <article key={index} className="rounded-xl border border-border p-4">
      <p className="font-semibold text-foreground">{index + 1}. {question.question}</p>
      <div className="mt-3 space-y-2">
        {question.options.map((option, optionIndex) => {
          const isCorrect = submitted && optionIndex === question.correctIndex;
          const isWrongChoice = submitted && answers[index] === optionIndex && optionIndex !== question.correctIndex;
          return <button key={optionIndex} type="button" disabled={submitted} onClick={() => setAnswers(previous => ({ ...previous, [index]: optionIndex }))} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm ${isCorrect ? "border-emerald-500 bg-emerald-500/10" : isWrongChoice ? "border-destructive bg-destructive/10" : answers[index] === optionIndex ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs">{String.fromCharCode(65 + optionIndex)}</span>{option}
          </button>;
        })}
      </div>
      {submitted && <p className="mt-3 text-sm text-muted-foreground"><strong>Explanation:</strong> {question.explanation || "Review this answer against your notes."}</p>}
    </article>)}
    {!submitted ? <button type="button" onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== questions.length} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">Submit answers</button> : <div className="rounded-xl bg-primary/10 p-4"><p className="font-display text-2xl font-bold text-primary">{score} / {questions.length} correct</p><button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }} className="mt-3 text-sm font-semibold text-primary hover:underline">Try again</button></div>}
  </div>;

  if (kind === "flashcards" && cards.length) return <div className="mt-5 space-y-4">
    <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
    <p className="text-xs text-muted-foreground">AI-generated flashcards · Select a card to reveal or hide the answer.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card, index) => <button key={index} type="button" onClick={() => setFlipped(previous => ({ ...previous, [index]: !previous[index] }))} className="min-h-32 rounded-xl border border-border bg-background p-4 text-left hover:border-primary/50">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">{flipped[index] ? "Answer" : `Card ${index + 1} · Question`}</span>
        <span className="mt-2 block text-sm leading-relaxed text-foreground">{flipped[index] ? card.back : card.front}</span>
        <span className="mt-3 block text-xs text-muted-foreground">{flipped[index] ? "Click to see question" : "Click to reveal answer"}</span>
      </button>)}
    </div>
  </div>;

  const keyPoints = strings(data.keyPoints);
  const limitations = strings(data.limitations);
  const terms = Array.isArray(data.terms) ? data.terms.filter((item): item is { term: string; definition: string } =>
    Boolean(item && typeof item === "object" && typeof (item as {term?: unknown}).term === "string" && typeof (item as {definition?: unknown}).definition === "string")
  ) : [];
  const bodyText = [data.summary, data.explanation].filter((item): item is string => typeof item === "string");
  return <div className="mt-5 space-y-5">
    <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
    {bodyText.map((text, index) => <p key={index} className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>)}
    {typeof data.example === "string" && <section className="rounded-xl bg-muted p-4"><h4 className="font-semibold text-foreground">Example</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{data.example}</p></section>}
    {keyPoints.length > 0 && <section><h4 className="font-semibold text-foreground">Key points</h4><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-foreground">{keyPoints.map((point, index) => <li key={index}>{point}</li>)}</ul></section>}
    {terms.length > 0 && <section><h4 className="font-semibold text-foreground">Key terms</h4><dl className="mt-2 space-y-3">{terms.map((term, index) => <div key={index}><dt className="text-sm font-semibold text-foreground">{term.term}</dt><dd className="mt-1 text-sm text-muted-foreground">{term.definition}</dd></div>)}</dl></section>}
    {limitations.length > 0 && <section><h4 className="font-semibold text-foreground">Limitations and caveats</h4><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-foreground">{limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
    {typeof data.sourceNotes === "string" && <p className="rounded-lg border border-border p-3 text-xs text-muted-foreground">Source notes: {data.sourceNotes}</p>}
    {!bodyText.length && !keyPoints.length && !terms.length && !cards.length && !questions.length && <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted p-4 text-sm text-foreground">{JSON.stringify(payload, null, 2)}</pre>}
  </div>;
};

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
  const [loading, setLoading] = useState(false);\n  const [artifacts, setArtifacts] = useState<SavedArtifact[]>([]);\n  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!userEmail || !getSession() || !isSupabaseConfigured) {
      setArtifacts([]);
      return;
    }
    let active = true;
    setHistoryLoading(true);
    void loadLearningRecords<SavedArtifact>("ai_study_artifacts", "select=id,title,artifact_type,created_at,generated_content&order=created_at.desc&limit=10")
      .then(items => { if (active) setArtifacts(items); })
      .catch(loadError => console.error("Could not load saved study materials", loadError))
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [userEmail]);


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
      setResult(response);\n      const saved = await loadLearningRecords<SavedArtifact>("ai_study_artifacts", "select=id,title,artifact_type,created_at,generated_content&order=created_at.desc&limit=10");\n      setArtifacts(saved);
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

      {userEmail && <section className="rounded-2xl border border-border bg-card p-5 md:p-7">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-display text-lg font-bold text-foreground">Recent study materials</h3><p className="mt-1 text-xs text-muted-foreground">Your latest AI-generated materials saved to your account.</p></div>{historyLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}</div>
        {!historyLoading && artifacts.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Your generated summaries, quizzes, explanations, and flashcards will appear here.</p>}
        <div className="mt-4 space-y-2">
          {artifacts.map(artifact => <button key={artifact.id} type="button" onClick={() => { setTopic(artifact.title); setKind(artifact.artifact_type); setResult({ result: artifact.generated_content, generated: true, label: "AI-generated — review for accuracy" }); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left hover:border-primary/50">
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{artifact.title}</span><span className="mt-1 block text-xs capitalize text-muted-foreground">{artifact.artifact_type} · {new Date(artifact.created_at).toLocaleDateString()}</span></span><span className="shrink-0 text-xs font-semibold text-primary">Open</span>
          </button>)}
        </div>
      </section>}

      {result !== null && <div className="rounded-2xl border border-border bg-card p-5 md:p-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" /> AI-generated content · Review for accuracy</div>
        <p className="mt-1 text-xs text-muted-foreground">Created from your supplied material. Check important facts against your course sources.</p>
        <GeneratedContentView kind={kind} payload={(result as { result?: unknown }).result ?? result} />
      </div>}
    </section>
  );
};

export default StudyTools;
