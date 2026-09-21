import type { HumanDestinyContext } from "../../types/humanDestinyContext.js";
import {
  applyRoleRecommendationNormalization,
  isRoleRecommendationQuestion,
} from "./roleRecommendationQuestionDetector.js";
import {
  applyLifeFlowInterpretationNormalization,
  hasFortuneExpression,
  isLifeFlowInterpretationQuestion,
} from "./lifeFlowInterpretationQuestionDetector.js";
import {
  applyLifeDirectionTopicNormalization,
  hasLifeDirectionCompoundSignal,
} from "./lifeDirectionTopicDisambiguation.js";
import {
  applyRelationshipReconcileNormalization,
} from "./relationshipReconcileDisambiguation.js";
import {
  applyRelationshipSeparationNormalization,
} from "./relationshipSeparationDisambiguation.js";

export type QuestionTopic =
  | "business"
  | "money"
  | "job"
  | "realEstate"
  | "relationship"
  | "love"
  | "marriage"
  | "family"
  | "health"
  | "legal"
  | "lifeFlow"
  | "lifeDirection"
  | "general";

/**
 * MODEL B production QuestionIntent (P11-7-2 I-18/I-19 freeze).
 * Speech-act only — the user's question act, not vNext scenario-routing.
 * Action direction lives on DecisionTarget.
 * Routing taxonomy is QuestionMeaningIntent (separate; do not merge).
 */
export type QuestionIntent =
  | "permission"
  | "evaluation"
  | "selection"
  | "comparison"
  | "timing"
  | "reason"
  | "method"
  | "risk"
  | "prediction"
  | "existence";

/**
 * Removed from production QuestionIntent (MODEL B).
 * Fixture / Reader-generation compatibility only — not the production contract.
 * Phase 2 migrates Reader generation; Phase 6 migrates fixtures.
 */
export type LegacyReaderIntentLiteral =
  | "possibility"
  | "continuation"
  | "termination"
  | "generalJudgement";

/** Phase 1 compile/fixture bridge. Prefer QuestionIntent in production paths. */
export type QuestionIntentOrLegacy =
  | QuestionIntent
  | LegacyReaderIntentLiteral;

/**
 * Reader keyword/normalizer generation-time intent.
 * Still emits legacy literals until Phase 2; mapped at production boundary.
 */
type ReaderIntentLiteral = QuestionIntentOrLegacy;

/**
 * Map Reader-generated / legacy intent literals onto MODEL B QuestionIntent.
 * continuation/termination action meaning stays on DecisionTarget.
 */
export function toModelBQuestionIntent(
  intent: ReaderIntentLiteral,
): QuestionIntent {
  switch (intent) {
    case "possibility":
      return "permission";
    case "generalJudgement":
      return "evaluation";
    case "continuation":
    case "termination":
      return "evaluation";
    default:
      return intent;
  }
}

export type ConclusionNature =
  | "decision"
  | "interpretation"
  | "existence"
  | "recommendation"
  | "prediction"
  | "warning";

export type QuestionMotive =
  | "opportunityCapture"
  | "expansion"
  | "recovery"
  | "survival"
  | "lossAvoidance"
  | "anxietyReduction"
  | "relationshipConfirmation"
  | "lifeTransition"
  | "selfUnderstanding"
  | "unspecified";

/**
 * Action direction for the asked object.
 * Distinct from QuestionIntent (speech-act); do not mix roles with Intent.
 */
export type DecisionTarget =
  | "start"
  | "continue"
  | "stop"
  | "wait"
  | "choose"
  | "invest"
  | "buy"
  | "sell"
  | "move"
  | "partner"
  | "separate"
  | "changeJob"
  | "leaveJob"
  | "marry"
  | "reconcile"
  | "manageMoney"
  | "protectHealth"
  | "respondToConflict"
  | "confirmDirection"
  | "none";

export type QuestionUrgency = "immediate" | "nearTerm" | "longTerm" | "unknown";
export type QuestionTimingType =
  | "bestTiming"
  | "executionTiming"
  | "waitingTiming"
  | "unknown";
  export type QuestionAnalysisMode =
  | "decision"
  | "compatibility"
  | "selection"
  | "interpretation";

export type QuestionAnalysisScope =
  | "general"
  | "zodiac"
  | "birthDate"
  | "fullSaju";

/**
 * 현재 질문이 지칭하는 상대 referent 구조.
 * same: 동일 상대 지시 / different: 다른 상대 지시 / unspecified: 판단 불가
 * (continuity/switch 결정은 resolver 책임)
 */
export type QuestionCounterpartReferent =
  | "same"
  | "different"
  | "unspecified";

/**
 * 현재 질문이 지칭하는 대상(object) referent 구조.
 * deictic: 이거/그거 등 대상 지시어 / unspecified: 지시어 없음
 * (해석·clarification 결정은 상위 레이어 책임)
 */
export type QuestionObjectReferent =
  | "deictic"
  | "unspecified";

export type QuestionCounterpartFacts = {
  birthDate:
    string | null;

  birthTime:
    string | null;

  calendarType:
    "solar" | "lunar" | null;

  gender:
    "male" | "female" | null;

  zodiac:
    string | null;

  relationship:
    string | null;

  /**
   * 질문 문장에 나타난 상대 referent 구조.
   * Reader가 추출만 하고, continuity/switch는 resolver가 결정한다.
   * 기존 object literal 호환을 위해 optional이며,
   * extractQuestionCounterpartFacts는 항상 채운다.
   */
  counterpartReferent?:
    QuestionCounterpartReferent;

  evidence:
    string[];
};
export type QuestionReaderResult = {
  originalQuestion: string;
  normalizedQuestion: string;

  topic: QuestionTopic;
  objectLabel?: string;
  /**
   * closed vocabulary로 해석하지 못한 object surface remnant.
   * topic / objectLabel / objectReferent / specificity 판단에 쓰지 않는다.
   * 기존 호출 호환을 위해 optional이다.
   */
  objectSurfaceRemnant?: string;
  /**
   * 질문 문장에 나타난 대상(object) 지시어 구조.
   * Reader가 추출만 하고, clarification/해석은 상위 레이어가 결정한다.
   * 기존 object literal 호환을 위해 optional이며,
   * readQuestion은 항상 채운다.
   */
  objectReferent?: QuestionObjectReferent;
  intent: QuestionIntent;
  motive: QuestionMotive;
  decisionTarget: DecisionTarget;
  urgency: QuestionUrgency;
  timingType: QuestionTimingType;

  analysisMode:
    QuestionAnalysisMode;

  analysisScope:
    QuestionAnalysisScope;

  /**
   * 결론 문장의 성격.
   * intent 등 Reader 정보를 바탕으로 결정하며,
   * 아직 분류되지 않은 질문은 decision으로 유지한다.
   */
  conclusionNature:
    ConclusionNature;

  counterpartFacts:
    QuestionCounterpartFacts;

  asksWhat: string;
  asksWhy: string;
  decisionQuestion: string;

  evidence: string[];
  confidence: number;

  humanContextReceived: true;

  /**
   * Semantic Interpreter 선택 게이트용 Reader 진단 정보.
   * 선택 결과·confidence·evidence 값은 변경하지 않고 관찰만 한다.
   */
  readerMatchDiagnostics?: {
    usedFallback: {
      topic: boolean;
      intent: boolean;
      decisionTarget: boolean;
    };
    emptyEvidence: {
      topic: boolean;
      intent: boolean;
      decisionTarget: boolean;
    };
    hasRivalCandidates: {
      topic: boolean;
      intent: boolean;
      decisionTarget: boolean;
    };
    /**
     * P6-12: DecisionTarget 후보 사이 행동 관계 Evidence 관찰용.
     * primary 선택 결과와 독립이며 secondary/rival 판정이 아니다.
     */
    actionRelations?: QuestionActionRelation[];
  };
};

type KeywordRule<T extends string> = {
  result: T;
  keywords: readonly string[];
};

/**
 * J-1: 의미 축 후보 수집용 내부 타입.
 * J-2: collectMeaningCandidates → normalizeAxes → readQuestion 로 연결한다.
 */
type MeaningAxisKind =
  | "topic"
  | "intent"
  | "decisionTarget"
  | "frame";

type MeaningCandidateSource =
  | "topicRules"
  | "intentRules"
  | "decisionRules"
  | "frameMarker"
  | "compoundSignal"
  | "postHocHint"
  | "fallback";

type MeaningCandidate<T extends string> = {
  axis: MeaningAxisKind;
  value: T;
  evidence: string[];
  source: MeaningCandidateSource;
  /**
   * 기존 rule 배열 index.
   * first-match와 동일한 순서 정보를 보존한다.
   */
  priority: number;
  strength: number;
  specificity: number;
};

/**
 * J-4-4: 강한 topic × decisionTarget compound 후보.
 * 단순 decisionTarget keyword hit와 구분하며,
 * 두 축을 한 semantic pair로 정규화할 때만 사용한다.
 */
type TopicDecisionCompoundCandidate = {
  topic: QuestionTopic;
  decisionTarget: DecisionTarget;
  topicEvidence: string[];
  decisionEvidence: string[];
  /**
   * 선언 순서. 낮을수록 우선.
   * changeJob → leaveJob → buy → start
   */
  priority: number;
  strength: number;
};

/**
 * P6-12: 행동 후보 간 관계 종류.
 * Reader는 여기서 secondary/rival role을 판정하지 않는다.
 */
export type ActionRelationKind =
  | "sequential"
  | "concurrent"
  | "exclusive_alt";

/**
 * P6-15: participant별 raw provenance 사실.
 * secondary/rival·direct/compound/shadow 판정에 쓰지 않는다.
 */
export type QuestionActionParticipantProvenance = {
  value: DecisionTarget;
  sources: MeaningCandidateSource[];
  evidenceBySource: Partial<Record<MeaningCandidateSource, string[]>>;
  hasTopicDecisionCompound: boolean;
  genericSpecificPair?: {
    role: "generic" | "specific";
    other: DecisionTarget;
  };
};

/**
 * P6-12: 이미 수집된 DecisionTarget 후보 사이의 관계 Evidence.
 * participants에는 실제 후보에 존재하는 DT만 넣는다.
 */
export type QuestionActionRelation = {
  kind: ActionRelationKind;
  participants: DecisionTarget[];
  order: DecisionTarget[];
  connectorEvidence: string[];
  /**
   * P6-15: participants order를 유지한 raw provenance lookup.
   * 판정/필터에 사용하지 않는다.
   */
  participantProvenance?: QuestionActionParticipantProvenance[];
};

type MeaningCandidateSet = {
  topics: MeaningCandidate<QuestionTopic>[];
  intents: MeaningCandidate<ReaderIntentLiteral>[];
  decisionTargets: MeaningCandidate<DecisionTarget>[];
  frames: MeaningCandidate<string>[];
  topicDecisionCompounds: TopicDecisionCompoundCandidate[];
  /**
   * P6-12: DecisionTarget 후보 사이 행동 관계 Evidence.
   * primary 선택·secondary/rival 판정과 분리한다.
   */
  actionRelations: QuestionActionRelation[];
};

/**
 * J-2: Phase 1 compatible selection 결과.
 * topic / intent / decisionTarget 최종 선택은 여기서만 수행한다.
 * intent remains ReaderIntentLiteral until production boundary mapping.
 */
type NormalizedAxes = {
  topic: QuestionTopic;
  objectLabel?: string;
  /**
   * closed vocabulary miss object surface remnant.
   * normalizeAxes가 보존만 하며, objectLabel 선택에는 개입하지 않는다.
   */
  objectSurfaceRemnant?: string;
  intent: ReaderIntentLiteral;
  decisionTarget: DecisionTarget;
  evidence: {
    topic: string[];
    intent: string[];
    decisionTarget: string[];
  };
};

const topicRules: readonly KeywordRule<QuestionTopic>[] = [
  {
    result: "business",
    keywords: [
      "사업",
      "창업",
      "장사",
      "가게",
      "개업",
      "매장",
      "식당",
      "카페",
      "치킨",
      "통닭",
      "자영업",
      "동업",
      "프랜차이즈",
      "쇼핑몰",
    ],
  },
  {
    result: "realEstate",
    // 매수/매도는 decisionTarget(buy/sell/invest) 증거다.
    // topic은 부동산 명사로만 잡고, 명사+동사 결합은 J-4-4 compound가 담당한다.
    // (주식/ETF 등 금융자산 + 매수가 realEstate로 선점되지 않게 한다.)
    keywords: [
      "부동산",
      "아파트",
      "상가",
      "토지",
      "건물",
      "분양",
      "임대",
      "전세",
      "경매",
      "재개발",
    ],
  },
  {
    result: "money",
    keywords: [
      "돈",
      "재물",
      "재산",
      "수입",
      "매출",
      "투자",
      "대출",
      "빚",
      "채무",
      "자금",
      "현금",
      "수익",
      "재테크",
      "주식",
      "ETF",
      "펀드",
      "채권",
      "코인",
      "가상자산",
      "가상화폐",
      "암호화폐",
      "예금",
      "적금",
      "퇴직금",
      "연금",
      "배당",
      "외화",
      "달러",
      "원자재",
    ],
  },
  {
    result: "job",
    keywords: [
      "직장",
      "직업",
      "취업",
      "이직",
      "퇴사",
      "승진",
      "회사",
      "공무원",
      "시험",
      "진로",
      "연극",
      "배우로",
      "배우 활동",
      "연기자",
      "배역",
      "연기",
      "무대",
      "공연",
      "영화 출연",
      "드라마 출연",
      "유튜브",
      "영상 제작",
      "영상제작",
      "콘텐츠 제작",
      "콘텐츠제작",
      "채널 운영",
      "채널운영",
    ],
  },
  {
    result: "marriage",
    keywords: ["결혼", "혼인", "배우자", "남편", "아내", "이혼", "재혼"],
  },
  {
    result: "love",
    keywords: ["연애", "연인", "남자친구", "여자친구", "애인", "썸", "인연"],
  },
  {
    result: "family",
    keywords: [
      "부모",
      "아버지",
      "어머니",
      "자식",
      "자녀",
      "아들",
      "딸",
      "형제",
      "가족",
    ],
  },
  {
    result: "relationship",
    keywords: [
      "관계",
      "궁합",
      "친구",
      "사람",
      "파트너",
      "갈등",
      "화해",
      "배신",
    ],
  },
  {
    result: "health",
    keywords: [
      "건강",
      "질병",
      "병",
      "수술",
      "검사",
      "검진",
      "치료",
      "몸",
      "아프",
      "병원",
    ],
  },
  {
    result: "legal",
    keywords: [
      "소송",
      "법원",
      "고소",
      "고발",
      "분쟁",
      "관재",
      "사건",
      "재판",
      "합의",
    ],
  },
  {
    result: "lifeFlow",
    keywords: [
      "대운",
      "세운",
      "운세",
      "흐름",
      "시기",
      "언제",
      "올해",
      "내년",
      "앞으로",
    ],
  },
  {
    result: "lifeDirection",
    keywords: [
      "인생",
      "방향",
      "살아야",
      "선택",
      "결정",
      "어떻게 해야",
      "무엇을 해야",
    ],
  },
];

const intentRules: readonly KeywordRule<ReaderIntentLiteral>[] = [
  {
    result: "timing",
    keywords: [
      "언제",
      "몇 월",
      "몇월",
      "시기",
      "때가",
      "지금 시작",
      "올해",
      "내년",
    ],
  },
  {
    result: "comparison",
    keywords: [
      "둘 중",
      "둘중",
      "어느 쪽",
      "어느쪽",
      "비교",
      "무엇이 더",
      "누가 더",
    ],
  },
  {
    result: "selection",
    keywords: ["선택", "골라", "정해야", "어느 것을", "어떤 것이"],
  },
  {
    result: "termination",
    keywords: [
      "그만",
      "중단",
      "정리",
      "끝내",
      "포기",
      "헤어",
      "이혼",
      "퇴사",
      "매도",
    ],
  },
  {
    result: "continuation",
    keywords: ["계속", "유지", "버텨", "이어가", "지켜야"],
  },
  {
    result: "risk",
    keywords: [
      "위험",
      "문제",
      "실패",
      "손해",
      "망할",
      "주의할",
      "주의해야",
      "주의할 점",
      "주의사항",
      "주의점",
      "조심",
    ],
  },
  {
    result: "reason",
    keywords: ["왜", "이유", "원인", "어째서", "때문"],
  },
  {
    result: "method",
    keywords: [
      "어떻게",
      "방법",
      "전략",
      "해야 하나",
      "해야하나",
      "하면 좋을까",
    ],
  },
  {
    result: "possibility",
    keywords: [
      "해도 될까",
      "해도될까",
      "도 될까",
      "도될까",
      "가능",
      "맞을까",
      "괜찮을까",
      "할 수 있을까",
      "할수있을까",
    ],
  },
  {
    result: "prediction",
    keywords: [
      "될까",
      "될까요",
      "성공할까",
      "잘될까",
      "들어올까",
      "생길까",
      "만날까",
    ],
  },
  {
    result: "existence",
    keywords: [
      "운이 있나",
      "수가 있나",
    ],
  },
];

const motiveRules: readonly KeywordRule<QuestionMotive>[] = [
  {
    result: "survival",
    keywords: [
      "먹고살",
      "생활비",
      "생계",
      "버텨야",
      "당장 돈",
      "빚",
      "채무",
      "막막",
    ],
  },
  {
    result: "lossAvoidance",
    keywords: [
      "손해",
      "잃을",
      "망할",
      "실패",
      "위험",
      "사기",
      "배신",
      "후회",
    ],
  },
  {
    result: "recovery",
    keywords: [
      "다시",
      "재기",
      "회복",
      "되돌리",
      "살리고",
      "회생",
      "화해",
      "재혼",
    ],
  },
  {
    result: "expansion",
    keywords: [
      "확장",
      "늘리",
      "키우",
      "추가",
      "2호점",
      "지점",
      "규모",
      "성장",
    ],
  },
  {
    result: "opportunityCapture",
    keywords: [
      "기회",
      "제안",
      "들어왔",
      "좋은 자리",
      "매물이",
      "스카우트",
      "합격",
    ],
  },
  {
    result: "relationshipConfirmation",
    keywords: [
      "나를 좋아",
      "마음",
      "궁합",
      "맞나요",
      "맞을까",
      "인연",
      "배우자",
      "결혼",
    ],
  },
  {
    result: "lifeTransition",
    keywords: [
      "이직",
      "퇴사",
      "창업",
      "결혼",
      "이혼",
      "이사",
      "독립",
      "전환",
      "새로 시작",
    ],
  },
  {
    result: "anxietyReduction",
    keywords: [
      "불안",
      "걱정",
      "두렵",
      "무섭",
      "답답",
      "괜찮을까",
      "확신",
    ],
  },
  {
    result: "selfUnderstanding",
    keywords: [
      "나는 왜",
      "내 성격",
      "내 팔자",
      "내 인생",
      "왜 반복",
      "왜 항상",
      "나에게 맞는",
    ],
  },
];

const decisionRules: readonly KeywordRule<DecisionTarget>[] = [
  {
    result: "partner",
    keywords: [
      "동업",
      "파트너",
      "공동창업",
      "같이 사업",
      "지분",
      "같이 하",
      "같이 해",
      "함께 하",
      "함께 해",
      "같이 만들",
      "함께 만들",
      "협업",
      "공동 제작",
      "공동제작",
    ],
  },
  {
    result: "changeJob",
    keywords: [
      "이직",
      "전직",
      "직장을 옮",
      "직장 옮",
      "직장을 옮길",
      "직장 옮길",
      "회사를 옮",
      "회사 옮",
      "회사로 옮",
      "회사를 옮길",
      "회사 옮길",
      "회사로 옮길",
    ],
  },
  {
    result: "leaveJob",
    keywords: [
      "퇴사",
      "직장 그만",
      "직장을 그만",
      "직장 그만두",
      "직장을 그만두",
      "회사 그만",
      "회사를 그만",
      "회사 그만두",
      "회사를 그만두",
    ],
  },
  {
    result: "marry",
    keywords: ["결혼", "혼인", "재혼"],
  },
  {
    result: "separate",
    keywords: ["이혼", "헤어", "관계 정리", "결별"],
  },
  {
    result: "reconcile",
    keywords: ["재회", "화해", "다시 만나", "관계 회복"],
  },
  {
    result: "buy",
    keywords: [
      "부동산을 사",
      "아파트를 사",
      "건물을 사",
      "상가를 사",
      "토지를 사",
      "땅을 사",
      "주택을 사",
      "집을 사",
      "부동산을 살",
      "아파트를 살",
      "건물을 살",
      "상가를 살",
      "토지를 살",
      "땅을 살",
      "주택을 살",
      "집을 살",
      "부동산 매수",
      "아파트 매수",
      "건물 매수",
      "상가 매수",
      "토지 매수",
      "주택 매수",
      "땅 매수",
      "집 매수",
      "부동산 매입",
      "아파트 매입",
      "건물 매입",
      "상가 매입",
      "토지 매입",
      "주택 매입",
      "부동산 구입",
      "아파트 구입",
      "건물 구입",
      "상가 구입",
      "토지 구입",
      "주택 구입",
      "분양받",
    ],
  },
  {
    result: "sell",
    keywords: ["매도", "팔아야", "처분"],
  },
  {
    result: "invest",
    keywords: [
      "투자",
      "매수",
      "매입",
      "구입",
      "돈을 넣",
      "주식에 넣",
      "ETF에 넣",
      "펀드에 넣",
      "채권에 넣",
      "코인에 넣",
      "가상자산에 넣",
    ],
  },
  {
    result: "move",
    keywords: ["이사", "이전", "옮겨야", "자리 이동"],
  },
  {
    result: "stop",
    keywords: ["그만", "중단", "포기", "접어야", "끝내"],
  },
  {
    result: "continue",
    keywords: ["계속", "유지", "버텨", "이어가"],
  },
  {
    result: "wait",
    keywords: ["기다려", "기다릴", "미뤄", "보류", "아직 하지"],
  },
  {
    result: "start",
    keywords: [
      "시작",
      "창업",
      "개업",
      "새로",
    ],
  },
  {
    result: "manageMoney",
    keywords: ["빚", "대출", "재물", "돈 관리", "자금", "현금흐름"],
  },
  {
    result: "protectHealth",
    keywords: ["건강", "수술", "치료", "검사", "검진", "병원"],
  },
  {
    result: "respondToConflict",
    keywords: ["소송", "고소", "분쟁", "갈등", "법원", "합의"],
  },
  {
    result: "choose",
    keywords: [
      "선택",
      "둘 중",
      "둘중",
      "어느 쪽",
      "어느쪽",
      "어떤 역할",
      "무슨 역할",
      "어떤 배역",
      "무슨 배역",
      "어느 역할",
      "어느 배역",
      "역할이 좋",
      "배역이 좋",
      "역할이 맞",
      "배역이 맞",
    ],
  },
  {
    result: "confirmDirection",
    keywords: ["방향", "어떻게 살아", "무엇을 해야", "결정해야"],
  },
];

function normalizeKoreanText(
  value:
    string,
): string {
  return value
    .trim()
    .replace(
      /\s+/g,
      " ",
    )
    .toLowerCase();
}

function normalizeQuestion(
  question:
    string,
): string {
  return normalizeKoreanText(
    question,
  );
}

function buildKoreanKeywordForms(
  keyword:
    string,
): string[] {
  const normalizedKeyword =
    normalizeKoreanText(
      keyword,
    );

  const forms =
    new Set<string>([
      normalizedKeyword,
    ]);

  if (
    normalizedKeyword
      .endsWith(
        " 하",
      )
  ) {
    const prefix =
      normalizedKeyword
        .slice(
          0,
          -1,
        );

    forms.add(
      `${prefix}해`,
    );
  }

  if (
    normalizedKeyword
      .endsWith(
        "하다",
      )
  ) {
    const prefix =
      normalizedKeyword
        .slice(
          0,
          -2,
        );

    forms.add(
      `${prefix}하`,
    );

    forms.add(
      `${prefix}해`,
    );
  }

  return Array.from(
    forms,
  );
}

/**
 * decisionTarget 매칭 전용.
 * 조사(을/를)·공백 축약 차이만 최소 확장하여
 * intent/topic 등 다른 규칙 matcher에는 영향을 주지 않는다.
 */
function buildDecisionKeywordForms(
  keyword:
    string,
): string[] {
  const baseForms =
    buildKoreanKeywordForms(
      keyword,
    );

  const forms =
    new Set<string>(
      baseForms,
    );

  for (
    const normalizedKeyword
    of baseForms
  ) {
    if (
      /[을를]\s/.test(
        normalizedKeyword,
      )
    ) {
      const withoutParticle =
        normalizedKeyword
          .replace(
            /[을를]\s/g,
            " ",
          );

      forms.add(
        withoutParticle,
      );

      forms.add(
        withoutParticle
          .replace(
            /\s+/g,
            "",
          ),
      );

      forms.add(
        normalizedKeyword
          .replace(
            /\s+/g,
            "",
          ),
      );
    } else if (
      normalizedKeyword
        .includes(
          " ",
        )
    ) {
      const withObjectParticleEul =
        normalizedKeyword
          .replace(
            /(\S+)\s+(\S+)/,
            "$1을 $2",
          );

      const withObjectParticleReul =
        normalizedKeyword
          .replace(
            /(\S+)\s+(\S+)/,
            "$1를 $2",
          );

      forms.add(
        withObjectParticleEul,
      );

      forms.add(
        withObjectParticleReul,
      );

      forms.add(
        normalizedKeyword
          .replace(
            /\s+/g,
            "",
          ),
      );

      forms.add(
        withObjectParticleEul
          .replace(
            /\s+/g,
            "",
          ),
      );

      forms.add(
        withObjectParticleReul
          .replace(
            /\s+/g,
            "",
          ),
      );
    }
  }

  return Array.from(
    forms,
  );
}

function matchesKoreanKeyword(
  question:
    string,
  keyword:
    string,
): boolean {
  return buildKoreanKeywordForms(
    keyword,
  ).some(
    (keywordForm) =>
      question.includes(
        keywordForm,
      ),
  );
}

function matchesDecisionKeyword(
  question:
    string,
  keyword:
    string,
): boolean {
  return buildDecisionKeywordForms(
    keyword,
  ).some(
    (keywordForm) =>
      question.includes(
        keywordForm,
      ),
  );
}

/**
 * P11-7-2I-6 / B9: 부정 continue compound surface가 있으면 true.
 * stop evidence 자체는 business noun gate에서만 만든다.
 * 여기서는 긍정 stem(이어가/계속) shadowing 판별에만 쓴다.
 */
function hasNegatedContinueCompoundSurface(
  question: string,
): boolean {
  return BUSINESS_STOP_NEGATED_CONTINUE_COMPOUND_VERBS.some((verb) =>
    matchesDecisionKeyword(question, verb)
  );
}

/**
 * P11-7-2I-6 / B9: 긍정 continue stem이 부정 continue compound에
 * 가려지면 매칭하지 않는다. 전역 "않 → 반대" polarity가 아니다.
 */
function matchesDecisionKeywordWithNegatedContinueGuard(
  question: string,
  keyword: string,
): boolean {
  if (!matchesDecisionKeyword(question, keyword)) {
    return false;
  }

  if (
    CONTINUE_STEMS_SHADOWED_BY_NEGATED_CONTINUE.has(keyword)
    && hasNegatedContinueCompoundSurface(question)
  ) {
    return false;
  }

  // love/relationship × 인연 이어* partner compound가 있으면
  // bare "이어가" continue stem을 Phase1 continue로 올리지 않는다.
  // decisionRules partner에 "인연"을 전역 추가하지 않는다.
  if (
    keyword === "이어가"
    && hasLoveRelationshipPartnerCompoundSurface(question)
  ) {
    return false;
  }

  return true;
}

/**
 * P11-7-2I-6 / B9: intent/frame용 동일 shadowing guard.
 */
function matchesKoreanKeywordWithNegatedContinueGuard(
  question: string,
  keyword: string,
): boolean {
  if (!matchesKoreanKeyword(question, keyword)) {
    return false;
  }

  if (
    CONTINUE_STEMS_SHADOWED_BY_NEGATED_CONTINUE.has(keyword)
    && hasNegatedContinueCompoundSurface(question)
  ) {
    return false;
  }

  if (
    keyword === "이어가"
    && hasLoveRelationshipPartnerCompoundSurface(question)
  ) {
    return false;
  }

  return true;
}

const FUTURE_OUTCOME_PREDICTION_PATTERNS:
  readonly RegExp[] = [
    /어떻게\s*될\s*까/,
    /어떨(?:까|까요|지|지요)/,
    /들어올까/,
    /생길까/,
    /만날까/,
    /성공할까/,
    /잘될까/,
  ];

const PREDICTION_INTENT_EXCLUSION_PATTERNS:
  readonly RegExp[] = [
    /언제/,
    /(?:몇\s*월|몇월|시기|때가)/,
    /(?:운|수)(?:이|가)?\s*있나/,
    /(?:해야|해야\s*하|해야\s*되|해야\s*할)/,
    /(?:해도\s*될|해도될|시작해도)/,
    /계속/,
  ];

function isFutureOutcomePredictionQuestion(
  question:
    string,
): boolean {
  if (
    PREDICTION_INTENT_EXCLUSION_PATTERNS.some(
      (pattern) =>
        pattern.test(
          question,
        ),
    )
  ) {
    return false;
  }

  return FUTURE_OUTCOME_PREDICTION_PATTERNS.some(
    (pattern) =>
      pattern.test(
        question,
      ),
  );
}

/**
 * 허가/가능 여부 질문의 공통 표현.
 * possibility intentRules 키워드와 같은 계열을 재사용하되,
 * 허가·실현가능성 frame만 선게이트한다.
 */
const PERMISSION_OR_FEASIBILITY_KEYWORDS:
  readonly string[] = [
    "해도 될까",
    "해도될까",
    "도 될까",
    "도될까",
    "도 될지",
    "도될지",
    "해도 괜찮",
    "해도괜찮",
    "가능할까",
    "가능한가",
    "가능한지",
    "할 수 있을까",
    "할수있을까",
  ];

function isPermissionOrFeasibilityQuestion(
  question:
    string,
): boolean {
  return PERMISSION_OR_FEASIBILITY_KEYWORDS.some(
    (keyword) =>
      matchesKoreanKeyword(
        question,
        keyword,
      ),
  );
}

/**
 * 기존 intent 해석 경로.
 * J-2부터 최종 선택은 normalizeAxes가 담당한다.
 * Phase 1 동등성 검증·호환용으로 유지한다.
 */
function resolveQuestionIntent(
  question:
    string,
): {
  result:
    ReaderIntentLiteral;

  evidence:
    string[];
} {
  if (
    isFutureOutcomePredictionQuestion(
      question,
    )
  ) {
    return {
      result:
        "prediction",

      evidence:
        [
          "futureOutcomePrediction",
        ],
    };
  }

  if (
    isPermissionOrFeasibilityQuestion(
      question,
    )
  ) {
    return {
      result:
        "possibility",

      evidence:
        [
          "permissionOrFeasibility",
        ],
    };
  }

  return findRule(
    question,
    intentRules,
    "generalJudgement",
  );
}

function findRule<T extends string>(
  question:
    string,
  rules:
    readonly KeywordRule<T>[],
  fallback:
    T,
): {
  result:
    T;

  evidence:
    string[];
} {
  for (
    const rule
    of rules
  ) {
    const matchedKeywords =
      rule.keywords.filter(
        (keyword) =>
          matchesKoreanKeyword(
            question,
            keyword,
          ),
      );

    if (
      matchedKeywords.length
      === 0
    ) {
      continue;
    }

    return {
      result:
        rule.result,

      evidence:
        matchedKeywords,
    };
  }

  return {
    result:
      fallback,

    evidence:
      [],
  };
}

/**
 * 매칭된 모든 rule을 candidate로 수집한다.
 * findRule의 first-match와 달리 중단하지 않으며,
 * priority는 기존 rule 배열 index를 그대로 사용한다.
 */
function collectRuleCandidates<T extends string>(
  question: string,
  rules: readonly KeywordRule<T>[],
  axis: MeaningAxisKind,
  source: MeaningCandidateSource,
  matchKeyword: (
    question: string,
    keyword: string,
  ) => boolean = matchesKoreanKeyword,
): MeaningCandidate<T>[] {
  const candidates: MeaningCandidate<T>[] = [];

  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    const matchedKeywords = rule.keywords.filter((keyword) =>
      matchKeyword(question, keyword),
    );

    if (matchedKeywords.length === 0) {
      continue;
    }

    candidates.push({
      axis,
      value: rule.result,
      evidence: matchedKeywords,
      source,
      priority: index,
      strength: matchedKeywords.length,
      specificity: Math.max(
        ...matchedKeywords.map((keyword) => keyword.length),
      ),
    });
  }

  return candidates;
}

/**
 * 비교·선택형 질문에서 generic action keyword가
 * decisionTarget을 가로채지 않도록 하는 공통 frame.
 * intent 판별과 분리된 decisionTarget 전용 신호다.
 */
const COMPARISON_OR_OPTION_FIT_DECISION_MARKERS:
  readonly string[] = [
    "어느 쪽",
    "어느쪽",
    "무엇이 더",
    "누가 더",
    "비교",
    "둘 중",
    "둘중",
    "중 어디",
    "중에 어디",
    "중 무엇",
    "중 어떤",
    "어느 것을",
    "어떤 것이",
    "적합",
    "추천",
  ];

const GENERIC_ACTION_DECISION_TARGETS:
  ReadonlySet<
    DecisionTarget
  > = new Set(
    [
      "start",
      "continue",
      "stop",
      "wait",
      "invest",
      "move",
    ],
  );

/**
 * J-4-2: comparison frame 마커.
 * intentRules comparison keywords와 동일 집합을 재사용한다.
 */
function getComparisonIntentKeywords(): readonly string[] {
  return intentRules.find((rule) => rule.result === "comparison")?.keywords
    ?? [];
}

/**
 * J-4-2: selection frame 마커.
 * intentRules selection keywords + option-fit(적합/추천) 계열.
 */
function getSelectionIntentKeywords(): readonly string[] {
  const selectionKeywords =
    intentRules.find((rule) => rule.result === "selection")?.keywords
    ?? [];

  return [
    ...selectionKeywords,
    "적합",
    "추천",
    "중 어디",
    "중에 어디",
    "중 무엇",
    "중 어떤",
  ];
}

