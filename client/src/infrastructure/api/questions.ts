import type { Question } from "../../domain/models";
import { API, fetchWithTimeout } from "./client";

export async function addQuestions(
  slug: string,
  roundId: string,
  questions: { text: string }[],
  adminToken?: string
): Promise<Question[]> {
  const body: Record<string, unknown> =
    questions.length === 1
      ? { text: questions[0].text }
      : { questions };
  if (adminToken) body.adminToken = adminToken;
  const res = await fetchWithTimeout(
    `${API}/rooms/${slug}/rounds/${roundId}/questions`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
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
  const res = await fetchWithTimeout(
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
  const res = await fetchWithTimeout(
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
