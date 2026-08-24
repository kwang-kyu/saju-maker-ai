import type {
    QuestionRealitySignal,
  } from "../../question/questionContext.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";

  type JobRealityRegressionFixture = {
    name: string;

    questionText: string;

    expectedSignals:
      readonly QuestionRealitySignal[];

    expectedHasExplicitConstraints:
      boolean;
  };

  export type JobRealityRegressionCaseResult = {
    name: string;

    questionText: string;

    actualTopic: string;

    actualDecisionTarget: string;

    actualSignals:
      QuestionRealitySignal[];

    actualEvidence: string[];

    checks: {
      topicIsJob: boolean;

      humanContextWasReadFirst:
        boolean;

      questionContextWasBuilt:
        boolean;

      realityAssessmentIsRequired:
        boolean;

      expectedSignalsWereExtracted:
        boolean;

      unexpectedSignalsWereExcluded:
        boolean;

      explicitConstraintFlagMatched:
        boolean;

      allConstraintsStayExplicit:
        boolean;

      matchedEvidenceWasPreserved:
        boolean;

      transitionDifficultyUsesWorkArea:
        boolean;
    };

    passed: boolean;
  };

  export type JobRealityRegressionVerificationResult = {
    cases:
      JobRealityRegressionCaseResult[];

    passed: boolean;
  };

  const JOB_REALITY_FIXTURES:
    readonly JobRealityRegressionFixture[] = [
      {
        name:
          "current-work-responsibility",

        questionText:
          "현재 직장을 유지하면서 이직을 준비해도 될까요?",

        expectedSignals: [
          "currentWorkResponsibility",
        ],

        expectedHasExplicitConstraints:
          true,
      },
      {
        name:
          "income-instability",

        questionText:
          "요즘 수입이 불안정한데 다른 회사로 이직해도 될까요?",

        expectedSignals: [
          "incomeInstability",
        ],

        expectedHasExplicitConstraints:
          true,
      },
      {
        name:
          "family-responsibility",

        questionText:
          "가족 부양 책임이 있는데 지금 퇴사해도 될까요?",

        expectedSignals: [
          "familyResponsibility",
        ],

        expectedHasExplicitConstraints:
          true,
      },
      {
        name:
          "job-transition-time-constraint",

        questionText:
          "시간이 부족한데 이직 준비를 해도 될까요?",

        expectedSignals: [
          "timeConstraint",
        ],

        expectedHasExplicitConstraints:
          true,
      },
      {
        name:
          "explicit-transition-difficulty",

        questionText:
          "인수인계 때문에 지금 퇴사하기 어려운데 이직을 준비해도 될까요?",

        expectedSignals: [
          "transitionDifficulty",
        ],

        expectedHasExplicitConstraints:
          true,
      },
      {
        name:
          "no-inferred-reality-constraint",

        questionText:
          "다른 회사로 이직하는 게 가능할까요?",

        expectedSignals: [],

        expectedHasExplicitConstraints:
          false,
      },
    ];

  function verifyJobReality(
    fixture:
      JobRealityRegressionFixture,
  ): JobRealityRegressionCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          fixture.questionText,
      });

    const constraints =
      input.questionContext
        .reality
        .constraints;

    const actualSignals =
      constraints.map(
        (constraint) =>
          constraint.signal,
      );

    const actualEvidence = [
      ...new Set(
        constraints.flatMap(
          (constraint) =>
            constraint.evidence,
        ),
      ),
    ];

    const transitionConstraint =
      constraints.find(
        (constraint) =>
          constraint.signal
          === "transitionDifficulty",
      );

    const checks = {
      topicIsJob:
        input.question.topic
        === "job",

      humanContextWasReadFirst:
        input.question
          .humanContextReceived,

      questionContextWasBuilt:
        input.questionContext.question
        === input.question,

      realityAssessmentIsRequired:
        input.questionContext
          .requirements
          .realityAssessmentRequired,

      expectedSignalsWereExtracted:
        fixture.expectedSignals
          .every(
            (signal) =>
              actualSignals.includes(
                signal,
              ),
          ),

      unexpectedSignalsWereExcluded:
        actualSignals.length
        === fixture.expectedSignals.length
        && actualSignals.every(
          (signal) =>
            fixture.expectedSignals
              .includes(
                signal,
              ),
        ),

      explicitConstraintFlagMatched:
        input.questionContext
          .reality
          .hasExplicitConstraints
        === fixture
          .expectedHasExplicitConstraints,

      allConstraintsStayExplicit:
        constraints.every(
          (constraint) =>
            constraint.explicit,
        ),

      matchedEvidenceWasPreserved:
        constraints.every(
          (constraint) =>
            constraint.evidence.length
            > 0,
        ),

      transitionDifficultyUsesWorkArea:
        transitionConstraint
          ? transitionConstraint.area
            === "work"
          : !fixture.expectedSignals
            .includes(
              "transitionDifficulty",
            ),
    };

    return {
      name:
        fixture.name,

      questionText:
        fixture.questionText,

      actualTopic:
        input.question.topic,

      actualDecisionTarget:
        input.question
          .decisionTarget,

      actualSignals,

      actualEvidence,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  export function verifyJobRealityRegression():
    JobRealityRegressionVerificationResult {
    const cases =
      JOB_REALITY_FIXTURES.map(
        verifyJobReality,
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