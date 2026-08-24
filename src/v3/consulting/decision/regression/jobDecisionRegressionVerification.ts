import type {
    QuestionRealitySignal,
  } from "../../question/questionContext.js";
  import {
    runDecisionEngine,
  } from "../decisionEngine.js";
  import {
    selectReaderDecisionSources,
  } from "../readerDecisionSelectionBuilder.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";

  export type JobDecisionRegressionVerificationResult = {
    question: {
      originalQuestion: string;
      topic: string;
      intent: string;
      motive: string;
      decisionTarget: string;
      urgency: string;
      realitySignals:
        QuestionRealitySignal[];
    };

    decision: {
      verdict: string;
      confidence: string;
      contextAlignment: string;
      actionReadiness: string;
      evidenceSources: string[];
      conditionKeys: string[];
      riskKeys: string[];
      finalDecisionSentence: string;
    };

    checks: {
      humanContextWasReadFirst:
        boolean;

      questionContextWasBuilt:
        boolean;

      topicIsJob:
        boolean;

      intentIsPossibility:
        boolean;

      motiveIsLifeTransition:
        boolean;

      decisionTargetIsChangeJob:
        boolean;

      urgencyIsUnknown:
        boolean;

      allJobRealitySignalsWereExtracted:
        boolean;

      careerReaderIsPrimary:
        boolean;

      careerEvidenceWasUsed:
        boolean;

      capacityEvidenceWasUsed:
        boolean;

      destinyEvidenceWasUsed:
        boolean;

      verdictIsConditionallyRecommended:
        boolean;

      verdictWasNotRaisedByStrengthAlone:
        boolean;

      realityDidNotForceAutomaticWait:
        boolean;

      confidenceIsHigh:
        boolean;

      contextIsStronglyAligned:
        boolean;

      readinessRequiresConditions:
        boolean;

      gradualTransitionConditionWasUsed:
        boolean;

      transitionDifficultyRiskWasUsed:
        boolean;

      conditionKeepsExecutionRequirementRole:
        boolean;

      riskKeepsFailureConsequenceRole:
        boolean;

      conditionAndRiskStaySeparated:
        boolean;

      decisionUsesHumanContext:
        boolean;

      decisionUsesQuestionContext:
        boolean;

      destinyEvidenceStaysNonPredictive:
        boolean;

      finalDecisionDoesNotPredictSuccess:
        boolean;
    };

    passed: boolean;
  };

  const JOB_DECISION_QUESTION =
    "가족 부양 책임이 있고 수입이 불안정하며 현재 직장을 다니느라 시간이 부족하고 인수인계도 필요한데 이직하는 게 가능할까요?";

  export function verifyJobDecisionRegression():
    JobDecisionRegressionVerificationResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          JOB_DECISION_QUESTION,

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

    const selectedReaderSources =
      selectReaderDecisionSources(
        input.question.topic,
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

    const evidenceSources = [
      ...new Set(
        result.evidence.map(
          (evidence) =>
            evidence.source,
        ),
      ),
    ];

    const conditionKeys =
      result.conditions.map(
        (condition) =>
          condition.key,
      );

    const riskKeys =
      result.risks.map(
        (risk) =>
          risk.key,
      );

    const gradualTransitionCondition =
      result.conditions.find(
        (condition) =>
          condition.key
          === "useGradualTransition",
      );

    const transitionDifficultyRisk =
      result.risks.find(
        (risk) =>
          risk.key
          === "lifeContextTransitionDifficulty",
      );

    const destinyEvidence =
      result.evidence.filter(
        (evidence) =>
          evidence.source
          === "destiny",
      );

    const checks = {
      humanContextWasReadFirst:
        input.question
          .humanContextReceived,

      questionContextWasBuilt:
        input.questionContext.question
        === input.question,

      topicIsJob:
        input.question.topic
        === "job",

      intentIsPossibility:
        input.question.intent
        === "possibility",

      motiveIsLifeTransition:
        input.question.motive
        === "lifeTransition",

      decisionTargetIsChangeJob:
        input.question.decisionTarget
        === "changeJob",

      urgencyIsUnknown:
        input.question.urgency
        === "unknown",

      allJobRealitySignalsWereExtracted:
        expectedSignals.every(
          (signal) =>
            realitySignals.includes(
              signal,
            ),
        )
        && realitySignals.length
        === expectedSignals.length,

      careerReaderIsPrimary:
        selectedReaderSources[0]
        === "career",

      careerEvidenceWasUsed:
        evidenceSources.includes(
          "career",
        ),

      capacityEvidenceWasUsed:
        evidenceSources.includes(
          "capacity",
        ),

      destinyEvidenceWasUsed:
        evidenceSources.includes(
          "destiny",
        ),

      verdictIsConditionallyRecommended:
        result.verdict
        === "conditionallyRecommended",

      verdictWasNotRaisedByStrengthAlone:
        result.verdict
        !== "recommended",

      realityDidNotForceAutomaticWait:
        result.verdict
        !== "wait"
        && result.verdict
        !== "notRecommended",

      confidenceIsHigh:
        result.confidence
        === "high",

      contextIsStronglyAligned:
        result.contextAlignment
        === "stronglyAligned",

      readinessRequiresConditions:
        result.actionReadiness
        === "readyWithConditions",

      gradualTransitionConditionWasUsed:
        gradualTransitionCondition
          !== undefined,

      transitionDifficultyRiskWasUsed:
        transitionDifficultyRisk
          !== undefined,

      conditionKeepsExecutionRequirementRole:
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

      riskKeepsFailureConsequenceRole:
        transitionDifficultyRisk
          ?.description
          .includes(
            "흔들릴 수 있다.",
          )
        === true
        && !transitionDifficultyRisk
          .description
          .includes(
            "확정한 뒤",
          ),

      conditionAndRiskStaySeparated:
        gradualTransitionCondition
          !== undefined
        && transitionDifficultyRisk
          !== undefined
        && gradualTransitionCondition
          .description
        !== transitionDifficultyRisk
          .description,

      decisionUsesHumanContext:
        result.humanContextUsed,

      decisionUsesQuestionContext:
        result.questionContextUsed,

      destinyEvidenceStaysNonPredictive:
        destinyEvidence.length > 0
        && destinyEvidence.every(
          (evidence) =>
            !evidence.description
              .includes(
                "반드시 성공",
              )
            && !evidence.description
              .includes(
                "합격 시기가 정해져",
              )
            && !evidence.description
              .includes(
                "직업 성공이 정해져",
              ),
        ),

      finalDecisionDoesNotPredictSuccess:
        !result.finalDecisionSentence
          .includes(
            "반드시 성공",
          )
        && !result.finalDecisionSentence
          .includes(
            "무조건 성공",
          )
        && !result.finalDecisionSentence
          .includes(
            "합격 시기가 정해져",
          ),
    };

    return {
      question: {
        originalQuestion:
          input.question
            .originalQuestion,

        topic:
          input.question.topic,

        intent:
          input.question.intent,

        motive:
          input.question.motive,

        decisionTarget:
          input.question
            .decisionTarget,

        urgency:
          input.question.urgency,

        realitySignals,
      },

      decision: {
        verdict:
          result.verdict,

        confidence:
          result.confidence,

        contextAlignment:
          result.contextAlignment,

        actionReadiness:
          result.actionReadiness,

        evidenceSources,

        conditionKeys,

        riskKeys,

        finalDecisionSentence:
          result.finalDecisionSentence,
      },

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
