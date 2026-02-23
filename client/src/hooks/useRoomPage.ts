import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  getRoom,
  createRound,
  addQuestions,
  updateRoomName,
  updateQuestion,
  deleteQuestion,
  deleteRound,
  type Room,
} from "../api/rooms";
import { useSocket } from "./useSocket";

function getStoredAdminToken(roomId: string): string | null {
  try {
    const raw = localStorage.getItem("buzzer_admin_tokens");
    const tokens: Record<string, string> = raw ? JSON.parse(raw) : {};
    return tokens[roomId] ?? null;
  } catch {
    return null;
  }
}

function storeAdminToken(roomId: string, adminToken: string): void {
  try {
    const raw = localStorage.getItem("buzzer_admin_tokens");
    const tokens: Record<string, string> = raw ? JSON.parse(raw) : {};
    if (!tokens[roomId]) {
      tokens[roomId] = adminToken;
      localStorage.setItem("buzzer_admin_tokens", JSON.stringify(tokens));
    }
  } catch {}
}

const ROOM_JOINS_KEY = "buzzer_room_joins";

function getStoredJoin(slug: string): { name: string } | null {
  try {
    const raw = localStorage.getItem(ROOM_JOINS_KEY);
    const joins: Record<string, { name: string }> = raw ? JSON.parse(raw) : {};
    return joins[slug] ?? null;
  } catch {
    return null;
  }
}

function storeJoin(slug: string, name: string): void {
  try {
    const raw = localStorage.getItem(ROOM_JOINS_KEY);
    const joins: Record<string, { name: string }> = raw ? JSON.parse(raw) : {};
    joins[slug] = { name };
    localStorage.setItem(ROOM_JOINS_KEY, JSON.stringify(joins));
  } catch {}
}

export function useRoomPage(slug: string | null) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAdminQuery = searchParams.get("admin") === "1";
  const adminTokenFromState = (location.state as { adminToken?: string } | null)?.adminToken ?? null;

  const [room, setRoom] = useState<Room | null>(null);
  const adminToken = adminTokenFromState ?? (room?.id ? getStoredAdminToken(room.id) : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState(() =>
    slug ? getStoredJoin(slug)?.name ?? "" : ""
  );
  const [joined, setJoined] = useState(() => !!(slug && getStoredJoin(slug)?.name));
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
    getRoom(slug)
      .then((r) => {
        setRoom(r);
        setRoomNameEdit(r.name ?? "");
        setRoomNameOnJoin(r.name ?? "");
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load room"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (room) {
      setRoomNameEdit(room.name ?? "");
      setRoomNameOnJoin(room.name ?? "");
    }
  }, [room?.id, room?.name]);

  const roomId = room?.id;
  useEffect(() => {
    if (!roomId || !adminToken) return;
    storeAdminToken(roomId, adminToken);
  }, [roomId, adminToken]);

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
    const stored = getStoredJoin(slug);
    if (stored?.name) {
      setParticipantName(stored.name);
      setJoined(true);
    } else {
      setParticipantName("");
      setJoined(false);
    }
  }, [slug]);

  const activeRound = room?.rounds?.find((r) => r.id === roomState?.activeRoundId);

  async function handleAddRound() {
    if (!slug || !newRoundName.trim() || !adminToken) return;
    setAddingRound(true);
    try {
      const round = await createRound(slug, newRoundName.trim(), adminToken);
      setRoom((r) =>
        r
          ? {
              ...r,
              rounds: [...(r.rounds ?? []), { ...round, questions: round.questions ?? [] }].sort(
                (a, b) => a.order - b.order
              ),
            }
          : null
      );
      setNewRoundName("");
    } catch (_) {}
    setAddingRound(false);
  }

  async function handleAddRoundWithName(name: string) {
    const trimmed = name.trim();
    if (!slug || !trimmed || !adminToken) return;
    setAddingRound(true);
    try {
      const round = await createRound(slug, trimmed, adminToken);
      setRoom((r) =>
        r
          ? {
              ...r,
              rounds: [...(r.rounds ?? []), { ...round, questions: round.questions ?? [] }].sort(
                (a, b) => a.order - b.order
              ),
            }
          : null
      );
    } catch (_) {}
    setAddingRound(false);
  }

  async function handleAddQuestion() {
    if (!slug || !activeRound || !newQuestionText.trim() || !adminToken) return;
    setAddingQuestion(true);
    try {
      const added = await addQuestions(
        slug,
        activeRound.id,
        [{ text: newQuestionText.trim() }],
        adminToken
      );
      const newQuestions = Array.isArray(added) ? added : [added];
      setRoom((r) => {
        if (!r) return r;
        const rounds = r.rounds.map((round) =>
          round.id === activeRound.id
            ? {
                ...round,
                questions: [...(round.questions ?? []), ...newQuestions].sort((a, b) => a.order - b.order),
              }
            : round
        );
        return { ...r, rounds };
      });
      setNewQuestionText("");
    } catch (_) {}
    setAddingQuestion(false);
  }

  async function handleSaveRoomName() {
    if (!slug || !adminToken || roomNameEdit.trim() === (room?.name ?? "")) return;
    setSavingRoomName(true);
    try {
      const updated = await updateRoomName(slug, roomNameEdit.trim(), adminToken);
      setRoom((r) => (r ? { ...r, name: updated.name } : null));
    } catch (_) {}
    setSavingRoomName(false);
  }

  async function handleUpdateQuestion(questionId: string, newText: string) {
    if (!slug || !activeRound || !adminToken || !newText.trim()) return;
    setSavingQuestionId(questionId);
    try {
      const updated = await updateQuestion(
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
      await deleteQuestion(slug, activeRound.id, questionId, adminToken);
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
      await deleteRound(slug, roundId, adminToken);
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
        await updateRoomName(slug, roomNameOnJoin.trim(), adminToken);
        setRoom((r) => (r ? { ...r, name: roomNameOnJoin.trim() } : null));
      }
      setJoined(true);
      if (slug) storeJoin(slug, participantName.trim());
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
