import type { HumanDestinyContext } from "../../types/humanDestinyContext";
import { readQuestion } from "../question/questionReader";
import { runDecisionEngine } from "./decisionEngine";
import type { DecisionResult } from "./decisionTypes";

export type DecisionEngineVerificationResult = {
  question: string;

  growthResult: DecisionResult;
  recoveryResult: DecisionResult;

  verdictChanged: boolean;
  readinessChanged: boolean;
  alignmentChanged: boolean;

  passed: boolean;
};

export type RepeatedPatternVerificationResult = {
  question: string;

  stableGrowthResult: DecisionResult;
  earlyCollapseResult: DecisionResult;

  conditionsChanged: boolean;
  risksChanged: boolean;
  prohibitedDirectionChanged: boolean;
  verdictChanged: boolean;

  passed: boolean;
};
/**
 * Decision Engine 반복 패턴 민감도 검증
 *
 * 동일한 사람, 동일한 질문, 동일한 현재 국면을 유지하고
 * Repeated Pattern만 변경하여
 * 조건·위험·금지 방향이 실제로 달라지는지 확인한다.
 *
 * 이 단계에서는 Repeated Pattern이 Verdict를 변경하는 것을
 * 필수 통과 조건으로 요구하지 않는다.
 */
export function verifyDecisionEngineRepeatedPatternSensitivity(
  baseContext: HumanDestinyContext,
  questionText = "지금 사업을 시작해도 될까요?",
): RepeatedPatternVerificationResult {
  const stableGrowthContext: HumanDestinyContext = {
    ...baseContext,
    identity: {
      ...baseContext.identity,
      profile: {
        ...baseContext.identity.profile,
        repeatedPattern: {
          ...baseContext.identity.profile.repeatedPattern,
          primary: {
            ...baseContext.identity.profile.repeatedPattern.primary,
            pattern: "slowGrowthStable",
            confidence: "high",
          },
          secondary: null,
          repeatedBehaviors: [
            "작게 시작하여 점진적으로 성장한다.",
          ],
          strengths: [
            "지속력이 강하다.",
          ],
          risks: [
            "결정이 늦어질 수 있다.",
          ],
        },
      },
    },
  };

  const earlyCollapseContext: HumanDestinyContext = {
    ...baseContext,
    identity: {
      ...baseContext.identity,
      profile: {
        ...baseContext.identity.profile,
        repeatedPattern: {
          ...baseContext.identity.profile.repeatedPattern,
          primary: {
            ...baseContext.identity.profile.repeatedPattern.primary,
            pattern: "earlySuccessCollapse",
            confidence: "high",
          },
          secondary: null,
          repeatedBehaviors: [
            "성과가 생기면 확장을 서두른다.",
          ],
          strengths: [
            "실행력이 빠르다.",
          ],
          risks: [
            "과도한 확장이 반복될 수 있다.",
            "재무 관리가 흔들릴 수 있다.",
          ],
        },
      },
    },
  };

  const stableGrowthQuestion = readQuestion(
    stableGrowthContext,
    questionText,
  );

  const earlyCollapseQuestion = readQuestion(
    earlyCollapseContext,
    questionText,
  );

  const stableGrowthResult = runDecisionEngine({
    humanContext: stableGrowthContext,
    question: stableGrowthQuestion,
  });

  const earlyCollapseResult = runDecisionEngine({
    humanContext: earlyCollapseContext,
    question: earlyCollapseQuestion,
  });

  const conditionsChanged =
    JSON.stringify(stableGrowthResult.conditions) !==
    JSON.stringify(earlyCollapseResult.conditions);

  const risksChanged =
    JSON.stringify(stableGrowthResult.risks) !==
    JSON.stringify(earlyCollapseResult.risks);

  const prohibitedDirectionChanged =
    stableGrowthResult.prohibitedDirection !==
    earlyCollapseResult.prohibitedDirection;

  const verdictChanged =
    stableGrowthResult.verdict !==
    earlyCollapseResult.verdict;

  const passed =
    conditionsChanged &&
    risksChanged &&
    prohibitedDirectionChanged;

  return {
    question: questionText,

    stableGrowthResult,
    earlyCollapseResult,

    conditionsChanged,
    risksChanged,
    prohibitedDirectionChanged,
    verdictChanged,

    passed,
  };
}
/**
 * Decision Engine 국면 민감도 검증
 *
 * 동일한 사람과 동일한 질문을 유지한 채
 * 현재 인생 국면만 growth와 recovery로 바꾸어
 * 엔진 판단이 실제로 달라지는지 확인한다.
 *
 * 이 함수는 새로운 사주 판단을 만들지 않는다.
 * Decision Engine이 Human Life Phase를 실제 판단 근거로
 * 사용하고 있는지만 검증한다.
 */
export function verifyDecisionEnginePhaseSensitivity(
  baseContext: HumanDestinyContext,
  questionText = "지금 사업을 시작해도 될까요?",
): DecisionEngineVerificationResult {
  const growthContext: HumanDestinyContext = {
    ...baseContext,
    currentPhase: {
      ...baseContext.currentPhase,
      phase: "growth",
      title: "성장 국면",
      description:
        "현재는 활동 범위를 넓히고 새로운 기회를 실행으로 연결해야 하는 국면이다.",
    },
  };

  const recoveryContext: HumanDestinyContext = {
    ...baseContext,
    currentPhase: {
      ...baseContext.currentPhase,
      phase: "recovery",
      title: "회복 국면",
      description:
        "현재는 새로운 확장보다 손실을 줄이고 기반을 회복하는 것이 먼저인 국면이다.",
    },
  };

  const growthQuestion = readQuestion(
    growthContext,
    questionText,
  );

  const recoveryQuestion = readQuestion(
    recoveryContext,
    questionText,
  );

  const growthResult = runDecisionEngine({
    humanContext: growthContext,
    question: growthQuestion,
  });

  const recoveryResult = runDecisionEngine({
    humanContext: recoveryContext,
    question: recoveryQuestion,
  });

  const verdictChanged =
    growthResult.verdict !== recoveryResult.verdict;

  const readinessChanged =
    growthResult.actionReadiness !==
    recoveryResult.actionReadiness;

  const alignmentChanged =
    growthResult.contextAlignment !==
    recoveryResult.contextAlignment;

  const passed =
    growthResult.contextAlignment === "stronglyAligned" &&
    recoveryResult.contextAlignment ===
      "stronglyConflicted" &&
    growthResult.verdict !== "notRecommended" &&
    recoveryResult.verdict === "notRecommended" &&
    readinessChanged;

  return {
    question: questionText,

    growthResult,
    recoveryResult,

    verdictChanged,
    readinessChanged,
    alignmentChanged,

    passed,
  };
}