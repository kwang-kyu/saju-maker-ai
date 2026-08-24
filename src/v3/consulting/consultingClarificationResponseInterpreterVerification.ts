import {
    extractClarificationObservations,
    InvalidConsultingClarificationResponseError,
    interpretConsultingClarificationResponse,
  } from "./consultingClarificationResponseInterpreter.js";
  import type {
    ConsultingClarificationRequest,
  } from "./consultingSession.js";

  export type ConsultingClarificationResponseInterpreterVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  const CLARIFICATION:
    ConsultingClarificationRequest = {
      decisionTurnId:
        "turn-original-decision",

      items: [
        {
          key:
            "counterpartBirthData",

          description:
            "궁합 판단에 필요한 상대방의 출생정보가 확인되지 않았다.",

          question:
            "상대방의 양력·음력 여부, 성별과 출생시간을 알려주세요.",
        },
        {
          key:
            "financialExecutionCapacity",

          description:
            "실행에 사용할 자기자금과 차입 범위가 확인되지 않았다.",

          question:
            "자기자금, 추가 대출 예정액과 비상자금을 알려주세요.",
        },
      ],
    };

  const PRODUCTION_PENDING_CLARIFICATION:
    ConsultingClarificationRequest = {
      decisionTurnId:
        "turn-production-decision",

      items: [
        {
          key:
            "concreteDecisionTarget",

          description:
            "실제로 결정하려는 행동이나 선택지가 구체적으로 확인되지 않았다.",

          question:
            "이번 상담에서 실제로 결정하려는 행동이나 선택지는 무엇인가요?",
        },
        {
          key:
            "financialExecutionCapacity",

          description:
            "실행에 사용할 자기자금과 차입 범위가 확인되지 않았다.",

          question:
            "이번 선택에 투입할 자기자금, 추가 대출 예정액, 반드시 남겨둘 비상자금은 각각 얼마인가요?",
        },
        {
          key:
            "decisionDeadline",

          description:
            "결정을 내려야 하는 현실적인 기한이 확인되지 않았다.",

          question:
            "이 결정을 내려야 하는 실제 마감 시점이나 예정일이 있나요?",
        },
      ],
    };

  async function captureError(
    action:
      () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await action();

      return null;
    } catch (
      error
    ) {
      return error;
    }
  }

  export async function verifyConsultingClarificationResponseInterpreter():
    Promise<ConsultingClarificationResponseInterpreterVerificationResult> {
    const clearFinancialResponse =
      "자기자금은 5천만 원이고 추가 대출은 없으며 비상자금 1천만 원은 남깁니다.";

    const clearFinancialResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            CLARIFICATION,

          response:
            clearFinancialResponse,
        },
        async (
          request,
        ) => {
          if (
            !request.allowedKeys.includes(
              "financialExecutionCapacity",
            )
          ) {
            throw new Error(
              "Expected financial clarification key was not delivered.",
            );
          }

          return JSON.stringify({
            matches: [
              {
                key:
                  "financialExecutionCapacity",

                description:
                  "자기자금 5천만 원을 사용하고 추가 대출 없이 비상자금 1천만 원을 유지한다.",

                  fields: [
                    {
                      key:
                        "selfFunds",

                      value:
                        "50000000",

                      evidence: [
                        "자기자금은 5천만 원",
                      ],
                    },
                    {
                      key:
                        "plannedDebt",

                      value:
                        "0",

                      evidence: [
                        "추가 대출은 없으며",
                      ],
                    },
                    {
                      key:
                        "reserveFunds",

                      value:
                        "10000000",

                      evidence: [
                        "비상자금 1천만 원은 남깁니다",
                      ],
                    },
                  ],

                confidence:
                  0.98,
              },
            ],
          });
        },
      );

    const ambiguousResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            CLARIFICATION,

          response:
            "5천만 원 정도입니다.",
        },
        async () =>
          JSON.stringify({
            matches: [],
          }),
      );

    const unsupportedKeyError =
      await captureError(
        () =>
          interpretConsultingClarificationResponse(
            {
              clarification:
                CLARIFICATION,

              response:
                "현재 월소득은 900만 원입니다.",
            },
            async () =>
              JSON.stringify({
                matches: [
                  {
                    key:
                      "monthlyIncome",

                    description:
                      "현재 월소득은 900만 원이다.",

                    evidence: [
                      "현재 월소득은 900만 원",
                    ],

                    confidence:
                      0.99,
                  },
                ],
              }),
          ),
      );

      const inventedEvidenceError =
      await captureError(
        () =>
          interpretConsultingClarificationResponse(
            {
              clarification:
                CLARIFICATION,

              response:
                "추가 대출은 없습니다.",
            },
            async () =>
              JSON.stringify({
                matches: [
                  {
                    key:
                      "financialExecutionCapacity",

                    description:
                      "자기자금 5천만 원이며 추가 대출은 없다.",

                    fields: [
                      {
                        key:
                          "selfFunds",

                        value:
                          "50000000",

                        evidence: [
                          "자기자금 5천만 원",
                        ],
                      },
                    ],

                    confidence:
                      0.99,
                  },
                ],
              }),
          ),
      );

    const lowConfidenceResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            CLARIFICATION,

          response:
            "아마 양력인 것 같습니다.",
        },
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "counterpartBirthData",

                description:
                  "상대방 생년월일은 양력일 가능성이 있다.",

                fields: [
                  {
                    key:
                      "calendarType",

                    value:
                      "solar",

                    evidence: [
                      "아마 양력인 것 같습니다",
                    ],
                  },
                ],

                confidence:
                  0.6,
              },
            ],
          }),
      );

    const regressionUserResponse =
      "현재 관계는 원만한 지인이고 특별한 갈등은 없습니다. 상대방은 1967년 음력 4월 10일생 여성이고 양띠입니다.";

    const regressionResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            CLARIFICATION,

          response:
            regressionUserResponse,
        },
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "counterpartBirthData",

                description:
                  "상대방은 1967년 음력 4월 10일생 여성이며 양띠이다.",

                fields: [
                  {
                    key:
                      "birthDate",

                    value:
                      "1967년 음력 4월 10일생",

                    evidence: [
                      "1967년 음력 4월 10일생",
                    ],
                  },
                  {
                    key:
                      "calendarType",

                    value:
                      "음력",

                    evidence: [
                      "음력",
                    ],
                  },
                  {
                    key:
                      "gender",

                    value:
                      "여성",

                    evidence: [
                      "여성",
                    ],
                  },
                  {
                    key:
                      "zodiacSign",

                    value:
                      "양띠",

                    evidence: [
                      "양띠",
                    ],
                  },
                ],

                confidence:
                  0.95,
              },
            ],
          }),
      );

    const regressionFact =
      regressionResult
        .confirmedFacts[0];

    const regressionFields =
      new Map(
        regressionFact
          ?.fields
          .map(
            (field) => [
              field.key,
              field.value,
            ],
          )
        ?? [],
      );

    const duplicateIncompleteObservations =
      extractClarificationObservations(
        "상대방은 1967년 4월생이고 다시 말해 1967년 4월입니다.",
      );

    const incompleteBirthDateResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            CLARIFICATION,

          response:
            "상대방은 1967년 4월생 여성입니다.",
        },
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "counterpartBirthData",

                description:
                  "상대방은 1967년 4월생 여성이다.",

                fields: [
                  {
                    key:
                      "birthDate",

                    value:
                      "1967년 4월",

                    evidence: [
                      "1967년 4월",
                    ],
                  },
                  {
                    key:
                      "gender",

                    value:
                      "여성",

                    evidence: [
                      "여성",
                    ],
                  },
                ],

                confidence:
                  0.95,
              },
            ],
          }),
      );

    const invalidBirthDateResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            CLARIFICATION,

          response:
            "상대방은 1967-02-30생입니다.",
        },
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "counterpartBirthData",

                description:
                  "상대방 생년월일은 1967-02-30이다.",

                fields: [
                  {
                    key:
                      "birthDate",

                    value:
                      "1967-02-30",

                    evidence: [
                      "1967-02-30",
                    ],
                  },
                ],

                confidence:
                  0.95,
              },
            ],
          }),
      );

    const invalidOptionalFieldResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            CLARIFICATION,

          response:
            "상대방은 1967년 4월 10일생 여성이고 용말띠입니다.",
        },
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "counterpartBirthData",

                description:
                  "상대방은 1967년 4월 10일생 여성이다.",

                fields: [
                  {
                    key:
                      "birthDate",

                    value:
                      "1967년 4월 10일",

                    evidence: [
                      "1967년 4월 10일",
                    ],
                  },
                  {
                    key:
                      "gender",

                    value:
                      "여성",

                    evidence: [
                      "여성",
                    ],
                  },
                  {
                    key:
                      "zodiacSign",

                    value:
                      "용말띠",

                    evidence: [
                      "용말띠",
                    ],
                  },
                ],

                confidence:
                  0.95,
              },
            ],
          }),
      );

    const invalidOptionalFieldError =
      await captureError(
        () =>
          Promise.resolve(
            invalidOptionalFieldResult,
          ),
      );

    const invalidOptionalFieldFact =
      invalidOptionalFieldResult
        .confirmedFacts[0];

    const invalidOptionalFieldValues =
      new Map(
        invalidOptionalFieldFact
          ?.fields
          .map(
            (field) => [
              field.key,
              field.value,
            ],
          )
        ?? [],
      );

    const unavailableResponse =
      "아직 구체적인 자금 규모는 정하지 않았습니다. 인터넷 광고 사업 자체가 나에게 맞는지, 수익을 만들 수 있는지가 궁금합니다.";

    const unavailableResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            PRODUCTION_PENDING_CLARIFICATION,

          response:
            unavailableResponse,
        },
        async () =>
          JSON.stringify({
            matches: [],
          }),
      );

    const gptMatchesDoNotOverrideResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            PRODUCTION_PENDING_CLARIFICATION,

          response:
            unavailableResponse,
        },
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "concreteDecisionTarget",

                description:
                  "인터넷 광고 사업 적합성을 판단하려고 한다.",

                fields: [
                  {
                    key:
                      "decisionTarget",

                    value:
                      "인터넷 광고 사업",

                    evidence: [
                      "인터넷 광고 사업",
                    ],
                  },
                ],

                confidence:
                  0.96,
              },
              {
                key:
                  "financialExecutionCapacity",

                description:
                  "자금 규모는 아직 정하지 않았다.",

                fields: [
                  {
                    key:
                      "selfFunds",

                    value:
                      "미정",

                    evidence: [
                      "아직 구체적인 자금 규모는 정하지 않았습니다",
                    ],
                  },
                ],

                confidence:
                  0.91,
              },
            ],
          }),
      );

    const cannotAnswerResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            PRODUCTION_PENDING_CLARIFICATION,

          response:
            "지금은 답할 수 없다",
        },
        async () =>
          JSON.stringify({
            matches: [],
          }),
      );

    const actualAmountResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            PRODUCTION_PENDING_CLARIFICATION,

          response:
            "5천만 원 정도입니다",
        },
        async () =>
          JSON.stringify({
            matches: [],
          }),
      );

    const answeredAmountResult =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            PRODUCTION_PENDING_CLARIFICATION,

          response:
            "5천만 원 정도입니다",
        },
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "financialExecutionCapacity",

                description:
                  "자기자금은 5천만 원 정도다.",

                fields: [
                  {
                    key:
                      "selfFunds",

                    value:
                      "50000000",

                    evidence: [
                      "5천만 원 정도입니다",
                    ],
                  },
                ],

                confidence:
                  0.95,
              },
            ],
          }),
      );

    const unavailableFinancialState =
      unavailableResult
        .itemStates
        .find(
          (state) =>
            state.key
            === "financialExecutionCapacity",
        );

    const unavailableTargetState =
      unavailableResult
        .itemStates
        .find(
          (state) =>
            state.key
            === "concreteDecisionTarget",
        );

    const gptOverrideFinancialState =
      gptMatchesDoNotOverrideResult
        .itemStates
        .find(
          (state) =>
            state.key
            === "financialExecutionCapacity",
        );

    const gptOverrideTargetState =
      gptMatchesDoNotOverrideResult
        .itemStates
        .find(
          (state) =>
            state.key
            === "concreteDecisionTarget",
        );

    const checks = {
      clearResponseResolvesOnlyMatchingItem:
        clearFinancialResult
          .confirmedFacts
          .length
        === 1
        && clearFinancialResult
          .confirmedFacts[0]
          ?.key
        === "financialExecutionCapacity",

        clearResponsePreservesExactEvidence:
        clearFinancialResult
          .confirmedFacts[0]
          ?.fields
          .flatMap(
            (field) =>
              field.evidence,
          )
          .every(
            (evidence) =>
              clearFinancialResponse
                .includes(
                  evidence,
                ),
          )
        === true,

      clearResponseIsResolved:
        !clearFinancialResult
          .hasUnresolvedResponse,

      ambiguousResponseDoesNotGuessKey:
        ambiguousResult
          .confirmedFacts
          .length
        === 0
        && ambiguousResult
          .hasUnresolvedResponse,

      unsupportedKeyIsRejected:
        unsupportedKeyError
        instanceof
        InvalidConsultingClarificationResponseError,

      inventedEvidenceIsRejected:
        inventedEvidenceError
        instanceof
        InvalidConsultingClarificationResponseError,

      lowConfidenceMatchIsNotConfirmed:
        lowConfidenceResult
          .confirmedFacts
          .length
        === 0
        && lowConfidenceResult
          .hasUnresolvedResponse,

      koreanLunarBirthDateNormalizesToIso:
        regressionFields.get(
          "birthDate",
        )
        === "1967-04-10",

      calendarTypeNormalizesToLunar:
        regressionFields.get(
          "calendarType",
        )
        === "lunar",

      femaleNormalizesToFemale:
        regressionFields.get(
          "gender",
        )
        === "female",

      sheepZodiacNormalizesToYang:
        regressionFields.get(
          "zodiacSign",
        )
        === "양띠",

      regressionResponseIsResolved:
        !regressionResult
          .hasUnresolvedResponse
        && regressionResult
          .confirmedFacts
          .length
        === 1,

      incompleteBirthMonthDoesNotConfirmBirthDate:
        incompleteBirthDateResult
          .confirmedFacts[0]
          ?.fields
          .some(
            (field) =>
              field.key
              === "birthDate",
          )
        === false,

      incompleteBirthMonthIsPreservedAsObservation:
        incompleteBirthDateResult
          .observations
          .length
        === 1
        && incompleteBirthDateResult
          .observations[0]
          ?.key
        === "incompleteBirthDate"
        && incompleteBirthDateResult
          .observations[0]
          ?.rawValue
        === "1967년 4월"
        && incompleteBirthDateResult
          .observations[0]
          ?.evidence
          .includes(
            "1967년 4월",
          )
        === true,

      incompleteObservationIsSeparatedFromConfirmedFacts:
        incompleteBirthDateResult
          .confirmedFacts
          .every(
            (fact) =>
              fact
                .fields
                .every(
                  (field) =>
                    field.key
                    !== "birthDate"
                    && field.value
                    !== "1967년 4월"
                    && field.value
                    !== "1967-04"
                    && field.value
                    !== "1967-04-01",
                ),
          )
        && incompleteBirthDateResult
          .confirmedFacts[0]
          ?.fields
          .some(
            (field) =>
              field.key
              === "gender",
          )
        === true,

      incompleteObservationIsNotNormalizedBirthDate:
        incompleteBirthDateResult
          .observations
          .every(
            (observation) =>
              observation.rawValue
              === "1967년 4월"
              && !/^\d{4}-\d{2}-\d{2}$/.test(
                observation.rawValue,
              ),
          ),

      completeBirthDateDoesNotCreateObservation:
        regressionResult
          .observations
          .length
        === 0
        && invalidOptionalFieldResult
          .observations
          .length
        === 0,

      duplicateIncompleteBirthMonthIsDeduped:
        duplicateIncompleteObservations
          .length
        === 1
        && duplicateIncompleteObservations[0]
          ?.rawValue
        === "1967년 4월",

      invalidDateDoesNotReachConfirmedFacts:
        invalidBirthDateResult
          .confirmedFacts
          .length
        === 0
        && invalidBirthDateResult
          .hasUnresolvedResponse,

      invalidOptionalFieldDoesNotRejectInterpreter:
        invalidOptionalFieldError
        === null,

      invalidOptionalFieldDoesNotConfirmZodiacSign:
        invalidOptionalFieldValues.has(
          "zodiacSign",
        )
        === false,

      invalidOptionalFieldKeepsValidBirthDate:
        invalidOptionalFieldValues.get(
          "birthDate",
        )
        === "1967-04-10",

      unavailableResponseDoesNotConfirmFacts:
        unavailableResult
          .confirmedFacts
          .length
        === 0,

      unavailableResponseMarksFinancialSettled:
        (
          unavailableFinancialState
            ?.status
          === "unavailable"
          || unavailableFinancialState
            ?.status
          === "redirected"
        )
        === true,

      unavailableResponseMarksTargetRedirected:
        unavailableTargetState
          ?.status
        === "redirected",

      unavailableResponseLeavesDeadlinePending:
        unavailableResult
          .itemStates
          .every(
            (state) =>
              state.key
              !== "decisionDeadline",
          ),

      unavailableResponseIsResolved:
        !unavailableResult
          .hasUnresolvedResponse,

      gptMatchesDoNotOverrideUnavailableOrRedirected:
        (
          gptOverrideFinancialState
            ?.status
          === "unavailable"
          || gptOverrideFinancialState
            ?.status
          === "redirected"
        )
        === true
        && gptOverrideTargetState
          ?.status
        === "redirected"
        && gptMatchesDoNotOverrideResult
          .itemStates
          .every(
            (state) =>
              state.status
              !== "answered",
          ),

      cannotAnswerMarksAskedItemUnavailable:
        cannotAnswerResult
          .itemStates
          .length
        === 1
        && cannotAnswerResult
          .itemStates[0]
          ?.key
        === "concreteDecisionTarget"
        && cannotAnswerResult
          .itemStates[0]
          ?.status
        === "unavailable"
        && !cannotAnswerResult
          .hasUnresolvedResponse,

      cannotAnswerLeavesOtherItemsPending:
        cannotAnswerResult
          .itemStates
          .every(
            (state) =>
              state.key
              !== "financialExecutionCapacity"
              && state.key
              !== "decisionDeadline",
          ),

      actualAmountIsNotUnavailable:
        actualAmountResult
          .itemStates
          .length
        === 0
        && actualAmountResult
          .confirmedFacts
          .length
        === 0
        && actualAmountResult
          .hasUnresolvedResponse,

      extractedAmountIsAnswered:
        answeredAmountResult
          .itemStates
          .length
        === 1
        && answeredAmountResult
          .itemStates[0]
          ?.key
        === "financialExecutionCapacity"
        && answeredAmountResult
          .itemStates[0]
          ?.status
        === "answered"
        && answeredAmountResult
          .confirmedFacts[0]
          ?.fields[0]
          ?.key
        === "selfFunds"
        && answeredAmountResult
          .confirmedFacts[0]
          ?.fields[0]
          ?.value
        === "50000000",
    };

    return {
      checks,

      passed:
        Object
          .values(
            checks,
          )
          .every(
            Boolean,
          ),
    };
  }
