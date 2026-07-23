import {
    assessDecisionReality,
  } from "../decisionRealityAssessment";
  import type {
    AssessmentLevel,
    LifeContextAssessment,
  } from "../lifeContextAssessment";
  import type {
    QuestionRealitySignal,
  } from "../../question/questionContext";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";

  type WealthRealityAssessmentFixture = {
    name: string;
    questionText: string;
    expectedSignals: readonly QuestionRealitySignal[];
    expectedAssessment: LifeContextAssessment;
    expectedQuestionRealityUsed: boolean;
    expectedHasHighLevel: boolean;
  };

  export type WealthRealityAssessmentCaseResult = {
    name: string;
    questionText: string;
    actualSignals: QuestionRealitySignal[];
    actualAssessment: LifeContextAssessment;
    checks: {
      topicIsMoney: boolean;
      expectedSignalsWereUsed: boolean;
      assessmentMatched: boolean;
      questionRealityUsageMatched: boolean;
      constraintsWerePreserved: boolean;
      evidenceWasPreserved: boolean;
      singleSignalDidNotCreateHigh: boolean;
      highLevelExpectationMatched: boolean;
    };
    passed: boolean;
  };

  export type WealthRealityAssessmentRegressionResult = {
    cases: WealthRealityAssessmentCaseResult[];
    passed: boolean;
  };

  const LOW_ASSESSMENT: LifeContextAssessment = {
    executionConstraint: "low",
    familyResponsibility: "low",
    financialPressure: "low",
    transitionDifficulty: "low",
    expansionRisk: "low",
  };

  const WEALTH_REALITY_ASSESSMENT_FIXTURES:
    readonly WealthRealityAssessmentFixture[] = [
      {
        name: "essential-funds-exposure-is-not-high-alone",
        questionText:
          "퇴직금 전부를 주식에 넣어도 될까요?",
        expectedSignals: [
          "essentialFundsExposure",
        ],
        expectedAssessment: {
          ...LOW_ASSESSMENT,
          financialPressure: "medium",
          expansionRisk: "medium",
        },
        expectedQuestionRealityUsed: true,
        expectedHasHighLevel: false,
      },
      {
        name: "liquidity-constraint-is-not-high-alone",
        questionText:
          "ETF는 중도 환매가 어렵고 자금이 묶이는데 투자해도 될까요?",
        expectedSignals: [
          "liquidityConstraint",
        ],
        expectedAssessment: {
          ...LOW_ASSESSMENT,
          executionConstraint: "medium",
        },
        expectedQuestionRealityUsed: true,
        expectedHasHighLevel: false,
      },
      {
        name: "asset-concentration-is-not-high-alone",
        questionText:
          "한 종목에 집중해서 투자해도 될까요?",
        expectedSignals: [
          "assetConcentration",
        ],
        expectedAssessment: {
          ...LOW_ASSESSMENT,
          expansionRisk: "medium",
        },
        expectedQuestionRealityUsed: true,
        expectedHasHighLevel: false,
      },
      {
        name: "essential-funds-and-concentration-can-create-high",
        questionText:
          "전 재산을 한 자산에 집중해서 투자해도 될까요?",
        expectedSignals: [
          "essentialFundsExposure",
          "assetConcentration",
        ],
        expectedAssessment: {
          ...LOW_ASSESSMENT,
          financialPressure: "medium",
          expansionRisk: "high",
        },
        expectedQuestionRealityUsed: true,
        expectedHasHighLevel: true,
      },
      {
        name: "combined-wealth-constraints-can-create-high",
        questionText:
          "퇴직금 전부를 한 자산에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다.",
        expectedSignals: [
          "essentialFundsExposure",
          "liquidityConstraint",
          "assetConcentration",
        ],
        expectedAssessment: {
          ...LOW_ASSESSMENT,
          executionConstraint: "medium",
          financialPressure: "high",
          expansionRisk: "high",
        },
        expectedQuestionRealityUsed: true,
        expectedHasHighLevel: true,
      },
      {
        name: "retirement-funds-management-without-exposure-stays-low",
        questionText:
          "퇴직금을 어떻게 운용하면 좋을까요?",
        expectedSignals: [],
        expectedAssessment: LOW_ASSESSMENT,
        expectedQuestionRealityUsed: false,
        expectedHasHighLevel: false,
      },
    ];

  function hasHighLevel(
    assessment: LifeContextAssessment,
  ): boolean {
    return Object.values(assessment).some(
      (level: AssessmentLevel) =>
        level === "high",
    );
  }

  function verifyWealthRealityAssessment(
    fixture: WealthRealityAssessmentFixture,
  ): WealthRealityAssessmentCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText: fixture.questionText,
        lifeContext: {
          maritalStatus: "single",
          hasChildren: false,
          occupationStatus: "unemployed",
          hasActiveBusiness: false,
          financialResponsibility: "low",
        },
      });

    const assessment =
      assessDecisionReality(
        input.lifeContext,
        input.questionContext.reality,
      );

    const actualSignals =
      assessment.questionConstraints.map(
        (constraint) => constraint.signal,
      );

    const actualAssessment: LifeContextAssessment = {
      executionConstraint:
        assessment.executionConstraint,
      familyResponsibility:
        assessment.familyResponsibility,
      financialPressure:
        assessment.financialPressure,
      transitionDifficulty:
        assessment.transitionDifficulty,
      expansionRisk:
        assessment.expansionRisk,
    };

    const actualHasHighLevel =
      hasHighLevel(actualAssessment);

    const checks = {
      topicIsMoney:
        input.question.topic === "money",

      expectedSignalsWereUsed:
        actualSignals.length
        === fixture.expectedSignals.length
        && fixture.expectedSignals.every(
          (signal) => actualSignals.includes(signal),
        ),

      assessmentMatched:
        JSON.stringify(actualAssessment)
        === JSON.stringify(
          fixture.expectedAssessment,
        ),

      questionRealityUsageMatched:
        assessment.questionRealityUsed
        === fixture.expectedQuestionRealityUsed,

      constraintsWerePreserved:
        assessment.questionConstraints.length
        === input.questionContext
          .reality
          .constraints
          .length,

      evidenceWasPreserved:
        assessment.questionConstraints.every(
          (constraint) =>
            constraint.evidence.length > 0
            && constraint.explicit,
        ),

      singleSignalDidNotCreateHigh:
        fixture.expectedSignals.length !== 1
        || !actualHasHighLevel,

      highLevelExpectationMatched:
        actualHasHighLevel
        === fixture.expectedHasHighLevel,
    };

    return {
      name: fixture.name,
      questionText: fixture.questionText,
      actualSignals,
      actualAssessment,
      checks,
      passed:
        Object.values(checks).every(Boolean),
    };
  }

  export function verifyWealthRealityAssessmentRegression():
    WealthRealityAssessmentRegressionResult {
    const cases =
      WEALTH_REALITY_ASSESSMENT_FIXTURES.map(
        verifyWealthRealityAssessment,
      );

    return {
      cases,
      passed:
        cases.every(
          (regressionCase) =>
            regressionCase.passed,
        ),
    };
  }
