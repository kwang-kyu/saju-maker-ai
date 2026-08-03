import {
    runDecisionEngine,
  } from "./decisionEngine";
  import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";
  import type {
    DecisionEngineInput,
    DecisionResult,
  } from "./decisionTypes";

  export type CompatibilityVerdictIntegrationVerificationResult = {
    actualResult:
      DecisionResult;

    checks: {
      verdictIsInsufficientEvidence:
        boolean;

      counterpartBirthDataConditionIncluded:
        boolean;

      humanContextUsed:
        boolean;

      questionContextUsed:
        boolean;
    };

    passed:
      boolean;
  };

  function buildMissingCounterpartBirthDataInput():
    DecisionEngineInput {
    const input =
      buildDecisionEngineRegressionInput();

    return {
      ...input,

      question: {
        ...input.question,

        topic:
          "business",

        decisionTarget:
          "partner",
      },

      questionContext: {
        ...input.questionContext,

        counterpart: {
          exists:
            true,

          relation:
            "businessPartner",

          identityProvided:
            false,

          birthDataProvided:
            false,

          zodiacProvided:
            false,
        },

        actionObject: {
          ...input.questionContext
            .actionObject,

          type:
            "business",
        },

        requirements: {
          ...input.questionContext
            .requirements,

          counterpartReadingRequired:
            true,

          compatibilityAnalysisRequired:
            true,
        },
      },
    };
  }

  export function verifyCompatibilityVerdictIntegration():
    CompatibilityVerdictIntegrationVerificationResult {
    const actualResult =
      runDecisionEngine(
        buildMissingCounterpartBirthDataInput(),
      );

    const checks = {
      verdictIsInsufficientEvidence:
        actualResult.verdict
        === "insufficientEvidence",

      counterpartBirthDataConditionIncluded:
        actualResult.conditions.some(
          (condition) =>
            condition.key
            === "provideCounterpartBirthData"
            && condition.required
            && !condition.satisfied,
        ),

      humanContextUsed:
        actualResult
          .humanContextUsed,

      questionContextUsed:
        actualResult
          .questionContextUsed,
    };

    return {
      actualResult,

      checks,

      passed:
        Object.values(
          checks,
        ).every(Boolean),
    };
  }
