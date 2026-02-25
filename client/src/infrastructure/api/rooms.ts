import type { Room } from "../../domain/models";
import { API, fetchWithTimeout } from "./client";

export async function getMyRooms(): Promise<{ rooms: Room[] }> {
  const res = await fetchWithTimeout(`${API}/me/rooms`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to list rooms");
  return res.json();
}

export async function createRoom(
  name?: string
): Promise<{ slug: string; adminToken: string; roomId: string; room: Room }> {
  const res = await fetchWithTimeout(`${API}/rooms`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      name != null && name.trim() ? { name: name.trim() } : {}
    ),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to create room");
  }
  return res.json();
}

export async function getRoom(slug: string): Promise<Room> {
  const res = await fetchWithTimeout(`${API}/rooms/${slug}`, {
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Room not found");
    throw new Error("Failed to load room");
  }
  return res.json();
}

export async function updateRoomName(
  slug: string,
  name: string,
  adminToken: string
): Promise<Room> {
  const res = await fetchWithTimeout(`${API}/rooms/${slug}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() || null, adminToken }),
  });
  if (!res.ok) throw new Error("Failed to update room name");
  return res.json();
}
