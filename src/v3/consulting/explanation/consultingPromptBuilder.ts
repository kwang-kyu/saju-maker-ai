import type {
  DecisionExplanationPayload,
} from "./decisionExplanationPayload.js";
import type {
  ConsultingGroundingContext,
} from "./consultingGroundingContextBuilder.js";
import type {
  QuestionContext,
} from "../question/questionContext.js";
import {
  resolveDecisionExplanationFocus,
  type DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

export type ConsultingPrompt = {
  systemPrompt:
    string;

  userPrompt:
    string;
};

const VERDICT_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    recommended:
      "진행을 권합니다.",

    conditionallyRecommended:
      "필요한 조건을 갖춘 뒤 진행하는 편이 좋습니다.",

    wait:
      "지금은 바로 실행하기보다 준비하며 기다리는 편이 좋습니다.",

    notRecommended:
      "현재 조건에서는 진행하지 않는 편이 좋습니다.",

    stop:
      "현재 진행 중인 방향을 중단하거나 정리하는 편이 좋습니다.",

    insufficientEvidence:
      "현재 정보만으로는 결론을 확정하기 어렵습니다.",

    interpreted:
      "계산된 운 흐름을 해석했습니다.",
  };

const CONFIDENCE_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    high:
      "판단 근거가 충분합니다.",

    medium:
      "판단에 활용할 근거는 있으나 현실 조건을 함께 확인해야 합니다.",

    low:
      "현재 근거만으로 단정하기 어려우므로 추가 확인이 필요합니다.",
  };

const TOPIC_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    business:
      "사업과 창업",

    money:
      "재물과 자금 운용",

    job:
      "직업과 활동 방향",

    realEstate:
      "부동산",

    relationship:
      "인간관계",

    love:
      "연애",

    marriage:
      "결혼",

    family:
      "가족",

    health:
      "건강",

    legal:
      "법률 문제",

    lifeFlow:
      "현재 삶의 흐름",

    lifeDirection:
      "앞으로의 삶의 방향",

    general:
      "현재 질문",
  };

const INTENT_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    evaluation:
      "현재 선택이 적절한지 판단",

    permission:
      "실현 가능성 판단",

    prediction:
      "앞으로의 흐름 판단",

    timing:
      "적절한 시기 판단",

    comparison:
      "두 가지 이상 대안 비교",

    selection:
      "가장 적합한 선택 판단",

    risk:
      "위험과 주의점 판단",

    reason:
      "이유와 성향 해석",

    method:
      "방법과 접근 판단",

    existence:
      "관련 운·구조의 존재 여부를 확인",
  };

const DECISION_TARGET_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    start:
      "새로 시작할지 결정",

    continue:
      "계속 진행할지 결정",

    stop:
      "중단하거나 정리할지 결정",

    wait:
      "기다리며 지켜볼지 결정",

    move:
      "자리를 옮길지 결정",

    choose:
      "가장 적합한 대상을 선택",

    changeJob:
      "직장을 옮길지 결정",

    leaveJob:
      "직장을 그만둘지 결정",

    startBusiness:
      "사업을 시작할지 결정",

    sideJob:
      "부업을 시작할지 결정",

    rest:
      "잠시 쉬어갈지 결정",

    invest:
      "자금을 투자할지 결정",

    manageMoney:
      "자금을 어떻게 관리할지 결정",

    buy:
      "매입할지 결정",

    sell:
      "매도할지 결정",

    partner:
      "함께할 사람이나 동업 관계를 결정",

    marry:
      "결혼할지 결정",

    separate:
      "관계를 정리할지 결정",

    reconcile:
      "관계를 회복할지 결정",

    none:
      "질문에 포함된 선택을 판단",

    confirmDirection:
      "앞으로의 방향을 정할지 판단",

    protectHealth:
      "건강을 지킬 방법을 결정",

    respondToConflict:
      "갈등에 어떻게 대응할지 결정",
  };

const CONCLUSION_NATURE_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    decision:
      "확정된 실행·선택 판단을 설명",

    interpretation:
      "의미와 구조를 해석",

    recommendation:
      "적합성과 추천 이유를 설명",

    warning:
      "위험·주의·반복 패턴을 설명",

    prediction:
      "가능성·흐름·변화 방향을 설명",

    existence:
      "운·구조의 존재 여부를 설명",
  };

const ANALYSIS_MODE_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    decision:
      "실행 여부를 판단",

    compatibility:
      "상대와의 궁합을 판단",

    selection:
      "선택지를 고르는 판단",

    interpretation:
      "성향과 흐름을 해석",
  };

const ACTION_OBJECT_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    business:
      "사업",

    job:
      "직업과 활동",

    investment:
      "투자",

    realEstate:
      "부동산",

    marriage:
      "결혼",

    relationship:
      "관계",

    health:
      "건강",

    legal:
      "법률 문제",

    lifeDirection:
      "삶의 방향",

    other:
      "질문의 대상",

    unknown:
      "질문의 대상",
  };

const COUNTERPART_RELATION_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    spouse:
      "배우자",

    partner:
      "함께하는 상대",

    lover:
      "연인",

    friend:
      "친구",

    parent:
      "부모",

    child:
      "자녀",

    sibling:
      "형제자매",

    coworker:
      "함께 일하는 사람",

    businessPartner:
      "함께하는 상대",

    other:
      "상대",

    unknown:
      "상대",
  };


function translateValue(
  value:
    string,
  labels:
    Readonly<Record<string, string>>,
  fallback:
    string,
): string {
  return (
    labels[value]
    ?? fallback
  );
}

function buildCommonTopicSafetyPrinciples():
  string {
  return [
    "- 사주와 엔진의 판단을 설명하되 전문적 사실 판단으로 확대하지 않는다.",
    "- 엔진이 확정한 최종 결론 원문을 변경하거나 약화하지 않는다.",
    "- 답변을 면책문구만으로 대체하지 않는다.",
    "- 제공 Explanation 자료의 구체성 상한선을 유지한다.",
    "- 안전 경계를 새로운 조건·위험·판단 근거처럼 표현하지 않는다.",
    "- 안전 안내가 필요하면 본문에서 짧게 작성하고 엔진 판단을 대체하지 않는다.",
  ].join("\n");
}

function resolvePromptExplanationFocus(
  payload:
    DecisionExplanationPayload,
  questionContext?:
    QuestionContext,
): DecisionExplanationFocus | null {
  if (
    payload.explanationKind
    === "roleRecommendation"
    || payload.explanationKind
    === "lifeFlowInterpretation"
  ) {
    return null;
  }
  if (
    payload.explanationFocus
  ) {
    return payload.explanationFocus;
  }


  return resolveDecisionExplanationFocus(
    {
      intent:
        payload.intent,

      decisionTarget:
        payload.decisionTarget,

      topic:
        payload.topic,

      originalQuestion:
        payload.originalQuestion,

      questionContext,
    },
  );
}

function isSpecialExplanationKind(
  explanationKind:
    DecisionExplanationPayload["explanationKind"],
): boolean {
  return (
    explanationKind
    === "roleRecommendation"
    || explanationKind
    === "lifeFlowInterpretation"
  );
}

export type ConsultingAnswerMode =
  | "question"
  | "report";

const EXECUTION_ACTION_WHEN_PATTERNS:
  readonly RegExp[] = [
    /언제.*(?:시작|개업|창업|매수|이직|동업|투자|결혼|그만|퇴사|헤어|매도|이사)/,
    /(?:시작|개업|창업|매수|이직|동업|투자|그만|퇴사|헤어|매도|이사).*언제/,
    /결혼(?:을|은|이|는)\s*언제/,
  ];

const EXECUTION_JUDGMENT_PATTERNS:
  readonly RegExp[] = [
    /해도\s*(?:될|좋|괜)/,
    /해야\s*(?:하|되|할|하나)/,
    /할까요/,
    /계속\s*(?:만나|이어|유지)/,
    /받을\s*수\s*있/,
    /시작(?:해도|해야|할까|하면)/,
    /투자(?:해도|해야|할까|하면)/,
    /(?:개업|창업|매수|이직|동업)/,
    /성공할까|맞을까|어울릴까/,
    /궁합/,
    /어떤\s*역할|역할일까요/,
  ];

const AREA_OR_PERIOD_FLOW_PATTERNS:
  readonly RegExp[] = [
    /총운|연애운|재물운|직업운|사업운|건강운|결혼운|애정운/,
    /운세/,
    /대운/,
    /(?:올해|금년|내년|작년|\d{4}\s*년).*(?:운|운세)/,
    /\d{1,2}\s*월\s*운/,
    /(?:운은|운이)\s*언제/,
  ];

function hasExecutionActionWhenIntent(
  originalQuestion:
    string,
): boolean {
  return EXECUTION_ACTION_WHEN_PATTERNS.some(
    (pattern) =>
      pattern.test(
        originalQuestion,
      ),
  );
}

function hasPeriodOrFortuneWhenIntent(
  originalQuestion:
    string,
): boolean {
  if (
    !/언제/.test(
      originalQuestion,
    )
  ) {
    return false;
  }

  return hasAreaOrPeriodFlowIntent(
    originalQuestion,
  );
}

function hasExecutionJudgmentIntent(
  originalQuestion:
    string,
): boolean {
  if (
    hasPeriodOrFortuneWhenIntent(
      originalQuestion,
    )
    && !hasExecutionActionWhenIntent(
      originalQuestion,
    )
  ) {
    return false;
  }

  return (
    EXECUTION_JUDGMENT_PATTERNS.some(
      (pattern) =>
        pattern.test(
          originalQuestion,
        ),
    )
    || hasExecutionActionWhenIntent(
      originalQuestion,
    )
  );
}

