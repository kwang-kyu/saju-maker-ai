import {
    getTenGodByStem,
    getTimeGanZhiByDayStem,
  } from "../../data/tenGodService";
  import { convertToSajuSolarDate } from "../../services/sajuDateService";
  import { getSajuElementInfo } from "../../services/sajuElementService";
  import { getSajuGanjiInfo } from "../../services/sajuGanjiService";
  
  export type V3SajuCalculationInput = {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: string;
    calendarType?: string;
  };
  
  export type V3CalculatedSaju = {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: string;
    calendarType: string;
  
    solarDate: string;
    lunarDate: string;
  
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
    timeGanZhi: string;
  
    dayMaster: string;
  
    yearTenGod: string;
    monthTenGod: string;
    timeTenGod: string;
  
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  
    strongestElement: string;
    weakestElement: string;
  };
  
  function safeCall(
    target: any,
    methodName: string,
    fallback = "",
  ): string {
    try {
      return target?.[methodName]?.() ?? fallback;
    } catch {
      return fallback;
    }
  }
  
  function parseBirthDate(birthDate: string) {
    const [year, month, day] = birthDate.split("-");
  
    return {
      year,
      month,
      day,
    };
  }
  
  export function buildV3SajuCalculation(
    input: V3SajuCalculationInput,
  ): V3CalculatedSaju {
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
  
    const dayMaster = ganji.dayGanZhi.charAt(0);
  
    const timeGanZhi = getTimeGanZhiByDayStem(
      dayMaster,
      input.birthTime,
    );
  
    const yearTenGod = getTenGodByStem(
      dayMaster,
      ganji.yearGanZhi.charAt(0),
    );
  
    const monthTenGod = getTenGodByStem(
      dayMaster,
      ganji.monthGanZhi.charAt(0),
    );
  
    const timeTenGod = getTenGodByStem(
      dayMaster,
      timeGanZhi.charAt(0),
    );
  
    const element = getSajuElementInfo({
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
  
      dayMaster,
  
      yearTenGod,
      monthTenGod,
      timeTenGod,
  
      wood: element.wood,
      fire: element.fire,
      earth: element.earth,
      metal: element.metal,
      water: element.water,
  
      strongestElement: element.strongest.name,
      weakestElement: element.weakest.name,
    };
  }