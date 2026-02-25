import type { Round } from "../../domain/models";
import { API, fetchWithTimeout } from "./client";

export async function createRound(
  slug: string,
  name: string,
  adminToken: string
): Promise<Round> {
  const res = await fetchWithTimeout(`${API}/rooms/${slug}/rounds`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, adminToken }),
  });
  if (!res.ok) throw new Error("Failed to create round");
  return res.json();
}

export async function deleteRound(
  slug: string,
  roundId: string,
  adminToken: string
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API}/rooms/${slug}/rounds/${roundId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminToken }),
    }
  );
  if (!res.ok) throw new Error("Failed to delete round");
}
