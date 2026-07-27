import type {
  ConsultingInput,
} from "./consultingInput";

import {
  readQuestion,
} from "./question/questionReader";
import {
  buildQuestionContext,
} from "./question/questionContextBuilder";

import {
  runDecisionEngine,
} from "./decision/decisionEngine";

import {
  readDecisionResult,
} from "./explanation/decisionResultReader";

import {
  buildDecisionExplanationPlan,
} from "./explanation/decisionExplanationPlan";

import {
  buildDecisionExplanationPayload,
} from "./explanation/decisionExplanationPayload";

import {
  buildConsultingPrompt,
} from "./explanation/consultingPromptBuilder";

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

  explanationPlan:
    ReturnType<typeof buildDecisionExplanationPlan>;

  explanationPayload:
    ReturnType<typeof buildDecisionExplanationPayload>;

  prompt:
    ReturnType<typeof buildConsultingPrompt>;
};

/**
 * 질문 한 번마다 전체 상담 판단 경로를 다시 실행한다.
 *
 * 기존 사람 분석과 현재 현실은 입력으로 유지하지만,
 * 이전 GPT 답변을 근거로 새 판단을 만들지 않는다.
 */
export function runConsultingTurn(
  input:
    ConsultingInput,
): ConsultingTurnRunResult {
  const questionReaderResult =
    readQuestion(
      input.humanContext,
      input.question,
    );

  const questionContext =
    buildQuestionContext(
      questionReaderResult,
    );

  const decisionResult =
    runDecisionEngine({
      humanContext:
        input.humanContext,

      lifeContext:
        input.lifeContext,

      question:
        questionReaderResult,

      questionContext,
    });

  const explanation =
    readDecisionResult(
      decisionResult,
    );

  const explanationPlan =
    buildDecisionExplanationPlan(
      explanation,
    );

  const explanationPayload =
    buildDecisionExplanationPayload(
      explanationPlan,
    );

  const prompt =
    buildConsultingPrompt(
      explanationPayload,
    );

  return {
    questionReaderResult,

    questionContext,

    decisionResult,

    explanation,

    explanationPlan,

    explanationPayload,

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