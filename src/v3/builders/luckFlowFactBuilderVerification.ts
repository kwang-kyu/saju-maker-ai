import {
    buildV3LuckFlowCalculation,
  } from "./luckFlowCalculationBuilder";

  import {
    buildSajuLuckFlowFact,
  } from "./luckFlowFactBuilder";

  import type {
    V3LuckFlowCalculationInput,
    V3LuckFlowCalculationResult,
  } from "../types/luckFlowCalculation";

  export type LuckFlowFactBuilderVerificationCase = {
    name: string;

    passed: boolean;

    details: string;
  };

  export type LuckFlowFactBuilderVerificationResult = {
    cases: LuckFlowFactBuilderVerificationCase[];

    passed: boolean;
  };

  const calculationInput:
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
  ): LuckFlowFactBuilderVerificationCase {
    return {
      name,

      passed,

      details,
    };
  }

  function buildCalculation(
    input:
      V3LuckFlowCalculationInput =
        calculationInput,
  ): V3LuckFlowCalculationResult {
    return buildV3LuckFlowCalculation(
      input,
    );
  }

  function verifyStructuredDaeunFact():
    LuckFlowFactBuilderVerificationCase {
    const fact =
      buildSajuLuckFlowFact({
        solarBirthDate:
          calculationInput.solarBirthDate,

        dayMaster: "甲",

        calculation:
          buildCalculation(),
      });

    const daeun = fact.currentDaeun;

    const passed =
      daeun !== null &&
      daeun.ganZhi === "丁巳" &&
      daeun.heavenlyStem === "丁" &&
      daeun.earthlyBranch === "巳" &&
      daeun.tenGod === "상관" &&
      daeun.element === "fire" &&
      daeun.startYear === 2020 &&
      daeun.endYear === 2029;

    return createCase(
      "structured daeun fact",
      passed,
      daeun
        ? [
            `ganZhi=${daeun.ganZhi}`,
            `tenGod=${daeun.tenGod}`,
            `element=${daeun.element}`,
            `years=${daeun.startYear}-${daeun.endYear}`,
          ].join(", ")
        : "currentDaeun=null",
    );
  }

  function verifyStructuredSeunFact():
    LuckFlowFactBuilderVerificationCase {
    const fact =
      buildSajuLuckFlowFact({
        solarBirthDate:
          calculationInput.solarBirthDate,

        dayMaster: "甲",

        calculation:
          buildCalculation(),
      });

    const seun = fact.currentSeun;

    const passed =
      seun.ganZhi === "丙午" &&
      seun.heavenlyStem === "丙" &&
      seun.earthlyBranch === "午" &&
      seun.tenGod === "식신" &&
      seun.element === "fire" &&
      seun.year === 2026 &&
      seun.age === 9;

    return createCase(
      "structured seun fact",
      passed,
      [
        `ganZhi=${seun.ganZhi}`,
        `tenGod=${seun.tenGod}`,
        `element=${seun.element}`,
        `nominalAge=${seun.age}`,
      ].join(", "),
    );
  }

  function verifyCurrentAgeIsInternationalAge():
    LuckFlowFactBuilderVerificationCase {
    const fact =
      buildSajuLuckFlowFact({
        solarBirthDate:
          calculationInput.solarBirthDate,

        dayMaster: "甲",

        calculation:
          buildCalculation(),
      });

    const passed =
      fact.currentAge === 8 &&
      fact.currentSeun.age === 9;

    return createCase(
      "current age is international age",
      passed,
      [
        `currentAge=${fact.currentAge}`,
        `seunAge=${fact.currentSeun.age}`,
      ].join(", "),
    );
  }

  function verifyBirthdayBoundary():
    LuckFlowFactBuilderVerificationCase {
    const beforeBirthdayInput = {
      ...calculationInput,

      referenceDate: "2026-06-10",
    };

    const onBirthdayInput = {
      ...calculationInput,

      referenceDate: "2026-06-11",
    };

    const beforeBirthday =
      buildSajuLuckFlowFact({
        solarBirthDate:
          beforeBirthdayInput.solarBirthDate,

        dayMaster: "甲",

        calculation:
          buildCalculation(
            beforeBirthdayInput,
          ),
      });

    const onBirthday =
      buildSajuLuckFlowFact({
        solarBirthDate:
          onBirthdayInput.solarBirthDate,

        dayMaster: "甲",

        calculation:
          buildCalculation(
            onBirthdayInput,
          ),
      });

    const passed =
      beforeBirthday.currentAge === 7 &&
      onBirthday.currentAge === 8;

    return createCase(
      "birthday age boundary",
      passed,
      [
        `before=${beforeBirthday.currentAge}`,
        `onBirthday=${onBirthday.currentAge}`,
      ].join(", "),
    );
  }

  function verifyPreDaeunRemainsNull():
    LuckFlowFactBuilderVerificationCase {
    const preDaeunInput = {
      ...calculationInput,

      referenceDate: "2019-01-01",
    };

    const fact =
      buildSajuLuckFlowFact({
        solarBirthDate:
          preDaeunInput.solarBirthDate,

        dayMaster: "甲",

        calculation:
          buildCalculation(
            preDaeunInput,
          ),
      });

    return createCase(
      "pre-daeun remains null",
      fact.currentDaeun === null,
      `currentDaeun=${
        fact.currentDaeun === null
          ? "null"
          : fact.currentDaeun.ganZhi
      }`,
    );
  }

  function verifyInvalidFactThrows(
    name: string,
    build: () => void,
    expectedMessage: string,
  ): LuckFlowFactBuilderVerificationCase {
    try {
      build();

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

  function verifyInvalidDayMaster():
    LuckFlowFactBuilderVerificationCase {
    return verifyInvalidFactThrows(
      "invalid day master is rejected",
      () => {
        buildSajuLuckFlowFact({
          solarBirthDate:
            calculationInput.solarBirthDate,

          dayMaster: "X",

          calculation:
            buildCalculation(),
        });
      },
      "tenGod could not be calculated",
    );
  }

  function verifyInvalidDaeunStem():
    LuckFlowFactBuilderVerificationCase {
    const calculation =
      buildCalculation();

    if (!calculation.currentDaeun) {
      return createCase(
        "invalid daeun stem is rejected",
        false,
        "fixture currentDaeun=null",
      );
    }

    const invalidCalculation:
      V3LuckFlowCalculationResult = {
        ...calculation,

        currentDaeun: {
          ...calculation.currentDaeun,

          heavenlyStem: "X",
        },
      };

    return verifyInvalidFactThrows(
      "invalid daeun stem is rejected",
      () => {
        buildSajuLuckFlowFact({
          solarBirthDate:
            calculationInput.solarBirthDate,

          dayMaster: "甲",

          calculation:
            invalidCalculation,
        });
      },
      "currentDaeun tenGod",
    );
  }

  function verifyInvalidSeunStem():
    LuckFlowFactBuilderVerificationCase {
    const calculation =
      buildCalculation();

    const invalidCalculation:
      V3LuckFlowCalculationResult = {
        ...calculation,

        currentSeun: {
          ...calculation.currentSeun,

          heavenlyStem: "X",
        },
      };

    return verifyInvalidFactThrows(
      "invalid seun stem is rejected",
      () => {
        buildSajuLuckFlowFact({
          solarBirthDate:
            calculationInput.solarBirthDate,

          dayMaster: "甲",

          calculation:
            invalidCalculation,
        });
      },
      "currentSeun tenGod",
    );
  }

  function verifyInvalidSolarBirthDate():
    LuckFlowFactBuilderVerificationCase {
    return verifyInvalidFactThrows(
      "invalid solar birth date is rejected",
      () => {
        buildSajuLuckFlowFact({
          solarBirthDate: "2018-02-30",

          dayMaster: "甲",

          calculation:
            buildCalculation(),
        });
      },
      "valid calendar date",
    );
  }

  export function verifyLuckFlowFactBuilder():
    LuckFlowFactBuilderVerificationResult {
    const cases = [
      verifyStructuredDaeunFact(),

      verifyStructuredSeunFact(),

      verifyCurrentAgeIsInternationalAge(),

      verifyBirthdayBoundary(),

      verifyPreDaeunRemainsNull(),

      verifyInvalidDayMaster(),

      verifyInvalidDaeunStem(),

      verifyInvalidSeunStem(),

      verifyInvalidSolarBirthDate(),
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