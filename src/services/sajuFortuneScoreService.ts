import { getSajuLuckScores } from "./sajuLuckScoreService";

type SajuFortuneScoreInput = {
  baseScore: number;
  dayStem: string;
  gyeokguk: string;
  monthTenGod: string;
  strengthType: string;
  strongestName: string;
  weakestName: string;
};

export function getSajuFortuneScores({
  baseScore,
  dayStem,
  gyeokguk,
  monthTenGod,
  strengthType,
  strongestName,
  weakestName,
}: SajuFortuneScoreInput) {
  return getSajuLuckScores({
    baseScore,
    dayStem,
    gyeokguk,
    monthTenGod,
    strengthType,
    strongestName,
    weakestName,
  });
}