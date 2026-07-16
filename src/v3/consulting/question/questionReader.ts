import type { HumanDestinyContext } from "../../types/humanDestinyContext";

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

export type QuestionIntent =
  | "possibility"
  | "timing"
  | "reason"
  | "method"
  | "risk"
  | "comparison"
  | "selection"
  | "continuation"
  | "termination"
  | "prediction"
  | "generalJudgement";

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

export type DecisionTarget =
  | "start"
  | "continue"
  | "stop"
  | "wait"
  | "choose"
  | "invest"
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
export type QuestionReaderResult = {
  originalQuestion: string;
  normalizedQuestion: string;

  topic: QuestionTopic;
  intent: QuestionIntent;
  motive: QuestionMotive;
  decisionTarget: DecisionTarget;
  urgency: QuestionUrgency;
  timingType: QuestionTimingType;

  asksWhat: string;
  asksWhy: string;
  decisionQuestion: string;

  evidence: string[];
  confidence: number;

  humanContextReceived: true;
};

type KeywordRule<T extends string> = {
  result: T;
  keywords: readonly string[];
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
    ],
  },
  {
    result: "realEstate",
    keywords: [
      "부동산",
      "아파트",
      "상가",
      "토지",
      "건물",
      "분양",
      "매수",
      "매도",
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

const intentRules: readonly KeywordRule<QuestionIntent>[] = [
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
      "주의",
      "조심",
      "괜찮을까",
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
    result: "possibility",
    keywords: [
      "해도 될까",
      "해도될까",
      "가능",
      "맞을까",
      "괜찮을까",
      "할 수 있을까",
      "할수있을까",
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
    keywords: ["동업", "파트너", "공동창업", "같이 사업", "지분"],
  },
  {
    result: "changeJob",
    keywords: ["이직", "직장을 옮", "회사 옮", "전직"],
  },
  {
    result: "leaveJob",
    keywords: ["퇴사", "직장 그만", "회사를 그만"],
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
    result: "sell",
    keywords: ["매도", "팔아야", "처분"],
  },
  {
    result: "invest",
    keywords: ["투자", "매수", "분양받", "돈을 넣"],
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
    keywords: ["기다려", "미뤄", "보류", "아직 하지"],
  },
  {
    result: "start",
    keywords: [
      "시작",
      "창업",
      "개업",
      "해볼까",
      "해도 될까",
      "해도될까",
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
    keywords: ["선택", "둘 중", "둘중", "어느 쪽", "어느쪽"],
  },
  {
    result: "confirmDirection",
    keywords: ["방향", "어떻게 살아", "무엇을 해야", "결정해야"],
  },
];

function normalizeQuestion(question: string): string {
  return question.trim().replace(/\s+/g, " ").toLowerCase();
}

function findRule<T extends string>(
  question: string,
  rules: readonly KeywordRule<T>[],
  fallback: T,
): {
  result: T;
  evidence: string[];
} {
  for (const rule of rules) {
    const matchedKeywords = rule.keywords.filter((keyword) =>
      question.includes(keyword.toLowerCase()),
    );

    if (matchedKeywords.length > 0) {
      return {
        result: rule.result,
        evidence: matchedKeywords,
      };
    }
  }

  return {
    result: fallback,
    evidence: [],
  };
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
    question.includes("기다려") ||
    question.includes("미뤄") ||
    question.includes("보류") ||
    question.includes("언제까지 기다")
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

function buildAsksWhat(topic: QuestionTopic, intent: QuestionIntent): string {
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
    possibility: "가능한지",
    timing: "언제 움직여야 하는지",
    reason: "왜 이런 상황이 생겼는지",
    method: "어떻게 대응해야 하는지",
    risk: "어떤 위험이 있는지",
    comparison: "두 선택 중 무엇이 나은지",
    selection: "무엇을 선택해야 하는지",
    continuation: "계속 유지해야 하는지",
    termination: "중단하거나 정리해야 하는지",
    prediction: "앞으로 어떤 결과가 예상되는지",
    generalJudgement: "전체적으로 어떻게 판단해야 하는지",
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

function buildDecisionQuestion(
  decisionTarget: DecisionTarget,
  topic: QuestionTopic,
): string {
  const decisionText: Record<DecisionTarget, string> = {
    start: "지금 시작할 것인가",
    continue: "현재 선택을 계속 유지할 것인가",
    stop: "현재 진행 중인 일을 중단할 것인가",
    wait: "지금 움직이지 않고 기다릴 것인가",
    choose: "여러 선택지 중 무엇을 선택할 것인가",
    invest: "자금이나 자산을 투입할 것인가",
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

  const topicMatch = findRule(
    normalizedQuestion,
    topicRules,
    "general" as QuestionTopic,
  );

  const intentMatch = findRule(
    normalizedQuestion,
    intentRules,
    "generalJudgement" as QuestionIntent,
  );

  const motiveMatch = findRule(
    normalizedQuestion,
    motiveRules,
    "unspecified" as QuestionMotive,
  );

  const decisionMatch = findRule(
    normalizedQuestion,
    decisionRules,
    "none" as DecisionTarget,
  );

  const urgencyMatch = detectUrgency(normalizedQuestion);
  const timingType =
  detectTimingType(
    normalizedQuestion,
  );

  const evidence = Array.from(
    new Set([
      ...topicMatch.evidence,
      ...intentMatch.evidence,
      ...motiveMatch.evidence,
      ...decisionMatch.evidence,
      ...urgencyMatch.evidence,
    ]),
  );

  return {
    originalQuestion: question.trim(),
    normalizedQuestion,

    topic: topicMatch.result,
    intent: intentMatch.result,
    motive: motiveMatch.result,
    decisionTarget: decisionMatch.result,
    urgency: urgencyMatch.urgency,
    timingType,
    asksWhat: buildAsksWhat(topicMatch.result, intentMatch.result),
    asksWhy: buildAsksWhy(motiveMatch.result),
    decisionQuestion: buildDecisionQuestion(
      decisionMatch.result,
      topicMatch.result,
    ),

    evidence,
    confidence: calculateConfidence(evidence.length),

    humanContextReceived: true,
  };
}