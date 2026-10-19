const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SESSION_KEY = "quizvault.supabase.session";

export type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: { id: string; email?: string };
};

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function getSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SupabaseSession;
    if (session.expires_at && session.expires_at * 1000 < Date.now() && !session.refresh_token) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: SupabaseSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("quizvault:auth-changed"));
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  let session = authenticated ? getSession() : null;
  if (authenticated && session?.refresh_token && session.expires_at && session.expires_at * 1000 < Date.now() + 60_000) {
    try {
      const refreshed = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST", headers: { apikey: SUPABASE_ANON_KEY!, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (!refreshed.ok) throw new Error("Session refresh failed");
      const next = await refreshed.json() as { access_token: string; refresh_token: string; expires_in: number; user: SupabaseSession["user"] };
      session = { ...next, expires_at: Math.floor(Date.now() / 1000) + next.expires_in };
      saveSession(session);
    } catch { saveSession(null); session = null; }
  }
  const response = await fetch(`${SUPABASE_URL}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.msg || payload?.message || payload?.error_description || "Supabase request failed.");
  return payload as T;
}

export async function signUp(email: string, password: string) {
  const result = await request<{ access_token?: string; refresh_token?: string; expires_in?: number; user: { id: string; email?: string } }>(
    "auth/v1/signup",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
  if (result.access_token) {
    saveSession({ ...result, access_token: result.access_token, user: result.user, expires_at: Math.floor(Date.now() / 1000) + (result.expires_in || 3600) });\n    notifyAuthChanged();
  }
  return result.user;
}

export async function signIn(email: string, password: string) {
  const result = await request<{ access_token: string; refresh_token: string; expires_in: number; user: { id: string; email?: string } }>(
    "auth/v1/token?grant_type=password",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
  saveSession({ ...result, expires_at: Math.floor(Date.now() / 1000) + result.expires_in });
  return result.user;
}

export function signOut() {
  const session = getSession();
  saveSession(null);
  if (session && isSupabaseConfigured) {
    void fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY!, Authorization: `Bearer ${session.access_token}` },
    });
  }
}

export async function saveLearningRecord(table: string, record: Record<string, unknown>) {
  return request(table, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(record),
  }, true);
}

export async function loadLearningRecords<T>(table: string, query = "select=*") {
  return request<T[]>(`rest/v1/${table}?${query}`, {}, true);
}

export async function deleteLearningRecord(table: string, query: string) {
  return request(`rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  }, true);
}

export async function invokeStudyAssistant(payload: Record<string, unknown>) {
  return request<{ result: unknown; generated: true }>(
    "functions/v1/study-assistant",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export function localProgressKey(courseId: string) {
  return `quizvault.progress.${courseId}`;
}
