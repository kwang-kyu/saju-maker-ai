import {
  hasFortuneExpression,
  hasInterpretationRequest,
} from "./lifeFlowInterpretationQuestionDetector.js";
import type {
  DecisionTarget,
  QuestionIntent,
  QuestionTopic,
} from "./questionReader.js";

/**
 * path-commitment: 삶/인생 + 방향성/중심/무게/집중/맞춤/정함.
 * bare "삶"/"무게"/"중심"/"집중"/"방향" 단독은 포함하지 않는다.
 */
const LIFE_DIRECTION_PATH_COMMITMENT_PATTERNS:
  readonly RegExp[] = [
    /(?:인생|삶)(?:의)?\s*(?:중심|무게|무게\s*중심|무게중심)/,
    /(?:인생\s*중심|삶의\s*중심|인생\s*무게|삶의\s*무게|인생\s*무게중심|삶의\s*무게중심)/,
    /(?:인생|삶).*(?:무게|중심|힘을\s*싣|무게중심).*(?:두|싣|놓|잡)/,
    /(?:인생|삶).*(?:에|을|를|에서|쪽에?).*(?:집중)/,
    /(?:무게|중심|무게중심).*(?:두|싣|놓).*(?:인생|삶)/,
    // 방향 맞춤·정함·무게 두기 (삶/인생 축과 결합)
    /(?:인생|삶).*(?:방향).*(?:맞추|정하|정할|잡는|두)/,
    /(?:방향).*(?:에|으로|로)?\s*(?:무게|중심).*(?:두|싣|놓)/,
    /(?:삶의\s*방향|인생\s*방향).*(?:맞추|정하|두|잡)/,
    // 중심을 두고 가다
    /(?:인생|삶).*(?:중심|무게).*(?:두고\s*가|두고가|두며)/,
  ];

const LIFE_DIRECTION_COMPOUND_PATTERNS:
  readonly RegExp[] = [
    /(?:인생|삶)(?:의)?\s*(?:방향|전환)/,
    /(?:인생\s*방향|삶의\s*방향|인생\s*전환|삶의\s*전환)/,
    /(?:인생|삶).*(?:방향|전환).*(?:바꾸|잡|정|선택|미루)/,
    /(?:방향|전환).*(?:인생|삶)/,
    ...LIFE_DIRECTION_PATH_COMMITMENT_PATTERNS,
  ];

const DOMAIN_TOPICS:
  readonly QuestionTopic[] = [
    "business",
    "money",
    "job",
    "realEstate",
    "relationship",
    "love",
    "marriage",
    "family",
    "health",
    "legal",
  ];

const PURE_FORTUNE_FLOW_PATTERNS:
  readonly RegExp[] = [
    /(?:올해|내년|앞으로)\s*운(?:이|세)?/,
    /운(?:이|세)\s*언제/,
    /운세(?:가)?\s*어떻/,
    /좋은\s*시기(?:는)?\s*언제/,
    /언제\s*좋(?:아|을)/,
  ];

const METAPHORICAL_PATH_PATTERNS:
  readonly RegExp[] = [
    /(?:안정|도전|새로운|어떤)\s*(?:적(?:인|)?\s*)?길/,
    /길(?:을|로)?.*(?:선택|유지|바꿀|고민)/,
    /(?:유지|선택|바꿀|고민).*길/,
    /길\s*중\s*어느/,
  ];

export function hasLifeDirectionCompoundSignal(
  normalizedQuestion:
    string,
): boolean {
  return LIFE_DIRECTION_COMPOUND_PATTERNS.some(
    (pattern) =>
      pattern.test(
        normalizedQuestion,
      ),
  );
}

export function hasLifeDirectionPathCommitmentSignal(
  normalizedQuestion:
    string,
): boolean {
  return LIFE_DIRECTION_PATH_COMMITMENT_PATTERNS.some(
    (pattern) =>
      pattern.test(
        normalizedQuestion,
      ),
  );
}

function isDomainTopic(
  topic:
    QuestionTopic,
): boolean {
  return DOMAIN_TOPICS.includes(
    topic,
  );
}

