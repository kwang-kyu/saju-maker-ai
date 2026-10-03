import type {
  DecisionBrain,
} from "./decisionBrain.js";
import type {
  CompatibilityAssessment,
} from "./compatibilityAssessment.js";
import {
  buildCompatibilityEvidence,
} from "./compatibilityEvidenceBuilder.js";
import type {
  DecisionEngineInput,
  DecisionEvidence,
} from "./decisionTypes.js";
import {
  buildReaderDecisionEvidence,
} from "./readerDecisionEvidenceBuilder.js";
import {
  buildDecisionRealityEvidence,
} from "./decisionRealityEvidenceBuilder.js";
import type {
  DecisionRealityAssessment,
} from "./decisionRealityAssessment.js";

/**
 * Decision Evidence Builder
 *
 * Human Destiny Context와 Question Reader 결과를 읽어
 * Decision Engine이 사용할 판단 근거 목록을 구성한다.
 *
 * 이 Builder는 Verdict를 결정하지 않는다.
 */
export function buildDecisionEvidence(
  input: DecisionEngineInput,
  brain: DecisionBrain,
  realityAssessment:
  DecisionRealityAssessment,
  compatibilityAssessment:
  CompatibilityAssessment,
): DecisionEvidence[] {
  const readerEvidence =
  buildReaderDecisionEvidence(
    input,
  );

  const realityEvidence =
  buildDecisionRealityEvidence(
    realityAssessment,
  );

const compatibilityEvidence =
  buildCompatibilityEvidence(
    compatibilityAssessment,
    input.question.analysisScope,
  );

return [
    {
      source: "humanIdentity",

      key: "identity",

      description:
        brain.snapshot.identity,

      weight: 5,
    },

    {
      source: "lifePhase",

      key: "currentPhase",

      description:
        brain.snapshot.currentPhase,

      weight: 5,
    },

    {
      source: "lifeDriver",

      key: "lifeDriver",

      description:
        brain.snapshot.lifeDriver,

      weight: 4,
    },

    {
      source: "survivalStyle",

      key: "survivalStyle",

      description:
        brain.snapshot.survivalStyle,

      weight: 3,
    },

    ...input.humanContext
      .identity
      .profile
      .repeatedPattern
      .primary
      .evidence
      .map(
        (
          item,
          index,
        ): DecisionEvidence => ({
          source:
            "repeatedPattern",

          key:
            `repeatedPattern-primary-${index + 1}`,

          description:
            item.description,

          weight:
            item.weight,
        }),
      ),

    ...(
      input.humanContext
        .identity
        .profile
        .repeatedPattern
        .secondary
        ?.evidence
      ?? []
    ).map(
      (
        item,
        index,
      ): DecisionEvidence => ({
        source:
          "repeatedPattern",

        key:
          `repeatedPattern-secondary-${index + 1}`,

        description:
          item.description,

        weight:
          item.weight,
      }),
    ),

    ...readerEvidence,

    ...realityEvidence,

    ...compatibilityEvidence,

{
      source: "questionIntent",

      key: "questionIntent",

      description: [
        input.question.asksWhat,

        input.question.asksWhy,

        input.question
          .decisionQuestion,
      ]
        .filter(Boolean)
        .join(" "),

      weight: 3,
    },
  ];
}
