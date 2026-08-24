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

  type JobQuestionRegressionFixture = {
    name: string;

    questionText: string;

    expectedIntent:
      QuestionIntent;

    expectedDecisionTarget:
      DecisionTarget;
  };

  export type JobQuestionRegressionCaseResult = {
    name: string;

    questionText: string;

    actualTopic: string;

    actualIntent: string;

    actualDecisionTarget: string;

    selectedReaderSources:
      ReaderDecisionSource[];

    checks: {
      topicIsJob: boolean;

      intentMatched: boolean;

      decisionTargetMatched:
        boolean;

      humanContextWasReadFirst:
        boolean;

      questionContextWasBuilt:
        boolean;

      careerReaderIsPrimary:
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

  export type JobQuestionRegressionVerificationResult = {
    cases:
      JobQuestionRegressionCaseResult[];

    passed: boolean;
  };

  const JOB_QUESTION_FIXTURES:
    JobQuestionRegressionFixture[] = [
      {
        name:
          "natural-job-change-possibility",

        questionText:
          "다른 회사로 이직하는 게 가능할까요?",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "changeJob",
      },
      {
        name:
          "immediate-job-resignation",

        questionText:
          "지금 퇴사해야 하나요?",

        expectedIntent:
          "termination",

        expectedDecisionTarget:
          "leaveJob",
      },
      {
        name:
          "current-job-continuation",

        questionText:
          "현재 직장을 계속 유지하는 게 좋을까요?",

        expectedIntent:
          "continuation",

        expectedDecisionTarget:
          "continue",
      },
      {
        name:
          "career-direction-selection",

        questionText:
          "앞으로 어떤 직업 방향을 선택해야 할까요?",

        expectedIntent:
          "selection",

        expectedDecisionTarget:
          "choose",
      },
      {
        name:
          "current-job-and-new-work-parallel",

        questionText:
          "현 직장을 유지하면서 새로운 일을 병행해도 될까요?",

        expectedIntent:
          "continuation",

        expectedDecisionTarget:
          "continue",
      },
      {
        name:
          "job-change-with-income-instability",

        questionText:
          "요즘 수입이 불안정한데 다른 회사로 이직하는 게 가능할까요?",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "changeJob",
      },
    ];

  function verifyJobQuestion(
    fixture:
      JobQuestionRegressionFixture,
  ): JobQuestionRegressionCaseResult {
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
      topicIsJob:
        input.question.topic
        === "job",

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

      careerReaderIsPrimary:
        selectedReaderSources[0]
        === "career",

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
          "money",
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

  export function verifyJobQuestionRegression():
    JobQuestionRegressionVerificationResult {
    const cases =
      JOB_QUESTION_FIXTURES.map(
        verifyJobQuestion,
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