import type {
    DecisionTarget,
    QuestionIntentOrLegacy,
  } from "../../question/questionReader.js";
  import {
    selectReaderDecisionSources,
    type ReaderDecisionSource,
  } from "../readerDecisionSelectionBuilder.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";

  type MoneyQuestionRegressionFixture = {
    name: string;

    questionText: string;

    expectedIntent:
      QuestionIntentOrLegacy;

    expectedDecisionTarget:
      DecisionTarget;
  };

  export type MoneyQuestionRegressionCaseResult = {
    name: string;

    questionText: string;

    actualTopic: string;

    actualIntent: string;

    actualDecisionTarget: string;

    selectedReaderSources:
      ReaderDecisionSource[];

    checks: {
      topicIsMoney:
        boolean;

      intentMatched:
        boolean;

      decisionTargetMatched:
        boolean;

      humanContextWasReadFirst:
        boolean;

      questionContextWasBuilt:
        boolean;

      moneyReaderIsPrimary:
        boolean;

      capacityReaderIsIncluded:
        boolean;

      destinyReaderIsIncluded:
        boolean;

      unrelatedReadersAreExcluded:
        boolean;
    };

    passed: boolean;
  };

  export type MoneyQuestionRegressionVerificationResult = {
    cases:
      MoneyQuestionRegressionCaseResult[];

    passed: boolean;
  };

  const MONEY_QUESTION_FIXTURES:
    MoneyQuestionRegressionFixture[] = [
      {
        name:
          "natural-investment-prediction",

        questionText:
          "여유자금을 투자하면 수익이 생길까요?",

        expectedIntent:
          "prediction",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "investment-possibility-with-debt",

        questionText:
          "대출이 있는데 투자를 시작하는 게 맞을까요?",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "investment-method-with-living-cost-pressure",

        questionText:
          "생활비 부담이 있는데 자금을 투자하는 방법이 궁금해요.",

        expectedIntent:
          "method",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "investment-continuation-with-loss-concern",

        questionText:
          "현금 손실이 걱정되는데 투자를 계속해도 될까요?",

        expectedIntent:
          "continuation",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "stock-investment-possibility",

        questionText:
          "주식에 투자해도 될까요?",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "etf-and-fund-comparison",

        questionText:
          "ETF와 펀드를 비교해서 둘 중 하나를 선택해야 할까요?",

        expectedIntent:
          "comparison",

        expectedDecisionTarget:
          "choose",
      },
      {
        name:
          "bond-investment-continuation",

        questionText:
          "채권 투자를 계속 유지해도 될까요?",

        expectedIntent:
          "continuation",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "crypto-investment-risk",

        questionText:
          "가상자산 투자는 손실 위험이 클까요?",

        expectedIntent:
          "risk",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "deposit-and-savings-comparison",

        questionText:
          "예금과 적금을 비교해서 둘 중 하나를 선택해야 할까요?",

        expectedIntent:
          "comparison",

        expectedDecisionTarget:
          "choose",
      },
      {
        name:
          "retirement-money-management-method",

        questionText:
          "퇴직금을 어떻게 운용해야 할까요?",

        expectedIntent:
          "method",

        expectedDecisionTarget:
          "manageMoney",
      },
    ];

  function verifyMoneyQuestion(
    fixture:
      MoneyQuestionRegressionFixture,
  ): MoneyQuestionRegressionCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          fixture.questionText,
      });

    const selectedReaderSources =
      selectReaderDecisionSources(
        input.question.topic,
      );

    const checks = {
      topicIsMoney:
        input.question.topic
        === "money",

      intentMatched:
        input.question.intent
        === fixture.expectedIntent,

      decisionTargetMatched:
        input.question.decisionTarget
        === fixture.expectedDecisionTarget,

      humanContextWasReadFirst:
        input.question
          .humanContextReceived,

      questionContextWasBuilt:
        input.questionContext.question
        === input.question,

      moneyReaderIsPrimary:
        selectedReaderSources[0]
        === "money",

      capacityReaderIsIncluded:
        selectedReaderSources.includes(
          "capacity",
        ),

      destinyReaderIsIncluded:
        selectedReaderSources.includes(
          "destiny",
        ),

      unrelatedReadersAreExcluded:
        !selectedReaderSources.includes(
          "career",
        )
        && !selectedReaderSources.includes(
          "relationship",
        )
        && !selectedReaderSources.includes(
          "health",
        )
        && !selectedReaderSources.includes(
          "blessing",
        ),
    };

    return {
      name:
        fixture.name,

      questionText:
        fixture.questionText,

      actualTopic:
        input.question.topic,

      actualIntent:
        input.question.intent,

      actualDecisionTarget:
        input.question.decisionTarget,

      selectedReaderSources,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  export function verifyMoneyQuestionRegression():
    MoneyQuestionRegressionVerificationResult {
    const cases =
      MONEY_QUESTION_FIXTURES.map(
        verifyMoneyQuestion,
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
