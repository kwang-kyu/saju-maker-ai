import type {
  ConsultingInput,
} from "./consultingInput.js";

import {
  readQuestion,
} from "./question/questionReader.js";
import {
  buildQuestionContext,
} from "./question/questionContextBuilder.js";

import {
  runDecisionEngine,
} from "./decision/decisionEngine.js";
import {
  buildTargetPeriodLuckFlowForQuestion,
} from "./decision/targetPeriodLuckFlowBuilder.js";

import {
  readDecisionResult,
} from "./explanation/decisionResultReader.js";

import {
  buildDecisionExplanationPlan,
} from "./explanation/decisionExplanationPlan.js";

import {
  buildDecisionExplanationPayload,
} from "./explanation/decisionExplanationPayload.js";

import {
  buildConsultingPrompt,
} from "./explanation/consultingPromptBuilder.js";

import {
  buildConsultingGroundingContext,
} from "./explanation/consultingGroundingContextBuilder.js";

/**
 * 질문 한 번이 천운문 v3의 전체 상담 판단 경로를
 * 통과한 구조화된 실행 결과다.
 *
 * 세션은 GPT 문장만 저장하지 않고,
 * Question Reader·Question Context·Decision Result를
 * 함께 보존해야 한다.
 */
export type ConsultingTurnRunResult = {
  questionReaderResult:
    ReturnType<typeof readQuestion>;

  questionContext:
    ReturnType<typeof buildQuestionContext>;

  decisionResult:
    ReturnType<typeof runDecisionEngine>;

  explanation:
    ReturnType<typeof readDecisionResult>;

  /**
   * Legacy consulting explanation packaging.
   * vNext production GPT Input SoT가 아니다.
   */
  explanationPlan:
    ReturnType<typeof buildDecisionExplanationPlan>;

  /**
   * Legacy consulting explanation packaging.
   * vNext production GPT Input SoT가 아니다.
   */
  explanationPayload:
    ReturnType<typeof buildDecisionExplanationPayload>;

  groundingContext:
    ReturnType<typeof buildConsultingGroundingContext>;

  /**
   * Legacy consultingPromptBuilder output.
   * vNext production uses ResponseContext → buildResponsePromptFromAction.
   */
  prompt:
    ReturnType<typeof buildConsultingPrompt>;
};

/**
 * 질문 한 번마다 전체 상담 판단 경로를 다시 실행한다.
 *
 * 기존 사람 분석과 현재 현실은 입력으로 유지하지만,
 * 이전 GPT 답변을 근거로 새 판단을 만들지 않는다.
 */
function resolveQuestionReaderResult(
  input:
    ConsultingInput,
): ReturnType<typeof readQuestion> {
  const questionInterpretation =
    input.questionInterpretation;

  if (!questionInterpretation) {
    return readQuestion(
      input.humanContext,
      input.question,
    );
  }

  const originalQuestion =
    input.question.trim();

  const interpretedOriginalQuestion =
    questionInterpretation
      .originalQuestion
      .trim();

  if (
    originalQuestion.length
    === 0
  ) {
    throw new Error(
      "Consulting runner requires a non-empty question.",
    );
  }

  if (
    interpretedOriginalQuestion
    !== originalQuestion
  ) {
    throw new Error(
      "Question interpretation must belong to the current original question.",
    );
  }

  if (
    !questionInterpretation
      .humanContextReceived
  ) {
    throw new Error(
      "Question interpretation must confirm Human Destiny Context.",
    );
  }

  return questionInterpretation;
}
export function runConsultingTurn(
  input:
    ConsultingInput,
): ConsultingTurnRunResult {
  const questionReaderResult =
  resolveQuestionReaderResult(
    input,
  );

  const questionContext =
  buildQuestionContext(
    questionReaderResult,
    input.clarificationFacts,
  );

  const targetPeriodBuildResult =
  input.sajuFacts
    && (
      questionContext
        .requirements
        .lifeFlowInterpretationAnalysisRequired
      || questionContext
        .requirements
        .timingAnalysisRequired
    )
      ? buildTargetPeriodLuckFlowForQuestion({
          sajuFacts:
            input.sajuFacts,

          normalizedQuestion:
            questionReaderResult
              .normalizedQuestion,

          purpose:
            questionContext
              .requirements
              .lifeFlowInterpretationAnalysisRequired
              ? "lifeFlowInterpretation"
              : "decisionTiming",
              timingSearchRequired:
          questionContext
              .requirements
              .timingSearchRequired,
        })
      : null;

  const decisionResult =
    runDecisionEngine({
      humanContext:
        input.humanContext,

        lifeContext:
        input.lifeContext,

        selfYearGanZhi:
        input
          .sajuFacts
          ?.calculatedSaju
          .yearGanZhi,

      counterpartSaju:
        input.counterpartSaju,

      selfSajuFacts:
        input
          .sajuFacts
          ?.facts,

      selfSajuCalculation:
        input
          .sajuFacts
          ?.calculatedSaju,

      question:
        questionReaderResult,

      questionContext,

      lifeFlowTarget:
        targetPeriodBuildResult
          ?.target,

      targetPeriodLuckFlow:
        targetPeriodBuildResult
          ?.fact
          ?? undefined,
    });

  const explanation =
    readDecisionResult(
      decisionResult,
    );

    const explanationPlan =
    buildDecisionExplanationPlan(
      explanation,
      questionReaderResult
        .originalQuestion,
      questionContext,
    );

  const explanationPayload =
    buildDecisionExplanationPayload(
      explanationPlan,
    );

    const groundingContext =
    buildConsultingGroundingContext(
      input,
    );

    const prompt =
    buildConsultingPrompt(
      explanationPayload,
      groundingContext,
      questionContext,
    );

  return {
    questionReaderResult,

    questionContext,

    decisionResult,

    explanation,

    explanationPlan,

    explanationPayload,

    groundingContext,

    prompt,
  };
}

/**
 * 기존 단일 상담 호출 계약을 유지한다.
 *
 * 내부적으로 구조화된 상담 실행을 사용하고,
 * 기존 호출부에는 완성된 ConsultingPrompt만 반환한다.
 */
export function runConsulting(
  input:
    ConsultingInput,
): ConsultingTurnRunResult["prompt"] {
  return runConsultingTurn(
    input,
  ).prompt;
}