function hasAreaOrPeriodFlowIntent(
  originalQuestion:
    string,
): boolean {
  return AREA_OR_PERIOD_FLOW_PATTERNS.some(
    (pattern) =>
      pattern.test(
        originalQuestion,
      ),
  );
}

function isPartnershipExecutionQuestion(
  originalQuestion:
    string,
): boolean {
  return /동업/.test(
    originalQuestion,
  );
}

export function resolveConsultingAnswerMode(
  payload:
    DecisionExplanationPayload,
): ConsultingAnswerMode {
  if (
    payload.explanationKind
    === "roleRecommendation"
  ) {
    return "question";
  }

  if (
    payload.explanationKind
    === "lifeFlowInterpretation"
  ) {
    return "report";
  }

  if (
    hasPeriodOrFortuneWhenIntent(
      payload.originalQuestion,
    )
    && !hasExecutionActionWhenIntent(
      payload.originalQuestion,
    )
  ) {
    return "report";
  }

  if (
    hasExecutionJudgmentIntent(
      payload.originalQuestion,
    )
  ) {
    return "question";
  }

  if (
    hasAreaOrPeriodFlowIntent(
      payload.originalQuestion,
    )
  ) {
    return "report";
  }

  return "question";
}

function buildDirectAnswerPrioritySystemRules():
  string {
  return [
    "직답 우선 원칙",
    "",
    "- 이것은 고정 문장 템플릿이 아니라 답변 생성의 우선순위다.",
    "- 사용자가 묻는 행동과 판단 대상을 먼저 파악한다.",
    "- 엔진 verdict와 최종 결론의 의미를 그 대상에 적용해서 설명한다.",
    "- 질문에 대한 판단을 제시하지 않은 채 사주 성향이나 인생 일반론부터 길게 설명하지 않는다.",
    "- evidence는 직답을 뒷받침하는 데 사용한다.",
    "- 조건과 위험은 판단에 실제로 필요한 경우에만 사용한다.",
    "- 질문과 직접 관련 없는 Reader 설명은 생략한다.",
    "- 엔진 판단을 새로 만들거나 뒤집지 않는다.",
    "- 답변 본문에는 finalDecision 원문 전체를 정확히 한 번 포함한다. 단어·조사·문장 구조를 바꾸거나 요약·재작성하지 않는다.",
    "- finalDecision과 같은 의미의 별도 결론 문장을 추가로 만들지 않는다.",
    "- finalDecision 원문 주변 설명은 원래 질문의 대상과 행동에 적용한다.",
    "- 질문의 실제 행동 대상이 동업이라면 궁합 설명이 답변 전체를 지배하지 않게 한다.",
    "- 필요한 경우 상대 궁합은 동업 판단의 근거 중 하나로 사용한다.",
  ].join("\n");
}

function buildEvidenceSufficiencySystemRules(
  verdict:
    DecisionExplanationPayload["verdict"],
): string {
  const commonRules = [
    "정보 부족 표현 원칙",
    "",
    "- 정보 부족 표현은 엔진 판단이 현재 정보만으로는 결론을 확정하기 어려운 경우에만 사용할 수 있다.",
    "- 기다리며 지켜보라는 판단, 진행 권고, 조건부 진행, 진행하지 않음, 해석 판단에서는 정보 부족을 이유로 답변을 회피하지 않는다.",
    "- 기다리며 지켜보라는 판단을 판단할 수 없다 또는 정보가 부족하다로 바꾸지 않는다.",
    "- 엔진이 기다리며 지켜보라고 판단했다면 그 의미를 질문 대상에 적용해서 설명한다.",
  ];

  if (
    verdict
    === "insufficientEvidence"
  ) {
    return [
      ...commonRules,
      buildInsufficientEvidenceApplicationRules(),
    ].join("\n");
  }

  return [
    ...commonRules,
    "- 현재 엔진 판단은 정보 부족이 아니므로 정보 부족을 이유로 답변을 회피하지 않는다.",
  ].join("\n");
}

function buildGroundingUsageSystemRules():
  string {
  return [
    "확인 원자료 사용 원칙",
    "",
    "- 확인 원자료는 질문의 직답을 설명하는 데 필요한 경우에만 사용한다.",
    "- 확인 원자료 전체를 답변의 시작점이나 공통 설명의 근거로 사용하지 않는다.",
    "- 원국 사실은 직답의 판단 근거와 직접 연결될 때 우선 사용한다.",
    "- 현실 정보는 질문의 실행 조건, 현실 제약 또는 현재 상황과 직접 연결될 때만 사용한다.",
    "- 현재 운 국면은 질문한 행동이나 시기의 판단에 직접 영향을 주는 경우에만 보조 근거로 사용한다.",
    "- 현재 운이 존재한다는 이유만으로 '확장기', '성장 국면', '책임 증가', '활동 범위 확대' 같은 공통 문장을 반복하지 않는다.",
    "- 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면도 질문의 직답을 설명하는 데 실제로 기여하는 경우에만 사용한다.",
    "- 질문과 직접 연결되지 않는 원자료는 존재하더라도 답변에 사용하지 않는다.",
    "- 같은 사람의 공통 성향이 여러 질문에 존재하더라도 질문별 판단에 기여하지 않으면 반복하지 않는다.",
    "- 질문에 직접 필요한 원자료가 이미 충분하면 다른 원자료를 추가하지 않는다.",
  ].join("\n");
}

function buildReportGroundingUsageSystemRules():
  string {
  return [
    "확인 원자료 사용 원칙",
    "",
    "- 확인 원자료는 질문한 영역과 기간의 전체 흐름을 설명하는 데 필요한 경우에만 사용한다.",
    "- 확인 원자료 전체를 답변의 시작점이나 공통 설명의 근거로 사용하지 않는다.",
    "- 질문한 영역과 기간에 직접 연결되는 원국 사실과 현재 흐름을 우선 사용한다.",
    "- 현재 운 국면은 질문한 영역 또는 기간의 흐름을 설명하는 데 직접 기여할 때 사용한다.",
    "- 대운, 연운, 월운, 일운처럼 운의 흐름 자체를 묻는 질문에서는 해당 운 자료를 핵심 근거로 사용할 수 있다.",
    "- 운의 흐름 자체를 묻지 않는 영역에서는 현재 운을 자동으로 중심 근거로 사용하지 않는다.",
    "- 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면은 질문한 영역의 흐름을 설명하는 데 실제 기여할 때만 사용한다.",
    "- 질문한 영역과 직접 관련 없는 Reader나 공통 성향은 자동으로 추가하지 않는다.",
    "- 같은 공통 성향이 여러 영역에서 확인되더라도 질문한 영역의 설명에 기여하지 않으면 반복하지 않는다.",
    "- 필요한 근거가 있으면 충분히 설명하되, 원자료가 많다는 이유로 모든 자료를 같은 비중으로 설명하지 않는다.",
  ].join("\n");
}

function buildReportAnswerSystemRules():
  string {
  return [
    "영역·기간 흐름 해석 원칙",
    "",
    "- 이 질문은 특정 행동을 해도 되는지 묻는 질문이 아니라, 질문한 영역이나 기간의 전체 흐름을 설명하는 질문이다.",
    "- 질문한 영역과 기간의 전체 흐름을 우선 설명한다.",
    "- 해당 영역의 관련 evidence를 활용한다.",
    "- 강점, 가능성, 주의점, 변화 흐름을 설명한다.",
    "- 특정 행동 판단을 억지로 만들지 않는다.",
    "- \"정보가 부족하다\"를 기본 시작 문장으로 사용하지 않는다.",
    "- 현재 자료로 설명 가능한 범위는 충분히 설명한다.",
    "- 엔진 판단이 현재 정보만으로는 결론을 확정하기 어려운 경우가 아니면, 정보 부족을 이유로 흐름 설명을 중단하지 않는다.",
    "- 전문적인 절기·대운 기준은 사용자가 이해할 수 있는 방식으로 설명한다.",
    "- 1/1~2/3 편재, 2/4~12/31 정관처럼 구간과 용어만 나열하지 않는다.",
    "- 한 해의 운이 달력 1월 1일이 아니라 입춘을 기준으로 바뀐다는 의미를 먼저 설명하고, 필요한 경우에만 세부 구간을 설명한다.",
    "- 엔진 판단을 새로 만들거나 뒤집지 않는다.",
    "- 답변 본문에는 finalDecision 원문 전체를 정확히 한 번 포함한다. 단어·조사·문장 구조를 바꾸거나 요약·재작성하지 않는다.",
    "- finalDecision과 같은 의미의 별도 결론 문장을 추가로 만들지 않는다.",
    "- finalDecision 원문 주변 설명은 질문한 영역과 기간의 흐름에 적용한다.",
    "- 질문과 직접 관련 없는 Reader 설명은 생략한다.",
  ].join("\n");
}

function buildInsufficientEvidenceApplicationRules():
  string {
  return [
    "- 공통 회피 문장만 반복하지 않는다.",
    "- 이미 존재하는 evidence를 무시하지 않는다.",
    "- 질문 자체에 대한 현재 판단 가능한 범위를 먼저 설명한다.",
    "- 무엇이 부족한지 구체적으로 설명한다.",
    "- 가능한 방향, 조건, 위험을 설명한다.",
    "- 공통 정보 부족 문장으로 길게 끝내지 않는다.",
    "- 지금 질문에 대해 무엇을 말할 수 있는지를 먼저 설명한다.",
    "- 현재 evidence가 어떤 방향을 보여주는지를 설명한다.",
    "- 무엇이 부족해서 확정할 수 없는지를 설명한다.",
    "- 필요한 조건은 무엇인지를 설명한다.",
    "- 현재 말할 수 있는 범위를 설명하되, 실제 evidence에 없는 사실을 새로 만들지 않는다.",
  ].join("\n");
}

