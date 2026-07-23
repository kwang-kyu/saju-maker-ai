import {
    runDecisionEngine,
  } from "../decisionEngine";
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

  type WealthRealityDecisionFixture = {
    name: string;
    questionText: string;
    expectedSignals: readonly QuestionRealitySignal[];
    expectedHasHighReality: boolean;
  };

  export type WealthRealityDecisionCaseResult = {
    name: string;
    questionText: string;
    actualSignals: QuestionRealitySignal[];
    actualAssessment: LifeContextAssessment;
    contextAlignment: string;
    actionReadiness: string;
    verdict: string;
    checks: {
      topicIsMoney: boolean;
      expectedSignalsWereUsed: boolean;
      allRealityConstraintsStayExplicit: boolean;
      highRealityExpectationMatched: boolean;
      singleSignalDidNotCreateHigh: boolean;
      humanContextWasUsed: boolean;
      questionContextWasUsed: boolean;
      contextWasNotConflicted: boolean;
      realityDidNotForceStopOrDelay: boolean;
      highRealityRequiresConditions: boolean;
      realityDidNotForceNotRecommended: boolean;
    };
    passed: boolean;
  };

  export type WealthRealityDecisionIntegrationResult = {
    cases: WealthRealityDecisionCaseResult[];
    passed: boolean;
  };

  const WEALTH_REALITY_DECISION_FIXTURES:
    readonly WealthRealityDecisionFixture[] = [
      {
        name: "essential-funds-alone-does-not-force-stop",
        questionText:
          "퇴직금 전부를 주식에 넣어도 될까요?",
        expectedSignals: [
          "essentialFundsExposure",
        ],
        expectedHasHighReality: false,
      },
      {
        name: "liquidity-constraint-alone-does-not-force-stop",
        questionText:
          "ETF는 중도 환매가 어렵고 자금이 묶이는데 투자해도 될까요?",
        expectedSignals: [
          "liquidityConstraint",
        ],
        expectedHasHighReality: false,
      },
      {
        name: "asset-concentration-alone-does-not-force-stop",
        questionText:
          "한 종목에 집중해서 투자해도 될까요?",
        expectedSignals: [
          "assetConcentration",
        ],
        expectedHasHighReality: false,
      },
      {
        name: "combined-wealth-reality-requires-conditions",
        questionText:
          "퇴직금 전부를 한 자산에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 진행해도 될까요?",
        expectedSignals: [
          "essentialFundsExposure",
          "liquidityConstraint",
          "assetConcentration",
        ],
        expectedHasHighReality: true,
      },
      {
        name: "no-explicit-reality-does-not-create-constraint",
        questionText:
          "채권에 투자해도 될까요?",
        expectedSignals: [],
        expectedHasHighReality: false,
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

  function verifyWealthRealityDecision(
    fixture: WealthRealityDecisionFixture,
  ): WealthRealityDecisionCaseResult {
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

    const result =
      runDecisionEngine(input);

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

    const actualHasHighReality =
      hasHighLevel(actualAssessment);

    const checks = {
      topicIsMoney:
        input.question.topic === "money",

      expectedSignalsWereUsed:
        actualSignals.length
        === fixture.expectedSignals.length
        && fixture.expectedSignals.every(
          (signal) =>
            actualSignals.includes(signal),
        ),

      allRealityConstraintsStayExplicit:
        assessment.questionConstraints.every(
          (constraint) =>
            constraint.explicit
            && constraint.evidence.length > 0,
        ),

      highRealityExpectationMatched:
        actualHasHighReality
        === fixture.expectedHasHighReality,

      singleSignalDidNotCreateHigh:
        fixture.expectedSignals.length !== 1
        || !actualHasHighReality,

      humanContextWasUsed:
        result.humanContextUsed,

      questionContextWasUsed:
        result.questionContextUsed,

      contextWasNotConflicted:
        result.contextAlignment
        !== "conflicted"
        && result.contextAlignment
        !== "stronglyConflicted",

      realityDidNotForceStopOrDelay:
        result.actionReadiness
        !== "stopRequired"
        && result.actionReadiness
        !== "delayRequired",

      highRealityRequiresConditions:
        !fixture.expectedHasHighReality
        || result.actionReadiness
          === "readyWithConditions",

      realityDidNotForceNotRecommended:
        result.verdict !== "notRecommended",
    };

    return {
      name: fixture.name,
      questionText: fixture.questionText,
      actualSignals,
      actualAssessment,
      contextAlignment:
        result.contextAlignment,
      actionReadiness:
        result.actionReadiness,
      verdict:
        result.verdict,
      checks,
      passed:
        Object.values(checks).every(Boolean),
    };
  }

  export function verifyWealthRealityDecisionIntegration():
    WealthRealityDecisionIntegrationResult {
    const cases =
      WEALTH_REALITY_DECISION_FIXTURES.map(
        verifyWealthRealityDecision,
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