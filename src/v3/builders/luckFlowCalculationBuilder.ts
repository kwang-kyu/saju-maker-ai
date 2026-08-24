/// <reference path="../../lunar-javascript.d.ts" />

import { Solar } from "lunar-javascript";

import type {
  V3CurrentDaeun,
  V3CurrentSeun,
  V3JieQiBoundary,
  V3LuckFlowCalculationInput,
  V3LuckFlowCalculationResult,
  V3TargetIlun,
  V3TargetPeriodLuckFlow,
  V3TargetPeriodLuckFlowInput,
  V3WolunSegment,
  V3YearGanZhiSegment,
} from "../types/luckFlowCalculation.js";

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

  getMonthInGanZhiExact(): string;

  getDayInGanZhiExact(): string;

  getJieQi(): string;
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

export function assertV3LuckFlowGender(
  gender:
    string,
): V3LuckFlowCalculationInput["gender"] {
  if (
    gender === "male"
  ) {
    return "male";
  }

  if (
    gender === "female"
  ) {
    return "female";
  }

  throw new Error(
    `gender must be male or female, received: ${gender}`,
  );
}

function resolveGenderCode(
  gender: V3LuckFlowCalculationInput["gender"],
): number {
  const validatedGender =
    assertV3LuckFlowGender(
      gender,
    );

  if (
    validatedGender === "male"
  ) {
    return 1;
  }

  return 0;
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

function buildSolarAtNoon(
  date:
    ParsedDate,
): SolarValue {
  return Solar.fromYmdHms(
    date.year,
    date.month,
    date.day,
    12,
    0,
    0,
  ) as unknown as SolarValue;
}

function buildJieQiBoundary(
  date:
    ParsedDate,
  jieQiName:
    string,
): V3JieQiBoundary {
  return {
    name:
      jieQiName,

    date:
      [
        String(date.year),
        String(date.month).padStart(2, "0"),
        String(date.day).padStart(2, "0"),
      ].join("-"),
  };
}

export function buildV3WolunSegments(
  targetYear:
    number,
  targetMonth:
    number,
): V3WolunSegment[] {
  const lastDay =
    getDaysInMonth(
      targetYear,
      targetMonth,
    );

  const segments:
    V3WolunSegment[] = [];

  let currentGanZhi =
    "";

  let segmentStart =
    1;

  for (
    let day = 1;
    day <= lastDay;
    day += 1
  ) {
    const solar =
      buildSolarAtNoon({
        year: targetYear,
        month: targetMonth,
        day,
      });

    const lunar =
      solar.getLunar();

    const monthGanZhi =
      lunar.getMonthInGanZhiExact();

    const jieQi =
      lunar.getJieQi().trim();

    if (
      currentGanZhi
      !== ""
      && monthGanZhi
      !== currentGanZhi
    ) {
      const {
        heavenlyStem,
        earthlyBranch,
      } = splitGanZhi(
        currentGanZhi,
        "wolunSegment",
      );

      segments.push({
        targetYear,
        targetMonth,
        ganZhi: currentGanZhi,
        heavenlyStem,
        earthlyBranch,
        startDate:
          [
            String(targetYear),
            String(targetMonth).padStart(2, "0"),
            String(segmentStart).padStart(2, "0"),
          ].join("-"),
        endDate:
          [
            String(targetYear),
            String(targetMonth).padStart(2, "0"),
            String(day - 1).padStart(2, "0"),
          ].join("-"),
        jieQiBoundary:
          jieQi.length > 0
            ? buildJieQiBoundary(
                {
                  year: targetYear,
                  month: targetMonth,
                  day,
                },
                jieQi,
              )
            : null,
      });

      segmentStart = day;
    }

    if (
      day === 1
    ) {
      currentGanZhi =
        monthGanZhi;
    } else if (
      monthGanZhi
      !== currentGanZhi
    ) {
      currentGanZhi =
        monthGanZhi;
    }

    if (
      day === lastDay
    ) {
      const {
        heavenlyStem,
        earthlyBranch,
      } = splitGanZhi(
        currentGanZhi,
        "wolunSegment",
      );

      segments.push({
        targetYear,
        targetMonth,
        ganZhi: currentGanZhi,
        heavenlyStem,
        earthlyBranch,
        startDate:
          [
            String(targetYear),
            String(targetMonth).padStart(2, "0"),
            String(segmentStart).padStart(2, "0"),
          ].join("-"),
        endDate:
          [
            String(targetYear),
            String(targetMonth).padStart(2, "0"),
            String(day).padStart(2, "0"),
          ].join("-"),
        jieQiBoundary: null,
      });
    }
  }

  return segments;
}

export function buildV3TargetIlun(
  targetDateIso:
    string,
): V3TargetIlun {
  const date =
    parseDate(
      targetDateIso,
      "targetDate",
    );

  const solar =
    buildSolarAtNoon(date);

  const ganZhi =
    solar
      .getLunar()
      .getDayInGanZhiExact();

  const {
    heavenlyStem,
    earthlyBranch,
  } = splitGanZhi(
    ganZhi,
    "targetIlun",
  );

  return {
    targetDate:
      targetDateIso,

    ganZhi,

    heavenlyStem,

    earthlyBranch,
  };
}

function compareParsedDates(
  left:
    ParsedDate,
  right:
    ParsedDate,
): number {
  return (
    toComparableDate(left)
    - toComparableDate(right)
  );
}

function clipParsedDateToRange(
  date:
    ParsedDate,
  rangeStart:
    ParsedDate,
  rangeEnd:
    ParsedDate,
): ParsedDate {
  if (
    compareParsedDates(
      date,
      rangeStart,
    )
    < 0
  ) {
    return rangeStart;
  }

  if (
    compareParsedDates(
      date,
      rangeEnd,
    )
    > 0
  ) {
    return rangeEnd;
  }

  return date;
}

function datesOverlapRange(
  segmentStartDate:
    string,
  segmentEndDate:
    string,
  rangeStartDate:
    string,
  rangeEndDate:
    string,
): boolean {
  const segmentStart =
    parseDate(
      segmentStartDate,
      "segmentStartDate",
    );

  const segmentEnd =
    parseDate(
      segmentEndDate,
      "segmentEndDate",
    );

  const rangeStart =
    parseDate(
      rangeStartDate,
      "rangeStartDate",
    );

  const rangeEnd =
    parseDate(
      rangeEndDate,
      "rangeEndDate",
    );

  return (
    compareParsedDates(
      segmentStart,
      rangeEnd,
    )
    <= 0
    && compareParsedDates(
      segmentEnd,
      rangeStart,
    )
    >= 0
  );
}

function filterWolunSegmentsByRange(
  segments:
    readonly V3WolunSegment[],
  rangeStartDate:
    string,
  rangeEndDate:
    string,
): V3WolunSegment[] {
  return segments
    .filter(
      (
        segment,
      ) =>
        datesOverlapRange(
          segment.startDate,
          segment.endDate,
          rangeStartDate,
          rangeEndDate,
        ),
    )
    .map(
      (
        segment,
      ) => {
        const rangeStart =
          parseDate(
            rangeStartDate,
            "rangeStartDate",
          );

        const rangeEnd =
          parseDate(
            rangeEndDate,
            "rangeEndDate",
          );

        const segmentStart =
          parseDate(
            segment.startDate,
            "segment.startDate",
          );

        const segmentEnd =
          parseDate(
            segment.endDate,
            "segment.endDate",
          );

        const clippedStart =
          clipParsedDateToRange(
            segmentStart,
            rangeStart,
            rangeEnd,
          );

        const clippedEnd =
          clipParsedDateToRange(
            segmentEnd,
            rangeStart,
            rangeEnd,
          );

        return {
          ...segment,

          startDate:
            formatParsedDate(
              clippedStart,
            ),

          endDate:
            formatParsedDate(
              clippedEnd,
            ),
        };
      },
    );
}

function buildYearGanZhiSegments(
  rangeStartDate:
    string,
  rangeEndDate:
    string,
): {
  segments:
    V3YearGanZhiSegment[];

  limitations:
    string[];
} {
  const rangeStart =
    parseDate(
      rangeStartDate,
      "rangeStartDate",
    );

  const rangeEnd =
    parseDate(
      rangeEndDate,
      "rangeEndDate",
    );

  if (
    compareParsedDates(
      rangeEnd,
      rangeStart,
    )
    < 0
  ) {
    throw new Error(
      "rangeEndDate cannot be earlier than rangeStartDate.",
    );
  }

  const segments:
    V3YearGanZhiSegment[] = [];

  const limitations:
    string[] = [];

  let currentGanZhi =
    "";

  let segmentStartDate:
    ParsedDate | null =
    null;

  let transitionGanZhi:
    string | null =
    null;

  let transitionYear:
    number | null =
    null;

  let cursor =
    rangeStart;

  while (
    compareParsedDates(
      cursor,
      rangeEnd,
    )
    <= 0
  ) {
    const solar =
      buildSolarAtNoon(cursor);

    const lunar =
      solar.getLunar();

    const yearGanZhi =
      lunar.getYearInGanZhiExact();

    const jieQi =
      lunar.getJieQi().trim();

    if (
      currentGanZhi
      !== ""
      && yearGanZhi
      !== currentGanZhi
    ) {
      const previousEnd =
        addDaysToParsedDate(
          cursor,
          -1,
        );

      const {
        heavenlyStem,
        earthlyBranch,
      } = splitGanZhi(
        currentGanZhi,
        "yearSegment",
      );

      segments.push({
        ganZhi: currentGanZhi,
        heavenlyStem,
        earthlyBranch,
        startDate:
          formatParsedDate(
            segmentStartDate
            ?? rangeStart,
          ),
        endDate:
          formatParsedDate(
            previousEnd,
          ),
        jieQiBoundary:
          jieQi.length > 0
            ? buildJieQiBoundary(
                cursor,
                jieQi,
              )
            : null,
      });

      transitionGanZhi =
        yearGanZhi;

      transitionYear =
        cursor.year;

      segmentStartDate =
        cursor;
    }

    if (
      segmentStartDate
      === null
    ) {
      segmentStartDate =
        cursor;
    }

    if (
      currentGanZhi
      === ""
    ) {
      currentGanZhi =
        yearGanZhi;
    } else if (
      yearGanZhi
      !== currentGanZhi
    ) {
      currentGanZhi =
        yearGanZhi;
    }

    if (
      compareParsedDates(
        cursor,
        rangeEnd,
      )
      === 0
    ) {
      const {
        heavenlyStem,
        earthlyBranch,
      } = splitGanZhi(
        currentGanZhi,
        "yearSegment",
      );

      segments.push({
        ganZhi: currentGanZhi,
        heavenlyStem,
        earthlyBranch,
        startDate:
          formatParsedDate(
            segmentStartDate
            ?? rangeStart,
          ),
        endDate:
          formatParsedDate(
            rangeEnd,
          ),
        jieQiBoundary: null,
      });
    }

    cursor =
      addDaysToParsedDate(
        cursor,
        1,
      );
  }

  if (
    segments.length
    > 1
    && transitionGanZhi
    && transitionYear
  ) {
    limitations.push(
      `${transitionYear}년 대상 범위(${rangeStartDate}~${rangeEndDate}) 안에서 입춘 전후로 연주가 ${segments[0]?.ganZhi ?? "미확인"}에서 ${transitionGanZhi}(으)로 바뀐다.`,
    );
  }

  return {
    segments,
    limitations,
  };
}

function addDaysToParsedDate(
  date:
    ParsedDate,
  days:
    number,
): ParsedDate {
  const utc =
    Date.UTC(
      date.year,
      date.month - 1,
      date.day + days,
    );

  const next =
    new Date(utc);

  return {
    year:
      next.getUTCFullYear(),

    month:
      next.getUTCMonth() + 1,

    day:
      next.getUTCDate(),
  };
}

function formatParsedDate(
  date:
    ParsedDate,
): string {
  return [
    String(date.year),
    String(date.month).padStart(2, "0"),
    String(date.day).padStart(2, "0"),
  ].join("-");
}

/**
 * 대상 기간의 대운·세운·월운·일운을 referenceDate가 아닌
 * targetStartDate 기준으로 다시 계산한다.
 */
export function buildV3TargetPeriodLuckFlow(
  input:
    V3TargetPeriodLuckFlowInput,
): V3TargetPeriodLuckFlow {
  const birthDate =
    parseDate(
      input.solarBirthDate,
      "solarBirthDate",
    );

  const targetStart =
    parseDate(
      input.targetStartDate,
      "targetStartDate",
    );

  const targetEnd =
    parseDate(
      input.targetEndDate,
      "targetEndDate",
    );

  if (
    toComparableDate(targetEnd)
    < toComparableDate(targetStart)
  ) {
    throw new Error(
      "targetEndDate cannot be earlier than targetStartDate.",
    );
  }

  if (
    toComparableDate(targetEnd)
    < toComparableDate(birthDate)
  ) {
    throw new Error(
      "target period cannot be entirely before solarBirthDate.",
    );
  }

  if (
    toComparableDate(targetStart)
    < toComparableDate(birthDate)
  ) {
    throw new Error(
      "target period cannot start before solarBirthDate.",
    );
  }

  const birthTime =
    parseTime(
      input.birthTime,
    );

  const genderCode =
    resolveGenderCode(
      input.gender,
    );

  const luckStartSect =
    resolveLuckStartSect(
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

  const targetSolar =
    buildSolarAtNoon(
      targetStart,
    );

  const yun =
    birthSolar
      .getLunar()
      .getEightChar()
      .getYun(
        genderCode,
        luckStartSect,
      );

  const nominalAge =
    targetStart.year
    - birthDate.year
    + 1;

  const daeunCount =
    Math.max(
      10,
      Math.ceil(nominalAge / 10) + 3,
    );

  const currentDaeun =
    selectCurrentDaeun(
      yun.getDaYun(daeunCount),
      targetStart.year,
    );

  const targetSeun =
    buildCurrentSeun(
      targetSolar,
      targetStart.year,
      birthDate.year,
    );

  const limitations:
    string[] = [];

  let wolunSegments:
    V3WolunSegment[] = [];

  let targetIlun:
    V3TargetIlun | null = null;

  let yearSegments:
    V3YearGanZhiSegment[] = [];

  if (
    input.scope === "month"
    && input.targetYear
    !== null
    && input.targetMonth
    !== null
  ) {
    wolunSegments =
      filterWolunSegmentsByRange(
        buildV3WolunSegments(
          input.targetYear,
          input.targetMonth,
        ),
        input.targetStartDate,
        input.targetEndDate,
      );
  }

  if (
    input.scope === "halfYear"
    && input.targetYear
    !== null
  ) {
    const firstMonth =
      targetStart.month;
    const lastMonth =
      targetEnd.month;

    for (
      let month = firstMonth;
      month <= lastMonth;
      month += 1
    ) {
      wolunSegments.push(
        ...filterWolunSegmentsByRange(
          buildV3WolunSegments(
            input.targetYear,
            month,
          ),
          input.targetStartDate,
          input.targetEndDate,
        ),
      );
    }
  }

  if (
    input.scope === "year"
    && input.includeWolunSegments
    && input.targetYear
    !== null
  ) {
    const firstMonth =
      targetStart.month;

    const lastMonth =
      targetEnd.month;

    for (
      let month = firstMonth;
      month <= lastMonth;
      month += 1
    ) {
      wolunSegments.push(
        ...filterWolunSegmentsByRange(
          buildV3WolunSegments(
            input.targetYear,
            month,
          ),
          input.targetStartDate,
          input.targetEndDate,
        ),
      );
    }
  }

  if (
    input.scope === "day"
  ) {
    targetIlun =
      buildV3TargetIlun(
        input.targetStartDate,
      );
  }

  if (
    input.scope === "year"
    || input.scope === "halfYear"
    || input.scope === "month"
  ) {
    const yearResult =
      buildYearGanZhiSegments(
        input.targetStartDate,
        input.targetEndDate,
      );

    yearSegments =
      yearResult.segments;

    limitations.push(
      ...yearResult.limitations,
    );
  }

  return {
    referenceDate:
      input.targetStartDate,

    targetStartDate:
      input.targetStartDate,

    targetEndDate:
      input.targetEndDate,

    currentDaeun,

    targetSeun,

    yearSegments,

    wolunSegments,

    targetIlun,

    limitations,
  };
}
