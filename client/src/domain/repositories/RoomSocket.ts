import type { Participant, RoomState } from "../models";

export interface RoomSocketJoinParams {
  slug: string;
  name: string;
  isAdmin: boolean;
  adminToken?: string;
}

/** Unsubscribe function returned by on* methods */
export type Unsubscribe = () => void;

export interface IRoomSocket {
  connect(params: RoomSocketJoinParams): void;
  disconnect(): void;
  onConnected(cb: () => void): Unsubscribe;
  onDisconnected(cb: () => void): Unsubscribe;
  onError(cb: (message: string) => void): Unsubscribe;
  onRoomState(cb: (state: RoomState) => void): Unsubscribe;
  onParticipantList(cb: (participants: Participant[]) => void): Unsubscribe;
  onQuestionRevealed(cb: () => void): Unsubscribe;
  onBuzzerPressed(cb: (name: string) => void): Unsubscribe;
  emit(event: string, payload?: object): void;
}
