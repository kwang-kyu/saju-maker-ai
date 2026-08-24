import type {
  ConsultingClarificationFact,
} from "../consultingInput.js";

import type {
  QuestionReaderResult,
} from "./questionReader.js";

export type QuestionCounterpartRelation =
  | "spouse"
  | "partner"
  | "lover"
  | "friend"
  | "parent"
  | "child"
  | "sibling"
  | "coworker"
  | "businessPartner"
  | "other"
  | "unknown";

export type QuestionCounterpartContext = {
  exists:
    boolean;

  relation:
    QuestionCounterpartRelation;

    identityProvided:
    boolean;

  /**
   * 생년월일·양력/음력·성별이 모두 확인되어
   * 상대방 원국 계산이 가능한 상태다.
   */
  birthDataProvided:
    boolean;

  /**
   * 정식 출생정보는 없지만 상대방의 띠가 확인되어
   * 띠 기준 간이 궁합이 가능한 상태다.
   */
  zodiacProvided:
    boolean;
};

export type QuestionActionObjectType =
  | "business"
  | "job"
  | "investment"
  | "realEstate"
  | "marriage"
  | "relationship"
  | "health"
  | "legal"
  | "lifeDirection"
  | "other"
  | "unknown";

export type QuestionActionObject = {
  type:
    QuestionActionObjectType;

  subtype:
    string | null;

  description:
    string | null;
};

export type QuestionRealityArea =
  | "financial"
  | "family"
  | "work"
  | "time"
  | "health"
  | "relationship";

export type QuestionRealitySignal =
  | "debtBurden"
  | "livingCostPressure"
  | "incomeInstability"
  | "fixedCostPressure"
  | "lossConcern"
  | "essentialFundsExposure"
  | "liquidityConstraint"
  | "assetConcentration"
  | "familyResponsibility"
  | "currentWorkResponsibility"
  | "timeConstraint"
  | "transitionDifficulty"
  | "healthConstraint"
  | "relationshipConstraint";

export type QuestionRealityConstraint = {
  area:
    QuestionRealityArea;

  signal:
    QuestionRealitySignal;

  description:
    string;

  evidence:
    string[];

  explicit:
    true;
};

export type QuestionRealityContext = {
  constraints:
    QuestionRealityConstraint[];

  hasExplicitConstraints:
    boolean;
};

export type QuestionAnalysisRequirements = {
  counterpartReadingRequired:
    boolean;

  compatibilityAnalysisRequired:
    boolean;

  timingAnalysisRequired:
    boolean;

  timingSearchRequired:
    boolean;

  realityAssessmentRequired:
    boolean;

  comparisonAnalysisRequired:
    boolean;

  roleRecommendationAnalysisRequired:
    boolean;

  lifeFlowInterpretationAnalysisRequired:
    boolean;
};

export type QuestionContext = {
  question:
    QuestionReaderResult;

  /**
   * 연속 상담에서 사용자가 직접 답하고
   * interpreter 검증을 통과한 사실만 담는다.
   *
   * 원문 질문을 변형하지 않고 엔진에 추가 현실을 전달한다.
   */
  clarificationFacts?:
    readonly ConsultingClarificationFact[];

  reality:
    QuestionRealityContext;

  timingType:
    QuestionReaderResult["timingType"];

  counterpart:
    QuestionCounterpartContext;

  actionObject:
    QuestionActionObject;

  comparisonTargets:
    string[];

  requirements:
    QuestionAnalysisRequirements;
};
