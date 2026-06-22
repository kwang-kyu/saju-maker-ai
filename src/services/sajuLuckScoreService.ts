import { getLuckScores } from "../data/luckScoreData";

type SajuLuckScoreInput = {
  baseScore: number;
  dayStem: string;
  gyeokguk: string;
  monthTenGod: string;
  strengthType: string;
  strongestName: string;
  weakestName: string;
};

export function getSajuLuckScores(input: SajuLuckScoreInput) {
  return getLuckScores(input);
}