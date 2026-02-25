export type RoomState = {
  activeRoundId: string | null;
  activeRoundName: string | null;
  currentQuestionIndex: number;
  isRevealed: boolean;
  questionText: string | null;
  buzzedParticipantId: string | null;
  questionCount?: number;
};
