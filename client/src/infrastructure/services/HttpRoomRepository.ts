import type { IRoomRepository } from "../../domain/repositories";
import * as roomsApi from "../api/rooms";

export const httpRoomRepository: IRoomRepository = {
  getRoom: roomsApi.getRoom,
  getMyRooms: roomsApi.getMyRooms,
  createRoom: roomsApi.createRoom,
  updateRoomName: roomsApi.updateRoomName,
};
