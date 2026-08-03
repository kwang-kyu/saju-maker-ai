import {
    InvalidConsultingClarificationResponseError,
    interpretConsultingClarificationResponse,
  } from "./consultingClarificationResponseInterpreter";
  import type {
    ConsultingClarificationRequest,
  } from "./consultingSession";

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
