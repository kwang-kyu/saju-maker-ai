/**
 * vNext STEP 6-3 Calendar Type → Calculation E2E Verification.
 *
 * 양력/음력 선택이 profile/request를 넘어
 * 실제 v3 사주 계산에 사용되는 날짜까지 반영되는지 검증한다.
 *
 * 새 변환/계산 로직을 만들지 않고
 * convertToSajuSolarDate · buildV3SajuCalculation · buildSajuFactsPipeline
 * production 경로만 실행한다.
 */

import {
  buildSajuFactsPipeline,
  type SajuFactsPipelineInput,
} from "../../builders/sajuFactsPipelineBuilder.js";
import {
  buildV3SajuCalculation,
  type V3CalculatedSaju,
  type V3SajuCalculationInput,
} from "../../builders/v3SajuCalculationBuilder.js";
import {
  convertToSajuSolarDate,
} from "../../../services/sajuDateService.js";
import {
  adaptBirthProfileToSajuInput,
} from "../entry/vNextBirthInputAdapter.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";

export type VNextStep6A3CalendarTypeCalculationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep6A3CalendarTypeCalculationVerificationResult = {
  passed: boolean;
  cases: VNextStep6A3CalendarTypeCalculationCase[];
};

type CalendarType = "solar" | "lunar";

const REFERENCE_DATE = "2026-09-01";

const EXISTING_SOLAR_REGRESSION_INPUT: SajuFactsPipelineInput = {
  name: "통합 검증 대상",
  birthDate: "2018-06-11",
  birthTime: "09:30",
  gender: "female",
  calendarType: "solar",
  referenceDate: "2026-07-26",
  luckStartMethod: "minuteBased",
};

const SAMPLE_SOLAR_BIRTH_PROFILE: VNextBirthProfile = {
  displayName: "천운",
  gender: "female",
  year: 1990,
  month: 5,
  day: 10,
  birthTimeBranch: "yu",
  calendarType: "solar",
};

