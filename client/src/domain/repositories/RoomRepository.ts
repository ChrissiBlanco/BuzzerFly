import type { Room } from "../models";

export interface IRoomRepository {
  getRoom(slug: string): Promise<Room>;
  getMyRooms(): Promise<{ rooms: Room[] }>;
  createRoom(name?: string): Promise<{
    slug: string;
    adminToken: string;
    roomId: string;
    room: Room;
  }>;
  updateRoomName(
    slug: string,
    name: string,
    adminToken: string
  ): Promise<Room>;
}
