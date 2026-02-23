import { useState } from "react";
import type { Room, Round, Question } from "../../../api/rooms";
import QuestionCard from "../../QuestionCard";

type Props = {
  room: Room | null;
  activeRound: Round | null;
  activeRoundId: string | null;
  roomNameEdit: string;
  onRoomNameEditChange: (value: string) => void;
  onSaveRoomName: () => void;
  onAddRoundWithName: (name: string) => void;
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
  onAddRoundWithName,
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
  const [addRoundModalOpen, setAddRoundModalOpen] = useState(false);
  const [editRoundsModalOpen, setEditRoundsModalOpen] = useState(false);
  const [addRoundName, setAddRoundName] = useState("");
  const [editModalNewRoundName, setEditModalNewRoundName] = useState("");

  function handleAddRoundSubmit() {
    const name = addRoundName.trim();
    if (!name || addingRound) return;
    onAddRoundWithName(name);
    setAddRoundName("");
    setAddRoundModalOpen(false);
  }

  function handleEditModalAddRound() {
    const name = editModalNewRoundName.trim();
    if (!name || addingRound) return;
    onAddRoundWithName(name);
    setEditModalNewRoundName("");
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-buzz-yellow">Room name</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Room name"
            value={roomNameEdit}
            onChange={(e) => onRoomNameEditChange(e.target.value)}
            onBlur={onSaveRoomName}
            onKeyDown={(e) => e.key === "Enter" && onSaveRoomName()}
            className="w-full px-3 py-2 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 focus:border-buzz-yellow focus:outline-none"
          />
        </div>
      </section>
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-buzz-yellow mr-2">Rounds</h2>
          <button
            type="button"
            onClick={() => setEditRoundsModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center shrink-0 rounded-playful bg-buzz-yellow/20 hover:bg-buzz-yellow/40 text-buzz-yellow"
            title="Edit rounds"
            aria-label="Edit rounds"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setAddRoundModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center shrink-0 rounded-playful bg-buzz-yellow/20 hover:bg-buzz-yellow/40 text-buzz-yellow text-xl leading-none"
            title="Add round"
            aria-label="Add round"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {room?.rounds?.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSetActiveRound(r.id)}
              className={`inline-flex items-center px-3 py-1.5 rounded-playful text-sm font-semibold transition ${
                activeRoundId === r.id
                  ? "bg-black/50 border-2 border-buzz-yellow text-buzz-yellow bg-buzz-yellow/20"
                  : "bg-black/50 border-2 border-buzz-yellow/50 text-buzz-yellow"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </section>

      {/* Add round modal */}
      {addRoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setAddRoundModalOpen(false)}>
          <div className="bg-buzz-black border-2 border-buzz-yellow/50 rounded-playful p-6 w-full max-w-sm shadow-playful" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-buzz-yellow mb-4">New round</h3>
            <input
              type="text"
              placeholder="Round name"
              value={addRoundName}
              onChange={(e) => setAddRoundName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddRoundSubmit()}
              className="w-full px-3 py-2 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 focus:border-buzz-yellow focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setAddRoundModalOpen(false)}
                className="px-4 py-2 rounded-playful font-semibold border-2 border-buzz-yellow/50 text-buzz-yellow hover:bg-buzz-yellow/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddRoundSubmit}
                disabled={!addRoundName.trim() || addingRound}
                className="px-4 py-2 bg-buzz-red hover:bg-buzz-red-light rounded-playful font-semibold disabled:opacity-50 shadow-playful"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit rounds modal */}
      {editRoundsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setEditRoundsModalOpen(false)}>
          <div className="bg-buzz-black border-2 border-buzz-yellow/50 rounded-playful p-6 w-full max-w-md max-h-[85vh] flex flex-col shadow-playful" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-buzz-yellow mb-4">Edit rounds</h3>
            <ul className="space-y-2 overflow-y-auto mb-4 flex-1 min-h-0">
              {room?.rounds?.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2 border-b border-buzz-yellow/30">
                  <span className="text-buzz-yellow font-medium truncate">{r.name}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteRound(r.id)}
                    disabled={deletingRoundId === r.id}
                    className="p-1.5 rounded hover:bg-buzz-red/30 text-buzz-red disabled:opacity-50 shrink-0"
                    title={`Delete ${r.name}`}
                    aria-label={`Delete ${r.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New round name"
                value={editModalNewRoundName}
                onChange={(e) => setEditModalNewRoundName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditModalAddRound()}
                className="flex-1 px-3 py-2 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 focus:border-buzz-yellow focus:outline-none"
              />
              <button
                type="button"
                onClick={handleEditModalAddRound}
                disabled={!editModalNewRoundName.trim() || addingRound}
                className="px-4 py-2 bg-buzz-red hover:bg-buzz-red-light rounded-playful font-semibold disabled:opacity-50 shadow-playful text-xl"
                title="Add round"
                aria-label="Add round"
              >
                +
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setEditRoundsModalOpen(false)}
                className="px-4 py-2 rounded-playful font-semibold bg-buzz-yellow hover:bg-buzz-yellow-light text-buzz-black shadow-playful"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {activeRound && (
        <section className="mb-8">
          <div className="space-y-2 mb-6">
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
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="New question text"
              value={newQuestionText}
              onChange={(e) => onNewQuestionTextChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddQuestion()}
              className="flex-1 min-w-0 px-3 py-2 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 focus:border-buzz-yellow focus:outline-none"
            />
            <button
              onClick={onAddQuestion}
              disabled={!newQuestionText.trim() || addingQuestion}
              className="w-10 h-10 flex items-center justify-center shrink-0 bg-buzz-red hover:bg-buzz-red-light rounded-playful font-semibold disabled:opacity-50 shadow-playful active:scale-[0.98] text-xl"
              title="Add question"
              aria-label="Add question"
            >
              +
            </button>
          </div>
        </section>
      )}
    </>
  );
}
