import type {
  SajuFacts,
} from "../types/sajuFacts";

import type {
  SajuLuckFlowFact,
} from "../types/luckFlowFact";

import type {
  V3LuckFlowCalculationResult,
  V3LuckFlowGender,
  V3LuckStartMethod,
} from "../types/luckFlowCalculation";

import {
  buildSajuFacts,
} from "./sajuFactsBuilder";

import {
  buildSajuLuckFlowFact,
} from "./luckFlowFactBuilder";

import {
  buildV3LuckFlowCalculation,
} from "./luckFlowCalculationBuilder";

import {
  buildV3SajuCalculation,
  type V3CalculatedSaju,
  type V3SajuCalculationInput,
} from "./v3SajuCalculationBuilder";

export type SajuFactsPipelineInput =
  Omit<
    V3SajuCalculationInput,
    "gender"
  > & {
    gender: V3LuckFlowGender;

    referenceDate: string;

    luckStartMethod:
      V3LuckStartMethod;
  };

export type SajuFactsPipelineResult = {
  calculatedSaju: V3CalculatedSaju;

  luckFlowCalculation:
    V3LuckFlowCalculationResult;

  luckFlowFact: SajuLuckFlowFact;

  facts: SajuFacts;
};

export function buildSajuFactsPipeline(
  input: SajuFactsPipelineInput,
): SajuFactsPipelineResult {
  const calculatedSaju =
    buildV3SajuCalculation(input);

  const luckFlowCalculation =
    buildV3LuckFlowCalculation({
      solarBirthDate:
        calculatedSaju.solarDateIso,

      birthTime:
        calculatedSaju.birthTime,

      gender:
        input.gender,

      referenceDate:
        input.referenceDate,

      luckStartMethod:
        input.luckStartMethod,
    });

  const luckFlowFact =
    buildSajuLuckFlowFact({
      solarBirthDate:
        calculatedSaju.solarDateIso,

      dayMaster:
        calculatedSaju.dayMaster,

      calculation:
        luckFlowCalculation,
    });

  const facts =
    buildSajuFacts(
      calculatedSaju,
      luckFlowFact,
    );

  return {
    calculatedSaju,

    luckFlowCalculation,

    luckFlowFact,

    facts,
  };
}