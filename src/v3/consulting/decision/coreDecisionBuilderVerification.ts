import {
    buildCoreDecision,
  } from "./coreDecisionBuilder.js";

  export type CoreDecisionBuilderVerificationResult = {
    checks: {
      predictionStartUsesStartSpecificAnswer:
        boolean;

      predictionPartnerUsesPartnerSpecificAnswer:
        boolean;

      predictionGenericUsesGenericPredictionAnswer:
        boolean;

      possibilityUsesPossibilityAnswer:
        boolean;

      timingUsesTimingAnswer:
        boolean;

      selectionUsesSelectionAnswer:
        boolean;

      generalJudgementUsesActionAnswer:
        boolean;

      legacyTwoArgumentCallIsPreserved:
        boolean;

      emptyOriginalQuestionThrows:
        boolean;

      differentIntentsProduceDifferentAnswers:
        boolean;

      differentPredictionTargetsProduceDifferentAnswers:
        boolean;
    };

    actual: {
      predictionStart:
        string;

      predictionPartner:
        string;

      predictionGeneric:
        string;

      possibility:
        string;

      timing:
        string;

      selection:
        string;

      generalJudgement:
        string;

      legacy:
        string;
    };

    passed:
      boolean;
  };

  export function verifyCoreDecisionBuilder():
    CoreDecisionBuilderVerificationResult {
    const predictionStart =
      buildCoreDecision(
        "conditionallyRecommended",
        "지금 시작할 것인가",
        {
          originalQuestion:
            "지금 통닭집을 시작하면 성공할까요?",

          intent:
            "prediction",

          decisionTarget:
            "start",
        },
      );

    const predictionPartner =
      buildCoreDecision(
        "conditionallyRecommended",
        "다른 사람과 함께할 것인가",
        {
          originalQuestion:
            "이 사람과 같이 사업하면 잘될까요?",

          intent:
            "prediction",

          decisionTarget:
            "partner",
        },
      );

    const predictionGeneric =
      buildCoreDecision(
        "conditionallyRecommended",
        "현재의 돈과 자금 문제를 어떻게 관리할 것인가",
        {
          originalQuestion:
            "이번 달에 약속한 돈이 들어올까요?",

          intent:
            "prediction",

          decisionTarget:
            "manageMoney",
        },
      );

    const possibility =
      buildCoreDecision(
        "recommended",
        "현재의 돈과 자금 문제를 어떻게 관리할 것인가",
        {
          originalQuestion:
            "이번에 대여금을 받을 가능성이 있을까요?",

          intent:
            "possibility",

          decisionTarget:
            "manageMoney",
        },
      );

    const timing =
      buildCoreDecision(
        "wait",
        "지금 시작할 것인가",
        {
          originalQuestion:
            "지금 사업을 시작할 시기인가요?",

          intent:
            "timing",

          decisionTarget:
            "start",
        },
      );

    const selection =
      buildCoreDecision(
        "recommended",
        "여러 선택지 중 무엇을 선택할 것인가",
        {
          originalQuestion:
            "두 가지 사업 중 어느 쪽을 선택하는 게 좋을까요?",

          intent:
            "selection",

          decisionTarget:
            "choose",
        },
      );

    const generalJudgement =
      buildCoreDecision(
        "notRecommended",
        "자금이나 자산을 투입할 것인가",
        {
          originalQuestion:
            "지금 이 투자에 들어가도 될까요?",

          intent:
            "generalJudgement",

          decisionTarget:
            "invest",
        },
      );

    const legacy =
      buildCoreDecision(
        "conditionallyRecommended",
        "지금 시작할 것인가",
      );

    let emptyOriginalQuestionThrows =
      false;

    try {
      buildCoreDecision(
        "recommended",
        "지금 시작할 것인가",
        {
          originalQuestion:
            "   ",

          intent:
            "prediction",

          decisionTarget:
            "start",
        },
      );
    } catch {
      emptyOriginalQuestionThrows =
        true;
    }

    const checks = {
      predictionStartUsesStartSpecificAnswer:
        predictionStart
        ===
        "질문한 결과로 이어질 여지는 있으나, 조건과 변수에 따라 흐름의 방향과 성사 시점이 달라질 수 있다.",

      predictionPartnerUsesPartnerSpecificAnswer:
        predictionPartner
        ===
        "이 사람과의 관계에서 질문한 결과로 이어질 여지는 있으나, 확인해야 할 조건과 변수에 따라 전개 방향이 달라질 수 있다.",

      predictionGenericUsesGenericPredictionAnswer:
        predictionGeneric
        ===
        "질문한 결과로 이어질 여지는 있지만, 조건과 변수에 따라 흐름의 방향과 성사 시점이 달라질 수 있다.",

      possibilityUsesPossibilityAnswer:
        possibility
        ===
        "가능성이 열려 있는 쪽으로 판단한다.",

      timingUsesTimingAnswer:
        timing
        ===
        "현재는 바로 움직이는 시기보다 조금 더 흐름을 지켜보는 쪽이 맞다.",

      selectionUsesSelectionAnswer:
        selection
        ===
        "현재 판단에서는 질문한 선택을 받아들이는 쪽에 무게가 실린다.",

      generalJudgementUsesActionAnswer:
        generalJudgement
        ===
        "현재 조건에서는 진행하지 않는 쪽이 맞다.",

      legacyTwoArgumentCallIsPreserved:
        legacy
        ===
        "지금 시작할 것인가: 조건을 갖춘 뒤 진행하는 것이 맞다.",

      emptyOriginalQuestionThrows,

      differentIntentsProduceDifferentAnswers:
        possibility
        !== timing
        && timing
        !== selection
        && selection
        !== generalJudgement,

      differentPredictionTargetsProduceDifferentAnswers:
        predictionStart
        !== predictionPartner
        && predictionPartner
        !== predictionGeneric
        && predictionStart
        !== predictionGeneric,
    };

    return {
      checks,

      actual: {
        predictionStart,
        predictionPartner,
        predictionGeneric,
        possibility,
        timing,
        selection,
        generalJudgement,
        legacy,
      },

      passed:
        Object.values(
          checks,
        ).every(
          Boolean,
        ),
    };
  }
