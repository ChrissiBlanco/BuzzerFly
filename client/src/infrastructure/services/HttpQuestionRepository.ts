import type { IQuestionRepository } from "../../domain/repositories";
import * as questionsApi from "../api/questions";

export const httpQuestionRepository: IQuestionRepository = {
  addQuestions: questionsApi.addQuestions,
  updateQuestion: questionsApi.updateQuestion,
  deleteQuestion: questionsApi.deleteQuestion,
};
