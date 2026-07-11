import type { SajuFacts } from "../types/sajuFacts";
import {
  buildSajuFacts,
} from "./sajuFactsBuilder";
import {
  buildV3SajuCalculation,
  type V3CalculatedSaju,
  type V3SajuCalculationInput,
} from "./v3SajuCalculationBuilder";

export type SajuFactsPipelineResult = {
  calculatedSaju: V3CalculatedSaju;

  facts: SajuFacts;
};

export function buildSajuFactsPipeline(
  input: V3SajuCalculationInput,
): SajuFactsPipelineResult {
  const calculatedSaju =
    buildV3SajuCalculation(input);

  const facts = buildSajuFacts(
    calculatedSaju,
  );

  return {
    calculatedSaju,
    facts,
  };
}