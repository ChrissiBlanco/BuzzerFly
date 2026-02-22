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
      <div className="rounded-playful border-2 border-buzz-yellow/50 bg-black/50 p-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-buzz-yellow/80 w-8 shrink-0">{index + 1}</span>
          <input
            type="text"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            disabled={saving}
            className="flex-1 px-3 py-1.5 rounded-playful bg-black/40 border border-buzz-yellow/50 text-white focus:border-buzz-yellow focus:outline-none"
          />
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="px-3 py-1.5 text-buzz-red hover:bg-buzz-red/20 rounded-playful text-sm font-semibold shrink-0"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-playful border-2 p-4 ${
        isCurrent ? "border-buzz-yellow bg-black/50" : "border-yellow-900/50 bg-black/30"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-buzz-yellow/80 w-8">{index + 1}</span>
        {isRevealed ? (
          <p className="text-white flex-1">{text}</p>
        ) : (
          <span className="text-yellow-200/50 flex-1">Question hidden</span>
        )}
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
