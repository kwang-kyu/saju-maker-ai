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