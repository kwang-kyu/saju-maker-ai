import {
    buildConsultingPrompt,
  } from "./consultingPromptBuilder.js";

  import {
    buildDecisionExplanationPlan,
  } from "./decisionExplanationPlan.js";

  import type {
    DecisionExplanationInput,
  } from "./decisionResultReader.js";

  import {
    buildDecisionExplanationPayload,
  } from "./decisionExplanationPayload.js";

  export type TimingSearchPromptVerificationResult = {
    checks: {
      recommendationTitleIsDelivered:
        boolean;

      recommendationPeriodIsDelivered:
        boolean;

      recommendationEvidenceIsDelivered:
        boolean;

      cautionTitleIsDelivered:
        boolean;

      cautionPeriodIsDelivered:
        boolean;

      nonTimingSearchDoesNotDeliverTimingBlocks:
        boolean;
    };

    passed:
      boolean;
  };

  function buildTimingInput():
    DecisionExplanationInput {
    return {
      verdict:
        "conditionallyRecommended",

      confidence:
        "medium",

      topic:
        "business",

      intent:
        "timing",

      decisionTarget:
        "start",

      contextAlignment:
        "partiallyAligned",

      actionReadiness:
        "preparationRequired",

      directAnswer:
        "사업 자체는 가능하지만 지금 바로 확정하기보다 더 유리한 시기를 선택하는 편이 좋습니다.",

      reason:
        "현재 기반을 유지하면서 시기를 선택하는 판단이 필요하다.",

      evidence: [
        {
          source:
            "questionIntent",

          description:
            "올해 안에서 상대적으로 유리한 사업 시작 시기를 찾는 질문이다.",

          importance:
            "core",
        },
      ],

      conditions:
        [],

      risks:
        [],

      conflictExists:
        false,

      conflictDescription:
        "직접적인 충돌은 확인되지 않았다.",

      recommendedDirection:
        "유리한 월운 구간을 선택하여 점진적으로 시작한다.",

      prohibitedDirection:
        "주의 구간에서 무리하게 확정 실행하지 않는다.",

      finalDecisionSentence:
        "올해 안에서는 상대적으로 유리한 시기를 골라 진행하는 편이 좋습니다.",

      roleRecommendationAssessment:
        null,

      lifeFlowInterpretationAssessment:
        null,

      timingAssessment: {
        analysisRequired:
          true,

        timingType:
          "bestTiming",

        evidenceLevel:
          "available",

        assessmentScope:
          "timingEvaluation",

        targetScope:
          "year",

        targetStartDate:
          "2025-01-01",

        targetEndDate:
          "2025-12-31",

        targetYear:
          2025,

        targetMonth:
          null,

        targetDay:
          null,

        hasCurrentDaeun:
          true,

        hasTargetSeun:
          true,

        hasYearSegments:
          true,

        hasWolun:
          true,

        hasIlun:
          false,

        flowInterpretationAvailable:
          true,

        flowDirection:
          "mixed",

        overallTheme:
          "올해 안에서도 월별 흐름 차이가 있으므로 실행 시기를 선택할 필요가 있다.",

        supportiveSignals: [
          "일부 월운에서 원국과의 합이 확인된다.",
        ],

        tensionSignals: [
          "일부 월운에서는 충·형·파가 함께 확인된다.",
        ],

        cautions: [
          "월운이 긴장되는 구간에서는 무리한 확정 실행을 피한다.",
        ],

        limitations:
          [],

        evidenceKeys: [
          "seun",
          "wolun-1",
        ],

        timingSearch: {
          required:
            true,

          available:
            true,

          searchedFromDate:
            "2025-08-16",

          searchedToDate:
            "2025-12-31",

          candidateWindows: [
            {
              targetYear:
                2025,

              targetMonth:
                9,

              startDate:
                "2025-09-08",

              endDate:
                "2025-09-30",

              ganZhi:
                "乙酉",

              tenGod:
                "정재",

              element:
                "wood",

              score:
                6,

              supportiveScore:
                6,

              tensionScore:
                0,

              direction:
                "supportive",

              supportiveReasons: [
                "천간의 합이 확인된다.",
                "지지의 육합이 확인된다.",
              ],

              cautionReasons:
                [],

              evidenceKeys: [
                "wolun-1:year:combination",
                "wolun-1:day:combination",
              ],
            },

            {
              targetYear:
                2025,

              targetMonth:
                10,

              startDate:
                "2025-10-08",

              endDate:
                "2025-10-31",

              ganZhi:
                "丙戌",

              tenGod:
                "편관",

              element:
                "fire",

              score:
                -4,

              supportiveScore:
                2,

              tensionScore:
                6,

              direction:
                "mixed",

              supportiveReasons: [
                "천간의 합이 일부 확인된다.",
              ],

              cautionReasons: [
                "지지의 충이 확인된다.",
                "형과 파가 함께 확인된다.",
              ],

              evidenceKeys: [
                "wolun-1:day:clash",
                "wolun-1:time:punishment",
                "wolun-1:time:break",
              ],
            },
          ],

          recommendedWindows: [
            {
              targetYear:
                2025,

              targetMonth:
                9,

              startDate:
                "2025-09-08",

              endDate:
                "2025-09-30",

              ganZhi:
                "乙酉",

              tenGod:
                "정재",

              element:
                "wood",

              score:
                6,

              supportiveScore:
                6,

              tensionScore:
                0,

              direction:
                "supportive",

              supportiveReasons: [
                "천간의 합이 확인된다.",
                "지지의 육합이 확인된다.",
              ],

              cautionReasons:
                [],

              evidenceKeys: [
                "wolun-1:year:combination",
                "wolun-1:day:combination",
              ],
            },
          ],

          cautionWindows: [
            {
              targetYear:
                2025,

              targetMonth:
                10,

              startDate:
                "2025-10-08",

              endDate:
                "2025-10-31",

              ganZhi:
                "丙戌",

              tenGod:
                "편관",

              element:
                "fire",

              score:
                -4,

              supportiveScore:
                2,

              tensionScore:
                6,

              direction:
                "mixed",

              supportiveReasons: [
                "천간의 합이 일부 확인된다.",
              ],

              cautionReasons: [
                "지지의 충이 확인된다.",
                "형과 파가 함께 확인된다.",
              ],

              evidenceKeys: [
                "wolun-1:day:clash",
                "wolun-1:time:punishment",
                "wolun-1:time:break",
              ],
            },
          ],

          limitations:
            [],
        },

        evidenceComplete:
          true,
      },

      engineDecisionLocked:
        true,

      gptMayRejudge:
        false,
    };
  }

  function buildPromptForInput(
    input:
      DecisionExplanationInput,
    question:
      string,
  ) {
    const plan =
      buildDecisionExplanationPlan(
        input,
        question,
      );

    const payload =
      buildDecisionExplanationPayload(
        plan,
      );

    return buildConsultingPrompt(
      payload,
    );
  }

  export function verifyTimingSearchPrompt():
    TimingSearchPromptVerificationResult {
    const input =
      buildTimingInput();

    const prompt =
      buildPromptForInput(
        input,
        "올해 안에는 언제쯤 사업을 시작하는 것이 좋을까요?",
      );

    const withoutSearchInput:
      DecisionExplanationInput = {
        ...input,

        directAnswer:
        "사업 시작 여부는 현재 조건과 준비 상태를 기준으로 판단합니다.",

      recommendedDirection:
        "현재 조건을 점검한 뒤 단계적으로 진행합니다.",

      finalDecisionSentence:
        "현재 조건을 확인하면서 단계적으로 진행하는 편이 좋습니다.",

        timingAssessment:
          input.timingAssessment
          ? {
              ...input.timingAssessment,

              timingSearch: {
                ...input
                  .timingAssessment
                  .timingSearch,

                required:
                  false,

                available:
                  false,

                candidateWindows:
                  [],

                recommendedWindows:
                  [],

                cautionWindows:
                  [],
              },
            }
          : null,
      };

    const promptWithoutSearch =
      buildPromptForInput(
        withoutSearchInput,
        "사업을 시작해도 괜찮을까요?",
      );

    const checks = {
      recommendationTitleIsDelivered:
        prompt.userPrompt
          .includes(
            "상대적으로 유리한 시기",
          ),

      recommendationPeriodIsDelivered:
        prompt.userPrompt
          .includes(
            "2025년 9월",
          )
        && prompt.userPrompt
          .includes(
            "2025-09-08",
          )
        && prompt.userPrompt
          .includes(
            "2025-09-30",
          ),

      recommendationEvidenceIsDelivered:
        prompt.userPrompt
          .includes(
            "乙酉",
          )
        && prompt.userPrompt
          .includes(
            "정재",
          )
        && prompt.userPrompt
          .includes(
            "시기 점수 6",
          )
        && prompt.userPrompt
          .includes(
            "천간의 합이 확인된다.",
          ),

      cautionTitleIsDelivered:
        prompt.userPrompt
          .includes(
            "상대적으로 주의할 시기",
          ),

      cautionPeriodIsDelivered:
        prompt.userPrompt
          .includes(
            "2025년 10월",
          )
        && prompt.userPrompt
          .includes(
            "2025-10-08",
          )
        && prompt.userPrompt
          .includes(
            "2025-10-31",
          )
        && prompt.userPrompt
          .includes(
            "시기 점수 -4",
          ),

      nonTimingSearchDoesNotDeliverTimingBlocks:
        !promptWithoutSearch
          .userPrompt
          .includes(
            "상대적으로 유리한 시기",
          )
        && !promptWithoutSearch
          .userPrompt
          .includes(
            "상대적으로 주의할 시기",
          ),
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
