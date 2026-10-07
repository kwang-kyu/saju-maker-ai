import {
  assessDecisionReality,
} from "./decisionRealityAssessment.js";
import {
  assessTiming,
} from "./timingAssessment.js";
import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "./decisionEngine.js";
import {
  extractActionCandidateArms,
  resolveActionCandidateComparison,
  type ActionCandidateComparisonResult,
} from "./actionCandidateComparison.js";
import type {
  DecisionResult,
} from "./decisionTypes.js";

export type ActionCandidateComparisonCaseResult = {
  id: string;
  question: string;
  intent: string;
  analysisMode: string;
  primaryDecisionTarget: string;
  exclusiveAltParticipants: string[] | null;
  arms: string[] | null;
  evaluations: Array<{
    decisionTarget: string;
    alignment: string;
    readiness: string;
    verdict: string;
  }> | null;
  winner: string | null;
  result: {
    decisionTarget: string;
    verdict: string;
    coreDecision: string;
    recommendedDirection: string;
  };
  checks: Record<string, boolean>;
  passed: boolean;
};

export type ActionCandidateComparisonVerificationResult = {
  cases: ActionCandidateComparisonCaseResult[];
  passed: boolean;
};

export const QUESTIONS = {
  A1: "지금 직장을 계속 다닐까요, 아니면 이직하는 게 나을까요?",
  A2: "회사를 계속 다닐지 그만둘지 고민입니다.",
  A3: "사업에 투자할까요, 아니면 기다리는 게 나을까요?",
  S1: "사업을 시작해도 될까요?",
  S2: "이직해도 될까요?",
} as const;

function runCase(
  id: keyof typeof QUESTIONS,
): {
  question: string;
  intent: string;
  analysisMode: string;
  primaryDecisionTarget: string;
  exclusiveAltParticipants: string[] | null;
  arms: string[] | null;
  comparison: ActionCandidateComparisonResult | null;
  result: DecisionResult;
} {
  const question = QUESTIONS[id];
  const input = buildDecisionEngineRegressionInput({
    questionText: question,
  });

  const lifeAssessment = assessDecisionReality(
    input.lifeContext,
    input.questionContext.reality,
  );

  const timingAssessment = assessTiming({
    questionContext: input.questionContext,
    humanContext: input.humanContext,
    selfSajuFacts: input.selfSajuFacts ?? null,
    lifeFlowTarget: input.lifeFlowTarget,
    targetPeriodLuckFlow: input.targetPeriodLuckFlow,
  });

  const exclusive = input
    .question
    .readerMatchDiagnostics
    ?.actionRelations
    ?.find(
      (relation) =>
        relation.kind === "exclusive_alt",
    )
    ?? null;

  const arms = extractActionCandidateArms(
    input.question,
  );

  const comparison = resolveActionCandidateComparison({
    input,
    lifeAssessment,
    timingAssessment,
  });

  const result = runDecisionEngine(input);

  return {
    question,
    intent: input.question.intent,
    analysisMode: input.question.analysisMode,
    primaryDecisionTarget: input.question.decisionTarget,
    exclusiveAltParticipants:
      exclusive?.participants ?? null,
    arms:
      arms?.map(
        (arm) =>
          arm.decisionTarget,
      )
      ?? null,
    comparison,
    result,
  };
}

