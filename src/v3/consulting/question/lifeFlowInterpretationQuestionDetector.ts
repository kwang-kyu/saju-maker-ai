import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntent,
  QuestionMotive,
  QuestionTopic,
} from "./questionReader";

const FORTUNE_EXPRESSION_PATTERN =
  /(?:총운|평생운|전체\s*운|전반적\s*운|전반\s*운|대운|세운|월운|일운|달운|운세|운\s*흐름|운의\s*흐름|흐름|(?:^|\s)운(?:$|\s|이|은|을|의|세|이\s*어떤))/;

const OVERALL_FORTUNE_PATTERN =
  /(?:총운|평생운|전체\s*적?\s*운|전반\s*적?\s*운|평생\s*운|나의\s*운|내\s*운|전체\s*운)/;

const PERIOD_EXPRESSION_PATTERN =
  /(?:올해|금년|내년|작년|상반기|하반기|이번\s*달|다음\s*달|오늘|내일|모레|\d{4}\s*년|\d{1,2}\s*월)/;

const INTERPRETATION_REQUEST_PATTERN =
  /(?:어떨까|어떤가|봐\s*주|알려\s*주|궁금|어떻게\s*나|어떤\s*지|알고\s*싶|보고\s*싶|해\s*석)/;

const LIFE_FLOW_DECISION_EXCLUSION_PATTERNS:
  readonly RegExp[] = [
    /해도\s*(?:될|좋|괜)/,
    /(?:도\s*)?될\s*까/,
    /(?:해야|해야\s*하|해야\s*되|해야\s*할)/,
    /(?:언제).*(?:이직|시작|열|투자|창업|결혼|그만|퇴사|헤어|매도|이사)/,
    /(?:이직|투자|창업|창업|개업|결혼|이별|헤어|퇴사|매도|이사|시작|열\s*어|그만).*(?:해야|해도|할\s*까|할까|하면)/,
    /(?:열|투자|이직|창업|결혼|이별|헤어|퇴사).*(?:해도|할\s*까|할까)/,
    /(?:가게|사업|창업|회사|직장).*(?:열|시작|해도|할\s*까|할까)/,
    /(?:결혼|이혼|헤어).*(?:해야|해도|할\s*까|할까)/,
    /궁합/,
    /(?:맞|어울).*(?:사람|상대|파트너|배우자)/,
  ];

export function hasFortuneExpression(
  normalizedQuestion:
    string,
): boolean {
  return FORTUNE_EXPRESSION_PATTERN.test(
    normalizedQuestion,
  );
}

export function hasOverallFortuneExpression(
  normalizedQuestion:
    string,
): boolean {
  return OVERALL_FORTUNE_PATTERN.test(
    normalizedQuestion,
  );
}

export function hasPeriodExpression(
  normalizedQuestion:
    string,
): boolean {
  return PERIOD_EXPRESSION_PATTERN.test(
    normalizedQuestion,
  );
}

export function hasInterpretationRequest(
  normalizedQuestion:
    string,
): boolean {
  return INTERPRETATION_REQUEST_PATTERN.test(
    normalizedQuestion,
  );
}

export function isLifeFlowDecisionQuestion(
  normalizedQuestion:
    string,
  decisionTarget:
    DecisionTarget = "none",
): boolean {
  if (
    LIFE_FLOW_DECISION_EXCLUSION_PATTERNS.some(
      (pattern) =>
        pattern.test(
          normalizedQuestion,
        ),
    )
  ) {
    return true;
  }

  if (
    decisionTarget
      !== "none"
    && decisionTarget
      !== "confirmDirection"
    && [
      "start",
      "invest",
      "changeJob",
      "leaveJob",
      "marry",
      "partner",
      "separate",
      "choose",
      "wait",
      "move",
      "sell",
    ].includes(
      decisionTarget,
    )
  ) {
    return true;
  }

  if (
    /언제/.test(
      normalizedQuestion,
    )
    && !hasInterpretationRequest(
      normalizedQuestion,
    )
    && !hasOverallFortuneExpression(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  return false;
}

export function isLifeFlowInterpretationQuestion(
  normalizedQuestion:
    string,
  decisionTarget:
    DecisionTarget = "none",
): boolean {
  if (
    isLifeFlowDecisionQuestion(
      normalizedQuestion,
      decisionTarget,
    )
  ) {
    return false;
  }

  const fortune =
    hasFortuneExpression(
      normalizedQuestion,
    );

  const period =
    hasPeriodExpression(
      normalizedQuestion,
    );

  const interpret =
    hasInterpretationRequest(
      normalizedQuestion,
    );

  const overall =
    hasOverallFortuneExpression(
      normalizedQuestion,
    );

  if (
    overall
    && interpret
  ) {
    return true;
  }

  if (
    fortune
    && interpret
  ) {
    return true;
  }

  if (
    period
    && (
      fortune
      || /(?:상반기|하반기|반기|달|월|일)\s*운|상반기운|하반기운|반기운|달운|월운|일운|연운|세운/.test(
        normalizedQuestion,
      )
    )
    && interpret
  ) {
    return true;
  }

  if (
    period
    && /(?:운세|운\s*흐름|달운|월운|일운|세운|연운|총운|평생)/.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  return false;
}

export function buildLifeFlowInterpretationDecisionQuestion():
  string {
  return "이 사람의 사주에서 요청한 기간의 운 흐름은 어떻게 나타나는가";
}

export function buildLifeFlowInterpretationAsksWhat():
  string {
  return "요청한 기간의 운·운세·흐름이 어떻게 나타나는지를 묻고 있다.";
}

export function buildLifeFlowInterpretationAsksWhy():
  string {
  return "자신의 운 흐름과 해당 기간의 성향을 이해하려는 질문이다.";
}

export type LifeFlowInterpretationNormalizableQuestion = {
  normalizedQuestion:
    string;

  topic:
    QuestionTopic;

  intent:
    QuestionIntent;

  motive:
    QuestionMotive;

  decisionTarget:
    DecisionTarget;

  analysisMode:
    QuestionAnalysisMode;

  asksWhat:
    string;

  asksWhy:
    string;

  decisionQuestion:
    string;
};

export function applyLifeFlowInterpretationNormalization<
  T extends LifeFlowInterpretationNormalizableQuestion,
>(
  result:
    T,
): T {
  if (
    !isLifeFlowInterpretationQuestion(
      result.normalizedQuestion,
      result.decisionTarget,
    )
  ) {
    return result;
  }

  return {
    ...result,

    topic:
      "lifeFlow",

    analysisMode:
      "interpretation",

    decisionTarget:
      "none",

    intent:
      "prediction",

    motive:
      "selfUnderstanding",

    asksWhat:
      buildLifeFlowInterpretationAsksWhat(),

    asksWhy:
      buildLifeFlowInterpretationAsksWhy(),

    decisionQuestion:
      buildLifeFlowInterpretationDecisionQuestion(),
  };
}
