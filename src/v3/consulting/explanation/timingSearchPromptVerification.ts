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

      decisionConclusionNatureRulesAreInSystemPrompt:
        boolean;

      systemPromptExcludesOtherConclusionNatureRules:
        boolean;

      predictionConclusionNatureRulesAreInSystemPrompt:
        boolean;

      predictionSystemPromptExcludesOtherConclusionNatureRules:
        boolean;

      interpretationConclusionNatureRulesAreInSystemPrompt:
        boolean;

      interpretationSystemPromptExcludesOtherConclusionNatureRules:
        boolean;

      recommendationConclusionNatureRulesAreInSystemPrompt:
        boolean;

      recommendationSystemPromptExcludesOtherConclusionNatureRules:
        boolean;

      warningConclusionNatureRulesAreInSystemPrompt:
        boolean;

      warningSystemPromptExcludesOtherConclusionNatureRules:
        boolean;

      existenceConclusionNatureRulesAreInSystemPrompt:
        boolean;

      existenceSystemPromptExcludesOtherConclusionNatureRules:
        boolean;
    };

    passed:
      boolean;
  };

  const OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES = [
    "결론 성격: 의미·구조 해석 설명 원칙",
    "결론 성격: 적합성·추천 설명 원칙",
    "결론 성격: 위험·주의 설명 원칙",
    "결론 성격: 가능성·흐름 설명 원칙",
    "결론 성격: 존재 여부 설명 원칙",
  ] as const;

  const PREDICTION_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES = [
    "결론 성격: 실행·선택 판단 설명 원칙",
    "결론 성격: 의미·구조 해석 설명 원칙",
    "결론 성격: 적합성·추천 설명 원칙",
    "결론 성격: 위험·주의 설명 원칙",
    "결론 성격: 존재 여부 설명 원칙",
  ] as const;

  const INTERPRETATION_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES = [
    "결론 성격: 실행·선택 판단 설명 원칙",
    "결론 성격: 적합성·추천 설명 원칙",
    "결론 성격: 위험·주의 설명 원칙",
    "결론 성격: 가능성·흐름 설명 원칙",
    "결론 성격: 존재 여부 설명 원칙",
  ] as const;

  const RECOMMENDATION_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES = [
    "결론 성격: 실행·선택 판단 설명 원칙",
    "결론 성격: 의미·구조 해석 설명 원칙",
    "결론 성격: 위험·주의 설명 원칙",
    "결론 성격: 가능성·흐름 설명 원칙",
    "결론 성격: 존재 여부 설명 원칙",
  ] as const;

  const WARNING_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES = [
    "결론 성격: 실행·선택 판단 설명 원칙",
    "결론 성격: 의미·구조 해석 설명 원칙",
    "결론 성격: 적합성·추천 설명 원칙",
    "결론 성격: 가능성·흐름 설명 원칙",
    "결론 성격: 존재 여부 설명 원칙",
  ] as const;

  const EXISTENCE_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES = [
    "결론 성격: 실행·선택 판단 설명 원칙",
    "결론 성격: 의미·구조 해석 설명 원칙",
    "결론 성격: 적합성·추천 설명 원칙",
    "결론 성격: 위험·주의 설명 원칙",
    "결론 성격: 가능성·흐름 설명 원칙",
  ] as const;

  function buildBaseInput():
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

      conclusionNature:
        "decision",

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

      timingAssessment:
        null,

      engineDecisionLocked:
        true,

      gptMayRejudge:
        false,
    };
  }

  function buildTimingInput():
    DecisionExplanationInput {
    return {
      ...buildBaseInput(),

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
    };
  }

  function buildPredictionInput():
    DecisionExplanationInput {
    return {
      ...buildBaseInput(),

      topic:
        "money",

      intent:
        "prediction",

      decisionTarget:
        "none",

      conclusionNature:
        "prediction",

      directAnswer:
        "앞으로 재물이 들어올 가능성은 있지만, 흐름상 바로 확정되기보다는 단계적인 변화를 거칠 수 있습니다.",

      reason:
        "재물 흐름과 현재 국면을 기준으로 가능성을 설명한다.",

      evidence: [
        {
          source:
            "questionIntent",

          description:
            "앞으로 돈이 들어올지에 대한 가능성·흐름 질문이다.",

          importance:
            "core",
        },
      ],

      recommendedDirection:
        "흐름을 관찰하며 재물 변화 가능성을 점검한다.",

      prohibitedDirection:
        "가능성 설명을 실행 지시로 바꾸지 않는다.",

      finalDecisionSentence:
        "앞으로 재물이 들어올 가능성은 있지만, 흐름상 단계적인 변화를 거칠 수 있습니다.",

      timingAssessment:
        null,
    };
  }

  function buildInterpretationInput():
    DecisionExplanationInput {
    return {
      ...buildBaseInput(),

      topic:
        "lifeFlow",

      intent:
        "reason",

      decisionTarget:
        "none",

      conclusionNature:
        "interpretation",

      directAnswer:
        "현재 사주 구조상 책임을 혼자 떠안는 경향과 반복되는 부담 패턴이 함께 확인됩니다.",

      reason:
        "원국과 현재 흐름을 기준으로 성향과 구조를 해석한다.",

      evidence: [
        {
          source:
            "questionIntent",

          description:
            "어떤 성향인지, 왜 반복되는지에 대한 의미·구조 해석 질문이다.",

          importance:
            "core",
        },
      ],

      recommendedDirection:
        "반복되는 부담 패턴을 인식하고 구조를 이해하는 데 활용한다.",

      prohibitedDirection:
        "해석을 실행 지시나 행동 계획으로 바꾸지 않는다.",

      finalDecisionSentence:
        "현재 사주 구조상 책임을 혼자 떠안는 경향과 반복되는 부담 패턴이 함께 확인됩니다.",

      timingAssessment:
        null,
    };
  }

  function buildRecommendationInput():
    DecisionExplanationInput {
    return {
      ...buildBaseInput(),

      topic:
        "job",

      intent:
        "selection",

      decisionTarget:
        "choose",

      conclusionNature:
        "recommendation",

      directAnswer:
        "현재 사주 구조상 기획·조율 역할과 사람을 연결하는 업무가 상대적으로 적합합니다.",

      reason:
        "원국과 현재 흐름을 기준으로 적성과 적합한 활동 방향을 설명한다.",

      evidence: [
        {
          source:
            "questionIntent",

          description:
            "어떤 직업이 맞는지에 대한 적합성·추천 질문이다.",

          importance:
            "core",
        },
      ],

      recommendedDirection:
        "기획·조율과 사람 연결 업무를 중심으로 적합성을 설명한다.",

      prohibitedDirection:
        "추천을 실행 지시나 확정 판단으로 바꾸지 않는다.",

      finalDecisionSentence:
        "현재 사주 구조상 기획·조율 역할과 사람을 연결하는 업무가 상대적으로 적합합니다.",

      timingAssessment:
        null,
    };
  }

  function buildWarningInput():
    DecisionExplanationInput {
    return {
      ...buildBaseInput(),

      topic:
        "business",

      intent:
        "risk",

      decisionTarget:
        "none",

      conclusionNature:
        "warning",

      directAnswer:
        "현재 사주 구조상 무리한 확장과 책임 과중 패턴을 특히 조심해야 합니다.",

      reason:
        "원국과 현재 흐름을 기준으로 위험·주의·반복 패턴을 설명한다.",

      evidence: [
        {
          source:
            "questionIntent",

          description:
            "무엇을 조심해야 하는지에 대한 위험·주의 질문이다.",

          importance:
            "core",
        },
      ],

      recommendedDirection:
        "위험·반복 패턴을 인식하고 주의 요소를 점검한다.",

      prohibitedDirection:
        "경고를 실행 지시나 확정 판단으로 바꾸지 않는다.",

      finalDecisionSentence:
        "현재 사주 구조상 무리한 확장과 책임 과중 패턴을 특히 조심해야 합니다.",

      timingAssessment:
        null,
    };
  }

  function buildExistenceInput():
    DecisionExplanationInput {
    return {
      ...buildBaseInput(),

      topic:
        "money",

      intent:
        "existence",

      decisionTarget:
        "none",

      conclusionNature:
        "existence",

      directAnswer:
        "현재 사주 구조상 재물운 관련 신호가 일부 확인됩니다.",

      reason:
        "원국과 현재 흐름을 기준으로 재물운·구조의 존재 여부를 설명한다.",

      evidence: [
        {
          source:
            "questionIntent",

          description:
            "재물운이 있는지에 대한 존재 여부 질문이다.",

          importance:
            "core",
        },
      ],

      recommendedDirection:
        "존재하는 근거와 신호를 중심으로 설명한다.",

      prohibitedDirection:
        "존재 질문을 실행 조언이나 행동 계획으로 바꾸지 않는다.",

      finalDecisionSentence:
        "현재 사주 구조상 재물운 관련 신호가 일부 확인됩니다.",

      timingAssessment:
        null,
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

    const predictionInput =
      buildPredictionInput();

    const predictionPrompt =
      buildPromptForInput(
        predictionInput,
        "앞으로 돈이 들어올까요?",
      );

    const interpretationInput =
      buildInterpretationInput();

    const interpretationPrompt =
      buildPromptForInput(
        interpretationInput,
        "나는 어떤 성향인가요?",
      );

    const recommendationInput =
      buildRecommendationInput();

    const recommendationPrompt =
      buildPromptForInput(
        recommendationInput,
        "어떤 직업이 맞나요?",
      );

    const warningInput =
      buildWarningInput();

    const warningPrompt =
      buildPromptForInput(
        warningInput,
        "무엇을 조심해야 하나요?",
      );

    const existenceInput =
      buildExistenceInput();

    const existencePrompt =
      buildPromptForInput(
        existenceInput,
        "재물운이 있나요?",
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

      decisionConclusionNatureRulesAreInSystemPrompt:
        prompt.systemPrompt
          .includes(
            "결론 성격: 실행·선택 판단 설명 원칙",
          )
        && prompt.systemPrompt
          .includes(
            "확정된 결론을 중심으로 설명한다.",
          )
        && prompt.systemPrompt
          .includes(
            "결론의 이유와 근거를 설명할 수 있다.",
          )
        && prompt.systemPrompt
          .includes(
            "엔진이 제공한 recommendedDirection이 있는 경우에만 실행 방향을 설명한다.",
          )
        && prompt.systemPrompt
          .includes(
            "새로운 실행 지시나 판단을 만들지 않는다.",
          )
        && prompt.systemPrompt
          .includes(
            "finalDecision, verdict, confidence, evidence, conditions, risks를 새로 판단하거나 변경하지 않는다.",
          ),

      systemPromptExcludesOtherConclusionNatureRules:
        OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES
          .every(
            (title) =>
              !prompt.systemPrompt
                .includes(
                  title,
                ),
          ),

      predictionConclusionNatureRulesAreInSystemPrompt:
        predictionPrompt.systemPrompt
          .includes(
            "결론 성격: 가능성·흐름 설명 원칙",
          )
        && predictionPrompt.systemPrompt
          .includes(
            "가능성, 흐름, 변화 방향, 시기 관련 표현 중심으로 설명한다.",
          )
        && predictionPrompt.systemPrompt
          .includes(
            "미래를 확정적으로 단정하지 않는다.",
          )
        && predictionPrompt.systemPrompt
          .includes(
            "엔진에 없는 새로운 미래 예측을 만들지 않는다.",
          )
        && predictionPrompt.systemPrompt
          .includes(
            "실행 지시나 행동 계획으로 답변을 바꾸지 않는다.",
          )
        && predictionPrompt.systemPrompt
          .includes(
            "finalDecision, verdict, confidence, evidence, conditions, risks를 새로 판단하거나 변경하지 않는다.",
          ),

      predictionSystemPromptExcludesOtherConclusionNatureRules:
        PREDICTION_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES
          .every(
            (title) =>
              !predictionPrompt.systemPrompt
                .includes(
                  title,
                ),
          ),

      interpretationConclusionNatureRulesAreInSystemPrompt:
        interpretationPrompt.systemPrompt
          .includes(
            "결론 성격: 의미·구조 해석 설명 원칙",
          )
        && interpretationPrompt.systemPrompt
          .includes(
            "- 의미와 구조의 해석 중심으로 설명한다.",
          )
        && interpretationPrompt.systemPrompt
          .includes(
            "- 새로운 행동 지시나 실행 계획을 만들지 않는다.",
          )
        && interpretationPrompt.systemPrompt
          .includes(
            "- 엔진 결론을 실행형 조언으로 바꾸지 않는다.",
          )
        && interpretationPrompt.systemPrompt
          .includes(
            "- finalDecision, verdict, confidence, evidence, conditions, risks를 새로 판단하거나 변경하지 않는다.",
          ),

      interpretationSystemPromptExcludesOtherConclusionNatureRules:
        INTERPRETATION_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES
          .every(
            (title) =>
              !interpretationPrompt.systemPrompt
                .includes(
                  title,
                ),
          ),

      recommendationConclusionNatureRulesAreInSystemPrompt:
        recommendationPrompt.systemPrompt
          .includes(
            "결론 성격: 적합성·추천 설명 원칙",
          )
        && recommendationPrompt.systemPrompt
          .includes(
            "- 무엇이 왜 적합하거나 추천되는지 설명한다.",
          )
        && recommendationPrompt.systemPrompt
          .includes(
            "- 엔진 근거와 적합성 이유를 중심으로 설명한다.",
          )
        && recommendationPrompt.systemPrompt
          .includes(
            "- 엔진에 없는 새로운 추천 판단을 만들지 않는다.",
          )
        && recommendationPrompt.systemPrompt
          .includes(
            "- finalDecision, verdict, confidence, evidence, conditions, risks를 새로 판단하거나 변경하지 않는다.",
          ),

      recommendationSystemPromptExcludesOtherConclusionNatureRules:
        RECOMMENDATION_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES
          .every(
            (title) =>
              !recommendationPrompt.systemPrompt
                .includes(
                  title,
                ),
          ),

      warningConclusionNatureRulesAreInSystemPrompt:
        warningPrompt.systemPrompt
          .includes(
            "결론 성격: 위험·주의 설명 원칙",
          )
        && warningPrompt.systemPrompt
          .includes(
            "- 위험, 반복 패턴, 조건, 주의 요소 중심으로 설명한다.",
          )
        && warningPrompt.systemPrompt
          .includes(
            "- 엔진이 확정하지 않은 행동 계획을 새로 만들지 않는다.",
          )
        && warningPrompt.systemPrompt
          .includes(
            "- 경고를 실행 지시로 바꾸지 않는다.",
          )
        && warningPrompt.systemPrompt
          .includes(
            "- finalDecision, verdict, confidence, evidence, conditions, risks를 새로 판단하거나 변경하지 않는다.",
          ),

      warningSystemPromptExcludesOtherConclusionNatureRules:
        WARNING_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES
          .every(
            (title) =>
              !warningPrompt.systemPrompt
                .includes(
                  title,
                ),
          ),

      existenceConclusionNatureRulesAreInSystemPrompt:
        existencePrompt.systemPrompt
          .includes(
            "결론 성격: 존재 여부 설명 원칙",
          )
        && existencePrompt.systemPrompt
          .includes(
            "- 해당 구조나 신호가 존재하는 근거를 중심으로 설명한다.",
          )
        && existencePrompt.systemPrompt
          .includes(
            "- 존재 여부를 엔진 결과보다 강하게 단정하지 않는다.",
          )
        && existencePrompt.systemPrompt
          .includes(
            "- 존재 질문을 실행 조언이나 행동 계획으로 바꾸지 않는다.",
          )
        && existencePrompt.systemPrompt
          .includes(
            "- finalDecision, verdict, confidence, evidence, conditions, risks를 새로 판단하거나 변경하지 않는다.",
          ),

      existenceSystemPromptExcludesOtherConclusionNatureRules:
        EXISTENCE_OTHER_CONCLUSION_NATURE_SYSTEM_RULE_TITLES
          .every(
            (title) =>
              !existencePrompt.systemPrompt
                .includes(
                  title,
                ),
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
