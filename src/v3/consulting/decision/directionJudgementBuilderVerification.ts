import {
    buildDirectionJudgement,
  } from "./directionJudgementBuilder.js";

  import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture.js";

  import {
    buildVerdictContext,
  } from "./verdictContextBuilder.js";

  import {
    assessDecisionReality,
  } from "./decisionRealityAssessment.js";

  import {
    analyzeContextAlignment,
  } from "./contextAlignment.js";

  import {
    resolveActionReadiness,
    resolveConfidence,
  } from "./decisionResolver.js";

  import {
    assessTiming,
  } from "./timingAssessment.js";

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
   * 1. prediction 질문은 "진행한다 / 실행한다 / 유보한다" 중심의
   *    실행 Direction으로 떨어지지 않아야 한다.
   *
   * 2. prediction + manageMoney, none, start 모두
   *    예측 전용 Direction을 사용한다.
   *
   * 3. 예측 Direction은 가능성·흐름·조건·불확실성 중심이어야 한다.
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

      executionPredictionUsesPredictionDirection:
        executionPrediction
          .recommendedDirection
          .includes(
            "가능성",
          )
        || executionPrediction
          .recommendedDirection
          .includes(
            "흐름",
          )
        || executionPrediction
          .recommendedDirection
          .includes(
            "조건",
          ),

      executionPredictionAvoidsExecutionDirection:
        !executionPrediction
          .recommendedDirection
          .includes(
            "제한적으로 진행",
          )
        && !executionPrediction
          .recommendedDirection
          .includes(
            "바로 실행",
          )
        && !executionPrediction
          .recommendedDirection
          .includes(
            "판단을 유보",
          ),

      executionPredictionAvoidsExecutionProhibition:
        !executionPrediction
          .prohibitedDirection
          .includes(
            "바로 실행",
          )
        && !executionPrediction
          .prohibitedDirection
          .includes(
            "확정적인 결정",
          ),

      allPredictionDirectionsAvoidExecutionLanguage:
        [
          nonExecutionPrediction,
          genericPrediction,
          executionPrediction,
        ].every(
          (direction) =>
            !direction
              .recommendedDirection
              .includes(
                "진행한다",
              )
            && !direction
              .recommendedDirection
              .includes(
                "유보한다",
              )
            && !direction
              .recommendedDirection
              .includes(
                "중단한다",
              ),
        ),
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
