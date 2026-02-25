import type { Round } from "./Round";

export type Room = {
  id: string;
  slug: string;
  name: string | null;
  creatorId: string;
  createdAt: string;
  rounds: Round[];
};
