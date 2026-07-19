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
  readBlessing,
} from "./blessingReader";
import {
  readCapacity,
} from "./capacityReader";
import {
  readCareer,
} from "./careerReader";
import {
  readDestiny,
} from "./destinyReader";
import {
  readHealth,
} from "./healthReader";
import {
  readLifeDriver,
} from "./lifeDriverReader";
import {
  buildMasterHumanSummary,
} from "./masterHumanSummaryBuilder";
import {
  buildMasterProfileExplanation,
} from "./masterProfileExplanationBuilder";
import {
  readMoney,
} from "./moneyReader";
import {
  readRelationship,
} from "./relationshipReader";
import {
  readRepeatedPattern,
} from "./repeatedPatternReader";
import {
  readSurvivalStyle,
} from "./survivalStyleReader";

export function readMasterProfile(
  input: MasterReaderInput,
): MasterReaderResult | null {
  const lifeDriver =
    readLifeDriver(
      input.lifeDriver,
    );

  const survivalStyle =
    readSurvivalStyle(
      input.survivalEvidence,
    );

  const repeatedPattern =
    readRepeatedPattern(
      input.repeatedPatternEvidence,
    );

  const capacity =
    readCapacity(
      input.structureFacts,
    );

  const money =
    readMoney(
      input.structureFacts,
    );

  const career =
    readCareer(
      input.structureFacts,
    );

  const relationship =
    readRelationship(
      input.structureFacts,
    );

  const health =
    readHealth(
      input.structureFacts,
    );

  const blessing =
    readBlessing(
      input.structureFacts,
    );

  const destiny =
    readDestiny(
      input.structureFacts,
    );

  if (
    !lifeDriver
    || !survivalStyle
    || !repeatedPattern
    || !capacity
    || !money
    || !career
    || !relationship
    || !health
    || !blessing
    || !destiny
  ) {
    return null;
  }

  const profile: MasterProfile = {
    lifeDriver,

    survivalStyle,

    repeatedPattern,

    capacity,

    money,

    career,

    relationship,

    health,

    blessing,

    destiny,
  };

  const explanation =
    buildMasterProfileExplanation(
      profile,
    );

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