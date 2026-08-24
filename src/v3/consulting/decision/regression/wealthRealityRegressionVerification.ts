import type {
    QuestionRealitySignal,
  } from "../../question/questionContext.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";

  type WealthRealityRegressionFixture = {
    name: string;
    questionText: string;
    expectedTopic: "money" | "realEstate";
    expectedSignals: readonly QuestionRealitySignal[];
    expectedEvidence: readonly string[];
    expectedHasExplicitConstraints: boolean;
  };

  export type WealthRealityRegressionCaseResult = {
    name: string;
    questionText: string;
    actualTopic: string;
    actualDecisionTarget: string;
    actualSignals: QuestionRealitySignal[];
    actualEvidence: string[];
    checks: {
      expectedTopicMatched: boolean;
      humanContextWasReadFirst: boolean;
      questionContextWasBuilt: boolean;
      realityAssessmentIsRequired: boolean;
      expectedSignalsWereExtracted: boolean;
      unexpectedSignalsWereExcluded: boolean;
      explicitConstraintFlagMatched: boolean;
      allConstraintsStayExplicit: boolean;
      expectedEvidenceWasPreserved: boolean;
      unexpectedEvidenceWasExcluded: boolean;
      evidenceExistsInQuestion: boolean;
    };
    passed: boolean;
  };

  export type WealthRealityRegressionVerificationResult = {
    cases: WealthRealityRegressionCaseResult[];
    passed: boolean;
  };

  const WEALTH_REALITY_FIXTURES:
    readonly WealthRealityRegressionFixture[] = [
      {
        name: "debt-burden-stock-investment",
        questionText:
          "대출 부담이 있는데 주식에 투자해도 될까요?",
        expectedTopic: "money",
        expectedSignals: [
          "debtBurden",
        ],
        expectedEvidence: [
          "대출",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "living-cost-pressure-etf-investment",
        questionText:
          "생활비 부담이 있는데 ETF에 투자해도 될까요?",
        expectedTopic: "money",
        expectedSignals: [
          "livingCostPressure",
        ],
        expectedEvidence: [
          "생활비",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "income-instability-commercial-property",
        questionText:
          "수입이 불안정한데 상가를 매수해도 될까요?",
        expectedTopic: "realEstate",
        expectedSignals: [
          "incomeInstability",
        ],
        expectedEvidence: [
          "수입이 불안",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "property-tax-and-maintenance-cost-pressure",
        questionText:
          "보유세 부담과 관리비 부담이 있는 건물을 계속 보유해도 될까요?",
        expectedTopic: "realEstate",
        expectedSignals: [
          "fixedCostPressure",
        ],
        expectedEvidence: [
          "보유세 부담",
          "관리비 부담",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "principal-loss-concern-crypto-asset",
        questionText:
          "가상자산의 원금 손실이 걱정되는데 계속 보유해도 될까요?",
        expectedTopic: "money",
        expectedSignals: [
          "lossConcern",
        ],
        expectedEvidence: [
          "손실",
          "원금 손실",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "retirement-funds-full-investment",
        questionText:
          "퇴직금 전부를 주식에 넣어도 될까요?",
        expectedTopic: "money",
        expectedSignals: [
          "essentialFundsExposure",
        ],
        expectedEvidence: [
          "퇴직금 전부",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "fund-redemption-and-liquidity-constraint",
        questionText:
          "ETF는 중도 환매가 어렵고 자금이 묶이는데 투자해도 될까요?",
        expectedTopic: "money",
        expectedSignals: [
          "liquidityConstraint",
        ],
        expectedEvidence: [
          "자금이 묶",
          "중도 환매가 어렵",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "single-stock-concentration",
        questionText:
          "한 종목에 집중해서 투자해도 될까요?",
        expectedTopic: "money",
        expectedSignals: [
          "assetConcentration",
        ],
        expectedEvidence: [
          "한 종목에 집중",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "essential-funds-and-asset-concentration",
        questionText:
          "전 재산을 한 자산에 집중해서 투자해도 될까요?",
        expectedTopic: "money",
        expectedSignals: [
          "essentialFundsExposure",
          "assetConcentration",
        ],
        expectedEvidence: [
          "전 재산",
          "한 자산에 집중",
        ],
        expectedHasExplicitConstraints: true,
      },
      {
        name: "bond-investment-without-explicit-constraint",
        questionText:
          "채권에 투자해도 될까요?",
        expectedTopic: "money",
        expectedSignals: [],
        expectedEvidence: [],
        expectedHasExplicitConstraints: false,
      },
      {
        name: "retirement-funds-management-without-exposure",
        questionText:
          "퇴직금을 어떻게 운용하면 좋을까요?",
        expectedTopic: "money",
        expectedSignals: [],
        expectedEvidence: [],
        expectedHasExplicitConstraints: false,
      },
    ];

  function hasSameValues(
    actual: readonly string[],
    expected: readonly string[],
  ): boolean {
    return actual.length === expected.length
      && actual.every(
        (value) => expected.includes(value),
      );
  }

  function verifyWealthReality(
    fixture: WealthRealityRegressionFixture,
  ): WealthRealityRegressionCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText: fixture.questionText,
      });

    const constraints =
      input.questionContext.reality.constraints;

    const actualSignals =
      constraints.map(
        (constraint) => constraint.signal,
      );

    const actualEvidence = [
      ...new Set(
        constraints.flatMap(
          (constraint) => constraint.evidence,
        ),
      ),
    ];

    const checks = {
      expectedTopicMatched:
        input.question.topic
        === fixture.expectedTopic,

      humanContextWasReadFirst:
        input.question.humanContextReceived,

      questionContextWasBuilt:
        input.questionContext.question
        === input.question,

      realityAssessmentIsRequired:
        input.questionContext
          .requirements
          .realityAssessmentRequired,

      expectedSignalsWereExtracted:
        fixture.expectedSignals.every(
          (signal) => actualSignals.includes(signal),
        ),

      unexpectedSignalsWereExcluded:
        hasSameValues(
          actualSignals,
          fixture.expectedSignals,
        ),

      explicitConstraintFlagMatched:
        input.questionContext
          .reality
          .hasExplicitConstraints
        === fixture.expectedHasExplicitConstraints,

      allConstraintsStayExplicit:
        constraints.every(
          (constraint) => constraint.explicit,
        ),

      expectedEvidenceWasPreserved:
        fixture.expectedEvidence.every(
          (evidence) => actualEvidence.includes(evidence),
        ),

      unexpectedEvidenceWasExcluded:
        hasSameValues(
          actualEvidence,
          fixture.expectedEvidence,
        ),

      evidenceExistsInQuestion:
        actualEvidence.every(
          (evidence) =>
            input.question.normalizedQuestion
              .includes(evidence),
        ),
    };

    return {
      name: fixture.name,
      questionText: fixture.questionText,
      actualTopic: input.question.topic,
      actualDecisionTarget:
        input.question.decisionTarget,
      actualSignals,
      actualEvidence,
      checks,
      passed:
        Object.values(checks).every(Boolean),
    };
  }

  export function verifyWealthRealityRegression():
    WealthRealityRegressionVerificationResult {
    const cases =
      WEALTH_REALITY_FIXTURES.map(
        verifyWealthReality,
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