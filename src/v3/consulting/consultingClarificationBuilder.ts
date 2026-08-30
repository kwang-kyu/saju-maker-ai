import type {
  HumanLifeContext,
} from "../types/humanLifeContext.js";

import type {
  ConsultingClarificationFact,
} from "./consultingInput.js";
import type {
  ConsultingClarificationItem,
  ConsultingClarificationRequest,
} from "./consultingSession.js";
import {
  assessConsultingClarificationNeed,
  type ConsultingClarificationNeed,
} from "./consultingClarificationNeedAssessment.js";
import type {
  InterpretedClarificationItemState,
} from "./consultingClarificationResponseInterpreter.js";
import type {
  DecisionResult,
} from "./decision/decisionTypes.js";
import type {
  QuestionContext,
} from "./question/questionContext.js";

export type ConsultingClarificationBuilderInput = {
  decisionTurnId:
    string;

  lifeContext:
    HumanLifeContext;

  questionContext:
    QuestionContext;

  decisionResult:
    DecisionResult;

  clarificationFacts?:
    readonly ConsultingClarificationFact[];

  itemStates?:
    readonly InterpretedClarificationItemState[];
};

function getClarificationFactFieldValue(
  questionContext:
    QuestionContext,
  itemKey:
    string,
  fieldKey:
    string,
):
  string | null {
  for (
    const fact
    of questionContext.clarificationFacts
      ?? []
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

function buildCounterpartBirthDataItem(
  questionContext:
    QuestionContext,
): ConsultingClarificationItem | null {
  const question =
    questionContext.question;

  const counterpartFacts =
    question.counterpartFacts;

  const missingCounterpartFields:
    string[] = [];

  if (
    question.analysisScope
    === "zodiac"
  ) {
    if (
      !hasCounterpartField(
        counterpartFacts.zodiac,
        getClarificationFactFieldValue(
          questionContext,
          "counterpartBirthData",
          "zodiacSign",
        ),
      )
    ) {
      missingCounterpartFields.push(
        "띠",
      );
    }
  } else {
    if (
      !hasCounterpartField(
        counterpartFacts.birthDate,
        getClarificationFactFieldValue(
          questionContext,
          "counterpartBirthData",
          "birthDate",
        ),
      )
    ) {
      missingCounterpartFields.push(
        "생년월일",
      );
    }

    if (
      !hasCounterpartField(
        counterpartFacts.calendarType,
        getClarificationFactFieldValue(
          questionContext,
          "counterpartBirthData",
          "calendarType",
        ),
      )
    ) {
      missingCounterpartFields.push(
        "양력·음력 여부",
      );
    }

    if (
      !hasCounterpartField(
        counterpartFacts.gender,
        getClarificationFactFieldValue(
          questionContext,
          "counterpartBirthData",
          "gender",
        ),
      )
    ) {
      missingCounterpartFields.push(
        "성별",
      );
    }

    if (
      question.analysisScope
      === "fullSaju"
      && !hasCounterpartField(
        counterpartFacts.birthTime,
        getClarificationFactFieldValue(
          questionContext,
          "counterpartBirthData",
          "birthTime",
        ),
      )
    ) {
      missingCounterpartFields.push(
        "출생시간",
      );
    }
  }

  if (
    missingCounterpartFields.length
    === 0
  ) {
    return null;
  }

  const missingFieldText =
    missingCounterpartFields.join(
      ", ",
    );

  return {
    key:
      "counterpartBirthData",

    description:
      `궁합 판단에 필요한 상대방의 ${missingFieldText} 정보가 확인되지 않았다.`,

      question:
      `상대방의 ${missingFieldText}을 알려주세요.`,
  };
}

function buildSelectedClarificationItem(
  questionContext:
    QuestionContext,
  selected:
    ConsultingClarificationNeed,
): ConsultingClarificationItem | null {
  if (
    selected.key
    === "counterpartBirthData"
  ) {
    return buildCounterpartBirthDataItem(
      questionContext,
    );
  }

  return null;
}

/**
 * ClarificationNeedAssessment 결과를
 * 기존 ConsultingClarificationRequest 형태로 변환한다.
 *
 * topic별 checklist로 여러 항목을 만들지 않으며,
 * selected가 있을 때만 한 턴에 질문 1개를 만든다.
 */
export function buildConsultingClarification(
  input:
    ConsultingClarificationBuilderInput,
): ConsultingClarificationRequest | null {
  if (
    input.decisionResult.verdict
    !== "insufficientEvidence"
  ) {
    return null;
  }

  if (
    input.decisionTurnId
      .trim()
      .length === 0
  ) {
    throw new Error(
      "decisionTurnId is required to build a clarification request.",
    );
  }

  const assessment =
    assessConsultingClarificationNeed({
      decisionResult:
        input.decisionResult,

      questionContext:
        input.questionContext,

      clarificationFacts:
        input.clarificationFacts,

      itemStates:
        input.itemStates,
    });

  if (
    assessment.selected
    === null
  ) {
    return null;
  }

  const item =
    buildSelectedClarificationItem(
      input.questionContext,
      assessment.selected,
    );

  if (
    item
    === null
  ) {
    return null;
  }

  return {
    decisionTurnId:
      input.decisionTurnId,

    items: [
      item,
    ],
  };
}
