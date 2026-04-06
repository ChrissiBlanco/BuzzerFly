import type { Round } from "../models";

export interface IRoundRepository {
  createRound(
    slug: string,
    name: string,
    adminToken: string
  ): Promise<Round>;
  deleteRound(
    slug: string,
    roundId: string,
    adminToken: string
  ): Promise<void>;
}
