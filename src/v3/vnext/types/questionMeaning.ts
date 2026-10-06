/**
 * vNext Question Meaning 계약.
 *
 * 사용자가 실제 무엇을 묻는지만 표현한다. 사주 판단을 포함하지 않는다.
 * Question Reader 결과는 Adapter가 이 타입으로 변환한다.
 *
 * QuestionMeaningIntent = vNext scenario-routing taxonomy.
 * Model B QuestionIntent(speech-act)와는 별개이며 병합하지 않는다.
 * Adapter는 speech-act → routing projection 경계이며 새 판단을 만들지 않는다.
 */

import type {
  ConclusionNature,
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionAnalysisScope,
  QuestionObjectReferent,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";
import type {
  LifeFlowHalf,
  LifeFlowScope,
} from "../../consulting/question/lifeFlowTarget.js";

export type QuestionDomain =
  | "money"
  | "career"
  | "business"
  | "relationship"
  | "marriage"
  | "compatibility"
  | "health"
  | "legal"
  | "life"
  | "general"
  | "other";

/**
 * vNext scenario-routing taxonomy.
 * Model B QuestionIntent(speech-act)와 별개 축 — 병합하지 않는다.
 * Adapter가 QuestionIntent → 이 타입으로 routing projection한다.
 * prediction ≠ possibility.
 */
export type QuestionMeaningIntent =
  | "possibility"
  | "prediction"
  | "timing"
  | "direction"
  | "reason"
  | "method"
  | "risk"
  | "comparison"
  | "selection"
  | "interpretation"
  | "existence"
  | "general";

/**
 * 행동 의미 — Reader DecisionTarget taxonomy 재사용.
 * askedObject(대상)와 분리한다.
 */
export type QuestionActionNature = DecisionTarget;

/**
 * 행동의 대상·주제 — Reader QuestionTopic taxonomy 재사용.
 * actionNature(행동)와 분리한다.
 */
export type QuestionAskedObject = QuestionTopic;

/** Reader analysisMode 재사용 — intent와 독립 축 */
export type QuestionMeaningAnalysisMode = QuestionAnalysisMode;

/** Reader analysisScope 재사용 — 새 축이 아닌 passthrough */
export type QuestionMeaningAnalysisScope = QuestionAnalysisScope;

/** Reader conclusionNature 재사용 */
export type QuestionMeaningConclusionNature = ConclusionNature;

/** 질문이 가리키는 시간 초점 */
export type QuestionTimeFocus = {
  urgency: "immediate" | "nearTerm" | "longTerm" | "unspecified";
  timingType: "bestTiming" | "executionTiming" | "waitingTiming" | "unspecified";
  description?: string;
  /**
   * LifeFlowTarget에서 추출한 최소 period identity.
   * 전체 LifeFlowTarget dump가 아니다.
   */
  period?: QuestionTimePeriodIdentity;
};

/**
 * LifeFlowTarget 기반 최소 시간 identity.
 * granularity는 Reader LifeFlowScope를 재사용한다.
 */
export type QuestionTimePeriodIdentity = {
  granularity: LifeFlowScope;
  periodKey?: string;
  year?: number | null;
  month?: number | null;
  day?: number | null;
  half?: LifeFlowHalf | null;
  start?: string;
  end?: string;
};

/** 질문의 대상·객체 (기존 consumer 호환) */
export type QuestionObject = {
  label: string;
  category: string;
  description?: string;
};

/**
 * 객체의 의미 identity.
 * family는 topic/askedObject를 대체하지 않는다.
 */
export type QuestionObjectIdentity = {
  family: string;
  specificity: "generic" | "specific" | "unknown";
  surface: string;
  instanceToken?: string;
  /** Reader objectReferent 투영 — 재해석하지 않는다 */
  referentKind?: QuestionObjectReferent;
};

/** 분석에 필요하지만 아직 제공되지 않은 맥락 */
export type MissingContextItem = {
  key: string;
  description: string;
  required: boolean;
};

/**
 * 상대방 존재 여부와 identity.
 * Reader counterpartFacts 필드를 재사용한다.
 */
export type QuestionMeaningCounterpart = {
  exists: boolean;
  relation?: string | null;
  identity?: {
    birthDate?: string | null;
    birthTime?: string | null;
    calendarType?: "solar" | "lunar" | null;
    gender?: "male" | "female" | null;
  };
};

/** 질문 결과의 최소 질문 identity */
export type QuestionMeaningRef = {
  originalQuestion: string;
  effectiveQuestion?: string;
  sourceTurnId?: string;
};

/**
 * vNext Question Meaning.
 *
 * 기존 축: domain / event / intent / time / object / missingContext
 * 보존 축: actionNature / askedObject / analysisMode / conclusionNature /
 *          counterpart / questionRef / time.period
 */
export type QuestionMeaning = {
  domain: QuestionDomain;
  event: string | null;
  intent: QuestionMeaningIntent;
  time: QuestionTimeFocus;
  object: QuestionObject | null;
  objectIdentity?: QuestionObjectIdentity;
  missingContext: MissingContextItem[];
  /** Reader decisionTarget — 행동 의미 */
  actionNature: QuestionActionNature;
  /** Reader topic — 행동의 대상 */
  askedObject: QuestionAskedObject;
  /** Reader analysisMode — intent와 독립 */
  analysisMode: QuestionMeaningAnalysisMode;
  /**
   * Reader analysisScope passthrough.
   * Response/Prompt가 재해석하지 않는다.
   */
  analysisScope?: QuestionMeaningAnalysisScope;
  /** Reader conclusionNature */
  conclusionNature: QuestionMeaningConclusionNature;
  /** 상대방 존재/identity */
  counterpart: QuestionMeaningCounterpart;
  /** 질문 identity */
  questionRef: QuestionMeaningRef;
  /**
   * P6-C: Reader prioritySurface passthrough.
   * 표현 지시용 flag이며 Adapter가 판단하지 않는다.
   */
  prioritySurface?: boolean;
};
