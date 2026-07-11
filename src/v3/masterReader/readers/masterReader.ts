import type { MasterProfile } from "../types/masterProfile";
import type { MasterReaderInput } from "../types/masterReaderInput";
import type { MasterReaderResult } from "../types/masterReaderResult";
import {
    buildMasterProfileExplanation,
  } from "./masterProfileExplanationBuilder";
import { readLifeDriver } from "./lifeDriverReader";
import { readRepeatedPattern } from "./repeatedPatternReader";
import { readSurvivalStyle } from "./survivalStyleReader";
import { buildMasterHumanSummary } from "./masterHumanSummaryBuilder";

export function readMasterProfile(
  input: MasterReaderInput,
): MasterReaderResult | null {
  const lifeDriver = readLifeDriver(input.lifeDriver);

  const survivalStyle = readSurvivalStyle(
    input.survivalEvidence,
  );

  const repeatedPattern = readRepeatedPattern(
    input.repeatedPatternEvidence,
  );

  if (!lifeDriver || !survivalStyle || !repeatedPattern) {
    return null;
  }

  const profile: MasterProfile = {
    lifeDriver,
    survivalStyle,
    repeatedPattern,
  };

  const explanation =
    buildMasterProfileExplanation(profile);
    const humanSummary = buildMasterHumanSummary({
        profile,
        explanation,
      });

      return {
        profile,
        explanation,
        humanSummary,
      };
}