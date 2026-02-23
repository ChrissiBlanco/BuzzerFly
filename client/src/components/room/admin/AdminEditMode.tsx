import type { Room, Round, Question } from "../../../api/rooms";
import QuestionCard from "../../QuestionCard";

type Props = {
  room: Room | null;
  activeRound: Round | null;
  activeRoundId: string | null;
  roomNameEdit: string;
  onRoomNameEditChange: (value: string) => void;
  onSaveRoomName: () => void;
  savingRoomName: boolean;
  newRoundName: string;
  onNewRoundNameChange: (value: string) => void;
  onAddRound: () => void;
  addingRound: boolean;
  onSetActiveRound: (roundId: string) => void;
  onDeleteRound: (roundId: string) => void;
  deletingRoundId: string | null;
  newQuestionText: string;
  onNewQuestionTextChange: (value: string) => void;
  onAddQuestion: () => void;
  addingQuestion: boolean;
  questions: Question[];
  onUpdateQuestion: (questionId: string, newText: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  savingQuestionId: string | null;
  onNextQuestion: () => void;
};

export default function AdminEditMode({
  room,
  activeRound,
  activeRoundId,
  roomNameEdit,
  onRoomNameEditChange,
  onSaveRoomName,
  savingRoomName,
  newRoundName,
  onNewRoundNameChange,
  onAddRound,
  addingRound,
  onSetActiveRound,
  onDeleteRound,
  deletingRoundId,
  newQuestionText,
  onNewQuestionTextChange,
  onAddQuestion,
  addingQuestion,
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  savingQuestionId,
}: Props) {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-buzz-yellow">Room name</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Room name"
            value={roomNameEdit}
            onChange={(e) => onRoomNameEditChange(e.target.value)}
            onBlur={onSaveRoomName}
            onKeyDown={(e) => e.key === "Enter" && onSaveRoomName()}
            className="flex-1 px-3 py-2 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 focus:border-buzz-yellow focus:outline-none"
          />
          <button
            type="button"
            onClick={onSaveRoomName}
            disabled={savingRoomName || roomNameEdit.trim() === (room?.name ?? "")}
            className="px-4 py-2 bg-buzz-red hover:bg-buzz-red-light rounded-playful font-semibold disabled:opacity-50 shadow-playful"
          >
            Save
          </button>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-buzz-yellow">Rounds</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New round name"
            value={newRoundName}
            onChange={(e) => onNewRoundNameChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddRound()}
            className="flex-1 px-3 py-2 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 focus:border-buzz-yellow focus:outline-none"
          />
          <button
            onClick={onAddRound}
            disabled={!newRoundName.trim() || addingRound}
            className="px-4 py-2 bg-buzz-red hover:bg-buzz-red-light rounded-playful font-semibold disabled:opacity-50 shadow-playful active:scale-[0.98]"
          >
            Add round
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {room?.rounds?.map((r) => (
            <span
              key={r.id}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-playful text-sm font-semibold transition ${
                activeRoundId === r.id
                  ? "bg-buzz-red text-white shadow-playful"
                  : "bg-black/50 border-2 border-buzz-yellow/50 text-buzz-yellow"
              }`}
            >
              <button
                type="button"
                onClick={() => onSetActiveRound(r.id)}
                className="hover:underline focus:underline"
              >
                {r.name}
              </button>
              <button
                type="button"
                onClick={() => onDeleteRound(r.id)}
                disabled={deletingRoundId === r.id}
                title="Delete round"
                className="ml-0.5 p-0.5 rounded hover:bg-white/20 disabled:opacity-50"
                aria-label={`Delete ${r.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {activeRound && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-buzz-yellow">
            Questions — {activeRound.name}
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="New question text"
              value={newQuestionText}
              onChange={(e) => onNewQuestionTextChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddQuestion()}
              className="flex-1 px-3 py-2 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 focus:border-buzz-yellow focus:outline-none"
            />
            <button
              onClick={onAddQuestion}
              disabled={!newQuestionText.trim() || addingQuestion}
              className="px-4 py-2 bg-buzz-red hover:bg-buzz-red-light rounded-playful font-semibold disabled:opacity-50 shadow-playful active:scale-[0.98]"
            >
              Add question
            </button>
          </div>
          <div className="space-y-2 mb-4">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                index={i}
                text={q.text}
                editable={true}
                onUpdateText={(newText) => onUpdateQuestion(q.id, newText)}
                onDelete={() => onDeleteQuestion(q.id)}
                saving={savingQuestionId === q.id}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
