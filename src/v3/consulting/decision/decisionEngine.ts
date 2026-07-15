import { analyzeContextAlignment } from "./contextAlignment";
import { buildDecisionBrain } from "./decisionBrain";
import type {
  DecisionEngineInput,
  DecisionResult,
} from "./decisionTypes";
import { buildVerdict } from "./verdictBuilder";
import { buildCoreDecision } from "./coreDecisionBuilder";
import {
  resolveConfidence,
  resolveActionReadiness,
} from "./decisionResolver";
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