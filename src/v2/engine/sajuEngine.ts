import {
  getTenGodByStem,
  getTimeGanZhiByDayStem,
} from "../../data/tenGodService";
import { convertToSajuSolarDate } from "../../services/sajuDateService";
import { getSajuGanjiInfo } from "../../services/sajuGanjiService";
import { getSajuElementInfo } from "../../services/sajuElementService";
import type { SajuEngineInput, SajuEngineResult } from "../types/saju";

function safeCall(target: any, methodName: string, fallback = ""): string {
  try {
    const value = target?.[methodName]?.();
    return value || fallback;
  } catch {
    return fallback;
  }
}

function parseBirthDate(birthDate: string) {
  const parts = birthDate.split("-");
  return {
    year: parts[0],
    month: parts[1],
    day: parts[2],
  };
}

export function calculateSaju(input: SajuEngineInput): SajuEngineResult {
  const birth = parseBirthDate(input.birthDate);

  const sajuDate = convertToSajuSolarDate({
    birthYear: birth.year,
    birthMonth: birth.month,
    birthDay: birth.day,
    calendarType: input.calendarType ?? "solar",
  });

  const ganji = getSajuGanjiInfo({
    finalSolarYear: sajuDate.finalSolarYear,
    finalSolarMonth: sajuDate.finalSolarMonth,
    finalSolarDay: sajuDate.finalSolarDay,
    safeCall,
  });

  const dayMaster = String(ganji.dayGanZhi).charAt(0);
  const dayStem = String(ganji.dayGanZhi).charAt(0);
  const timeGanZhi = getTimeGanZhiByDayStem(dayStem, input.birthTime);
  const yearTenGod = getTenGodByStem(dayStem, String(ganji.yearGanZhi).charAt(0));
  const monthTenGod = getTenGodByStem(dayStem, String(ganji.monthGanZhi).charAt(0));
  const timeTenGod = getTenGodByStem(dayStem, String(timeGanZhi).charAt(0));
  const elementInfo = getSajuElementInfo({
    yearGanZhi: ganji.yearGanZhi,
    monthGanZhi: ganji.monthGanZhi,
    dayGanZhi: ganji.dayGanZhi,
   
    timeGanZhi,
  });

  return {
    name: input.name,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    gender: input.gender,
    calendarType: input.calendarType ?? "solar",
    solarDate: sajuDate.solarDate,
    lunarDate: sajuDate.lunarDate,
    yearGanZhi: ganji.yearGanZhi,
    monthGanZhi: ganji.monthGanZhi,
    dayGanZhi: ganji.dayGanZhi,
    timeGanZhi,
    yearTenGod,
    monthTenGod,
    timeTenGod,
    dayMaster,
    strongestElement: elementInfo.strongest.name,
    weakestElement: elementInfo.weakest.name,
  };
}
