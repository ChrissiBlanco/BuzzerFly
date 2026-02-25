import { io, type Socket } from "socket.io-client";
import type { Participant, RoomState } from "../../domain/models";
import type { IRoomSocket, RoomSocketJoinParams, Unsubscribe } from "../../domain/repositories";

const SOCKET_URL = (
  import.meta.env.VITE_BACKEND_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173")
).replace(/\/$/, "");

export function createSocketIoRoomSocket(): IRoomSocket {
  let socket: Socket | null = null;
  let joinParams: RoomSocketJoinParams | null = null;

  const connectedCbs: Array<() => void> = [];
  const disconnectedCbs: Array<() => void> = [];
  const errorCbs: Array<(message: string) => void> = [];
  const roomStateCbs: Array<(state: RoomState) => void> = [];
  const participantListCbs: Array<(participants: Participant[]) => void> = [];
  const questionRevealedCbs: Array<() => void> = [];
  const buzzerPressedCbs: Array<(name: string) => void> = [];

  function connect(params: RoomSocketJoinParams): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    joinParams = params;
    socket = io(SOCKET_URL, { path: "/socket.io", transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      connectedCbs.forEach((cb) => cb());
      socket?.emit("join_room", {
        slug: params.slug,
        name: params.name,
        isAdmin: params.isAdmin,
        adminToken: params.adminToken ?? undefined,
      });
    });

    socket.on("disconnect", () => {
      disconnectedCbs.forEach((cb) => cb());
    });

    socket.on("error", (payload: { message?: string }) => {
      const message = payload?.message ?? "Error";
      errorCbs.forEach((cb) => cb(message));
    });

    socket.on("room_state", (state: RoomState) => {
      roomStateCbs.forEach((cb) => cb(state));
    });

    socket.on("participant_list", (payload: { participants: Participant[] }) => {
      participantListCbs.forEach((cb) => cb(payload.participants));
    });

    socket.on("question_revealed", () => {
      questionRevealedCbs.forEach((cb) => cb());
    });

    socket.on("buzzer_pressed", (payload: { name: string }) => {
      buzzerPressedCbs.forEach((cb) => cb(payload.name));
    });
  }

  function disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    joinParams = null;
  }

  function subscribe<T>(list: Array<(arg: T) => void>, cb: (arg: T) => void): Unsubscribe {
    list.push(cb as (arg: T) => void);
    return () => {
      const i = list.indexOf(cb as (arg: T) => void);
      if (i !== -1) list.splice(i, 1);
    };
  }

  function subscribe0(list: Array<() => void>, cb: () => void): Unsubscribe {
    list.push(cb);
    return () => {
      const i = list.indexOf(cb);
      if (i !== -1) list.splice(i, 1);
    };
  }

  return {
    connect,
    disconnect,
    onConnected(cb) {
      return subscribe0(connectedCbs, cb);
    },
    onDisconnected(cb) {
      return subscribe0(disconnectedCbs, cb);
    },
    onError(cb) {
      return subscribe(errorCbs, cb);
    },
    onRoomState(cb) {
      return subscribe(roomStateCbs, cb);
    },
    onParticipantList(cb) {
      return subscribe(participantListCbs, cb);
    },
    onQuestionRevealed(cb) {
      return subscribe0(questionRevealedCbs, cb);
    },
    onBuzzerPressed(cb) {
      return subscribe(buzzerPressedCbs, cb);
    },
    emit(event: string, payload?: object) {
      socket?.emit(event, payload ?? (joinParams ? { slug: joinParams.slug } : {}));
    },
  };
}
