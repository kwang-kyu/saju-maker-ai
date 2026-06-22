import { getDayStrengthAnalysis } from "../data/dayStrengthService";

export function getSajuStrengthInfo(
  normalizedDayStem: string,
  monthGanZhi: string,
  wood: number,
  fire: number,
  earth: number,
  metal: number,
  water: number
) {
  return getDayStrengthAnalysis(
    normalizedDayStem,
    monthGanZhi,
    wood,
    fire,
    earth,
    metal,
    water
  );
}