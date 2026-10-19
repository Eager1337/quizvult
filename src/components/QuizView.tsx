import { useEffect, useMemo, useState } from "react";
import { Question } from "@/data/courses";
import { deleteLearningRecord, getSession, loadLearningRecords, localProgressKey, saveLearningRecord } from "@/lib/supabase";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Bookmark, Clock3, AlertTriangle } from "lucide-react";

type AnswerReview = { question: Question; selected: number; correct: boolean };
type LocalProgress = { attempts: number; bestScore: number; completedAt?: string };

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const shuffleQuestionOptions = (question: Question): Question => {
  const options = shuffle(question.options.map((option, originalIndex) => ({
    option,
    wasCorrect: originalIndex === question.correctIndex,
  })));
  return {
    ...question,
    options: options.map(item => item.option),
    correctIndex: options.findIndex(item => item.wasCorrect),
  };
};

const getBookmarks = (courseId: string): Question[] => {
  try { return JSON.parse(localStorage.getItem(`quizvault.bookmarks.${courseId}`) || "[]") as Question[]; }
  catch { return []; }
};

const questionHash = (question: string) =>
  btoa(unescape(encodeURIComponent(question))).replace(/[^a-zA-Z0-9]/g, "").slice(0, 60);

const QuizView = ({
  questions,
  courseTitle,
  courseId,
  difficulty = "Beginner",
  mode = "practice",
  examMinutes = 10,
}: {
  questions: Question[];
  courseTitle: string;
  courseId: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  mode?: "practice" | "timed";
  examMinutes?: number;
}) => {
  const questionLimit = difficulty === "Beginner" ? 10 : difficulty === "Intermediate" ? 20 : 30;
  const [runId, setRunId] = useState(0);
  const quizQuestions = useMemo(() => {
    const eligible = questions.filter(question => {
      if (!question.difficulty) return true;
      return question.difficulty === difficulty;
    });
    const pool = eligible.length ? eligible : questions;
    return shuffle(pool).slice(0, Math.min(questionLimit, pool.length)).map(shuffleQuestionOptions);
  }, [questions, questionLimit, difficulty, runId]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerReview[]>([]);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(examMinutes * 60);
  const [bookmarks, setBookmarks] = useState<Question[]>(() => getBookmarks(courseId));
  const [reviewWrong, setReviewWrong] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    void loadLearningRecords<{ question_data: Question }>("question_bookmarks", `select=question_hash,question_data&course_id=eq.${encodeURIComponent(courseId)}`)
      .then(records => {
        const local = getBookmarks(courseId);
        const remoteQuestions = new Set(records.map(record => record.question_data.question));
        const merged = [...new Map([...local, ...records.map(record => record.question_data)].map(item => [item.question, item])).values()];
        setBookmarks(merged);
        localStorage.setItem(`quizvault.bookmarks.${courseId}`, JSON.stringify(merged));
        const session = getSession();
        if (session) {
          for (const question of local) {
            if (!remoteQuestions.has(question.question)) {
              void saveLearningRecord("rest/v1/question_bookmarks", {
                user_id: session.user.id, course_id: courseId, question_hash: questionHash(question.question),
                question_text: question.question, question_data: question,
              }).catch(error => console.error("Could not backfill question bookmark", error));
            }
          }
        }
      })
      .catch(error => console.error("Could not load synced bookmarks", error));
  }, [courseId]);

  const q = quizQuestions[currentQ];
  const score = answers.filter(a => a.correct).length;
  const isBookmarked = q ? bookmarks.some(item => item.question === q.question) : false;

  useEffect(() => {
    if (mode !== "timed" || finished) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds(seconds => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, finished, runId]);

  useEffect(() => {
    if (!finished || !quizQuestions.length) return;
    const correctCount = answers.filter(a => a.correct).length;
    const percent = Math.round((correctCount / quizQuestions.length) * 100);
    try {
      const key = localProgressKey(courseId);
      const previous = JSON.parse(localStorage.getItem(key) || '{"attempts":0,"bestScore":0}') as LocalProgress;
      localStorage.setItem(key, JSON.stringify({ attempts: previous.attempts + 1, bestScore: Math.max(previous.bestScore, percent), completedAt: new Date().toISOString() }));
    } catch { /* local progress is a best-effort offline fallback */ }

    const session = getSession();
    if (session) {
      void saveLearningRecord("rest/v1/quiz_attempts", {
        user_id: session.user.id,
        course_id: courseId,
        mode,
        difficulty,
        question_count: quizQuestions.length,
        correct_count: correctCount,
        score_percent: percent,
        incorrect_question_ids: answers.filter(a => !a.correct).map(a => a.question.question),
        duration_seconds: mode === "timed" ? Math.max(0, examMinutes * 60 - remainingSeconds) : null,
      }).catch(error => console.error("Could not save quiz attempt", error));
    }
  }, [finished, answers, courseId, difficulty, examMinutes, mode, quizQuestions, remainingSeconds]);

  const handleSelect = (index: number) => {
    if (answered || !q) return;
    setSelected(index);
    setAnswered(true);
    setAnswers(previous => [...previous, { question: q, selected: index, correct: index === q.correctIndex }]);
  };

  const handleNext = () => {
    if (currentQ + 1 >= quizQuestions.length) setFinished(true);
    else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const toggleBookmark = async () => {
    if (!q) return;
    const next = isBookmarked ? bookmarks.filter(item => item.question !== q.question) : [...bookmarks, q];
    setBookmarks(next);
    localStorage.setItem(`quizvault.bookmarks.${courseId}`, JSON.stringify(next));
    const session = getSession();
    if (session) {
      const hash = questionHash(q.question);
      if (!isBookmarked) {
        void saveLearningRecord("rest/v1/question_bookmarks", {
          user_id: session.user.id, course_id: courseId, question_hash: hash,
          question_text: q.question, question_data: q,
        }).catch(error => console.error("Could not sync bookmark", error));
      } else {
        void deleteLearningRecord("question_bookmarks", `course_id=eq.${encodeURIComponent(courseId)}&question_hash=eq.${encodeURIComponent(hash)}`)
          .catch(error => console.error("Could not remove synced bookmark", error));
      }
    }
  };

  const restart = () => {
    setRunId(id => id + 1);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setAnswered(false);
    setFinished(false);
    setRemainingSeconds(examMinutes * 60);
    setReviewWrong(false);
  };

  if (!quizQuestions.length) return <p className="text-sm text-muted-foreground">No questions are available for this quiz yet.</p>;

  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100);
    const incorrect = answers.filter(a => !a.correct);
    return (
      <div className="animate-fade-in">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Trophy className="h-14 w-14 text-accent" />
          <h2 className="font-display text-3xl font-bold text-foreground">{mode === "timed" && remainingSeconds === 0 ? "Time is up" : "Quiz complete!"}</h2>
          <p className="text-sm text-muted-foreground">{courseTitle} · {difficulty} {mode === "timed" ? "timed exam" : "practice"}</p>
          <div className="rounded-2xl bg-primary/10 px-7 py-4"><span className="font-display text-4xl font-bold text-primary">{pct}%</span></div>
          <p className="text-muted-foreground">{score} of {quizQuestions.length} correct</p>
          <p className="text-sm text-muted-foreground">Incorrect answers: {incorrect.length} · Bookmarks: {bookmarks.length}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setReviewWrong(value => !value)} disabled={!incorrect.length} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground disabled:opacity-40">
              {reviewWrong ? "Hide review" : "Review incorrect answers"}
            </button>
            <button onClick={restart} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><RotateCcw className="h-4 w-4" /> New randomized attempt</button>
          </div>
        </div>
        {reviewWrong && <div className="mt-4 space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground">Review your mistakes</h3>
          {incorrect.map((answer, index) => <article key={`${answer.question.question}-${index}`} className="rounded-xl border border-border bg-card p-4">
            <p className="font-semibold text-foreground">{index + 1}. {answer.question.question}</p>
            <p className="mt-2 text-sm text-destructive">Your answer: {answer.question.options[answer.selected] ?? "Not answered"}</p>
            <p className="mt-1 text-sm text-emerald-700">Correct answer: {answer.question.options[answer.question.correctIndex]}</p>
            <p className="mt-2 text-sm text-muted-foreground">{answer.question.explanation}</p>
          </article>)}
        </div>}
      </div>
    );
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">Question {currentQ + 1} of {quizQuestions.length}</span>
        <div className="flex items-center gap-3">
          {mode === "timed" && <span className={`flex items-center gap-1 text-sm font-semibold ${remainingSeconds < 60 ? "text-destructive" : "text-primary"}`}><Clock3 className="h-4 w-4" />{minutes}:{String(seconds).padStart(2, "0")}</span>}
          <span className="text-sm font-medium text-primary">Score: {score}</span>
        </div>
      </div>
      {mode === "timed" && remainingSeconds < 60 && <p className="mb-3 flex items-center gap-2 text-xs text-destructive"><AlertTriangle className="h-3 w-3" /> Less than one minute remaining</p>}
      <div className="mb-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }} /></div>
      <div className="mt-6 flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-foreground">{q.question}</h3>
        <button aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"} title={isBookmarked ? "Remove bookmark" : "Bookmark question"} onClick={toggleBookmark} className={`shrink-0 rounded-lg border p-2 ${isBookmarked ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} /></button>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((opt, i) => {
          let style = "border-border bg-card hover:border-primary/50";
          if (answered) {
            if (i === q.correctIndex) style = "border-emerald-500 bg-emerald-50";
            else if (i === selected) style = "border-red-400 bg-red-50";
          } else if (i === selected) style = "border-primary bg-primary/5";
          return <button key={`${q.question}-${i}`} onClick={() => handleSelect(i)} disabled={answered} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${style}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-display text-sm font-semibold text-muted-foreground">{String.fromCharCode(65 + i)}</span>
            <span className="text-sm text-foreground">{opt}</span>
            {answered && i === q.correctIndex && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />}
            {answered && i === selected && i !== q.correctIndex && <XCircle className="ml-auto h-5 w-5 text-red-400" />}
          </button>;
        })}
      </div>
      {answered && <div className="mt-4 rounded-xl bg-muted p-4"><p className="text-sm text-foreground"><strong>Explanation:</strong> {q.explanation}</p></div>}
      {answered && <button onClick={handleNext} className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{currentQ + 1 >= quizQuestions.length ? "See results" : "Next question"} <ArrowRight className="h-4 w-4" /></button>}
    </div>
  );
};

export default QuizView;