function isMetaphoricalPathQuestion(
  normalizedQuestion:
    string,
): boolean {
  if (
    hasLifeDirectionCompoundSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  return METAPHORICAL_PATH_PATTERNS.some(
    (pattern) =>
      pattern.test(
        normalizedQuestion,
      ),
  );
}

function isAmbiguousStartTimingWithoutLifeDirection(
  normalizedQuestion:
    string,
): boolean {
  if (
    hasLifeDirectionCompoundSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  return (
    /새로운\s*시작/.test(
      normalizedQuestion,
    )
    && /언제/.test(
      normalizedQuestion,
    )
  );
}

function isPureFortuneFlowQuestion(
  normalizedQuestion:
    string,
): boolean {
  if (
    hasLifeDirectionCompoundSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    PURE_FORTUNE_FLOW_PATTERNS.some(
      (pattern) =>
        pattern.test(
          normalizedQuestion,
        ),
    )
  ) {
    return true;
  }

  return (
    hasFortuneExpression(
      normalizedQuestion,
    )
    && hasInterpretationRequest(
      normalizedQuestion,
    )
  );
}

export function shouldNormalizeTopicToLifeDirection(
  topic:
    QuestionTopic,
  normalizedQuestion:
    string,
): boolean {
  if (
    topic
      === "lifeDirection"
  ) {
    return false;
  }

  if (
    !hasLifeDirectionCompoundSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    isMetaphoricalPathQuestion(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    isAmbiguousStartTimingWithoutLifeDirection(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    isPureFortuneFlowQuestion(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    topic
      === "lifeFlow"
    || topic
      === "general"
  ) {
    return true;
  }

  if (
    isDomainTopic(
      topic,
    )
  ) {
    return true;
  }

  return false;
}

function buildLifeDirectionAsksWhat(
  intent:
    QuestionIntent,
): string {
  const intentText: Record<
    QuestionIntent,
    string
  > = {
    permission:
      "가능한지",
    timing:
      "언제 움직여야 하는지",
    reason:
      "왜 이런 상황이 생겼는지",
    method:
      "어떻게 대응해야 하는지",
    risk:
      "어떤 위험이 있는지",
    comparison:
      "두 선택 중 무엇이 나은지",
    selection:
      "무엇을 선택해야 하는지",
    prediction:
      "앞으로 어떤 결과가 예상되는지",
    existence:
      "관련 운이나 구조의 존재 여부",
    evaluation:
      "전체적으로 어떻게 판단해야 하는지",
  };

  return `인생의 방향과 선택이 ${intentText[intent]}를 묻고 있다.`;
}

function buildLifeDirectionDecisionQuestion(
  decisionTarget:
    DecisionTarget,
): string {
  const decisionText: Record<
    DecisionTarget,
    string
  > = {
    start:
      "지금 시작할 것인가",
    continue:
      "현재 선택을 계속 유지할 것인가",
    stop:
      "현재 진행 중인 일을 중단할 것인가",
    wait:
      "지금 움직이지 않고 기다릴 것인가",
    choose:
      "여러 선택지 중 무엇을 선택할 것인가",
    invest:
      "자금이나 자산을 투자할 것인가",
    buy:
      "부동산이나 자산을 매입할 것인가",
    sell:
      "보유한 자산을 매도하거나 정리할 것인가",
    move:
      "현재 위치나 환경을 옮길 것인가",
    partner:
      "다른 사람과 함께할 것인가",
    separate:
      "현재 관계를 정리할 것인가",
    changeJob:
      "직업이나 직장을 변경할 것인가",
    leaveJob:
      "현재 직장을 그만둘 것인가",
    marry:
      "상대와 결혼을 결정할 것인가",
    reconcile:
      "끊어진 관계를 다시 이어갈 것인가",
    manageMoney:
      "현재의 돈과 자금 문제를 어떻게 관리할 것인가",
    protectHealth:
      "건강 문제에 어떻게 대응하고 보호할 것인가",
    respondToConflict:
      "갈등이나 법적 문제에 어떻게 대응할 것인가",
    confirmDirection:
      "앞으로의 삶의 방향을 어떻게 정할 것인가",
    none:
      "인생의 방향과 선택 문제에 대해 어떤 결정을 내려야 하는가",
  };

  return decisionText[
    decisionTarget
  ];
}

export type LifeDirectionTopicNormalizableQuestion = {
  normalizedQuestion:
    string;

  topic:
    QuestionTopic;

  intent:
    QuestionIntent;

  decisionTarget:
    DecisionTarget;

  asksWhat:
    string;

  decisionQuestion:
    string;
};

export function applyLifeDirectionTopicNormalization<
  T extends LifeDirectionTopicNormalizableQuestion,
>(
  result:
    T,
): T {
  if (
    !shouldNormalizeTopicToLifeDirection(
      result.topic,
      result.normalizedQuestion,
    )
  ) {
    return result;
  }

  return {
    ...result,

    topic:
      "lifeDirection",

    asksWhat:
      buildLifeDirectionAsksWhat(
        result.intent,
      ),

    decisionQuestion:
      buildLifeDirectionDecisionQuestion(
        result.decisionTarget,
      ),
  };
}
