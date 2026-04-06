import type { Question } from "../models";

export interface IQuestionRepository {
  addQuestions(
    slug: string,
    roundId: string,
    questions: { text: string }[],
    adminToken?: string
  ): Promise<Question[]>;
  updateQuestion(
    slug: string,
    roundId: string,
    questionId: string,
    data: { text?: string; order?: number },
    adminToken: string
  ): Promise<Question>;
  deleteQuestion(
    slug: string,
    roundId: string,
    questionId: string,
    adminToken: string
  ): Promise<void>;
}
