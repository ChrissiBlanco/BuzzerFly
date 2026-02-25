import type { IRoundRepository } from "../../domain/repositories";
import * as roundsApi from "../api/rounds";

export const httpRoundRepository: IRoundRepository = {
  createRound: roundsApi.createRound,
  deleteRound: roundsApi.deleteRound,
};
