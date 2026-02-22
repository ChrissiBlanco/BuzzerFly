import { useParams } from "react-router-dom";
import { useRoomPage } from "../hooks/useRoomPage";
import RoomLoading from "../components/room/RoomLoading";
import RoomError from "../components/room/RoomError";
import RoomJoinForm from "../components/room/RoomJoinForm";
import AdminRoomView from "../components/room/admin/AdminRoomView";
import ParticipantView from "../components/room/participants/ParticipantView";

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const state = useRoomPage(slug ?? null);

  if (state.loading || !slug) {
    return <RoomLoading />;
  }

  if (state.error && !state.room) {
    return <RoomError message={state.error} />;
  }

  if (!state.joined) {
    return (
      <RoomJoinForm
        slug={slug}
        isAdmin={state.isAdmin}
        participantName={state.participantName}
        onParticipantNameChange={state.setParticipantName}
        roomNameOnJoin={state.roomNameOnJoin}
        onRoomNameOnJoinChange={state.setRoomNameOnJoin}
        onJoin={state.onJoinRoom}
        joining={state.joining}
      />
    );
  }

  if (state.isAdmin) {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/room/${slug}`;
    return (
      <AdminRoomView
        room={state.room}
        slug={slug}
        shareUrl={shareUrl}
        connected={state.connected}
        roomState={state.roomState}
        participants={state.participants}
        buzzedName={state.buzzedName}
        isEditMode={state.isEditMode}
        setIsEditMode={state.setIsEditMode}
        roomNameEdit={state.roomNameEdit}
        setRoomNameEdit={state.setRoomNameEdit}
        onSaveRoomName={state.onSaveRoomName}
        savingRoomName={state.savingRoomName}
        newRoundName={state.newRoundName}
        setNewRoundName={state.setNewRoundName}
        onAddRound={state.onAddRound}
        addingRound={state.addingRound}
        onSetActiveRound={state.onSetActiveRound}
        onDeleteRound={state.onDeleteRound}
        deletingRoundId={state.deletingRoundId}
        newQuestionText={state.newQuestionText}
        setNewQuestionText={state.setNewQuestionText}
        onAddQuestion={state.onAddQuestion}
        addingQuestion={state.addingQuestion}
        onUpdateQuestion={state.onUpdateQuestion}
        onDeleteQuestion={state.onDeleteQuestion}
        savingQuestionId={state.savingQuestionId}
        onNextQuestion={state.onNextQuestion}
        onReveal={state.onReveal}
        onPrevQuestion={state.onPrevQuestion}
        onSetCurrentQuestion={state.onSetCurrentQuestion}
      />
    );
  }

  return (
    <ParticipantView
      connected={state.connected}
      questionText={state.roomState?.questionText ?? null}
      isRevealed={state.roomState?.isRevealed ?? false}
      activeRoundName={state.roomState?.activeRoundName ?? null}
      buzzedName={state.buzzedName}
      onBuzz={state.onBuzz}
    />
  );
}
