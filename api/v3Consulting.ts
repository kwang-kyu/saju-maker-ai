import type {
  V3ConsultingRequest,
} from "../src/v3/consulting/v3ConsultingRequest.js";

import {
  buildInitialConsultingExecution,
} from "../src/v3/consulting/initialConsultingExecutionBuilder.js";

import {
  buildConsultingOpenAIRequest,
} from "../src/v3/consulting/openai/consultingOpenAIAdapter.js";

/**
 * 원천 생년월일시에서 사람을 먼저 읽은 뒤
 * 질문 판단과 GPT 설명 요청을 생성한다.
 *
 * 처리 순서:
 * Calculator
 * → Fact
 * → Evidence
 * → Master Reader
 * → Human Destiny Context
 * → Human Life Context
 * → Question Reader
 * → Question Context
 * → Assessment
 * → Builder
 * → Decision Engine
 * → Explanation
 * → GPT Request
 *
 * 구조화된 실행 결과는
 * buildInitialConsultingExecution에서 생성하며,
 * 이 함수는 기존 API 계약에 맞게 GPT 요청만 반환한다.
 */
export async function buildV3ConsultingRequest(
  params:
    V3ConsultingRequest,
) {
  const execution =
    buildInitialConsultingExecution(
      params,
    );

  return buildConsultingOpenAIRequest(
    execution
      .turnResult
      .prompt,
  );
}