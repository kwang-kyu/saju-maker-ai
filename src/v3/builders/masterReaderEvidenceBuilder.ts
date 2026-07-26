import type {
  LifeDriverMeaning,
} from "../masterReader/types/lifeDriverInput";

import type {
  MasterReaderEvidenceBundle,
} from "../types/masterReaderEvidenceBundle";

import type {
  SajuEvidenceStrength,
  SajuFacts,
  SajuStructureFact,
} from "../types/sajuFacts";

import {
  buildHumanLifePhaseReaderInput,
} from "./humanLifePhaseEvidenceBuilder";

import {
  buildRepeatedPatternEvidence,
} from "./repeatedPatternEvidenceBuilder";

import {
  buildSurvivalStyleEvidence,
} from "./survivalStyleEvidenceBuilder";

function toConfidence(
  strength: SajuEvidenceStrength,
): LifeDriverMeaning["confidence"] {
  switch (strength) {
    case "strong":
      return "high";

    case "medium":
      return "medium";

    case "weak":
      return "low";
  }
}

function buildLifeDriverMeanings(
  structureFacts: SajuStructureFact[],
): LifeDriverMeaning[] {
  return structureFacts.map(
    (
      fact,
      index,
    ): LifeDriverMeaning => {
      const meaning:
        LifeDriverMeaning = {
          id:
            `${fact.category}-` +
            `${index + 1}`,

          source: fact.category,

          meaning: fact.description,

          strength: fact.strength,

          confidence:
            toConfidence(
              fact.confidence,
            ),
        };

      if (fact.signal) {
        meaning.signal = fact.signal;
      }

      return meaning;
    },
  );
}

export function buildMasterReaderEvidenceBundle(
  params: {
    facts: SajuFacts;
  },
): MasterReaderEvidenceBundle {
  const {
    facts,
  } = params;

  const lifePhaseInput =
    buildHumanLifePhaseReaderInput(
      facts,
    );

  return {
    masterReaderInput: {
      lifeDriver: {
        meanings:
          buildLifeDriverMeanings(
            facts.structureFacts,
          ),
      },

      survivalEvidence:
        buildSurvivalStyleEvidence(
          facts,
        ),

      repeatedPatternEvidence:
        buildRepeatedPatternEvidence(
          facts,
        ),

      structureFacts:
        facts.structureFacts,
    },

    lifePhaseInput,
  };
}