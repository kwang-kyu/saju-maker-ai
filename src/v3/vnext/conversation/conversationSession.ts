/**
 * vNext Conversation Session 계약.
 *
 * multi-turn 상담 세션 전체를 표현한다.
 * 첫 질문부터 follow-up·clarification까지 동일 세션에서 처리한다.
 */

import type {
  ConversationSessionId,
} from "./conversationTypes.js";
import type {
  ConversationContextMetadata,
} from "./conversationTypes.js";
import type {
  ConversationTurn,
} from "./conversationTurn.js";
import type {
  ConversationAnalysisCache,
} from "./conversationContextCache.js";

/**
 * vNext Conversation Session.
 *
 * turns: 질문·응답 이력
 * analysisCache: 세션 전반 공유 분석 결과
 * contextMetadata: clarification·scenario 등 현재 맥락
 */
export type ConversationSession = {
  sessionId: ConversationSessionId;
  turns: ConversationTurn[];
  analysisCache: ConversationAnalysisCache;
  contextMetadata: ConversationContextMetadata;
};
