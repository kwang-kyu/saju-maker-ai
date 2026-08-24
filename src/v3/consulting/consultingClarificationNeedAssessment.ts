import type {
  ConsultingClarificationFact,
} from "./consultingInput.js";
import type {
  DecisionResult,
} from "./decision/decisionTypes.js";
import type {
  InterpretedClarificationItemState,
} from "./consultingClarificationResponseInterpreter.js";
import type {
  QuestionContext,
} from "./question/questionContext.js";

export type ConsultingClarificationNeed = {
  key:
    string;

  reason:
    string;
};

export type ConsultingClarificationNeedAssessment = {
  blockingNeeds:
    ConsultingClarificationNeed[];

  selected:
    ConsultingClarificationNeed | null;
};

export type ConsultingClarificationNeedAssessmentInput = {
  decisionResult:
    DecisionResult;

  questionContext:
    QuestionContext;

  clarificationFacts?:
    readonly ConsultingClarificationFact[];

  itemStates?:
    readonly InterpretedClarificationItemState[];

  resolutions?:
    readonly InterpretedClarificationItemState[];
};

const EXPLICIT_COMPATIBILITY_PATTERN =
  /궁합|합이\s*맞/;

const INTERPERSONAL_FIT_PATTERN =
  /잘\s*맞|어울/;

const SELF_FIT_EXCLUSION_PATTERN =
  /(?:나에게|내게)\s*(?:어울|맞)|(?:나|내).*(?:직업|사업|투자\s*방식|투자|취미|성격|연애).*(?:맞|어울)|(?:직업|사업|투자|취미|집|부동산).*(?:나|내).*(?:맞|어울)|이\s*(?:직업|집).*(?:나|내).*(?:맞|어울)/;

const SPECIFIC_COUNTERPART_PATTERN =
  /(?:이|그)\s*(?:사람|남자|여자)|상대(?:방)?|우리\s*둘|둘이|(?:현재|지금|내|제|그|이)\s*(?:연인|애인|배우자|남편|아내|남자친구|여자친구|동업자|파트너)|(?:연인|애인|배우자|남편|아내|남자친구|여자친구|동업자|파트너)\s*(?:와|과|랑|하고|와는|과는)/;

function getClarificationFactFieldValue(
  facts:
    readonly ConsultingClarificationFact[],
  itemKey:
    string,
  fieldKey:
    string,
):
  string | null {
  for (
    const fact
    of facts
  ) {
    if (
      fact.key
      !== itemKey
    ) {
      continue;
    }

    for (
      const field
      of fact.fields
    ) {
      if (
        field.key
        === fieldKey
        && field.value
          .trim()
          .length
        > 0
      ) {
        return field
          .value
          .trim();
      }
    }
  }

  return null;
}

function hasCounterpartField(
  questionValue:
    string | null | undefined,
  clarificationValue:
    string | null,
): boolean {
  return (
    (
      questionValue
      ?? ""
    )
      .trim()
      .length
    > 0
    || clarificationValue
      !== null
  );
}

function resolveClarificationFacts(
  input:
    ConsultingClarificationNeedAssessmentInput,
):
  readonly ConsultingClarificationFact[] {
  return input.clarificationFacts
    ?? input.questionContext
      .clarificationFacts
    ?? [];
}

function resolveItemResolutions(
  input:
    ConsultingClarificationNeedAssessmentInput,
):
  readonly InterpretedClarificationItemState[] {
  return [
    ...(
      input.itemStates
      ?? []
    ),
    ...(
      input.resolutions
      ?? []
    ),
  ];
}

function isResolvedNeed(
  resolutions:
    readonly InterpretedClarificationItemState[],
  itemKey:
    string,
): boolean {
  return resolutions.some(
    (resolution) =>
      resolution.key
      === itemKey
      && (
        resolution.status
        === "unavailable"
        || resolution.status
        === "redirected"
      ),
  );
}

function isActualCompatibilityAnalysisRequired(
  questionContext:
    QuestionContext,
): boolean {
  const questionText =
    questionContext
      .question
      .normalizedQuestion;

  if (
    SELF_FIT_EXCLUSION_PATTERN.test(
      questionText,
    )
  ) {
    return false;
  }

  if (
    EXPLICIT_COMPATIBILITY_PATTERN.test(
      questionText,
    )
  ) {
    return true;
  }

  return (
    SPECIFIC_COUNTERPART_PATTERN.test(
      questionText,
    )
    && INTERPERSONAL_FIT_PATTERN.test(
      questionText,
    )
  );
}