/**
 * J-4-3-2: termination frame 마커.
 * intentRules termination keywords를 재사용한다.
 */
function getTerminationIntentKeywords(): readonly string[] {
  return intentRules.find((rule) => rule.result === "termination")?.keywords
    ?? [];
}

/**
 * J-4-3-2: continuation frame 마커.
 * intentRules continuation keywords를 재사용한다.
 */
function getContinuationIntentKeywords(): readonly string[] {
  return intentRules.find((rule) => rule.result === "continuation")?.keywords
    ?? [];
}

/**
 * J-4-3-2: termination 계열 specific action.
 * generic stop보다 우선하되, J-4-1 leaveJob 정책과 충돌하지 않게 둔다.
 */
const TERMINATION_SPECIFIC_DECISION_TARGETS:
  readonly DecisionTarget[] = [
    "leaveJob",
    "sell",
    "separate",
  ];

function findDecisionRule(
  question:
    string,
  rules:
    readonly KeywordRule<
      DecisionTarget
    >[],
  fallback:
    DecisionTarget,
): {
  result:
    DecisionTarget;

  evidence:
    string[];
} {
  for (
    const rule
    of rules
  ) {
    const matchedKeywords =
      rule.keywords.filter(
        (keyword) =>
          matchesDecisionKeyword(
            question,
            keyword,
          ),
      );

    if (
      matchedKeywords.length
      === 0
    ) {
      continue;
    }

    return {
      result:
        rule.result,

      evidence:
        matchedKeywords,
    };
  }

  return {
    result:
      fallback,

    evidence:
      [],
  };
}

function isComparisonOrOptionFitDecisionFrame(
  question:
    string,
): boolean {
  return COMPARISON_OR_OPTION_FIT_DECISION_MARKERS.some(
    (marker) =>
      matchesDecisionKeyword(
        question,
        marker,
      ),
  );
}

/**
 * J-1: 의미 축 후보를 수집한다.
 * J-2: 최종 선택은 normalizeAxes에서 수행한다.
 */
function collectMeaningCandidates(
  normalizedQuestion: string,
): MeaningCandidateSet {
  const topics = collectRuleCandidates(
    normalizedQuestion,
    topicRules,
    "topic",
    "topicRules",
  );

  const intents = collectRuleCandidates(
    normalizedQuestion,
    intentRules,
    "intent",
    "intentRules",
    // P11-7-2I-6 / B9: "이어가지 않"/"계속하지 않"이 있으면
    // 긍정 stem "이어가"/"계속"을 continuation evidence로 쓰지 않는다.
    matchesKoreanKeywordWithNegatedContinueGuard,
  );

  const decisionTargets = collectRuleCandidates(
    normalizedQuestion,
    decisionRules,
    "decisionTarget",
    "decisionRules",
    // P11-7-2I-6 / B9: 동일 shadowing — 부정 continue를 continue DT로 올리지 않는다.
    matchesDecisionKeywordWithNegatedContinueGuard,
  );

  appendCompoundDecisionTargetCandidates(
    normalizedQuestion,
    decisionTargets,
  );

  // P11-6-2 / A1 / P11-7-2I-1 B1: business noun × keep-going|keep-alive
  // paraphrase → continuation intent.
  // bare "끊지 않고"/"굴려가"/"살려두"/"붙잡아두"/"접지 않고"/"스톨시키지 않"은
  // 전역 continuation keyword가 아니다.
  appendBusinessContinueKeepGoingIntentCandidates(
    normalizedQuestion,
    intents,
    decisionTargets,
  );

  // P11-6-3 / A2 / P11-7-2I-5 B2 / P11-7-2I-6 B9: business noun ×
  // 접고/손을 떼다/끝내*|종료*|마무리*|닫아버리*|이어가지 않*|계속하지 않*
  // paraphrase → termination intent.
  // bare "접다"/"손을 떼다"/"끝내다"/"종료"/"마무리"/"닫아버리다"/
  // "이어가"/"계속"/"더 이상"/"않"은 전역 termination keyword가 아니다.
  appendBusinessStopWithdrawIntentCandidates(
    normalizedQuestion,
    intents,
    decisionTargets,
  );

  const topicDecisionCompounds = collectTopicDecisionCompoundCandidates(
    normalizedQuestion,
  );

  const frames: MeaningCandidate<string>[] = [];

  if (isFutureOutcomePredictionQuestion(normalizedQuestion)) {
    frames.push({
      axis: "frame",
      value: "futureOutcomePrediction",
      evidence: ["futureOutcomePrediction"],
      source: "frameMarker",
      priority: 0,
      strength: 1,
      specificity: "futureOutcomePrediction".length,
    });
  }

  if (isPermissionOrFeasibilityQuestion(normalizedQuestion)) {
    const matchedKeywords = PERMISSION_OR_FEASIBILITY_KEYWORDS.filter(
      (keyword) => matchesKoreanKeyword(normalizedQuestion, keyword),
    );

    frames.push({
      axis: "frame",
      value: "permissionOrFeasibility",
      evidence: matchedKeywords,
      source: "frameMarker",
      priority: 1,
      strength: matchedKeywords.length,
      specificity: matchedKeywords.length === 0
        ? 0
        : Math.max(...matchedKeywords.map((keyword) => keyword.length)),
    });
  }

  if (isComparisonOrOptionFitDecisionFrame(normalizedQuestion)) {
    const matchedMarkers = COMPARISON_OR_OPTION_FIT_DECISION_MARKERS.filter(
      (marker) => matchesDecisionKeyword(normalizedQuestion, marker),
    );

    frames.push({
      axis: "frame",
      value: "comparisonOrOptionFit",
      evidence: matchedMarkers,
      source: "frameMarker",
      priority: 2,
      strength: matchedMarkers.length,
      specificity: matchedMarkers.length === 0
        ? 0
        : Math.max(...matchedMarkers.map((marker) => marker.length)),
    });
  }

  // J-4-3-2: termination / continuation frame candidate.
  // intentRules 키워드만 재사용하며, intent override에는 쓰지 않는다.
  const terminationMarkers = getTerminationIntentKeywords().filter(
    (marker) => matchesKoreanKeyword(normalizedQuestion, marker),
  );

  if (terminationMarkers.length > 0) {
    frames.push({
      axis: "frame",
      value: "termination",
      evidence: terminationMarkers,
      source: "frameMarker",
      priority: 3,
      strength: terminationMarkers.length,
      specificity: Math.max(
        ...terminationMarkers.map((marker) => marker.length),
      ),
    });
  }

  const continuationMarkers = getContinuationIntentKeywords().filter(
    (marker) =>
      matchesKoreanKeywordWithNegatedContinueGuard(normalizedQuestion, marker),
  );

  if (continuationMarkers.length > 0) {
    frames.push({
      axis: "frame",
      value: "continuation",
      evidence: continuationMarkers,
      source: "frameMarker",
      priority: 4,
      strength: continuationMarkers.length,
      specificity: Math.max(
        ...continuationMarkers.map((marker) => marker.length),
      ),
    });
  }

  return {
    topics,
    intents,
    decisionTargets,
    frames,
    topicDecisionCompounds,
    // P6-12: relation은 collectMeaningCandidates 이후 별도 수집한다.
    actionRelations: [],
  };
}

/**
 * decision keyword form 중 질문에서 가장 먼저 등장하는 위치를 반환한다.
 * 매칭되지 않으면 -1.
 */
function findDecisionKeywordEarliestIndex(
  question: string,
  keyword: string,
): number {
  let earliest = -1;

  for (const form of buildDecisionKeywordForms(keyword)) {
    const index = question.indexOf(form);
    if (index < 0) {
      continue;
    }
    if (earliest < 0 || index < earliest) {
      earliest = index;
    }
  }

  return earliest;
}

/**
 * 후보 evidence 문자열 중 질문에서 가장 먼저 등장하는 위치.
 * evidence가 질문 surface가 아니면 -1.
 */
function findDecisionTargetEvidenceEarliestIndex(
  question: string,
  candidates: readonly MeaningCandidate<DecisionTarget>[],
  value: DecisionTarget,
): number {
  let earliest = -1;

  for (const candidate of candidates) {
    if (candidate.value !== value) {
      continue;
    }

    for (const evidence of candidate.evidence) {
      const decisionIndex = findDecisionKeywordEarliestIndex(
        question,
        evidence,
      );
      const koreanIndex = findKoreanKeywordEarliestIndex(
        question,
        evidence,
      );
      const index = decisionIndex >= 0 && koreanIndex >= 0
        ? Math.min(decisionIndex, koreanIndex)
        : decisionIndex >= 0
        ? decisionIndex
        : koreanIndex;

      if (index < 0) {
        continue;
      }
      if (earliest < 0 || index < earliest) {
        earliest = index;
      }
    }
  }

  return earliest;
}

/**
 * 이미 수집된 DecisionTarget 후보만으로 등장 순서를 복원한다.
 * 없는 DT는 만들지 않는다.
 */
function orderExistingDecisionTargetCandidates(
  question: string,
  candidates: readonly MeaningCandidate<DecisionTarget>[],
): DecisionTarget[] {
  const uniqueValues: DecisionTarget[] = [];

  for (const candidate of candidates) {
    if (!uniqueValues.includes(candidate.value)) {
      uniqueValues.push(candidate.value);
    }
  }

  return uniqueValues
    .map((value) => ({
      value,
      index: findDecisionTargetEvidenceEarliestIndex(
        question,
        candidates,
        value,
      ),
    }))
    .filter((entry) => entry.index >= 0)
    .sort((left, right) => {
      if (left.index !== right.index) {
        return left.index - right.index;
      }
      return uniqueValues.indexOf(left.value)
        - uniqueValues.indexOf(right.value);
    })
    .map((entry) => entry.value);
}

/**
 * P6-12 sequential connector surfaces.
 * decisionRules/DT vocab에 추가하지 않으며 relation Evidence 보존용이다.
 * 연결형 changeJob/leaveJob compound surface는 후보가 2개 이상일 때만 사용한다.
 */
const ACTION_RELATION_SEQUENTIAL_CONNECTORS: readonly string[] = [
  "그만두고",
  "시작하고",
  "바꾸고 나서",
  "떠나고 나서",
  "하고 나서",
  "바꾼 뒤",
  "떠난 뒤",
  "바꾸고",
  "떠나고",
  "관두고",
  "하고서",
];

/**
 * P6-12 concurrent connector surfaces.
 * job noun × 연결형 changeJob/leaveJob compound가 후보를 만들면
 * "바꾸면서"/"떠나면서"/"관두면서" 등으로 concurrent relation을 보존한다.
 */
const ACTION_RELATION_CONCURRENT_CONNECTORS: readonly string[] = [
  "하면서",
  "바꾸면서",
  "떠나면서",
  "관두면서",
  "면서",
];

function collectMatchedActionRelationConnectors(
  question: string,
  connectors: readonly string[],
): string[] {
  const matched: string[] = [];

  for (const connector of connectors) {
    if (!question.includes(connector)) {
      continue;
    }
    if (!matched.includes(connector)) {
      matched.push(connector);
    }
  }

  return matched;
}

/**
 * exclusive_alt surface.
 * 기존 binary helper + A지…B지 배타 선택 형태.
 * DT 후보는 생성하지 않고, 이미 있는 후보가 2개 이상일 때만 사용한다.
 */
function collectExclusiveAltConnectorEvidence(
  question: string,
): string[] {
  const evidence: string[] = [];

  if (hasBinaryLifePathAlternativeStructure(question)) {
    evidence.push("lifePathBinaryAlternative");
  }

  // P10-E: 두 번째 arm은 기존 "~지"뿐 아니라 "~까요" 질문형도 허용.
  // 첫 번째 arm은 숙고형 "~지"를 유지해 단독 "~까요" 승격을 막는다.
  const exclusiveAltMatch = question.match(
    /([\uac00-\ud7a3]{1,12}지)\s+([\s\S]{0,24}?[\uac00-\ud7a3]{1,12}(?:지|까요))/,
  );

  if (exclusiveAltMatch) {
    evidence.push(exclusiveAltMatch[1], exclusiveAltMatch[2]);
  }

  if (question.includes("고민")) {
    evidence.push("고민");
  }

  return evidence;
}

/**
 * P6-15: 확정된 participants에 대해 MeaningCandidate / compound /
 * GENERIC_TO_SPECIFIC 조회 가능한 raw fact만 집계한다.
 * participants 자체는 추가·제거하지 않는다.
 */
function collectParticipantProvenance(
  participants: readonly DecisionTarget[],
  candidates: MeaningCandidateSet,
): QuestionActionParticipantProvenance[] {
  return participants.map((value) => {
    const rows = candidates.decisionTargets.filter(
      (candidate) => candidate.value === value,
    );

    const sources: MeaningCandidateSource[] = [];
    const evidenceBySource: Partial<
      Record<MeaningCandidateSource, string[]>
    > = {};

    for (const row of rows) {
      if (!sources.includes(row.source)) {
        sources.push(row.source);
      }

      const evidence = evidenceBySource[row.source] ?? [];
      for (const item of row.evidence) {
        if (!evidence.includes(item)) {
          evidence.push(item);
        }
      }
      evidenceBySource[row.source] = evidence;
    }

    const hasTopicDecisionCompound = candidates.topicDecisionCompounds.some(
      (compound) => compound.decisionTarget === value,
    );

    let genericSpecificPair:
      QuestionActionParticipantProvenance["genericSpecificPair"];

    for (const conflict of GENERIC_TO_SPECIFIC_DECISION_CONFLICTS) {
      if (
        value === conflict.generic
        && participants.includes(conflict.specific)
      ) {
        genericSpecificPair = {
          role: "generic",
          other: conflict.specific,
        };
        break;
      }

      if (
        value === conflict.specific
        && participants.includes(conflict.generic)
      ) {
        genericSpecificPair = {
          role: "specific",
          other: conflict.generic,
        };
        break;
      }
    }

    const provenance: QuestionActionParticipantProvenance = {
      value,
      sources,
      evidenceBySource,
      hasTopicDecisionCompound,
    };

    if (genericSpecificPair) {
      provenance.genericSpecificPair = genericSpecificPair;
    }

    return provenance;
  });
}

/**
 * P6-12: collectMeaningCandidates 이후, normalizeAxes와 분리된
 * QuestionActionRelation Evidence 수집.
 * decisionTargets 배열/값을 변경하지 않는다.
 */
function collectQuestionActionRelations(
  question: string,
  candidates: MeaningCandidateSet,
): QuestionActionRelation[] {
  const orderedParticipants = orderExistingDecisionTargetCandidates(
    question,
    candidates.decisionTargets,
  );

  if (orderedParticipants.length < 2) {
    return [];
  }

  const exclusiveEvidence = collectExclusiveAltConnectorEvidence(question);
  const hasExclusiveSurface = exclusiveEvidence.some(
    (item) => item !== "고민",
  );

  let relation: QuestionActionRelation | null = null;

  if (hasExclusiveSurface) {
    relation = {
      kind: "exclusive_alt",
      participants: [...orderedParticipants],
      order: [...orderedParticipants],
      connectorEvidence: exclusiveEvidence,
    };
  } else {
    const sequentialConnectors = collectMatchedActionRelationConnectors(
      question,
      ACTION_RELATION_SEQUENTIAL_CONNECTORS,
    );

    if (sequentialConnectors.length > 0) {
      relation = {
        kind: "sequential",
        participants: [...orderedParticipants],
        order: [...orderedParticipants],
        connectorEvidence: sequentialConnectors,
      };
    } else {
      const concurrentConnectors = collectMatchedActionRelationConnectors(
        question,
        ACTION_RELATION_CONCURRENT_CONNECTORS,
      );

      if (concurrentConnectors.length > 0) {
        relation = {
          kind: "concurrent",
          participants: [...orderedParticipants],
          order: [...orderedParticipants],
          connectorEvidence: concurrentConnectors,
        };
      }
    }
  }

  if (!relation) {
    return [];
  }

  // P6-15: kind/participants/order 확정 후 raw provenance만 부착한다.
  relation.participantProvenance = collectParticipantProvenance(
    relation.participants,
    candidates,
  );

  return [relation];
}

/**
 * 기존 findRule / first-match와 동등하게
 * 가장 낮은 priority(rule 배열 index) 후보를 고른다.
 */
function selectLowestPriorityCandidate<T extends string>(
  candidates: readonly MeaningCandidate<T>[],
): MeaningCandidate<T> | null {
  if (candidates.length === 0) {
    return null;
  }

  let selected = candidates[0];

  for (let index = 1; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (candidate.priority < selected.priority) {
      selected = candidate;
    }
  }

  return selected;
}

function hasFrame(
  frames: readonly MeaningCandidate<string>[],
  value: string,
): MeaningCandidate<string> | null {
  return frames.find((frame) => frame.value === value) ?? null;
}

/**
 * J-4-1 / J-4-4: 기존 compound signal helper 기반 decisionTarget 후보.
 * rule first-match보다 낮은 priority를 주어 Phase 1 기본 선택은 유지하고,
 * generic/specific 충돌 해소·topic×decision pair 정규화 단계에서 사용한다.
 */
function appendCompoundDecisionTargetCandidates(
  question: string,
  decisionTargets: MeaningCandidate<DecisionTarget>[],
): void {
  const basePriority = decisionRules.length;

  const pushCompound = (
    value: DecisionTarget,
    evidence: string[],
    offset: number,
  ): void => {
    if (evidence.length === 0) {
      return;
    }

    decisionTargets.push({
      axis: "decisionTarget",
      value,
      evidence,
      source: "compoundSignal",
      priority: basePriority + offset,
      strength: evidence.length,
      specificity: Math.max(...evidence.map((item) => item.length)),
    });
  };

  pushCompound("changeJob", collectChangeJobSignalEvidence(question), 0);
  pushCompound("leaveJob", collectLeaveJobSignalEvidence(question), 1);
  pushCompound("buy", collectRealEstateBuySignalEvidence(question), 2);
  // P10 G2-2 / P11-6-6 A3-1: business/entity noun + 인수|매입|구입 → buy compound.
  // bare "인수"/"매입"/"구입"을 전역 buy keyword로 넣지 않는다.
  pushCompound("buy", collectBusinessAcquireBuySignalEvidence(question), 2);
  // P11-6-6 A3-2: business entity/object + colloquial 사* → buy compound.
  // bare "사다"를 전역 buy keyword로 넣지 않는다. 회사는 제외한다.
  pushCompound("buy", collectBusinessColloquialBuySignalEvidence(question), 2);
  // P11-7-2I-2 / B3: operating-right/entity × transfer-in → buy compound.
  // bare 이전/양수/승계/가져오/테이크오버를 전역 buy keyword로 넣지 않는다.
  pushCompound("buy", collectBusinessAcquisitionBuySignalEvidence(question), 2);
  pushCompound("sell", collectRealEstateSellSignalEvidence(question), 3);
  pushCompound("start", collectBusinessStartSignalEvidence(question), 4);
  pushCompound("move", collectRealEstateMoveSignalEvidence(question), 5);
  pushCompound(
    "manageMoney",
    collectMoneyManageSignalEvidence(question),
    6,
  );
  // P10 G1: financial asset noun + colloquial buy → invest compound.
  // 사다 계열을 전역 invest keyword로 넣지 않는다.
  // cash-holding exclusive rival 검사보다 먼저 등록해야
  // "주식을 살지 현금을 가지고 있을지"가 choose로 수렴한다.
  pushCompound(
    "invest",
    collectMoneyInvestSignalEvidence(question),
    7,
  );
  // P10-C F: exclusive alternative의 cash-holding arm만 wait로 흡수한다.
  // 단순 보유 질문·buy exclusion(현금 매수)은 건드리지 않는다.
  appendCashHoldingExclusiveAlternativeCandidate(
    question,
    decisionTargets,
    basePriority,
    8,
  );
  // P10 G4 / P11-6-2 A1 / P11-7-2I-1 B1: business noun +
  // 운영|끊지 않고|굴려가|keep-alive paraphrase → continue compound.
  // bare "운영"/"끊다"/"굴리다"/"살리다"/"붙잡다"/"가져가다"/"스톨"을
  // 전역 continue keyword로 넣지 않는다.
  //
  // P11-6-2: keep-going-only evidence는 Phase-1이 none/continue일 때만 DT로 승격한다.
  // invest/start 등 경쟁 scalar가 이미 있으면 continue DT를 추가하지 않아
  // "끊지 … 까요" 가짜 exclusive_alt → choose 오염을 막는다.
  // operate(운영*) paraphrase는 기존 P10 G4 경로를 유지한다.
  {
    const businessContinueEvidence = collectBusinessContinueSignalEvidence(
      question,
    );
    const operateVerbEvidence = collectMatchedDecisionKeywords(
      question,
      BUSINESS_CONTINUE_OPERATE_COMPOUND_VERBS,
    );
    const keepGoingVerbEvidence = collectBusinessContinueKeepGoingVerbEvidence(
      question,
    );
    const keepGoingOnly =
      keepGoingVerbEvidence.length > 0
      && operateVerbEvidence.length === 0;
    const phase1Decision = selectLowestPriorityCandidate(decisionTargets);
    const phase1Value = phase1Decision?.value ?? "none";
    // P11-7-2I-14 / A1-06: start-before + keep-alive-after preference일 때만
    // keep-going-only continue DT를 Phase1 start 위에서도 후단 arbitration에 올린다.
    // 전역 keep-going-only guard는 완화하지 않는다.
    const allowKeepGoingContinueDt =
      !keepGoingOnly
      || phase1Value === "none"
      || phase1Value === "continue"
      || (
        phase1Value === "start"
        && hasBusinessStartContinuePreferenceContrast(question)
      );

    if (allowKeepGoingContinueDt) {
      pushCompound(
        "continue",
        businessContinueEvidence,
        9,
      );
    }
  }
  // P10 G5 / P11-6-3 A2 / P11-7-2I-5 B2 / P11-7-2I-6 B9: business noun +
  // 접다|폐업|손을 떼다|끝내*|종료*|마무리*|닫아버리*|이어가지 않*|계속하지 않*
  // paraphrase → stop compound.
  // bare end/close·접다·폐업·손을 떼다·이어가·계속·더 이상·않을
  // 전역 stop keyword로 넣지 않는다.
  // 기존 decisionRules의 "접어야"/"끝내"는 유지하고, 여기서는 noun-gated로만 확장한다.
  pushCompound(
    "stop",
    collectBusinessStopSignalEvidence(question),
    10,
  );
  // P10 G6: property noun + 보유/가지고 있 paraphrase → continue compound.
  // bare "보유"/"가지고 있"을 전역 continue keyword로 넣지 않는다.
  pushCompound(
    "continue",
    collectRealEstateContinueSignalEvidence(question),
    11,
  );
  // love/relationship object × 인연 이어* → partner compound.
  // bare "인연"/"이어가"를 전역 partner keyword로 넣지 않는다.
  // 기존 business/co-op partner decisionRules는 수정하지 않는다.
  pushCompound(
    "partner",
    collectLoveRelationshipPartnerSignalEvidence(question),
    12,
  );
}

/**
 * P10-C F: exclusive alternative 문맥의 cash-holding arm evidence.
 * "현금" + 보유/유지 paraphrase만 모은다.
 * 새 DecisionTarget을 만들지 않고 기존 wait 후보 evidence로만 쓴다.
 */
function collectCashHoldingAlternativeEvidence(
  question: string,
): string[] {
  const nounEvidence = collectMatchedDecisionKeywords(
    question,
    MONEY_CASH_HOLDING_NOUNS,
  );

  if (nounEvidence.length === 0) {
    return [];
  }

  const verbEvidence = collectMatchedDecisionKeywords(
    question,
    MONEY_CASH_HOLDING_VERBS,
  );

  if (verbEvidence.length === 0) {
    return [];
  }

  return [...nounEvidence, ...verbEvidence];
}

/**
 * P10-C F: 숙고형 A지…B지 exclusive surface만 감지한다.
 * 단순 보유 질문("현금을 가지고 있나요?")은 매칭하지 않는다.
 */
function hasCashHoldingExclusiveAlternativeSurface(
  question: string,
): boolean {
  return /([\uac00-\ud7a3]{1,12}지)\s+([\s\S]{0,24}?[\uac00-\ud7a3]{1,12}지)/
    .test(question);
}

/**
 * P10-C F: A지…B지 exclusive surface에서만
 * "현금을 가지고 있을지/보유할지/…" arm을 wait 후보로 추가한다.
 *
 * 보호:
 * - "현금을 가지고 있나요?" 같은 단순 보유 질문 → exclusive arm 없음
 * - "현금을 매수해도" buy exclusion → hold verb 없음
 * - rival action DT가 이미 있을 때만 추가 (단독 cash-hold → choose 방지)
 */
function appendCashHoldingExclusiveAlternativeCandidate(
  question: string,
  decisionTargets: MeaningCandidate<DecisionTarget>[],
  basePriority: number,
  offset: number,
): void {
  if (!hasCashHoldingExclusiveAlternativeSurface(question)) {
    return;
  }

  const evidence = collectCashHoldingAlternativeEvidence(question);

  if (evidence.length === 0) {
    return;
  }

  const hasRivalAction = decisionTargets.some(
    (candidate) =>
      candidate.value !== "wait"
      && candidate.value !== "continue"
      && candidate.value !== "none"
      && candidate.value !== "choose",
  );

  if (!hasRivalAction) {
    return;
  }

  decisionTargets.push({
    axis: "decisionTarget",
    value: "wait",
    evidence,
    source: "compoundSignal",
    priority: basePriority + offset,
    strength: evidence.length,
    specificity: Math.max(...evidence.map((item) => item.length)),
  });
}

/**
 * P10-C F: cash-holding exclusive alternative가 wait 후보로 수집되었는지.
 * 기존 generalBinary/P8-6이 없는 경로에서도 choose 흡수에만 사용한다.
 */
function hasCashHoldingExclusiveAlternativeParticipants(
  question: string,
  candidates: MeaningCandidateSet,
): boolean {
  if (!hasCashHoldingExclusiveAlternativeSurface(question)) {
    return false;
  }

  if (collectCashHoldingAlternativeEvidence(question).length === 0) {
    return false;
  }

  const hasCashHoldingWait = candidates.decisionTargets.some(
    (candidate) =>
      candidate.value === "wait"
      && candidate.source === "compoundSignal"
      && candidate.evidence.some(
        (item) =>
          (MONEY_CASH_HOLDING_NOUNS as readonly string[]).includes(item)
          || (MONEY_CASH_HOLDING_VERBS as readonly string[]).some(
            (verb) => item === verb || item.includes(verb),
          ),
      ),
  );

  if (!hasCashHoldingWait) {
    return false;
  }

  return candidates.decisionTargets.some(
    (candidate) =>
      candidate.value !== "wait"
      && candidate.value !== "continue"
      && candidate.value !== "none"
      && candidate.value !== "choose",
  );
}

/**
 * J-4-4: buy compound용 verb evidence.
 * decision matcher의 조사 축약이 "사" 단독으로 붕괴하는 것을 피한다.
 * (예: "이사해도"가 "을 사" → "사"로 오탐되지 않게)
 */
function collectRealEstateBuyCompoundVerbEvidence(
  question: string,
): string[] {
  const matched = collectMatchedDecisionKeywords(
    question,
    [
      "매수",
      "매입",
      "구입",
      "장만",
      "사도",
      "사야",
      "살까",
      "살지",
    ],
  );

  for (const form of ["을 사", "를 사", "을사", "를사"] as const) {
    if (question.includes(form)) {
      matched.push(form);
    }
  }

  return [...new Set(matched)];
}

/**
 * J-4-10: sell compound용 verb evidence.
 * buy의 사도/사야 계열과 대칭으로, 매도 행위 활용형(팔아도/팔아야/…)을 모은다.
 * "팔" 단독 substring은 쓰지 않는다(팔자 등 오탐 방지).
 */
function collectRealEstateSellCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    [
      "매도",
      "처분",
      "매각",
      "팔아도",
      "팔아야",
      "팔까요",
      "팔까",
      "팔면",
      "팔고",
      "팔아",
    ],
  );
}

/**
 * J-4-13: move compound용 relocation verb evidence.
 * decisionRules의 "옮겨야" 단독 surface에 묶이지 않도록,
 * buy/sell compound와 같이 활용형 의미군을 모은다.
 * "옮" 단독 substring은 쓰지 않는다.
 */
function collectRealEstateMoveCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_MOVE_COMPOUND_VERBS,
  );
}

/**
 * J-4-13: property noun + relocation verb compound evidence.
 * move 단독 keyword만으로는 빈 배열을 반환한다.
 */
function collectRealEstateMoveSignalEvidence(
  question: string,
): string[] {
  const propertyEvidence = collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_BUY_PROPERTY_NOUNS,
  );

  if (propertyEvidence.length === 0) {
    return [];
  }

  const moveVerbEvidence = collectRealEstateMoveCompoundVerbEvidence(question);

  if (moveVerbEvidence.length === 0) {
    return [];
  }

  return [...propertyEvidence, ...moveVerbEvidence];
}

/**
 * J-4-13: money manage compound용 manage/regulate verb evidence.
 * "관리/조절" 단독으로 topic을 강제하지 않고, cashflow noun과 결합될 때만 쓴다.
 */
function collectMoneyManageCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    MONEY_MANAGE_COMPOUND_VERBS,
  );
}

/**
 * J-4-13: cashflow noun + manage verb compound evidence.
 * manageMoney / money topic 단독 keyword만으로는 빈 배열을 반환한다.
 */
function collectMoneyManageSignalEvidence(
  question: string,
): string[] {
  const cashflowEvidence = collectMatchedDecisionKeywords(
    question,
    MONEY_CASHFLOW_COMPOUND_NOUNS,
  );

  if (cashflowEvidence.length === 0) {
    return [];
  }

  const manageVerbEvidence = collectMoneyManageCompoundVerbEvidence(question);

  if (manageVerbEvidence.length === 0) {
    return [];
  }

  return [...cashflowEvidence, ...manageVerbEvidence];
}

/**
 * P10 G1: money × invest compound용 colloquial buy verb evidence.
 * decisionRules invest keyword에 사다 계열을 전역 추가하지 않는다.
 * (부동산/일반물건/조직 buy와 충돌 방지)
 */
function collectMoneyInvestBuyCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    MONEY_FINANCIAL_ASSET_BUY_VERBS,
  );
}

/**
 * P10 G1: financial asset noun + colloquial buy surface → money × invest.
 * instrument noun 또는 buy surface 단독으로는 빈 배열을 반환한다.
 */
function collectMoneyInvestSignalEvidence(
  question: string,
): string[] {
  const assetEvidence = collectMatchedDecisionKeywords(
    question,
    FINANCIAL_ASSET_BUY_OBJECT_MARKERS,
  );

  if (assetEvidence.length === 0) {
    return [];
  }

  const buyVerbEvidence = collectMoneyInvestBuyCompoundVerbEvidence(question);

  if (buyVerbEvidence.length === 0) {
    return [];
  }

  return [...assetEvidence, ...buyVerbEvidence];
}

/**
 * J-4-4: 강한 topic × decisionTarget compound 후보를 수집한다.
 *
 * 단순 decisionTarget keyword hit와 구분한다.
 * - job noun/inherent signal + changeJob/leaveJob
 * - property noun + buy / sell / move
 * - business noun + start
 * - business noun + 운영 paraphrase → continue (P10 G4)
 * - business noun + 끊지 않고/굴려가 paraphrase → continue (P11-6-2 A1)
 * - business noun + keep-alive(살려두/붙잡아두/접지 않고/스톨시키지 않)
 *   paraphrase → continue (P11-7-2I-1 B1)
 * - business noun + 접다/폐업 paraphrase → stop (P10 G5)
 * - business noun + 접고/손을 떼다 paraphrase → stop (P11-6-3 A2)
 * - business noun + 끝내*|종료*|마무리*|닫아버리* paraphrase → stop
 *   (P11-7-2I-5 B2; bare end/close 금지)
 * - business noun + 이어가지 않*|계속하지 않* paraphrase → stop
 *   (P11-7-2I-6 B9; bare 이어가/계속/더 이상/않 금지;
 *    끊지 않고/스톨시키지 않 긍정 keep-track과 분리)
 * - property noun + 보유/가지고 있 paraphrase → continue (P10 G6)
 * - business/entity noun + 인수|매입|구입 → buy (P10 G2-2 / P11-6-6 A3-1)
 * - business entity/object + colloquial 사* → buy (P11-6-6 A3-2; 회사 제외)
 * - operating-right/entity + transfer-in(이전받|양수|승계|통째로 가져오|테이크오버)
 *   / right×가져오 → buy (P11-7-2I-2 B3; bare 이전·가져오 금지)
 * - employment noun × disconnect|exit|end(끝내*) / job noun × put-down → leaveJob
 *   (P11-7-2I-3 B5 / P11-7-2I-7 B6; bare 끊다/끝내다/내려놓다/엑시트/공백기 금지)
 * - money cashflow noun + manage verb (J-4-13)
 * - financial asset noun + colloquial buy surface → invest (P10 G1)
 *
 * invest/move/start/buy/sell/manageMoney/continue/stop 단독 keyword만으로는 만들지 않는다.
 * bare "운영"은 전역 continue evidence가 아니다.
 * bare "끊다"/"굴리다"는 전역 continue evidence가 아니다.
 * bare "살리다"/"붙잡다"/"가져가다"/"스톨"은 전역 continue evidence가 아니다.
 * bare "접다"/"폐업"/"손을 떼다"/"끝내다"/"종료"/"마무리"/"닫아버리다"/
 * "이어가"/"계속"/"더 이상"/"않"은 전역 stop evidence가 아니다.
 * bare "보유"/"가지고 있"은 전역 continue evidence가 아니다.
 */