function verifyActionCase(
  id: "A1" | "A2" | "A3",
  expectedArmSubset: string[],
): ActionCandidateComparisonCaseResult {
  const ran = runCase(id);
  const {
    comparison,
    result,
  } = ran;

  const winner = comparison?.winner.arm.decisionTarget
    ?? null;

  const winnerLabel = winner
    ? ran.comparison!.winner.arm.decisionTarget
    : null;

  const checks: Record<string, boolean> = {
    hasExclusiveAlt:
      Array.isArray(ran.exclusiveAltParticipants)
      && ran.exclusiveAltParticipants.length >= 2,
    hasCandidateArms:
      Array.isArray(ran.arms)
      && ran.arms.length >= 2,
    expectedArmsPresent:
      expectedArmSubset.every(
        (arm) =>
          ran.arms?.includes(arm as never) === true,
      ),
    armEvaluationsRan:
      comparison !== null
      && comparison.evaluations.length >= 2,
    finalVerdictCompared:
      comparison !== null
      && comparison.evaluations.every(
        (evaluation) =>
          evaluation.verdict === "recommended"
          || evaluation.verdict === "conditionallyRecommended"
          || evaluation.verdict === "wait"
          || evaluation.verdict === "notRecommended",
      ),
    winnerExplicitInDecisionTarget:
      winner !== null
      && result.decisionTarget === winner,
    winnerExplicitInCoreDecision:
      winner !== null
      && result.coreDecision.length > 0
      && !result.coreDecision.includes(
        "선택을 조금 더 보류",
      ),
    winnerExplicitInRecommendedDirection:
      winner !== null
      && result.recommendedDirection.includes(
        "후보가 우세하다",
      ),
    noGenericWaitCoveringWinner:
      winner !== null
      && !result.coreDecision.includes(
        "지금 바로 하나를 확정하기보다 선택을 조금 더 보류",
      ),
    noGptRejudgment:
      result.humanContextUsed === true
      && result.questionContextUsed === true,
    selectionOrComparisonSurfacePreserved:
      ran.intent === "selection"
      || ran.intent === "comparison"
      || ran.analysisMode === "selection"
      || Array.isArray(ran.exclusiveAltParticipants),
  };

  const passed = Object.values(checks).every(Boolean);

  return {
    id,
    question: ran.question,
    intent: ran.intent,
    analysisMode: ran.analysisMode,
    primaryDecisionTarget: ran.primaryDecisionTarget,
    exclusiveAltParticipants: ran.exclusiveAltParticipants,
    arms: ran.arms,
    evaluations:
      comparison?.evaluations.map(
        (evaluation) => ({
          decisionTarget: evaluation.arm.decisionTarget,
          alignment: evaluation.alignment,
          readiness: evaluation.actionReadiness,
          verdict: evaluation.verdict,
        }),
      )
      ?? null,
    winner: winnerLabel,
    result: {
      decisionTarget: result.decisionTarget,
      verdict: result.verdict,
      coreDecision: result.coreDecision,
      recommendedDirection: result.recommendedDirection,
    },
    checks,
    passed,
  };
}

function verifySingleCase(
  id: "S1" | "S2",
): ActionCandidateComparisonCaseResult {
  const ran = runCase(id);
  const {
    result,
  } = ran;

  const checks: Record<string, boolean> = {
    noExclusiveAltArms: ran.arms === null,
    noComparison: ran.comparison === null,
    decisionTargetUnchanged:
      result.decisionTarget === ran.primaryDecisionTarget,
    noWinnerAnnotation:
      !result.recommendedDirection.includes(
        "후보가 우세하다",
      ),
    singleDecisionPath:
      result.verdict === "recommended"
      || result.verdict === "conditionallyRecommended"
      || result.verdict === "wait"
      || result.verdict === "notRecommended"
      || result.verdict === "insufficientEvidence"
      || result.verdict === "interpreted",
  };

  const passed = Object.values(checks).every(Boolean);

  return {
    id,
    question: ran.question,
    intent: ran.intent,
    analysisMode: ran.analysisMode,
    primaryDecisionTarget: ran.primaryDecisionTarget,
    exclusiveAltParticipants: ran.exclusiveAltParticipants,
    arms: ran.arms,
    evaluations: null,
    winner: null,
    result: {
      decisionTarget: result.decisionTarget,
      verdict: result.verdict,
      coreDecision: result.coreDecision,
      recommendedDirection: result.recommendedDirection,
    },
    checks,
    passed,
  };
}

export function verifyActionCandidateComparison():
  ActionCandidateComparisonVerificationResult {
  const cases = [
    verifyActionCase("A1", ["continue", "changeJob"]),
    verifyActionCase("A2", ["continue", "stop"]),
    verifyActionCase("A3", ["invest", "wait"]),
    verifySingleCase("S1"),
    verifySingleCase("S2"),
  ];

  return {
    cases,
    passed: cases.every(
      (entry) =>
        entry.passed,
    ),
  };
}
