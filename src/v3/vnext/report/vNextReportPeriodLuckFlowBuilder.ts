/**
 * Report-only period luck-flow fact builder.
 *
 * Combines existing Calculator + Fact builders for year/day report menus.
 * Does not touch Question pipeline, classifiers, controllers, or UI.
 */

import {
  assertV3LuckFlowGender,
  buildV3TargetPeriodLuckFlow,
} from "../../builders/luckFlowCalculationBuilder.js";
import {
  buildSajuTargetPeriodLuckFlowFact,
} from "../../builders/luckFlowFactBuilder.js";
import type {
  V3LuckStartMethod,
} from "../../types/luckFlowCalculation.js";
import type {
  SajuTargetPeriodLuckFlowFact,
} from "../../types/luckFlowFact.js";

export type VNextReportPeriodLuckFlowBuilderInput = {
  solarBirthDate:
    string;

  birthTime:
    string;

  gender:
    string;

  luckStartMethod:
    V3LuckStartMethod;

  dayMaster:
    string;

  /**
   * Caller-provided YYYY-MM-DD. Never derived from system clock here.
   */
  referenceDate:
    string;
};

export type VNextReportPeriodLuckFlowFacts = {
  year:
    SajuTargetPeriodLuckFlowFact;

  day:
    SajuTargetPeriodLuckFlowFact;
};

type ReferenceDateParts = {
  year:
    number;

  month:
    number;

  day:
    number;
};

function parseReferenceDateParts(
  referenceDate:
    string,
): ReferenceDateParts {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      referenceDate,
    );

  if (!match) {
    throw new Error(
      "Report period luck flow referenceDate must use YYYY-MM-DD format.",
    );
  }

  const year =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const day =
    Number(
      match[3],
    );

  if (
    !Number.isInteger(
      year,
    )
    || !Number.isInteger(
      month,
    )
    || !Number.isInteger(
      day,
    )
  ) {
    throw new Error(
      "Report period luck flow referenceDate parts could not be resolved.",
    );
  }

  return {
    year,
    month,
    day,
  };
}

/**
 * Builds year + day SajuTargetPeriodLuckFlowFact for Report menus.
 *
 * year: referenceDate year (01-01..12-31), includeWolunSegments=false
 * day: referenceDate single day (targetIlun expected)
 */
export function buildVNextReportPeriodLuckFlowFacts(
  input:
    VNextReportPeriodLuckFlowBuilderInput,
): VNextReportPeriodLuckFlowFacts {
  const referenceParts =
    parseReferenceDateParts(
      input.referenceDate,
    );

  const gender =
    assertV3LuckFlowGender(
      input.gender,
    );

  const targetYear =
    referenceParts.year;

  const yearCalculation =
    buildV3TargetPeriodLuckFlow({
      solarBirthDate:
        input.solarBirthDate,

      birthTime:
        input.birthTime,

      gender,

      luckStartMethod:
        input.luckStartMethod,

      scope:
        "year",

      targetStartDate:
        `${targetYear}-01-01`,

      targetEndDate:
        `${targetYear}-12-31`,

      targetYear,

      targetMonth:
        null,

      targetDay:
        null,

      includeWolunSegments:
        false,
    });

  const dayCalculation =
    buildV3TargetPeriodLuckFlow({
      solarBirthDate:
        input.solarBirthDate,

      birthTime:
        input.birthTime,

      gender,

      luckStartMethod:
        input.luckStartMethod,

      scope:
        "day",

      targetStartDate:
        input.referenceDate,

      targetEndDate:
        input.referenceDate,

      targetYear:
        referenceParts.year,

      targetMonth:
        referenceParts.month,

      targetDay:
        referenceParts.day,

      includeWolunSegments:
        false,
    });

  return {
    year:
      buildSajuTargetPeriodLuckFlowFact({
        dayMaster:
          input.dayMaster,

        calculation:
          yearCalculation,
      }),

    day:
      buildSajuTargetPeriodLuckFlowFact({
        dayMaster:
          input.dayMaster,

        calculation:
          dayCalculation,
      }),
  };
}