function buildEvidenceSelectionSystemRules():
  string {
  return [
    "근거 선택 원칙",
    "",
    "- 자료가 있다는 이유만으로 설명하지 않는다. 질문에 필요하므로 설명한다.",
    "- 원국 전체 설명, 인생 전체 성향, 전체 Reader 설명, 질문과 직접 관계없는 영역을 자동으로 본문에 모두 사용하지 않는다.",
    "- 근거를 핵심 근거, 보조 근거, 비관련 근거로 구분한다.",
    "- 핵심 근거는 질문의 판단에 직접 영향을 주는 근거이며 반드시 우선 사용한다.",
    "- 보조 근거는 핵심 판단을 이해하는 데 도움이 되지만 없어도 답변이 가능한 근거이며 필요한 경우에만 사용한다.",
    "- 비관련 근거는 질문과 직접 관계없는 근거이며 사용하지 않는다.",
    "- 근거의 강도만 보고 선택하지 않는다. 질문과의 관련성을 먼저 본다.",
    "- 강한 근거라도 질문과 관계없으면 사용하지 않는다.",
    "- 약한 근거라도 질문의 핵심 판단과 직접 연결된다면 필요한 만큼 사용할 수 있다.",
    "- 공통으로 반복되기 쉬운 근거인 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운, 질문과 무관한 Reader는 그 질문에 실제 기여할 때만 사용한다.",
    "- 같은 사람의 공통 성향을 질문마다 자동으로 반복하지 않는다.",
    "- originalQuestion, asksWhat, asksWhy, decisionQuestion, analysisMode, actionObject, counterpart, reality, explanationFocus, verdict, finalDecision, evidence, conditions, risks, recommendedDirection, prohibitedDirection을 근거 선택에 사용한다.",
    "- 엔진 판단을 새로 만들거나 뒤집지 않는다.",
  ].join("\n");
}

function buildQuestionEvidencePriorityRules():
  string {
  return [
    "질문형 근거 사용 원칙",
    "",
    "- 질문형에서는 근거를 최대한 선택적으로 사용한다.",
    "- 우선순위는 질문에 대한 직접 판단, 그 판단을 뒷받침하는 가장 중요한 근거, 판단에 영향을 주는 조건, 필요한 위험, 권장 방향과 금지 방향이다.",
    "- 질문형의 설명 순서는 질문, 직답, 핵심 근거, 필요한 조건과 위험, 방향이다. 이 순서를 번호 목차처럼 출력하지 않는다.",
    "- evidence, conditions, risks, recommendedDirection, prohibitedDirection은 질문과 관련 있을 때 우선 사용한다.",
    "- 나머지 근거는 사용하지 않는다.",
    "- 같은 사람의 삶의 동력을 매번 처음부터 설명하지 않는다.",
    "- 생존 방식을 질문과 관계없이 반복하지 않는다.",
    "- 반복 패턴을 질문과 관계없이 반복하지 않는다.",
    "- 현재 운을 질문과 관계없이 반복하지 않는다.",
    "- 정체성과 인생 국면을 질문과 관계없이 반복하지 않는다.",
    "- 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운, 무관한 Reader는 질문에 실제 기여할 때만 사용한다. 질문마다 자동 반복하지 않는다.",
    "- 재물 질문이 아닌데 재물 흐름을 장황하게 설명하지 않는다.",
    "- 관계 질문이 아닌데 관계 특성을 장황하게 설명하지 않는다.",
    "- 질문과 직접 관계없는 건강, 직업, 인생 Reader 설명을 자동으로 모두 사용하지 않는다.",
    "- 근거가 많다는 이유로 모든 근거를 설명하지 않는다.",
    "- 관련 없는 근거는 사용하지 않는다.",
    "- 질문에 따라 사용하는 근거 범위가 달라져야 한다. 아래는 출력 목차가 아니라 해당 질문일 때의 선택 우선순위다.",
    "- 동업 질문이라면 동업 진행 판단, 역할·책임·권한, 금전 부담과 위험, 갈등 조정, 필요한 조건을 우선한다. 상대와의 협업과 궁합 관련 근거는 보조로만 사용한다. 질문자의 전체 인생 성향, 전체 재물운, 관계·건강·직업 설명 전체는 사용하지 않는다.",
    "- 돈 회수 질문이라면 회수 가능성에 대한 엔진 판단, 회수 조건, 제한 요소, 위험, 실행 조건을 우선한다. 현재 판단 가능한 근거는 회수 판단에 기여할 때만 사용한다. 일반 재물운, 전체 사업운, 전체 직업운, 인생운, 전체 인간관계, 장황한 인생 성향 설명을 자동으로 길게 쓰지 않는다.",
    "- 관계 지속 질문이라면 유지 여부와 기다리며 지켜보라는 판단의 의미, 유지·기다리며 지켜봄·변경 판단, 갈등, 신뢰, 대기 중 확인사항, 관계 지속에 영향을 주는 근거, 유지 조건, 이탈·변경 신호, 관계 위험을 우선한다. 기다리며 지켜보라는 판단을 정보가 부족하다로 바꾸지 않는다. 전체 재물운, 전체 사업운, 관계와 직접 연결되지 않는 Reader 설명은 사용하지 않는다.",
    "- 사업 시작 질문이라면 시작 가능 여부를 중심으로 한다. 자금, 책임, 실행 조건과 위험을 사용한다. 현재 확장 흐름은 필요할 때만 보조한다. 질문자의 전체 인생 성향과 현재 운 전체를 자동으로 길게 쓰지 않는다.",
  ].join("\n");
}

function buildReportEvidencePriorityRules():
  string {
  return [
    "리포트형 근거 사용 원칙",
    "",
    "- 리포트형은 질문형보다 더 많은 근거를 사용할 수 있다.",
    "- 그러나 모든 Reader를 설명한다는 뜻이 아니다.",
    "- 질문한 영역에 해당하는 자료를 중심으로 선택한다.",
    "- 질문 영역과 관계없는 Reader 설명을 과도하게 사용하지 않는다.",
    "- 모든 Reader를 같은 비중으로 나열하지 않는다.",
    "- 필요한 근거가 많으면 충분히 설명한다. 억지로 짧게 만들지 않는다.",
    "- 리포트형의 설명 순서는 질문 영역의 전체 흐름, 핵심 근거, 변화와 강점과 주의, 활용 방향이다. 이 순서를 번호 목차처럼 출력하지 않는다.",
    "- 연애운, 재물운, 사업운, 총운의 기존 충분한 설명력을 유지한다. 과도하게 압축하지 않는다.",
    "- 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운, 무관한 Reader는 질문한 영역에 실제 기여할 때만 사용한다. 질문마다 자동 반복하지 않는다.",
    "- evidence, conditions, risks, recommendedDirection, prohibitedDirection은 질문한 영역과 관련 있을 때 우선 사용한다.",
    "- 관련 없는 근거는 사용하지 않는다.",
    "- 아래는 출력 목차가 아니라 해당 영역일 때의 선택 우선순위다.",
    "- 연애운 질문이라면 관계 확장, 친밀 관계 유지, 감정과 책임 부담, 관계 경계, 갈등 조정, 신뢰 회복, 현재 흐름과의 연결을 우선한다. 사업·투자 전체, 직업 Reader 전체, 질문과 무관한 재물 세부 설명은 사용하지 않는다.",
    "- 재물운 질문이라면 재물 생성, 재물 보존, 현금흐름, 부채, 손실 대응, 자산 전환, 현재 운과 재물 흐름을 우선한다. 관계 Reader 전체, 건강 Reader 전체, 직업 Reader 전체는 사용하지 않는다.",
    "- 사업운 질문이라면 사업 확장, 실행력, 재물 흐름, 역할과 업무, 책임 감당력, 조직과 관계, 위험을 우선한다. 연애·결혼 Reader 전체, 질문과 관계없는 건강 설명은 사용하지 않는다.",
    "- 총운·기간운 질문이라면 큰 흐름, 주요 변화, 영역별 핵심, 주의점, 활용 방향 순으로 필요한 자료를 선택한다. 모든 Reader를 같은 비중으로 나열하지 않는다.",
  ].join("\n");
}

function buildEvidenceCompressionSystemRules():
  string {
  return [
    "반복 근거 압축 원칙",
    "",
    "- 답변을 기계적으로 몇 자 이하로 제한하지 않는다.",
    "- 문단 수를 고정하지 않는다.",
    "- 정해진 문단 구조를 강제하지 않는다.",
    "- 핵심은 길이가 아니라 정보 밀도다.",
    "- 짧은 답변이 목표가 아니라, 질문과 관계없는 설명이 없는 답변이 목표다.",
    "- 짧게 만드는 것이 목표가 아니다.",
    "- 같은 성향, 현재 운, 책임, 부담, 현금흐름 설명을 질문마다 같은 순서와 같은 분량으로 반복하지 않는다.",
    "- 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운을 질문마다 같은 분량으로 자동 반복하지 않는다.",
    "- 안정형, 독립형, 재물형, 현재 확장기, 책임을 혼자 떠안음, 번아웃, 현금흐름, 부채, 역할·책임·권한·경계 같은 자료가 실제 질문의 근거라면 사용할 수 있다.",
    "- 성장 국면, 작게 시작, 재무 점검, 초기 성과 후 확장 같은 공통 표현은 실제 질문의 근거일 때만, 그 질문에 필요한 의미로만 사용한다.",
    "- 그러나 질문마다 같은 순서와 같은 분량으로 반복하지 않는다.",
    "- 같은 근거가 여러 질문에 필요하더라도 질문에 필요한 의미만 사용한다.",
    "- 핵심 설명 이후에도 질문과 관계없는 일반론을 길게 이어가지 않는다.",
    "- 리포트형에서 연애운, 재물운, 사업운, 총운의 설명력을 과도하게 줄이지 않는다.",
  ].join("\n");
}

