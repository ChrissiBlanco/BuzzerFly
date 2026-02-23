import type { Room } from "../../../api/rooms";
import type { RoomState } from "../../../hooks/useSocket";
import type { Participant } from "../../../hooks/useSocket";
import AdminHeader from "./AdminHeader";
import AdminEditMode from "./AdminEditMode";
import AdminRunMode from "./AdminRunMode";
import ParticipantsList from "../participants/ParticipantsList";

type Props = {
  room: Room | null;
  slug: string;
  shareUrl: string;
  connected: boolean;
  roomState: RoomState | null;
  participants: Participant[];
  buzzedName: string | null;
  isEditMode: boolean;
  setIsEditMode: (fn: (prev: boolean) => boolean) => void;
  // Edit mode state
  roomNameEdit: string;
  setRoomNameEdit: (value: string) => void;
  onSaveRoomName: () => void;
  savingRoomName: boolean;
  onAddRoundWithName: (name: string) => void;
  addingRound: boolean;
  onSetActiveRound: (roundId: string) => void;
  onDeleteRound: (roundId: string) => void;
  deletingRoundId: string | null;
  newQuestionText: string;
  setNewQuestionText: (value: string) => void;
  onAddQuestion: () => void;
  addingQuestion: boolean;
  onUpdateQuestion: (questionId: string, newText: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  savingQuestionId: string | null;
  // Run mode + shared
  onNextQuestion: () => void;
  onReveal: () => void;
  onPrevQuestion: () => void;
  onSetCurrentQuestion: (index: number) => void;
};

export default function AdminRoomView({
  room,
  slug,
  shareUrl,
  connected,
  roomState,
  participants,
  buzzedName,
  isEditMode,
  setIsEditMode,
  roomNameEdit,
  setRoomNameEdit,
  onSaveRoomName,
  onAddRoundWithName,
  addingRound,
  onSetActiveRound,
  onDeleteRound,
  deletingRoundId,
  newQuestionText,
  setNewQuestionText,
  onAddQuestion,
  addingQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  savingQuestionId,
  onNextQuestion,
  onReveal,
  onPrevQuestion,
  onSetCurrentQuestion,
}: Props) {
  const activeRound = room?.rounds?.find((r) => r.id === roomState?.activeRoundId) ?? null;
  const questions = activeRound?.questions ?? [];
  const currentIndex = roomState?.currentQuestionIndex ?? 0;
  const currentQuestion = questions[currentIndex] ?? null;

  return (
    <div className="min-h-screen bg-buzz-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <AdminHeader
          roomName={room?.name ?? null}
          slug={slug}
          shareUrl={shareUrl}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode((e) => !e)}
        />
        {!connected && <p className="text-buzz-yellow text-sm mb-4">Connecting…</p>}

        {isEditMode ? (
          <AdminEditMode
            room={room}
            activeRound={activeRound}
            activeRoundId={roomState?.activeRoundId ?? null}
            roomNameEdit={roomNameEdit}
            onRoomNameEditChange={setRoomNameEdit}
            onSaveRoomName={onSaveRoomName}
            onAddRoundWithName={onAddRoundWithName}
            addingRound={addingRound}
            onSetActiveRound={onSetActiveRound}
            onDeleteRound={onDeleteRound}
            deletingRoundId={deletingRoundId}
            newQuestionText={newQuestionText}
            onNewQuestionTextChange={setNewQuestionText}
            onAddQuestion={onAddQuestion}
            addingQuestion={addingQuestion}
            questions={questions}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
            savingQuestionId={savingQuestionId}
            onNextQuestion={onNextQuestion}
          />
        ) : (
          activeRound && (
            <AdminRunMode
              activeRound={activeRound}
              rounds={room?.rounds ?? []}
              onSetActiveRound={onSetActiveRound}
              questions={questions}
              currentIndex={currentIndex}
              isRevealed={roomState?.isRevealed ?? false}
              currentQuestionText={currentQuestion?.text ?? null}
              buzzedName={buzzedName}
              onReveal={onReveal}
              onPrevQuestion={onPrevQuestion}
              onNextQuestion={onNextQuestion}
              onSetCurrentQuestion={onSetCurrentQuestion}
            />
          )
        )}

        {!isEditMode && (
          <ParticipantsList participants={participants} buzzedName={buzzedName} />
        )}
        
      </div>
    </div>
  );
}
