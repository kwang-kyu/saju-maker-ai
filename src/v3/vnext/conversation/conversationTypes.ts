/**
 * vNext Conversation 공통 Type 계약.
 *
 * 대화 세션·턴·캐시 간 공유되는 식별자와 메타데이터를 정의한다.
 * 판단 로직을 포함하지 않으며, 기존 vNext 분석 결과를 저장·재사용하기 위한 계약이다.
 */

import type {
  HumanStateDomain,
} from "../types/humanState.js";
import type {
  TimeGranularity,
} from "../types/timeState.js";
import type {
  QuestionDomain,
} from "../types/questionMeaning.js";
import type {
  ConsultingScenarioType,
} from "../types/consultingScenario.js";
import type {
  QuestionCounterpartFacts,
} from "../../consulting/question/questionReader.js";

/** 대화 세션 식별자 */
export type ConversationSessionId = string;

/** 대화 턴 식별자 */
export type ConversationTurnId = string;

/**
 * 캐시 항목 재사용 판단용 메타데이터.
 *
 * ConversationReuseResolver(5C-3)가 read-only로 참조한다.
 */
export type ConversationCacheReuseMetadata = {
  /** 후속 질문에서 재사용 가능 여부 */
  reusable: boolean;
  /** HumanState가 커버하는 domain 목록 */
  domains?: HumanStateDomain[];
  /** TimeState 대상 시간 단위 */
  timeGranularity?: TimeGranularity;
  /** TimeState 대상 기간 식별 키 (예: "2025-10", "2025-10-mid") */
  timePeriodKey?: string;
  /** ConsultingScenario 유형 */
  scenarioType?: ConsultingScenarioType;
  /** QuestionMeaning domain */
  questionDomain?: QuestionDomain;
  /** 재사용 판단 보조 메모 — resolver 전용 */
  notes?: string[];
};

/**
 * 분석 결과 캐시 항목 공통 형태.
 *
 * 값(value)은 기존 vNext 파이프라인 결과를 그대로 보관한다.
 * 새로운 판단을 생성하지 않는다.
 */
export type ConversationCacheEntry<T> = {
  value: T;
  sourceTurnId: ConversationTurnId;
  createdAt: string;
  reuseMetadata: ConversationCacheReuseMetadata;
};

/** 세션 현재 맥락 메타데이터 — UI·파이프라인 상태 추적용 */
export type ConversationContextMetadata = {
  /** 마지막으로 완료된 턴 ID */
  lastCompletedTurnId: ConversationTurnId | null;
  /** clarification 대기 중 여부 */
  awaitingClarification: boolean;
  /** clarification에 필요한 missingContext key 목록 */
  pendingMissingContextKeys: string[];
  /** 원본(첫) 질문 — clarification 병합 시 유지 */
  originalQuestion: string | null;
  /** 마지막 활성 scenario 유형 */
  activeScenarioType: ConsultingScenarioType | null;
  /** 세션 누적 GPT API 호출 횟수 — 검증용 */
  totalGptApiCallCount: number;
  /** 세션에 축적된 상대방 사실 — QuestionReaderResult.counterpartFacts와 호환 */
  counterpartFacts?: QuestionCounterpartFacts;
  /** 세션 생성 시각 */
  createdAt: string;
  /** 마지막 갱신 시각 */
  updatedAt: string;
};