const SAMPLE_LUNAR_BIRTH_PROFILE: VNextBirthProfile = {
  ...SAMPLE_SOLAR_BIRTH_PROFILE,
  calendarType: "lunar",
};

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextStep6A3CalendarTypeCalculationCase {
  const result = run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

function parseBirthDateParts(
  birthDate: string,
): {
  year: string;
  month: string;
  day: string;
} {
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

function formatSolarDateIso(params: {
  year: number;
  month: number;
  day: number;
}): string {
  return [
    String(params.year).padStart(4, "0"),
    String(params.month).padStart(2, "0"),
    String(params.day).padStart(2, "0"),
  ].join("-");
}

function resolveProductionSolarDateIso(params: {
  birthDate: string;
  calendarType: CalendarType;
}): string {
  const {
    year,
    month,
    day,
  } = parseBirthDateParts(params.birthDate);

  const converted = convertToSajuSolarDate({
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    calendarType: params.calendarType,
  });

  return formatSolarDateIso({
    year: converted.finalSolarYear,
    month: converted.finalSolarMonth,
    day: converted.finalSolarDay,
  });
}

function buildCalculationInput(params: {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  calendarType: CalendarType;
  name?: string;
}): V3SajuCalculationInput {
  return {
    name: params.name ?? "calendar-type-verification",
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    gender: params.gender,
    calendarType: params.calendarType,
  };
}

function buildPipelineInput(params: {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  calendarType: CalendarType;
  name?: string;
  referenceDate?: string;
}): SajuFactsPipelineInput {
  return {
    name: params.name ?? "calendar-type-verification",
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    gender: params.gender,
    calendarType: params.calendarType,
    referenceDate: params.referenceDate ?? REFERENCE_DATE,
    luckStartMethod: "minuteBased",
  };
}

function calculatedPillarsMatch(
  left: V3CalculatedSaju,
  right: V3CalculatedSaju,
): boolean {
  return left.solarDateIso === right.solarDateIso
    && left.yearGanZhi === right.yearGanZhi
    && left.monthGanZhi === right.monthGanZhi
    && left.dayGanZhi === right.dayGanZhi
    && left.timeGanZhi === right.timeGanZhi
    && left.dayMaster === right.dayMaster;
}

export function verifyVNextStep6A3CalendarTypeCalculation(): VNextStep6A3CalendarTypeCalculationVerificationResult {
  const cases: VNextStep6A3CalendarTypeCalculationCase[] = [
    runSyncCase("case-1-solar-calculation-matches-production-conversion", () => {
      const birthDate = "2018-06-11";
      const expectedSolarDateIso = resolveProductionSolarDateIso({
        birthDate,
        calendarType: "solar",
      });
      const calculated = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "09:30",
          gender: "female",
          calendarType: "solar",
        }),
      );

      return {
        passed: expectedSolarDateIso === calculated.solarDateIso
          && calculated.solarDateIso === birthDate
          && calculated.calendarType === "solar",
        details: [
          `expectedSolarDateIso=${expectedSolarDateIso}`,
          `calculatedSolarDateIso=${calculated.solarDateIso}`,
          `calendarType=${calculated.calendarType}`,
        ],
      };
    }),

    runSyncCase("case-2-lunar-calculation-matches-production-conversion", () => {
      const birthDate = "1975-07-10";
      const expectedSolarDateIso = resolveProductionSolarDateIso({
        birthDate,
        calendarType: "lunar",
      });
      const calculated = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "16:02",
          gender: "male",
          calendarType: "lunar",
        }),
      );

      return {
        passed: expectedSolarDateIso === calculated.solarDateIso
          && calculated.solarDateIso !== birthDate
          && calculated.calendarType === "lunar",
        details: [
          `birthDate=${birthDate}`,
          `expectedSolarDateIso=${expectedSolarDateIso}`,
          `calculatedSolarDateIso=${calculated.solarDateIso}`,
          `calendarType=${calculated.calendarType}`,
        ],
      };
    }),

    runSyncCase("case-3-same-date-string-solar-lunar-differ", () => {
      const birthDate = "1990-05-10";
      const solarDateIso = resolveProductionSolarDateIso({
        birthDate,
        calendarType: "solar",
      });
      const lunarDateIso = resolveProductionSolarDateIso({
        birthDate,
        calendarType: "lunar",
      });
      const solarCalculated = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "17:00",
          gender: "female",
          calendarType: "solar",
        }),
      );
      const lunarCalculated = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "17:00",
          gender: "female",
          calendarType: "lunar",
        }),
      );

      return {
        passed: solarDateIso !== lunarDateIso
          && solarCalculated.solarDateIso === solarDateIso
          && lunarCalculated.solarDateIso === lunarDateIso
          && !calculatedPillarsMatch(solarCalculated, lunarCalculated),
        details: [
          `solarDateIso=${solarDateIso}`,
          `lunarDateIso=${lunarDateIso}`,
          `solarDayMaster=${solarCalculated.dayMaster}`,
          `lunarDayMaster=${lunarCalculated.dayMaster}`,
        ],
      };
    }),

    runSyncCase("case-4-lunar-pillars-match-equivalent-direct-solar-input", () => {
      const birthDate = "1962-04-10";
      const birthTime = "16:30";
      const convertedSolarDateIso = resolveProductionSolarDateIso({
        birthDate,
        calendarType: "lunar",
      });
      const lunarCalculated = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime,
          gender: "male",
          calendarType: "lunar",
        }),
      );
      const equivalentSolarCalculated = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate: convertedSolarDateIso,
          birthTime,
          gender: "male",
          calendarType: "solar",
        }),
      );

      return {
        passed: calculatedPillarsMatch(
          lunarCalculated,
          equivalentSolarCalculated,
        )
          && lunarCalculated.calendarType === "lunar"
          && equivalentSolarCalculated.calendarType === "solar",
        details: [
          `lunarBirthDate=${birthDate}`,
          `convertedSolarDateIso=${convertedSolarDateIso}`,
          `lunarDayMaster=${lunarCalculated.dayMaster}`,
          `equivalentSolarDayMaster=${equivalentSolarCalculated.dayMaster}`,
        ],
      };
    }),

    runSyncCase("case-5-calendar-type-preserved-through-pipeline", () => {
      const pipeline = buildSajuFactsPipeline(
        buildPipelineInput({
          birthDate: "1975-07-10",
          birthTime: "16:02",
          gender: "male",
          calendarType: "lunar",
          referenceDate: "2026-07-27",
        }),
      );

      const {
        calculatedSaju,
        facts,
      } = pipeline;
      const expectedSolarDateIso = resolveProductionSolarDateIso({
        birthDate: "1975-07-10",
        calendarType: "lunar",
      });

      return {
        passed: calculatedSaju.calendarType === "lunar"
          && facts.calendarType === "lunar"
          && calculatedSaju.solarDateIso === expectedSolarDateIso
          && facts.solarDate === calculatedSaju.solarDate
          && facts.birthDate === "1975-07-10",
        details: [
          `calculatedCalendarType=${calculatedSaju.calendarType}`,
          `factsCalendarType=${facts.calendarType}`,
          `solarDateIso=${calculatedSaju.solarDateIso}`,
        ],
      };
    }),

    runSyncCase("case-6-calendar-type-change-preserves-other-fields", () => {
      const shared = {
        birthDate: "1990-05-10",
        birthTime: "17:00",
        gender: "female" as const,
        name: "천운",
      };
      const solarPipeline = buildSajuFactsPipeline(
        buildPipelineInput({
          ...shared,
          calendarType: "solar",
        }),
      );
      const lunarPipeline = buildSajuFactsPipeline(
        buildPipelineInput({
          ...shared,
          calendarType: "lunar",
        }),
      );

      const solarCalculated = solarPipeline.calculatedSaju;
      const lunarCalculated = lunarPipeline.calculatedSaju;

      return {
        passed: solarCalculated.name === lunarCalculated.name
          && solarCalculated.birthDate === lunarCalculated.birthDate
          && solarCalculated.birthTime === lunarCalculated.birthTime
          && solarCalculated.gender === lunarCalculated.gender
          && solarCalculated.calendarType === "solar"
          && lunarCalculated.calendarType === "lunar"
          && solarCalculated.solarDateIso !== lunarCalculated.solarDateIso,
        details: [
          `solarCalendarType=${solarCalculated.calendarType}`,
          `lunarCalendarType=${lunarCalculated.calendarType}`,
          `solarDateIso=${solarCalculated.solarDateIso}`,
          `lunarDateIso=${lunarCalculated.solarDateIso}`,
        ],
      };
    }),

    runSyncCase("case-7-existing-solar-regression-baseline-unchanged", () => {
      const pipeline = buildSajuFactsPipeline(
        EXISTING_SOLAR_REGRESSION_INPUT,
      );
      const {
        calculatedSaju,
        facts,
      } = pipeline;

      return {
        passed: calculatedSaju.solarDateIso === "2018-06-11"
          && calculatedSaju.calendarType === "solar"
          && facts.calendarType === "solar"
          && facts.dayMaster === "甲"
          && facts.pillars.length === 4
          && facts.luckFlow.currentAge === 8
          && facts.luckFlow.currentDaeun?.ganZhi === "丁巳"
          && facts.luckFlow.currentSeun.ganZhi === "丙午",
        details: [
          `solarDateIso=${calculatedSaju.solarDateIso}`,
          `dayMaster=${facts.dayMaster}`,
          `daeun=${facts.luckFlow.currentDaeun?.ganZhi ?? "null"}`,
          `seun=${facts.luckFlow.currentSeun.ganZhi}`,
        ],
      };
    }),

    runSyncCase("case-8-vnext-solar-profile-adapter-calculation-path", () => {
      const sajuInput = adaptBirthProfileToSajuInput(
        SAMPLE_SOLAR_BIRTH_PROFILE,
        REFERENCE_DATE,
      );
      const pipeline = buildSajuFactsPipeline(sajuInput);
      const expectedSolarDateIso = resolveProductionSolarDateIso({
        birthDate: sajuInput.birthDate,
        calendarType: "solar",
      });

      return {
        passed: sajuInput.calendarType === "solar"
          && sajuInput.birthDate === "1990-05-10"
          && sajuInput.birthTime === "17:00"
          && sajuInput.gender === "female"
          && pipeline.calculatedSaju.solarDateIso === expectedSolarDateIso
          && pipeline.calculatedSaju.calendarType === "solar"
          && pipeline.facts.calendarType === "solar",
        details: [
          `adapterCalendarType=${sajuInput.calendarType}`,
          `solarDateIso=${pipeline.calculatedSaju.solarDateIso}`,
          `dayMaster=${pipeline.calculatedSaju.dayMaster}`,
        ],
      };
    }),

    runSyncCase("case-9-vnext-lunar-profile-adapter-calculation-path", () => {
      const sajuInput = adaptBirthProfileToSajuInput(
        SAMPLE_LUNAR_BIRTH_PROFILE,
        REFERENCE_DATE,
      );
      const pipeline = buildSajuFactsPipeline(sajuInput);
      const expectedSolarDateIso = resolveProductionSolarDateIso({
        birthDate: sajuInput.birthDate,
        calendarType: "lunar",
      });
      const equivalentSolarCalculated = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate: expectedSolarDateIso,
          birthTime: sajuInput.birthTime,
          gender: sajuInput.gender,
          calendarType: "solar",
          name: sajuInput.name,
        }),
      );

      return {
        passed: sajuInput.calendarType === "lunar"
          && pipeline.calculatedSaju.solarDateIso === expectedSolarDateIso
          && pipeline.calculatedSaju.calendarType === "lunar"
          && pipeline.facts.calendarType === "lunar"
          && calculatedPillarsMatch(
            pipeline.calculatedSaju,
            equivalentSolarCalculated,
          ),
        details: [
          `adapterCalendarType=${sajuInput.calendarType}`,
          `convertedSolarDateIso=${expectedSolarDateIso}`,
          `dayMaster=${pipeline.calculatedSaju.dayMaster}`,
        ],
      };
    }),

    runSyncCase("case-10-different-birth-times-use-converted-solar-date", () => {
      const birthDate = "1975-07-10";
      const convertedSolarDateIso = resolveProductionSolarDateIso({
        birthDate,
        calendarType: "lunar",
      });
      const earlyMorning = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "23:00",
          gender: "male",
          calendarType: "lunar",
        }),
      );
      const afternoon = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "16:02",
          gender: "male",
          calendarType: "lunar",
        }),
      );
      const equivalentSolarEarlyMorning = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate: convertedSolarDateIso,
          birthTime: "23:00",
          gender: "male",
          calendarType: "solar",
        }),
      );
      const equivalentSolarAfternoon = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate: convertedSolarDateIso,
          birthTime: "16:02",
          gender: "male",
          calendarType: "solar",
        }),
      );

      return {
        passed: earlyMorning.solarDateIso === convertedSolarDateIso
          && afternoon.solarDateIso === convertedSolarDateIso
          && calculatedPillarsMatch(earlyMorning, equivalentSolarEarlyMorning)
          && calculatedPillarsMatch(afternoon, equivalentSolarAfternoon)
          && earlyMorning.timeGanZhi !== afternoon.timeGanZhi,
        details: [
          `convertedSolarDateIso=${convertedSolarDateIso}`,
          `earlyMorningTime=${earlyMorning.timeGanZhi}`,
          `afternoonTime=${afternoon.timeGanZhi}`,
        ],
      };
    }),

    runSyncCase("case-11-male-female-preserve-calendar-type-in-calculation", () => {
      const birthDate = "1990-05-10";
      const maleLunar = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "12:00",
          gender: "male",
          calendarType: "lunar",
        }),
      );
      const femaleLunar = buildV3SajuCalculation(
        buildCalculationInput({
          birthDate,
          birthTime: "12:00",
          gender: "female",
          calendarType: "lunar",
        }),
      );

      return {
        passed: maleLunar.calendarType === "lunar"
          && femaleLunar.calendarType === "lunar"
          && maleLunar.solarDateIso === femaleLunar.solarDateIso
          && maleLunar.dayMaster === femaleLunar.dayMaster
          && maleLunar.gender === "male"
          && femaleLunar.gender === "female",
        details: [
          `maleCalendarType=${maleLunar.calendarType}`,
          `femaleCalendarType=${femaleLunar.calendarType}`,
          `sharedSolarDateIso=${maleLunar.solarDateIso}`,
        ],
      };
    }),

    runSyncCase("case-12-omitted-calendar-type-defaults-to-solar-path", () => {
      const birthDate = "2018-06-11";
      const calculated = buildV3SajuCalculation({
        name: "default-calendar-type",
        birthDate,
        birthTime: "09:30",
        gender: "female",
      });
      const expectedSolarDateIso = resolveProductionSolarDateIso({
        birthDate,
        calendarType: "solar",
      });

      return {
        passed: calculated.calendarType === "solar"
          && calculated.solarDateIso === expectedSolarDateIso,
        details: [
          `calendarType=${calculated.calendarType}`,
          `solarDateIso=${calculated.solarDateIso}`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep6A3CalendarTypeCalculationResult(
  result: VNextStep6A3CalendarTypeCalculationVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
