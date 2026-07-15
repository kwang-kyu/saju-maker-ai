import { analyzeContextAlignment } from "./contextAlignment";
import { buildDecisionBrain } from "./decisionBrain";
import type {
  ActionReadiness,
  DecisionConfidence,
  DecisionEngineInput,
  DecisionResult,
  DecisionRisk,
  DecisionVerdict,
} from "./decisionTypes";
import { buildVerdict } from "./verdictBuilder";
import { buildVerdictContext } from "./verdictContextBuilder";
import { buildDirectionJudgement } from "./directionJudgementBuilder";
import { buildDecisionEvidence } from "./evidenceBuilder";
import { buildDecisionConditions } from "./conditionBuilder";
import {
  assessLifeContext,
  type LifeContextAssessment,
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

function buildRepeatedPatternRisks(
  input: DecisionEngineInput,
): DecisionRisk[] {
  const repeatedPattern =
    input.humanContext.identity.profile.repeatedPattern;

  const severity: DecisionRisk["severity"] =
    repeatedPattern.primary.confidence === "high"
      ? "high"
      : repeatedPattern.primary.confidence === "medium"
        ? "medium"
        : "low";

  return repeatedPattern.risks.map(
    (description, index): DecisionRisk => ({
      key: `repeatedPattern-${index + 1}`,
      description,
      severity,
      source: "repeatedPattern",
    }),
  );
}
function buildLifeContextRisks(
  assessment: LifeContextAssessment,
): DecisionRisk[] {
  const risks: DecisionRisk[] = [];

  if (
    assessment.financialPressure === "high"
  ) {
    risks.push({
      key: "lifeContextFinancialPressure",
      description:
        "현재 재정 책임이 큰 상태이므로 예상보다 수익 발생이 늦어질 경우 기존 생활 기반과 현금흐름이 함께 흔들릴 수 있다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.familyResponsibility === "high"
  ) {
    risks.push({
      key: "lifeContextFamilyResponsibility",
      description:
        "가족 부양 책임이 큰 상태에서 새로운 선택의 부담까지 동시에 떠안으면 생활 안정성과 관계가 함께 압박받을 수 있다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.transitionDifficulty === "high"
  ) {
    risks.push({
      key: "lifeContextTransitionDifficulty",
      description:
        "기존 직업이나 수입 기반을 한 번에 정리하면 새로운 선택이 자리 잡기 전에 회복하기 어려운 공백이 생길 수 있다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.expansionRisk === "high"
  ) {
    risks.push({
      key: "lifeContextExpansionRisk",
      description:
        "현재 책임 위에 사업, 투자 또는 고정비를 추가하면 관리 범위를 넘어서는 동시 확장 위험이 커진다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.executionConstraint === "high"
  ) {
    risks.push({
      key: "lifeContextExecutionConstraint",
      description:
        "실행 가능한 시간과 자원이 부족한 상태에서 결정을 추진하면 준비 부족과 책임 과부하로 중단될 가능성이 높다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  return risks;
}
function buildRisks(
  alignment: DecisionResult["contextAlignment"],
  urgency: DecisionEngineInput["question"]["urgency"],
): DecisionRisk[] {
  const risks: DecisionRisk[] = [];

  if (
    alignment === "conflicted" ||
    alignment === "stronglyConflicted"
  ) {
    risks.push({
      key: "phaseConflict",
      description:
        "현재 인생 국면과 질문 속 행동 방향이 충돌한다.",
      severity:
        alignment === "stronglyConflicted" ? "high" : "medium",
      source: "lifePhase",
    });
  }

  if (urgency === "immediate") {
    risks.push({
      key: "urgentDecision",
      description:
        "결정을 서두르면 현재 사람의 반복 패턴이 다시 나타날 수 있다.",
      severity: "medium",
      source: "repeatedPattern",
    });
  }

  return risks;
}

function buildCoreDecision(
  verdict: DecisionVerdict,
  decisionQuestion: string,
): string {
  const verdictText: Record<DecisionVerdict, string> = {
    recommended: "진행하는 것이 맞다.",
    conditionallyRecommended:
      "조건을 갖춘 뒤 진행하는 것이 맞다.",
    wait: "지금은 바로 결정하지 말고 기다리는 것이 맞다.",
    notRecommended: "현재는 진행하지 않는 것이 맞다.",
    insufficientEvidence:
      "현재 정보만으로는 결정을 확정할 수 없다.",
  };

  return `${decisionQuestion}: ${verdictText[verdict]}`;
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