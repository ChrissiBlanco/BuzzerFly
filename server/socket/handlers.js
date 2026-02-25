import { Server } from "socket.io";
import { prisma } from "../lib/prisma.js";
import { ADMIN_TOKEN_PREFIX } from "../lib/constants.js";
import {
  roomStates,
  participantsByRoom,
  adminByRoom,
  initRoomState,
  getRoomState,
  updateRoomState,
  addParticipant,
  removeParticipant,
  getParticipants,
  isAdmin,
} from "./store.js";

/**
 * Build room_state payload for a slug (include activeRoundName, questionText from DB)
 */
async function buildRoomStatePayload(slug) {
  const state = getRoomState(slug);
  if (!state) return null;
  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      rounds: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } },
    },
  });
  if (!room) return null;
  const activeRound = room.rounds.find((r) => r.id === state.activeRoundId);
  const activeRoundName = activeRound?.name ?? null;
  const questionCount = activeRound?.questions?.length ?? 0;
  let questionText = null;
  if (state.isRevealed && activeRound?.questions?.[state.currentQuestionIndex]) {
    questionText = activeRound.questions[state.currentQuestionIndex].text;
  }
  return {
    activeRoundId: state.activeRoundId,
    activeRoundName,
    currentQuestionIndex: state.currentQuestionIndex,
    isRevealed: state.isRevealed,
    questionText,
    buzzedParticipantId: state.buzzedParticipantId,
    questionCount,
  };
}

/**
 * @param {Server} io
 */
export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("join_room", async (payload) => {
      const { slug, name, isAdmin: isAdminClaim = false, adminToken } = payload ?? {};
      if (!slug || !name) {
        socket.emit("error", { message: "slug and name required" });
        return;
      }
      const room = await prisma.room.findUnique({
        where: { slug },
        include: { rounds: { orderBy: { order: "asc" }, include: { questions: true } } },
      });
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      let isAdminUser = false;
      if (isAdminClaim && adminToken === `${ADMIN_TOKEN_PREFIX}${room.id}`) {
        isAdminUser = true;
      }
      socket.join(slug);
      initRoomState(slug, room.rounds[0]?.id ?? null, room.rounds[0]?.questions?.length ?? 0);
      addParticipant(slug, socket.id, name, isAdminUser);
      const participants = getParticipants(slug);
      const roomState = await buildRoomStatePayload(slug);
      socket.emit("participant_list", { participants });
      socket.emit("room_state", roomState);
      socket.broadcast.to(slug).emit("participant_list", { participants });
      socket.broadcast.to(slug).emit("room_state", roomState);
    });

    socket.on("set_active_round", async (payload) => {
      const { slug, roundId } = payload ?? {};
      if (!slug) return;
      if (!isAdmin(slug, socket.id)) return;
      const room = await prisma.room.findUnique({
        where: { slug },
        include: { rounds: true },
      });
      if (!room || !room.rounds.some((r) => r.id === roundId)) return;
      updateRoomState(slug, {
        activeRoundId: roundId,
        currentQuestionIndex: 0,
        isRevealed: false,
        buzzedParticipantId: null,
      });
      const round = room.rounds.find((r) => r.id === roundId);
      const questionCount = round
        ? (await prisma.question.count({ where: { roundId: round.id } }))
        : 0;
      updateRoomState(slug, { questionCount });
      const roomState = await buildRoomStatePayload(slug);
      io.to(slug).emit("room_state", roomState);
    });

    socket.on("reveal", async (payload) => {
      const { slug } = payload ?? {};
      if (!slug || !isAdmin(slug, socket.id)) return;
      const state = getRoomState(slug);
      if (!state?.activeRoundId) return;
      const round = await prisma.round.findUnique({
        where: { id: state.activeRoundId },
        include: { questions: { orderBy: { order: "asc" } } },
      });
      if (!round) return;
      const question = round.questions[state.currentQuestionIndex];
      if (!question) return;
      updateRoomState(slug, { isRevealed: true });
      io.to(slug).emit("question_revealed", { questionText: question.text, index: state.currentQuestionIndex });
      const roomState = await buildRoomStatePayload(slug);
      io.to(slug).emit("room_state", roomState);
    });

    socket.on("next_question", async (payload) => {
      const { slug } = payload ?? {};
      if (!slug || !isAdmin(slug, socket.id)) return;
      const state = getRoomState(slug);
      if (!state) return;
      const round = state.activeRoundId
        ? await prisma.round.findUnique({
            where: { id: state.activeRoundId },
            include: { questions: true },
          })
        : null;
      const count = round?.questions?.length ?? 0;
      const nextIndex = Math.min(state.currentQuestionIndex + 1, Math.max(0, count - 1));
      updateRoomState(slug, {
        currentQuestionIndex: nextIndex,
        isRevealed: false,
        buzzedParticipantId: null,
      });
      updateRoomState(slug, { questionCount: count });
      const roomState = await buildRoomStatePayload(slug);
      io.to(slug).emit("room_state", roomState);
    });

    socket.on("set_current_question", async (payload) => {
      const { slug, index } = payload ?? {};
      if (!slug || !isAdmin(slug, socket.id)) return;
      const state = getRoomState(slug);
      if (!state?.activeRoundId) return;
      const round = await prisma.round.findUnique({
        where: { id: state.activeRoundId },
        include: { questions: true },
      });
      if (!round) return;
      const count = round.questions?.length ?? 0;
      const clampedIndex = Math.max(0, Math.min(Number(index) || 0, count - 1));
      updateRoomState(slug, {
        currentQuestionIndex: clampedIndex,
        isRevealed: false,
        buzzedParticipantId: null,
      });
      updateRoomState(slug, { questionCount: count });
      const roomState = await buildRoomStatePayload(slug);
      io.to(slug).emit("room_state", roomState);
    });

    socket.on("buzz", async (payload) => {
      const { slug, participantId, name } = payload ?? {};
      if (!slug) return;
      const state = getRoomState(slug);
      if (!state?.isRevealed || state.buzzedParticipantId) return;
      const participants = participantsByRoom.get(slug);
      const p = participants?.get(socket.id);
      const displayName = name ?? p?.name ?? participantId ?? socket.id;
      updateRoomState(slug, { buzzedParticipantId: socket.id });
      io.to(slug).emit("buzzer_pressed", { participantId: socket.id, name: displayName });
      const roomState = await buildRoomStatePayload(slug);
      io.to(slug).emit("room_state", roomState);
    });

    socket.on("disconnect", () => {
      const left = removeParticipant(socket.id);
      if (left) {
        const participants = Array.from(left.participants.entries()).map(([id, p]) => ({
          id,
          name: p.name,
        }));
        io.to(left.slug).emit("participant_list", { participants });
      }
    });
  });
}
