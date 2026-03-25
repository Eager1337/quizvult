import { useState } from 'react';
import { Question } from '@/data/courses';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';

const QuizView = ({ questions, courseTitle }: { questions: Question[]; courseTitle: string }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === q.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-6 py-12 animate-fade-in">
        <Trophy className="h-16 w-16 text-accent" />
        <h2 className="font-display text-3xl font-bold text-foreground">Quiz Complete!</h2>
        <p className="text-lg text-muted-foreground">{courseTitle}</p>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3">
          <span className="font-display text-4xl font-bold text-primary">{pct}%</span>
        </div>
        <p className="text-muted-foreground">{score} of {questions.length} correct</p>
        <button onClick={handleRestart} className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
        <span className="text-sm font-medium text-primary">Score: {score}</span>
      </div>

      <div className="mb-2 h-1.5 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold text-foreground">{q.question}</h3>

      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((opt, i) => {
          let style = 'border-border bg-card hover:border-primary/50';
          if (answered) {
            if (i === q.correctIndex) style = 'border-emerald-500 bg-emerald-50';
            else if (i === selected) style = 'border-red-400 bg-red-50';
          } else if (i === selected) {
            style = 'border-primary bg-primary/5';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${style}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-display text-sm font-semibold text-muted-foreground">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm text-foreground">{opt}</span>
              {answered && i === q.correctIndex && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />}
              {answered && i === selected && i !== q.correctIndex && <XCircle className="ml-auto h-5 w-5 text-red-400" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 rounded-xl bg-muted p-4 animate-slide-up">
          <p className="text-sm text-foreground"><strong>Explanation:</strong> {q.explanation}</p>
        </div>
      )}

      {answered && (
        <button onClick={handleNext} className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
          {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'} <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default QuizView;