function buildRoleEvidenceGuardRules():
  string {
  return [
    "역할 추천 근거 사용 원칙",
    "",
    "- 역할 추천 전용 답변 원칙을 일반 근거 압축 규칙으로 바꾸지 않는다.",
    "- 제공된 배역 후보와 역할 근거만 사용한다.",
    "- 역할과 직접 관계없는 Reader 설명을 무분별하게 추가하지 않는다.",
  ].join("\n");
}

function buildPartnershipQuestionSystemRules():
  string {
  return [
    "동업 질문 답변 원칙",
    "",
    "- 이 질문은 상대와의 궁합 질문이 아니라 동업해도 되는지에 대한 실행 판단 질문이다.",
    "- 사업·동업 판단을 중심으로 답한다.",
    "- 상대 궁합은 동업 판단의 보조 근거로만 사용한다.",
    "- 궁합 설명이 답변 전체를 지배하지 않게 한다.",
    "- 일반적인 사주 성향 설명을 길게 반복하지 않는다.",
    "- 엔진 verdict와 최종 결론의 의미를 동업 여부에 적용해서 설명한다.",
    "- 동업 진행 판단, 상대와의 협업 가능성, 역할·책임·권한, 금전 부담과 위험, 필요한 조건을 중심으로 근거를 선택한다.",
    "- 역할, 책임, 권한, 금전, 갈등 조정을 우선한다.",
    "- 궁합은 동업 판단의 보조 근거이며 답변의 중심이 아니다.",
    "- 현재 운 국면은 동업 판단에 실제로 필요할 때만 보조로 사용한다.",
    "- 질문자의 전체 인생 성향, 전체 재물운 장문, 관계·건강·직업 Reader 전체를 자동으로 사용하지 않는다.",
  ].join("\n");
}

function buildPromptQuestionFocusSystemRules(
  answerMode:
    ConsultingAnswerMode,
  partnershipQuestion:
    boolean,
  focus:
    DecisionExplanationFocus
    | null,
): string {
  if (
    answerMode
    === "report"
  ) {
    return "";
  }

  if (
    partnershipQuestion
  ) {
    const partnershipRules =
      buildPartnershipQuestionSystemRules();

    if (
      focus
      === "compatibility"
    ) {
      return partnershipRules;
    }

    const otherFocusRules =
      buildQuestionFocusSystemRules(
        focus,
      );

    if (
      otherFocusRules.length
      === 0
    ) {
      return partnershipRules;
    }

    return [
      partnershipRules,
      otherFocusRules,
    ].join(
      "\n\n",
    );
  }

  return buildQuestionFocusSystemRules(
    focus,
  );
}

function buildQuestionFocusSystemRules(
  focus:
    DecisionExplanationFocus
    | null,
): string {
  if (
    focus
    === "compatibility"
  ) {
    return [
      "궁합 질문 답변 원칙",
      "",
      "- 두 사람의 궁합에 직접 답한다.",
      "- 두 사람 관계에 대한 판단을 중심으로 설명한다.",
      "- 잘 맞는 부분과 충돌하는 부분을 필요한 근거와 함께 설명한다.",
      "- 일반적인 인생 성향 설명을 길게 반복하지 않는다.",
      "- 사업이나 실행 조언을 억지로 붙이지 않는다.",
      "- 사업이나 부동산, 일반 인생 설명을 먼저 하지 않는다.",
      "- 상대 출생정보가 부족하면 인생 진행 여부를 판단할 수 없다고 말하지 않는다.",
      "- 상대 출생정보가 부족하면 이 상대와의 궁합을 어느 범위까지 판단할 수 있는지를 설명한다.",
    ].join("\n");
  }

  if (
    focus
    === "continuation"
  ) {
    return [
      "유지 여부 질문 답변 원칙",
      "",
      "- 계속 유지하는 것이 맞는지 중심으로 답한다.",
      "- 유지 여부 또는 현재 기다리며 지켜보라는 판단을 중심으로 설명한다.",
      "- 유지해야 할 이유와 조건을 설명한다.",
      "- 변화 또는 이탈 신호가 있을 때만 설명한다.",
      "- 갈등, 신뢰, 대기 중 확인사항이 있으면 유지 판단을 설명하는 데 사용한다.",
      "- 전체 재물운이나 사업운으로 관계 유지 질문을 바꾸지 않는다.",
      "- 엔진이 기다리며 지켜보라고 판단했다면 그 의미를 질문 대상에 적용해서 설명한다.",
      "- 기다리며 지켜보라는 판단을 정보가 부족하다로 바꾸지 않는다.",
    ].join("\n");
  }

  if (
    focus
    === "termination"
  ) {
    return [
      "정리·변경 질문 답변 원칙",
      "",
      "- 계속할지 떠날지 또는 변경할지에 직접 답한다.",
      "- 떠날지, 옮길지, 변경할지에 대한 판단을 중심으로 한다.",
      "- 필요한 근거와 실행 조건, 위험을 중심으로 설명한다.",
    ].join("\n");
  }

  if (
    focus
    === "businessStart"
  ) {
    return [
      "사업 시작 질문 답변 원칙",
      "",
      "- 사업을 시작하는 것이 맞는지 중심으로 답한다.",
      "- 사업 시작 여부를 먼저 답한다.",
      "- 시작 가능 여부를 중심으로 한다.",
      "- 현재 시점, 성공 조건, 사업 위험, 실행 방향을 필요한 만큼 설명한다.",
      "- 자금, 책임, 실행 조건과 위험을 사용한다.",
      "- 현재 확장 흐름은 필요할 때만 보조한다.",
      "- 일반적인 사주 성향 설명을 길게 반복하지 않는다.",
      "- 동업 질문이라도 질문의 실제 행동 대상이 동업이라면 궁합 설명이 답변 전체를 지배하지 않게 한다.",
      "- 필요한 경우 상대 궁합은 동업 판단의 근거 중 하나로 사용한다.",
    ].join("\n");
  }

  if (
    focus
    === "businessTiming"
  ) {
    return [
      "사업 시기 질문 답변 원칙",
      "",
      "- 사업을 시작해도 되는가를 반복하지 않는다.",
      "- 언제 시작하는 것이 좋은가라는 질문 목적에 집중한다.",
      "- 현재 시점의 의미, 준비 시기인지 실행 시기인지를 중심으로 설명한다.",
      "- 기다려야 하는 조건과 실행으로 넘어가기 위한 조건을 중심으로 설명한다.",
      "- 엔진이 제공하지 않는 구체적인 날짜나 시점을 만들어내지 않는다.",
      "- 현재 엔진의 verdict와 evidence를 변경하거나 새 판단을 하지 않는다.",
      "- 일반적인 사주 성향 설명을 길게 반복하지 않는다.",
    ].join("\n");
  }

  if (
    focus
    === "businessFieldFit"
  ) {
    return [
      "사업 분야·구조 적합 질문 답변 원칙",
      "",
      "- 사업 시작 여부나 사업 시기를 중심으로 답하지 않는다.",
      "- 어떤 사업 분야 또는 사업 구조가 사용자에게 맞는가에 집중한다.",
      "- 사용자에게 맞는 사업 방식, 역할, 강점이 활용되는 구조를 중심으로 설명한다.",
      "- 피해야 할 사업 구조를 필요한 근거와 함께 설명한다.",
      "- 엔진이 제공하지 않는 특정 업종을 임의로 단정하지 않는다.",
      "- 현재 엔진의 verdict와 evidence를 변경하거나 새 판단을 하지 않는다.",
      "- 일반적인 사주 성향 설명을 길게 반복하지 않는다.",
    ].join("\n");
  }

  if (
    focus
    === "realEstateBuy"
  ) {
    return [
      "부동산 매수 질문 답변 원칙",
      "",
      "- 매수 여부와 현재 시점에 집중한다.",
      "- 자금과 현금흐름은 실제 근거 자료가 있을 때만 설명한다.",
      "- 일반적인 인생 설명을 반복하지 않는다.",
    ].join("\n");
  }

  if (
    focus
    === "generalJudgement"
  ) {
    return [
      "일반 판단 질문 답변 원칙",
      "",
      "- 질문 자체에 직접 답한다.",
      "- 필요한 근거와 조건, 위험만 사용한다.",
      "- 질문과 관계없는 설명을 억지로 붙이지 않는다.",
      "- 질문 자체를 일반적인 재물운 설명으로 바꾸지 않는다.",
      "- 돈 회수처럼 특정 실행 결과를 묻는 질문이면 회수 가능성, 회수 조건, 제한 요소, 위험, 실행 조건을 우선한다.",
      "- 일반 재물운, 사업운, 인생운을 자동으로 길게 쓰지 않는다.",
      "- 엔진이 현재 정보만으로 결론을 확정하기 어려우면, 현재 무엇까지 말할 수 있는지, 왜 확정할 수 없는지, 어떤 조건이 필요한지 순으로 자연스럽게 설명한다.",
    ].join("\n");
  }

  return "";
}

