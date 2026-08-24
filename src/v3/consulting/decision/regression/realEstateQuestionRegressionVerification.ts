import type {
    DecisionTarget,
    QuestionIntent,
  } from "../../question/questionReader.js";
  import {
    selectReaderDecisionSources,
    type ReaderDecisionSource,
  } from "../readerDecisionSelectionBuilder.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";

  type RealEstateQuestionRegressionFixture = {
    name: string;

    questionText: string;

    expectedIntent:
      QuestionIntent;

    expectedDecisionTarget:
      DecisionTarget;
  };

  export type RealEstateQuestionRegressionCaseResult = {
    name: string;

    questionText: string;

    actualTopic: string;

    actualIntent: string;

    actualDecisionTarget: string;

    selectedReaderSources:
      ReaderDecisionSource[];

    checks: {
      topicIsRealEstate:
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

      careerReaderIsIncluded:
        boolean;

      destinyReaderIsIncluded:
        boolean;

      unrelatedReadersAreExcluded:
        boolean;
    };

    passed: boolean;
  };

  export type RealEstateQuestionRegressionVerificationResult = {
    cases:
      RealEstateQuestionRegressionCaseResult[];

    passed: boolean;
  };

  const REAL_ESTATE_QUESTION_FIXTURES:
    RealEstateQuestionRegressionFixture[] = [
      {
        name:
          "apartment-purchase-possibility",

        questionText:
          "아파트를 매수하는 게 가능할까요?",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "owned-building-sale",

        questionText:
          "보유 중인 건물을 매도해야 하나요?",

        expectedIntent:
          "termination",

        expectedDecisionTarget:
          "sell",
      },
      {
        name:
          "current-property-continuation",

        questionText:
          "현재 부동산을 계속 보유하는 게 좋을까요?",

        expectedIntent:
          "continuation",

        expectedDecisionTarget:
          "continue",
      },
      {
        name:
          "investment-property-selection",

        questionText:
          "아파트와 상가 중 어느 것을 선택해야 할까요?",

        expectedIntent:
          "selection",

        expectedDecisionTarget:
          "choose",
      },
      {
        name:
          "commercial-property-purchase-with-debt",

        questionText:
          "대출 부담이 있는데 상가를 매수해도 될까요?",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",
      },
      {
        name:
          "residential-move",

        questionText:
          "현재 아파트에서 다른 지역으로 이사해도 될까요?",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "move",
      },
    ];

  function verifyRealEstateQuestion(
    fixture:
      RealEstateQuestionRegressionFixture,
  ): RealEstateQuestionRegressionCaseResult {
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
      topicIsRealEstate:
        input.question.topic
        === "realEstate",

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

      careerReaderIsIncluded:
        selectedReaderSources.includes(
          "career",
        ),

      destinyReaderIsIncluded:
        selectedReaderSources.includes(
          "destiny",
        ),

      unrelatedReadersAreExcluded:
        !selectedReaderSources.includes(
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

  export function verifyRealEstateQuestionRegression():
    RealEstateQuestionRegressionVerificationResult {
    const cases =
      REAL_ESTATE_QUESTION_FIXTURES.map(
        verifyRealEstateQuestion,
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