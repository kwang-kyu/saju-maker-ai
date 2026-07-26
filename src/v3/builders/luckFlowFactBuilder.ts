import {
    getTenGodByStem,
  } from "../../data/tenGodService";

  import type {
    V3CurrentDaeun,
    V3CurrentSeun,
    V3LuckFlowCalculationResult,
  } from "../types/luckFlowCalculation";

  import type {
    SajuCurrentDaeunFact,
    SajuCurrentSeunFact,
    SajuLuckFlowFact,
    SajuLuckFlowTenGod,
  } from "../types/luckFlowFact";

  import type {
    SajuFiveElement,
  } from "../types/sajuFacts";

  export type SajuLuckFlowFactBuilderInput = {
    solarBirthDate: string;

    dayMaster: string;

    calculation:
      V3LuckFlowCalculationResult;
  };

  type ParsedDate = {
    year: number;

    month: number;

    day: number;
  };

  const TEN_GODS:
    readonly SajuLuckFlowTenGod[] = [
      "비견",
      "겁재",
      "식신",
      "상관",
      "편재",
      "정재",
      "편관",
      "정관",
      "편인",
      "정인",
    ];

  const STEM_ELEMENT_MAP:
    Readonly<Record<string, SajuFiveElement>> = {
      甲: "wood",
      乙: "wood",
      갑: "wood",
      을: "wood",

      丙: "fire",
      丁: "fire",
      병: "fire",
      정: "fire",

      戊: "earth",
      己: "earth",
      무: "earth",
      기: "earth",

      庚: "metal",
      辛: "metal",
      경: "metal",
      신: "metal",

      壬: "water",
      癸: "water",
      임: "water",
      계: "water",
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

    const daysInMonth =
      getDaysInMonth(
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

  function toComparableDate(
    date: ParsedDate,
  ): number {
    return (
      date.year * 10_000 +
      date.month * 100 +
      date.day
    );
  }

  function calculateCurrentAge(
    solarBirthDate: string,
    referenceDate: string,
  ): number {
    const birth = parseDate(
      solarBirthDate,
      "solarBirthDate",
    );

    const reference = parseDate(
      referenceDate,
      "referenceDate",
    );

    if (
      toComparableDate(reference) <
      toComparableDate(birth)
    ) {
      throw new Error(
        "referenceDate cannot be earlier than solarBirthDate.",
      );
    }

    let age =
      reference.year - birth.year;

    const birthdayHasPassed =
      reference.month > birth.month ||
      (
        reference.month === birth.month &&
        reference.day >= birth.day
      );

    if (!birthdayHasPassed) {
      age -= 1;
    }

    return age;
  }

  function resolveTenGod(
    dayMaster: string,
    targetStem: string,
    fieldName: string,
  ): SajuLuckFlowTenGod {
    const tenGod =
      getTenGodByStem(
        dayMaster,
        targetStem,
      );

    if (
      typeof tenGod !== "string" ||
      !TEN_GODS.includes(
        tenGod as SajuLuckFlowTenGod,
      )
    ) {
      throw new Error(
        `${fieldName} tenGod could not be calculated.`,
      );
    }

    return tenGod as SajuLuckFlowTenGod;
  }

  function resolveStemElement(
    stem: string,
    fieldName: string,
  ): SajuFiveElement {
    const element =
      STEM_ELEMENT_MAP[stem];

    if (!element) {
      throw new Error(
        `${fieldName} element could not be calculated.`,
      );
    }

    return element;
  }

  function buildCurrentDaeunFact(
    dayMaster: string,
    daeun: V3CurrentDaeun,
  ): SajuCurrentDaeunFact {
    return {
      index: daeun.index,

      ganZhi: daeun.ganZhi,

      heavenlyStem:
        daeun.heavenlyStem,

      earthlyBranch:
        daeun.earthlyBranch,

      tenGod:
        resolveTenGod(
          dayMaster,
          daeun.heavenlyStem,
          "currentDaeun",
        ),

      element:
        resolveStemElement(
          daeun.heavenlyStem,
          "currentDaeun",
        ),

      startYear: daeun.startYear,

      endYear: daeun.endYear,

      startAge: daeun.startAge,

      endAge: daeun.endAge,
    };
  }

  function buildCurrentSeunFact(
    dayMaster: string,
    seun: V3CurrentSeun,
  ): SajuCurrentSeunFact {
    return {
      year: seun.year,

      age: seun.age,

      ganZhi: seun.ganZhi,

      heavenlyStem:
        seun.heavenlyStem,

      earthlyBranch:
        seun.earthlyBranch,

      tenGod:
        resolveTenGod(
          dayMaster,
          seun.heavenlyStem,
          "currentSeun",
        ),

      element:
        resolveStemElement(
          seun.heavenlyStem,
          "currentSeun",
        ),
    };
  }

  export function buildSajuLuckFlowFact(
    input: SajuLuckFlowFactBuilderInput,
  ): SajuLuckFlowFact {
    const { calculation } = input;

    return {
      referenceDate:
        calculation.referenceDate,

      referenceYear:
        calculation.referenceYear,

      currentAge:
        calculateCurrentAge(
          input.solarBirthDate,
          calculation.referenceDate,
        ),

      isForward:
        calculation.isForward,

      luckStartMethod:
        calculation.luckStartMethod,

      luckStart: {
        year:
          calculation.luckStart.year,

        month:
          calculation.luckStart.month,

        day:
          calculation.luckStart.day,

        hour:
          calculation.luckStart.hour,

        solarDate:
          calculation.luckStart.solarDate,
      },

      currentDaeun:
        calculation.currentDaeun
          ? buildCurrentDaeunFact(
              input.dayMaster,
              calculation.currentDaeun,
            )
          : null,

      currentSeun:
        buildCurrentSeunFact(
          input.dayMaster,
          calculation.currentSeun,
        ),
    };
  }