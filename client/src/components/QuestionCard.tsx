import { useState, useEffect } from "react";

type Props = {
  index: number;
  text: string;
  isRevealed?: boolean;
  isCurrent?: boolean;
  onReveal?: () => void;
  /** When true, show editable text input and delete button */
  editable?: boolean;
  onUpdateText?: (newText: string) => void;
  onDelete?: () => void;
  saving?: boolean;
};

export default function QuestionCard({
  index,
  text,
  isRevealed = false,
  isCurrent = false,
  onReveal,
  editable,
  onUpdateText,
  onDelete,
  saving,
}: Props) {
  const [localText, setLocalText] = useState(text);
  useEffect(() => {
    setLocalText(text);
  }, [text]);

  if (editable) {
    const commit = () => {
      const trimmed = localText.trim();
      if (trimmed !== text) onUpdateText?.(trimmed);
    };
    return (
      <div className="flex items-center gap-1">
        <div className="flex-1 min-w-0 rounded-playful border-2 border-buzz-yellow/50 bg-black/50 px-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-buzz-yellow/80 w-2 shrink-0">
              {index + 1}
            </span>
            <input
              type="text"
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              disabled={saving}
              className="flex-1 min-w-0 px-3 py-2 bg-black/40 text-white rounded-playful focus:outline-none focus:ring-0 focus:border-0 border-0"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={saving}
          className="w-10 h-10 flex items-center justify-center shrink-0 text-buzz-red hover:bg-buzz-red/20 rounded-playful disabled:opacity-50"
          title="Delete"
          aria-label="Delete question"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-playful border-2 p-4 ${
        isCurrent
          ? "border-buzz-yellow bg-black/50"
          : "border-yellow-900/50 bg-black/30"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-buzz-yellow/80 w-8">{index + 1}</span>
        {isRevealed && <p className="text-white flex-1">{text}</p>
          
        }
        {onReveal && isCurrent && !isRevealed && (
          <button
            onClick={onReveal}
            className="px-3 py-1.5 bg-buzz-red hover:bg-buzz-red-light text-white rounded-playful text-sm font-semibold shadow-playful active:scale-[0.98]"
          >
            Reveal
          </button>
        )}
      </div>
    </div>
  );
}
