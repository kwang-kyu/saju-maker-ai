import {
    runDecisionEngine,
  } from "../decisionEngine";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";
  import type {
    QuestionRealitySignal,
  } from "../../question/questionContext";

  export type JobConditionRegressionVerificationResult = {
    question: {
      originalQuestion: string;

      topic: string;

      decisionTarget: string;

      realitySignals: string[];
    };

    condition: {
      found: boolean;

      key: string | null;

      description: string | null;

      required: boolean | null;

      satisfied: boolean | null;
    };

    checks: {
      topicIsJob: boolean;

      decisionTargetIsChangeJob:
        boolean;

      allJobRealitySignalsWereExtracted:
        boolean;

      gradualTransitionConditionWasCreated:
        boolean;

      conditionUsesCurrentWorkAndHandover:
        boolean;

      conditionSecuresPreparationTime:
        boolean;

      conditionProtectsFamilyIncome:
        boolean;

      conditionDefinesTransitionTiming:
        boolean;

      conditionKeepsRequirementRole:
        boolean;

      conditionDoesNotDescribeFailureConsequence:
        boolean;

      conditionIsRequiredAndUnsatisfied:
        boolean;

      decisionUsesHumanContext:
        boolean;

      decisionUsesQuestionContext:
        boolean;
    };

    passed: boolean;
  };

  const JOB_CONDITION_QUESTION =
    "가족 부양 책임이 있고 수입이 불안정하며 현재 직장을 다니느라 시간이 부족하고 인수인계도 필요한데 이직해도 될까요?";

  export function verifyJobConditionRegression():
    JobConditionRegressionVerificationResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          JOB_CONDITION_QUESTION,

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

    const result =
      runDecisionEngine(
        input,
      );

    const realitySignals =
      input.questionContext
        .reality
        .constraints
        .map(
          (constraint) =>
            constraint.signal,
        );

    const gradualTransitionCondition =
      result.conditions.find(
        (condition) =>
          condition.key
          === "useGradualTransition",
      );

      const expectedSignals:
    readonly QuestionRealitySignal[] = [
      "incomeInstability",
      "familyResponsibility",
      "currentWorkResponsibility",
      "transitionDifficulty",
      "timeConstraint",
    ];

    const checks = {
      topicIsJob:
        input.question.topic
        === "job",

      decisionTargetIsChangeJob:
        input.question.decisionTarget
        === "changeJob",

      allJobRealitySignalsWereExtracted:
        expectedSignals.every(
          (signal) =>
            realitySignals.includes(
              signal,
            ),
        )
        && realitySignals.length
        === expectedSignals.length,

      gradualTransitionConditionWasCreated:
        gradualTransitionCondition
          !== undefined,

      conditionUsesCurrentWorkAndHandover:
        gradualTransitionCondition
          ?.description
          .includes(
            "현재 직장 책임과 인수인계",
          )
        === true,

      conditionSecuresPreparationTime:
        gradualTransitionCondition
          ?.description
          .includes(
            "이직 준비 시간을 별도로 확보",
          )
        === true,

      conditionProtectsFamilyIncome:
        gradualTransitionCondition
          ?.description
          .includes(
            "가족 부양 재원을 지킬 최소 수입 기준",
          )
        === true,

      conditionDefinesTransitionTiming:
        gradualTransitionCondition
          ?.description
          .includes(
            "퇴사·전환 시점",
          )
        === true
        && gradualTransitionCondition
          .description
          .includes(
            "단계적으로 옮겨야 한다.",
          ),

      conditionKeepsRequirementRole:
        gradualTransitionCondition
          ?.description
          .includes(
            "확정한 뒤",
          )
        === true
        && !gradualTransitionCondition
          .description
          .includes(
            "흔들릴 수 있다.",
          ),

      conditionDoesNotDescribeFailureConsequence:
        gradualTransitionCondition
          !== undefined
        && !gradualTransitionCondition
          .description
          .includes(
            "수입 공백이 발생",
          )
        && !gradualTransitionCondition
          .description
          .includes(
            "업무 과부하가 발생",
          )
        && !gradualTransitionCondition
          .description
          .includes(
            "생활 기반이 흔들",
          ),

      conditionIsRequiredAndUnsatisfied:
        gradualTransitionCondition
          ?.required
        === true
        && gradualTransitionCondition
          .satisfied
        === false,

      decisionUsesHumanContext:
        result.humanContextUsed,

      decisionUsesQuestionContext:
        result.questionContextUsed,
    };

    return {
      question: {
        originalQuestion:
          input.question
            .originalQuestion,

        topic:
          input.question.topic,

        decisionTarget:
          input.question
            .decisionTarget,

        realitySignals,
      },

      condition: {
        found:
          gradualTransitionCondition
          !== undefined,

        key:
          gradualTransitionCondition
            ?.key
          ?? null,

        description:
          gradualTransitionCondition
            ?.description
          ?? null,

        required:
          gradualTransitionCondition
            ?.required
          ?? null,

        satisfied:
          gradualTransitionCondition
            ?.satisfied
          ?? null,
      },

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }