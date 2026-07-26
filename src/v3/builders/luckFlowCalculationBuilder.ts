import { Solar } from "lunar-javascript";

import type {
  V3CurrentDaeun,
  V3CurrentSeun,
  V3LuckFlowCalculationInput,
  V3LuckFlowCalculationResult,
} from "../types/luckFlowCalculation";

type ParsedDate = {
  year: number;

  month: number;

  day: number;
};

type ParsedTime = {
  hour: number;

  minute: number;

  second: number;
};

type LunarValue = {
  getEightChar(): EightCharValue;

  getYearInGanZhiExact(): string;
};

type SolarValue = {
  getLunar(): LunarValue;

  toYmd(): string;
};

type EightCharValue = {
  getYun(
    gender: number,
    sect: number,
  ): YunValue;
};

type YunValue = {
  getStartYear(): number;

  getStartMonth(): number;

  getStartDay(): number;

  getStartHour(): number;

  getStartSolar(): SolarValue;

  isForward(): boolean;

  getDaYun(count: number): DaeunValue[];
};

type DaeunValue = {
  getIndex(): number;

  getGanZhi(): string;

  getStartYear(): number;

  getEndYear(): number;

  getStartAge(): number;

  getEndAge(): number;
};

function isLeapYear(year: number): boolean {
  return (
    year % 400 === 0 ||
    (year % 4 === 0 && year % 100 !== 0)
  );
}

function getDaysInMonth(
  year: number,
  month: number,
): number {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return days[month - 1] ?? 0;
}

function parseDate(
  value: string,
  fieldName: string,
): ParsedDate {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(
      `${fieldName} must use YYYY-MM-DD format.`,
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const daysInMonth = getDaysInMonth(
    year,
    month,
  );

  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth
  ) {
    throw new Error(
      `${fieldName} must be a valid calendar date.`,
    );
  }

  return {
    year,
    month,
    day,
  };
}

function parseTime(value: string): ParsedTime {
  const match =
    /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(
      value,
    );

  if (!match) {
    throw new Error(
      "birthTime must use HH:mm or HH:mm:ss format.",
    );
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
    second: Number(match[3] ?? "0"),
  };
}

function toComparableDate(
  date: ParsedDate,
): number {
  return (
    date.year * 10_000 +
    date.month * 100 +
    date.day
  );
}

function resolveGenderCode(
  gender: V3LuckFlowCalculationInput["gender"],
): number {
  if (gender === "male") {
    return 1;
  }

  if (gender === "female") {
    return 0;
  }

  throw new Error(
    "gender must be male or female.",
  );
}

function resolveLuckStartSect(
  method:
    V3LuckFlowCalculationInput["luckStartMethod"],
): number {
  if (method === "minuteBased") {
    return 2;
  }

  throw new Error(
    "Unsupported luck start calculation method.",
  );
}

function splitGanZhi(
  ganZhi: string,
  fieldName: string,
): {
  heavenlyStem: string;
  earthlyBranch: string;
} {
  const normalized = ganZhi.trim();

  if (normalized.length < 2) {
    throw new Error(
      `${fieldName} ganZhi could not be calculated.`,
    );
  }

  return {
    heavenlyStem: normalized.charAt(0),
    earthlyBranch: normalized.charAt(1),
  };
}

function selectCurrentDaeun(
  daeunValues: DaeunValue[],
  referenceYear: number,
): V3CurrentDaeun | null {
  const current = daeunValues.find(
    (daeun) =>
      daeun.getIndex() > 0 &&
      referenceYear >= daeun.getStartYear() &&
      referenceYear <= daeun.getEndYear(),
  );

  if (!current) {
    return null;
  }

  const ganZhi = current.getGanZhi();
  const {
    heavenlyStem,
    earthlyBranch,
  } = splitGanZhi(
    ganZhi,
    "currentDaeun",
  );

  return {
    index: current.getIndex(),

    ganZhi,

    heavenlyStem,

    earthlyBranch,

    startYear: current.getStartYear(),

    endYear: current.getEndYear(),

    startAge: current.getStartAge(),

    endAge: current.getEndAge(),
  };
}

function buildCurrentSeun(
  referenceSolar: SolarValue,
  referenceYear: number,
  birthYear: number,
): V3CurrentSeun {
  const ganZhi =
    referenceSolar
      .getLunar()
      .getYearInGanZhiExact();

  const {
    heavenlyStem,
    earthlyBranch,
  } = splitGanZhi(
    ganZhi,
    "currentSeun",
  );

  return {
    year: referenceYear,

    age: referenceYear - birthYear + 1,

    ganZhi,

    heavenlyStem,

    earthlyBranch,
  };
}

export function buildV3LuckFlowCalculation(
  input: V3LuckFlowCalculationInput,
): V3LuckFlowCalculationResult {
  const birthDate = parseDate(
    input.solarBirthDate,
    "solarBirthDate",
  );

  const referenceDate = parseDate(
    input.referenceDate,
    "referenceDate",
  );

  if (
    toComparableDate(referenceDate) <
    toComparableDate(birthDate)
  ) {
    throw new Error(
      "referenceDate cannot be earlier than solarBirthDate.",
    );
  }

  const birthTime = parseTime(
    input.birthTime,
  );

  const genderCode = resolveGenderCode(
    input.gender,
  );

  const luckStartSect = resolveLuckStartSect(
    input.luckStartMethod,
  );

  const birthSolar =
    Solar.fromYmdHms(
      birthDate.year,
      birthDate.month,
      birthDate.day,
      birthTime.hour,
      birthTime.minute,
      birthTime.second,
    ) as unknown as SolarValue;

  const referenceSolar =
    Solar.fromYmdHms(
      referenceDate.year,
      referenceDate.month,
      referenceDate.day,
      12,
      0,
      0,
    ) as unknown as SolarValue;

  const yun =
    birthSolar
      .getLunar()
      .getEightChar()
      .getYun(
        genderCode,
        luckStartSect,
      );

  const nominalAge =
    referenceDate.year -
    birthDate.year +
    1;

  const daeunCount = Math.max(
    10,
    Math.ceil(nominalAge / 10) + 3,
  );

  const currentDaeun =
    selectCurrentDaeun(
      yun.getDaYun(daeunCount),
      referenceDate.year,
    );

  const currentSeun =
    buildCurrentSeun(
      referenceSolar,
      referenceDate.year,
      birthDate.year,
    );

  return {
    referenceDate: input.referenceDate,

    referenceYear: referenceDate.year,

    isForward: yun.isForward(),

    luckStartMethod:
      input.luckStartMethod,

    luckStart: {
      year: yun.getStartYear(),

      month: yun.getStartMonth(),

      day: yun.getStartDay(),

      hour: yun.getStartHour(),

      solarDate:
        yun.getStartSolar().toYmd(),
    },

    currentDaeun,

    currentSeun,
  };
}