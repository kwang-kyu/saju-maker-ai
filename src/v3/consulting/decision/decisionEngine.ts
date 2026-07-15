import { analyzeContextAlignment } from "./contextAlignment";
import { buildDecisionBrain } from "./decisionBrain";
import type {
  ActionReadiness,
  DecisionConfidence,
  DecisionEngineInput,
  DecisionResult,
} from "./decisionTypes";
import { buildVerdict } from "./verdictBuilder";
import { buildCoreDecision } from "./coreDecisionBuilder";
import { buildVerdictContext } from "./verdictContextBuilder";
import { buildDirectionJudgement } from "./directionJudgementBuilder";
import { buildDecisionEvidence } from "./evidenceBuilder";
import { buildDecisionConditions } from "./conditionBuilder";
import {
  buildRisks,
  buildLifeContextRisks,
  buildRepeatedPatternRisks,
} from "./riskBuilder";
import {
  assessLifeContext,
} from "./lifeContextAssessment";

function resolveConfidence(
  questionConfidence: number,
  alignment: DecisionResult["contextAlignment"],
): DecisionConfidence {
  if (
    questionConfidence >= 0.85 &&
    alignment !== "unknown"
  ) {
    return "high";
  }

  if (
    questionConfidence >= 0.6 ||
    alignment !== "unknown"
  ) {
    return "medium";
  }

  return "low";
}

function resolveActionReadiness(
  alignment: DecisionResult["contextAlignment"],
  urgency: DecisionEngineInput["question"]["urgency"],
): ActionReadiness {
  if (alignment === "stronglyConflicted") {
    return "stopRequired";
  }

  if (alignment === "conflicted") {
    return "delayRequired";
  }

  if (alignment === "stronglyAligned") {
    if (urgency === "immediate") {
      return "readyWithConditions";
    }

    return "ready";
  }

  if (alignment === "aligned") {
    return "readyWithConditions";
  }

  if (alignment === "partiallyAligned") {
    return "preparationRequired";
  }

  return "unknown";
}

/**
 * Decision Engine
 *
 * Human Destiny Context를 먼저 읽고,
 * Question Reader 결과를 마지막에 결합해
 * 엔진이 최종 DecisionResult를 생성한다.
 *
 * GPT는 이 결과를 변경하거나 새로 판단하지 않는다.
 */
export function runDecisionEngine(
  input: DecisionEngineInput,
): DecisionResult {
  const brain = buildDecisionBrain(
    input.humanContext,
    input.question,
  );

  const alignmentResult = analyzeContextAlignment(
    input.humanContext,
    input.question,
  );

  const confidence = resolveConfidence(
    input.question.confidence,
    alignmentResult.alignment,
  );

  const actionReadiness = resolveActionReadiness(
    alignmentResult.alignment,
    input.question.urgency,
  );

  const lifeAssessment =
  assessLifeContext(
    input.lifeContext,
  );

  const verdictContext = buildVerdictContext({
    decisionInput: input,
    alignment: alignmentResult.alignment,
    readiness: actionReadiness,
    confidence,
    lifeAssessment,
  });
  
  const verdict = buildVerdict(verdictContext);

  const directionJudgement = buildDirectionJudgement({
    verdict,
    context: verdictContext,
  });

  const evidence = buildDecisionEvidence(input);
  const conditions = buildDecisionConditions({
    decisionInput: input,
    readiness: actionReadiness,
    alignmentReason: alignmentResult.reason,
    lifeAssessment,
  });

  const risks = [
    ...buildRisks(
      alignmentResult.alignment,
      input.question.urgency,
    ),
    ...buildLifeContextRisks(
      lifeAssessment,
    ),
    ...buildRepeatedPatternRisks(input),
  ];

  const conflictExists =
    alignmentResult.alignment === "conflicted" ||
    alignmentResult.alignment === "stronglyConflicted";

  const coreDecision = buildCoreDecision(
    verdict,
    input.question.decisionQuestion,
  );

  return {
    verdict,
    confidence,

    contextAlignment: alignmentResult.alignment,
    actionReadiness,

    decisionTarget: input.question.decisionTarget,
    topic: input.question.topic,
    intent: input.question.intent,

    coreDecision,
    decisionReason: alignmentResult.reason,

    evidence,
    conditions,
    risks,

    conflict: {
      exists: conflictExists,
      description: conflictExists
        ? alignmentResult.reason
        : "현재 사람의 국면과 질문 속 선택 사이에 직접적인 충돌은 확인되지 않았다.",
      humanContextSide: brain.snapshot.currentPhase,
      questionSide: input.question.decisionQuestion,
    },

    recommendedDirection:
      directionJudgement.recommendedDirection,

    prohibitedDirection:
      directionJudgement.prohibitedDirection,

    finalDecisionSentence: [
      coreDecision,
      directionJudgement.recommendedDirection,
    ].join(" "),

    humanContextUsed: true,
    questionContextUsed: true,
  };
}