import type {
    QuestionIntent,
  } from "../../question/questionReader";
  import {
    selectReaderDecisionSources,
    type ReaderDecisionSource,
  } from "../readerDecisionSelectionBuilder";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";

  type MoneyQuestionRegressionFixture = {
    name: string;

    questionText: string;

    expectedIntent:
      QuestionIntent;
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
      topicIsMoney: boolean;

      intentMatched: boolean;

      decisionTargetIsInvest: boolean;

      humanContextWasReadFirst: boolean;

      questionContextWasBuilt: boolean;

      moneyReaderIsPrimary: boolean;

      capacityReaderIsIncluded: boolean;

      destinyReaderIsIncluded: boolean;

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
          "여유자금을 투자해도 될까요?",

        expectedIntent:
          "prediction",
      },
      {
        name:
          "investment-possibility-with-debt",

        questionText:
          "대출이 있는데 투자를 시작하는 게 맞을까요?",

        expectedIntent:
          "possibility",
      },
      {
        name:
          "investment-method-with-living-cost-pressure",

        questionText:
          "생활비 부담이 있는데 자금을 투자하는 방법이 궁금해요.",

        expectedIntent:
          "method",
      },
      {
        name:
          "investment-continuation-with-loss-concern",

        questionText:
          "현금 손실이 걱정되는데 투자를 계속해도 될까요?",

        expectedIntent:
          "continuation",
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

      decisionTargetIsInvest:
        input.question.decisionTarget
        === "invest",

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