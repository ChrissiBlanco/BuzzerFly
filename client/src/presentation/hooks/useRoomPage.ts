import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import type { Room } from "../../domain/models";
import { useAppServices } from "../context/AppContext";
import { useSocket } from "./useSocket";
import { addRound as addRoundUseCase, addQuestion as addQuestionUseCase } from "../../application/room/roomUseCases";

export function useRoomPage(slug: string | null) {
  const { roomRepository, roundRepository, questionRepository, storage } =
    useAppServices();

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAdminQuery = searchParams.get("admin") === "1";
  const adminTokenFromState = (location.state as { adminToken?: string } | null)?.adminToken ?? null;

  const [room, setRoom] = useState<Room | null>(null);
  const adminToken = adminTokenFromState ?? (room?.id ? storage.getAdminToken(room.id) : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState(() =>
    slug ? storage.getJoin(slug)?.name ?? "" : ""
  );
  const [joined, setJoined] = useState(() => !!(slug && storage.getJoin(slug)?.name));
  const [newRoundName, setNewRoundName] = useState("");
  const [addingRound, setAddingRound] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roomNameEdit, setRoomNameEdit] = useState("");
  const [roomNameOnJoin, setRoomNameOnJoin] = useState("");
  const [savingRoomName, setSavingRoomName] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const isAdmin = isAdminQuery && !!adminToken;
  const name = joined ? participantName : null;
  const {
    connected,
    roomState,
    participants,
    buzzedName,
    error: socketError,
    emit,
  } = useSocket(slug ?? null, name, isAdmin, adminToken);

  useEffect(() => {
    if (!slug) return;
    roomRepository
      .getRoom(slug)
      .then((r) => {
        setRoom(r);
        setRoomNameEdit(r.name ?? "");
        setRoomNameOnJoin(r.name ?? "");
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load room"))
      .finally(() => setLoading(false));
  }, [slug, roomRepository]);

  useEffect(() => {
    if (room) {
      setRoomNameEdit(room.name ?? "");
      setRoomNameOnJoin(room.name ?? "");
    }
  }, [room?.id, room?.name]);

  const roomId = room?.id;
  useEffect(() => {
    if (!roomId || !adminToken) return;
    storage.setAdminToken(roomId, adminToken);
  }, [roomId, adminToken, storage]);

  useEffect(() => {
    if (socketError) setError(socketError);
  }, [socketError]);

  // Restore joined state when slug changes (e.g. navigate to another room)
  useEffect(() => {
    if (!slug) {
      setJoined(false);
      setParticipantName("");
      return;
    }
    const stored = storage.getJoin(slug);
    if (stored?.name) {
      setParticipantName(stored.name);
      setJoined(true);
    } else {
      setParticipantName("");
      setJoined(false);
    }
  }, [slug, storage]);

  const activeRound = room?.rounds?.find((r) => r.id === roomState?.activeRoundId);

  async function handleAddRound() {
    if (!slug || !newRoundName.trim() || !adminToken) return;
    setAddingRound(true);
    try {
      const nextRoom = await addRoundUseCase(
        roundRepository,
        slug,
        newRoundName.trim(),
        adminToken,
        room
      );
      if (nextRoom) setRoom(nextRoom);
      setNewRoundName("");
    } catch (_) {}
    setAddingRound(false);
  }

  async function handleAddRoundWithName(roundName: string) {
    const trimmed = roundName.trim();
    if (!slug || !trimmed || !adminToken) return;
    setAddingRound(true);
    try {
      const nextRoom = await addRoundUseCase(
        roundRepository,
        slug,
        trimmed,
        adminToken,
        room
      );
      if (nextRoom) setRoom(nextRoom);
    } catch (_) {}
    setAddingRound(false);
  }

  async function handleAddQuestion() {
    if (!slug || !activeRound || !newQuestionText.trim() || !adminToken) return;
    setAddingQuestion(true);
    try {
      const nextRoom = await addQuestionUseCase(
        questionRepository,
        slug,
        activeRound.id,
        newQuestionText.trim(),
        adminToken,
        room
      );
      if (nextRoom) setRoom(nextRoom);
      setNewQuestionText("");
    } catch (_) {}
    setAddingQuestion(false);
  }

  async function handleSaveRoomName() {
    if (!slug || !adminToken || roomNameEdit.trim() === (room?.name ?? "")) return;
    setSavingRoomName(true);
    try {
      const updated = await roomRepository.updateRoomName(
        slug,
        roomNameEdit.trim(),
        adminToken
      );
      setRoom((r) => (r ? { ...r, name: updated.name } : null));
    } catch (_) {}
    setSavingRoomName(false);
  }

  async function handleUpdateQuestion(questionId: string, newText: string) {
    if (!slug || !activeRound || !adminToken || !newText.trim()) return;
    setSavingQuestionId(questionId);
    try {
      const updated = await questionRepository.updateQuestion(
        slug,
        activeRound.id,
        questionId,
        { text: newText.trim() },
        adminToken
      );
      setRoom((r) => {
        if (!r) return r;
        const rounds = r.rounds.map((round) =>
          round.id === activeRound.id
            ? {
                ...round,
                questions: (round.questions ?? []).map((q) =>
                  q.id === questionId ? { ...q, text: updated.text } : q
                ),
              }
            : round
        );
        return { ...r, rounds };
      });
    } catch (_) {}
    setSavingQuestionId(null);
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!slug || !activeRound || !adminToken) return;
    setSavingQuestionId(questionId);
    try {
      await questionRepository.deleteQuestion(
        slug,
        activeRound.id,
        questionId,
        adminToken
      );
      setRoom((r) => {
        if (!r) return r;
        const rounds = r.rounds.map((round) =>
          round.id === activeRound.id
            ? { ...round, questions: (round.questions ?? []).filter((q) => q.id !== questionId) }
            : round
        );
        return { ...r, rounds };
      });
    } catch (_) {}
    setSavingQuestionId(null);
  }

  async function handleDeleteRound(roundId: string) {
    if (!slug || !adminToken) return;
    const wasActive = roomState?.activeRoundId === roundId;
    const remainingRounds = room?.rounds?.filter((r) => r.id !== roundId) ?? [];
    const nextActiveId = wasActive ? remainingRounds[0]?.id ?? null : null;
    setDeletingRoundId(roundId);
    try {
      await roundRepository.deleteRound(slug, roundId, adminToken);
      setRoom((r) =>
        r ? { ...r, rounds: r.rounds.filter((rnd) => rnd.id !== roundId) } : null
      );
      if (wasActive && nextActiveId) {
        emit("set_active_round", { slug, roundId: nextActiveId });
      }
    } catch (_) {}
    setDeletingRoundId(null);
  }

  function handleSetActiveRound(roundId: string) {
    emit("set_active_round", { slug, roundId });
  }

  function handleReveal() {
    emit("reveal", { slug });
  }

  function handleNextQuestion() {
    emit("next_question", { slug });
  }

  function handlePrevQuestion() {
    if ((roomState?.currentQuestionIndex ?? 0) <= 0) return;
    emit("set_current_question", { slug, index: (roomState?.currentQuestionIndex ?? 0) - 1 });
  }

  function handleSetCurrentQuestion(index: number) {
    emit("set_current_question", { slug, index });
  }

  function handleBuzz() {
    emit("buzz", { slug, name: participantName });
  }

  async function handleJoinRoom() {
    if (!participantName.trim()) return;
    setJoining(true);
    try {
      if (isAdmin && slug && adminToken && roomNameOnJoin.trim()) {
        await roomRepository.updateRoomName(slug, roomNameOnJoin.trim(), adminToken);
        setRoom((r) => (r ? { ...r, name: roomNameOnJoin.trim() } : null));
      }
      setJoined(true);
      if (slug) storage.setJoin(slug, participantName.trim());
    } finally {
      setJoining(false);
    }
  }

  return {
    slug,
    room,
    loading,
    error,
    joined,
    isAdmin,
    participantName,
    setParticipantName,
    roomNameOnJoin,
    setRoomNameOnJoin,
    onJoinRoom: handleJoinRoom,
    joining,
    connected,
    roomState,
    participants,
    buzzedName,
    isEditMode,
    setIsEditMode,
    roomNameEdit,
    setRoomNameEdit,
    onSaveRoomName: handleSaveRoomName,
    savingRoomName,
    newRoundName,
    setNewRoundName,
    onAddRound: handleAddRound,
    onAddRoundWithName: handleAddRoundWithName,
    addingRound,
    onSetActiveRound: handleSetActiveRound,
    onDeleteRound: handleDeleteRound,
    deletingRoundId,
    newQuestionText,
    setNewQuestionText,
    onAddQuestion: handleAddQuestion,
    addingQuestion,
    onUpdateQuestion: handleUpdateQuestion,
    onDeleteQuestion: handleDeleteQuestion,
    savingQuestionId,
    onNextQuestion: handleNextQuestion,
    onReveal: handleReveal,
    onPrevQuestion: handlePrevQuestion,
    onSetCurrentQuestion: handleSetCurrentQuestion,
    onBuzz: handleBuzz,
  };
}