function buildQuestionContextUserSection(
  questionContext?:
    QuestionContext,
): string[] {
  if (
    !questionContext
  ) {
    return [];
  }

  const question =
    questionContext
      .question;

  const analysisModeLabel =
    question.intent === "existence"
      ? "관련 운·구조의 존재 여부를 확인"
      : translateValue(
        question.analysisMode,
        ANALYSIS_MODE_KOREAN_LABELS,
        "질문의 핵심을 판단",
      );

  const actionObjectDescription =
    questionContext
      .actionObject
      .description
      ?.trim();

  const actionObjectLabel =
    actionObjectDescription
    && actionObjectDescription
      .length
      > 0
      ? actionObjectDescription
      : translateValue(
          questionContext
            .actionObject
            .type,
          ACTION_OBJECT_KOREAN_LABELS,
          "질문의 대상",
        );

  const counterpartLines =
    questionContext
      .counterpart
      .exists
      ? [
          `상대: ${
            translateValue(
              questionContext
                .counterpart
                .relation,
              COUNTERPART_RELATION_KOREAN_LABELS,
              "상대",
            )
          }`,
        ]
      : [];

  const realityLines =
    questionContext
      .reality
      .constraints
      .map(
        (constraint) =>
          constraint.description.trim(),
      )
      .filter(
        (description) =>
          description.length
          > 0,
      );

  return [
    [
      "질문에서 실제로 알고 싶은 내용",
      `알고 싶은 점: ${question.asksWhat}`,
      `이유의 초점: ${question.asksWhy}`,
      `결정할 질문: ${question.decisionQuestion}`,
      `분석의 초점: ${analysisModeLabel}`,
      `대상: ${actionObjectLabel}`,
      ...counterpartLines,
      ...(
        realityLines.length > 0
          ? [
              "현실에서 확인된 조건",
              ...realityLines,
            ]
          : []
      ),
    ].join("\n"),
    "",
  ];
}

function buildExplanationMaterialSections(
  payload:
    DecisionExplanationPayload,
  answerMode:
    ConsultingAnswerMode,
): string[] {
  const materialSections =
    payload.explanationOrder.map(
      (item) =>
        [
          item.title,
          item.content,
        ].join("\n"),
    );

  const usageLine =
    answerMode
    === "report"
      ? "아래 자료는 그대로 번호 매겨 출력해야 하는 목차가 아닙니다. 질문한 영역과 기간의 흐름에 맞게 중심과 순서를 정하고, 그 흐름을 설명하는 근거와 설명 요소로 사용하세요. 자료가 있다는 이유만으로 모든 근거를 사용하지 마세요. 질문한 영역의 핵심 근거를 먼저 선택하고, 모든 Reader를 같은 비중으로 나열하지 마세요."
      : "아래 자료는 그대로 번호 매겨 출력해야 하는 목차가 아닙니다. 질문 유형에 맞게 중심과 순서를 정하고, 직답을 뒷받침하는 근거와 설명 요소로 사용하세요. 자료가 있다는 이유만으로 모든 근거를 사용하지 마세요. 질문에 필요한 핵심 근거만 선택하고, 보조 근거는 필요할 때만, 관련 없는 근거는 사용하지 마세요.";

  return [
    "답변에 필요한 판단 근거와 설명 요소",
    usageLine,
    ...materialSections,
  ];
}

function buildDirectAnswerApplicationUserSection():
  string {
  return [
    "질문에 판단을 적용하는 우선순위",
    "- 위 엔진 판단을 원래 질문의 대상과 행동에 적용해서 설명하세요.",
    "- '엔진이 확정한 최종 결론'에 적힌 finalDecision 원문 전체를 답변 본문에 정확히 한 번 그대로 포함하세요. 단어·조사·문장 구조를 바꾸거나 요약·재작성하지 마세요.",
    "- finalDecision과 같은 의미의 별도 결론 문장을 추가로 만들지 마세요.",
    "- 사주 성향이나 인생 일반론부터 길게 시작하지 마세요.",
    "- 확인 원자료 전체를 답변의 시작점으로 사용하지 마세요.",
    "- 질문의 직답을 설명하는 데 필요한 근거만 사용하세요.",
    "- 자료가 있다는 이유만으로 모든 근거를 사용하지 마세요.",
    "- 질문에 필요한 핵심 근거만 선택하세요.",
    "답변의 설명 근거는 아래 제공된 Explanation 자료에 포함된 내용만 사용하세요.",
    "Explanation 자료에 없는 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면 또는 Reader 성향을 grounding이나 원국 정보에서 새로 추론하여 설명하지 마세요.",
    "- 보조 근거는 필요할 때만 사용하고, 질문과 관계없는 근거는 사용하지 마세요.",
    "- 같은 성향이나 현재 운 설명을 질문과 관계없이 반복하지 마세요.",
    "- 삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운은 질문에 실제 기여할 때만 사용하세요.",
    "- 질문마다 같은 공통 성향 설명을 자동으로 반복하지 마세요.",
    "- 직답 다음에 핵심 근거, 필요한 조건과 위험, 방향을 사용하세요.",
  ].join("\n");
}

function buildReportApplicationUserSection():
  string {
  return [
    "영역·기간 흐름을 설명하는 우선순위",
    "- 위 엔진 판단을 질문한 영역과 기간의 전체 흐름에 적용해서 설명하세요.",
    "- '엔진이 확정한 최종 결론'에 적힌 finalDecision 원문 전체를 답변 본문에 정확히 한 번 그대로 포함하세요. 단어·조사·문장 구조를 바꾸거나 요약·재작성하지 마세요.",
    "- finalDecision과 같은 의미의 별도 결론 문장을 추가로 만들지 마세요.",
    "- 특정 행동을 해도 되는지로 바꾸지 마세요.",
    "- 정보가 부족하다로 답변을 시작하지 마세요.",
    "- 현재 자료로 설명 가능한 범위는 충분히 설명하세요.",
    "- 확인 원자료 전체를 답변의 시작점으로 사용하지 마세요.",
    "- 입춘 기준처럼 전문 구간은 사용자가 이해할 수 있게 설명하고, 필요한 경우에만 세부 구간을 적으세요.",
    "- 아래 질문 분류가 실행 결정처럼 보여도, 원문이 영역·기간 흐름을 묻는 경우에는 그 흐름 설명에 우선하세요.",
    "- 질문한 영역에 해당하는 자료를 중심으로 선택하세요.",
    "- 모든 Reader를 같은 비중으로 나열하지 마세요.",
    "- 필요한 근거가 많으면 충분히 설명하고, 억지로 짧게 만들지 마세요.",
    "- 질문 영역과 관계없는 Reader 설명을 과도하게 사용하지 마세요.",
  ].join("\n");
}

function buildInsufficientEvidenceApplicationUserSection():
  string {
  return [
    "정보 부족 판단을 설명하는 우선순위",
    "- 지금 질문에 대해 무엇을 말할 수 있는지를 먼저 설명하세요.",
    "- 현재 근거가 어떤 방향을 보여주는지를 설명하세요.",
    "- 무엇이 부족해서 확정할 수 없는지를 설명하세요.",
    "- 필요한 조건을 설명하세요.",
    "- 공통 정보 부족 문장으로 길게 끝내지 마세요.",
    "- 실제 근거에 없는 사실을 새로 만들지 마세요.",
  ].join("\n");
}

function buildGroundingUserSections(
  groundingContext?:
    ConsultingGroundingContext,
  answerMode:
    ConsultingAnswerMode = "question",
): string[] {
  if (
    !groundingContext
  ) {
    return [];
  }

  const usageLines =
    answerMode
    === "report"
      ? [
          "확인 원자료는 답변의 시작 재료가 아닙니다.",
          "확인 원자료 전체를 답변의 시작점으로 사용하지 마세요.",
          "질문한 영역과 기간의 전체 흐름에 직접 필요한 원자료만 선택하세요.",
          "대운·연운·월운·일운처럼 운의 흐름 자체를 묻는 경우에는 해당 운 자료를 핵심 근거로 사용할 수 있습니다.",
          "운의 흐름 자체를 묻지 않는 영역에서는 현재 운 국면을 자동으로 답변의 중심에 놓지 마세요.",
          "삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면은 질문한 영역의 흐름을 설명하는 데 실제로 기여할 때만 사용하세요.",
          "질문과 직접 관련 없는 Reader나 공통 성향을 자동으로 추가하지 마세요.",
          "같은 공통 성향이 여러 질문에 존재하더라도 질문한 영역에 기여하지 않으면 반복하지 마세요.",
          "필요한 근거는 충분히 사용하되, 원자료가 많다는 이유로 모든 자료를 같은 비중으로 설명하지 마세요.",
        ]
        : [
          "확인 원자료는 답변의 시작 재료가 아닙니다.",
          "확인 원자료 전체를 답변의 시작점으로 사용하지 마세요.",
          "답변의 첫 판단은 반드시 사용자가 실제로 묻는 질문에 직접 답해야 합니다.",
          "질문의 결론을 먼저 제시한 뒤, 그 결론에 실제로 필요한 근거와 조건을 설명하세요.",
          "질문과 직접 연결되지 않는 배경 설명을 직답보다 먼저 길게 설명하지 마세요.",
          "질문의 직답과 직접 연결되는 원국 사실을 우선 사용하세요.",
          "현실 정보는 질문의 실행 조건이나 현실 제약과 직접 연결될 때만 사용하세요.",
          "현재 운 국면은 질문한 행동이나 시기의 판단에 직접 영향을 줄 때만 보조 근거로 사용하세요.",
          "현재 운이 있다는 이유만으로 '확장기', '성장 국면', '책임 증가', '활동 범위 확대' 같은 공통 문장을 반복하지 마세요.",
          "삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면도 직답에 실제로 기여할 때만 사용하세요.",
          "질문과 직접 연결되지 않는 원자료는 존재하더라도 사용하지 마세요.",
          "직답에 필요한 원자료가 이미 충분하면 다른 원자료를 추가하지 마세요.",
        ];

  return [
    "확인 원자료 — 원국·현재 운 국면·현실 정보",
    usageLines.join("\n"),
    JSON.stringify(
      groundingContext,
      null,
      2,
    ),
  ];
}

