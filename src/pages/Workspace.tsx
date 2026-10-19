import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine, CalendarDays,
  Compass, FileText, FolderKanban, GraduationCap, LoaderCircle, LockKeyhole,
  MapPin, Plus, Sparkles, Trash2, UploadCloud, WandSparkles, X,
} from "lucide-react";
import Header from "@/components/Header";
import ReadAloudExplainer from "@/components/ReadAloudExplainer";
import { getSession, isSupabaseConfigured, signIn, signOut, signUp, type SupabaseSession } from "@/lib/supabase";

type WorkspaceKind = "task" | "project" | "journey" | "trip" | "note";
type WorkspaceItem = { id: string; user_id?: string; kind: WorkspaceKind; title: string; content: Record<string, unknown>; created_at: string; updated_at?: string };
type WorkspaceFile = { id: string; name: string; storage_path: string; mime_type: string; size_bytes: number; created_at: string };
type Tab = "overview" | "files" | "tasks" | "projects" | "journey" | "travel" | "ai";
const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "overview", label: "Overview", icon: Compass }, { id: "files", label: "My files", icon: FileText },
  { id: "tasks", label: "Tasks & calendar", icon: CalendarDays }, { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "journey", label: "My journey", icon: MapPin }, { id: "travel", label: "Travel", icon: MapPin },
  { id: "ai", label: "AI document tools", icon: Sparkles },
];
const localKey = "quizvault.workspace.items";
const fmtDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const Workspace = () => {
  const [session, setSession] = useState<SupabaseSession | null>(() => getSession());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [profileType, setProfileType] = useState("Personal");
  const [tab, setTab] = useState<Tab>("overview");
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [destination, setDestination] = useState("");
  const [fileBusy, setFileBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const loadLocalItems = () => {
    try { return JSON.parse(localStorage.getItem(localKey) || "[]") as WorkspaceItem[]; } catch { return []; }
  };
  const persistLocalItems = (next: WorkspaceItem[]) => {
    setItems(next);
    localStorage.setItem(localKey, JSON.stringify(next));
  };

  const refreshWorkspace = async (activeSession = session) => {
    if (!activeSession || !isSupabaseConfigured) { setItems(loadLocalItems()); setFiles([]); return; }
    const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!base || !key) return;
    const headers = { apikey: key, Authorization: `Bearer ${activeSession.access_token}` };
    try {
      const [itemResponse, fileResponse] = await Promise.all([
        fetch(`${base}/rest/v1/workspace_items?select=*&order=updated_at.desc`, { headers }),
        fetch(`${base}/rest/v1/workspace_files?select=*&order=created_at.desc`, { headers }),
      ]);
      if (!itemResponse.ok || !fileResponse.ok) throw new Error("Workspace tables are not ready. Apply the latest Supabase migration.");
      const cloudItems = await itemResponse.json() as WorkspaceItem[];
      const cloudFiles = await fileResponse.json() as WorkspaceFile[];
      setItems(cloudItems);
      setFiles(cloudFiles);
      localStorage.setItem(localKey, JSON.stringify(cloudItems));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load cloud workspace.");
      setItems(loadLocalItems());
    }
  };

  useEffect(() => {
    void refreshWorkspace(session);
    const onAuth = () => { const next = getSession(); setSession(next); void refreshWorkspace(next); };
    window.addEventListener("quizvault:auth-changed", onAuth);
    return () => window.removeEventListener("quizvault:auth-changed", onAuth);
  }, [session?.user.id]);

  const saveItem = async (kind: WorkspaceKind, itemTitle: string, content: Record<string, unknown>) => {
    if (!itemTitle.trim()) { setError("Add a title first."); return; }
    const now = new Date().toISOString();
    const item: WorkspaceItem = { id: crypto.randomUUID(), kind, title: itemTitle.trim(), content, created_at: now, updated_at: now };
    setError(""); setNotice("");
    if (session && isSupabaseConfigured) {
      const base = import.meta.env.VITE_SUPABASE_URL as string;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      try {
        const response = await fetch(`${base}/rest/v1/workspace_items`, {
          method: "POST", headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({ user_id: session.user.id, kind, title: item.title, content }),
        });
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || "Could not save item to your account.");
        const saved = await response.json() as WorkspaceItem[];
        const next = [saved[0] || item, ...items];
        setItems(next); localStorage.setItem(localKey, JSON.stringify(next));
      } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); return; }
    } else persistLocalItems([item, ...items]);
    setTitle(""); setDetails(""); setDueDate(""); setDestination(""); setNotice("Saved to your workspace.");
  };

  const deleteItem = async (item: WorkspaceItem) => {
    if (session && isSupabaseConfigured) {
      const base = import.meta.env.VITE_SUPABASE_URL as string;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const response = await fetch(`${base}/rest/v1/workspace_items?id=eq.${encodeURIComponent(item.id)}`, {
        method: "DELETE", headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) { setError("Could not delete this item."); return; }
    }
    const next = items.filter(x => x.id !== item.id); setItems(next); localStorage.setItem(localKey, JSON.stringify(next));
  };

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError("For this first version, files must be 50 MB or smaller."); return; }
    if (!session || !isSupabaseConfigured) { setError("Sign in with a configured Supabase account to securely upload files. Local-only files are not uploaded."); return; }
    setFileBusy(true); setError(""); setNotice("");
    const base = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const storagePath = `${session.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    try {
      const upload = await fetch(`${base}/storage/v1/object/quizvault-private/${storagePath.split("/").map(encodeURIComponent).join("/")}`, {
        method: "POST", headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }, body: file,
      });
      if (!upload.ok) throw new Error((await upload.json().catch(() => null))?.message || "Upload failed. Check the private storage bucket and policies.");
      const metadata = await fetch(`${base}/rest/v1/workspace_files`, {
        method: "POST", headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({ user_id: session.user.id, name: file.name, storage_path: storagePath, mime_type: file.type || "application/octet-stream", size_bytes: file.size }),
      });
      if (!metadata.ok) throw new Error("The file uploaded, but its metadata could not be saved. Contact the workspace administrator.");
      setFiles([...(await metadata.json() as WorkspaceFile[]), ...files]); setNotice("File uploaded to your private workspace.");
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setFileBusy(false); }
  };

  const downloadFile = async (file: WorkspaceFile) => {
    if (!session) return;
    const base = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const response = await fetch(`${base}/storage/v1/object/quizvault-private/${file.storage_path.split("/").map(encodeURIComponent).join("/")}`, {
      headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
    });
    if (!response.ok) { setError("Could not download file. Check storage permissions."); return; }
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = file.name; anchor.click(); URL.revokeObjectURL(url);
  };

  const deleteFile = async (file: WorkspaceFile) => {
    if (!session) return;
    const base = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const headers = { apikey: key, Authorization: `Bearer ${session.access_token}` };
    const response = await fetch(`${base}/storage/v1/object/quizvault-private/${file.storage_path.split("/").map(encodeURIComponent).join("/")}`, { method: "DELETE", headers });
    if (!response.ok) { setError("Could not delete this file."); return; }
    await fetch(`${base}/rest/v1/workspace_files?id=eq.${encodeURIComponent(file.id)}`, { method: "DELETE", headers });
    setFiles(files.filter(f => f.id !== file.id)); setNotice("File deleted.");
  };

  const runAI = async (mode: "summary" | "explanation") => {
    if (!aiText.trim()) { setError("Paste text or notes first."); return; }
    if (!session) { setError("Sign in to use AI document tools."); return; }
    setAiBusy(true); setError(""); setAiResult("");
    try {
      const base = import.meta.env.VITE_SUPABASE_URL as string;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const response = await fetch(`${base}/functions/v1/study-assistant`, {
        method: "POST", headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ kind: mode, topic: "Personal document assistant", sourceText: aiText, sourceName: "Pasted document text" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || payload?.message || "AI request failed.");
      const content = payload?.result ?? payload;
      setAiResult(typeof content === "string" ? content : JSON.stringify(content, null, 2));
    } catch (e) { setError(e instanceof Error ? e.message : "AI assistant failed."); }
    finally { setAiBusy(false); }
  };

  const counts = useMemo(() => ({
    tasks: items.filter(i => i.kind === "task" && !i.content.completed).length,
    projects: items.filter(i => i.kind === "project").length,
    journeys: items.filter(i => i.kind === "journey").length,
    trips: items.filter(i => i.kind === "trip").length,
  }), [items]);
  const upcoming = items.filter(i => i.kind === "task" && typeof i.content.dueDate === "string" && i.content.dueDate).sort((a,b) => String(a.content.dueDate).localeCompare(String(b.content.dueDate))).slice(0,5);
  const visibleItems = tab === "tasks" ? items.filter(i => i.kind === "task") : tab === "projects" ? items.filter(i => i.kind === "project") : tab === "journey" ? items.filter(i => i.kind === "journey") : tab === "travel" ? items.filter(i => i.kind === "trip") : [];

  const doAuth = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (!isSupabaseConfigured) throw new Error("Account access needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the deployment environment.");
      if (authMode === "signup") await signUp(email, password); else await signIn(email, password);
      const next = getSession(); setSession(next);
      if (!next) setNotice("Check your email for a confirmation link, then sign in.");
      else { setNotice("Welcome to your workspace."); await refreshWorkspace(next); }
    } catch (e) { setError(e instanceof Error ? e.message : "Authentication failed."); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-background"><Header />
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[.18em] text-primary">Your space, your pace</p><h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Personal workspace</h1><p className="mt-2 max-w-2xl text-muted-foreground">One private place for your documents, plans, projects, travels, and learning.</p></div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm"><LockKeyhole className="h-4 w-4 text-primary" /> {session ? session.user.email : "Local preview"} <span className="text-muted-foreground">·</span><span>{profileType}</span></div>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">{tabs.map(t => { const Icon = t.icon; return <button key={t.id} onClick={() => { setTab(t.id); setError(""); setNotice(""); }} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4" />{t.label}</button>; })}</div>
      {(error || notice) && <div className={`mb-5 flex items-start justify-between gap-3 rounded-xl border p-3 text-sm ${error ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-primary/30 bg-primary/5 text-foreground"}`}><span>{error || notice}</span><button onClick={() => { setError(""); setNotice(""); }} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>}
      {!session && <form onSubmit={doAuth} className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
        <div><label className="mb-1 block text-xs font-semibold text-muted-foreground">Email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="you@example.com" /></div>
        <div><label className="mb-1 block text-xs font-semibold text-muted-foreground">Password</label><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="At least 8 characters" /></div>
        <button disabled={busy} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Please wait…" : authMode === "signup" ? "Create account" : "Sign in"}</button>
        <button type="button" onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")} className="h-10 px-2 text-sm font-semibold text-primary">{authMode === "signup" ? "I have an account" : "Create account"}</button>
      </form>}
      {session && <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"><span className="text-sm text-muted-foreground">Cloud sync is active for this account when Supabase is configured.</span><button onClick={() => { signOut(); setSession(null); setFiles([]); setItems(loadLocalItems()); }} className="text-sm font-semibold text-primary">Sign out</button></div>}
      {tab === "overview" && <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{label:"Files",value:files.length,icon:FileText},{label:"Open tasks",value:counts.tasks,icon:CalendarDays},{label:"Projects",value:counts.projects,icon:FolderKanban},{label:"Journey & trips",value:counts.journeys+counts.trips,icon:Compass}].map((c,i)=>{const Icon=c.icon;return <div key={i} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>{c.label}</span><Icon className="h-4 w-4 text-primary" /></div><p className="mt-3 font-display text-3xl font-bold">{c.value}</p></div>;})}</div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><section className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Upcoming tasks</h2><button onClick={()=>setTab("tasks")} className="text-sm font-semibold text-primary">View all</button></div>{upcoming.length ? <div className="mt-4 space-y-3">{upcoming.map(item=><div key={item.id} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3"><CalendarDays className="mt-1 h-4 w-4 text-primary"/><div className="min-w-0 flex-1"><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{String(item.content.dueDate)}{item.content.details ? " · "+String(item.content.details):""}</p></div></div>)}</div>:<p className="mt-4 rounded-xl bg-muted/60 p-5 text-sm text-muted-foreground">No tasks yet. Add your next deadline below.</p>}</section>
          <section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">Quick actions</h2><div className="mt-4 grid grid-cols-2 gap-3">{[{label:"Upload a file",icon:UploadCloud,action:()=>setTab("files")},{label:"New task",icon:CalendarDays,action:()=>setTab("tasks")},{label:"New project",icon:FolderKanban,action:()=>setTab("projects")},{label:"Plan a trip",icon:MapPin,action:()=>setTab("travel")}].map(a=>{const Icon=a.icon;return <button key={a.label} onClick={a.action} className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-border p-3 text-left hover:border-primary/50"><Icon className="h-5 w-5 text-primary"/><span className="text-sm font-semibold">{a.label}</span></button>;})}</div></section></div>
      </>}
      {tab === "files" && <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]"><section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">Private documents</h2><p className="mt-2 text-sm text-muted-foreground">Upload files into your account-only storage. Up to 50 MB per file in this version.</p><label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-primary/40 bg-primary/5 p-7 text-center"><UploadCloud className="h-8 w-8 text-primary"/><span className="mt-2 font-semibold">{fileBusy ? "Uploading…" : "Choose a file"}</span><span className="mt-1 text-xs text-muted-foreground">PDF, images, documents, or other files</span><input type="file" className="hidden" disabled={fileBusy} onChange={uploadFile}/></label>{!session && <p className="mt-3 text-xs text-muted-foreground">Sign in to upload and retrieve private cloud files.</p>}</section><section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">Your files <span className="text-sm font-normal text-muted-foreground">({files.length})</span></h2>{files.length ? <div className="mt-4 divide-y divide-border">{files.map(file=><div key={file.id} className="flex items-center gap-3 py-3"><div className="rounded-lg bg-primary/10 p-2"><FileText className="h-5 w-5 text-primary"/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size_bytes/1024/1024).toFixed(2)} MB · {fmtDate(file.created_at)}</p></div><button onClick={()=>void downloadFile(file)} aria-label={`Download ${file.name}`} className="rounded-lg p-2 hover:bg-muted"><ArrowDownToLine className="h-4 w-4"/></button><button onClick={()=>void deleteFile(file)} aria-label={`Delete ${file.name}`} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4"/></button></div>)}</div>:<p className="mt-4 rounded-xl bg-muted/60 p-5 text-sm text-muted-foreground">Your uploaded files will appear here.</p>}</section></div>}
      {["tasks","projects","journey","travel"].includes(tab) && <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><form onSubmit={e=>{e.preventDefault();const kind:WorkspaceKind=tab==="tasks"?"task":tab==="projects"?"project":tab==="journey"?"journey":"trip";void saveItem(kind,title,{details,dueDate:tab==="tasks"?dueDate:"",destination:tab==="travel"?destination:"",profileType,completed:false});}} className="h-fit rounded-2xl border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">{tab==="tasks"?"Add a task":tab==="projects"?"Start a project":tab==="journey"?"Add a milestone":"Plan a trip"}</h2><label className="mt-4 block text-xs font-semibold text-muted-foreground">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} required placeholder={tab==="travel"?"e.g. Freetown to London":tab==="journey"?"e.g. Launch my business":"What do you want to do?"} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"/>{tab==="travel"&&<><label className="mt-3 block text-xs font-semibold text-muted-foreground">Destination / route</label><input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Destination or route" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"/></>}{tab==="tasks"&&<><label className="mt-3 block text-xs font-semibold text-muted-foreground">Due date</label><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"/></>}<label className="mt-3 block text-xs font-semibold text-muted-foreground">Notes / details</label><textarea value={details} onChange={e=>setDetails(e.target.value)} rows={4} placeholder="Add context, next steps, or important details…" className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm"/><label className="mt-3 block text-xs font-semibold text-muted-foreground">Workspace type</label><select value={profileType} onChange={e=>setProfileType(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option>Personal</option><option>Student</option><option>Professional</option><option>Business owner</option><option>Job seeker</option><option>Traveler</option></select><button disabled={busy} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4"/>Save to workspace</button></form><section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">{tab==="tasks"?"Your tasks":tab==="projects"?"Your projects":tab==="journey"?"Journey milestones":"Travel plans"}</h2>{visibleItems.length ? <div className="mt-4 space-y-3">{visibleItems.map(item=><article key={item.id} className="rounded-xl border border-border p-4"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h3 className="font-semibold">{item.title}</h3>{item.content.destination&&<p className="mt-1 text-sm text-primary"><MapPin className="mr-1 inline h-3 w-3"/>{String(item.content.destination)}</p>}{item.content.dueDate&&<p className="mt-1 text-xs text-muted-foreground">Due {String(item.content.dueDate)}</p>}{item.content.details&&<p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{String(item.content.details)}</p>}<p className="mt-2 text-xs text-muted-foreground">Created {fmtDate(item.created_at)}</p></div><button onClick={()=>void deleteItem(item)} aria-label={`Delete ${item.title}`} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4"/></button></div></article>)}</div>:<p className="mt-4 rounded-xl bg-muted/60 p-5 text-sm text-muted-foreground">Nothing here yet. Add your first item using the form.</p>}</section></div>}
      {tab === "ai" && <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><section className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><WandSparkles className="h-5 w-5 text-primary"/><h2 className="font-display text-xl font-bold">AI document assistant</h2></div><p className="mt-2 text-sm text-muted-foreground">Paste text from a document to summarize it or ask for a clearer explanation. Avoid pasting passwords, financial account credentials, or other highly sensitive data.</p><textarea value={aiText} onChange={e=>setAiText(e.target.value)} rows={12} placeholder="Paste document text, meeting notes, a letter, or a report…" className="mt-4 w-full rounded-xl border border-input bg-background p-3 text-sm"/><ReadAloudExplainer text="" onTranscript={spoken => setAiText(previous => (previous ? previous + " " : "") + spoken)} title="Dictate your document" /><div className="mt-3 flex flex-wrap gap-2"><button disabled={aiBusy} onClick={()=>void runAI("summary")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{aiBusy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}Summarize document</button><button disabled={aiBusy} onClick={()=>void runAI("explanation")} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Explain in simple terms</button></div></section><section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">AI result</h2>{aiResult?<><pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{aiResult}</pre><ReadAloudExplainer text={aiResult} title="Listen to your explanation" /></>:<div className="mt-4 rounded-xl bg-muted/60 p-8 text-center"><Sparkles className="mx-auto h-8 w-8 text-primary"/><p className="mt-3 text-sm text-muted-foreground">Your summary or explanation will appear here. You can listen to it or open the animated explainer after generating a result.</p></div>}</section></div>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground"><span>Learning tools remain available in their own module.</span><Link to="/" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"><GraduationCap className="h-4 w-4"/>Open learning catalogue</Link></div>
    </div>
  </div>;
};

export default Workspace;
