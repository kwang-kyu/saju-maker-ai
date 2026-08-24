/// <reference path="../../lunar-javascript.d.ts" />

import {
  Solar,
} from "lunar-javascript";

import {
  getTenGodByStem,
} from "../../data/tenGodService.js";

import {
  convertToSajuSolarDate,
} from "../../services/sajuDateService.js";

import {
  getSajuElementInfo,
} from "../../services/sajuElementService.js";

import {
  getSajuGanjiInfo,
} from "../../services/sajuGanjiService.js";

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

  solarDateIso: string;

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

type ParsedBirthTime = {
  hour: number;

  minute: number;

  second: number;
};

type EightCharValue = {
  getTime(): string;
};

type LunarValue = {
  getEightChar(): EightCharValue;
};

type SolarValue = {
  getLunar(): LunarValue;
};

function safeCall(
  target: any,
  methodName: string,
  fallback = "",
): string {
  try {
    return (
      target?.[methodName]?.() ??
      fallback
    );
  } catch {
    return fallback;
  }
}

function parseBirthDate(
  birthDate: string,
) {
  const [
    year,
    month,
    day,
  ] = birthDate.split("-");

  return {
    year,

    month,

    day,
  };
}

function parseBirthTime(
  birthTime: string,
): ParsedBirthTime {
  const match =
    /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(
      birthTime,
    );

  if (!match) {
    throw new Error(
      "birthTime must use HH:mm or HH:mm:ss format.",
    );
  }

  return {
    hour: Number(match[1]),

    minute: Number(match[2]),

    second: Number(
      match[3] ?? "0",
    ),
  };
}

function formatIsoDate(params: {
  year: number;

  month: number;

  day: number;
}): string {
  const {
    year,
    month,
    day,
  } = params;

  return [
    String(year).padStart(4, "0"),

    String(month).padStart(2, "0"),

    String(day).padStart(2, "0"),
  ].join("-");
}

function buildTimeGanZhi(params: {
  solarYear: number;

  solarMonth: number;

  solarDay: number;

  birthTime: ParsedBirthTime;
}): string {
  const {
    solarYear,
    solarMonth,
    solarDay,
    birthTime,
  } = params;

  const solar =
    Solar.fromYmdHms(
      solarYear,
      solarMonth,
      solarDay,
      birthTime.hour,
      birthTime.minute,
      birthTime.second,
    ) as unknown as SolarValue;

  const timeGanZhi =
    solar
      .getLunar()
      .getEightChar()
      .getTime()
      .trim();

  if (timeGanZhi.length < 2) {
    throw new Error(
      "timeGanZhi could not be calculated.",
    );
  }

  return timeGanZhi;
}

export function buildV3SajuCalculation(
  input: V3SajuCalculationInput,
): V3CalculatedSaju {
  const birth =
    parseBirthDate(input.birthDate);

  const birthTime =
    parseBirthTime(input.birthTime);

  const sajuDate =
    convertToSajuSolarDate({
      birthYear: birth.year,

      birthMonth: birth.month,

      birthDay: birth.day,

      calendarType:
        input.calendarType ??
        "solar",
    });

  const ganji =
    getSajuGanjiInfo({
      finalSolarYear:
        sajuDate.finalSolarYear,

      finalSolarMonth:
        sajuDate.finalSolarMonth,

      finalSolarDay:
        sajuDate.finalSolarDay,

      safeCall,
    });

  const dayMaster =
    ganji.dayGanZhi.charAt(0);

  const timeGanZhi =
    buildTimeGanZhi({
      solarYear:
        sajuDate.finalSolarYear,

      solarMonth:
        sajuDate.finalSolarMonth,

      solarDay:
        sajuDate.finalSolarDay,

      birthTime,
    });

  const yearTenGod =
    getTenGodByStem(
      dayMaster,
      ganji.yearGanZhi.charAt(0),
    );

  const monthTenGod =
    getTenGodByStem(
      dayMaster,
      ganji.monthGanZhi.charAt(0),
    );

  const timeTenGod =
    getTenGodByStem(
      dayMaster,
      timeGanZhi.charAt(0),
    );

  const element =
    getSajuElementInfo({
      yearGanZhi:
        ganji.yearGanZhi,

      monthGanZhi:
        ganji.monthGanZhi,

      dayGanZhi:
        ganji.dayGanZhi,

      timeGanZhi,
    });

  return {
    name: input.name,

    birthDate: input.birthDate,

    birthTime: input.birthTime,

    gender: input.gender,

    calendarType:
      input.calendarType ??
      "solar",

    solarDate:
      sajuDate.solarDate,

    solarDateIso:
      formatIsoDate({
        year:
          sajuDate.finalSolarYear,

        month:
          sajuDate.finalSolarMonth,

        day:
          sajuDate.finalSolarDay,
      }),

    lunarDate:
      sajuDate.lunarDate,

    yearGanZhi:
      ganji.yearGanZhi,

    monthGanZhi:
      ganji.monthGanZhi,

    dayGanZhi:
      ganji.dayGanZhi,

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

    strongestElement:
      element.strongest.name,

    weakestElement:
      element.weakest.name,
  };
}