function collectTopicDecisionCompoundCandidates(
  question: string,
): TopicDecisionCompoundCandidate[] {
  const compounds: TopicDecisionCompoundCandidate[] = [];

  const pushPair = (
    topic: QuestionTopic,
    decisionTarget: DecisionTarget,
    topicEvidence: string[],
    decisionEvidence: string[],
    priority: number,
  ): void => {
    if (decisionEvidence.length === 0) {
      return;
    }

    // topic 쪽 증거가 전혀 없으면 forcing 대상이 아니다.
    // (job inherent signal은 decisionEvidence에 이미 topic 의미가 포함된다)
    if (topicEvidence.length === 0 && !isInherentTopicDecisionSignal(
      topic,
      decisionTarget,
      decisionEvidence,
    )) {
      return;
    }

    compounds.push({
      topic,
      decisionTarget,
      topicEvidence,
      decisionEvidence,
      priority,
      strength: topicEvidence.length + decisionEvidence.length,
    });
  };

  const jobNouns = collectMatchedDecisionKeywords(
    question,
    JOB_TOPIC_COMPOUND_NOUNS,
  );
  const employmentChangeNouns = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_EMPLOYMENT_CONTEXT_NOUNS,
  );
  const changeJobTopicNouns = [
    ...new Set([...jobNouns, ...employmentChangeNouns]),
  ];
  const employmentLeaveNouns = collectMatchedDecisionKeywords(
    question,
    JOB_EMPLOYMENT_LEAVE_CONTEXT_NOUNS,
  );
  const leaveJobTopicNouns = [
    ...new Set([...jobNouns, ...employmentLeaveNouns]),
  ];
  const changeJobEvidence = collectChangeJobSignalEvidence(question);
  const leaveJobEvidence = collectLeaveJobSignalEvidence(question);

  pushPair(
    "job",
    "changeJob",
    changeJobTopicNouns,
    changeJobEvidence,
    0,
  );
  pushPair(
    "job",
    "leaveJob",
    leaveJobTopicNouns,
    leaveJobEvidence,
    1,
  );

  const propertyEvidence = collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_BUY_PROPERTY_NOUNS,
  );
  // 알려진 property noun이 없으면 N을/를 + 매수|매입|구입 structural 증거만 보조한다.
  // (고유명사 vocabulary 추가 없음; 금융자산·cashflow money·business/job noun은 제외)
  const realEstateBuyObjectEvidence =
    propertyEvidence.length > 0
      ? propertyEvidence
      : collectStructuralRealEstateBuyObjectEvidence(question);
  const buyVerbEvidence = collectRealEstateBuyCompoundVerbEvidence(question);

  pushPair(
    "realEstate",
    "buy",
    realEstateBuyObjectEvidence,
    buyVerbEvidence,
    2,
  );

  const sellVerbEvidence = collectRealEstateSellCompoundVerbEvidence(question);

  pushPair(
    "realEstate",
    "sell",
    propertyEvidence,
    sellVerbEvidence,
    3,
  );

  const establishSignals = collectBusinessEstablishStartSignalEvidence(
    question,
  );
  const businessNouns = collectMatchedDecisionKeywords(
    question,
    establishSignals.length > 0
      ? BUSINESS_ESTABLISH_ENTITY_NOUNS
      : BUSINESS_TOPIC_COMPOUND_NOUNS,
  );
  const startSignals = [
    ...collectBusinessStartActionEvidence(question),
    ...establishSignals,
  ];

  pushPair(
    "business",
    "start",
    businessNouns,
    startSignals,
    4,
  );

  // P10 G4 / P11-6-2 A1 / P11-7-2I-1 B1: business noun +
  // 운영|끊지 않고|굴려가|keep-alive paraphrase → business × continue
  // bare 운영/끊다/굴리다/살리다/붙잡다/가져가다/스톨·비사업 목적어
  // (회사/직장/업무/채널/관계 등)만으로는 만들지 않는다.
  const continueOperateSignals = collectBusinessContinueCompoundVerbEvidence(
    question,
  );
  const continueOperateNouns = collectMatchedDecisionKeywords(
    question,
    BUSINESS_TOPIC_COMPOUND_NOUNS,
  );

  pushPair(
    "business",
    "continue",
    continueOperateNouns,
    continueOperateSignals,
    9,
  );

  // P10 G5 / P11-6-3 A2 / P11-7-2I-5 B2 / P11-7-2I-6 B9: business noun +
  // 접다|폐업|손을 떼다|끝내*|종료*|마무리*|닫아버리*|이어가지 않*|계속하지 않*
  // paraphrase → business × stop
  // bare 접다·폐업·손을 떼다·끝내다·종료·마무리·닫아버리다·이어가·계속·더 이상·않
  // ·비사업 목적어
  // (계획/책/일/프로젝트/마음/회사/직장/관계/투자/업무/팀/고용/인생/임대 등)
  // 만으로는 만들지 않는다. 기존 DecisionTarget `stop`을 재사용한다.
  const stopCloseSignals = collectBusinessStopCompoundVerbEvidence(question);
  const stopCloseNouns = collectMatchedDecisionKeywords(
    question,
    BUSINESS_TOPIC_COMPOUND_NOUNS,
  );

  pushPair(
    "business",
    "stop",
    stopCloseNouns,
    stopCloseSignals,
    10,
  );

  // P10 G6: property noun + 보유/가지고 있 paraphrase → realEstate × continue
  // bare 보유·가지고 있·비부동산 목적어(현금/주식/ETF/코인/물건/상품 등)만으로는
  // 만들지 않는다. 기존 DecisionTarget `continue`를 재사용한다(hold DT 없음).
  const continueHoldSignals = collectRealEstateContinueCompoundVerbEvidence(
    question,
  );

  pushPair(
    "realEstate",
    "continue",
    propertyEvidence,
    continueHoldSignals,
    11,
  );

  // P10 G2-2 / P11-6-6 A3-1: entity noun + 인수|매입|구입 → business × buy
  // start(설립/창업)와 대칭. bare 인수·매입·구입·인수인계만으로는 만들지 않는다.
  const acquireSignals = collectBusinessAcquireBuyActionEvidence(question);
  const acquireEntityNouns = collectMatchedDecisionKeywords(
    question,
    BUSINESS_ACQUIRE_ENTITY_NOUNS,
  );

  pushPair(
    "business",
    "buy",
    acquireEntityNouns,
    acquireSignals,
    8,
  );

  // P11-6-6 A3-2: business entity/object + colloquial 사* → business × buy
  // bare 사다·일반물건·부동산·금융자산·회사만으로는 만들지 않는다.
  const colloquialBuySignals = collectBusinessColloquialBuyActionEvidence(
    question,
  );
  const colloquialBuyNouns = collectMatchedDecisionKeywords(
    question,
    BUSINESS_COLLOQUIAL_BUY_ENTITY_NOUNS,
  );

  pushPair(
    "business",
    "buy",
    colloquialBuyNouns,
    colloquialBuySignals,
    8,
  );

  // P11-7-2I-2 / B3: operating-right/entity + transfer-in → business × buy
  // bare 이전·양수·승계·가져오·테이크오버·비사업 목적어만으로는 만들지 않는다.
  const acquisitionBuySignals = collectBusinessAcquisitionTransferInVerbEvidence(
    question,
  );
  const acquisitionBuyNouns = collectMatchedDecisionKeywords(
    question,
    BUSINESS_ACQUISITION_ENTITY_NOUNS,
  );

  pushPair(
    "business",
    "buy",
    acquisitionBuyNouns,
    acquisitionBuySignals,
    8,
  );

  // J-4-13: property noun + relocation verb → realEstate × move
  // buy/sell compound와 대칭. move 단독·property 단독으로는 만들지 않는다.
  const moveVerbEvidence = collectRealEstateMoveCompoundVerbEvidence(question);

  pushPair(
    "realEstate",
    "move",
    propertyEvidence,
    moveVerbEvidence,
    5,
  );

  // J-4-13: cashflow noun + manage verb → money × manageMoney
  // topicRules의 개별 명사 hit가 없어도 유입/유출/관리 의미군으로 topic을 승격한다.
  const moneyFlowEvidence = collectMatchedDecisionKeywords(
    question,
    MONEY_CASHFLOW_COMPOUND_NOUNS,
  );
  const manageVerbEvidence = collectMoneyManageCompoundVerbEvidence(question);

  pushPair(
    "money",
    "manageMoney",
    moneyFlowEvidence,
    manageVerbEvidence,
    6,
  );

  // P10 G1: financial asset noun + colloquial buy → money × invest
  // 사다 계열 전역 invest keyword 추가 없이 compound로만 연결한다.
  // 현금/부동산/일반물건/조직 object는 FINANCIAL_ASSET marker 밖이라 진입하지 않는다.
  const financialAssetEvidence = collectMatchedDecisionKeywords(
    question,
    FINANCIAL_ASSET_BUY_OBJECT_MARKERS,
  );
  const financialBuyVerbEvidence =
    collectMoneyInvestBuyCompoundVerbEvidence(question);

  pushPair(
    "money",
    "invest",
    financialAssetEvidence,
    financialBuyVerbEvidence,
    7,
  );

  // love/relationship object × 인연 이어* → relationship|love × partner
  // bare 인연/이어가·비관계 목적어만으로는 만들지 않는다.
  // 기존 business/co-op partner decisionRules는 수정하지 않는다.
  const loveRelationshipPartnerContext =
    collectMatchedDecisionKeywords(
      question,
      LOVE_RELATIONSHIP_PARTNER_CONTEXT_NOUNS,
    );
  const loveRelationshipPartnerVerbs =
    collectLoveRelationshipPartnerCompoundVerbEvidence(question);

  pushPair(
    "relationship",
    "partner",
    loveRelationshipPartnerContext,
    loveRelationshipPartnerVerbs,
    12,
  );
  pushPair(
    "love",
    "partner",
    loveRelationshipPartnerContext,
    loveRelationshipPartnerVerbs,
    12,
  );

  return compounds;
}

/**
 * J-4-4: decision evidence만으로도 topic이 확정되는 inherent compound signal.
 * 예: 이직/전직/퇴사 — generic move/stop/start/buy/invest와 다르다.
 */
function isInherentTopicDecisionSignal(
  topic: QuestionTopic,
  decisionTarget: DecisionTarget,
  decisionEvidence: readonly string[],
): boolean {
  if (topic !== "job") {
    return false;
  }

  if (decisionTarget === "changeJob") {
    return decisionEvidence.some((item) =>
      item === "이직"
      || item === "전직"
      || item.includes("직장")
      || item.includes("회사")
      || item.includes("고용주")
      || item.includes("근무처")
      || item.includes("근무")
      || isJobChangeGeneralizationEvidenceToken(item)
    );
  }

  if (decisionTarget === "leaveJob") {
    return decisionEvidence.some((item) =>
      item === "퇴사"
      || item.includes("직장")
      || item.includes("회사")
      || item.includes("고용")
      || item.includes("급여직")
      || item.includes("월급 자리")
      || item.includes("월급자리")
    );
  }

  return false;
}

/**
 * J-4-4: Phase 1 decisionTarget이 compound pair와 호환되는지.
 *
 * - 이미 같은 specific 이거나
 * - none 이거나
 * - J-4-1 generic↔specific 충돌 쌍의 generic 인 경우만 허용한다.
 *
 * partner / move / sell 등 다른 specific을 compound로 덮지 않는다.
 */
function isPhase1DecisionCompatibleWithCompound(
  phase1DecisionTarget: DecisionTarget,
  compoundDecisionTarget: DecisionTarget,
): boolean {
  if (phase1DecisionTarget === compoundDecisionTarget) {
    return true;
  }

  if (phase1DecisionTarget === "none") {
    return true;
  }

  for (const conflict of GENERIC_TO_SPECIFIC_DECISION_CONFLICTS) {
    if (
      conflict.specific === compoundDecisionTarget
      && conflict.generic === phase1DecisionTarget
    ) {
      return true;
    }
  }

  return false;
}

/**
 * P11-7-2I-7 / B6: excluded/rival clause contrast markers.
 * 전역 routing trigger가 아니다.
 * topic×decision compound A와 B가 함께 있을 때만
 * marker 앞 rival evidence demotion에 사용한다.
 */
const TOPIC_BOUNDARY_CONTRAST_EXCLUSION_MARKERS: readonly string[] = [
  "아니라",
  "아닌",
  "말고",
  "대신",
  "아니고",
];

function findTopicBoundaryContrastSplitIndex(
  question: string,
): number {
  let earliest = -1;

  for (const marker of TOPIC_BOUNDARY_CONTRAST_EXCLUSION_MARKERS) {
    const index = question.indexOf(marker);
    if (index < 0) {
      continue;
    }
    if (earliest < 0 || index < earliest) {
      earliest = index;
    }
  }

  return earliest;
}

function scoreCompoundContrastPlacement(
  question: string,
  compound: TopicDecisionCompoundCandidate,
  splitIndex: number,
): {
  before: number;
  after: number;
} {
  let before = 0;
  let after = 0;
  const tokens = [
    ...new Set([
      ...compound.topicEvidence,
      ...compound.decisionEvidence,
    ]),
  ];

  for (const token of tokens) {
    const index = question.indexOf(token);
    if (index < 0) {
      continue;
    }
    if (index < splitIndex) {
      before += 1;
    } else {
      after += 1;
    }
  }

  return { before, after };
}

/**
 * P11-7-2I-14 / A1-06: compound decisionEvidence만으로 before/after 배치를 본다.
 * topic noun(사업 등)이 양쪽에 걸쳐 I-7식 demotion을 깨지 않게 한다.
 */
function scoreCompoundDecisionEvidencePlacement(
  question: string,
  compound: TopicDecisionCompoundCandidate,
  splitIndex: number,
): {
  before: number;
  after: number;
} {
  let before = 0;
  let after = 0;

  for (const token of new Set(compound.decisionEvidence)) {
    const index = question.indexOf(token);
    if (index < 0) {
      continue;
    }
    if (index < splitIndex) {
      before += 1;
    } else {
      after += 1;
    }
  }

  return { before, after };
}

/**
 * P11-7-2I-14 / A1-06: business start-before + keep-alive/keep-going-after
 * "보다" preference contrast split.
 *
 * TOPIC_BOUNDARY_CONTRAST_EXCLUSION_MARKERS에 "보다"를 넣지 않는다.
 * 아래 surface gate를 모두 만족할 때만 split index를 반환한다.
 */
function findBusinessStartContinuePreferenceSplitIndex(
  question: string,
): number {
  const marker = "보다";
  const splitIndex = question.indexOf(marker);

  if (splitIndex < 0) {
    return -1;
  }

  const before = question.slice(0, splitIndex);
  const after = question.slice(splitIndex + marker.length);

  // G1: business topic noun evidence
  if (
    collectMatchedDecisionKeywords(
      question,
      BUSINESS_TOPIC_COMPOUND_NOUNS,
    ).length === 0
  ) {
    return -1;
  }

  // G3: BEFORE = business start evidence (창업 등 기존 start signal 재사용)
  const startBefore = [
    ...collectBusinessStartActionEvidence(before),
    ...collectBusinessEstablishStartSignalEvidence(before),
  ];

  if (startBefore.length === 0) {
    return -1;
  }

  // G4: AFTER = business keep-alive/keep-going continue + business noun
  if (
    collectMatchedDecisionKeywords(
      after,
      BUSINESS_TOPIC_COMPOUND_NOUNS,
    ).length === 0
  ) {
    return -1;
  }

  if (collectBusinessContinueKeepGoingVerbEvidence(after).length === 0) {
    return -1;
  }

  // G8: AFTER에 start signal이 함께 있으면 preference keep-alive 경로가 아니다.
  // (예: 계속하기보다 새로 창업 — reverse는 이번 scope 밖)
  if (
    collectBusinessStartActionEvidence(after).length > 0
    || collectBusinessEstablishStartSignalEvidence(after).length > 0
  ) {
    return -1;
  }

  return splitIndex;
}

function hasBusinessStartContinuePreferenceContrast(
  question: string,
): boolean {
  return findBusinessStartContinuePreferenceSplitIndex(question) >= 0;
}

/**
 * J-4-4: 강한 compound가 있으면 topic + decisionTarget을 한 쌍으로 고른다.
 *
 * 단순 keyword forcing이 아니라 compound candidate만 사용한다.
 * Phase 1 decision과 호환되지 않으면 null → Phase 1 유지.
 *
 * P11-7-2I-7 / B6: contrast marker가 있고 compound 경쟁이 있으면
 * marker 앞(excluded) evidence-only rival보다
 * marker 뒤 accepted compound를 우선한다.
 * 전역 topic priority·단독 "아니라" routing은 하지 않는다.
 */
function resolveStrongTopicDecisionCompound(
  question: string,
  candidates: MeaningCandidateSet,
  phase1DecisionTarget: DecisionTarget,
): {
  topic: QuestionTopic;
  decisionTarget: DecisionTarget;
  topicEvidence: string[];
  decisionEvidence: string[];
} | null {
  const compatible = candidates.topicDecisionCompounds.filter((compound) => {
    if (
      isPhase1DecisionCompatibleWithCompound(
        phase1DecisionTarget,
        compound.decisionTarget,
      )
    ) {
      return true;
    }

    // P11-7-2I-3 / B5: employment/job leave compound는
    // selection|choose surface를 덮을 수 있다 (B14).
    // bare 끊/내려놓/엑시트 단독은 compound 자체가 만들어지지 않는다.
    if (
      phase1DecisionTarget === "choose"
      && compound.topic === "job"
      && compound.decisionTarget === "leaveJob"
      && compound.decisionEvidence.some((token) =>
        isJobLeaveGeneralizationEvidenceToken(token)
      )
    ) {
      return true;
    }

    // P11-7-2I-4 / B4: employment/workplace change compound는
    // choose|confirmDirection|protectHealth surface를 덮을 수 있다 (B14 부분 보호).
    // bare 바꾸다/이동/경로/재배치/오퍼 단독은 compound 자체가 만들어지지 않는다.
    // protectHealth는 job×changeJob×generalization evidence일 때만 허용한다.
    if (
      (phase1DecisionTarget === "choose"
        || phase1DecisionTarget === "confirmDirection"
        || phase1DecisionTarget === "protectHealth")
      && compound.topic === "job"
      && compound.decisionTarget === "changeJob"
      && compound.decisionEvidence.some((token) =>
        isJobChangeGeneralizationEvidenceToken(token)
      )
    ) {
      return true;
    }

    // P11-7-2I-5 / B2: business end/close stop compound는
    // selection|choose surface를 덮을 수 있다 (B14 부분 보호).
    // bare 끝내/종료/마무리/닫아버리 단독은 compound 자체가 만들어지지 않는다.
    if (
      phase1DecisionTarget === "choose"
      && compound.topic === "business"
      && compound.decisionTarget === "stop"
      && compound.decisionEvidence.some((token) =>
        isBusinessStopEndCloseEvidenceToken(token)
      )
    ) {
      return true;
    }

    // P11-7-2I-6 / B9: business negated-continue stop compound는
    // continue|choose surface를 덮을 수 있다.
    // "끊지 않고"/"스톨시키지 않" 긍정 keep-track과는 별도 vocab.
    // bare 이어가/계속/더 이상/않 단독은 compound 자체가 만들어지지 않는다.
    if (
      (phase1DecisionTarget === "continue"
        || phase1DecisionTarget === "choose")
      && compound.topic === "business"
      && compound.decisionTarget === "stop"
      && compound.decisionEvidence.some((token) =>
        isBusinessStopNegatedContinueEvidenceToken(token)
      )
    ) {
      return true;
    }

    // P11-7-2I-10 / A1: business keep-alive/keep-going continue compound는
    // selection|choose surface를 덮을 수 있다 (B14 부분 보호).
    // Intent(selection)는 유지하고 DT만 concrete continue로 보존한다.
    // bare 살려두/붙잡아두/스톨/끊다/굴리다 단독은 compound 자체가 만들어지지 않는다.
    if (
      phase1DecisionTarget === "choose"
      && compound.topic === "business"
      && compound.decisionTarget === "continue"
      && compound.decisionEvidence.some((token) =>
        isBusinessContinueKeepAliveOrKeepGoingEvidenceToken(token)
      )
    ) {
      return true;
    }

    // P11-7-2I-14 / A1-06: business start-before + keep-alive/keep-going-after
    // "보다" preference contrast에서만 start → continue 호환을 허용한다.
    // start↔continue를 전역 compatible로 열지 않는다.
    if (
      phase1DecisionTarget === "start"
      && compound.topic === "business"
      && compound.decisionTarget === "continue"
      && compound.decisionEvidence.some((token) =>
        isBusinessContinueKeepAliveOrKeepGoingEvidenceToken(token)
      )
      && hasBusinessStartContinuePreferenceContrast(question)
    ) {
      return true;
    }

    // D-001: realEstate buy compound가 이미 생성되어 있을 때만
    // "새로"(start) → buy compound 호환을 허용한다.
    // start↔buy를 전역 compatible로 열지 않으며, 다른 topic에는 적용하지 않는다.
    // bare "사도"/buy-less "새로"는 compound 자체가 없거나 topic≠realEstate라 미적용.
    if (
      phase1DecisionTarget === "start"
      && compound.topic === "realEstate"
      && compound.decisionTarget === "buy"
      && compound.decisionEvidence.length > 0
    ) {
      return true;
    }

    // A-002: business acquire buy compound(인수|매입|구입)가 이미 있을 때만
    // continue|choose → buy compound 호환을 허용한다.
    // continue↔buy / choose↔buy를 전역 compatible로 열지 않는다.
    // keep-alive/continue·stop·start 정책, bare "사도", colloquial 사*는 미적용.
    if (
      (phase1DecisionTarget === "continue"
        || phase1DecisionTarget === "choose")
      && compound.topic === "business"
      && compound.decisionTarget === "buy"
      && compound.decisionEvidence.some((token) =>
        isBusinessAcquireBuyEvidenceToken(token)
      )
    ) {
      return true;
    }

    // P11-7-2I-2 / B3: operating-right transfer-in buy는
    // 이전받*의 false move·지분 contrast의 partner를 덮을 수 있다.
    // 인수|매입|구입|사* 등 기존 buy compound는 기존 호환 규칙을 유지한다.
    if (
      phase1DecisionTarget !== "move"
      && phase1DecisionTarget !== "partner"
    ) {
      return false;
    }

    if (compound.topic !== "business" || compound.decisionTarget !== "buy") {
      return false;
    }

    return compound.decisionEvidence.some((token) =>
      isBusinessAcquisitionTransferInEvidenceToken(token)
    );
  });

  if (compatible.length === 0) {
    return null;
  }

  let selected = compatible[0];

  for (let index = 1; index < compatible.length; index += 1) {
    const next = compatible[index];

    if (
      next.priority < selected.priority
      || (
        next.priority === selected.priority
        && next.strength > selected.strength
      )
    ) {
      selected = next;
    }
  }

  const contrastSplitIndex = findTopicBoundaryContrastSplitIndex(question);

  if (contrastSplitIndex >= 0 && compatible.length > 1) {
    const selectedPlacement = scoreCompoundContrastPlacement(
      question,
      selected,
      contrastSplitIndex,
    );
    const selectedIsExcludedRival =
      selectedPlacement.before > 0 && selectedPlacement.after === 0;

    if (selectedIsExcludedRival) {
      let accepted: TopicDecisionCompoundCandidate | null = null;

      for (const compound of compatible) {
        if (compound === selected) {
          continue;
        }

        const placement = scoreCompoundContrastPlacement(
          question,
          compound,
          contrastSplitIndex,
        );

        if (placement.after === 0) {
          continue;
        }

        if (
          accepted === null
          || compound.priority < accepted.priority
          || (
            compound.priority === accepted.priority
            && compound.strength > accepted.strength
          )
        ) {
          accepted = compound;
        }
      }

      if (accepted) {
        selected = accepted;
      }
    }
  }

  // P11-7-2I-14 / A1-06: "보다" preference contrast.
  // before-only business start rival 보다 after keep-alive/keep-going continue target.
  // I-7(아니라/아닌/말고/대신/아니고) demotion은 그대로 보존한다.
  const preferenceSplitIndex =
    findBusinessStartContinuePreferenceSplitIndex(question);

  if (preferenceSplitIndex >= 0 && compatible.length > 1) {
    const selectedPlacement = scoreCompoundDecisionEvidencePlacement(
      question,
      selected,
      preferenceSplitIndex,
    );
    const selectedIsStartRival =
      selected.topic === "business"
      && selected.decisionTarget === "start"
      && selectedPlacement.before > 0
      && selectedPlacement.after === 0;

    if (selectedIsStartRival) {
      let accepted: TopicDecisionCompoundCandidate | null = null;

      for (const compound of compatible) {
        if (compound === selected) {
          continue;
        }

        if (
          compound.topic !== "business"
          || compound.decisionTarget !== "continue"
        ) {
          continue;
        }

        if (
          !compound.decisionEvidence.some((token) =>
            isBusinessContinueKeepAliveOrKeepGoingEvidenceToken(token)
          )
        ) {
          continue;
        }

        const placement = scoreCompoundDecisionEvidencePlacement(
          question,
          compound,
          preferenceSplitIndex,
        );

        // G6/G7: continue evidence는 after-arm에 있어야 한다.
        if (placement.after === 0 || placement.before > 0) {
          continue;
        }

        if (
          accepted === null
          || compound.priority < accepted.priority
          || (
            compound.priority === accepted.priority
            && compound.strength > accepted.strength
          )
        ) {
          accepted = compound;
        }
      }

      if (accepted) {
        selected = accepted;
      }
    }
  }

  // topic / decision이 이미 pair와 같아도 evidence를 compound 기준으로 정규화한다.
  const topicCandidate = candidates.topics.find(
    (candidate) => candidate.value === selected.topic,
  );
  const decisionCandidate = findDecisionTargetCandidate(
    candidates.decisionTargets,
    selected.decisionTarget,
  );

  return {
    topic: selected.topic,
    decisionTarget: selected.decisionTarget,
    topicEvidence: mergeUniqueEvidence(
      selected.topicEvidence,
      topicCandidate?.evidence ?? [],
    ),
    decisionEvidence: mergeUniqueEvidence(
      selected.decisionEvidence,
      decisionCandidate?.evidence ?? [],
    ),
  };
}

/**
 * J-4-1: decisionTarget generic action ↔ specific action 충돌 쌍.
 * decisionTarget 선택에만 사용한다.
 */
const GENERIC_TO_SPECIFIC_DECISION_CONFLICTS:
  readonly {
    generic: DecisionTarget;
    specific: DecisionTarget;
  }[] = [
    { generic: "move", specific: "changeJob" },
    { generic: "stop", specific: "leaveJob" },
    { generic: "invest", specific: "buy" },
  ];

function findDecisionTargetCandidate(
  candidates: readonly MeaningCandidate<DecisionTarget>[],
  value: DecisionTarget,
  source?: MeaningCandidateSource,
): MeaningCandidate<DecisionTarget> | null {
  return candidates.find((candidate) =>
    candidate.value === value
    && (source === undefined || candidate.source === source)
  ) ?? null;
}

/**
 * J-4-1: Phase 1 priority 선택 이후,
 * generic/specific·compound 충돌이 있을 때만 specific을 승격한다.
 *
 * - changeJob > move (job compound + changeJob candidate)
 * - leaveJob > stop (job leave compound + leaveJob candidate)
 * - buy > invest (realEstate topic + buy compound)
 */
function resolveGenericSpecificDecisionTargetConflict(
  selected: DecisionTarget,
  candidates: MeaningCandidateSet,
  topic: QuestionTopic,
): MeaningCandidate<DecisionTarget> | null {
  for (const conflict of GENERIC_TO_SPECIFIC_DECISION_CONFLICTS) {
    if (selected !== conflict.generic) {
      continue;
    }

    const specificCandidate = findDecisionTargetCandidate(
      candidates.decisionTargets,
      conflict.specific,
    );

    if (!specificCandidate) {
      continue;
    }

    const compoundCandidate = findDecisionTargetCandidate(
      candidates.decisionTargets,
      conflict.specific,
      "compoundSignal",
    );

    if (conflict.specific === "changeJob") {
      // D: job topic + job compound signal + changeJob candidate → move보다 우선
      if (topic !== "job" || !compoundCandidate) {
        continue;
      }

      return compoundCandidate;
    }

    if (conflict.specific === "leaveJob") {
      // E: job topic + leave compound signal + leaveJob candidate → stop보다 우선
      if (topic !== "job" || !compoundCandidate) {
        continue;
      }

      return compoundCandidate;
    }

    if (conflict.specific === "buy") {
      // F: realEstate topic + buy compound → invest보다 우선
      if (topic !== "realEstate" || !compoundCandidate) {
        continue;
      }

      return compoundCandidate;
    }
  }

  return null;
}

function findIntentCandidate(
  intents: readonly MeaningCandidate<ReaderIntentLiteral>[],
  value: ReaderIntentLiteral,
): MeaningCandidate<ReaderIntentLiteral> | null {
  return intents.find((candidate) => candidate.value === value) ?? null;
}

function mergeUniqueEvidence(
  ...groups: readonly (readonly string[])[]
): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    for (const item of group) {
      if (seen.has(item)) {
        continue;
      }

      seen.add(item);
      merged.push(item);
    }
  }

  return merged;
}

/**
 * J-4-3-1: 강한 permission/feasibility frame이면
 * intent만 possibility로 override한다.
 *
 * decisionTarget / topic은 건드리지 않는다.
 * 질문 문자열을 다시 스캔하지 않고 frame candidate만 사용한다.
 * evidence는 기존 resolveQuestionIntent와 동일하게 고정한다.
 */
function resolveStrongPermissionIntent(
  candidates: MeaningCandidateSet,
): {
  intent: ReaderIntentLiteral;
  evidence: string[];
} | null {
  const frame = hasFrame(
    candidates.frames,
    "permissionOrFeasibility",
  );

  // frame candidate가 없거나 약하면 override 대상이 아니다.
  if (!frame || frame.strength < 1) {
    return null;
  }

  return {
    intent: "possibility",
    evidence: ["permissionOrFeasibility"],
  };
}

/**
 * J-4-2: comparison/selection frame이 강하면
 * 해당 frame에 맞는 intent candidate를 고른다.
 *
 * 질문 문자열을 다시 스캔하지 않고
 * frame candidate evidence + intent candidate만 사용한다.
 */
function resolveStrongComparisonOrSelectionIntent(
  candidates: MeaningCandidateSet,
): {
  intent: ReaderIntentLiteral;
  evidence: string[];
} | null {
  const frame = hasFrame(
    candidates.frames,
    "comparisonOrOptionFit",
  );

  // frame candidate가 없으면 충돌 override 대상이 아니다.
  if (!frame || frame.strength < 1) {
    return null;
  }

  const comparisonIntent = findIntentCandidate(
    candidates.intents,
    "comparison",
  );
  const selectionIntent = findIntentCandidate(
    candidates.intents,
    "selection",
  );

  if (comparisonIntent && selectionIntent) {
    const selected =
      comparisonIntent.priority <= selectionIntent.priority
        ? comparisonIntent
        : selectionIntent;

    return {
      intent: selected.value,
      evidence: mergeUniqueEvidence(frame.evidence, selected.evidence),
    };
  }

  if (comparisonIntent) {
    return {
      intent: "comparison",
      evidence: mergeUniqueEvidence(
        frame.evidence,
        comparisonIntent.evidence,
      ),
    };
  }

  if (selectionIntent) {
    return {
      intent: "selection",
      evidence: mergeUniqueEvidence(
        frame.evidence,
        selectionIntent.evidence,
      ),
    };
  }

  // intentRules miss여도 frame marker evidence로 comparison/selection을 구분한다.
  const comparisonKeywords = new Set(getComparisonIntentKeywords());
  const selectionKeywords = new Set(getSelectionIntentKeywords());
  const hasComparisonEvidence = frame.evidence.some((marker) =>
    comparisonKeywords.has(marker)
  );
  const hasSelectionEvidence = frame.evidence.some((marker) =>
    selectionKeywords.has(marker)
  );

  if (hasComparisonEvidence && !hasSelectionEvidence) {
    return {
      intent: "comparison",
      evidence: [...frame.evidence],
    };
  }

  if (hasSelectionEvidence) {
    return {
      intent: "selection",
      evidence: [...frame.evidence],
    };
  }

  // option-fit frame만 남은 경우 selection으로 정규화한다.
  return {
    intent: "selection",
    evidence: [...frame.evidence],
  };
}

/**
 * J-4-2: comparison/selection frame + generic action이면 choose.
 * strong specific action이 있으면 덮어쓰지 않는다.
 */
function resolveComparisonSelectionGenericDecisionTarget(
  selected: DecisionTarget,
  candidates: MeaningCandidateSet,
  decisionEvidence: readonly string[],
): {
  decisionTarget: DecisionTarget;
  evidence: string[];
} | null {
  const frame = hasFrame(
    candidates.frames,
    "comparisonOrOptionFit",
  );

  if (!frame || frame.strength < 1) {
    return null;
  }

  if (!GENERIC_ACTION_DECISION_TARGETS.has(selected)) {
    // specific / non-generic action은 유지한다.
    return null;
  }

  return {
    decisionTarget: "choose",
    evidence: mergeUniqueEvidence(frame.evidence, decisionEvidence),
  };
}

/**
 * J-4-3-2: continuation frame이 강하면
 * generic action보다 continue 후보를 가중한다.
 *
 * specific action / choose는 보호한다.
 * intent는 변경하지 않는다.
 */
function resolveContinuationGenericDecisionTarget(
  selected: DecisionTarget,
  candidates: MeaningCandidateSet,
  decisionEvidence: readonly string[],
): {
  decisionTarget: DecisionTarget;
  evidence: string[];
} | null {
  const frame = hasFrame(candidates.frames, "continuation");

  if (!frame || frame.strength < 1) {
    return null;
  }

  if (!GENERIC_ACTION_DECISION_TARGETS.has(selected)) {
    return null;
  }

  if (selected === "continue") {
    return null;
  }

  const continueCandidate = findDecisionTargetCandidate(
    candidates.decisionTargets,
    "continue",
  );

  if (!continueCandidate) {
    return null;
  }

  return {
    decisionTarget: "continue",
    evidence: mergeUniqueEvidence(
      frame.evidence,
      continueCandidate.evidence,
      decisionEvidence,
    ),
  };
}

/**
 * J-4-3-2: termination frame이 강하면
 * generic stop 계열 충돌을 정리한다.
 *
 * - specific termination action이 있으면 보호/승격
 * - 그 외 generic이 stop이 아니면 stop 후보를 가중
 * - intent는 변경하지 않는다.
 */
