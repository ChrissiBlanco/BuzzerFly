/**
 * In-memory store for room state and participants (keyed by room slug).
 * Room state: activeRoundId, currentQuestionIndex, isRevealed, buzzedParticipantId
 * Participants: map socketId -> { name, roomSlug, isAdmin }
 */

/** @type {Map<string, { activeRoundId: string | null, currentQuestionIndex: number, isRevealed: boolean, buzzedParticipantId: string | null }>} */
export const roomStates = new Map();

/** @type {Map<string, Map<string, { name: string, roomSlug: string, isAdmin: boolean }>>} */
export const participantsByRoom = new Map();

/** @type {Map<string, string>} slug -> socketId of admin */
export const adminByRoom = new Map();

/**
 * @param {string} slug
 * @param {string | null} activeRoundId
 * @param {number} questionCount
 */
export function initRoomState(slug, activeRoundId = null, questionCount = 0) {
  if (!roomStates.has(slug)) {
    roomStates.set(slug, {
      activeRoundId,
      currentQuestionIndex: 0,
      isRevealed: false,
      buzzedParticipantId: null,
      questionCount,
    });
  }
  return roomStates.get(slug);
}

/**
 * @param {string} slug
 */
export function getRoomState(slug) {
  return roomStates.get(slug);
}

/**
 * @param {string} slug
 * @param {Partial<{ activeRoundId: string | null, currentQuestionIndex: number, isRevealed: boolean, buzzedParticipantId: string | null, questionCount: number }>} updates
 */
export function updateRoomState(slug, updates) {
  const state = roomStates.get(slug);
  if (!state) return null;
  Object.assign(state, updates);
  return state;
}

/**
 * @param {string} slug
 * @param {string} socketId
 * @param {string} name
 * @param {boolean} isAdmin
 */
export function addParticipant(slug, socketId, name, isAdmin) {
  if (!participantsByRoom.has(slug)) {
    participantsByRoom.set(slug, new Map());
  }
  const participants = participantsByRoom.get(slug);
  participants.set(socketId, { name, roomSlug: slug, isAdmin });
  if (isAdmin) {
    adminByRoom.set(slug, socketId);
  }
}

/**
 * @param {string} socketId
 */
export function removeParticipant(socketId) {
  for (const [slug, participants] of participantsByRoom) {
    const p = participants.get(socketId);
    if (p) {
      participants.delete(socketId);
      if (adminByRoom.get(slug) === socketId) {
        adminByRoom.delete(slug);
      }
      return { slug, participants: Array.from(participants.entries()) };
    }
  }
  return null;
}

/**
 * @param {string} slug
 */
export function getParticipants(slug) {
  const participants = participantsByRoom.get(slug);
  if (!participants) return [];
  return Array.from(participants.entries()).map(([id, p]) => ({ id, name: p.name }));
}

/**
 * @param {string} slug
 * @param {string} socketId
 */
export function isAdmin(slug, socketId) {
  return adminByRoom.get(slug) === socketId;
}
