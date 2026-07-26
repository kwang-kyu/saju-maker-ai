import { buildV3LuckFlowCalculation } from "./luckFlowCalculationBuilder";

import type {
  V3LuckFlowCalculationInput,
  V3LuckFlowCalculationResult,
} from "../types/luckFlowCalculation";

export type LuckFlowCalculationVerificationCase = {
  name: string;

  passed: boolean;

  details: string;
};

export type LuckFlowCalculationVerificationResult = {
  cases: LuckFlowCalculationVerificationCase[];

  passed: boolean;
};

const officialFemaleFixture:
  V3LuckFlowCalculationInput = {
    solarBirthDate: "2018-06-11",

    birthTime: "09:30",

    gender: "female",

    referenceDate: "2026-07-26",

    luckStartMethod: "minuteBased",
  };

function createCase(
  name: string,
  passed: boolean,
  details: string,
): LuckFlowCalculationVerificationCase {
  return {
    name,

    passed,

    details,
  };
}

function calculateOfficialFemaleFixture():
  V3LuckFlowCalculationResult {
  return buildV3LuckFlowCalculation(
    officialFemaleFixture,
  );
}

function verifyOfficialLuckStartDate():
  LuckFlowCalculationVerificationCase {
  const result =
    calculateOfficialFemaleFixture();

  const passed =
    result.luckStart.solarDate ===
      "2020-03-21" &&
    result.luckStartMethod ===
      "minuteBased";

  return createCase(
    "official minute-based luck start date",
    passed,
    [
      `expectedStartDate=2020-03-21`,
      `actualStartDate=${result.luckStart.solarDate}`,
      `method=${result.luckStartMethod}`,
    ].join(", "),
  );
}

function verifyFemaleReverseFlow():
  LuckFlowCalculationVerificationCase {
  const result =
    calculateOfficialFemaleFixture();

  return createCase(
    "female reverse flow",
    result.isForward === false,
    `isForward=${result.isForward}`,
  );
}

function verifyGenderChangesFlowDirection():
  LuckFlowCalculationVerificationCase {
  const female =
    calculateOfficialFemaleFixture();

  const male =
    buildV3LuckFlowCalculation({
      ...officialFemaleFixture,

      gender: "male",
    });

  const passed =
    female.isForward === false &&
    male.isForward === true;

  return createCase(
    "gender changes flow direction",
    passed,
    [
      `femaleForward=${female.isForward}`,
      `maleForward=${male.isForward}`,
    ].join(", "),
  );
}

function verifyCurrentDaeunSelection():
  LuckFlowCalculationVerificationCase {
  const result =
    calculateOfficialFemaleFixture();

  const daeun = result.currentDaeun;

  const passed =
    daeun !== null &&
    daeun.index === 1 &&
    daeun.startYear === 2020 &&
    daeun.endYear === 2029 &&
    daeun.startAge === 3 &&
    daeun.endAge === 12 &&
    daeun.ganZhi.length >= 2 &&
    daeun.heavenlyStem.length === 1 &&
    daeun.earthlyBranch.length === 1;

  return createCase(
    "current daeun selection",
    passed,
    daeun
      ? [
          `index=${daeun.index}`,
          `ganZhi=${daeun.ganZhi}`,
          `years=${daeun.startYear}-${daeun.endYear}`,
          `ages=${daeun.startAge}-${daeun.endAge}`,
        ].join(", ")
      : "currentDaeun=null",
  );
}

function verifyPreDaeunReturnsNull():
  LuckFlowCalculationVerificationCase {
  const result =
    buildV3LuckFlowCalculation({
      ...officialFemaleFixture,

      referenceDate: "2019-01-01",
    });

  return createCase(
    "pre-daeun period returns null",
    result.currentDaeun === null,
    `currentDaeun=${
      result.currentDaeun === null
        ? "null"
        : result.currentDaeun.ganZhi
    }`,
  );
}

