import { Solar } from "lunar-javascript";

type SajuGanjiParams = {
  finalSolarYear: number;
  finalSolarMonth: number;
  finalSolarDay: number;
  safeCall: (target: any, methodName: string, fallback?: string) => string;
};

export function getSajuGanjiInfo({
  finalSolarYear,
  finalSolarMonth,
  finalSolarDay,
  safeCall,
}: SajuGanjiParams) {
  const sajuSolar = Solar.fromYmd(
    finalSolarYear,
    finalSolarMonth,
    finalSolarDay
  );

  const sajuLunar: any = sajuSolar.getLunar();

  const yearGanZhi =
    sajuLunar.getYearInGanZhi?.() ||
    sajuLunar.getYearInGanZhiExact?.() ||
    `${sajuLunar.getYearGan?.() || ""}${sajuLunar.getYearZhi?.() || ""}` ||
    "계산 확인 필요";

  const monthGanZhi =
    sajuLunar.getMonthInGanZhi?.() ||
    sajuLunar.getMonthInGanZhiExact?.() ||
    `${sajuLunar.getMonthGan?.() || ""}${sajuLunar.getMonthZhi?.() || ""}` ||
    "계산 확인 필요";

  const dayGanZhi = safeCall(sajuLunar, "getDayInGanZhi", "");

  return {
    sajuSolar,
    sajuLunar,
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
  };
}