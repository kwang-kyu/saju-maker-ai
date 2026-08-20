import {
    buildDirectionJudgement,
  } from "./directionJudgementBuilder";

  import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";

  import {
    buildVerdictContext,
  } from "./verdictContextBuilder";

  import {
    assessDecisionReality,
  } from "./decisionRealityAssessment";

  import {
    analyzeContextAlignment,
  } from "./contextAlignment";

  import {
    resolveActionReadiness,
    resolveConfidence,
  } from "./decisionResolver";

  import {
    assessTiming,
  } from "./timingAssessment";

  export type DirectionJudgementBuilderVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    actual: {
      nonExecutionPrediction:
        ReturnType<
          typeof buildDirectionJudgement
        >;

      genericPrediction:
        ReturnType<
          typeof buildDirectionJudgement
        >;

      executionPrediction:
        ReturnType<
          typeof buildDirectionJudgement
        >;
    };

    passed:
      boolean;
  };

  /**
   * Direction Judgement Builder 전용 회귀 검증
   *
   * 목적:
   *
   * 1. prediction + manageMoney 같은 비실행형 예측 질문은
   *    "진행한다 / 실행한다 / 유보한다" 중심의 실행 Direction으로
   *    떨어지지 않아야 한다.
   *
   * 2. prediction + none 역시 비실행형 예측 Direction을 사용한다.
   *
   * 3. prediction + start 같은 실제 행동 질문은
   *    기존 실행 Direction을 유지해야 한다.
   *
   * 4. 비실행형 예측과 실행형 예측의 Direction이
   *    서로 동일한 정형 문장으로 붕괴하지 않아야 한다.
   */
  export function verifyDirectionJudgementBuilder():
    DirectionJudgementBuilderVerificationResult {
    const regressionInput =
      buildDecisionEngineRegressionInput();

      const alignmentResult =
      analyzeContextAlignment(
        regressionInput.humanContext,
        regressionInput.question,
      );

    const confidence =
      resolveConfidence(
        regressionInput.question.confidence,
        alignmentResult.alignment,
      );

    const lifeAssessment =
      assessDecisionReality(
        regressionInput.lifeContext,
        regressionInput.questionContext.reality,
      );

    const actionReadiness =
      resolveActionReadiness(
        alignmentResult.alignment,
        regressionInput.question.urgency,
        lifeAssessment,
      );

    const timingAssessment =
      assessTiming({
        questionContext:
          regressionInput.questionContext,

        humanContext:
          regressionInput.humanContext,

        selfSajuFacts:
          regressionInput.selfSajuFacts
          ?? null,

        lifeFlowTarget:
          regressionInput.lifeFlowTarget,

        targetPeriodLuckFlow:
          regressionInput.targetPeriodLuckFlow,
      });

    const verdictContext =
      buildVerdictContext({
        decisionInput:
          regressionInput,

        alignment:
          alignmentResult.alignment,

        readiness:
          actionReadiness,

        confidence,

        lifeAssessment,

        timingAssessment,
      });

    const nonExecutionPrediction =
      buildDirectionJudgement({
        verdict:
          "conditionallyRecommended",

        context:
          verdictContext,

        intent:
          "prediction",

        decisionTarget:
          "manageMoney",
      });

    const genericPrediction =
      buildDirectionJudgement({
        verdict:
          "wait",

        context:
          verdictContext,

        intent:
          "prediction",

        decisionTarget:
          "none",
      });

    const executionPrediction =
      buildDirectionJudgement({
        verdict:
          "conditionallyRecommended",

        context:
          verdictContext,

        intent:
          "prediction",

        decisionTarget:
          "start",
      });

    const checks = {
      manageMoneyPredictionUsesNonExecutionDirection:
        nonExecutionPrediction
          .recommendedDirection
          .includes(
            "가능성",
          )
        || nonExecutionPrediction
          .recommendedDirection
          .includes(
            "조건과 변수",
          ),

      manageMoneyPredictionAvoidsExecutionDirection:
        !nonExecutionPrediction
          .recommendedDirection
          .includes(
            "제한적으로 진행",
          )
        && !nonExecutionPrediction
          .recommendedDirection
          .includes(
            "바로 실행",
          ),

      manageMoneyPredictionAvoidsExecutionProhibition:
        !nonExecutionPrediction
          .prohibitedDirection
          .includes(
            "바로 실행",
          ),

      genericPredictionUsesNonExecutionDirection:
        genericPrediction
          .recommendedDirection
          .includes(
            "시기 지연",
          )
        || genericPrediction
          .recommendedDirection
          .includes(
            "흐름",
          ),

      executionPredictionKeepsExecutionDirection:
        executionPrediction
          .recommendedDirection
          .includes(
            "진행",
          )
        || executionPrediction
          .recommendedDirection
          .includes(
            "실행",
          ),

      executionPredictionKeepsExecutionProhibition:
        executionPrediction
          .prohibitedDirection
          .includes(
            "실행",
          )
        || executionPrediction
          .prohibitedDirection
          .includes(
            "조건",
          ),

      predictionDirectionsAreSeparated:
        nonExecutionPrediction
          .recommendedDirection
        !== executionPrediction
          .recommendedDirection,

      predictionProhibitionsAreSeparated:
        nonExecutionPrediction
          .prohibitedDirection
        !== executionPrediction
          .prohibitedDirection,
    };

    return {
      checks,

      actual: {
        nonExecutionPrediction,

        genericPrediction,

        executionPrediction,
      },

      passed:
        Object.values(
          checks,
        ).every(
          Boolean,
        ),
    };
  }
