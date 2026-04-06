import { useEffect, useRef, useState } from "react";
import type { Participant, RoomState } from "../../domain/models";
import { useAppServices } from "../context/AppContext";

export function useSocket(
  slug: string | null,
  name: string | null,
  isAdmin: boolean,
  adminToken: string | null
) {
  const { createRoomSocket } = useAppServices();
  const socketRef = useRef<ReturnType<typeof createRoomSocket> | null>(null);

  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [buzzedName, setBuzzedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !name) return;

    const socket = createRoomSocket();
    socketRef.current = socket;
    socket.connect({
      slug,
      name,
      isAdmin,
      adminToken: adminToken ?? undefined,
    });

    const unsubConnected = socket.onConnected(() => setConnected(true));
    const unsubDisconnected = socket.onDisconnected(() => setConnected(false));
    const unsubError = socket.onError((message) => setError(message));
    const unsubRoomState = socket.onRoomState((state) => {
      setRoomState(state);
      if (state.buzzedParticipantId == null) setBuzzedName(null);
    });
    const unsubParticipants = socket.onParticipantList((list) =>
      setParticipants(list)
    );
    const unsubRevealed = socket.onQuestionRevealed(() => {
      setRoomState((s) => (s ? { ...s, isRevealed: true } : null));
    });
    const unsubBuzzer = socket.onBuzzerPressed((buzzedName) =>
      setBuzzedName(buzzedName)
    );

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubError();
      unsubRoomState();
      unsubParticipants();
      unsubRevealed();
      unsubBuzzer();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [slug, name, isAdmin, adminToken, createRoomSocket]);

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
