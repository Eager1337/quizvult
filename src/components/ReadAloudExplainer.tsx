import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Pause, Play, Radio, Square, Volume2, VolumeX } from "lucide-react";

type SpeechResultEvent = Event & { results: ArrayLike<ArrayLike<{ transcript: string }>>; resultIndex?: number };
type SpeechRecognitionLike = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

type Props = { text: string; onTranscript?: (text: string) => void; title?: string };

const ReadAloudExplainer = ({ text, onTranscript, title = "Listen and explore" }: Props) => {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [voiceName, setVoiceName] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voices = useMemo(() => typeof window === "undefined" || !("speechSynthesis" in window) ? [] : window.speechSynthesis.getVoices(), []);
  const scenes = useMemo(() => text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean).slice(0, 24), [text]);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const recognitionSupported = typeof window !== "undefined" && Boolean((window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
  }, []);

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false); setPaused(false); setSceneIndex(0);
  };
  const readAloud = () => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 12000));
    utterance.rate = rate;
    const voice = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { setSpeaking(true); setPaused(false); setSceneIndex(0); };
    utterance.onboundary = event => {
      const before = text.slice(0, event.charIndex).split(/(?<=[.!?])\s+|\n+/).filter(s => s.trim()).length;
      setSceneIndex(Math.min(Math.max(before, 0), Math.max(scenes.length - 1, 0)));
    };
    utterance.onend = () => { setSpeaking(false); setPaused(false); setSceneIndex(0); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utterance);
  };
  const togglePause = () => {
    if (!speaking) { readAloud(); return; }
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };
  const toggleDictation = () => {
    if (dictating) { recognitionRef.current?.stop(); setDictating(false); return; }
    const Recognition = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = event => {
      const last = event.results.length - 1;
      if (last >= 0) onTranscript?.(event.results[last][0].transcript);
    };
    recognition.onerror = () => setDictating(false);
    recognition.onend = () => setDictating(false);
    recognitionRef.current = recognition;
    try { recognition.start(); setDictating(true); } catch { setDictating(false); }
  };

  if (!text.trim() && !onTranscript) return null;
  return <section className="mt-4 rounded-2xl border border-border bg-card p-4" aria-label="Voice and animated explainer tools">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><Volume2 className="h-5 w-5 text-primary" /><h3 className="font-semibold">{title}</h3></div>
      <div className="flex flex-wrap gap-2">
        {onTranscript && <button type="button" onClick={toggleDictation} disabled={!recognitionSupported} className={"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold " + (dictating ? "border-destructive text-destructive" : "border-border hover:border-primary/50")} title={recognitionSupported ? "Dictate using your microphone" : "Voice typing is not supported by this browser"}>
          {dictating ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{dictating ? "Stop dictation" : "Speak to type"}
        </button>}
        <button type="button" onClick={togglePause} disabled={!supported || !text.trim()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {speaking && !paused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{speaking ? paused ? "Resume" : "Pause" : "Read aloud"}
        </button>
        {speaking && <button type="button" onClick={stopReading} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><Square className="h-3.5 w-3.5" />Stop</button>}
      </div>
    </div>
    {speaking && <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Radio className="h-3.5 w-3.5 animate-pulse text-primary" />Narration playing · scene {Math.min(sceneIndex + 1, scenes.length)} of {scenes.length}</div>}
    {supported && <div className="mt-3 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">Speed
        <select value={rate} onChange={e => setRate(Number(e.target.value))} className="rounded-md border border-border bg-background px-2 py-1 text-foreground"><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.15}>1.15×</option><option value={1.35}>1.35×</option></select>
      </label>
      {voices.length > 0 && <label className="flex items-center gap-2 text-xs text-muted-foreground">Voice
        <select value={voiceName} onChange={e => setVoiceName(e.target.value)} className="max-w-56 rounded-md border border-border bg-background px-2 py-1 text-foreground"><option value="">Default voice</option>{voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}</select>
      </label>}
    </div>}
    {onTranscript && !recognitionSupported && <p className="mt-2 text-xs text-muted-foreground">Voice typing is not available in this browser. Try a browser with Web Speech API support and allow microphone access.</p>}
    <div className="mt-4">
      <button type="button" onClick={() => setExplainerOpen(v => !v)} disabled={!scenes.length} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><VolumeX className="h-4 w-4" />{explainerOpen ? "Hide animated explainer" : "Show animated explainer"}</button>
      {explainerOpen && scenes.length > 0 && <div className="relative mt-3 min-h-64 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 text-white sm:p-8">
        <div className="absolute -right-8 -top-8 h-36 w-36 animate-pulse rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 animate-pulse rounded-full bg-fuchsia-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">Animated explainer</span><span className="text-xs text-slate-300">{sceneIndex + 1} / {scenes.length}</span></div>
          <div className="mt-6 flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/15 ring-1 ring-cyan-200/40"><Volume2 className="h-6 w-6 text-cyan-200" /></div><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 transition-all duration-500" style={{ width: (((sceneIndex + 1) / scenes.length) * 100) + "%" }} /></div></div>
          <p key={sceneIndex} className="mt-6 min-h-20 animate-in fade-in slide-in-from-bottom-2 text-xl font-semibold leading-relaxed sm:text-2xl">{scenes[sceneIndex]}</p>
          <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => { if (sceneIndex > 0) setSceneIndex(v => v - 1); }} disabled={sceneIndex === 0} className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-40">Previous scene</button><button type="button" onClick={() => { if (sceneIndex < scenes.length - 1) setSceneIndex(v => v + 1); else setSceneIndex(0); }} className="rounded-lg bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950">{sceneIndex < scenes.length - 1 ? "Next scene" : "Restart scenes"}</button><button type="button" onClick={readAloud} className="rounded-lg border border-white/20 px-3 py-2 text-sm">Narrate all scenes</button></div>
          <p className="mt-4 text-xs text-slate-300">Captioned animated scene view. Narration uses your browser's available voice; this is not an exported MP4 video.</p>
        </div>
      </div>}
    </div>
  </section>;
};

export default ReadAloudExplainer;
