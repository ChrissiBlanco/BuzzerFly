import { API, fetchWithTimeout } from "./client";

export async function ensureUser(): Promise<{ userId: string }> {
  const res = await fetchWithTimeout(`${API}/users`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to ensure user");
  return res.json();
}
