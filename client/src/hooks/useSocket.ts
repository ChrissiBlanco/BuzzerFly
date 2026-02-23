import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type RoomState = {
  activeRoundId: string | null;
  activeRoundName: string | null;
  currentQuestionIndex: number;
  isRevealed: boolean;
  questionText: string | null;
  buzzedParticipantId: string | null;
  questionCount?: number;
};

export type Participant = { id: string; name: string };

const SOCKET_URL = (
  import.meta.env.VITE_BACKEND_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173")
).replace(/\/$/, "");

export function useSocket(slug: string | null, name: string | null, isAdmin: boolean, adminToken: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [buzzedName, setBuzzedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !name) return;
    const socket = io(SOCKET_URL, { path: "/socket.io", transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_room", {
        slug,
        name,
        isAdmin: isAdmin,
        adminToken: adminToken ?? undefined,
      });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("error", (payload: { message?: string }) => setError(payload?.message ?? "Error"));
    socket.on("room_state", (state: RoomState) => {
      setRoomState(state);
      if (state.buzzedParticipantId == null) setBuzzedName(null);
    });
    socket.on("participant_list", (payload: { participants: Participant[] }) =>
      setParticipants(payload.participants)
    );
    socket.on("question_revealed", () => {
      setRoomState((s) => (s ? { ...s, isRevealed: true } : null));
    });
    socket.on("buzzer_pressed", (payload: { name: string }) => setBuzzedName(payload.name));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [slug, name, isAdmin, adminToken]);

  const emit = (event: string, payload?: object) => {
    socketRef.current?.emit(event, payload ?? { slug });
  };

  return {
    connected,
    roomState,
    participants,
    buzzedName,
    error,
    setRoomState,
    setBuzzedName,
    emit,
  };
}