function buildHealthSafetySystemRules():
  string {
  return [
    "건강 상담 안전 경계",
    "",
    buildCommonTopicSafetyPrinciples(),
    "- 사주 상담은 질병명이나 의학적 진단을 확정하지 않는다.",
    "- 검사 결과, 치료 효과, 회복 시기, 질병 발생 가능성을 새로 만들지 않는다.",
    "- 약의 시작·중단·용량 변경이나 치료 방법을 지시하지 않는다.",
    "- 실제 증상과 치료 여부는 의료진의 진료·검사를 통해 확인해야 한다.",
    "- 응급 여부나 안전을 단정하지 않는다.",
    "- 건강 질문에 답하지 않고 면책문구만 반복하지 않는다.",
    "- 엔진이 제공한 건강 관련 조건·위험·방향 안에서만 답한다.",
  ].join("\n");
}

function buildLegalSafetySystemRules():
  string {
  return [
    "법률 상담 안전 경계",
    "",
    buildCommonTopicSafetyPrinciples(),
    "- 사주 상담은 계약 효력, 권리·의무, 위법 여부, 법적 책임을 확정하지 않는다.",
    "- 승소·패소, 처벌, 손해배상, 분쟁 결과를 예측하거나 보장하지 않는다.",
    "- 제공 자료에 없는 법령, 판례, 기한, 절차, 비용을 새로 만들지 않는다.",
    "- 실제 법률 판단은 계약서와 사실관계를 확인할 수 있는 법률 전문가의 검토가 필요하다.",
    "- 법률 질문에 답하지 않고 면책문구만 반복하지 않는다.",
    "- 엔진이 제공한 조건·위험·방향 안에서만 답한다.",
  ].join("\n");
}

function buildConclusionNatureSystemRules(
  conclusionNature:
    DecisionExplanationPayload["conclusionNature"],
): string {
  const commonRules = [
    "- finalDecision, verdict, confidence, evidence, conditions, risks를 새로 판단하거나 변경하지 않는다.",
  ];

  if (
    conclusionNature
    === "decision"
  ) {
    return [
      "결론 성격: 실행·선택 판단 설명 원칙",
      "",
      "- 확정된 결론을 중심으로 설명한다.",
      "- 결론의 이유와 근거를 설명할 수 있다.",
      "- 엔진이 제공한 recommendedDirection이 있는 경우에만 실행 방향을 설명한다.",
      "- 새로운 실행 지시나 판단을 만들지 않는다.",
      ...commonRules,
    ].join("\n");
  }

  if (
    conclusionNature
    === "interpretation"
  ) {
    return [
      "결론 성격: 의미·구조 해석 설명 원칙",
      "",
      "- 의미와 구조의 해석 중심으로 설명한다.",
      "- 새로운 행동 지시나 실행 계획을 만들지 않는다.",
      "- 엔진 결론을 실행형 조언으로 바꾸지 않는다.",
      ...commonRules,
    ].join("\n");
  }

  if (
    conclusionNature
    === "recommendation"
  ) {
    return [
      "결론 성격: 적합성·추천 설명 원칙",
      "",
      "- 무엇이 왜 적합하거나 추천되는지 설명한다.",
      "- 엔진 근거와 적합성 이유를 중심으로 설명한다.",
      "- 엔진에 없는 새로운 추천 판단을 만들지 않는다.",
      ...commonRules,
    ].join("\n");
  }

  if (
    conclusionNature
    === "warning"
  ) {
    return [
      "결론 성격: 위험·주의 설명 원칙",
      "",
      "- 위험, 반복 패턴, 조건, 주의 요소 중심으로 설명한다.",
      "- 엔진이 확정하지 않은 행동 계획을 새로 만들지 않는다.",
      "- 경고를 실행 지시로 바꾸지 않는다.",
      ...commonRules,
    ].join("\n");
  }

  if (
    conclusionNature
    === "prediction"
  ) {
    return [
      "결론 성격: 가능성·흐름 설명 원칙",
      "",
      "- 가능성, 흐름, 변화 방향, 시기 관련 표현 중심으로 설명한다.",
      "- 미래를 확정적으로 단정하지 않는다.",
      "- 엔진에 없는 새로운 미래 예측을 만들지 않는다.",
      "- 실행 지시나 행동 계획으로 답변을 바꾸지 않는다.",
      ...commonRules,
    ].join("\n");
  }

  if (
    conclusionNature
    === "existence"
  ) {
    return [
      "결론 성격: 존재 여부 설명 원칙",
      "",
      "- 해당 구조나 신호가 존재하는 근거를 중심으로 설명한다.",
      "- 존재 여부를 엔진 결과보다 강하게 단정하지 않는다.",
      "- 존재 질문을 실행 조언이나 행동 계획으로 바꾸지 않는다.",
      ...commonRules,
    ].join("\n");
  }

  return [
    "결론 성격 설명 원칙",
    "",
    ...commonRules,
  ].join("\n");
}

function buildTopicSafetySystemRules(
  topic:
    DecisionExplanationPayload["topic"],
): string {
  if (
    topic
    === "health"
  ) {
    return buildHealthSafetySystemRules();
  }

  if (
    topic
    === "legal"
  ) {
    return buildLegalSafetySystemRules();
  }

  return "";
}

function buildTopicSafetyUserChecks(
  topic:
    DecisionExplanationPayload["topic"],
): string[] {
  if (
    topic
    === "health"
  ) {
    return [
      "- 건강 상담 안전 경계를 지켰는가?",
      "- 질병명이나 의학적 진단을 확정하지 않았는가?",
      "- 약의 시작·중단·용량 변경이나 치료 방법을 지시하지 않았는가?",
      "- 실제 증상과 치료 여부를 의료진의 진료·검사 영역으로 남겼는가?",
      "- 건강 질문에 답하지 않고 면책문구만으로 대체하지 않았는가?",
      "- 엔진이 제공한 건강 관련 조건·위험·방향 안에서만 답했는가?",
    ];
  }

  if (
    topic
    === "legal"
  ) {
    return [
      "- 법률 상담 안전 경계를 지켰는가?",
      "- 계약 효력, 권리·의무, 위법 여부, 법적 책임을 확정하지 않았는가?",
      "- 승소·패소, 처벌, 손해배상, 분쟁 결과를 예측하거나 보장하지 않았는가?",
      "- 제공 자료에 없는 법령, 판례, 기한, 절차, 비용을 새로 만들지 않았는가?",
      "- 실제 법률 판단을 계약서와 사실관계를 확인하는 법률 전문가의 검토 영역으로 남겼는가?",
      "- 법률 질문에 답하지 않고 면책문구만으로 대체하지 않았는가?",
      "- 엔진이 제공한 조건·위험·방향 안에서만 답했는가?",
    ];
  }

  return [];
}

