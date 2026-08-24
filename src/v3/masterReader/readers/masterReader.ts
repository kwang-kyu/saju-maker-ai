import type {
  MasterProfile,
} from "../types/masterProfile.js";
import type {
  MasterReaderInput,
} from "../types/masterReaderInput.js";
import type {
  MasterReaderResult,
} from "../types/masterReaderResult.js";

import {
  readBlessing,
} from "./blessingReader.js";
import {
  readCapacity,
} from "./capacityReader.js";
import {
  readCareer,
} from "./careerReader.js";
import {
  readDestiny,
} from "./destinyReader.js";
import {
  readHealth,
} from "./healthReader.js";
import {
  readLifeDriver,
} from "./lifeDriverReader.js";
import {
  buildMasterHumanSummary,
} from "./masterHumanSummaryBuilder.js";
import {
  buildMasterProfileExplanation,
} from "./masterProfileExplanationBuilder.js";
import {
  readMoney,
} from "./moneyReader.js";
import {
  readRelationship,
} from "./relationshipReader.js";
import {
  readRepeatedPattern,
} from "./repeatedPatternReader.js";
import {
  readSurvivalStyle,
} from "./survivalStyleReader.js";

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