function resolveTerminationGenericDecisionTarget(
  selected: DecisionTarget,
  candidates: MeaningCandidateSet,
  topic: QuestionTopic,
  decisionEvidence: readonly string[],
): {
  decisionTarget: DecisionTarget;
  evidence: string[];
} | null {
  const frame = hasFrame(candidates.frames, "termination");

  if (!frame || frame.strength < 1) {
    return null;
  }

  if (!GENERIC_ACTION_DECISION_TARGETS.has(selected)) {
    // 이미 specific이면 유지한다.
    return null;
  }

  for (const specific of TERMINATION_SPECIFIC_DECISION_TARGETS) {
    const specificCandidate = findDecisionTargetCandidate(
      candidates.decisionTargets,
      specific,
    );

    if (!specificCandidate) {
      continue;
    }

    if (specific === "leaveJob") {
      const compoundCandidate = findDecisionTargetCandidate(
        candidates.decisionTargets,
        "leaveJob",
        "compoundSignal",
      );

      // J-4-1과 동일: job + leave compound일 때만 leaveJob 승격
      if (topic !== "job" || !compoundCandidate) {
        continue;
      }

      return {
        decisionTarget: "leaveJob",
        evidence: mergeUniqueEvidence(
          frame.evidence,
          compoundCandidate.evidence,
          decisionEvidence,
        ),
      };
    }

    return {
      decisionTarget: specific,
      evidence: mergeUniqueEvidence(
        frame.evidence,
        specificCandidate.evidence,
        decisionEvidence,
      ),
    };
  }

  if (selected === "stop") {
    return null;
  }

  const stopCandidate = findDecisionTargetCandidate(
    candidates.decisionTargets,
    "stop",
  );

  if (!stopCandidate) {
    return null;
  }

  return {
    decisionTarget: "stop",
    evidence: mergeUniqueEvidence(
      frame.evidence,
      stopCandidate.evidence,
      decisionEvidence,
    ),
  };
}

/**
 * J-4-3-2: termination / continuation frame 중
 * 적용할 decisionTarget override를 고른다.
 *
 * 둘 다 있으면 strength가 큰 쪽,
 * 동률이면 intentRules 순서에 맞춰 termination을 우선한다.
 * intent는 건드리지 않는다.
 */
function resolveTerminationOrContinuationDecisionTarget(
  selected: DecisionTarget,
  candidates: MeaningCandidateSet,
  topic: QuestionTopic,
  decisionEvidence: readonly string[],
): {
  decisionTarget: DecisionTarget;
  evidence: string[];
} | null {
  const terminationFrame = hasFrame(candidates.frames, "termination");
  const continuationFrame = hasFrame(candidates.frames, "continuation");

  const terminationStrong =
    !!terminationFrame && terminationFrame.strength >= 1;
  const continuationStrong =
    !!continuationFrame && continuationFrame.strength >= 1;

  if (terminationStrong && continuationStrong) {
    if (
      continuationFrame
      && terminationFrame
      && continuationFrame.strength > terminationFrame.strength
    ) {
      return resolveContinuationGenericDecisionTarget(
        selected,
        candidates,
        decisionEvidence,
      );
    }

    return resolveTerminationGenericDecisionTarget(
      selected,
      candidates,
      topic,
      decisionEvidence,
    );
  }

  if (continuationStrong) {
    return resolveContinuationGenericDecisionTarget(
      selected,
      candidates,
      decisionEvidence,
    );
  }

  if (terminationStrong) {
    return resolveTerminationGenericDecisionTarget(
      selected,
      candidates,
      topic,
      decisionEvidence,
    );
  }

  return null;
}

/**
 * J-4-7: option-fit 의미 정규화.
 *
 * comparison / selection / (option-fit frame에 가로채인)
 * continuation·termination을 하나의 공통 option-fit 의미로 수렴한다.
 *
 * canonical intent: selection
 * - 기존 resolveStrongComparisonOrSelectionIntent의
 *   "option-fit frame만 남은 경우 selection" 정책과 동일 체계.
 * - 새 enum을 만들지 않는다.
 *
 * decisionTarget:
 * - option-fit + none/generic → choose
 * - option-fit + specific action → 유지
 *
 * 보호:
 * - prediction / 강한 permission frame
 * - specific action decisionTarget은 choose로 덮지 않음
 * - option-fit frame이 없는 단일 continuation/termination은 유지
 */
function normalizeOptionFitMeaning(
  intent: ReaderIntentLiteral,
  intentEvidence: readonly string[],
  decisionTarget: DecisionTarget,
  decisionEvidence: readonly string[],
  candidates: MeaningCandidateSet,
): {
  intent: ReaderIntentLiteral;
  intentEvidence: string[];
  decisionTarget: DecisionTarget;
  decisionEvidence: string[];
} | null {
  const predictionFrame = hasFrame(
    candidates.frames,
    "futureOutcomePrediction",
  );

  if (predictionFrame) {
    return null;
  }

  const permissionFrame = hasFrame(
    candidates.frames,
    "permissionOrFeasibility",
  );

  // J-4-3-1: 강한 permission/feasibility는 intent possibility 정책을 유지한다.
  if (permissionFrame && permissionFrame.strength >= 1) {
    return null;
  }

  const optionFitFrame = hasFrame(
    candidates.frames,
    "comparisonOrOptionFit",
  );

  if (!optionFitFrame || optionFitFrame.strength < 1) {
    return null;
  }

  // comparison/selection은 동일 option-fit 의미로 수렴한다.
  // continuation/termination은 option-fit frame이 있을 때만 가로채기를 되돌린다.
  // (단일 "계속해야/그만해야"는 option-fit frame이 없어 여기 도달하지 않는다.)
  if (
    intent !== "comparison"
    && intent !== "selection"
    && intent !== "continuation"
    && intent !== "termination"
  ) {
    return null;
  }

  let nextIntent = intent;
  let nextIntentEvidence = [...intentEvidence];
  let nextDecisionTarget = decisionTarget;
  let nextDecisionEvidence = [...decisionEvidence];

  if (intent !== "selection") {
    nextIntent = "selection";
    nextIntentEvidence = mergeUniqueEvidence(
      optionFitFrame.evidence,
      intentEvidence,
    );
  }

  // none도 generic과 같이 choose로 승격한다.
  // specific action(changeJob/buy/marry/…)은 절대 덮지 않는다.
  if (
    decisionTarget === "none"
    || GENERIC_ACTION_DECISION_TARGETS.has(decisionTarget)
  ) {
    if (decisionTarget !== "choose") {
      nextDecisionTarget = "choose";
      nextDecisionEvidence = mergeUniqueEvidence(
        optionFitFrame.evidence,
        decisionEvidence,
      );
    }
  }

  if (
    nextIntent === intent
    && nextDecisionTarget === decisionTarget
  ) {
    return null;
  }

  return {
    intent: nextIntent,
    intentEvidence: nextIntentEvidence,
    decisionTarget: nextDecisionTarget,
    decisionEvidence: nextDecisionEvidence,
  };
}

/**
 * J-4-8: permission surface ↔ action-nature 의미 정규화.
 *
 * "해도 될까요?" 같은 permission frame이
 * continuation / termination 같은 행위 의미와 함께 있을 때
 * intent를 possibility로만 고정하지 않고 action 의미를 보존한다.
 *
 * 적용 조건 (모두 필요):
 * - 현재 intent가 possibility
 * - 강한 permission frame
 * - 강한 continuation 또는 termination frame
 * - decisionTarget이 그 action-nature와 정렬됨
 *   (continuation → continue,
 *    termination → stop 또는 termination-specific)
 *
 * 보호:
 * - prediction / option-fit frame이 있으면 개입하지 않음
 * - permission만 있거나 action DT 정렬이 없으면 possibility 유지
 * - changeJob/move/start 등 다른 specific action은 덮지 않음
 * - decisionTarget 자체는 변경하지 않음
 */
function normalizePermissionActionNatureMeaning(
  intent: ReaderIntentLiteral,
  intentEvidence: readonly string[],
  decisionTarget: DecisionTarget,
  candidates: MeaningCandidateSet,
): {
  intent: ReaderIntentLiteral;
  intentEvidence: string[];
} | null {
  if (intent !== "possibility") {
    return null;
  }

  const predictionFrame = hasFrame(
    candidates.frames,
    "futureOutcomePrediction",
  );

  if (predictionFrame) {
    return null;
  }

  const optionFitFrame = hasFrame(
    candidates.frames,
    "comparisonOrOptionFit",
  );

  // J-4-7: option-fit이 강하면 이 단계에서 가로채지 않는다.
  if (optionFitFrame && optionFitFrame.strength >= 1) {
    return null;
  }

  const permissionFrame = hasFrame(
    candidates.frames,
    "permissionOrFeasibility",
  );

  if (!permissionFrame || permissionFrame.strength < 1) {
    return null;
  }

  const continuationFrame = hasFrame(candidates.frames, "continuation");
  const terminationFrame = hasFrame(candidates.frames, "termination");

  const continuationStrong =
    !!continuationFrame && continuationFrame.strength >= 1;
  const terminationStrong =
    !!terminationFrame && terminationFrame.strength >= 1;

  // permission surface만 있고 action-nature 증거가 없으면 possibility 유지.
  if (!continuationStrong && !terminationStrong) {
    return null;
  }

  const continuationAligned = decisionTarget === "continue";
  const terminationAligned =
    decisionTarget === "stop"
    || TERMINATION_SPECIFIC_DECISION_TARGETS.includes(decisionTarget);

  let actionIntent: "continuation" | "termination";
  let actionFrameEvidence: readonly string[];

  // J-4-3-2와 동일: strength가 큰 쪽, 동률이면 termination 우선.
  // 다만 decisionTarget이 해당 action-nature와 맞을 때만 보존한다.
  if (continuationStrong && terminationStrong) {
    if (
      continuationFrame
      && terminationFrame
      && continuationFrame.strength > terminationFrame.strength
      && continuationAligned
    ) {
      actionIntent = "continuation";
      actionFrameEvidence = continuationFrame.evidence;
    } else if (terminationFrame && terminationAligned) {
      actionIntent = "termination";
      actionFrameEvidence = terminationFrame.evidence;
    } else if (continuationFrame && continuationAligned) {
      actionIntent = "continuation";
      actionFrameEvidence = continuationFrame.evidence;
    } else {
      return null;
    }
  } else if (continuationStrong && continuationFrame && continuationAligned) {
    actionIntent = "continuation";
    actionFrameEvidence = continuationFrame.evidence;
  } else if (terminationStrong && terminationFrame && terminationAligned) {
    actionIntent = "termination";
    actionFrameEvidence = terminationFrame.evidence;
  } else {
    return null;
  }

  const actionIntentCandidate = findIntentCandidate(
    candidates.intents,
    actionIntent,
  );

  return {
    intent: actionIntent,
    intentEvidence: mergeUniqueEvidence(
      actionFrameEvidence,
      actionIntentCandidate?.evidence ?? [],
      intentEvidence,
    ),
  };
}

/**
 * lifeFlow topic rule에 섞인 시간 surface marker.
 * timing intent 신호로도 쓰이므로, 이것만으로 lifeFlow topic을
 * 확정하면 lifeDirection paraphrase가 갈라진다.
 */
const LIFE_FLOW_TEMPORAL_SURFACE_MARKERS: ReadonlySet<string> = new Set([
  "언제",
  "올해",
  "내년",
  "앞으로",
  "시기",
]);

/**
 * 실제 운의 흐름·해석을 가리키는 lifeFlow 고유 marker.
 * 이 증거가 있으면 temporal demotion을 적용하지 않는다.
 */
const LIFE_FLOW_FORTUNE_MARKERS: ReadonlySet<string> = new Set([
  "대운",
  "세운",
  "운세",
  "흐름",
]);

/**
 * 삶의 방향/선택/전환 의미 surface.
 * lifeDirection keyword hit가 없어도, temporal-only lifeFlow를
 * 방향 축으로 읽을 수 있는 공통 신호다.
 * (특정 fixture 문장을 검사하지 않는다.)
 */
function hasLifeDirectionChoiceOrTransitionSignal(
  question: string,
): boolean {
  if (hasLifeDirectionCompoundSignal(question)) {
    return true;
  }

  // metaphorical path: 길 + 선택/유지/전환 계열
  if (
    /(?:안정|도전|새로운|어떤)\s*(?:적(?:인|)?\s*)?길/.test(question)
    || /길(?:을|로)?.*(?:선택|유지|바꿀|고민)/.test(question)
    || /(?:유지|선택|바꿀|고민).*길/.test(question)
    || /길\s*중\s*어느/.test(question)
  ) {
    return true;
  }

  // 삶의 전환 timing: 새로운 시작 + (언제는 lifeFlow evidence로 별도 확인)
  if (/새로운\s*시작/.test(question)) {
    return true;
  }

  return false;
}

/**
 * J-4-10: 대인 갈등 대응 soft semantic frame.
 * hard keyword(갈등/분쟁/소송…)가 없어도,
 * 관계 마찰 + 대응/해소 구조면 respondToConflict 후보로 올린다.
 * 특정 단어 하나를 decisionRules에 추가하지 않는다.
 */
