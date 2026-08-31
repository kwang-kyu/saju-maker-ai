/**
 * vNext Conversation Analysis Cache 계약.
 *
 * 세션 전반에서 공유하는 분석 결과 캐시.
 * 기존 vNext 파이프라인 결과를 저장·재사용하기 위한 read-only 저장소 계약이다.
 * 캐시는 판단 결과를 새로 만들지 않는다.
 */

import type {
  HumanState,
} from "../types/humanState.js";
import type {
  TimeState,
} from "../types/timeState.js";
import type {
  Assessment,
} from "../types/assessment.js";
import type {
  ChangeSignal,
} from "../types/changeSignal.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import type {
  ConsultingScenario,
} from "../types/consultingScenario.js";
import type {
  ResponseContext,
} from "../response/responseContext.js";
import type {
  ConversationCacheEntry,
} from "./conversationTypes.js";

/**
 * vNext Conversation Analysis Cache.
 *
 * 각 필드는 optional이며, 파이프라인이 실행·완료된 항목만 채워진다.
 * follow-up 시 ConversationReuseResolver가 재사용 여부를 판단한다.
 */
export type ConversationAnalysisCache = {
  humanState?: ConversationCacheEntry<HumanState>;
  timeState?: ConversationCacheEntry<TimeState>;
  assessment?: ConversationCacheEntry<Assessment>;
  changeSignals?: ConversationCacheEntry<ChangeSignal[]>;
  questionMeaning?: ConversationCacheEntry<QuestionMeaning>;
  scenario?: ConversationCacheEntry<ConsultingScenario>;
  /** GPT 직전 ResponseContext — continuation 재사용용 */
  responseContext?: ConversationCacheEntry<ResponseContext>;
};
