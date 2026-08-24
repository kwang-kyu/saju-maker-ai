import type {
    QuestionRealitySignal,
  } from "../../question/questionContext.js";
  import {
    runDecisionEngine,
  } from "../decisionEngine.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";

  export type JobRiskRegressionVerificationResult = {
    question: {
      originalQuestion: string;

      topic: string;

      decisionTarget: string;

      realitySignals:
        QuestionRealitySignal[];
    };

    risk: {
      found: boolean;

      key: string | null;

      description: string | null;

      severity: string | null;

      source: string | null;
    };

    checks: {
      topicIsJob: boolean;

      decisionTargetIsChangeJob:
        boolean;

      allJobRealitySignalsWereExtracted:
        boolean;

      transitionDifficultyRiskWasCreated:
        boolean;

      riskUsesCurrentWorkAndHandover:
        boolean;

      riskDescribesPreparationShortage:
        boolean;

      riskDescribesIncomeGapAndOverload:
        boolean;

      riskDescribesFamilyConsequence:
        boolean;

      riskKeepsConsequenceRole:
        boolean;

      riskDoesNotRepeatConditionRequirement:
        boolean;

      riskSeverityIsHigh:
        boolean;

      riskSourceIsLifeContext:
        boolean;

      conditionAndRiskDescriptionsDiffer:
        boolean;

      decisionUsesHumanContext:
        boolean;

      decisionUsesQuestionContext:
        boolean;
    };

    passed: boolean;
  };

  const JOB_RISK_QUESTION =
    "가족 부양 책임이 있고 수입이 불안정하며 현재 직장을 다니느라 시간이 부족하고 인수인계도 필요한데 이직해도 될까요?";

  export function verifyJobRiskRegression():
    JobRiskRegressionVerificationResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          JOB_RISK_QUESTION,

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

    const expectedSignals:
      readonly QuestionRealitySignal[] = [
        "incomeInstability",
        "familyResponsibility",
        "currentWorkResponsibility",
        "transitionDifficulty",
        "timeConstraint",
      ];

    const transitionRisk =
      result.risks.find(
        (risk) =>
          risk.key
          === "lifeContextTransitionDifficulty",
      );

    const gradualTransitionCondition =
      result.conditions.find(
        (condition) =>
          condition.key
          === "useGradualTransition",
      );

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

      transitionDifficultyRiskWasCreated:
        transitionRisk
          !== undefined,

      riskUsesCurrentWorkAndHandover:
        transitionRisk
          ?.description
          .includes(
            "현재 직장 책임과 인수인계를 마치지 않은 채",
          )
        === true,

      riskDescribesPreparationShortage:
        transitionRisk
          ?.description
          .includes(
            "준비 시간이 부족한 상태",
          )
        === true,

      riskDescribesIncomeGapAndOverload:
        transitionRisk
          ?.description
          .includes(
            "수입 공백과 업무 과부하",
          )
        === true,

      riskDescribesFamilyConsequence:
        transitionRisk
          ?.description
          .includes(
            "가족 생활 기반까지 흔들릴 수 있다.",
          )
        === true,

      riskKeepsConsequenceRole:
        transitionRisk
          ?.description
          .includes(
            "흔들릴 수 있다.",
          )
        === true,

      riskDoesNotRepeatConditionRequirement:
        transitionRisk
          !== undefined
        && !transitionRisk
          .description
          .includes(
            "확정해야 한다.",
          )
        && !transitionRisk
          .description
          .includes(
            "마련해야 한다.",
          )
        && !transitionRisk
          .description
          .includes(
            "확보해야 한다.",
          ),

      riskSeverityIsHigh:
        transitionRisk
          ?.severity
        === "high",

      riskSourceIsLifeContext:
        transitionRisk
          ?.source
        === "lifeContext",

      conditionAndRiskDescriptionsDiffer:
        gradualTransitionCondition
          !== undefined
        && transitionRisk
          !== undefined
        && gradualTransitionCondition
          .description
        !== transitionRisk
          .description,

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

      risk: {
        found:
          transitionRisk
          !== undefined,

        key:
          transitionRisk
            ?.key
          ?? null,

        description:
          transitionRisk
            ?.description
          ?? null,

        severity:
          transitionRisk
            ?.severity
          ?? null,

        source:
          transitionRisk
            ?.source
          ?? null,
      },

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }