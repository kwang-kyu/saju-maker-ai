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

  type JobRealityAssessmentFixture = {
    name: string;

    questionText: string;

    expectedSignals:
      readonly QuestionRealitySignal[];

    expectedAssessment:
      LifeContextAssessment;

    expectedQuestionRealityUsed:
      boolean;
  };

  export type JobRealityAssessmentCaseResult = {
    name: string;

    questionText: string;

    actualSignals:
      QuestionRealitySignal[];

    actualAssessment:
      LifeContextAssessment;

    checks: {
      topicIsJob: boolean;

      expectedSignalsWereUsed:
        boolean;

      assessmentMatched:
        boolean;

      questionRealityUsageMatched:
        boolean;

      constraintsWerePreserved:
        boolean;

      evidenceWasPreserved:
        boolean;

      singleSignalDidNotCreateHigh:
        boolean;
    };

    passed: boolean;
  };

  export type JobRealityAssessmentRegressionResult = {
    cases:
      JobRealityAssessmentCaseResult[];

    passed: boolean;
  };

  const LOW_ASSESSMENT:
    LifeContextAssessment = {
      executionConstraint: "low",
      familyResponsibility: "low",
      financialPressure: "low",
      transitionDifficulty: "low",
      expansionRisk: "low",
    };

  const JOB_REALITY_ASSESSMENT_FIXTURES:
    readonly JobRealityAssessmentFixture[] = [
      {
        name:
          "explicit-transition-difficulty-is-medium",

        questionText:
          "인수인계 때문에 바로 퇴사하기 어려운데 이직해도 될까요?",

        expectedSignals: [
          "transitionDifficulty",
        ],

        expectedAssessment: {
          ...LOW_ASSESSMENT,

          transitionDifficulty:
            "medium",
        },

        expectedQuestionRealityUsed:
          true,
      },
      {
        name:
          "current-work-responsibility-is-medium-transition",

        questionText:
          "현재 직장을 유지하면서 이직을 준비해도 될까요?",

        expectedSignals: [
          "currentWorkResponsibility",
        ],

        expectedAssessment: {
          ...LOW_ASSESSMENT,

          transitionDifficulty:
            "medium",
        },

        expectedQuestionRealityUsed:
          true,
      },
      {
        name:
          "time-constraint-is-medium-execution",

        questionText:
          "시간이 부족한데 이직 준비를 해도 될까요?",

        expectedSignals: [
          "timeConstraint",
        ],

        expectedAssessment: {
          ...LOW_ASSESSMENT,

          executionConstraint:
            "medium",
        },

        expectedQuestionRealityUsed:
          true,
      },
      {
        name:
          "income-instability-is-medium-financial-pressure",

        questionText:
          "수입이 불안정한데 다른 회사로 이직해도 될까요?",

        expectedSignals: [
          "incomeInstability",
        ],

        expectedAssessment: {
          ...LOW_ASSESSMENT,

          financialPressure:
            "medium",
        },

        expectedQuestionRealityUsed:
          true,
      },
      {
        name:
          "family-responsibility-is-medium",

        questionText:
          "가족 부양 책임이 있는데 지금 퇴사해도 될까요?",

        expectedSignals: [
          "familyResponsibility",
        ],

        expectedAssessment: {
          ...LOW_ASSESSMENT,

          familyResponsibility:
            "medium",
        },

        expectedQuestionRealityUsed:
          true,
      },
      {
        name:
          "combined-job-constraints-can-be-high",

        questionText:
          "가족 부양 책임이 있고 수입이 불안정하며 현재 직장을 다니느라 시간이 부족하고 인수인계도 필요한데 이직해도 될까요?",

        expectedSignals: [
          "incomeInstability",
          "familyResponsibility",
          "currentWorkResponsibility",
          "transitionDifficulty",
          "timeConstraint",
        ],

        expectedAssessment: {
          executionConstraint:
            "high",

          familyResponsibility:
            "medium",

          financialPressure:
            "medium",

          transitionDifficulty:
            "high",

          expansionRisk:
            "low",
        },

        expectedQuestionRealityUsed:
          true,
      },
      {
        name:
          "no-explicit-reality-stays-low",

        questionText:
          "다른 회사로 이직하는 게 가능할까요?",

        expectedSignals: [],

        expectedAssessment:
          LOW_ASSESSMENT,

        expectedQuestionRealityUsed:
          false,
      },
    ];

  function hasHighLevel(
    assessment:
      LifeContextAssessment,
  ): boolean {
    return Object.values(
      assessment,
    ).some(
      (level: AssessmentLevel) =>
        level === "high",
    );
  }

  function verifyJobRealityAssessment(
    fixture:
      JobRealityAssessmentFixture,
  ): JobRealityAssessmentCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          fixture.questionText,

        lifeContext: {
          maritalStatus:
            "single",

          hasChildren:
            false,

          occupationStatus:
            "unemployed",

          hasActiveBusiness:
            false,

          financialResponsibility:
            "low",
        },
      });

    const assessment =
      assessDecisionReality(
        input.lifeContext,
        input.questionContext
          .reality,
      );

    const actualSignals =
      assessment.questionConstraints
        .map(
          (constraint) =>
            constraint.signal,
        );

    const actualAssessment:
      LifeContextAssessment = {
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

    const checks = {
      topicIsJob:
        input.question.topic
        === "job",

      expectedSignalsWereUsed:
        actualSignals.length
        === fixture.expectedSignals.length
        && fixture.expectedSignals
          .every(
            (signal) =>
              actualSignals.includes(
                signal,
              ),
          ),

      assessmentMatched:
        JSON.stringify(
          actualAssessment,
        )
        === JSON.stringify(
          fixture.expectedAssessment,
        ),

      questionRealityUsageMatched:
        assessment.questionRealityUsed
        === fixture
          .expectedQuestionRealityUsed,

      constraintsWerePreserved:
        assessment.questionConstraints
          .length
        === input.questionContext
          .reality
          .constraints
          .length,

      evidenceWasPreserved:
        assessment.questionConstraints
          .every(
            (constraint) =>
              constraint.evidence.length
              > 0
              && constraint.explicit,
          ),

      singleSignalDidNotCreateHigh:
        fixture.expectedSignals.length
        !== 1
        || !hasHighLevel(
          actualAssessment,
        ),
    };

    return {
      name:
        fixture.name,

      questionText:
        fixture.questionText,

      actualSignals,

      actualAssessment,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  export function verifyJobRealityAssessmentRegression():
    JobRealityAssessmentRegressionResult {
    const cases =
      JOB_REALITY_ASSESSMENT_FIXTURES
        .map(
          verifyJobRealityAssessment,
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