function hasInterpersonalConflictResponseSoftSignal(
  question: string,
): boolean {
  if (
    /(?:갈등|분쟁|다툼|싸움|마찰|오해).*(?:대응|해결|화해|풀)/.test(question)
    || /(?:대응|해결|화해|풀).*(?:갈등|분쟁|다툼|싸움|마찰|오해)/.test(question)
  ) {
    return true;
  }

  // "사람 사이 … 풀/해결"처럼 관계 공간 + 해소 행위
  if (
    /(?:사람|친구|동료|연인|관계).*(?:사이|간).*(?:풀|해결|화해|대응)/.test(
      question,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * J-4-10: 사업 fit/recommendation soft frame.
 * "어떤 사업이 맞을까"류는 start 실행이 아니라 적합 추천 대상이다.
 */
function hasBusinessFitRecommendationSoftSignal(
  question: string,
): boolean {
  return (
    /(?:어떤|무엇|어느).*(?:사업|창업|아이템|장사|가게).*(?:맞|어울|추천|적합)/.test(
      question,
    )
    || /(?:성향|적성).*(?:맞|어울).*(?:사업|창업|아이템)/.test(question)
    || /(?:맞는|어울리는).*(?:사업|창업|아이템)/.test(question)
    || /(?:사업|창업|아이템).*(?:중).*(?:맞|어울)/.test(question)
  );
}

/**
 * A-2: 평가형 명사구 "맞는 선택인지" soft signal.
 * 전역 "선택" keyword 의미를 바꾸지 않는다.
 * selection surface만 generalJudgement로 좁게 demote하기 위한 신호다.
 */
function hasCorrectChoiceJudgementSoftSignal(
  question: string,
): boolean {
  return /맞는\s*선택/.test(question) || /선택이\s*맞/.test(question);
}

/**
 * J-4-10: 삶의 경로 양자택일(할지…할지 / 중 어느) 구조.
 * option-fit marker가 없어도 binary alternative면 choose 후보다.
 */
function hasBinaryLifePathAlternativeStructure(
  question: string,
): boolean {
  if (
    /할지[\s\S]*할지/.test(question)
    // "유지할지 … 바꿀지/갈지"처럼 두 번째 항이 ~지 인 경우
    || /할지[\s\S]{0,48}?(?:바꿀지|갈지|말지|될지|줄지|옮길지|시작할지)/.test(
      question,
    )
    || /중\s*(?:어느|무엇|어떤)/.test(question)
    || /(?:둘|두)\s*중/.test(question)
  ) {
    return true;
  }

  // "A와/과 B 중" 비교 선택
  if (/(?:와|과)\s*[^.?!]{0,24}중\s*(?:어느|무엇|어떤|뭐)/.test(question)) {
    return true;
  }

  return false;
}

/**
 * P8-6: 일반 도메인 exclusive binary (A지 … B지/B까요).
 *
 * 이미 수집된 exclusive_alt relation만 재사용한다.
 * - participant DT가 2개 이상이고
 * - connectorEvidence에 숙고형 ~지/~까요 arm이 2개 이상일 때만 true
 *
 * 보호:
 * - "할지" 단독 / WH+할지 / 단일 고민 → exclusive_alt 자체가 없음
 * - 단독 "~까요" → 첫 arm "~지" 미충족으로 exclusive_alt 자체가 없음
 * - "중 어느/둘 중" only (lifePathBinaryAlternative만 있고 ~지/~까요 arm 없음)
 *   → J-4-7 specific 보호 경로를 건드리지 않음
 */
function hasGeneralBinaryAlternativeStructure(
  candidates: MeaningCandidateSet,
): boolean {
  const exclusive = candidates.actionRelations.find(
    (relation) =>
      relation.kind === "exclusive_alt"
      && relation.participants.length >= 2,
  );

  if (!exclusive) {
    return false;
  }

  const deliberativeArms = exclusive.connectorEvidence.filter(
    (item) =>
      item !== "고민"
      && item !== "lifePathBinaryAlternative"
      && /(?:지|까요)/.test(item),
  );

  return deliberativeArms.length >= 2;
}

/**
 * J-4-10: decisionTarget(=object.label) 의미축 정규화.
 *
 * object.label은 adapter에서 decisionTarget passthrough이므로
 * 여기서 canonical decisionTarget만 안정화한다.
 * intent / topic은 변경하지 않는다.
 *
 * 보호:
 * - option-fit + specific action 유지 (J-4-7)
 * - permission/action-nature 정책 (J-4-8)
 * - 이미 강한 specific(sell/buy/changeJob/…)은 soft frame이 덮지 않음
 */
function normalizeDecisionTargetSemanticMeaning(
  question: string,
  topic: QuestionTopic,
  intent: ReaderIntentLiteral,
  decisionTarget: DecisionTarget,
  decisionEvidence: readonly string[],
  candidates: MeaningCandidateSet,
): {
  decisionTarget: DecisionTarget;
  decisionEvidence: string[];
} | null {
  const optionFitFrame = hasFrame(
    candidates.frames,
    "comparisonOrOptionFit",
  );
  const optionFitStrong = !!optionFitFrame && optionFitFrame.strength >= 1;

  // A) relationship method + conflict-response soft frame → respondToConflict
  if (
    decisionTarget === "none"
    && intent === "method"
    && (
      topic === "relationship"
      || topic === "love"
      || topic === "family"
    )
    && hasInterpersonalConflictResponseSoftSignal(question)
  ) {
    return {
      decisionTarget: "respondToConflict",
      decisionEvidence: mergeUniqueEvidence(
        ["conflictResponseSoftFrame"],
        decisionEvidence,
      ),
    };
  }

  // A2) love + permission("해도 괜찮") + start 후보 없음 → start
  //     start rule은 "해도 될까"만 보고 "해도 괜찮"은 놓친다.
  //     permission frame 전체 → decisionTarget 자동 생성은 하지 않는다.
  if (
    decisionTarget === "none"
    && intent === "possibility"
    && topic === "love"
    && !findDecisionTargetCandidate(candidates.decisionTargets, "start")
    && (
      matchesKoreanKeyword(question, "해도 괜찮")
      || matchesKoreanKeyword(question, "해도괜찮")
    )
  ) {
    return {
      decisionTarget: "start",
      decisionEvidence: mergeUniqueEvidence(
        ["lovePermissionOkStartSoftPromotion"],
        decisionEvidence,
      ),
    };
  }

  // B) business fit/recommendation에서 start 명사 가로채기 → none
  //    실제 start 실행 질문(permission/시작해도)은 soft signal에 안 걸린다.
  //    option-fit + specific 유지는, fit soft frame이 없을 때만 적용된다.
  if (
    decisionTarget === "start"
    && topic === "business"
    && hasBusinessFitRecommendationSoftSignal(question)
  ) {
    return {
      decisionTarget: "none",
      decisionEvidence: mergeUniqueEvidence(
        ["businessFitRecommendationSoftFrame"],
        decisionEvidence,
      ),
    };
  }

  const lifeDirectionTopic = topic === "lifeDirection";
  const lifePathSignal = hasLifeDirectionChoiceOrTransitionSignal(question);
  const confirmDirectionCandidate = findDecisionTargetCandidate(
    candidates.decisionTargets,
    "confirmDirection",
  );

  // C) lifeDirection: confirmDirection 후보가 있으면
  //    choose/generic 보다 방향 확정을 우선한다.
  if (
    (lifeDirectionTopic || lifePathSignal)
    && confirmDirectionCandidate
    && (
      decisionTarget === "choose"
      || decisionTarget === "none"
      || GENERIC_ACTION_DECISION_TARGETS.has(decisionTarget)
    )
  ) {
    // 명시적 binary option-fit(중 어느/둘 중)이 강하면 selection/choose 유지
    if (!(optionFitStrong && decisionTarget === "choose")) {
      return {
        decisionTarget: "confirmDirection",
        decisionEvidence: mergeUniqueEvidence(
          confirmDirectionCandidate.evidence,
          ["lifeDirectionConfirmOverGeneric"],
          decisionEvidence,
        ),
      };
    }
  }

  // C2) lifeDirection compound+전환 + generic/action/none → confirmDirection
  //     confirmDirection 후보(방향/…)가 없어도 인생·삶 전환 축을 유지한다.
  //     strong option-fit choose는 승격하지 않는다.
  if (
    (lifeDirectionTopic || lifePathSignal)
    && hasLifeDirectionCompoundSignal(question)
    && matchesKoreanKeyword(question, "전환")
    && (
      decisionTarget === "choose"
      || decisionTarget === "none"
      || GENERIC_ACTION_DECISION_TARGETS.has(decisionTarget)
    )
    && !(optionFitStrong && decisionTarget === "choose")
  ) {
    return {
      decisionTarget: "confirmDirection",
      decisionEvidence: mergeUniqueEvidence(
        ["lifeDirectionCompoundTransitionOverGeneric"],
        decisionEvidence,
      ),
    };
  }

  // D) life path + binary alternative에서 generic action → choose
  //    (유지할지/바꿀지 같은 paraphrase가 continue로 갈라지지 않게)
  if (
    (lifeDirectionTopic || lifePathSignal)
    && GENERIC_ACTION_DECISION_TARGETS.has(decisionTarget)
    && hasBinaryLifePathAlternativeStructure(question)
  ) {
    return {
      decisionTarget: "choose",
      decisionEvidence: mergeUniqueEvidence(
        ["lifePathBinaryAlternative"],
        decisionEvidence,
      ),
    };
  }

  // D2) P8-6: 일반 도메인 exclusive binary (A지…B지).
  //     단일 action DT가 binary 전체를 대표하지 못할 때만 choose.
  //     "중 어느/둘 중" only(지 arm 없음)는 J-4-7 specific 보호 유지.
  //     할지 단독 / WH+할지는 exclusive_alt 미형성으로 여기 진입하지 않는다.
  //
  // P11-7-2I-10: business keep-alive continue / negated-continue stop는
  // "이어가지"/"스톨시키지" 형태소 ~지 가짜 exclusive_alt에 덮이지 않는다.
  // Intent(selection)는 바꾸지 않고 concrete DT만 보호한다.
  if (
    decisionTarget !== "choose"
    && hasGeneralBinaryAlternativeStructure(candidates)
    && !isBusinessKeepAliveOrNegatedContinueProtectedFromExclusiveAltChoose(
      topic,
      decisionTarget,
      decisionEvidence,
    )
  ) {
    return {
      decisionTarget: "choose",
      decisionEvidence: mergeUniqueEvidence(
        ["generalBinaryAlternative"],
        decisionEvidence,
      ),
    };
  }

  // D3) P10-C F: cash-holding exclusive alternative → choose.
  //     wait 후보 인식만으로 scalar invest에 고정되지 않게 한다.
  //     단순 보유 질문·일반 exclusive(P8-6)와 분리한다.
  if (
    decisionTarget !== "choose"
    && hasCashHoldingExclusiveAlternativeParticipants(question, candidates)
  ) {
    return {
      decisionTarget: "choose",
      decisionEvidence: mergeUniqueEvidence(
        ["cashHoldingExclusiveAlternative"],
        decisionEvidence,
      ),
    };
  }

  // E) lifeDirection/path에서 bare choose(옵션 비교 frame 없음)
  //    → confirmDirection (열린 방향 확정)
  if (
    (lifeDirectionTopic || lifePathSignal)
    && decisionTarget === "choose"
    && !optionFitStrong
  ) {
    return {
      decisionTarget: "confirmDirection",
      decisionEvidence: mergeUniqueEvidence(
        ["lifeDirectionConfirmOverBareChoose"],
        decisionEvidence,
      ),
    };
  }

  return null;
}

/**
 * J-4-9: lifeFlow ↔ lifeDirection topic 의미축 정규화.
 *
 * Phase 1은 rule 배열 순서상 lifeFlow(언제/앞으로/…)가
 * lifeDirection(선택/방향/…)보다 먼저라서,
 * 같은 "삶의 방향/전환" 질문이 표현만 바꾸면 lifeFlow로 갈라진다.
 *
 * - lifeFlow 증거가 시간 surface only 이고
 * - lifeDirection 후보가 있거나 방향/선택/전환 신호가 있으면
 *   canonical topic을 lifeDirection으로 수렴한다.
 * - 대운/세운/운세/흐름 등 fortune 증거가 있으면 lifeFlow를 유지한다.
 *
 * intent / decisionTarget은 변경하지 않는다.
 */
function normalizeLifeFlowVersusLifeDirectionTopic(
  question: string,
  topic: QuestionTopic,
  topicEvidence: readonly string[],
  candidates: MeaningCandidateSet,
): {
  topic: QuestionTopic;
  topicEvidence: string[];
} | null {
  if (topic !== "lifeFlow") {
    return null;
  }

  const lifeFlowCandidate = candidates.topics.find(
    (candidate) => candidate.value === "lifeFlow",
  );
  const evidence = lifeFlowCandidate?.evidence ?? topicEvidence;

  if (evidence.length === 0) {
    return null;
  }

  if (evidence.some((item) => LIFE_FLOW_FORTUNE_MARKERS.has(item))) {
    return null;
  }

  if (
    !evidence.every((item) => LIFE_FLOW_TEMPORAL_SURFACE_MARKERS.has(item))
  ) {
    return null;
  }

  const lifeDirectionCandidate = candidates.topics.find(
    (candidate) => candidate.value === "lifeDirection",
  );

  if (lifeDirectionCandidate) {
    return {
      topic: "lifeDirection",
      topicEvidence: lifeDirectionCandidate.evidence,
    };
  }

  if (!hasLifeDirectionChoiceOrTransitionSignal(question)) {
    return null;
  }

  return {
    topic: "lifeDirection",
    topicEvidence: [
      ...evidence,
      "lifeDirectionOverTemporalLifeFlow",
    ],
  };
}

/**
 * J-4-13: Topic semantic evidence coverage.
 *
 * Phase 1 topicRules는 명사 surface first-match라서,
 * 같은 의미(현금흐름 관리 / 주거 이전)가 paraphrase에서
 * general로 갈라질 수 있다.
 *
 * 이미 수집된 topic×decisionTarget compound 후보만 재사용한다.
 * - money × manageMoney (cashflow noun + manage verb)
 * - realEstate × move (property noun + relocation verb)
 *
 * 보호:
 * - generic topic이 아닐 때는 개입하지 않음 (specific 유지)
 * - compound 증거가 있을 때만 승격
 * - intent / decisionTarget은 변경하지 않음
 *   (DT는 J-4-4 compound pair / 기존 resolve 경로가 담당)
 */
function normalizeTopicSemanticEvidenceCoverage(
  topic: QuestionTopic,
  topicEvidence: readonly string[],
  candidates: MeaningCandidateSet,
): {
  topic: QuestionTopic;
  topicEvidence: string[];
} | null {
  if (topic !== "general") {
    return null;
  }

  const moneyManageCompound = candidates.topicDecisionCompounds.find(
    (compound) =>
      compound.topic === "money"
      && compound.decisionTarget === "manageMoney",
  );

  if (moneyManageCompound) {
    const moneyTopicCandidate = candidates.topics.find(
      (candidate) => candidate.value === "money",
    );

    return {
      topic: "money",
      topicEvidence: mergeUniqueEvidence(
        moneyManageCompound.topicEvidence,
        moneyTopicCandidate?.evidence ?? [],
        topicEvidence,
        ["topicSemanticMoneyManageCompound"],
      ),
    };
  }

  const realEstateMoveCompound = candidates.topicDecisionCompounds.find(
    (compound) =>
      compound.topic === "realEstate"
      && compound.decisionTarget === "move",
  );

  if (realEstateMoveCompound) {
    const realEstateTopicCandidate = candidates.topics.find(
      (candidate) => candidate.value === "realEstate",
    );

    return {
      topic: "realEstate",
      topicEvidence: mergeUniqueEvidence(
        realEstateMoveCompound.topicEvidence,
        realEstateTopicCandidate?.evidence ?? [],
        topicEvidence,
        ["topicSemanticRealEstateMoveCompound"],
      ),
    };
  }

  return null;
}

/**
 * J-4-11: Intent semantic normalization.
 *
 * 같은 의미인데 surface/frame 표현 차이로 intent만 갈라지는 경우를
 * 기존 enum 안에서 canonical intent로 수렴시킨다.
 * topic / decisionTarget은 변경하지 않는다.
 *
 * 우선순위 (기존 normalizeAxes 정책과 충돌 시 candidate evidence 존중):
 * 1. prediction 보호 (개입 안 함)
 * 2. strong option-fit / binary life-path choose → selection
 * 3. strong permission + termination-specific action → termination (J-4-8 정렬)
 * 4. business fit/recommendation soft frame → possibility
 * 5. compatibility quality assessment soft frame → possibility
 * 6. lifeDirection confirmDirection + method/selection surface → generalJudgement
 * 7. evaluation-noun "맞는 선택인지" selection → generalJudgement
 *
 * 보호:
 * - J-4-7 option-fit selection canonicalization
 * - J-4-8 permission/action-nature (frame 기반) 이후 보완만 수행
 * - specific action DT를 generic intent로 되돌리지 않음
 * - permission 없는 질문을 possibility로 만들지 않음
 * - bare 궁합 / 열린 해석(어떤가요) / 궁합 없는 interpersonal fit은 유지
 * - option-fit / binary / cash-holding exclusive selection은 유지
 */
function normalizeIntentSemanticMeaning(
  question: string,
  topic: QuestionTopic,
  intent: ReaderIntentLiteral,
  intentEvidence: readonly string[],
  decisionTarget: DecisionTarget,
  candidates: MeaningCandidateSet,
): {
  intent: ReaderIntentLiteral;
  intentEvidence: string[];
} | null {
  const predictionFrame = hasFrame(
    candidates.frames,
    "futureOutcomePrediction",
  );

  if (predictionFrame) {
    return null;
  }

  const optionFitFrame = hasFrame(
    candidates.frames,
    "comparisonOrOptionFit",
  );
  const optionFitStrong =
    !!optionFitFrame && optionFitFrame.strength >= 1;
  const lifeDirectionTopic = topic === "lifeDirection";
  const lifePathSignal = hasLifeDirectionChoiceOrTransitionSignal(question);
  const binaryLifePath = hasBinaryLifePathAlternativeStructure(question);
  const generalBinary = hasGeneralBinaryAlternativeStructure(candidates);
  const cashHoldingExclusive = hasCashHoldingExclusiveAlternativeParticipants(
    question,
    candidates,
  );

  // 2) life-path / option-fit / general exclusive binary choose에서
  //    유지/정리 같은 action surface가 continuation/termination으로
  //    갈라지지 않게 selection으로 수렴한다.
  //    (J-4-7은 option-fit frame이 있을 때만 처리; binary-only gap 보완)
  //    P8-6: lifeDirection이 아닌 일반 도메인 A지…B지도 동일 수렴.
  //    P8-9: buy/wait처럼 continuation·termination surface가 없는
  //    exclusive binary도 generalJudgement → selection.
  //    P10-C F: cash-holding exclusive choose도 selection으로 수렴.
  if (
    decisionTarget === "choose"
    && (
      intent === "continuation"
      || intent === "termination"
      || intent === "generalJudgement"
    )
    && (
      generalBinary
      || cashHoldingExclusive
      || (
        (optionFitStrong || binaryLifePath)
        && (lifeDirectionTopic || lifePathSignal)
      )
    )
  ) {
    const selectionCandidate = findIntentCandidate(
      candidates.intents,
      "selection",
    );

    return {
      intent: "selection",
      intentEvidence: mergeUniqueEvidence(
        optionFitFrame?.evidence
          ?? (generalBinary
            ? ["generalBinaryAlternative"]
            : cashHoldingExclusive
            ? ["cashHoldingExclusiveAlternative"]
            : ["lifePathBinaryAlternative"]),
        selectionCandidate?.evidence ?? [],
        intentEvidence,
        [
          generalBinary
            ? "intentSemanticGeneralBinarySelection"
            : cashHoldingExclusive
            ? "intentSemanticCashHoldingExclusiveSelection"
            : "intentSemanticLifePathSelection",
        ],
      ),
    };
  }

  // 3) permission + termination-specific action (sell/leaveJob/separate)
  //    J-4-8은 termination keyword frame이 있을 때만 복원한다.
  //    "팔아도 될까요?"처럼 동사 활용만 있고 frame keyword(매도/정리)가
  //    없으면 possibility로 남으므로, 이미 정렬된 DT를 action-nature 증거로 쓴다.
  if (intent === "possibility") {
    const permissionFrame = hasFrame(
      candidates.frames,
      "permissionOrFeasibility",
    );

    if (
      permissionFrame
      && permissionFrame.strength >= 1
      && !optionFitStrong
      && TERMINATION_SPECIFIC_DECISION_TARGETS.includes(decisionTarget)
    ) {
      const terminationCandidate = findIntentCandidate(
        candidates.intents,
        "termination",
      );

      return {
        intent: "termination",
        intentEvidence: mergeUniqueEvidence(
          permissionFrame.evidence,
          terminationCandidate?.evidence ?? [],
          intentEvidence,
          ["intentSemanticPermissionTerminationAction"],
        ),
      };
    }
  }

  // 4) business fit/recommendation soft frame
  //    "무엇이 맞는가" 적합 판단이 generalJudgement/selection/comparison으로
  //    갈라지지 않게 possibility로 수렴한다.
  //    강한 option-fit(중 어느/둘 중)은 J-4-7 selection을 유지한다.
  if (
    !optionFitStrong
    && hasBusinessFitRecommendationSoftSignal(question)
    && (
      intent === "generalJudgement"
      || intent === "selection"
      || intent === "comparison"
    )
  ) {
    const possibilityCandidate = findIntentCandidate(
      candidates.intents,
      "possibility",
    );

    return {
      intent: "possibility",
      intentEvidence: mergeUniqueEvidence(
        ["businessFitRecommendationSoftFrame"],
        possibilityCandidate?.evidence ?? [],
        intentEvidence,
        ["intentSemanticBusinessFit"],
      ),
    };
  }

  // 5) compatibility quality assessment soft frame
  //    궁합 명시 + 맞음/좋음 판단이면 surface "맞을까"에만 의존하지 않고
  //    possibility로 수렴한다. topic/decisionTarget은 변경하지 않는다.
  //    bare 궁합·열린 해석(어떤가요)·궁합 없는 interpersonal fit은 유지한다.
  if (
    !optionFitStrong
    && intent === "generalJudgement"
    && hasCompatibilityQualityAssessmentSoftSignal(question)
  ) {
    const possibilityCandidate = findIntentCandidate(
      candidates.intents,
      "possibility",
    );

    return {
      intent: "possibility",
      intentEvidence: mergeUniqueEvidence(
        ["compatibilityQualityAssessmentSoftFrame"],
        possibilityCandidate?.evidence ?? [],
        intentEvidence,
        ["intentSemanticCompatibilityQuality"],
      ),
    };
  }

  // 6) lifeDirection confirmDirection:
  //    "어떻게/선택" surface가 method/selection으로 갈라지지 않게
  //    열린 방향 판단(generalJudgement)으로 수렴한다.
  if (
    (lifeDirectionTopic || lifePathSignal)
    && decisionTarget === "confirmDirection"
    && !optionFitStrong
    && (
      intent === "method"
      || intent === "selection"
      || intent === "comparison"
    )
  ) {
    return {
      intent: "generalJudgement",
      intentEvidence: mergeUniqueEvidence(
        intentEvidence,
        ["intentSemanticLifeDirectionConfirm"],
      ),
    };
  }

  // 7) evaluation-noun "맞는 선택인지":
  //    selection surface가 실제 옵션 고르기로 고정되지 않게
  //    generalJudgement로 좁게 demote한다.
  //    강한 option-fit / binary / cash-holding exclusive는 selection을 유지한다.
  if (
    intent === "selection"
    && !optionFitStrong
    && !binaryLifePath
    && !generalBinary
    && !cashHoldingExclusive
    && hasCorrectChoiceJudgementSoftSignal(question)
  ) {
    return {
      intent: "generalJudgement",
      intentEvidence: mergeUniqueEvidence(
        intentEvidence,
        ["intentSemanticCorrectChoiceJudgement"],
      ),
    };
  }

  return null;
}

/**
 * I-27 / I-31: action-nature + aligned DecisionTarget 위에서
 * strong method/risk speech-act만 Intent로 보존한다.
 *
 * 정렬:
 * - continuation → continue
 * - termination → stop | leaveJob
 *
 * Phase 1이 continuation/termination을 method/risk보다 먼저 고르더라도
 * DecisionTarget은 유지하고 QuestionIntent만 method|risk로 되돌린다.
 * continuation/termination을 전역적으로 뒤로 보내지 않는다.
 *
 * 보호:
 * - prediction / option-fit / strong selection frame
 * - strong marker 없는 permission+action (J-4-8)
 * - method/risk-only (DT가 action-nature 정렬이 아님)
 * - start / changeJob 등 다른 DT 경로
 * - weak method("하면 좋을까") / weak risk("문제"|"실패"|"손해"|"망할")
 */
const STRONG_METHOD_SPEECH_ACT_MARKERS = [
  "방법",
  "어떻게",
  "전략",
] as const;

const STRONG_RISK_SPEECH_ACT_MARKERS = [
  "위험",
  "주의할",
  "주의해야",
  "주의할 점",
  "주의사항",
  "주의점",
  "조심",
] as const;

function evidenceHasStrongSpeechActMarker(
  evidence: readonly string[],
  markers: readonly string[],
): boolean {
  return evidence.some((item) =>
    markers.some((marker) => item === marker || item.includes(marker))
  );
}

function isActionNatureSpeechActAligned(
  intent: ReaderIntentLiteral,
  decisionTarget: DecisionTarget,
): boolean {
  if (intent === "continuation" && decisionTarget === "continue") {
    return true;
  }

  if (
    intent === "termination"
    && (decisionTarget === "stop" || decisionTarget === "leaveJob")
  ) {
    return true;
  }

  return false;
}

function findStrongActionNatureSpeechActPreservation(
  intent: ReaderIntentLiteral,
  intentEvidence: readonly string[],
  decisionTarget: DecisionTarget,
  candidates: MeaningCandidateSet,
): {
  intent: "method" | "risk";
  intentEvidence: string[];
} | null {
  if (!isActionNatureSpeechActAligned(intent, decisionTarget)) {
    return null;
  }

  const predictionFrame = hasFrame(
    candidates.frames,
    "futureOutcomePrediction",
  );

  if (predictionFrame) {
    return null;
  }

  const optionFitFrame = hasFrame(
    candidates.frames,
    "comparisonOrOptionFit",
  );
  const optionFitStrong =
    !!optionFitFrame && optionFitFrame.strength >= 1;

  // option-fit = strong selection/comparison frame family
  if (optionFitStrong) {
    return null;
  }

  const methodCandidate = findIntentCandidate(
    candidates.intents,
    "method",
  );
  const riskCandidate = findIntentCandidate(
    candidates.intents,
    "risk",
  );

  const methodStrong =
    !!methodCandidate
    && evidenceHasStrongSpeechActMarker(
      methodCandidate.evidence,
      STRONG_METHOD_SPEECH_ACT_MARKERS,
    );
  const riskStrong =
    !!riskCandidate
    && evidenceHasStrongSpeechActMarker(
      riskCandidate.evidence,
      STRONG_RISK_SPEECH_ACT_MARKERS,
    );

  if (!methodStrong && !riskStrong) {
    return null;
  }

  // 둘 다 strong이면 intentRules 순서(risk < method)를 존중한다.
  if (riskStrong && methodStrong && riskCandidate && methodCandidate) {
    const selected =
      riskCandidate.priority <= methodCandidate.priority
        ? riskCandidate
        : methodCandidate;

    return {
      intent: selected.value as "method" | "risk",
      intentEvidence: mergeUniqueEvidence(
        selected.evidence,
        intentEvidence,
        ["actionNatureSpeechActPreservation"],
      ),
    };
  }

  if (riskStrong && riskCandidate) {
    return {
      intent: "risk",
      intentEvidence: mergeUniqueEvidence(
        riskCandidate.evidence,
        intentEvidence,
        ["actionNatureSpeechActPreservation"],
      ),
    };
  }

  if (methodStrong && methodCandidate) {
    return {
      intent: "method",
      intentEvidence: mergeUniqueEvidence(
        methodCandidate.evidence,
        intentEvidence,
        ["actionNatureSpeechActPreservation"],
      ),
    };
  }

  return null;
}

/**
 * F: reason|timing additive secondary hijack 위에서
 * strong method/risk speech-act Intent만 복원한다.
 *
 * 적용 순서:
 * 1) 기존 intent priority 기본값 유지
 * 2) I-27 / I-31 preservation 먼저
 * 3) 그 이후 current intent가 reason|timing일 때만 검토
 *
 * 게이트:
 * - strong method 또는 strong risk candidate 존재
 * - hijacker 쪽에 명확한 additive secondary evidence
 *   ("그 이유도" / "시작 시기도" 등)
 *
 * 비대상:
 * - bare X와/과 Y (coordinated)
 * - modifier / sentence order / 단순 candidate 공존
 * - method + risk 상호 override
 * - I-61 DecisionTarget hijack / I-60 timingType leakage
 *
 * DecisionTarget은 절대 변경하지 않는다.
 * Intent만 reason|timing → method|risk 로 복원한다.
 */
const ADDITIVE_REASON_HIJACKER_PATTERN =
  /그\s*이유\s*도|이유도|그\s*원인\s*도|원인도/;

const ADDITIVE_TIMING_HIJACKER_PATTERN =
  /시작\s*시기\s*도|시기도|그\s*시기\s*도|언제인지도/;

function hasAdditiveReasonHijackerEvidence(
  question: string,
): boolean {
  return ADDITIVE_REASON_HIJACKER_PATTERN.test(question);
}

function hasAdditiveTimingHijackerEvidence(
  question: string,
): boolean {
  return ADDITIVE_TIMING_HIJACKER_PATTERN.test(question);
}

function findAdditiveReasonTimingSpeechActPreservation(
  question: string,
  intent: ReaderIntentLiteral,
  intentEvidence: readonly string[],
  candidates: MeaningCandidateSet,
): {
  intent: "method" | "risk";
  intentEvidence: string[];
} | null {
  if (intent !== "reason" && intent !== "timing") {
    return null;
  }

  const additiveOnHijacker =
    intent === "reason"
      ? hasAdditiveReasonHijackerEvidence(question)
      : hasAdditiveTimingHijackerEvidence(question);

  if (!additiveOnHijacker) {
    return null;
  }

  const methodCandidate = findIntentCandidate(
    candidates.intents,
    "method",
  );
  const riskCandidate = findIntentCandidate(
    candidates.intents,
    "risk",
  );

  const methodStrong =
    !!methodCandidate
    && evidenceHasStrongSpeechActMarker(
      methodCandidate.evidence,
      STRONG_METHOD_SPEECH_ACT_MARKERS,
    );
  const riskStrong =
    !!riskCandidate
    && evidenceHasStrongSpeechActMarker(
      riskCandidate.evidence,
      STRONG_RISK_SPEECH_ACT_MARKERS,
    );

  if (!methodStrong && !riskStrong) {
    return null;
  }

  // 둘 다 strong이면 intentRules 순서(risk < method)를 존중한다.
  // method↔risk 상호 override는 하지 않고, 기존 priority만 따른다.
  if (riskStrong && methodStrong && riskCandidate && methodCandidate) {
    const selected =
      riskCandidate.priority <= methodCandidate.priority
        ? riskCandidate
        : methodCandidate;

    return {
      intent: selected.value as "method" | "risk",
      intentEvidence: mergeUniqueEvidence(
        selected.evidence,
        intentEvidence,
        ["additiveReasonTimingSpeechActPreservation"],
      ),
    };
  }

  if (riskStrong && riskCandidate) {
    return {
      intent: "risk",
      intentEvidence: mergeUniqueEvidence(
        riskCandidate.evidence,
        intentEvidence,
        ["additiveReasonTimingSpeechActPreservation"],
      ),
    };
  }

  if (methodStrong && methodCandidate) {
    return {
      intent: "method",
      intentEvidence: mergeUniqueEvidence(
        methodCandidate.evidence,
        intentEvidence,
        ["additiveReasonTimingSpeechActPreservation"],
      ),
    };
  }

  return null;
}

/**
 * J-2 + J-4-1 + J-4-2 + J-4-3-1 + J-4-3-2 + J-4-4 + J-4-5-1 + J-4-7 + J-4-8 + J-4-9 + J-4-10 + J-4-11 + J-4-13:
 * 후보 집합에서 topic / intent / decisionTarget을 한 곳에서 고른다.
 *
 * topic은 Phase 1 first-match를 기본으로 두고,
 * 강한 topic×decisionTarget compound가 있을 때만 pair로 정규화한다.
 * intent는 Phase 1을 기본으로 두고,
 * prediction → permission(intent only) → comparison/selection 순으로 override한다.
 * decisionTarget은 Phase 1 → J-4-4 compound pair → J-4-1 specific 승격 →
 * comparison/selection + generic only 이면 choose →
 * termination/continuation + generic 충돌 정리 →
 * J-4-5-1 compatibility/fit vs marry 완화 순이다.
 * 그 뒤 J-4-7 option-fit 정규화로 comparison/selection 분기와
 * none/generic object.label 불안정, option-fit 가로채기를 정리한다.
 * J-4-8에서 permission surface + 명확한 action-nature
 * (continuation/termination)이면 possibility 고정을 풀어 action 의미를 보존한다.
 * 그 다음 J-4-9에서 temporal-only lifeFlow가 삶의 방향/전환 의미와
 * 충돌하면 topic만 lifeDirection으로 정규화한다.
 * J-4-13에서 general topic이 money-manage / realEstate-move compound
 * 증거와 충돌하면 topic만 승격한다 (intent/DT 불변; DT는 J-4-4가 담당).
 * J-4-10에서 decisionTarget(=object.label)만
 * soft frame / life-path / sell compound 기준으로 정규화한다.
 * 마지막으로 J-4-11에서 같은 의미의 intent surface 분기만
 * 기존 enum canonical으로 정규화한다 (topic/DT 불변).
 * permission / termination / continuation frame은 intent를
 * 서로 덮어쓰지 않는 범위를 지킨다.
 * (termination/continuation decisionTarget 정리는 J-4-3-2 유지)
 */
/**
 * keyword의 Korean form 중 질문에서 가장 먼저 등장하는 위치를 반환한다.
 * 매칭되지 않으면 -1.
 */
function findKoreanKeywordEarliestIndex(
  question: string,
  keyword: string,
): number {
  let earliest = -1;

  for (const form of buildKoreanKeywordForms(keyword)) {
    const index = question.indexOf(form);
    if (index < 0) {
      continue;
    }
    if (earliest < 0 || index < earliest) {
      earliest = index;
    }
  }

  return earliest;
}

/**
 * objectLabel 선택.
 * - topicEvidence 없으면 undefined
 * - business 외 topic은 기존 선언 순서(topicEvidence[0]) 유지
 * - lifeFlow는 LIFE_FLOW_TEMPORAL_SURFACE_MARKERS를 objectLabel 후보에서 제외
 *   (시간 surface는 semantic object가 아님; 후보가 없으면 undefined)
 * - business는 start signal(창업/개업 등)을 제외하고,
 *   질문 문자열에 실제로 먼저 등장한 keyword를 선택
 * - 제외 후 후보가 없으면 topicEvidence 전체로 다시 후보를 잡고
 *   동일하게 질문 내 등장 순서가 가장 빠른 keyword를 선택
 * - 질문에서 위치를 못 찾으면 undefined
 *   (topicEvidence[0]으로 복구하지 않음)
 */
function selectObjectLabelFromTopicEvidence(
  question: string,
  topic: QuestionTopic,
  topicEvidence: readonly string[],
): string | undefined {
  if (topicEvidence.length === 0) {
    return undefined;
  }

  if (topic !== "business") {
    if (topic === "lifeFlow") {
      return topicEvidence.find(
        (item) => !LIFE_FLOW_TEMPORAL_SURFACE_MARKERS.has(item),
      );
    }

    // structural buy 판정용 마커는 object 표시 surface가 아니다.
    const displayEvidence = topicEvidence.filter(
      (item) => item !== STRUCTURAL_REAL_ESTATE_BUY_OBJECT_MARKER,
    );
    return displayEvidence[0];
  }

  const objectCandidates = topicEvidence.filter(
    (keyword) => !BUSINESS_START_SIGNAL_KEYWORDS.includes(keyword),
  );

  const labelCandidates =
    objectCandidates.length > 0 ? objectCandidates : topicEvidence;

  let selected: string | undefined;
  let selectedIndex = Number.POSITIVE_INFINITY;

  for (const keyword of labelCandidates) {
    const index = findKoreanKeywordEarliestIndex(question, keyword);
    if (index < 0) {
      continue;
    }
    if (index < selectedIndex) {
      selectedIndex = index;
      selected = keyword;
    }
  }

  return selected;
}

function normalizeAxes(
  question: string,
  candidates: MeaningCandidateSet,
): NormalizedAxes {
  const topicCandidate = selectLowestPriorityCandidate(candidates.topics);
  let topic: QuestionTopic = topicCandidate?.value ?? "general";
  let topicEvidence = topicCandidate?.evidence ?? [];

  // Phase 1: intentRules first-match를 기본값으로 둔다.
  const intentCandidate = selectLowestPriorityCandidate(candidates.intents);
  let intent: ReaderIntentLiteral = intentCandidate?.value ?? "generalJudgement";
  let intentEvidence: string[] = intentCandidate?.evidence ?? [];

  // 기존 resolveQuestionIntent 우선순위 보존:
  // prediction frame → permission frame(intent only) → (J-4-2) comparison/selection
  const predictionFrame = hasFrame(
    candidates.frames,
    "futureOutcomePrediction",
  );

  if (predictionFrame) {
    intent = "prediction";
    intentEvidence = ["futureOutcomePrediction"];
  } else {
    // J-4-3-1: 강한 permission frame이 있으면 intent만 possibility로 override.
    // decisionTarget / topic은 유지한다.
    const permissionIntent = resolveStrongPermissionIntent(candidates);

    if (permissionIntent) {
      intent = permissionIntent.intent;
      intentEvidence = permissionIntent.evidence;
    } else if (intent !== "comparison" && intent !== "selection") {
      // J-4-2: Phase 1이 이미 comparison/selection이면 유지하고,
      // frame과 충돌할 때만 comparison/selection으로 override한다.
      const frameIntent = resolveStrongComparisonOrSelectionIntent(candidates);

      if (frameIntent) {
        intent = frameIntent.intent;
        intentEvidence = frameIntent.evidence;
      }
    }
  }

  // Phase 1: decisionRules first-match
  // → J-4-4: 강한 compound pair면 topic + decisionTarget 동시 정규화
  // → J-4-1: generic/specific 충돌 시에만 specific 승격
  // → J-4-2: comparison/selection + generic only 이면 choose
  // → J-4-3-2: termination/continuation + generic 충돌 정리
  // → J-4-5-1: compatibility/fit vs marry 완화 (partner 변환 없음)
  // permission frame은 이 경로에 개입하지 않는다.
  const decisionCandidate = selectLowestPriorityCandidate(
    candidates.decisionTargets,
  );
  let decisionTarget: DecisionTarget = decisionCandidate?.value ?? "none";
  let decisionEvidence = decisionCandidate?.evidence ?? [];

  // J-4-4: 강한 topic × decisionTarget compound가 있으면
  // 두 축을 한 semantic pair로 정규화한다.
  // 단순 decisionTarget keyword만으로 topic을 forcing하지 않는다.
  // Phase 1 decision과 호환되지 않는 compound는 적용하지 않는다.
  const compoundPair = resolveStrongTopicDecisionCompound(
    question,
    candidates,
    decisionTarget,
  );

  if (compoundPair) {
    topic = compoundPair.topic;
    topicEvidence = compoundPair.topicEvidence;
    decisionTarget = compoundPair.decisionTarget;
    decisionEvidence = compoundPair.decisionEvidence;
  }

  const specificOverride = resolveGenericSpecificDecisionTargetConflict(
    decisionTarget,
    candidates,
    topic,
  );

  if (specificOverride) {
    decisionTarget = specificOverride.value;
    decisionEvidence = [
      ...specificOverride.evidence,
      ...decisionEvidence,
    ];
  } else {
    const frameChoose = resolveComparisonSelectionGenericDecisionTarget(
      decisionTarget,
      candidates,
      decisionEvidence,
    );

    if (frameChoose) {
      decisionTarget = frameChoose.decisionTarget;
      decisionEvidence = frameChoose.evidence;
    } else {
      const termOrCont = resolveTerminationOrContinuationDecisionTarget(
        decisionTarget,
        candidates,
        topic,
        decisionEvidence,
      );

      if (termOrCont) {
        decisionTarget = termOrCont.decisionTarget;
        decisionEvidence = termOrCont.evidence;
      }
    }
  }

  // J-4-5-1: 기존 정책을 모두 적용한 뒤,
  // compatibility/fit이 강하면 marry keyword 강제만 완화한다.
  const compatibilityOverMarry = resolveCompatibilityOverMarryDecisionTarget(
    question,
    intent,
    decisionTarget,
    candidates,
    decisionEvidence,
  );

  if (compatibilityOverMarry) {
    decisionTarget = compatibilityOverMarry.decisionTarget;
    decisionEvidence = compatibilityOverMarry.evidence;
  }

  // J-4-7: 기존 정책을 모두 적용한 뒤,
  // option-fit 의미를 selection + (none/generic→choose)로 정규화한다.
  const optionFitNormalized = normalizeOptionFitMeaning(
    intent,
    intentEvidence,
    decisionTarget,
    decisionEvidence,
    candidates,
  );

  if (optionFitNormalized) {
    intent = optionFitNormalized.intent;
    intentEvidence = optionFitNormalized.intentEvidence;
    decisionTarget = optionFitNormalized.decisionTarget;
    decisionEvidence = optionFitNormalized.decisionEvidence;
  }

  // J-4-8: permission surface + 명확한 continuation/termination 증거가 있으면
  // possibility 고정을 풀어 action-nature intent를 보존한다.
  // decisionTarget은 변경하지 않는다.
  const permissionActionNormalized = normalizePermissionActionNatureMeaning(
    intent,
    intentEvidence,
    decisionTarget,
    candidates,
  );

  if (permissionActionNormalized) {
    intent = permissionActionNormalized.intent;
    intentEvidence = permissionActionNormalized.intentEvidence;
  }

  // J-4-9: temporal-only lifeFlow가 삶의 방향/선택/전환 의미와 충돌하면
  // topic만 lifeDirection으로 정규화한다. intent/decisionTarget은 유지한다.
  const lifeDirectionTopicNormalized = normalizeLifeFlowVersusLifeDirectionTopic(
    question,
    topic,
    topicEvidence,
    candidates,
  );

  if (lifeDirectionTopicNormalized) {
    topic = lifeDirectionTopicNormalized.topic;
    topicEvidence = lifeDirectionTopicNormalized.topicEvidence;
  }

  // J-4-13: general topic이 money-manage / realEstate-move compound
  // 증거와 충돌하면 topic만 승격한다. intent/decisionTarget은 유지한다.
  // (강한 compound pair의 DT 정규화는 위의 J-4-4가 이미 수행한다.)
  const topicSemanticNormalized = normalizeTopicSemanticEvidenceCoverage(
    topic,
    topicEvidence,
    candidates,
  );

  if (topicSemanticNormalized) {
    topic = topicSemanticNormalized.topic;
    topicEvidence = topicSemanticNormalized.topicEvidence;
  }

  // J-4-10: topic 정규화 이후 decisionTarget(=object.label)만 안정화한다.
  // intent / topic은 변경하지 않는다.
  const decisionTargetNormalized = normalizeDecisionTargetSemanticMeaning(
    question,
    topic,
    intent,
    decisionTarget,
    decisionEvidence,
    candidates,
  );

  if (decisionTargetNormalized) {
    decisionTarget = decisionTargetNormalized.decisionTarget;
    decisionEvidence = decisionTargetNormalized.decisionEvidence;
  }

  // J-4-11: topic/DT 안정화 이후, 같은 의미의 intent surface 분기만 정규화한다.
  // topic / decisionTarget은 변경하지 않는다.
  const intentSemanticNormalized = normalizeIntentSemanticMeaning(
    question,
    topic,
    intent,
    intentEvidence,
    decisionTarget,
    candidates,
  );

  if (intentSemanticNormalized) {
    intent = intentSemanticNormalized.intent;
    intentEvidence = intentSemanticNormalized.intentEvidence;
  }

  // I-27 / I-31: J-4-11 인접 — action-nature + aligned DT에서
  // strong method/risk speech-act Intent만 보존한다. DT는 불변.
  // continuation→continue, termination→stop|leaveJob
  const actionNatureSpeechActPreserved =
    findStrongActionNatureSpeechActPreservation(
      intent,
      intentEvidence,
      decisionTarget,
      candidates,
    );

  if (actionNatureSpeechActPreserved) {
    intent = actionNatureSpeechActPreserved.intent;
    intentEvidence = actionNatureSpeechActPreserved.intentEvidence;
  }

  // F: I-27/I-31 이후 — reason|timing additive hijack에서만
  // strong method/risk Intent 복원. DT / timingType 불변.
  const additiveReasonTimingSpeechActPreserved =
    findAdditiveReasonTimingSpeechActPreservation(
      question,
      intent,
      intentEvidence,
      candidates,
    );

  if (additiveReasonTimingSpeechActPreserved) {
    intent = additiveReasonTimingSpeechActPreserved.intent;
    intentEvidence =
      additiveReasonTimingSpeechActPreserved.intentEvidence;
  }

  const objectLabel = selectObjectLabelFromTopicEvidence(
    question,
    topic,
    topicEvidence,
  );

  return {
    topic,
    objectLabel,
    objectSurfaceRemnant: extractObjectSurfaceRemnant(
      question,
      objectLabel,
    ),
    intent,
    decisionTarget,
    evidence: {
      topic: topicEvidence,
      intent: intentEvidence,
      decisionTarget: decisionEvidence,
    },
  };
}

/**
 * J-2 내부용: normalizeAxes와 기존 first-match 경로의 Phase 1 동등성 확인.
 * production 경로에는 로그를 출력하지 않는다.
 */
function assertNormalizeAxesPhase1Equivalence(
  question: string,
  axes: NormalizedAxes,
): void {
  const legacyTopic = findRule(question, topicRules, "general");
  const legacyIntent = resolveQuestionIntent(question);
  const legacyDecision = resolveDecisionTargetMatch(question);

  void (
    axes.topic === legacyTopic.result
    && axes.intent === legacyIntent.result
    && axes.decisionTarget === legacyDecision.result
    && axes.evidence.topic.join("\0") === legacyTopic.evidence.join("\0")
    && axes.evidence.intent.join("\0") === legacyIntent.evidence.join("\0")
    && axes.evidence.decisionTarget.join("\0")
      === legacyDecision.evidence.join("\0")
  );
}

/**
 * 기존 decisionTarget 해석 경로.
 * J-2부터 최종 선택은 normalizeAxes가 담당한다.
 * Phase 1 동등성 검증·호환용으로 유지한다.
 */
function resolveDecisionTargetMatch(
  question:
    string,
): {
  result:
    DecisionTarget;

  evidence:
    string[];
} {
  const match =
    findDecisionRule(
      question,
      decisionRules,
      "none",
    );

  if (
    !isComparisonOrOptionFitDecisionFrame(
      question,
    )
  ) {
    return match;
  }

  if (
    !GENERIC_ACTION_DECISION_TARGETS.has(
      match.result,
    )
  ) {
    return match;
  }

  const chooseMarkers =
    COMPARISON_OR_OPTION_FIT_DECISION_MARKERS.filter(
      (marker) =>
        matchesDecisionKeyword(
          question,
          marker,
        ),
    );

  return {
    result:
      "choose",

    evidence:
      [
        ...chooseMarkers,
        ...match.evidence,
      ],
  };
}

const REAL_ESTATE_BUY_PROPERTY_NOUNS: readonly string[] = [
  "부동산",
  "아파트",
  "건물",
  "상가",
  "토지",
  "땅",
  "주택",
  "집",
  "원룸",
  "오피스텔",
  "빌라",
  "다가구",
  "임야",
  "펜션",
  "별장",
];

/**
 * structural realEstate×buy 판정용 topicEvidence 마커.
 * unknown object surface 자체를 topicEvidence에 넣지 않아
 * objectLabel 표시 계약과 판정 증거를 분리한다.
 * vocabulary / remnant / objectSurfaceRemnant 계약에는 넣지 않는다.
 */
const STRUCTURAL_REAL_ESTATE_BUY_OBJECT_MARKER =
  "structuralRealEstateBuyObject";

/**
 * N을/를 + 매수|매입|구입 structural 감지에만 쓰는 buy verb anchor.
 * REAL_ESTATE_BUY_VERBS / remnant action anchor에는 추가하지 않는다.
 */
const STRUCTURAL_REAL_ESTATE_BUY_VERB_ANCHORS: readonly string[] = [
  "매수",
  "매입",
  "구입",
];

/**
 * structural realEstate buy 증거에서 제외할 금융자산 object 마커.
 * topicRules.money의 instrument 명사만 분리 추출한다.
 * (cashflow 일반 명사·bare 매수 invest 경로는 건드리지 않는다)
 */
const FINANCIAL_ASSET_BUY_OBJECT_MARKERS: readonly string[] = [
  "주식",
  "etf",
  "펀드",
  "채권",
  "코인",
  "가상자산",
  "가상화폐",
  "암호화폐",
];

/**
 * P10 G1: money × invest compound에만 쓰는 colloquial buy surface.
 * decisionRules invest keywords / REAL_ESTATE_BUY_VERBS에는 넣지 않는다.
 * financial asset noun과 결합될 때만 invest 의미를 만든다.
 */
const MONEY_FINANCIAL_ASSET_BUY_VERBS: readonly string[] = [
  "사도",
  "사면",
  "살까",
  "살지",
  "사는",
  "사야",
  "사려고",
  "사볼까",
];

/**
 * structural realEstate buy에서 제외할 cashflow/general money object.
 * FINANCIAL_ASSET이 아니며, instrument invest 경로와도 분리한다.
 * N을/를 + 매수|매입|구입 과승격 방지용이다.
 */
const CASHFLOW_MONEY_BUY_OBJECT_EXCLUSIONS: readonly string[] = [
  "돈",
  "자금",
  "현금",
  "재물",
  "재산",
  "자산",
];

/**
 * structural realEstate buy에서 제외할 일반 상품 object.
 * 부동산 과승격 방지용 closed vocabulary만 둔다.
 * substring endsWith("차") 확장은 하지 않는다.
 */
const GENERAL_GOODS_BUY_OBJECT_EXCLUSIONS: readonly string[] = [
  "자동차",
  "차",
  "명품",
  "상품",
  "제품",
  "물건",
  "휴대폰",
  "가전",
  "기계",
];

/**
 * structural realEstate buy에서 제외할 조직 object.
 * 기업/법인 매수 과승격 방지용 closed vocabulary만 둔다.
 */
const ORGANIZATION_BUY_OBJECT_EXCLUSIONS: readonly string[] = [
  "기업",
  "법인",
  "사업체",
];

/**
 * structural realEstate buy에서 제외할 부정칭/지시칭 object.
 * extractStructuralBuyObjectSurface 실제 surface만 closed vocabulary로 둔다.
 * unknown 고유명사 전체를 막지 않는다.
 */
const INDEFINITE_DEICTIC_BUY_OBJECT_EXCLUSIONS: readonly string[] = [
  "이것",
  "그것",
  "저것",
  "이거",
  "그거",
  "저거",
  "무엇",
  "뭐",
  "뭔가",
];

/**
 * J-4-13: realEstate × move compound용 relocation verb 의미군.
 * decisionRules move keyword를 재사용하되, surface 활용형까지 포함한다.
 * topicRules/decisionRules 배열에는 넣지 않는다(단독 forcing 방지).
 */
const REAL_ESTATE_MOVE_COMPOUND_VERBS: readonly string[] = [
  "이사",
  "이전",
  "옮겨야",
  "옮겨도",
  "옮길",
  "옮겨",
  "자리 이동",
];

/**
 * J-4-13: money × manageMoney compound용 cashflow noun 의미군.
 * 기존 money topic / manageMoney evidence의 유입·유출·자금 명사를 재사용하고,
 * 급여성 수입(월급/급여)과 지출을 같은 현금흐름 축으로 묶는다.
 * topicRules에 단독 추가하지 않는다.
 */
const MONEY_CASHFLOW_COMPOUND_NOUNS: readonly string[] = [
  "돈",
  "재물",
  "재산",
  "수입",
  "매출",
  "자금",
  "현금",
  "수익",
  "월급",
  "급여",
  "지출",
  "현금흐름",
  "통장",
  "생활비",
  "카드값",
  "고정비",
];

/**
 * P10-C F: exclusive alternative cash-holding arm용 명사.
 * money buy exclusion의 "현금" 보호와 역할을 분리한다.
 * (매수 object exclusion ≠ hold-cash alternative arm)
 */
const MONEY_CASH_HOLDING_NOUNS: readonly string[] = [
  "현금",
];

/**
 * P10-C F: exclusive alternative cash-holding arm용 보유 paraphrase.
 * wait/continue keyword vocabulary에 단독 추가하지 않는다.
 */
const MONEY_CASH_HOLDING_VERBS: readonly string[] = [
  "가지고 있",
  "들고 있",
  "보유",
  "남겨둘",
  "남겨 둘",
];

/**
 * J-4-13: money × manageMoney compound용 manage/regulate verb 의미군.
 * manageMoney decision evidence의 관리 계열을 재사용한다.
 */
const MONEY_MANAGE_COMPOUND_VERBS: readonly string[] = [
  "관리",
  "조절",
  "운용",
  "돈 관리",
  "현금흐름",
  "쪼개",
  "저축",
];

const REAL_ESTATE_BUY_VERBS: readonly string[] = [
  "매수",
  "매입",
  "구입",
  "장만",
  "을 사",
  "를 사",
  "사도",
  "사야",
  "살까",
  "살지",
];

/**
 * J-4-4: job topic compound용 noun.
 * changeJob/leaveJob signal과 결합될 때만 topic forcing에 사용한다.
 */
const JOB_TOPIC_COMPOUND_NOUNS: readonly string[] = [
  "직장",
  "회사",
  "직업",
  "직무",
  "소속",
  "콜센터",
];

/**
 * J-4-4: business topic compound용 noun.
 * start signal과 결합될 때만 topic forcing에 사용한다.
 * topicRules business keywords를 재사용하되, 동업은 partner 축이므로 제외한다.
 */
const BUSINESS_TOPIC_COMPOUND_NOUNS: readonly string[] = [
  "사업",
  "창업",
  "장사",
  "영업",
  "가게",
  "개업",
  "매장",
  "식당",
  "카페",
  "치킨",
  "통닭",
  "자영업",
  "프랜차이즈",
  "쇼핑몰",
  "빨래방",
  "모래놀이방",
  "클라이밍장",
  "헬스장",
  "세탁소",
  "공방",
  "분식집",
  "작업실",
];

/**
 * J-4-4: business × start compound용 start signal.
 * start decisionRules 중 실행 신호만 재사용한다.
 * permission 표현(해볼까 등) 단독으로는 topic을 forcing하지 않는다.
 */
const BUSINESS_START_SIGNAL_KEYWORDS: readonly string[] = [
  "시작",
  "창업",
  "개업",
  "새로",
];

/**
 * business noun × start paraphrase compound용 활용형.
 * decisionRules / BUSINESS_START_SIGNAL_KEYWORDS에 전역 추가하지 않는다.
 * bare "차리"/"열" 단독 substring 금지.
 * business noun과 결합될 때만 start evidence가 된다.
 */
const BUSINESS_START_COMPOUND_VERBS: readonly string[] = [
  "차려도",
  "차려야",
  "차릴까요",
  "차릴까",
  "차리면",
  "차리고",
  "차려",
  "열어도",
  "열어야",
  "열까요",
  "열까",
  "열면",
  "열고",
  "열어",
];

/**
 * P10 G4: business noun × 운영 paraphrase compound용 활용형.
 * decisionRules / continue keyword에 전역 추가하지 않는다.
 * bare "운영"/"운영하다" 단독 substring 금지.
 * BUSINESS_TOPIC_COMPOUND_NOUNS와 결합될 때만 continue evidence가 된다.
 * 회사/직장은 BUSINESS noun 밖이므로 job 경계를 보존한다.
 */
const BUSINESS_CONTINUE_OPERATE_COMPOUND_VERBS: readonly string[] = [
  "운영해도",
  "운영해야",
  "운영하는",
  "운영할",
  "운영할까",
  "운영할지",
];

/**
 * P11-6-2 / A1: business noun × 끊지 않고 / 굴려가 paraphrase.
 * decisionRules / continue·continuation keyword에 전역 추가하지 않는다.
 * bare "끊다"/"굴리다"/"굴리" 단독 substring 금지.
 * BUSINESS_TOPIC_COMPOUND_NOUNS와 결합될 때만 continue evidence가 된다.
 * 관계/연락/거래/업무/운동/공부/프로젝트/팀/시스템/자동차 등은
 * BUSINESS noun 밖이므로 경계를 보존한다.
 */
const BUSINESS_CONTINUE_KEEP_GOING_COMPOUND_VERBS: readonly string[] = [
  "끊지 않고",
  "굴려가도",
  "굴려가야",
  "굴려가는",
  "굴려갈",
  "굴려갈까",
  "굴려갈지",
  "굴려가면서",
  "굴려가",
];

/**
 * P11-7-2I-1 / B1: business noun × keep-alive paraphrase.
 * 기존 keep-going(끊지 않고/굴려가*)과 동일하게 noun gate 하에서만 continue evidence.
 * decisionRules / continue·continuation keyword에 전역 추가하지 않는다.
 * bare "살리다"/"붙잡다"/"가져가다"/"스톨" 단독 substring 금지.
 * "접지 않고"는 stop(접*)의 부정 keep-track이며, 기존 fold-stop surfaces와 겹치지 않는다.
 */
const BUSINESS_CONTINUE_KEEP_ALIVE_COMPOUND_VERBS: readonly string[] = [
  "살려두",
  "붙잡아두",
  "붙잡아 두",
  "접지 않고",
  "스톨시키지 않",
];

/**
 * P10 G4 + P11-6-2 + P11-7-2I-1: business continue compound verb 전체.
 * operate(운영*) / keep-going(끊지 않고/굴려가*) / keep-alive(살려두* 등)를 합친다.
 */
const BUSINESS_CONTINUE_COMPOUND_VERBS: readonly string[] = [
  ...BUSINESS_CONTINUE_OPERATE_COMPOUND_VERBS,
  ...BUSINESS_CONTINUE_KEEP_GOING_COMPOUND_VERBS,
  ...BUSINESS_CONTINUE_KEEP_ALIVE_COMPOUND_VERBS,
];

/**
 * P10 G5: business noun × 접다/폐업 paraphrase compound용 활용형.
 * decisionRules / stop keyword에 전역 추가하지 않는다.
 * bare "접다"/"접어"/"폐업" 단독 substring 금지.
 * BUSINESS_TOPIC_COMPOUND_NOUNS와 결합될 때만 stop evidence가 된다.
 * 기존 decisionRules의 "접어야"는 유지하고, 여기서는 동일 surface를
 * noun-gated compound evidence로만 재사용·확장한다.
 * 계획/책/일/프로젝트/마음/회사/직장은 BUSINESS noun 밖이므로 경계를 보존한다.
 */
const BUSINESS_STOP_FOLD_COMPOUND_VERBS: readonly string[] = [
  "접어도",
  "접어야",
  "접는",
  "접을",
  "접을까",
  "접을지",
];

/**
 * P11-6-3 / A2: business noun × 접다 extended conjugations.
 * bare "접다"/"접어" 단독 substring 금지.
 * BUSINESS_TOPIC_COMPOUND_NOUNS와 결합될 때만 stop evidence가 된다.
 */
const BUSINESS_STOP_FOLD_EXTENDED_COMPOUND_VERBS: readonly string[] = [
  "접고",
  "접으면서",
  "접은 뒤",
];

/**
 * P10 G5: business noun × 폐업 paraphrase compound용 활용형.
 * bare "폐업" 단독 substring 금지.
 */
const BUSINESS_STOP_CLOSURE_COMPOUND_VERBS: readonly string[] = [
  "폐업해도",
  "폐업해야",
  "폐업하는",
  "폐업할",
  "폐업할까",
  "폐업할지",
];

/**
 * P11-6-3 / A2: business noun × 손을 떼다 withdraw paraphrase.
 * decisionRules / stop·termination keyword에 전역 추가하지 않는다.
 * bare "떼다"/"손을" 단독 substring 금지.
 * BUSINESS_TOPIC_COMPOUND_NOUNS와 결합될 때만 stop evidence가 된다.
 * 관계/투자/업무/팀/프로젝트 등은 BUSINESS noun 밖이므로 경계를 보존한다.
 */
const BUSINESS_STOP_WITHDRAW_COMPOUND_VERBS: readonly string[] = [
  "손을 떼다",
  "손을 떼도",
  "손을 떼야",
  "손을 떼는",
  "손을 뗄",
  "손을 뗄까",
  "손을 뗄지",
  "손을 떼고",
  "손을 떼면서",
  "손을 뗀 뒤",
  "손을 떼려",
];

/**
 * P11-7-2I-5 / B2: business noun × end/close paraphrase.
 * decisionRules / stop·termination keyword에 전역 추가하지 않는다.
 * bare "끝내다"/"마무리하다"/"종료"/"닫다"/"닫아버리다" 단독 substring 금지.
 * BUSINESS_TOPIC_COMPOUND_NOUNS(영업/사업/가게 등)와 결합될 때만 stop evidence.
 * bare "끝내"는 decisionRules에 이미 있으므로 여기에는 짧은 stem을 넣지 않고
 * 활용형만 두어 "끝내지 않고" 부정 keep-track과의 겹침을 줄인다.
 * 고용/직장/관계/인생/삶/투자/계약/프로젝트/임대 등은 BUSINESS noun 밖.
 */
const BUSINESS_STOP_END_CLOSE_COMPOUND_VERBS: readonly string[] = [
  "끝내도",
  "끝내야",
  "끝내는",
  "끝낼",
  "끝낼까",
  "끝낼지",
  "끝내고",
  "끝내면",
  "끝낸",
  "끝내려",
  "끝내기",
  "종료해도",
  "종료해야",
  "종료하는",
  "종료할",
  "종료할까",
  "종료할지",
  "종료하고",
  "종료하면",
  "종료하",
  "종료",
  "마무리해도",
  "마무리해야",
  "마무리하는",
  "마무리할",
  "마무리할까",
  "마무리할지",
  "마무리하고",
  "마무리하면",
  "마무리하",
  "마무리",
  "닫아버려도",
  "닫아버려야",
  "닫아버리는",
  "닫아버릴",
  "닫아버릴까",
  "닫아버릴지",
  "닫아버리고",
  "닫아버리면서",
  "닫아버린",
  "닫아버리",
];

/**
 * P11-7-2I-6 / B9: business noun × negated continue paraphrase.
 * decisionRules / stop·termination keyword에 전역 추가하지 않는다.
 * bare "이어가"/"계속"/"더 이상"/"않" 단독 substring 금지.
 * BUSINESS_TOPIC_COMPOUND_NOUNS와 결합될 때만 stop evidence.
 * "끊지 않고"/"접지 않고"/"스톨시키지 않" 등 긍정 keep-track과 분리한다.
 * 직장/관계/삶/투자/프로젝트 등 BUSINESS noun 밖은 경계를 보존한다.
 */
const BUSINESS_STOP_NEGATED_CONTINUE_COMPOUND_VERBS: readonly string[] = [
  "이어가지 않",
  "계속하지 않",
];

/**
 * 긍정 continue stem이 부정 continue compound에 가려질 때 제외할 keyword.
 * 전역 polarity engine이 아니라 longer negated surface shadowing만 한다.
 */
const CONTINUE_STEMS_SHADOWED_BY_NEGATED_CONTINUE: ReadonlySet<string> = new Set([
  "이어가",
  "계속",
]);

/**
 * P10 G5 + P11-6-3 + P11-7-2I-5 + P11-7-2I-6: business stop compound verb 전체.
 * fold(접*) / closure(폐업*) / withdraw(손을 떼*) / end-close(끝내*|종료*|마무리*|닫아버리*)
 * / negated-continue(이어가지 않*|계속하지 않*)를 합친다.
 */
const BUSINESS_STOP_COMPOUND_VERBS: readonly string[] = [
  ...BUSINESS_STOP_FOLD_COMPOUND_VERBS,
  ...BUSINESS_STOP_FOLD_EXTENDED_COMPOUND_VERBS,
  ...BUSINESS_STOP_CLOSURE_COMPOUND_VERBS,
  ...BUSINESS_STOP_WITHDRAW_COMPOUND_VERBS,
  ...BUSINESS_STOP_END_CLOSE_COMPOUND_VERBS,
  ...BUSINESS_STOP_NEGATED_CONTINUE_COMPOUND_VERBS,
];

/**
 * P11-6-3 / A2 + P11-7-2I-5 / B2 + P11-7-2I-6 / B9: termination intent 주입용 paraphrase.
 * 기존 P10 G5 fold/폐업 surface는 intentRules를 건드리지 않고 유지한다.
 * end-close·negated-continue는 noun gate 하에서만 termination candidate.
 */
const BUSINESS_STOP_A2_COMPOUND_VERBS: readonly string[] = [
  ...BUSINESS_STOP_FOLD_EXTENDED_COMPOUND_VERBS,
  ...BUSINESS_STOP_WITHDRAW_COMPOUND_VERBS,
  ...BUSINESS_STOP_END_CLOSE_COMPOUND_VERBS,
  ...BUSINESS_STOP_NEGATED_CONTINUE_COMPOUND_VERBS,
];

/**
 * P10 G6: property noun × 보유/가지고 있/들고 가/가져가/지켜보/보유한 채 paraphrase.
 * decisionRules / continue keyword에 전역 추가하지 않는다.
 * bare "보유"/"가지고 있다"/"가져가"/"지켜보" 단독 substring 금지.
 * REAL_ESTATE_BUY_PROPERTY_NOUNS와 결합될 때만 continue evidence가 된다.
 * 현금/주식/ETF/코인/물건/상품은 property noun 밖이므로 money/general 경계를 보존한다.
 * buy/sell surface(사도/매수/매도 등)와 섞지 않는다.
 */
const REAL_ESTATE_CONTINUE_COMPOUND_VERBS: readonly string[] = [
  "보유해도",
  "보유해야",
  "보유하는",
  "보유할",
  "보유할까",
  "보유할지",
  "가지고 있",
  "들고 가",
  "가져가",
  "지켜보",
  "보유한 채",
];

/**
 * P10 G2: entity noun + 설립 compound용 조직/사업 entity.
 * BUSINESS_TOPIC_COMPOUND_NOUNS를 재사용하고,
 * 회사/법인/사업체/기업은 설립 문맥에서만 business topic evidence로 합류한다.
 * 회사 단독(이직/퇴사/유지)은 JOB_TOPIC_COMPOUND_NOUNS 경로를 유지한다.
 */
const BUSINESS_ESTABLISH_ENTITY_NOUNS: readonly string[] = [
  ...BUSINESS_TOPIC_COMPOUND_NOUNS,
  "회사",
  "법인",
  "사업체",
  "기업",
];

/**
 * P10 G2: 설립은 bare global start keyword가 아니다.
 * decisionRules / BUSINESS_START_SIGNAL_KEYWORDS에 넣지 않고,
 * entity noun과 결합될 때만 start evidence가 된다.
 */
const BUSINESS_ESTABLISH_START_SIGNALS: readonly string[] = [
  "설립",
];

/**
 * P10 G2-2: entity noun + 인수 compound용 조직/사업 entity.
 * BUSINESS_ESTABLISH_ENTITY_NOUNS와 동일 집합을 재사용한다.
 * 회사 단독(이직/퇴사/유지)은 JOB_TOPIC_COMPOUND_NOUNS 경로를 유지하고,
 * 회사+인수에서만 business topic evidence로 합류한다.
 */
const BUSINESS_ACQUIRE_ENTITY_NOUNS: readonly string[] =
  BUSINESS_ESTABLISH_ENTITY_NOUNS;

/**
 * P10 G2-2 / P11-6-6 A3-1: 인수·매입·구입·사들이·사들여는 bare global buy keyword가 아니다.
 * decisionRules에 넣지 않고, entity noun과 결합될 때만 buy evidence가 된다.
 * "인수인계"는 반드시 제외한다.
 * 사들이다 stem(사들이/사들여)은 entity noun 결합 시에만 buy evidence가 된다.
 * 사다(bare colloquial)/넘겨받다/권리금은 A3-1 범위 밖이다.
 */
const BUSINESS_ACQUIRE_BUY_SIGNALS: readonly string[] = [
  "인수",
  "매입",
  "구입",
  "사들이",
  "사들여",
];

/**
 * P11-6-6 A3-2: colloquial 사* buy compound용 business entity/object.
 * BUSINESS_ACQUIRE_ENTITY_NOUNS를 재사용하지 않는다(회사 제외).
 * 회사 단독(이직/퇴사/유지)은 JOB_TOPIC_COMPOUND_NOUNS 경로를 유지한다.
 * 사들이다/넘겨받다/권리금은 A3-2 범위 밖이다.
 */
const BUSINESS_COLLOQUIAL_BUY_ENTITY_NOUNS: readonly string[] = [
  "가게",
  "매장",
  "식당",
  "사업체",
  "법인",
  "기업",
];

/**
 * P11-6-6 A3-2: business entity × colloquial 사* compound용 buy surface.
 * decisionRules / REAL_ESTATE_BUY_VERBS / MONEY_FINANCIAL_ASSET_BUY_VERBS /
 * BUSINESS_ACQUIRE_BUY_SIGNALS에는 넣지 않는다.
 * bare "사다" 단독으로는 topic/decision을 만들지 않는다.
 */
const BUSINESS_COLLOQUIAL_BUY_VERBS: readonly string[] = [
  "사도",
  "사야",
  "살까",
  "살지",
  "사는",
  "사려고",
  "사볼까",
];

/**
 * P11-7-2I-2 / B3: operating-right / going-concern acquisition entity nouns.
 * topicRules/decisionRules에 전역 추가하지 않는다.
 * transfer-in verb와 결합될 때만 business × buy evidence가 된다.
 * 회사 단독은 JOB 경로를 유지한다(BUSINESS_COLLOQUIAL과 동일).
 */
const BUSINESS_ACQUISITION_ENTITY_NOUNS: readonly string[] = [
  ...BUSINESS_COLLOQUIAL_BUY_ENTITY_NOUNS,
  "영업권",
  "사업권",
  "비즈니스",
];

/**
 * P11-7-2I-2 / B3: 영업권/사업권 전용 bring-in surface.
 * bare "가져오" 단독·일반물건/사업 단독과는 결합하지 않는다.
 */
const BUSINESS_ACQUISITION_RIGHT_NOUNS: readonly string[] = [
  "영업권",
  "사업권",
];

const BUSINESS_ACQUISITION_RIGHT_BRING_VERBS: readonly string[] = [
  "가져오",
];

/**
 * P11-7-2I-2 / B3: transfer-in / succession / takeover surfaces.
 * decisionRules에 넣지 않는다.
 * "이전받*"(acquisition)만 허용하고 "이전"/"이전하*"(move)는 넣지 않는다.
 * bare "가져오"는 RIGHT_BRING 경로로만 허용한다.
 */
const BUSINESS_ACQUISITION_TRANSFER_IN_VERBS: readonly string[] = [
  "이전받",
  "양수",
  "승계",
  "통째로 가져오",
  "테이크오버",
  "테이크 오버",
  "takeover",
  "take-over",
  "take over",
];

/**
 * object surface remnant 포착용 action anchor만.
 * "시작/창업/개업"은 BUSINESS_START_SIGNAL_KEYWORDS에서 가져오되,
 * "새로"는 부사/action modifier이므로 remnant anchor에서 제외한다.
 * "차리"/"차려"/"열어"는 remnant capture 전용 surface이며,
 * topic/decisionRules 전역 vocab에는 넣지 않는다.
 *
 * remnant 계약:
 * Reader가 closed vocabulary로 해석하지 못한
 * "N을/를 (+ optional 새로) + 시작/창업/개업/차리/차려/열어" 구조에서
 * action anchor와 직접 결합된 surface 후보를 원문 그대로 보존한다.
 * (일반 명사 분류/의미 blacklist 없음)
 */
const OBJECT_SURFACE_REMNANT_ACTION_ANCHORS: readonly string[] = [
  ...BUSINESS_START_SIGNAL_KEYWORDS.filter(
    (keyword) => keyword !== "새로",
  ),
  "차리",
  "차려",
  "열어",
];

/**
 * objectLabel이 이미 closed vocabulary의 실제 object surface면 remnant를 만들지 않는다.
 * start signal만 objectLabel로 남은 경우(창업/개업/시작/새로)나
 * objectLabel 부재일 때만 보존 후보로 본다.
 */
function shouldPreserveObjectSurfaceRemnant(
  objectLabel: string | undefined,
): boolean {
  if (!objectLabel) {
    return true;
  }

  return (
    BUSINESS_START_SIGNAL_KEYWORDS as readonly string[]
  ).includes(objectLabel);
}

/**
 * closed vocabulary에 매칭되지 않은 object surface remnant를 보존한다.
 * - objectLabel 선택/변경 없음
 * - topic / specificity / business 여부 판단 없음
 * - "N을/를 (+ optional 새로) + action anchor" 형태만 매우 좁게 포착한다
 * - "새로"는 remnant 추출 시에만 leading/trailing modifier로 허용하며,
 *   objectLabel 선택 로직은 건드리지 않는다
 */
function extractObjectSurfaceRemnant(
  question: string,
  objectLabel: string | undefined,
): string | undefined {
  if (!shouldPreserveObjectSurfaceRemnant(objectLabel)) {
    return undefined;
  }

  let earliestAnchorIndex = Number.POSITIVE_INFINITY;

  for (const anchor of OBJECT_SURFACE_REMNANT_ACTION_ANCHORS) {
    const index = findKoreanKeywordEarliestIndex(question, anchor);
    if (index < 0) {
      continue;
    }
    if (index < earliestAnchorIndex) {
      earliestAnchorIndex = index;
    }
  }

  if (!Number.isFinite(earliestAnchorIndex)) {
    return undefined;
  }

  const beforeAnchor = question.slice(0, earliestAnchorIndex);
  // "새로"는 object surface가 아니라 action modifier다.
  // "베이커리를 새로 시작"처럼 particle과 action 사이에만 허용한다.
  const beforeForParticle = beforeAnchor.replace(/\s*새로\s*$/, "");
  const particleMatch = beforeForParticle.match(
    /([가-힣0-9]+(?:\s+[가-힣0-9]+){0,3})[을를]\s*$/,
  );

  if (!particleMatch) {
    return undefined;
  }

  // "새로 N을/를 시작"의 leading "새로"도 modifier로만 취급한다.
  // "새로운 N"은 공백이 없어 이 strip에 걸리지 않는다.
  const remnant = particleMatch[1]
    ?.trim()
    .replace(/^새로\s+/, "")
    .trim();
  if (!remnant) {
    return undefined;
  }

  if (objectLabel && remnant === objectLabel) {
    return undefined;
  }

  // objectReferent closed class — remnant로 중복 보존하지 않는다.
  if (
    /^(?:이거|이걸|이것|그거|그걸|저거|저걸)$/.test(remnant)
  ) {
    return undefined;
  }

  return remnant;
}

const LEAVE_JOB_SIGNAL_KEYWORDS: readonly string[] = [
  "퇴사",
  "그만두",
  "그만둬",
  "그만둘",
  "직장 그만",
  "직장을 그만",
  "회사 그만",
  "회사를 그만",
];

/**
 * job noun × leave-verb compound용 활용형.
 * LEAVE_JOB_SIGNAL_KEYWORDS / decisionRules에 단독 추가하지 않는다.
 * bare "떠나"/"떠나다"/"관두"/"관두다"/"나오"/"나와" 단독 substring 금지.
 * 연결형(떠나면서/떠나고/관두면서/관두고/…)은 아래 CONNECTIVE 목록으로만 취급한다.
 */
const JOB_LEAVE_COMPOUND_VERBS: readonly string[] = [
  "떠나도",
  "떠나야",
  "떠나는",
  "떠날",
  "관둬도",
  "관둬야",
  "관두는",
  "관둘",
  "나와도",
  "나와야",
  "나오는",
  "나올",
  "나오고",
  "나올까",
  "나올지",
  "나온",
  "나와",
];

/**
 * job noun × leave-verb compound용 연결형 활용.
 * 일반 leaveJob vocabulary / JOB_LEAVE_COMPOUND_VERBS / decisionRules에
 * 전역 추가하지 않는다. job noun과 결합될 때만 evidence로 쓴다.
 * primary DecisionTarget 승격 정책이 아니며, start primary를 빼앗지 않는다.
 */
const JOB_LEAVE_COMPOUND_CONNECTIVE_VERBS: readonly string[] = [
  "떠나면서",
  "떠나고 나서",
  "떠난 뒤",
  "떠나고",
  "관두면서",
  "관두고",
];

/**
 * P11-7-2I-3 / B5: employment-context nouns for leaveJob compound.
 * topicRules/decisionRules에 전역 추가하지 않는다.
 * disconnect/exit surface와 결합될 때만 job × leaveJob evidence가 된다.
 * bare "관계"/"고리"/"자리" 단독으로는 topic/decision을 만들지 않는다.
 */
const JOB_EMPLOYMENT_LEAVE_CONTEXT_NOUNS: readonly string[] = [
  "고용",
  "급여직",
  "월급 자리",
  "월급자리",
  // employment leave compound(나오·자리를 놓) gate 전용.
  // bare "자리" 단독으로는 topic/decision을 만들지 않는다(verb 결합 필수).
  "자리",
];

/**
 * P11-7-2I-3 / B5: employment noun × disconnect surfaces.
 * bare "끊"/"끊다"/"끊지" 단독 substring 금지 ("끊지 않고" continue 경계).
 * 연인·연락·거래·사업·투자 등 non-employment 목적어와는 결합하지 않는다.
 */
const JOB_LEAVE_DISCONNECT_COMPOUND_VERBS: readonly string[] = [
  "끊어도",
  "끊어야",
  "끊는",
  "끊을",
  "끊고",
  "끊을까",
  "끊을지",
];

/**
 * P11-7-2I-7 / B6: employment noun × end(끝내*) surfaces.
 * bare "끝내" 단독·비고용 목적어("관계를 끝내다" 등)만으로는 leaveJob이 아니다.
 * BUSINESS_STOP_END_CLOSE의 끝내* surface와 형태는 공유하되 employment gate로만 결합한다.
 * "종료/마무리/닫아버리"는 employment leave 경로에 넣지 않는다.
 */
const JOB_LEAVE_END_COMPOUND_VERBS: readonly string[] = [
  "끝내도",
  "끝내야",
  "끝내는",
  "끝낼",
  "끝낼까",
  "끝낼지",
  "끝내고",
  "끝내면",
  "끝낸",
  "끝내려",
  "끝내기",
];

/**
 * P11-7-2I-3 / B5: job noun × put-down surfaces.
 * bare "내려놓" 단독 substring 금지. JOB_TOPIC_COMPOUND_NOUNS와만 결합한다.
 */
const JOB_LEAVE_PUTDOWN_COMPOUND_VERBS: readonly string[] = [
  "내려놓아도",
  "내려놓아야",
  "내려놓는",
  "내려놓을",
  "내려놓고",
  "내려놓은",
  "내려놓을까",
  "내려놓을지",
  "자리를 놓",
];

/**
 * P11-7-2I-3 / B5: employment noun × exit surfaces.
 * bare "엑시트"/"exit" 단독·사업 엑시트는 전역 leaveJob이 아니다.
 */
const JOB_LEAVE_EXIT_COMPOUND_VERBS: readonly string[] = [
  "엑시트",
  "exit",
  "나와도",
  "나와야",
  "나오는",
  "나올",
  "나오고",
  "나올까",
  "나올지",
  "나온",
  "나와",
];

const CHANGE_JOB_SIGNAL_KEYWORDS: readonly string[] = [
  "이직",
  "전직",
  "직장을 옮",
  "직장 옮",
  "직장으로 옮",
  "회사를 옮",
  "회사 옮",
  "회사로 옮",
];

/**
 * P11-7-2I-4 / B4: employment/workplace nouns for changeJob compound.
 * topicRules/decisionRules에 전역 추가하지 않는다.
 * change-verb / alternate-destination / path-turn / offer-rearrange /
 * employment×자리 옮 과 결합될 때만 job × changeJob evidence가 된다.
 * bare "고용주"/"근무처"/"알바"/"정규직" 단독으로는 topic/decision을 만들지 않는다.
 * "회사"는 기존 JOB_TOPIC_COMPOUND_NOUNS 경로를 유지한다.
 * "자리"는 여기·JOB_TOPIC_COMPOUND_NOUNS·leave context에 추가하지 않는다.
 */
const JOB_CHANGE_EMPLOYMENT_CONTEXT_NOUNS: readonly string[] = [
  "고용주",
  "근무처",
  // changeJob employment context 전용 (전역 topic/decision keyword 아님).
  "알바",
  "정규직",
  "간호조무사",
  "영업직",
  "야간직",
  "사무직",
];

/**
 * changeJob 전용: employment context × 자리 옮* surfaces.
 * bare "자리"/"옮*" 단독·전역 decisionRules 추가 금지.
 * JOB_EMPLOYMENT_LEAVE_CONTEXT_NOUNS / leaveJob("자리를 놓")과 분리한다.
 */
const JOB_CHANGE_EMPLOYMENT_SEAT_MOVE_SURFACES: readonly string[] = [
  "자리를 옮",
  "자리 옮",
];

/**
 * P11-7-2I-4 / B4: alternate employer/workplace destination markers.
 * bare "다른"/"이동"/"옮" 단독 substring 금지.
 * destination marker × move surface일 때만 changeJob evidence가 된다.
 */
const JOB_CHANGE_ALTERNATE_DESTINATION_MARKERS: readonly string[] = [
  "다른 고용주",
  "다른 근무처",
  "다른 직장",
  "다른 회사",
  "다른 조직",
];

/**
 * P11-7-2I-4 / B4: alternate-destination × move surfaces.
 * bare "이동"/"옮기다"를 전역 changeJob keyword로 넣지 않는다.
 * "다른 곳(으로) 이동" 같은 non-employer destination은 marker 밖이다.
 */
const JOB_CHANGE_ALTERNATE_MOVE_COMPOUND_VERBS: readonly string[] = [
  "이동해도",
  "이동해야",
  "이동하는",
  "이동할",
  "이동할지",
  "옮겨도",
  "옮겨야",
  "옮기는",
  "옮길",
  "옮겨",
];

/**
 * P11-7-2I-4 / B4: workplace path-turn surfaces.
 * bare "경로"/"틀다"/"재배치" 전역 금지.
 * "근무 경로를 틀*"만 허용해 인생/삶/자산 경로와 분리한다.
 */
const JOB_CHANGE_WORKPLACE_PATH_TURN_SURFACES: readonly string[] = [
  "근무 경로를 틀",
  "근무경로를 틀",
];

/**
 * P11-7-2I-4 / B4: offer × workplace rearrange surfaces.
 * bare "오퍼"/"재배치"/"축" 단독 changeJob 금지.
 * offer context와 "근무 축을 재배치"가 함께일 때만 evidence가 된다.
 */
const JOB_CHANGE_OFFER_CONTEXT_MARKERS: readonly string[] = [
  "오퍼",
];

const JOB_CHANGE_WORKPLACE_REARRANGE_SURFACES: readonly string[] = [
  "근무 축을 재배치",
  "근무축을 재배치",
];

/**
 * job noun × change-verb compound용 활용형.
 * CHANGE_JOB_SIGNAL_KEYWORDS / decisionRules에 단독 추가하지 않는다.
 * "바꾸다"/"바"/"변경"/"전환"/"갈아타" 단독 substring 금지.
 * 연결형(바꾸면서/바꾸고/…)은 아래 CONNECTIVE 목록으로만 취급한다.
 */
const CHANGE_JOB_COMPOUND_VERBS: readonly string[] = [
  "바꿔도",
  "바꿔야",
  "바꾸는",
  "바꿀",
  "바꾸어도",
  "바꾸어야",
  "변경해도",
  "변경해야",
  "변경하는",
  "변경할",
  "전환해도",
  "전환해야",
  "전환하는",
  "전환할",
  "갈아타도",
  "갈아타야",
  "갈아타는",
  "갈아탈",
  // P11-7-2I-7 / B6: 근무처/고용주 × 재선택*
  // bare "재선택"/"선택" 단독·인생/진로 재선택은 job noun gate 밖.
  "재선택해도",
  "재선택해야",
  "재선택하는",
  "재선택할",
  "재선택할지",
  "재선택할까",
  "재선택하고",
  "재선택한",
  "재선택",
];

/**
 * job noun × change-verb compound용 연결형 활용.
 * 일반 changeJob vocabulary / CHANGE_JOB_COMPOUND_VERBS / decisionRules에
 * 전역 추가하지 않는다. job noun과 결합될 때만 evidence로 쓴다.
 * primary DecisionTarget 승격 정책이 아니며, start primary를 빼앗지 않는다.
 */
const CHANGE_JOB_COMPOUND_CONNECTIVE_VERBS: readonly string[] = [
  "바꾸면서",
  "바꾸고 나서",
  "바꾼 뒤",
  "바꾸고",
  "변경하면서",
  "변경하고 나서",
  "변경한 뒤",
  "변경하고",
  "전환하면서",
  "전환하고 나서",
  "전환한 뒤",
  "전환하고",
  "갈아타면서",
  "갈아타고 나서",
  "갈아탄 뒤",
  "갈아타고",
];

function collectMatchedDecisionKeywords(
  question: string,
  keywords: readonly string[],
): string[] {
  return keywords.filter((keyword) =>
    matchesDecisionKeyword(question, keyword)
  );
}

/**
 * remnant와 동일한 particle regex로
 * `N을/를 + 매수|매입|구입`의 object surface만 추출한다.
 * remnant 계약/앵커는 변경하지 않는다.
 */
function extractStructuralBuyObjectSurface(
  question: string,
): string | undefined {
  let earliestAnchorIndex = Number.POSITIVE_INFINITY;

  for (const anchor of STRUCTURAL_REAL_ESTATE_BUY_VERB_ANCHORS) {
    const index = findKoreanKeywordEarliestIndex(question, anchor);
    if (index < 0) {
      continue;
    }
    if (index < earliestAnchorIndex) {
      earliestAnchorIndex = index;
    }
  }

  if (!Number.isFinite(earliestAnchorIndex)) {
    return undefined;
  }

  const beforeAnchor = question.slice(0, earliestAnchorIndex);
  const particleMatch = beforeAnchor.match(
    /([가-힣0-9]+(?:\s+[가-힣0-9]+){0,3})[을를]\s*$/,
  );

  if (!particleMatch) {
    return undefined;
  }

  const surface = particleMatch[1]?.trim();
  return surface || undefined;
}

function isFinancialAssetBuyObjectSurface(
  surface: string,
): boolean {
  const normalized = normalizeKoreanText(surface);
  return FINANCIAL_ASSET_BUY_OBJECT_MARKERS.some((marker) => {
    const normalizedMarker = normalizeKoreanText(marker);
    return (
      normalized === normalizedMarker
      || normalized.endsWith(` ${normalizedMarker}`)
      || normalized.startsWith(`${normalizedMarker} `)
      || normalized.includes(` ${normalizedMarker} `)
    );
  });
}

function isCashflowMoneyBuyObjectSurface(
  surface: string,
): boolean {
  const normalized = normalizeKoreanText(surface);
  return CASHFLOW_MONEY_BUY_OBJECT_EXCLUSIONS.some((marker) => {
    const normalizedMarker = normalizeKoreanText(marker);
    return (
      normalized === normalizedMarker
      || normalized.endsWith(` ${normalizedMarker}`)
      || normalized.startsWith(`${normalizedMarker} `)
      || normalized.includes(` ${normalizedMarker} `)
    );
  });
}

function isGeneralGoodsBuyObjectSurface(
  surface: string,
): boolean {
  const normalized = normalizeKoreanText(surface);
  return GENERAL_GOODS_BUY_OBJECT_EXCLUSIONS.some((marker) => {
    const normalizedMarker = normalizeKoreanText(marker);
    return (
      normalized === normalizedMarker
      || normalized.endsWith(` ${normalizedMarker}`)
      || normalized.startsWith(`${normalizedMarker} `)
      || normalized.includes(` ${normalizedMarker} `)
    );
  });
}

function isOrganizationBuyObjectSurface(
  surface: string,
): boolean {
  const normalized = normalizeKoreanText(surface);
  return ORGANIZATION_BUY_OBJECT_EXCLUSIONS.some((marker) => {
    const normalizedMarker = normalizeKoreanText(marker);
    return (
      normalized === normalizedMarker
      || normalized.endsWith(` ${normalizedMarker}`)
      || normalized.startsWith(`${normalizedMarker} `)
      || normalized.includes(` ${normalizedMarker} `)
    );
  });
}

function isIndefiniteDeicticBuyObjectSurface(
  surface: string,
): boolean {
  const normalized = normalizeKoreanText(surface);
  return INDEFINITE_DEICTIC_BUY_OBJECT_EXCLUSIONS.some((marker) => {
    const normalizedMarker = normalizeKoreanText(marker);
    return (
      normalized === normalizedMarker
      || normalized.endsWith(` ${normalizedMarker}`)
      || normalized.startsWith(`${normalizedMarker} `)
      || normalized.includes(` ${normalizedMarker} `)
    );
  });
}

function isProtectedTopicCompoundObjectSurface(
  surface: string,
): boolean {
  const normalized = normalizeKoreanText(surface);
  const matchesProtectedNoun = (noun: string): boolean => {
    const normalizedNoun = normalizeKoreanText(noun);
    return (
      normalized === normalizedNoun
      || normalized.endsWith(` ${normalizedNoun}`)
      || normalized.startsWith(`${normalizedNoun} `)
      || normalized.includes(` ${normalizedNoun} `)
    );
  };
  return (
    BUSINESS_TOPIC_COMPOUND_NOUNS.some(matchesProtectedNoun)
    || JOB_TOPIC_COMPOUND_NOUNS.some(matchesProtectedNoun)
  );
}

/**
 * unknown object + 매수|매입|구입 structural realEstate buy 증거.
 * - bare 매수(목적어 없음) → []
 * - 금융자산 object → [] (money|invest 유지)
 * - cashflow/general money object → [] (realEstate buy 과승격 방지)
 * - 일반 상품 object → [] (realEstate buy 과승격 방지)
 * - 조직 object → [] (realEstate buy 과승격 방지)
 * - 부정칭/지시칭 object → [] (realEstate buy 과승격 방지)
 * - business/job compound noun → [] (기존 pair 우선순위 보존)
 * - vocabulary에 고유명사를 추가하지 않고 판정용 마커만 반환
 */
function collectStructuralRealEstateBuyObjectEvidence(
  question: string,
): string[] {
  const surface = extractStructuralBuyObjectSurface(question);
  if (!surface) {
    return [];
  }

  if (isFinancialAssetBuyObjectSurface(surface)) {
    return [];
  }

  if (isCashflowMoneyBuyObjectSurface(surface)) {
    return [];
  }

  if (isGeneralGoodsBuyObjectSurface(surface)) {
    return [];
  }

  if (isOrganizationBuyObjectSurface(surface)) {
    return [];
  }

  if (isIndefiniteDeicticBuyObjectSurface(surface)) {
    return [];
  }

  if (isProtectedTopicCompoundObjectSurface(surface)) {
    return [];
  }

  return [STRUCTURAL_REAL_ESTATE_BUY_OBJECT_MARKER];
}

function collectRealEstateBuySignalEvidence(
  question: string,
): string[] {
  const propertyEvidence = collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_BUY_PROPERTY_NOUNS,
  );
  const objectEvidence =
    propertyEvidence.length > 0
      ? propertyEvidence
      : collectStructuralRealEstateBuyObjectEvidence(question);

  if (objectEvidence.length === 0) {
    return [];
  }

  const buyVerbEvidence = collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_BUY_VERBS,
  );

  if (buyVerbEvidence.length === 0) {
    return [];
  }

  return [...objectEvidence, ...buyVerbEvidence];
}

/**
 * J-4-10: property noun + sell verb compound evidence.
 * buy compound와 대칭이며, sell 단독 keyword만으로는 빈 배열을 반환한다.
 */
function collectRealEstateSellSignalEvidence(
  question: string,
): string[] {
  const propertyEvidence = collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_BUY_PROPERTY_NOUNS,
  );

  if (propertyEvidence.length === 0) {
    return [];
  }

  const sellVerbEvidence = collectRealEstateSellCompoundVerbEvidence(question);

  if (sellVerbEvidence.length === 0) {
    return [];
  }

  return [...propertyEvidence, ...sellVerbEvidence];
}

