import { analyzeContextAlignment } from "./contextAlignment.js";
import { buildDecisionBrain } from "./decisionBrain.js";
import type {
  DecisionEngineInput,
  DecisionEvidence,
  DecisionResult,
} from "./decisionTypes.js";
import {
  buildDecisionResult,
} from "./decisionResultBuilder.js";
import {
  assessRoleRecommendation,
} from "./roleRecommendationAssessment.js";
import {
  buildRoleRecommendationEvidence,
} from "./roleRecommendationEvidenceBuilder.js";
import {
  buildReaderDecisionEvidence,
} from "./readerDecisionEvidenceBuilder.js";

function resolveRoleRecommendationConfidence(
  assessment:
    ReturnType<
      typeof assessRoleRecommendation
    >,
): DecisionResult["confidence"] {
  if (
    !assessment.available
  ) {
    return "low";
  }

  if (
    assessment
      .limitations
      .length
    >= 2
  ) {
    return "medium";
  }

  return "high";
}

export function buildRoleRecommendationDecisionResult(
  input:
    DecisionEngineInput,
): DecisionResult {
  const brain =
    buildDecisionBrain(
      input.humanContext,
      input.question,
    );

  const alignmentResult =
    analyzeContextAlignment(
      input.humanContext,
      input.question,
    );

  const assessment =
    assessRoleRecommendation(
      input.humanContext,
    );

  const roleEvidence =
    buildRoleRecommendationEvidence(
      assessment,
    );

  const readerEvidence =
    buildReaderDecisionEvidence(
      input,
    );

  const evidence: DecisionEvidence[] =
    [
      {
        source:
          "humanIdentity" as const,

        key:
          "identity",

        description:
          brain
            .snapshot
            .identity,

        weight:
          5,
      },
      {
        source:
          "lifeDriver" as const,

        key:
          "lifeDriver",

        description:
          brain
            .snapshot
            .lifeDriver,

        weight:
          4,
      },
      {
        source:
          "survivalStyle" as const,

        key:
          "survivalStyle",

        description:
          brain
            .snapshot
            .survivalStyle,

        weight:
          4,
      },
      {
        source:
          "repeatedPattern" as const,

        key:
          "repeatedPattern",

        description:
          brain
            .snapshot
            .repeatedPattern,

        weight:
          4,
      },
      ...readerEvidence.filter(
        (item) =>
          item.source
          === "career"
          || item.source
          === "humanIdentity",
      ),
      ...roleEvidence,
      {
        source:
          "questionIntent" as const,

        key:
          "questionIntent",

        description:
          [
            input
              .question
              .asksWhat,

            input
              .question
              .asksWhy,

            input
              .question
              .decisionQuestion,
          ]
            .filter(Boolean)
            .join(" "),

        weight:
          3,
      },
    ];

  const confidence =
    resolveRoleRecommendationConfidence(
      assessment,
    );

  const primaryTitle =
    assessment
      .primaryRole
      .title;

  const secondaryTitles =
    [
      assessment
        .candidates[1]
        .title,
      assessment
        .candidates[2]
        .title,
    ].join(
      ", ",
    );

  const coreDecision =
    assessment.available
      ? `가장 잘 맞는 대표 배역은 ${primaryTitle}이다. 추가로 ${secondaryTitles} 유형도 이 사람의 사주 성격과 연결된다.`
      : "HumanDestinyContext가 없어 대표 배역을 계산할 수 없다.";

  const recommendedDirection =
    assessment.available
      ? [
          `${primaryTitle}의 ${assessment.primaryRole.performanceStyle}`,
          assessment
            .candidates[1]
            .strongScenes,
          assessment
            .candidates[2]
            .strongScenes,
        ].join(" ")
      : "사주 성격 자료가 확보되면 배역 추천을 다시 계산할 수 있다.";

  const prohibitedDirection =
    assessment
      .avoidedRolePatterns
      .length
      > 0
      ? assessment
        .avoidedRolePatterns
        .join(" ")
      : "현재 확인된 근거에서는 특정 배역 유형을 배제할 근거가 없다.";

  const finalDecisionSentence =
    assessment.available
      ? `이 사람의 사주 성격상 ${primaryTitle}이 가장 잘 맞으며, ${secondaryTitles}도 함께 어울린다.`
      : coreDecision;

  return buildDecisionResult({
    decisionInput:
      input,

    verdict:
      assessment.available
        ? "recommended"
        : "insufficientEvidence",

    confidence,

    contextAlignment:
      alignmentResult.alignment,

    actionReadiness:
      "ready",

    coreDecision,

    decisionReason:
      input
        .humanContext
        .identity
        .humanSummary
        .coreIdentity,

    evidence,

    conditions:
      [],

    risks:
      [],

    currentPhaseDescription:
      brain
        .snapshot
        .currentPhase,

    recommendedDirection,

    prohibitedDirection,

    roleRecommendationAssessment:
      assessment,

    finalDecisionSentence,
  });
}
