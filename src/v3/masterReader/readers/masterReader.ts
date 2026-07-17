import type {
  MasterProfile,
} from "../types/masterProfile";
import type {
  MasterReaderInput,
} from "../types/masterReaderInput";
import type {
  MasterReaderResult,
} from "../types/masterReaderResult";

import {
  readCapacity,
} from "./capacityReader";
import {
  readLifeDriver,
} from "./lifeDriverReader";
import {
  buildMasterProfileExplanation,
} from "./masterProfileExplanationBuilder";
import {
  readMoney,
} from "./moneyReader";
import {
  readRepeatedPattern,
} from "./repeatedPatternReader";
import {
  readSurvivalStyle,
} from "./survivalStyleReader";
import {
  buildMasterHumanSummary,
} from "./masterHumanSummaryBuilder";

export function readMasterProfile(
  input: MasterReaderInput,
): MasterReaderResult | null {
  const lifeDriver =
    readLifeDriver(input.lifeDriver);

  const survivalStyle =
    readSurvivalStyle(
      input.survivalEvidence,
    );

  const repeatedPattern =
    readRepeatedPattern(
      input.repeatedPatternEvidence,
    );

  const capacity =
    readCapacity(input.structureFacts);

  const money =
    readMoney(input.structureFacts);

  if (
    !lifeDriver
    || !survivalStyle
    || !repeatedPattern
    || !capacity
    || !money
  ) {
    return null;
  }

  const profile: MasterProfile = {
    lifeDriver,
    survivalStyle,
    repeatedPattern,
    capacity,
    money,
  };

  const explanation =
    buildMasterProfileExplanation(profile);

  const humanSummary =
    buildMasterHumanSummary({
      profile,
      explanation,
    });

  return {
    profile,
    explanation,
    humanSummary,
  };
}