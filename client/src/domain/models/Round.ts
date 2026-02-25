import type { Question } from "./Question";

export type Round = {
  id: string;
  roomId: string;
  name: string;
  order: number;
  questions: Question[];
};
