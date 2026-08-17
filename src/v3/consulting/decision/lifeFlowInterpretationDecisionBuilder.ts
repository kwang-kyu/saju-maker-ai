import { analyzeContextAlignment } from "./contextAlignment";
import { buildDecisionBrain } from "./decisionBrain";
import type {
  DecisionEngineInput,
  DecisionEvidence,
  DecisionResult,
} from "./decisionTypes";
import {
  buildDecisionResult,
} from "./decisionResultBuilder";
import {
  assessLifeFlowInterpretation,
} from "./lifeFlowInterpretationAssessment";
import {
  buildLifeFlowInterpretationEvidence,
} from "./lifeFlowInterpretationEvidenceBuilder";
import {
  buildReaderDecisionEvidence,
} from "./readerDecisionEvidenceBuilder";

function resolveLifeFlowInterpretationConfidence(
  assessment:
    ReturnType<
      typeof assessLifeFlowInterpretation
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
    >= 3
  ) {
    return "medium";
  }

  return "high";
}

function buildScopeDescription(
  assessment:
    ReturnType<
      typeof assessLifeFlowInterpretation
    >,
): string {
  const target =
    assessment.target;

  if (
    !target
  ) {
    return "요청한 기간";
  }

  switch (target.scope) {
    case "overall":
      return "총운·전체 운 흐름";

    case "year":
      return `${target.targetYear}년 연운`;

    case "halfYear":
      return `${target.targetYear}년 ${target.half === "first" ? "상반기" : "하반기"} 운`;

    case "month":
      return `${target.targetYear}년 ${target.targetMonth}월 월운`;

    case "day":
      return `${target.startDate} 일운`;
  }
}

export function buildLifeFlowInterpretationDecisionResult(
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
    assessLifeFlowInterpretation({
      humanContext:
        input.humanContext,

      selfSajuFacts:
        input.selfSajuFacts
        ?? null,

      target:
        input.lifeFlowTarget
        ?? null,

      targetPeriodLuckFlow:
        input.targetPeriodLuckFlow
        ?? null,
    });

  const lifeFlowEvidence =
    buildLifeFlowInterpretationEvidence(
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
          "humanIdentity",

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
          "lifePhase",

        key:
          "currentPhase",

        description:
          brain
            .snapshot
            .currentPhase,

        weight:
          4,
      },
      ...readerEvidence.filter(
        (item) =>
          item.source
          === "blessing"
          || item.source
          === "destiny"
          || item.source
          === "capacity"
          || item.source
          === "lifePhase",
      ),
      ...lifeFlowEvidence,
      {
        source:
          "questionIntent",

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
    resolveLifeFlowInterpretationConfidence(
      assessment,
    );

  const scopeDescription =
    buildScopeDescription(
      assessment,
    );

  const coreDecision =
    assessment.available
      ? `${scopeDescription}의 핵심 흐름: ${assessment.overallTheme}`
      : assessment
        .target
        ?.ambiguity
        ?.reason
      ?? assessment
        .limitations[0]
      ?? "대상 기간의 운 흐름을 계산할 근거가 부족하다.";

  const recommendedDirection =
    assessment.available
      ? assessment
        .supportiveSignals
        .slice(0, 3)
        .join(" ")
      : "기간과 계산 근거가 확보되면 운 흐름 해석을 다시 제공할 수 있다.";

  const prohibitedDirection =
    assessment.available
    && assessment
      .cautions
      .length
    > 0
      ? assessment
        .cautions
        .join(" ")
      : assessment.available
        ? ""
        : "계산되지 않은 운세 사건이나 행동 결정을 추측하지 않는다.";

  const finalDecisionSentence =
    assessment.available
      ? `${scopeDescription}을 사주 계산 근거로 해석했다. ${assessment.overallTheme}`
      : coreDecision;

  return buildDecisionResult({
    decisionInput:
      input,

    verdict:
      assessment.available
        ? "interpreted"
        : "insufficientEvidence",

    confidence,

    contextAlignment:
      alignmentResult.alignment,

    actionReadiness:
      "ready",

    coreDecision,

    decisionReason:
      assessment.available
        ? assessment.phaseInterpretation
        : coreDecision,

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

    lifeFlowInterpretationAssessment:
      assessment,

    finalDecisionSentence,
  });
}
