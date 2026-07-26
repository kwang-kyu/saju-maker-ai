import type {
  LifeDriverMeaning,
} from "../masterReader/types/lifeDriverInput";

import type {
  PatternEvidence,
} from "../masterReader/types/repeatedPattern";

import type {
  SurvivalEvidence,
} from "../masterReader/types/survivalStyle";

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

function toWeight(
  strength: SajuEvidenceStrength,
): number {
  switch (strength) {
    case "strong":
      return 3;

    case "medium":
      return 2;

    case "weak":
      return 1;
  }
}

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

function buildSurvivalEvidence(
  structureFacts: SajuStructureFact[],
): SurvivalEvidence[] {
  return structureFacts.map(
    (fact) => ({
      source: fact.category,

      description: fact.description,

      weight:
        toWeight(fact.strength),
    }),
  );
}

function buildRepeatedPatternEvidence(
  structureFacts: SajuStructureFact[],
): PatternEvidence[] {
  return structureFacts.map(
    (fact) => ({
      source: fact.category,

      description: fact.description,

      weight:
        toWeight(fact.strength),
    }),
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
        buildSurvivalEvidence(
          facts.structureFacts,
        ),

      repeatedPatternEvidence:
        buildRepeatedPatternEvidence(
          facts.structureFacts,
        ),

      structureFacts:
        facts.structureFacts,
    },

    lifePhaseInput,
  };
}
