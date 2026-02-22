import type { Question, Round } from "../../../api/rooms";

type Props = {
  activeRound: Round | null;
  rounds: Round[];
  questions: Question[];
  currentIndex: number;
  isRevealed: boolean;
  currentQuestionText: string | null;
  buzzedName: string | null;
  onReveal: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onSetCurrentQuestion: (index: number) => void;
  onSetActiveRound: (roundId: string) => void;
};

export default function AdminRunMode({
  activeRound,
  rounds,
  questions,
  currentIndex,
  isRevealed,
  currentQuestionText,
  buzzedName,
  onReveal,
  onPrevQuestion,
  onNextQuestion,
  onSetCurrentQuestion,
  onSetActiveRound,
}: Props) {
  return (
    <section className="mb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        {rounds.map((round, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSetActiveRound(round.id)}
            className={`px-4 py-2 rounded-playful text-sm font-semibold transition ${
              activeRound?.id === round.id
                ? "bg-buzz-red text-white shadow-playful"
                : "bg-black/50 border-2 border-buzz-yellow/50 text-buzz-yellow hover:border-buzz-yellow"
            }`}
          >
            {round.name}
          </button>
        ))}
      </div>
      {questions.length === 0 ? (
        <p className="text-yellow-200/70">
          No questions in this round. Switch to Edit to add some.
        </p>
      ) : (
        <div className="mt-6">
          <div className="rounded-playful border-2 border-buzz-yellow/50 bg-black/50 p-6 mb-4 min-h-[8rem]">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono text-buzz-yellow/80">
                {currentIndex + 1}
              </span>
              {isRevealed && currentQuestionText ? (
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <p className="text-white flex-1 min-w-0">
                    {currentQuestionText}
                  </p>
                  {buzzedName && (
                    <span className="px-2 py-0.5 rounded-playful text-sm font-semibold bg-buzz-red text-buzz-yellow shrink-0">
                      {buzzedName}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <span className="text-yellow-200/50 flex-1">
                    Question hidden
                  </span>
                  <button
                    onClick={onReveal}
                    className="px-3 py-1.5 bg-buzz-red hover:bg-buzz-red-light text-white rounded-playful text-sm font-semibold shadow-playful"
                  >
                    Reveal
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onNextQuestion}
              disabled={currentIndex >= questions.length - 1}
              className="px-4 py-2 bg-buzz-yellow hover:bg-buzz-yellow-light text-buzz-black rounded-playful font-semibold disabled:opacity-50 shadow-playful active:scale-[0.98] text-xl"
              title="Next question"
              aria-label="Next question"
            >
              →
            </button>
            <button
              onClick={onPrevQuestion}
              disabled={currentIndex <= 0}
              className="px-4 py-2 bg-buzz-yellow hover:bg-buzz-yellow-light text-buzz-black rounded-playful font-semibold disabled:opacity-50 shadow-playful active:scale-[0.98] text-xl"
              title="Previous question"
              aria-label="Previous question"
            >
              ←
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
