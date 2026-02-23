const API = (import.meta.env.VITE_BACKEND_URL ?? "") + "/api";

export type Room = {
  id: string;
  slug: string;
  name: string | null;
  creatorId: string;
  createdAt: string;
  rounds: Round[];
};

export type Round = {
  id: string;
  roomId: string;
  name: string;
  order: number;
  questions: Question[];
};

export type Question = {
  id: string;
  roundId: string;
  order: number;
  text: string;
};

export async function ensureUser(): Promise<{ userId: string }> {
  const res = await fetch(`${API}/users`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to ensure user");
  return res.json();
}

export async function getMyRooms(): Promise<{ rooms: Room[] }> {
  const res = await fetch(`${API}/me/rooms`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to list rooms");
  return res.json();
}

export async function createRoom(name?: string): Promise<{ slug: string; adminToken: string; roomId: string; room: Room }> {
  const res = await fetch(`${API}/rooms`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(name != null && name.trim() ? { name: name.trim() } : {}),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to create room");
  }
  return res.json();
}

export async function getRoom(slug: string): Promise<Room> {
  const res = await fetch(`${API}/rooms/${slug}`, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Room not found");
    throw new Error("Failed to load room");
  }
  return res.json();
}

export async function updateRoomName(slug: string, name: string, adminToken: string): Promise<Room> {
  const res = await fetch(`${API}/rooms/${slug}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() || null, adminToken }),
  });
  if (!res.ok) throw new Error("Failed to update room name");
  return res.json();
}

export async function createRound(slug: string, name: string, adminToken: string): Promise<Round> {
  const res = await fetch(`${API}/rooms/${slug}/rounds`, {
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
  const res = await fetch(`${API}/rooms/${slug}/rounds/${roundId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminToken }),
  });
  if (!res.ok) throw new Error("Failed to delete round");
}

export async function addQuestions(
  slug: string,
  roundId: string,
  questions: { text: string }[],
  adminToken?: string
): Promise<Question[]> {
  const body: Record<string, unknown> = questions.length === 1
    ? { text: questions[0].text }
    : { questions };
  if (adminToken) body.adminToken = adminToken;
  const res = await fetch(`${API}/rooms/${slug}/rounds/${roundId}/questions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to add questions");
  return res.json();
}

export async function updateQuestion(
  slug: string,
  roundId: string,
  questionId: string,
  data: { text?: string; order?: number },
  adminToken: string
): Promise<Question> {
  const res = await fetch(
    `${API}/rooms/${slug}/rounds/${roundId}/questions/${questionId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, adminToken }),
    }
  );
  if (!res.ok) throw new Error("Failed to update question");
  return res.json();
}

export async function deleteQuestion(
  slug: string,
  roundId: string,
  questionId: string,
  adminToken: string
): Promise<void> {
  const res = await fetch(
    `${API}/rooms/${slug}/rounds/${roundId}/questions/${questionId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminToken }),
    }
  );
  if (!res.ok) throw new Error("Failed to delete question");
}
