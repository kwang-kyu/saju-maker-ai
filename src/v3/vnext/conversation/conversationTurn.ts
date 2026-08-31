/**
 * vNext Conversation Turn 계약.
 *
 * 한 번의 사용자 질문과 그에 대한 분석·응답 결과를 기록한다.
 * 판단을 새로 만들지 않으며, 파이프라인 실행 결과를 저장한다.
 */

import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import type {
  ConsultingScenario,
} from "../types/consultingScenario.js";
import type {
  ResponseAction,
} from "../response/responseContext.js";
import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import type {
  ConversationTurnId,
} from "./conversationTypes.js";

/**
 * vNext Conversation Turn.
 *
 * 첫 질문과 follow-up·clarification 답변 모두 동일한 형태로 저장한다.
 */
export type ConversationTurn = {
  turnId: ConversationTurnId;
  /** 사용자가 입력한 질문 텍스트 */
  question: string;
  /** Question Reader → QuestionMeaningAdapter 결과 */
  questionMeaning: QuestionMeaning | null;
  /** Scenario Router 결과 */
  scenario: ConsultingScenario | null;
  /** Response Action Resolver 결과 */
  responseAction: ResponseAction | null;
  /** 최종 자연어 응답 — clarification / direct / consulting 공통 */
  response: NaturalConsultingResponse | null;
  createdAt: string;
};