function hasSufficientCounterpartBirthData(
  questionContext:
    QuestionContext,
  facts:
    readonly ConsultingClarificationFact[],
): boolean {
  const counterpartFacts =
    questionContext
      .question
      .counterpartFacts;

  if (
    questionContext
      .question
      .analysisScope
    === "zodiac"
  ) {
    return (
      questionContext
        .counterpart
        .zodiacProvided
      || hasCounterpartField(
        counterpartFacts.zodiac,
        getClarificationFactFieldValue(
          facts,
          "counterpartBirthData",
          "zodiacSign",
        ),
      )
    );
  }

  const hasBirthDate =
    hasCounterpartField(
      counterpartFacts.birthDate,
      getClarificationFactFieldValue(
        facts,
        "counterpartBirthData",
        "birthDate",
      ),
    );

  const hasCalendarType =
    hasCounterpartField(
      counterpartFacts.calendarType,
      getClarificationFactFieldValue(
        facts,
        "counterpartBirthData",
        "calendarType",
      ),
    );

  const hasGender =
    hasCounterpartField(
      counterpartFacts.gender,
      getClarificationFactFieldValue(
        facts,
        "counterpartBirthData",
        "gender",
      ),
    );

  if (
    questionContext
      .question
      .analysisScope
    === "fullSaju"
  ) {
    const hasBirthTime =
      hasCounterpartField(
        counterpartFacts.birthTime,
        getClarificationFactFieldValue(
          facts,
          "counterpartBirthData",
          "birthTime",
        ),
      );

    return (
      hasBirthDate
      && hasCalendarType
      && hasGender
      && hasBirthTime
    );
  }

  return (
    (
      hasBirthDate
      && hasCalendarType
      && hasGender
    )
    || questionContext
      .counterpart
      .birthDataProvided
  );
}

function resolveRejectedAutoSelectKeys(
  decisionResult:
    DecisionResult,
):
  readonly string[] {
  const topic =
    decisionResult.topic;

  const verdict =
    decisionResult.verdict;

  const topicLooksFinancial =
    topic
    === "business"
    || topic
    === "money"
    || topic
    === "realEstate";

  const verdictLooksInsufficient =
    verdict
    === "insufficientEvidence";

  if (
    topicLooksFinancial
    || verdictLooksInsufficient
  ) {
    return [
      "financialExecutionCapacity",
      "decisionDeadline",
    ];
  }

  return [
    "financialExecutionCapacity",
    "decisionDeadline",
  ];
}

/**
 * Decision Engine과 기존 clarification builder를 변경하지 않는
 * 읽기 전용 정책이다.
 *
 * 토픽이 business/money/realEstate이거나
 * verdict가 insufficientEvidence여도
 * financialExecutionCapacity와 decisionDeadline을
 * 자동으로 고르지 않는다.
 *
 * counterpartBirthData는 실제 궁합 분석이 필요하고
 * 상대 출생정보가 없을 때만 blocking이다.
 */
export function assessConsultingClarificationNeed(
  input:
    ConsultingClarificationNeedAssessmentInput,
): ConsultingClarificationNeedAssessment {
  const clarificationFacts =
    resolveClarificationFacts(
      input,
    );

  const resolutions =
    resolveItemResolutions(
      input,
    );

  const rejectedAutoSelectKeys =
    new Set(
      resolveRejectedAutoSelectKeys(
        input.decisionResult,
      ),
    );

  const blockingNeeds:
    ConsultingClarificationNeed[] = [];

  if (
    isActualCompatibilityAnalysisRequired(
      input.questionContext,
    )
    && !hasSufficientCounterpartBirthData(
      input.questionContext,
      clarificationFacts,
    )
    && !isResolvedNeed(
      resolutions,
      "counterpartBirthData",
    )
    && !rejectedAutoSelectKeys.has(
      "counterpartBirthData",
    )
  ) {
    blockingNeeds.push({
      key:
        "counterpartBirthData",

      reason:
        "실제 궁합 분석에 필요한 상대 출생정보가 확인되지 않았다.",
    });
  }

  const selected =
    blockingNeeds[0]
    ?? null;

  return {
    blockingNeeds,
    selected,
  };
}