/**
 * business × start compound용 action evidence.
 * 1) inherent start signal (시작/창업/개업/새로)
 * 2) business paraphrase 활용형 (차려·열어 계열)
 * decisionRules 전역 keyword로 승격하지 않는다.
 * 설립은 entity compound 전용이므로 여기 포함하지 않는다.
 */
function collectBusinessStartActionEvidence(
  question: string,
): string[] {
  return [
    ...collectMatchedDecisionKeywords(
      question,
      BUSINESS_START_SIGNAL_KEYWORDS,
    ),
    ...collectBusinessStartCompoundVerbEvidence(question),
  ];
}

/**
 * business noun × 차려/열어 paraphrase용 verb evidence.
 * bare "차리"/"열" 단독 substring은 쓰지 않는다.
 */
function collectBusinessStartCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    BUSINESS_START_COMPOUND_VERBS,
  );
}

/**
 * P10 G4: business noun × 운영 paraphrase용 verb evidence.
 * bare "운영" 단독 substring은 쓰지 않는다.
 * P11-6-2: keep-going(끊지 않고/굴려가*) paraphrase도 동일 gate로 수집한다.
 */
function collectBusinessContinueCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    BUSINESS_CONTINUE_COMPOUND_VERBS,
  );
}

/**
 * P11-6-2 / A1: business noun × keep-going paraphrase용 verb evidence.
 * bare "끊다"/"굴리다" 단독 substring은 쓰지 않는다.
 * P11-7-2I-1: keep-alive(살려두·붙잡아두·접지 않고·스톨시키지 않)도
 * 동일 keep-going evidence 경로로 수집한다.
 */
function collectBusinessContinueKeepGoingVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    [
      ...BUSINESS_CONTINUE_KEEP_GOING_COMPOUND_VERBS,
      ...BUSINESS_CONTINUE_KEEP_ALIVE_COMPOUND_VERBS,
    ],
  );
}

/**
 * P11-6-2 / A1: business noun + 끊지 않고/굴려가 compound evidence.
 * keep-going 단독 keyword만으로는 빈 배열을 반환한다.
 * 관계/연락/프로젝트/팀 등 non-business noun은 진입하지 않는다.
 */
function collectBusinessContinueKeepGoingSignalEvidence(
  question: string,
): string[] {
  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_TOPIC_COMPOUND_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  const keepGoingVerbEvidence = collectBusinessContinueKeepGoingVerbEvidence(
    question,
  );

  if (keepGoingVerbEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...keepGoingVerbEvidence];
}

/**
 * P11-6-2 / A1: keep-going paraphrase → continuation intent candidate.
 * intentRules continuation vocabulary에는 추가하지 않는다.
 * business noun gate를 통과한 compound evidence만 사용한다.
 *
 * 보호:
 * - continuation frame은 주입하지 않는다.
 *   (J-4-3-2가 invest 등 specific/generic action을 continue로 덮는 것을 방지)
 * - Phase 1 decisionTarget이 continue/none이 아니면 intent도 주입하지 않는다.
 *   (매수/투자 등 기존 scalar 우선순위·option-fit 보호)
 */
function appendBusinessContinueKeepGoingIntentCandidates(
  question: string,
  intents: MeaningCandidate<ReaderIntentLiteral>[],
  decisionTargets: readonly MeaningCandidate<DecisionTarget>[],
): void {
  // P11-7-2I-14 / A1-06: preference split이 있으면 after-arm evidence만 사용한다.
  // 최종 DT→intent 덮어쓰기가 아니라 실제 keep-alive/keep-going evidence 기반이다.
  const preferenceSplitIndex =
    findBusinessStartContinuePreferenceSplitIndex(question);
  const evidenceQuestion =
    preferenceSplitIndex >= 0
      ? question.slice(preferenceSplitIndex + "보다".length)
      : question;
  const evidence = collectBusinessContinueKeepGoingSignalEvidence(
    evidenceQuestion,
  );

  if (evidence.length === 0) {
    return;
  }

  const phase1Decision = selectLowestPriorityCandidate(decisionTargets);
  const phase1Value = phase1Decision?.value ?? "none";

  if (phase1Value !== "none" && phase1Value !== "continue") {
    // 전역 Phase1 guard는 유지하고, A1-06 preference gate만 예외로 허용한다.
    if (
      !(
        phase1Value === "start"
        && preferenceSplitIndex >= 0
      )
    ) {
      return;
    }
  }

  intents.push({
    axis: "intent",
    value: "continuation",
    evidence,
    source: "compoundSignal",
    priority: intentRules.length + 1,
    strength: evidence.length,
    specificity: Math.max(...evidence.map((item) => item.length)),
  });
}

/**
 * P10 G4: business noun + 운영 paraphrase compound evidence.
 * 운영 단독 keyword만으로는 빈 배열을 반환한다.
 * 회사/직장 등 JOB noun은 BUSINESS_TOPIC_COMPOUND_NOUNS 밖이라 진입하지 않는다.
 * P11-6-2: 끊지 않고/굴려가 keep-going paraphrase도 동일 noun gate를 쓴다.
 */
function collectBusinessContinueSignalEvidence(
  question: string,
): string[] {
  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_TOPIC_COMPOUND_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  const operateVerbEvidence = collectBusinessContinueCompoundVerbEvidence(
    question,
  );

  if (operateVerbEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...operateVerbEvidence];
}

/**
 * P10 G5: business noun × 접다/폐업 paraphrase용 verb evidence.
 * bare "접다"/"접어"/"폐업" 단독 substring은 쓰지 않는다.
 * P11-6-3: 접고/접으면서/접은 뒤 + 손을 떼다 withdraw paraphrase도 동일 gate로 수집한다.
 * P11-7-2I-5: 끝내*|종료*|마무리*|닫아버리* end/close paraphrase도 동일 gate로 수집한다.
 * P11-7-2I-6: 이어가지 않*|계속하지 않* negated-continue paraphrase도 동일 gate로 수집한다.
 */
function collectBusinessStopCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    BUSINESS_STOP_COMPOUND_VERBS,
  );
}

/**
 * P11-6-3 / A2 + P11-7-2I-5 / B2 + P11-7-2I-6 / B9:
 * business noun × A2/B2/B9 paraphrase용 verb evidence.
 * bare "접다"/"떼다"/"끝내다"/"종료"/"마무리"/"닫아버리다"/
 * "이어가"/"계속"/"더 이상"/"않" 단독 substring은 쓰지 않는다.
 */
function collectBusinessStopA2VerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    BUSINESS_STOP_A2_COMPOUND_VERBS,
  );
}

/**
 * P11-6-3 / A2: business noun + 접고/손을 떼다 compound evidence.
 * A2 paraphrase 단독 keyword만으로는 빈 배열을 반환한다.
 * 관계/투자/업무/팀 등 non-business noun은 진입하지 않는다.
 */
function collectBusinessStopA2SignalEvidence(
  question: string,
): string[] {
  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_TOPIC_COMPOUND_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  const a2VerbEvidence = collectBusinessStopA2VerbEvidence(question);

  if (a2VerbEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...a2VerbEvidence];
}

/**
 * P11-6-3 / A2 + P11-7-2I-5 / B2 + P11-7-2I-6 / B9: business noun + A2/B2/B9
 * paraphrase → termination intent candidate.
 * intentRules termination vocabulary에는 추가하지 않는다.
 * business noun gate를 통과한 A2/B2/B9 compound evidence만 사용한다.
 *
 * 보호:
 * - termination frame은 주입하지 않는다.
 * - Phase 1 decisionTarget이 stop/none이 아니면 intent도 주입하지 않는다.
 *   (시작/투자/이직 등 기존 scalar 우선순위·composite 보호)
 * - reason 등 Phase 1 intent가 이미 있으면 selectLowestPriorityCandidate가
 *   rule priority를 유지하므로 reason을 termination으로 덮지 않는다.
 */
function appendBusinessStopWithdrawIntentCandidates(
  question: string,
  intents: MeaningCandidate<ReaderIntentLiteral>[],
  decisionTargets: readonly MeaningCandidate<DecisionTarget>[],
): void {
  const evidence = collectBusinessStopA2SignalEvidence(question);

  if (evidence.length === 0) {
    return;
  }

  const phase1Decision = selectLowestPriorityCandidate(decisionTargets);
  const phase1Value = phase1Decision?.value ?? "none";

  if (phase1Value !== "none" && phase1Value !== "stop") {
    return;
  }

  intents.push({
    axis: "intent",
    value: "termination",
    evidence,
    source: "compoundSignal",
    priority: intentRules.length + 1,
    strength: evidence.length,
    specificity: Math.max(...evidence.map((item) => item.length)),
  });
}

/**
 * P10 G5: business noun + 접다/폐업 paraphrase compound evidence.
 * 접다/폐업 단독 keyword만으로는 빈 배열을 반환한다.
 * 회사/직장 등 JOB noun·계획/책/일 등 비사업 목적어는
 * BUSINESS_TOPIC_COMPOUND_NOUNS 밖이라 진입하지 않는다.
 * P11-6-3: 접고/손을 떼다 withdraw paraphrase도 동일 noun gate를 쓴다.
 */
function collectBusinessStopSignalEvidence(
  question: string,
): string[] {
  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_TOPIC_COMPOUND_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  const stopVerbEvidence = collectBusinessStopCompoundVerbEvidence(question);

  if (stopVerbEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...stopVerbEvidence];
}

/**
 * P10 G6: property noun × 보유/가지고 있 paraphrase용 verb evidence.
 * bare "보유"/"가지고 있" 단독 substring은 쓰지 않는다.
 */
function collectRealEstateContinueCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_CONTINUE_COMPOUND_VERBS,
  );
}

/**
 * P10 G6: property noun + 보유/가지고 있 paraphrase compound evidence.
 * 보유/가지고 있 단독 keyword만으로는 빈 배열을 반환한다.
 * 현금/주식/ETF/코인/물건/상품은 REAL_ESTATE_BUY_PROPERTY_NOUNS 밖이라 진입하지 않는다.
 */
function collectRealEstateContinueSignalEvidence(
  question: string,
): string[] {
  const propertyEvidence = collectMatchedDecisionKeywords(
    question,
    REAL_ESTATE_BUY_PROPERTY_NOUNS,
  );

  if (propertyEvidence.length === 0) {
    return [];
  }

  const holdVerbEvidence = collectRealEstateContinueCompoundVerbEvidence(
    question,
  );

  if (holdVerbEvidence.length === 0) {
    return [];
  }

  return [...propertyEvidence, ...holdVerbEvidence];
}

/**
 * love/relationship × partner compound용 context noun.
 * topicRules love/relationship 명사를 재사용하되,
 * "인연"/"파트너"는 전역 partner keyword로 승격하지 않는다.
 * (인연은 아래 verb surface "인연 이어*"에만 둔다)
 */
const LOVE_RELATIONSHIP_PARTNER_CONTEXT_NOUNS: readonly string[] = [
  "연애",
  "연인",
  "남자친구",
  "여자친구",
  "애인",
  "썸",
  "관계",
  "궁합",
  "친구",
  "사람",
  "갈등",
  "화해",
  "동료",
];

/**
 * love/relationship object × 인연 이어* compound용 surface.
 * decisionRules partner / continue keyword에 전역 추가하지 않는다.
 * bare "인연"/"이어가" 단독 substring 금지.
 */
const LOVE_RELATIONSHIP_PARTNER_COMPOUND_VERBS: readonly string[] = [
  "인연 이어",
];

/**
 * love/relationship × 인연 이어* partner verb evidence.
 * bare "인연"/"이어가" 단독 substring은 쓰지 않는다.
 */
function collectLoveRelationshipPartnerCompoundVerbEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    LOVE_RELATIONSHIP_PARTNER_COMPOUND_VERBS,
  );
}

/**
 * love/relationship object + 인연 이어* compound evidence.
 * 인연 이어 단독·비관계 목적어만으로는 빈 배열을 반환한다.
 * 기존 business/co-op partner decisionRules 경로는 건드리지 않는다.
 */
function collectLoveRelationshipPartnerSignalEvidence(
  question: string,
): string[] {
  const contextEvidence = collectMatchedDecisionKeywords(
    question,
    LOVE_RELATIONSHIP_PARTNER_CONTEXT_NOUNS,
  );

  if (contextEvidence.length === 0) {
    return [];
  }

  const partnerVerbEvidence =
    collectLoveRelationshipPartnerCompoundVerbEvidence(question);

  if (partnerVerbEvidence.length === 0) {
    return [];
  }

  return [...contextEvidence, ...partnerVerbEvidence];
}

function hasLoveRelationshipPartnerCompoundSurface(
  question: string,
): boolean {
  return collectLoveRelationshipPartnerSignalEvidence(question).length > 0;
}

/**
 * P10 G2: entity noun × 설립 compound용 start signal evidence.
 * bare "설립" 단독으로는 topic/decision을 만들지 않는다.
 */
function collectBusinessEstablishStartSignalEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    BUSINESS_ESTABLISH_START_SIGNALS,
  );
}

/**
 * P10 G2-2: "인수인계" 구간을 제거한 질의에서만 인수 signal을 본다.
 * bare includes("인수")가 인수인계를 오탐하지 않게 한다.
 */
function questionWithoutHandoverAcquireSurface(
  question: string,
): string {
  return question.split("인수인계").join("");
}

/**
 * P10 G2-2 / P11-6-6 A3-1: entity noun × 인수|매입|구입 compound용 buy signal evidence.
 * bare "인수"/"매입"/"구입" 단독으로는 topic/decision을 만들지 않는다.
 * "인수인계"는 제외한다.
 */
function collectBusinessAcquireBuyActionEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    questionWithoutHandoverAcquireSurface(question),
    BUSINESS_ACQUIRE_BUY_SIGNALS,
  );
}

/**
 * P10 G2-2 / P11-6-6 A3-1: business/entity noun + 인수|매입|구입 compound evidence.
 * 인수·매입·구입 단독 keyword만으로는 빈 배열을 반환한다.
 * entity noun × 인수|매입|구입 → business × buy 로 수렴한다 (새 acquire DT 없음).
 * realEstate × 매입/구입·money × 매입/구입 경로는 기존 규칙을 유지한다.
 */
function collectBusinessAcquireBuySignalEvidence(
  question: string,
): string[] {
  const acquireSignalEvidence = collectBusinessAcquireBuyActionEvidence(
    question,
  );

  if (acquireSignalEvidence.length === 0) {
    return [];
  }

  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_ACQUIRE_ENTITY_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...acquireSignalEvidence];
}

/**
 * P11-6-6 A3-2: business entity × colloquial 사* compound용 buy verb evidence.
 * bare "사다" 계열 단독으로는 topic/decision을 만들지 않는다.
 * REAL_ESTATE_BUY_VERBS / MONEY_FINANCIAL_ASSET_BUY_VERBS는 수정하지 않는다.
 */
function collectBusinessColloquialBuyActionEvidence(
  question: string,
): string[] {
  return collectMatchedDecisionKeywords(
    question,
    BUSINESS_COLLOQUIAL_BUY_VERBS,
  );
}

/**
 * P11-6-6 A3-2: business entity/object + colloquial 사* compound evidence.
 * 사* 단독·회사·부동산·금융자산·일반물건만으로는 빈 배열을 반환한다.
 * entity × 사* → business × buy 로 수렴한다 (새 DT 없음).
 */
function collectBusinessColloquialBuySignalEvidence(
  question: string,
): string[] {
  const buyVerbEvidence = collectBusinessColloquialBuyActionEvidence(question);

  if (buyVerbEvidence.length === 0) {
    return [];
  }

  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_COLLOQUIAL_BUY_ENTITY_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...buyVerbEvidence];
}

/**
 * P11-7-2I-2 / B3: transfer-in verb evidence.
 * right noun이 있을 때만 영업권/사업권 × 가져오*를 합류한다.
 * bare 이전·양수·승계·가져오·테이크오버 단독으로는 topic/decision을 만들지 않는다.
 */
function collectBusinessAcquisitionTransferInVerbEvidence(
  question: string,
): string[] {
  const transferInEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_ACQUISITION_TRANSFER_IN_VERBS,
  );

  const rightNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_ACQUISITION_RIGHT_NOUNS,
  );
  const rightBringEvidence = rightNounEvidence.length > 0
    ? collectMatchedDecisionKeywords(
      question,
      BUSINESS_ACQUISITION_RIGHT_BRING_VERBS,
    )
    : [];

  return [...transferInEvidence, ...rightBringEvidence];
}

function isBusinessAcquisitionTransferInEvidenceToken(
  token: string,
): boolean {
  return BUSINESS_ACQUISITION_TRANSFER_IN_VERBS.includes(token)
    || BUSINESS_ACQUISITION_RIGHT_BRING_VERBS.includes(token);
}

/**
 * A-002: business × buy acquire evidence token.
 * BUSINESS_ACQUIRE_BUY_SIGNALS(인수|매입|구입) 소속만 true.
 * colloquial 사* / transfer-in / bare 사도 전역 승격에는 쓰지 않는다.
 */
function isBusinessAcquireBuyEvidenceToken(
  token: string,
): boolean {
  return BUSINESS_ACQUIRE_BUY_SIGNALS.includes(token);
}

/**
 * P11-7-2I-5 / B2: end/close paraphrase evidence token.
 * BUSINESS_STOP_END_CLOSE_COMPOUND_VERBS 소속만 true.
 * bare 끝내/종료/마무리/닫아버리 전역 승격에는 쓰지 않는다.
 */
function isBusinessStopEndCloseEvidenceToken(
  token: string,
): boolean {
  return BUSINESS_STOP_END_CLOSE_COMPOUND_VERBS.includes(token);
}

/**
 * P11-7-2I-6 / B9: negated-continue paraphrase evidence token.
 * BUSINESS_STOP_NEGATED_CONTINUE_COMPOUND_VERBS 소속만 true.
 * bare 이어가/계속/더 이상/않 전역 승격에는 쓰지 않는다.
 */
function isBusinessStopNegatedContinueEvidenceToken(
  token: string,
): boolean {
  return BUSINESS_STOP_NEGATED_CONTINUE_COMPOUND_VERBS.includes(token);
}

/**
 * P11-7-2I-10 / A1: keep-alive/keep-going continue evidence token.
 * operate(운영*)는 포함하지 않는다 — selection+운영 generic은 기존 경로 유지.
 * bare 살려두/붙잡/스톨/끊다/굴리다 전역 승격에는 쓰지 않는다.
 */
function isBusinessContinueKeepAliveOrKeepGoingEvidenceToken(
  token: string,
): boolean {
  return BUSINESS_CONTINUE_KEEP_ALIVE_COMPOUND_VERBS.includes(token)
    || BUSINESS_CONTINUE_KEEP_GOING_COMPOUND_VERBS.includes(token);
}

/**
 * P11-7-2I-10: J-4-10 D2 exclusive_alt → choose 로부터
 * business keep-alive continue / negated-continue stop concrete DT를 보호한다.
 * Intent는 변경하지 않는다.
 */
function isBusinessKeepAliveOrNegatedContinueProtectedFromExclusiveAltChoose(
  topic: QuestionTopic,
  decisionTarget: DecisionTarget,
  decisionEvidence: readonly string[],
): boolean {
  if (topic !== "business") {
    return false;
  }

  if (decisionTarget === "continue") {
    return decisionEvidence.some((token) =>
      isBusinessContinueKeepAliveOrKeepGoingEvidenceToken(token)
    );
  }

  if (decisionTarget === "stop") {
    return decisionEvidence.some((token) =>
      isBusinessStopNegatedContinueEvidenceToken(token)
    );
  }

  return false;
}

/**
 * P11-7-2I-2 / B3: operating-right/entity + transfer-in compound evidence.
 * transfer-in 단독·비사업 목적어만으로는 빈 배열을 반환한다.
 * entity × transfer-in → business × buy 로 수렴한다 (새 DT 없음).
 */
function collectBusinessAcquisitionBuySignalEvidence(
  question: string,
): string[] {
  const transferInEvidence = collectBusinessAcquisitionTransferInVerbEvidence(
    question,
  );

  if (transferInEvidence.length === 0) {
    return [];
  }

  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    BUSINESS_ACQUISITION_ENTITY_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...transferInEvidence];
}

/**
 * J-4-4: business noun + start signal compound evidence.
 * start 단독 keyword만으로는 빈 배열을 반환한다.
 * P10 G2: entity noun + 설립도 동일하게 business × start로 수렴한다.
 */
function collectBusinessStartSignalEvidence(
  question: string,
): string[] {
  const establishSignalEvidence = collectBusinessEstablishStartSignalEvidence(
    question,
  );
  const businessNounEvidence = collectMatchedDecisionKeywords(
    question,
    establishSignalEvidence.length > 0
      ? BUSINESS_ESTABLISH_ENTITY_NOUNS
      : BUSINESS_TOPIC_COMPOUND_NOUNS,
  );

  if (businessNounEvidence.length === 0) {
    return [];
  }

  const startSignalEvidence = [
    ...collectBusinessStartActionEvidence(question),
    ...establishSignalEvidence,
  ];

  if (startSignalEvidence.length === 0) {
    return [];
  }

  return [...businessNounEvidence, ...startSignalEvidence];
}

function hasRealEstateBuySignal(
  question:
    string,
): boolean {
  return collectRealEstateBuySignalEvidence(question).length > 0;
}

/**
 * job noun + leave-verb compound용 verb evidence.
 * leaveJob 단독 keyword / 전역 "떠나다"로 topic·decision을 만들지 않는다.
 * 연결형은 job noun compound 경로에서만 합류한다.
 */
function collectLeaveJobCompoundVerbEvidence(
  question: string,
): string[] {
  return [
    ...new Set([
      ...collectMatchedDecisionKeywords(
        question,
        JOB_LEAVE_COMPOUND_VERBS,
      ),
      ...collectMatchedDecisionKeywords(
        question,
        JOB_LEAVE_COMPOUND_CONNECTIVE_VERBS,
      ),
    ]),
  ];
}

/**
 * P11-7-2I-3 / B5: employment noun × disconnect|exit|end evidence.
 * bare disconnect/exit/end 단독·비고용 목적어만으로는 빈 배열을 반환한다.
 */
function collectLeaveJobEmploymentTerminationEvidence(
  question: string,
): string[] {
  const employmentNounEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_EMPLOYMENT_LEAVE_CONTEXT_NOUNS,
  );

  if (employmentNounEvidence.length === 0) {
    return [];
  }

  const terminationVerbEvidence = [
    ...collectMatchedDecisionKeywords(
      question,
      JOB_LEAVE_DISCONNECT_COMPOUND_VERBS,
    ),
    ...collectMatchedDecisionKeywords(
      question,
      JOB_LEAVE_END_COMPOUND_VERBS,
    ),
    ...collectMatchedDecisionKeywords(
      question,
      JOB_LEAVE_EXIT_COMPOUND_VERBS,
    ),
  ];

  if (terminationVerbEvidence.length === 0) {
    return [];
  }

  return [...employmentNounEvidence, ...terminationVerbEvidence];
}

/**
 * P11-7-2I-3 / B5: job/employment noun × 내려놓·자리를 놓 evidence.
 * bare 내려놓/자리를 놓 단독·비job·비고용 목적어만으로는 빈 배열을 반환한다.
 */
function collectLeaveJobPutdownEvidence(
  question: string,
): string[] {
  const jobNounEvidence = [
    ...new Set([
      ...collectMatchedDecisionKeywords(
        question,
        JOB_TOPIC_COMPOUND_NOUNS,
      ),
      ...collectMatchedDecisionKeywords(
        question,
        JOB_EMPLOYMENT_LEAVE_CONTEXT_NOUNS,
      ),
    ]),
  ];

  if (jobNounEvidence.length === 0) {
    return [];
  }

  const putdownVerbEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_LEAVE_PUTDOWN_COMPOUND_VERBS,
  );

  if (putdownVerbEvidence.length === 0) {
    return [];
  }

  return [...jobNounEvidence, ...putdownVerbEvidence];
}

function isJobLeaveGeneralizationEvidenceToken(
  token: string,
): boolean {
  return JOB_LEAVE_DISCONNECT_COMPOUND_VERBS.includes(token)
    || JOB_LEAVE_END_COMPOUND_VERBS.includes(token)
    || JOB_LEAVE_PUTDOWN_COMPOUND_VERBS.includes(token)
    || JOB_LEAVE_EXIT_COMPOUND_VERBS.includes(token)
    || JOB_EMPLOYMENT_LEAVE_CONTEXT_NOUNS.includes(token);
}

/**
 * leaveJob evidence:
 * 1) inherent signal (퇴사/그만두·직장·회사+그만)
 * 2) JOB_TOPIC_COMPOUND_NOUNS × leave-verb compound
 *    (직장/회사/직업/직무/소속 + 떠나도/떠나야/떠나는/떠날
 *     또는 관둬도/관둬야/관두는/관둘 계열
 *     또는 떠나면서/떠나고/관두면서/관두고 등 연결형)
 * 3) P11-7-2I-3 / B5 + P11-7-2I-7 / B6:
 *    employment noun × disconnect|exit|end
 *    (고용/급여직/월급 자리/자리 × disconnect/exit/끝내·나오 계열)
 *    또는 job/employment noun × put-down
 *    (직장/회사/자리 등 × 내려놓·자리를 놓 계열)
 */
function collectLeaveJobSignalEvidence(
  question: string,
): string[] {
  const inherentEvidence = collectMatchedDecisionKeywords(
    question,
    LEAVE_JOB_SIGNAL_KEYWORDS,
  );

  const jobNounEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_TOPIC_COMPOUND_NOUNS,
  );

  const leaveVerbEvidence = jobNounEvidence.length > 0
    ? collectLeaveJobCompoundVerbEvidence(question)
    : [];

  const classicCompoundEvidence = jobNounEvidence.length > 0
    && leaveVerbEvidence.length > 0
    ? [...jobNounEvidence, ...leaveVerbEvidence]
    : [];

  const employmentTerminationEvidence =
    collectLeaveJobEmploymentTerminationEvidence(question);
  const putdownEvidence = collectLeaveJobPutdownEvidence(question);

  return [
    ...new Set([
      ...inherentEvidence,
      ...classicCompoundEvidence,
      ...employmentTerminationEvidence,
      ...putdownEvidence,
    ]),
  ];
}

function hasLeaveJobSignal(
  question:
    string,
): boolean {
  return collectLeaveJobSignalEvidence(question).length > 0;
}

/**
 * P11-7-2I-3 / B5: employment/job leaveJob이 확정·증거되면
 * "관계…끊" interpersonal separation post-normalize를 건너뛴다.
 * bare 연인/연락 관계 끊은 leaveJob signal이 없어 기존 separate 경로를 유지한다.
 */
function applyRelationshipSeparationNormalizationUnlessJobLeave<
  T extends Parameters<typeof applyRelationshipSeparationNormalization>[0],
>(
  result: T,
): T {
  if (
    result.decisionTarget === "leaveJob"
    || hasLeaveJobSignal(result.normalizedQuestion)
  ) {
    return result;
  }

  return applyRelationshipSeparationNormalization(result);
}

/**
 * job noun + change-verb compound용 verb evidence.
 * changeJob 단독 keyword / 전역 "바꾸다"로 topic·decision을 만들지 않는다.
 * 연결형은 job noun compound 경로에서만 합류한다.
 */
function collectChangeJobCompoundVerbEvidence(
  question: string,
): string[] {
  return [
    ...new Set([
      ...collectMatchedDecisionKeywords(
        question,
        CHANGE_JOB_COMPOUND_VERBS,
      ),
      ...collectMatchedDecisionKeywords(
        question,
        CHANGE_JOB_COMPOUND_CONNECTIVE_VERBS,
      ),
    ]),
  ];
}

/**
 * P11-7-2I-4 / B4: alternate employer/workplace destination × move evidence.
 * bare 이동/옮·"다른 곳"만으로는 빈 배열을 반환한다.
 */
function collectChangeJobAlternateDestinationMoveEvidence(
  question: string,
): string[] {
  const destinationEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_ALTERNATE_DESTINATION_MARKERS,
  );

  if (destinationEvidence.length === 0) {
    return [];
  }

  const moveVerbEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_ALTERNATE_MOVE_COMPOUND_VERBS,
  );

  if (moveVerbEvidence.length === 0) {
    return [];
  }

  return [...destinationEvidence, ...moveVerbEvidence];
}

/**
 * changeJob 전용: employment context noun × 자리 옮* evidence.
 * bare 자리/옮·비고용 목적어만으로는 빈 배열을 반환한다.
 * leaveJob "자리를 놓" 경로와 공유하지 않는다.
 */
function collectChangeJobEmploymentSeatMoveEvidence(
  question: string,
): string[] {
  const employmentContextEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_EMPLOYMENT_CONTEXT_NOUNS,
  );

  if (employmentContextEvidence.length === 0) {
    return [];
  }

  const seatMoveEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_EMPLOYMENT_SEAT_MOVE_SURFACES,
  );

  if (seatMoveEvidence.length === 0) {
    return [];
  }

  return [...employmentContextEvidence, ...seatMoveEvidence];
}

/**
 * P11-7-2I-4 / B4: employment/workplace context × 근무 경로 틀* evidence.
 * bare 경로/틀다·인생/삶 경로만으로는 빈 배열을 반환한다.
 */
function collectChangeJobWorkplacePathTurnEvidence(
  question: string,
): string[] {
  const employmentContextEvidence = [
    ...collectMatchedDecisionKeywords(
      question,
      JOB_CHANGE_EMPLOYMENT_CONTEXT_NOUNS,
    ),
    ...collectMatchedDecisionKeywords(
      question,
      JOB_TOPIC_COMPOUND_NOUNS,
    ),
    ...collectMatchedDecisionKeywords(
      question,
      JOB_CHANGE_ALTERNATE_DESTINATION_MARKERS,
    ),
  ];

  if (employmentContextEvidence.length === 0) {
    return [];
  }

  const pathTurnEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_WORKPLACE_PATH_TURN_SURFACES,
  );

  if (pathTurnEvidence.length === 0) {
    return [];
  }

  return [
    ...new Set([
      ...employmentContextEvidence,
      ...pathTurnEvidence,
    ]),
  ];
}

/**
 * P11-7-2I-4 / B4: offer context × 근무 축 재배치 evidence.
 * bare 오퍼/재배치/축만으로는 빈 배열을 반환한다.
 */
function collectChangeJobOfferWorkplaceRearrangeEvidence(
  question: string,
): string[] {
  const offerEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_OFFER_CONTEXT_MARKERS,
  );

  if (offerEvidence.length === 0) {
    return [];
  }

  const rearrangeEvidence = collectMatchedDecisionKeywords(
    question,
    JOB_CHANGE_WORKPLACE_REARRANGE_SURFACES,
  );

  if (rearrangeEvidence.length === 0) {
    return [];
  }

  return [...offerEvidence, ...rearrangeEvidence];
}

function isJobChangeGeneralizationEvidenceToken(
  token: string,
): boolean {
  return JOB_CHANGE_EMPLOYMENT_CONTEXT_NOUNS.includes(token)
    || JOB_CHANGE_ALTERNATE_DESTINATION_MARKERS.includes(token)
    || JOB_CHANGE_ALTERNATE_MOVE_COMPOUND_VERBS.includes(token)
    || JOB_CHANGE_WORKPLACE_PATH_TURN_SURFACES.includes(token)
    || JOB_CHANGE_OFFER_CONTEXT_MARKERS.includes(token)
    || JOB_CHANGE_WORKPLACE_REARRANGE_SURFACES.includes(token)
    || JOB_CHANGE_EMPLOYMENT_SEAT_MOVE_SURFACES.includes(token);
}

