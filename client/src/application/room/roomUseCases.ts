import type { Room } from "../../domain/models";
import type { IRoundRepository, IQuestionRepository } from "../../domain/repositories";

/**
 * Creates a round and returns the room with the new round merged in.
 * Pure use case: no React, easy to unit test with a mock IRoundRepository.
 */
export async function addRound(
  roundRepository: IRoundRepository,
  slug: string,
  roundName: string,
  adminToken: string,
  currentRoom: Room | null
): Promise<Room | null> {
  const round = await roundRepository.createRound(slug, roundName, adminToken);
  if (!currentRoom) return null;
  const rounds = [...(currentRoom.rounds ?? []), { ...round, questions: round.questions ?? [] }].sort(
    (a, b) => a.order - b.order
  );
  return { ...currentRoom, rounds };
}

/**
 * Adds a question to the active round and returns the room with the new question(s) merged in.
 * Pure use case: no React, easy to unit test with a mock IQuestionRepository.
 */
export async function addQuestion(
  questionRepository: IQuestionRepository,
  slug: string,
  roundId: string,
  questionText: string,
  adminToken: string,
  currentRoom: Room | null
): Promise<Room | null> {
  const added = await questionRepository.addQuestions(
    slug,
    roundId,
    [{ text: questionText }],
    adminToken
  );
  if (!currentRoom) return null;
  const newQuestions = Array.isArray(added) ? added : [added];
  const rounds = currentRoom.rounds.map((round) =>
    round.id === roundId
      ? {
          ...round,
          questions: [...(round.questions ?? []), ...newQuestions].sort(
            (a, b) => a.order - b.order
          ),
        }
      : round
  );
  return { ...currentRoom, rounds };
}