function verifyCurrentSeunCalculation():
  LuckFlowCalculationVerificationCase {
  const result =
    calculateOfficialFemaleFixture();

  const seun = result.currentSeun;

  const passed =
    seun.year === 2026 &&
    seun.age === 9 &&
    seun.ganZhi === "丙午" &&
    seun.heavenlyStem === "丙" &&
    seun.earthlyBranch === "午";

  return createCase(
    "current seun calculation",
    passed,
    [
      `year=${seun.year}`,
      `age=${seun.age}`,
      `ganZhi=${seun.ganZhi}`,
    ].join(", "),
  );
}

function verifyReferenceDateIsDeterministic():
  LuckFlowCalculationVerificationCase {
  const result2025 =
    buildV3LuckFlowCalculation({
      ...officialFemaleFixture,

      referenceDate: "2025-07-26",
    });

  const result2026 =
    calculateOfficialFemaleFixture();

  const passed =
    result2025.referenceYear === 2025 &&
    result2026.referenceYear === 2026 &&
    result2025.currentSeun.ganZhi ===
      "乙巳" &&
    result2026.currentSeun.ganZhi ===
      "丙午";

  return createCase(
    "reference date is deterministic",
    passed,
    [
      `2025=${result2025.currentSeun.ganZhi}`,
      `2026=${result2026.currentSeun.ganZhi}`,
    ].join(", "),
  );
}

function verifyInvalidInputThrows(
  name: string,
  input: V3LuckFlowCalculationInput,
  expectedMessage: string,
): LuckFlowCalculationVerificationCase {
  try {
    buildV3LuckFlowCalculation(input);

    return createCase(
      name,
      false,
      "no error was thrown",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return createCase(
      name,
      message.includes(expectedMessage),
      `error=${message}`,
    );
  }
}

function verifyInvalidBirthDate():
  LuckFlowCalculationVerificationCase {
  return verifyInvalidInputThrows(
    "invalid birth date is rejected",
    {
      ...officialFemaleFixture,

      solarBirthDate: "2018-02-30",
    },
    "valid calendar date",
  );
}

function verifyInvalidBirthTime():
  LuckFlowCalculationVerificationCase {
  return verifyInvalidInputThrows(
    "invalid birth time is rejected",
    {
      ...officialFemaleFixture,

      birthTime: "시간 모름",
    },
    "HH:mm or HH:mm:ss",
  );
}

function verifyReferenceBeforeBirth():
  LuckFlowCalculationVerificationCase {
  return verifyInvalidInputThrows(
    "reference before birth is rejected",
    {
      ...officialFemaleFixture,

      referenceDate: "2018-06-10",
    },
    "cannot be earlier",
  );
}

function verifyUnsupportedGender():
  LuckFlowCalculationVerificationCase {
  const invalidInput = {
    ...officialFemaleFixture,

    gender: "unknown",
  } as unknown as V3LuckFlowCalculationInput;

  return verifyInvalidInputThrows(
    "unsupported gender is rejected",
    invalidInput,
    "male or female",
  );
}

function verifyUnsupportedMethod():
  LuckFlowCalculationVerificationCase {
  const invalidInput = {
    ...officialFemaleFixture,

    luckStartMethod: "unknown",
  } as unknown as V3LuckFlowCalculationInput;

  return verifyInvalidInputThrows(
    "unsupported method is rejected",
    invalidInput,
    "Unsupported luck start",
  );
}

export function verifyLuckFlowCalculation():
  LuckFlowCalculationVerificationResult {
  const cases = [
    verifyOfficialLuckStartDate(),

    verifyFemaleReverseFlow(),

    verifyGenderChangesFlowDirection(),

    verifyCurrentDaeunSelection(),

    verifyPreDaeunReturnsNull(),

    verifyCurrentSeunCalculation(),

    verifyReferenceDateIsDeterministic(),

    verifyInvalidBirthDate(),

    verifyInvalidBirthTime(),

    verifyReferenceBeforeBirth(),

    verifyUnsupportedGender(),

    verifyUnsupportedMethod(),
  ];

  return {
    cases,

    passed:
      cases.every(
        (verificationCase) =>
          verificationCase.passed,
      ),
  };
}