/**
 * changeJob evidence:
 * 1) inherent signal (이직/전직/직장·회사+옮)
 * 2) JOB_TOPIC_COMPOUND_NOUNS ∪ employment/workplace noun × change-verb compound
 *    (직업/직장/회사/직무/소속/고용주/근무처/알바/정규직 + 바꿔도/변경해도/전환해도/갈아타도 계열
 *     또는 바꾸면서/변경하고/전환하고/갈아타고 등 연결형)
 * 3) P11-7-2I-4 / B4:
 *    alternate employer/workplace destination × move
 *    또는 employment/workplace × 근무 경로 틀*
 *    또는 offer × 근무 축 재배치
 *    또는 employment context × 자리 옮*
 */
function collectChangeJobSignalEvidence(
  question: string,
): string[] {
  const inherentEvidence = collectMatchedDecisionKeywords(
    question,
    CHANGE_JOB_SIGNAL_KEYWORDS,
  );

  const jobNounEvidence = [
    ...new Set([
      ...collectMatchedDecisionKeywords(
        question,
        JOB_TOPIC_COMPOUND_NOUNS,
      ),
      ...collectMatchedDecisionKeywords(
        question,
        JOB_CHANGE_EMPLOYMENT_CONTEXT_NOUNS,
      ),
    ]),
  ];

  const changeVerbEvidence = jobNounEvidence.length > 0
    ? collectChangeJobCompoundVerbEvidence(question)
    : [];

  const classicCompoundEvidence = jobNounEvidence.length > 0
    && changeVerbEvidence.length > 0
    ? [...jobNounEvidence, ...changeVerbEvidence]
    : [];

  const alternateDestinationMoveEvidence =
    collectChangeJobAlternateDestinationMoveEvidence(question);
  const workplacePathTurnEvidence =
    collectChangeJobWorkplacePathTurnEvidence(question);
  const offerRearrangeEvidence =
    collectChangeJobOfferWorkplaceRearrangeEvidence(question);
  const employmentSeatMoveEvidence =
    collectChangeJobEmploymentSeatMoveEvidence(question);

  return [
    ...new Set([
      ...inherentEvidence,
      ...classicCompoundEvidence,
      ...alternateDestinationMoveEvidence,
      ...workplacePathTurnEvidence,
      ...offerRearrangeEvidence,
      ...employmentSeatMoveEvidence,
    ]),
  ];
}

function hasChangeJobSignal(
  question:
    string,
): boolean {
  return collectChangeJobSignalEvidence(question).length > 0;
}

function detectUrgency(question: string): {
  urgency: QuestionUrgency;
  evidence: string[];
} {
  const immediateKeywords = [
    "지금",
    "당장",
    "오늘",
    "이번 달",
    "이번달",
    "곧",
    "급해",
    "급한",
  ];

  const nearTermKeywords = [
    "올해",
    "내년",
    "몇 달",
    "몇달",
    "조만간",
    "이번 해",
  ];

  const longTermKeywords = [
    "앞으로",
    "장기",
    "평생",
    "노후",
    "말년",
    "향후",
  ];

  const immediateEvidence = immediateKeywords.filter((keyword) =>
    question.includes(keyword),
  );

  if (immediateEvidence.length > 0) {
    return {
      urgency: "immediate",
      evidence: immediateEvidence,
    };
  }

  const nearTermEvidence = nearTermKeywords.filter((keyword) =>
    question.includes(keyword),
  );

  if (nearTermEvidence.length > 0) {
    return {
      urgency: "nearTerm",
      evidence: nearTermEvidence,
    };
  }

  const longTermEvidence = longTermKeywords.filter((keyword) =>
    question.includes(keyword),
  );

  if (longTermEvidence.length > 0) {
    return {
      urgency: "longTerm",
      evidence: longTermEvidence,
    };
  }

  return {
    urgency: "unknown",
    evidence: [],
  };
}

function detectTimingType(
  question: string,
): QuestionTimingType {
  if (
    /기다(?:리|려|렸)/.test(question) ||
    /미(?:루|뤄|뤘)/.test(question) ||
    question.includes("보류")
  ) {
    return "waitingTiming";
  }

  if (
    question.includes("지금") ||
    question.includes("당장") ||
    question.includes("바로") ||
    question.includes("오늘")
  ) {
    return "executionTiming";
  }

  if (
    question.includes("언제") ||
    question.includes("몇 월") ||
    question.includes("몇월") ||
    question.includes("시기") ||
    question.includes("올해") ||
    question.includes("내년")
  ) {
    return "bestTiming";
  }

  return "unknown";
}

export function buildAsksWhat(topic: QuestionTopic, intent: QuestionIntent): string {
  const topicText: Record<QuestionTopic, string> = {
    business: "사업과 창업의 적합성",
    money: "재물과 자금의 흐름",
    job: "직업과 직장 선택",
    realEstate: "부동산 판단",
    relationship: "사람 사이의 관계",
    love: "연애와 인연",
    marriage: "결혼과 배우자 관계",
    family: "가족 관계",
    health: "건강상의 주의와 대응",
    legal: "법적 분쟁과 관재 대응",
    lifeFlow: "현재와 앞으로의 운의 흐름",
    lifeDirection: "인생의 방향과 선택",
    general: "현재 고민에 대한 종합 판단",
  };

  const intentText: Record<QuestionIntent, string> = {
    permission: "가능한지",
    evaluation: "전체적으로 어떻게 판단해야 하는지",
    timing: "언제 움직여야 하는지",
    reason: "왜 이런 상황이 생겼는지",
    method: "어떻게 대응해야 하는지",
    risk: "어떤 위험이 있는지",
    comparison: "두 선택 중 무엇이 나은지",
    selection: "무엇을 선택해야 하는지",
    prediction: "앞으로 어떤 결과가 예상되는지",
    existence: "관련 운이나 구조의 존재 여부",
  };

  return `${topicText[topic]}이 ${intentText[intent]}를 묻고 있다.`;
}

function buildAsksWhy(motive: QuestionMotive): string {
  const motiveText: Record<QuestionMotive, string> = {
    opportunityCapture: "눈앞의 기회를 잡아도 되는지 확인하려는 질문이다.",
    expansion: "현재보다 더 크게 확장해도 되는지 판단하려는 질문이다.",
    recovery: "무너진 상황을 다시 회복할 수 있는지 확인하려는 질문이다.",
    survival: "현재의 생계와 현실적인 생존 문제를 해결하려는 질문이다.",
    lossAvoidance: "손실이나 실패를 피하기 위해 미리 위험을 확인하려는 질문이다.",
    anxietyReduction: "불확실한 상황에서 판단의 확신을 얻으려는 질문이다.",
    relationshipConfirmation: "상대와의 관계가 이어질 수 있는지 확인하려는 질문이다.",
    lifeTransition: "삶의 중요한 전환점을 앞두고 방향을 결정하려는 질문이다.",
    selfUnderstanding: "자신의 반복되는 성향과 삶의 원인을 이해하려는 질문이다.",
    unspecified: "질문 속에 구체적인 숨은 동기가 아직 충분히 드러나지 않았다.",
  };

  return motiveText[motive];
}

export function buildDecisionQuestion(
  decisionTarget: DecisionTarget,
  topic: QuestionTopic,
): string {
  const decisionText: Record<DecisionTarget, string> = {
    start: "지금 시작할 것인가",
    continue: "현재 선택을 계속 유지할 것인가",
    stop: "현재 진행 중인 일을 중단할 것인가",
    wait: "지금 움직이지 않고 기다릴 것인가",
    choose: "여러 선택지 중 무엇을 선택할 것인가",
    invest: "자금이나 자산을 투자할 것인가",
    buy: "부동산이나 자산을 매입할 것인가",
    sell: "보유한 자산을 매도하거나 정리할 것인가",
    move: "현재 위치나 환경을 옮길 것인가",
    partner: "다른 사람과 함께할 것인가",
    separate: "현재 관계를 정리할 것인가",
    changeJob: "직업이나 직장을 변경할 것인가",
    leaveJob: "현재 직장을 그만둘 것인가",
    marry: "상대와 결혼을 결정할 것인가",
    reconcile: "끊어진 관계를 다시 이어갈 것인가",
    manageMoney: "현재의 돈과 자금 문제를 어떻게 관리할 것인가",
    protectHealth: "건강 문제에 어떻게 대응하고 보호할 것인가",
    respondToConflict: "갈등이나 법적 문제에 어떻게 대응할 것인가",
    confirmDirection: "앞으로의 삶의 방향을 어떻게 정할 것인가",
    none: `${topic} 문제에 대해 어떤 결정을 내려야 하는가`,
  };

  return decisionText[decisionTarget];
}

function resolveTopicByDecisionTarget(
  keywordTopic: QuestionTopic,
  decisionTarget: DecisionTarget,
): QuestionTopic {
  if (
    decisionTarget === "changeJob"
    || decisionTarget === "leaveJob"
  ) {
    return "job";
  }

  return keywordTopic;
}

function resolveDecisionTargetByTopic(
  keywordDecisionTarget:
    DecisionTarget,
  topic:
    QuestionTopic,
  intent:
    ReaderIntentLiteral,
  question:
    string,
): DecisionTarget {
  if (
    intent === "existence"
  ) {
    return "none";
  }

  if (
    topic === "realEstate"
    && keywordDecisionTarget === "invest"
    && hasRealEstateBuySignal(
      question,
    )
  ) {
    return "buy";
  }

  if (
    topic === "job"
    && keywordDecisionTarget === "stop"
    && hasLeaveJobSignal(
      question,
    )
  ) {
    return "leaveJob";
  }

  if (
    topic === "job"
    && (
      keywordDecisionTarget === "move"
      || keywordDecisionTarget === "none"
    )
    && hasChangeJobSignal(
      question,
    )
  ) {
    return "changeJob";
  }

  if (
    keywordDecisionTarget
    !== "none"
  ) {
    return keywordDecisionTarget;
  }

  if (topic === "money") {
    return "manageMoney";
  }

  return keywordDecisionTarget;
}

const JOB_FIT_RECOMMENDATION_PATTERN =
  /(?:어떤|무엇(?:인|이)?)\s*(?:직업|일|업무).*(?:맞|어울|적성)|(?:나에게|내게)\s*맞는\s*(?:일|직업|업무)|(?:적성|성향).*(?:맞|어울)/;

const SELF_INTERPRETATION_PATTERN =
  /(?:어떤|무슨)\s*(?:성향|사람|특징)|(?:장점|약점)|(?:사주|성격|기질).*(?:특징|성향)|(?:나|내).*(?:어떤\s*사람|성향)/;

const WARNING_CONCLUSION_PATTERN =
  /조심|주의(?:할|해야|할\s*점|사항|점)|(?:어떤|무엇).*(?:위험|조심|주의)/;

const EXECUTION_STYLE_RISK_PATTERN =
  /(?:위험|손해|실패).*(?:클|크|괜찮|될|해도|할\s*까)/;

export type ConclusionNatureResolutionInput = {
  intent:
    QuestionIntent;

  analysisMode:
    QuestionAnalysisMode;

  normalizedQuestion:
    string;

  decisionTarget:
    DecisionTarget;
};

export function isJobFitRecommendationQuestion(
  normalizedQuestion:
    string,
): boolean {
  return JOB_FIT_RECOMMENDATION_PATTERN.test(
    normalizedQuestion,
  );
}

function isSelfInterpretationQuestion(
  normalizedQuestion:
    string,
  intent:
    QuestionIntent,
  decisionTarget:
    DecisionTarget,
): boolean {
  if (
    SELF_INTERPRETATION_PATTERN.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  if (
    intent
      === "reason"
    && decisionTarget
      === "none"
  ) {
    return true;
  }

  return false;
}

function isWarningConclusionQuestion(
  normalizedQuestion:
    string,
  intent:
    QuestionIntent,
  decisionTarget:
    DecisionTarget,
): boolean {
  if (
    intent
      !== "risk"
  ) {
    return false;
  }

  if (
    decisionTarget
      !== "none"
  ) {
    return false;
  }

  if (
    EXECUTION_STYLE_RISK_PATTERN.test(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  return WARNING_CONCLUSION_PATTERN.test(
    normalizedQuestion,
  );
}

export function resolveConclusionNature(
  input:
    | ConclusionNatureResolutionInput
    | QuestionIntent,
): ConclusionNature {
  if (
    typeof input
      === "string"
  ) {
    if (
      input
        === "existence"
    ) {
      return "existence";
    }

    if (
      input
        === "prediction"
    ) {
      return "prediction";
    }

    return "decision";
  }

  const {
    intent,
    analysisMode,
    normalizedQuestion,
    decisionTarget,
  } = input;

  if (
    intent
      === "existence"
  ) {
    return "existence";
  }

  if (
    intent
      === "prediction"
  ) {
    return "prediction";
  }

  if (
    isRoleRecommendationQuestion(
      normalizedQuestion,
    )
    || isJobFitRecommendationQuestion(
      normalizedQuestion,
    )
  ) {
    return "recommendation";
  }

  if (
    analysisMode
      === "interpretation"
  ) {
    return "interpretation";
  }

  if (
    isSelfInterpretationQuestion(
      normalizedQuestion,
      intent,
      decisionTarget,
    )
  ) {
    return "interpretation";
  }

  if (
    isWarningConclusionQuestion(
      normalizedQuestion,
      intent,
      decisionTarget,
    )
  ) {
    return "warning";
  }

  return "decision";
}

export function attachConclusionNature<
  T extends Omit<
    QuestionReaderResult,
    "conclusionNature"
  >,
>(
  result:
    T,
): QuestionReaderResult {
  return {
    ...result,

    conclusionNature:
      resolveConclusionNature({
        intent:
          result.intent,

        analysisMode:
          result.analysisMode,

        normalizedQuestion:
          result.normalizedQuestion,

        decisionTarget:
          result.decisionTarget,
      }),
  };
}

function calculateConfidence(evidenceCount: number): number {
  if (evidenceCount >= 5) {
    return 0.95;
  }

  if (evidenceCount >= 3) {
    return 0.85;
  }

  if (evidenceCount >= 2) {
    return 0.75;
  }

  if (evidenceCount === 1) {
    return 0.6;
  }

  return 0.35;
}

/**
 * 후보 배열에서 서로 다른 value가 2개 이상이면 rival로 본다.
 * 선택 로직에는 개입하지 않는다.
 */
function hasRivalCandidateValues<T extends string>(
  candidates: readonly MeaningCandidate<T>[],
): boolean {
  const uniqueValues = new Set(
    candidates.map((candidate) => candidate.value),
  );

  return uniqueValues.size >= 2;
}

const RELATIONSHIP_COUNTERPART_PATTERN =
  /(?:이|그)\s*(?:사람|남자|여자)|상대(?:방)?|우리\s*둘|둘이|서로|(?:현재|지금|내|제|그|이)\s*(?:연인|애인|배우자|남편|아내|동업자|파트너)|(?:연인|애인|배우자|남편|아내|동업자|파트너)\s*(?:와|과|랑|하고|와는|과는)/;

const COUNTERPART_CONTEXT_EXCLUSION_PATTERN =
  /(?:어떤\s*(?:남자|여자)|(?:배우자|연인)\s*유형|이상형|(?:나에게|내게)\s*어울리는\s*배우자|(?:남자|여자)에게\s*(?:어울|맞))/;

const COMPATIBILITY_EXPLICIT_PATTERN =
  /궁합|합이\s*맞/;

const INTERPERSONAL_FIT_PATTERN =
  /잘\s*맞|어울/;

const SELF_FIT_EXCLUSION_PATTERN =
  /(?:나에게|내게)\s*(?:어울|맞)|(?:나|내).*(?:직업|사업|투자\s*방식|투자|취미|성격|연애).*(?:맞|어울)|(?:직업|사업|투자|취미|집|부동산).*(?:나|내).*(?:맞|어울)|이\s*(?:직업|집).*(?:나|내).*(?:맞|어울)/;

/**
 * 결혼/재혼/혼인 상대 후보 문맥.
 * INTERPERSONAL_FIT_PATTERN을 전역으로 넓히지 않고,
 * spouse-candidate + bare fit 분석 신호에만 사용한다.
 */
const SPOUSE_CANDIDATE_CONTEXT_PATTERN =
  /(?:결혼|재혼|혼인)\s*상대/;

/**
 * "잘 맞"이 없는 bare fit 평가 표현.
 * 전역 INTERPERSONAL_FIT_PATTERN에는 넣지 않는다.
 */
const BARE_INTERPERSONAL_FIT_ASSESSMENT_PATTERN =
  /(?:맞을까(?:요)?|맞나(?:요|이|임)?|맞는가(?:요)?)/;

/**
 * "~하는 게 맞을까요" / "~사는 게 맞을까요" 같은 실행 판단형.
 * spouse-candidate bare fit과 구분한다.
 */
const EXECUTION_JUDGEMENT_FIT_EXCLUSION_PATTERN =
  /(?:하는|할|는)\s*게\s*맞/;

const EXPLICIT_EXECUTION_DECISION_TARGETS:
  readonly DecisionTarget[] = [
    "separate",
    "continue",
    "stop",
  ];

function hasRelationshipCounterpartContext(
  question:
    string,
): boolean {
  if (
    COUNTERPART_CONTEXT_EXCLUSION_PATTERN.test(
      question,
    )
  ) {
    return false;
  }

  return RELATIONSHIP_COUNTERPART_PATTERN.test(
    question,
  );
}

function isExplicitExecutionDecision(
  question:
    string,
  intent:
    ReaderIntentLiteral,
  decisionTarget:
    DecisionTarget,
): boolean {
  if (
    intent
      === "termination"
    || intent
      === "continuation"
  ) {
    return true;
  }

  if (
    EXPLICIT_EXECUTION_DECISION_TARGETS.includes(
      decisionTarget,
    )
  ) {
    return true;
  }

  if (
    decisionTarget
      === "marry"
    && /(?:해야|해야\s*할|해야\s*되)/.test(
      question,
    )
  ) {
    return true;
  }

  return false;
}

export function isCompatibilityAnalysisQuestion(
  question:
    string,
  decisionTarget:
    DecisionTarget,
): boolean {
  if (
    COMPATIBILITY_EXPLICIT_PATTERN.test(
      question,
    )
  ) {
    return true;
  }

  if (
    SELF_FIT_EXCLUSION_PATTERN.test(
      question,
    )
  ) {
    return false;
  }

  if (
    decisionTarget
      === "partner"
  ) {
    return true;
  }

  if (
    hasRelationshipCounterpartContext(
      question,
    )
    && INTERPERSONAL_FIT_PATTERN.test(
      question,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * spouse-candidate + bare fit 평가 신호.
 * INTERPERSONAL_FIT_PATTERN / isCompatibilityAnalysisQuestion을
 * 전역으로 넓히지 않는다.
 * analysisMode=compatibility 판정과
 * J-4-5-1 hasStrongCompatibilityFrameOverMarry에만 사용한다.
 */
function hasSpouseCandidateBareFitCompatibilitySignal(
  question: string,
): boolean {
  if (
    SELF_FIT_EXCLUSION_PATTERN.test(
      question,
    )
  ) {
    return false;
  }

  if (
    EXECUTION_JUDGEMENT_FIT_EXCLUSION_PATTERN.test(
      question,
    )
  ) {
    return false;
  }

  if (
    !hasRelationshipCounterpartContext(
      question,
    )
  ) {
    return false;
  }

  if (
    !SPOUSE_CANDIDATE_CONTEXT_PATTERN.test(
      question,
    )
  ) {
    return false;
  }

  return BARE_INTERPERSONAL_FIT_ASSESSMENT_PATTERN.test(
    question,
  );
}

/**
 * J-4-11: 궁합 명시 + 맞음/좋음 품질 판단 soft frame.
 * 기존 COMPATIBILITY_EXPLICIT_PATTERN을 재사용한다.
 * "맞을까" keyword miss여도 compatibility 의미 신호와
 * possibility intent를 맞추기 위한 좁은 신호다.
 * 열린 해석(어떤가요) / bare 궁합은 false로 둔다.
 */
function hasCompatibilityQualityAssessmentSoftSignal(
  question: string,
): boolean {
  if (
    !COMPATIBILITY_EXPLICIT_PATTERN.test(
      question,
    )
  ) {
    return false;
  }

  if (
    /(?:어떤가|어떤가요|어떠한가|어떠한가요)/.test(
      question,
    )
  ) {
    return false;
  }

  return /(?:맞는지|맞는가|맞나(?:요|이|임)?|좋을까|좋을까요|좋은가|좋은가요)/.test(
    question,
  );
}

/**
 * J-4-5-1: marry action 직접 실행/허가 질문인지.
 * isExplicitExecutionDecision + permission frame +
 * 결혼/혼인/재혼에 붙은 실행 질문 형태를 재사용·보강한다.
 * partner로 변환하지 않는다.
 */
function shouldProtectMarryActionDecision(
  question: string,
  intent: ReaderIntentLiteral,
  decisionTarget: DecisionTarget,
  candidates: MeaningCandidateSet,
): boolean {
  if (
    isExplicitExecutionDecision(
      question,
      intent,
      decisionTarget,
    )
  ) {
    return true;
  }

  const permissionFrame = hasFrame(
    candidates.frames,
    "permissionOrFeasibility",
  );

  if (permissionFrame && permissionFrame.strength >= 1) {
    return true;
  }

  // "결혼할까요?" / "결혼해야" / "결혼해도" 등 실행·허가 직접 질문.
  // "결혼 후 잘 맞을까요?" / "결혼생활이 잘 맞" 은 여기 해당하지 않는다.
  if (
    /(?:결혼|혼인|재혼)(?:을|를)?\s*(?:해도|해야|할까|할지|하려|하고\s*싶)/.test(
      question,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * J-4-5-1: compatibility/fit frame이 marry action보다 강한지.
 * 기존 isCompatibilityAnalysisQuestion을 우선 재사용하고,
 * marry keyword만으로 잡힌 "결혼생활 잘 맞"류 interpersonal fit과
 * spouse-candidate + bare fit 신호도 포함한다.
 */
function hasStrongCompatibilityFrameOverMarry(
  question: string,
  decisionTarget: DecisionTarget,
): boolean {
  if (
    isCompatibilityAnalysisQuestion(
      question,
      decisionTarget,
    )
  ) {
    return true;
  }

  if (
    hasSpouseCandidateBareFitCompatibilitySignal(
      question,
    )
  ) {
    return true;
  }

  if (
    SELF_FIT_EXCLUSION_PATTERN.test(
      question,
    )
  ) {
    return false;
  }

  return INTERPERSONAL_FIT_PATTERN.test(
    question,
  );
}

/**
 * J-4-5-1: compatibility/fit이 강하고 실행 결정이 아니면
 * marry keyword 강제 선택을 완화한다.
 * fallback은 none이며 partner로 변환하지 않는다.
 * intent / topic / analysisMode 계산은 건드리지 않는다.
 */
function resolveCompatibilityOverMarryDecisionTarget(
  question: string,
  intent: ReaderIntentLiteral,
  selected: DecisionTarget,
  candidates: MeaningCandidateSet,
  decisionEvidence: readonly string[],
): {
  decisionTarget: DecisionTarget;
  evidence: string[];
} | null {
  if (selected !== "marry") {
    return null;
  }

  if (
    !hasStrongCompatibilityFrameOverMarry(
      question,
      selected,
    )
  ) {
    return null;
  }

  if (
    shouldProtectMarryActionDecision(
      question,
      intent,
      selected,
      candidates,
    )
  ) {
    return null;
  }

  return {
    decisionTarget: "none",
    evidence: mergeUniqueEvidence(
      ["compatibilityOverMarry"],
      decisionEvidence,
    ),
  };
}

function detectQuestionAnalysisMode(
  question:
    string,
  intent:
    ReaderIntentLiteral,
  decisionTarget:
    DecisionTarget,
): QuestionAnalysisMode {
  if (
    isRoleRecommendationQuestion(
      question,
    )
  ) {
    return "interpretation";
  }

  if (
    isLifeFlowInterpretationQuestion(
      question,
      decisionTarget,
    )
  ) {
    return "interpretation";
  }

  // fortune-turn timing: timing + none + fortune 문맥은
  // action decision이 아니라 운의 전환/풀림 시점 해석이다.
  // 기존 timing + action(start/invest/marry 등)은 decisionTarget
  // 가드로 그대로 decision을 유지한다.
  if (
    intent
      === "timing"
    && decisionTarget
      === "none"
    && hasFortuneExpression(
      question,
    )
  ) {
    return "interpretation";
  }

  if (
    !isExplicitExecutionDecision(
      question,
      intent,
      decisionTarget,
    )
    && (
      isCompatibilityAnalysisQuestion(
        question,
        decisionTarget,
      )
      || hasSpouseCandidateBareFitCompatibilitySignal(
        question,
      )
    )
  ) {
    return "compatibility";
  }

  if (
    intent
      === "selection"
    || intent
      === "comparison"
    || decisionTarget
      === "choose"
  ) {
    return "selection";
  }

  if (
    intent
      === "reason"
    || intent
      === "prediction"
    || (
      decisionTarget
        === "none"
      && /만약|어떤\s*역할|무슨\s*역할|왜|이유/.test(
        question,
      )
    )
  ) {
    return "interpretation";
  }

  return "decision";
}

function extractQuestionCounterpartFacts(
  question:
    string,
): QuestionCounterpartFacts {
  const dateMatch =
    question.match(
      /(\d{4})\s*(?:년|[.\-/])\s*(\d{1,2})\s*(?:월|[.\-/])\s*(\d{1,2})\s*일?/,
    );

  const timeMatch =
    question.match(
      /(?:오전|오후)?\s*(\d{1,2})\s*(?::|시)\s*(\d{1,2})?\s*분?/,
    );

  const zodiacMatch =
    question.match(
      /(쥐|소|호랑이|토끼|용|뱀|말|양|원숭이|닭|개|돼지)띠/,
    );

  const genderMatch =
    question.match(
      /여성|여자|남성|남자/,
    );

  const calendarMatch =
    question.match(
      /음력|양력/,
    );

  const relationshipMatch =
    question.match(
      /친구|배우자|남편|아내|연인|애인|가족|직원|동업자|파트너|이\s*사람|그\s*사람/,
    );

  // 기존 same-person deixis(그/이 사람·분)와 대칭되는 referent 구조.
  // relationship 의미는 변경하지 않고 별도 축으로만 추출한다.
  const samePersonReferentMatch =
    question.match(
      /(?:그|이)\s*(?:사람|분)/,
    );

  const differentPersonReferentMatch =
    question.match(
      /다른\s*(?:사람|분)/,
    );

  const counterpartReferent:
    QuestionCounterpartReferent =
    differentPersonReferentMatch
      ? "different"
      : samePersonReferentMatch
        ? "same"
        : "unspecified";

  const evidence = [
    dateMatch?.[0],
    timeMatch?.[0],
    zodiacMatch?.[0],
    genderMatch?.[0],
    calendarMatch?.[0],
    relationshipMatch?.[0],
    samePersonReferentMatch?.[0],
    differentPersonReferentMatch?.[0],
  ].filter(
    (
      value,
    ): value is string =>
      Boolean(
        value,
      ),
  );

  const birthDate =
    dateMatch
      ? [
          dateMatch[1],
          dateMatch[2]
            .padStart(
              2,
              "0",
            ),
          dateMatch[3]
            .padStart(
              2,
              "0",
            ),
        ].join(
          "-",
        )
      : null;

  const birthTime =
    timeMatch
      ? [
          timeMatch[1]
            .padStart(
              2,
              "0",
            ),
          (
            timeMatch[2]
            ?? "00"
          ).padStart(
            2,
            "0",
          ),
        ].join(
          ":",
        )
      : null;

  return {
    birthDate,

    birthTime,

    calendarType:
      calendarMatch?.[0]
      === "음력"
        ? "lunar"
        : calendarMatch?.[0]
          === "양력"
          ? "solar"
          : null,

    gender:
      genderMatch
      && /여성|여자/.test(
        genderMatch[0],
      )
        ? "female"
        : genderMatch
          ? "male"
          : null,

    zodiac:
      zodiacMatch?.[0]
      ?? null,

    relationship:
      relationshipMatch?.[0]
      ?? null,

    counterpartReferent,

    evidence:
      Array.from(
        new Set(
          evidence,
        ),
      ),
  };
}

/**
 * 대상 지시어(closed class)만 추출한다.
 * topic / objectLabel / decisionTarget / frames 선택에는 개입하지 않는다.
 */
const OBJECT_DEICTIC_REFERENT_PATTERN =
  /이거|이걸|이것|그거|그걸|저거|저걸/;

function extractObjectReferent(
  question:
    string,
): QuestionObjectReferent {
  return OBJECT_DEICTIC_REFERENT_PATTERN.test(
    question,
  )
    ? "deictic"
    : "unspecified";
}

function detectQuestionAnalysisScope(
  question:
    string,
  counterpartFacts:
    QuestionCounterpartFacts,
): QuestionAnalysisScope {
  if (
    counterpartFacts.zodiac
    && /띠\s*궁합|궁합.*띠|띠만/.test(
      question,
    )
  ) {
    return "zodiac";
  }

  if (
    counterpartFacts.birthDate
    && counterpartFacts.birthTime
  ) {
    return "fullSaju";
  }

  if (
    counterpartFacts.birthDate
  ) {
    return "birthDate";
  }

  return "general";
}

/**
 * Question Reader는 질문만 단독으로 읽지 않는다.
 *
 * Human Destiny Context가 먼저 만들어진 이후에만 호출되며,
 * 질문이 무엇을 묻고 있는지, 왜 묻는지,
 * 최종적으로 무엇을 결정하려는지를 구조화한다.
 *
 * 실제 사주 판단과 결론은 이 Reader가 아니라
 * 이후의 Decision Engine에서 수행한다.
 */
export function readQuestion(
  humanContext: HumanDestinyContext,
  question: string,
): QuestionReaderResult {
  if (!humanContext) {
    throw new Error(
      "Question Reader requires Human Destiny Context before reading a question.",
    );
  }

  const normalizedQuestion = normalizeQuestion(question);

  if (!normalizedQuestion) {
    throw new Error("Question Reader requires a non-empty question.");
  }

  // J-2: 후보 수집 → normalizeAxes에서 topic/intent/decisionTarget 최종 선택
  const meaningCandidates = collectMeaningCandidates(normalizedQuestion);
  // P6-12: relation Evidence는 primary 선택과 분리해 수집한다.
  meaningCandidates.actionRelations = collectQuestionActionRelations(
    normalizedQuestion,
    meaningCandidates,
  );
  const normalizedAxes = normalizeAxes(
    normalizedQuestion,
    meaningCandidates,
  );
  assertNormalizeAxesPhase1Equivalence(normalizedQuestion, normalizedAxes);

  const motiveMatch = findRule(
    normalizedQuestion,
    motiveRules,
    "unspecified",
  );

  const resolvedTopic =
    resolveTopicByDecisionTarget(
      normalizedAxes.topic,
      normalizedAxes.decisionTarget,
    );

  const resolvedDecisionTarget =
    resolveDecisionTargetByTopic(
      normalizedAxes.decisionTarget,
      resolvedTopic,
      normalizedAxes.intent,
      normalizedQuestion,
    );

  const productionIntent = toModelBQuestionIntent(normalizedAxes.intent);

  const urgencyMatch =
    detectUrgency(
      normalizedQuestion,
    );

  const timingType =
    detectTimingType(
      normalizedQuestion,
    );

    const counterpartFacts =
    extractQuestionCounterpartFacts(
      normalizedQuestion,
    );

  const objectReferent =
    extractObjectReferent(
      normalizedQuestion,
    );

  const analysisMode =
    detectQuestionAnalysisMode(
      normalizedQuestion,
      normalizedAxes.intent,
      resolvedDecisionTarget,
    );

  const analysisScope =
    detectQuestionAnalysisScope(
      normalizedQuestion,
      counterpartFacts,
    );

  const evidence = Array.from(
    new Set([
      ...normalizedAxes.evidence.topic,
      ...normalizedAxes.evidence.intent,
      ...motiveMatch.evidence,
      ...normalizedAxes.evidence.decisionTarget,
      ...urgencyMatch.evidence,
    ]),
  );

  const readerMatchDiagnostics: NonNullable<
    QuestionReaderResult["readerMatchDiagnostics"]
  > = {
    usedFallback: {
      topic: meaningCandidates.topics.length === 0,
      intent: meaningCandidates.intents.length === 0,
      decisionTarget: meaningCandidates.decisionTargets.length === 0,
    },
    emptyEvidence: {
      topic: normalizedAxes.evidence.topic.length === 0,
      intent: normalizedAxes.evidence.intent.length === 0,
      decisionTarget: normalizedAxes.evidence.decisionTarget.length === 0,
    },
    hasRivalCandidates: {
      topic: hasRivalCandidateValues(meaningCandidates.topics),
      intent: hasRivalCandidateValues(meaningCandidates.intents),
      decisionTarget: hasRivalCandidateValues(
        meaningCandidates.decisionTargets,
      ),
    },
    actionRelations: meaningCandidates.actionRelations,
  };

  return attachConclusionNature(
    applyLifeDirectionTopicNormalization(
      applyLifeFlowInterpretationNormalization(
        applyRelationshipReconcileNormalization(
          applyRelationshipSeparationNormalizationUnlessJobLeave(
            applyRoleRecommendationNormalization({
          originalQuestion: question.trim(),
          normalizedQuestion,

          topic: resolvedTopic,
          objectLabel: normalizedAxes.objectLabel,
          objectSurfaceRemnant: normalizedAxes.objectSurfaceRemnant,
          objectReferent,
          intent: productionIntent,
          motive: motiveMatch.result,
          decisionTarget:
            resolvedDecisionTarget,
          urgency: urgencyMatch.urgency,
          timingType,

          analysisMode,
          analysisScope,
          counterpartFacts,

          asksWhat: buildAsksWhat(
            resolvedTopic,
            productionIntent,
          ),
          asksWhy: buildAsksWhy(
            motiveMatch.result,
          ),
          decisionQuestion: buildDecisionQuestion(
            resolvedDecisionTarget,
            resolvedTopic,
          ),

          evidence,
          confidence: calculateConfidence(evidence.length),

          humanContextReceived: true,
          readerMatchDiagnostics,
            }),
          ),
        ),
      ),
    ),
  );
}