export function buildConsultingPrompt(
  payload:
    DecisionExplanationPayload,

    groundingContext?:
    ConsultingGroundingContext,

    questionContext?:
    QuestionContext,
): ConsultingPrompt {
  const verdictLabel =
    translateValue(
      payload.verdict,
      VERDICT_KOREAN_LABELS,
      "엔진이 확정한 판단을 유지합니다.",
    );

  const confidenceLabel =
    translateValue(
      payload.confidence,
      CONFIDENCE_KOREAN_LABELS,
      "제공된 근거 범위에서 판단합니다.",
    );

  const topicLabel =
    translateValue(
      payload.topic,
      TOPIC_KOREAN_LABELS,
      "현재 질문",
    );

  const intentLabel =
    translateValue(
      payload.intent,
      INTENT_KOREAN_LABELS,
      "질문의 핵심 의도를 판단",
    );

  const decisionTargetLabel =
    payload.explanationKind
    === "roleRecommendation"
      ? "성격에 맞는 역할·배역 해석"
      : payload.explanationKind
        === "lifeFlowInterpretation"
        ? "요청 기간의 운·운세 해석"
      : translateValue(
        payload.decisionTarget,
        DECISION_TARGET_KOREAN_LABELS,
        "질문에 포함된 선택을 판단",
      );

  const conclusionNatureLabel =
    translateValue(
      payload.conclusionNature,
      CONCLUSION_NATURE_KOREAN_LABELS,
      "엔진이 확정한 결론 성격을 설명",
    );

  const conclusionNatureSystemRules =
    buildConclusionNatureSystemRules(
      payload.conclusionNature,
    );

  const roleRecommendationRules =
    payload.explanationKind
    === "roleRecommendation"
      ? `
역할·배역 추천 답변 원칙

- 이 질문은 실행 여부나 시기를 묻는 결정 질문이 아니라, 사주 성격에 맞는 역할·배역을 해석하는 질문이다.
- 제공된 세 가지 배역 후보와 표현 방식만 사용한다. evidence에 없는 배역, 인물, 장르 설정을 새로 만들지 않는다.
- 첫 문단은 재미있는 한 줄 제목으로 시작하고, 바로 대표 배역을 제시한다.
- 대표 배역 1개와 추가 배역 2개를 각각 구체적인 인물상으로 설명한다.
- 각 배역마다 제공된 사주·Reader 근거를 연결한다.
- 대사·표정·움직임·강한 장면에서 어떻게 살아나는지 생생하게 쓴다.
- "잘 살리지 못할 가능성이 있는 역할 유형" 블록이 제공된 경우에만 그 내용을 설명한다.
- 회피 배역 근거가 제공되지 않으면 부적합 배역을 새로 만들거나 추측하지 않는다.
- 실존 배우나 저작권 캐릭터를 그대로 복제하지 않는다.
- "카리스마 있는 리더"처럼 근거 없는 칭찬이나 일반론으로 끝내지 않는다.
- 같은 문장 구조를 모든 사용자에게 반복하지 않는다.
- 다음 뜻의 회피형 보류 표현과 그와 같은 의미의 문장을 절대 사용하지 않는다: 당장 정하지 말고, 준비한 뒤, 조건을 갖춘 뒤, 보류, 나중에 판단, 먼저 연습하고, 지금은 특정 배역을 고르지 말라.
- 실행 준비, 자금, 시기, 기다림, 보류 조건을 추가하지 않는다.
- 역할과 직접 관계없는 Reader 설명을 무분별하게 추가하지 않는다.
`.trim()
      : "";

  const lifeFlowInterpretationRules =
    payload.explanationKind
    === "lifeFlowInterpretation"
      ? `
총운·기간운 해석 답변 원칙

- 이 질문은 행동 결정이나 선택지 확정을 묻는 질문이 아니라, 요청한 기간의 운 흐름을 해석하는 질문이다.
- 제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다.
- 계산되지 않은 사건, 날짜, 재물 유입, 합격, 사고, 연애 성사 등을 예측하지 않는다.
- "실제로 결정하려는 행동은 무엇인가요?"처럼 행동·선택지를 되묻지 않는다.
- "당장 결정하지 말고", "준비한 뒤", "보류", "기다려라" 같은 결정 회피 표현을 사용하지 않는다.
- 추상적 위로나 일반 운세 문구로 채우지 않는다.
- 총운·연운·월운·일운을 구분해서 설명한다.
- 연도가 명시되지 않은 월 질문에 적용된 연도가 Evidence에 있으면 답변에 명시한다.
- 절기 경계로 월주·연주가 바뀌는 경우 Evidence의 구간 설명을 반영한다.
- 모든 Reader를 같은 비중으로 나열하지 않는다.
- 큰 흐름, 주요 변화, 영역별 핵심, 주의점, 활용 방향 순으로 필요한 자료를 선택한다.
- 위 순서를 번호 목차처럼 강제하지 않는다.
`.trim()
      : "";

  const topicSafetySystemRules =
    buildTopicSafetySystemRules(
      payload.topic,
    );

  const answerMode =
    resolveConsultingAnswerMode(
      payload,
    );

  const partnershipQuestion =
    isPartnershipExecutionQuestion(
      payload.originalQuestion,
    );

  const questionFocus =
    resolvePromptExplanationFocus(
      payload,
      questionContext,
    );

  const questionFocusSystemRules =
    buildPromptQuestionFocusSystemRules(
      answerMode,
      partnershipQuestion,
      questionFocus,
    );

  const specialExplanation =
    isSpecialExplanationKind(
      payload.explanationKind,
    );

  const directAnswerPriorityRules =
    answerMode
    === "question"
      ? buildDirectAnswerPrioritySystemRules()
      : "";

  const reportAnswerRules =
    answerMode
    === "report"
      ? buildReportAnswerSystemRules()
      : "";

  const evidenceSufficiencyRules =
    specialExplanation
      ? ""
      : buildEvidenceSufficiencySystemRules(
          payload.verdict,
        );

  const groundingUsageRules =
    answerMode
    === "report"
      ? buildReportGroundingUsageSystemRules()
      : buildGroundingUsageSystemRules();

  const evidenceSelectionRules =
    payload.explanationKind
    === "roleRecommendation"
      ? buildRoleEvidenceGuardRules()
      : buildEvidenceSelectionSystemRules();

  const questionEvidencePriorityRules =
    answerMode
    === "question"
    && payload.explanationKind
    !== "roleRecommendation"
      ? buildQuestionEvidencePriorityRules()
      : "";

  const reportEvidencePriorityRules =
    answerMode
    === "report"
      ? buildReportEvidencePriorityRules()
      : "";

  const evidenceCompressionRules =
    payload.explanationKind
    === "roleRecommendation"
      ? ""
      : buildEvidenceCompressionSystemRules();

  const systemPrompt = `
당신은 천운문 상담 엔진의 판단을 사용자가 이해하기 쉬운 한국어 상담문으로 전달하는 전문 상담가이다.

판단 권한

- 엔진의 verdict를 변경하지 않는다.
- 결론, 신뢰도, 조건, 위험, 권장 방향, 금지 방향을 변경하지 않는다.
- 엔진에 없는 사주 판단이나 미래 예측을 새로 만들지 않는다.
- 제공된 근거를 과장하거나 성공과 실패를 단정하지 않는다.
- 일반적인 처세 조언을 새로운 판단 근거로 추가하지 않는다.
- GPT는 판단을 새로 만들지 않고 엔진 판단을 사람이 이해할 수 있게 설명한다.
- payload.finalDecision은 엔진이 확정한 최종 결론이다.
- 답변 본문에는 payload.finalDecision의 원문 전체를 정확히 한 번 포함해야 한다.
- finalDecision의 단어, 조사, 문장 구조를 바꾸거나 요약하거나 자연스럽게 재작성하지 않는다.
- finalDecision과 같은 의미의 결론을 별도로 반복해서 만들지 않는다.
- finalDecision 원문은 답변의 자연스러운 최종 정리 문장으로 한 번만 사용한다.
- 답변을 작성하기 전에 finalDecision 원문이 답변에 정확히 한 번 들어갔는지 확인한다.

${directAnswerPriorityRules}
${reportAnswerRules ? `\n${reportAnswerRules}` : ""}
${evidenceSelectionRules ? `\n${evidenceSelectionRules}` : ""}
${questionEvidencePriorityRules ? `\n${questionEvidencePriorityRules}` : ""}
${reportEvidencePriorityRules ? `\n${reportEvidencePriorityRules}` : ""}
${evidenceCompressionRules ? `\n${evidenceCompressionRules}` : ""}
${evidenceSufficiencyRules ? `\n${evidenceSufficiencyRules}` : ""}
${groundingUsageRules ? `\n${groundingUsageRules}` : ""}

설명 구성 원칙

- 제공된 설명 요소는 반드시 그대로 번호 매겨 출력해야 하는 목차가 아니다.
- 질문 유형에 맞춰 답변의 중심과 순서를 자연스럽게 정한다.
- 같은 질문 유형이라도 근거와 조건에 따라 문단 구성과 강조점이 달라질 수 있다.
- 답변은 자연스러운 상담 답변이어야 한다.
- 엔진의 판단 구조가 사라지면 안 된다. 판단, 근거, 조건, 위험, 권장 방향, 금지 방향은 자료에 있을 때 활용한다.
- finalDecision 원문은 답변 본문에 정확히 한 번만 포함한다.
- finalDecision 원문을 두 번 이상 반복하지 않는다.
- finalDecision 원문 앞뒤에 최종 결론, 최종 판단 같은 제목이나 형식 라벨을 붙이지 않는다.
- finalDecision 원문은 답변의 자연스러운 최종 정리 문장으로 한 번만 사용한다.

질문 중심 원칙

- 질문에 등장한 대상, 행동, 관계, 시기와 사용자가 실제로 알고 싶은 내용을 직접적인 표현으로 사용한다.
- 질문의 대상과 상황은 사용자의 원문에서만 가져오며 미리 정한 업종별·활동별 예문을 사용하지 않는다.
- 서로 다른 질문에 동일한 조언과 동일한 문장 구조를 반복하지 않는다.
- 사람의 전체 성향을 매번 모두 설명하지 않는다.
- 현재 질문의 판단에 실제로 영향을 준 성향과 반복 행동만 골라 설명한다.
- 질문에 없는 업종, 활동, 투자 대상 또는 상대방의 특성을 임의로 만들어내지 않는다.

개인화 원칙

- 질문과 관련된 특성이 있다면 사용자가 묻는 실제 행동에서 어떻게 나타나는지 연결한다.
- 조건과 위험은 현재 질문의 대상에 맞게 설명하되, 제공된 근거 문장의 구체성을 넘지 않는다.
- 권장 방향은 제공된 근거에 있는 확인과 준비만 작성한다.
- 금지 방향은 어떤 행동을 피해야 하는지 분명하게 작성한다.
- 누구에게나 적용되는 안정적인 기반, 작게 시작, 기준 설정, 손실 한도 같은 표현을 근거 없이 관성적으로 반복하지 않는다.
- 그런 방향이 엔진 자료에 실제로 있을 때만 현재 질문의 대상과 연결하여 구체적으로 설명한다.

표현 원칙

- 반드시 자연스러운 한국어로만 답한다.
- 영문 코드, 변수명, 내부 분류값, JSON, 내부 필드명을 노출하지 않는다.
- 내부 판단값은 사용자가 이해할 수 있는 한국어 문장으로 바꾼다.
- 샵 기호, 별표 두 개, 백틱 같은 마크다운 문법을 사용하지 않는다.
- 화면에 그대로 표시해도 자연스러운 일반 텍스트로 작성한다.
- 친근하지만 가볍지 않은 존댓말을 사용한다.
- 추상적인 운세 일반론과 상투적인 위로를 사용하지 않는다.
- 같은 뜻의 결론과 근거를 여러 번 반복하지 않는다.
- 생년월일, 출생시간, 성별 등 이미 제공된 정보를 다시 물어보지 않는다.

질문별 답변 원칙

- 질문을 미리 정해진 키워드나 사례 목록에 끼워 맞추지 않는다.
- 사용자의 원문 질문 전체를 읽고 실제로 알고 싶은 의미를 파악한다.
- 성격이나 역할을 묻는 질문은 원국과 개인 Reader 근거를 그 상황에 직접 적용한다.
- 역할이나 적합성을 묻는 질문에는 제공된 원국과 Reader 근거상 실제로 가까운 역할 또는 특성을 구체적인 이유와 함께 답한다.
- 현실 조건은 사주와 현재 운의 결론을 대체하지 않고 실행 가능성을 보완하는 자료로만 사용한다.
- 질문과 관계없는 준비사항이나 일반적인 조언을 기계적으로 나열하지 않는다.
- 제목, 문단 수, 설명 순서는 질문 성격과 제공된 근거에 맞게 구성한다.
- 정해진 후속 질문이나 반복되는 확인 질문을 만들지 않는다.

근거 구체성 상한선

- 상담문의 모든 판단 문장은 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응되어야 한다.
- 제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않는다.
- 상위 개념을 도메인 상식으로 구체화하지 않는다. 예를 들어 제공 자료가 ‘재무 점검’이라고만 하면, 재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않는다.
- 제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않는다.
- 연결어, 존칭, 자연스러운 문장 변환은 허용하지만 새로운 판단 사실이나 명사는 추가하지 않는다.
- 근거 대응 여부가 불분명한 문장은 쓰지 않고 생략한다.
- 역할·배역 추천 전용 원칙과 총운·기간운 해석 전용 원칙의 기존 의미는 변경하지 않는다.

궁합 근거 사용 원칙

- 질문별 판단 근거에 full compatibility evidence가 있으면 해당 상대와의 궁합에 직접 답한다.
- 일반적인 동업 조언이나 관계 일반론으로 궁합 질문을 대체하지 않는다.
- evidence에 포함된 supportiveSignals와 cautionSignals 근거를 각각 설명한다.
- 상대방 출생시간이 없거나 limitations에 시주 제외가 명시되면 시주 궁합을 말하지 않는다.
- evidence에 없는 합·충·형·파·해와 오행 관계를 새로 만들지 않는다.
- 엔진 verdict와 overallLevel을 변경하거나 뒤집지 않는다.
${questionFocusSystemRules ? `\n${questionFocusSystemRules}` : ""}
${conclusionNatureSystemRules ? `\n${conclusionNatureSystemRules}` : ""}
${roleRecommendationRules ? `\n${roleRecommendationRules}` : ""}
${lifeFlowInterpretationRules ? `\n${lifeFlowInterpretationRules}` : ""}
${topicSafetySystemRules ? `\n${topicSafetySystemRules}` : ""}
`.trim();

  const userLeadInstruction =
    answerMode
    === "report"
      ? "질문한 영역과 기간의 전체 흐름을 우선으로 작성하세요. 원국과 현재 운은 그 흐름을 설명하는 확인 원자료로만 사용하세요."
      : "질문에 대한 직답을 우선으로 작성하세요. 원국과 현재 운은 직답을 설명하는 확인 원자료로만 사용하세요.";

  const applicationSection =
    answerMode
    === "report"
      ? buildReportApplicationUserSection()
      : buildDirectAnswerApplicationUserSection();

  const insufficientEvidenceApplicationSection =
    !specialExplanation
    && payload.verdict
    === "insufficientEvidence"
      ? buildInsufficientEvidenceApplicationUserSection()
      : "";

  const evidenceSelectionFinalChecks =
    payload.explanationKind
    === "roleRecommendation"
      ? [
          "- 역할과 직접 관계없는 Reader 설명을 무분별하게 추가하지 않았는가?",
        ]
      : answerMode
        === "report"
        ? [
            "- 질문에 필요하므로 설명했는가, 자료가 있다는 이유만으로 설명하지 않았는가?",
            "- 질문한 영역의 핵심 근거를 중심으로 선택했는가?",
            "- 질문 영역과 관계없는 Reader 설명을 과도하게 사용하지 않았는가?",
            "- 모든 Reader를 같은 비중으로 나열하지 않았는가?",
            "- 필요한 근거가 있으면 충분히 설명했는가?",
            "- 질문 영역의 전체 흐름과 핵심 근거를 충분히 설명했는가?",
            "- 연애운·재물운·사업운·총운의 설명력을 과도하게 줄이지 않았는가?",
          ]
        : [
            "- 질문에 필요하므로 설명했는가, 자료가 있다는 이유만으로 설명하지 않았는가?",
            "- 질문에 필요한 근거만 선택했는가?",
            "- 질문과 관계없는 Reader 설명을 자동으로 모두 사용하지 않았는가?",
            "- 같은 성향·운·책임 설명을 질문과 관계없이 반복하지 않았는가?",
            "- 근거가 많다는 이유로 모든 근거를 설명하지 않았는가?",
            "- 삶의 동력·생존 방식·반복 패턴·정체성·인생 국면·현재 운을 질문마다 자동 반복하지 않았는가?",
            "- 질문에 실제 기여하는 근거만 사용했는가?",
          ];

  const insufficientEvidenceFinalChecks =
    !specialExplanation
    && payload.verdict
    === "insufficientEvidence"
      ? [
          "- 현재 말할 수 있는 범위를 먼저 설명했는가?",
          "- 공통 정보 부족 문장으로 길게 끝내지 않았는가?",
        ]
      : [];

  const modeSpecificFinalChecks =
    answerMode
    === "report"
      ? [
          "- 질문한 영역과 기간의 전체 흐름을 우선했는가?",
          "- 특정 행동 판단을 억지로 만들지 않았는가?",
          "- 정보가 부족하다를 기본 시작 문장으로 사용하지 않았는가?",
          "- 현재 자료로 설명 가능한 범위는 충분히 설명했는가?",
          "- 절기·대운 기준을 사용자가 이해할 수 있게 설명했는가?",
        ]
      : [
          "- 질문에 나온 구체적인 대상과 행동을 사용했는가?",
          "- 질문에 대한 직답을 사주 성향이나 인생 일반론보다 우선했는가?",
          "- 기다리며 지켜보라는 판단을 정보 부족으로 바꾸지 않았는가?",
          "- 정보 부족 표현은 엔진이 현재 정보만으로 결론을 확정하기 어렵다고 한 경우에만 사용했는가?",
        ];

  const partnershipFinalChecks =
    partnershipQuestion
      ? [
          "- 동업 판단을 중심으로 답하고 궁합 설명으로 대체하지 않았는가?",
          "- 동업에 필요한 근거만 선택하고 전체 인생 성향이나 전체 재물운으로 바꾸지 않았는가?",
          "- 역할·책임·권한·금전·갈등 조정을 우선하고 궁합으로 대체하지 않았는가?",
        ]
      : [];

  const userPrompt = [
    "다음은 천운문 판단 엔진이 확정한 상담 자료입니다.",
    "원래 질문을 중심으로, 이 사람에게만 해당하는 완성된 한국어 상담문을 작성하세요.",
    userLeadInstruction,
    "자료의 판단을 변경하지 말고 서로 다른 질문에 동일한 답변을 반복하지 마세요.",
    "",
    "사용자의 원래 질문",
    payload.originalQuestion,
    "",
    "질문의 한국어 분류",
    `상담 영역: ${topicLabel}`,
    `질문 의도: ${intentLabel}`,
    `결정할 대상: ${decisionTargetLabel}`,
    `결론 성격: ${conclusionNatureLabel}`,
    "",
    ...buildQuestionContextUserSection(
      questionContext,
    ),
    "확정된 판단",
    verdictLabel,
    "",
    "판단 근거의 충분도",
    confidenceLabel,
    "",
    "엔진이 확정한 최종 결론",
    payload.finalDecision,
    "",
    applicationSection,
    "",
    ...(
      insufficientEvidenceApplicationSection.length
      > 0
        ? [
            insufficientEvidenceApplicationSection,
            "",
          ]
        : []
    ),
    ...buildExplanationMaterialSections(
      payload,
      answerMode,
    ),
    "",
    ...buildGroundingUserSections(
      groundingContext,
      answerMode,
    ),
    "",
    [
      "근거 구체성 상한선",
      "- 상담문의 모든 판단 문장은 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응되어야 합니다.",
      "- 제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 마세요.",
      "- 상위 개념을 도메인 상식으로 구체화하지 마세요. 제공 자료가 ‘재무 점검’이라고만 하면 재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 마세요.",
      "- 제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 마세요.",
      "- 연결어, 존칭, 자연스러운 문장 변환은 허용하지만 새로운 판단 사실이나 명사는 추가하지 마세요.",
      "- 근거 대응 여부가 불분명한 문장은 쓰지 않고 생략하세요.",
    ].join("\n"),
    "",
    "작성 전 최종 확인",
    "- 질문 유형의 중심에 맞게 답했는가?",
    ...modeSpecificFinalChecks,
    ...evidenceSelectionFinalChecks,
    ...insufficientEvidenceFinalChecks,
    "- 확인 원자료 전체를 답변의 시작점으로 사용하지 않았는가?",
    "- 다른 사람이나 다른 질문에도 그대로 붙일 수 있는 상투적인 문장을 제거했는가?",
    "- 영문 내부 코드와 마크다운 기호를 제거했는가?",
    "- 엔진이 확정한 판단을 뒤집거나 약화하지 않았는가?",
    "- '엔진이 확정한 최종 결론'에 적힌 finalDecision 원문 전체가 답변 본문에 정확히 한 번만 포함되었는가?",
    "- finalDecision을 바꿔 쓰거나, 요약하거나, 같은 의미의 별도 결론 문장을 추가하지 않았는가?",
    "- 설명 요소를 번호 목차처럼 그대로 나열하지 않았는가?",
    "- 모든 판단 문장이 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응하는가?",
    "- 제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않았는가?",
    "- 상위 개념을 도메인 상식으로 구체화하지 않았는가? 제공 자료가 ‘재무 점검’이라고만 하면 재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않았는가?",
    "- 제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않았는가?",
    "- 연결어, 존칭, 자연스러운 문장 변환 외에 새로운 판단 사실이나 명사를 추가하지 않았는가?",
    "- 근거 대응 여부가 불분명한 문장은 쓰지 않고 생략했는가?",
    ...partnershipFinalChecks,
    ...buildTopicSafetyUserChecks(
      payload.topic,
    ),
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}
