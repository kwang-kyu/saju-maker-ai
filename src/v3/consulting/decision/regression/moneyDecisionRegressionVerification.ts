import {
    runDecisionEngine,
  } from "../decisionEngine";
  import {
    selectReaderDecisionSources,
  } from "../readerDecisionSelectionBuilder";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";

  export type MoneyDecisionRegressionVerificationResult = {
    question: {
      originalQuestion: string;
      topic: string;
      intent: string;
      motive: string;
      decisionTarget: string;
      urgency: string;
      timingType: string;
      realitySignals: string[];
    };

    decision: {
      verdict: string;
      confidence: string;
      contextAlignment: string;
      actionReadiness: string;
      evidenceSources: string[];
      conditionKeys: string[];
      conditionDescriptions: string[];
      riskKeys: string[];
      riskDescriptions: string[];
    };

    checks: {
      humanContextWasReadFirst:
        boolean;

      questionContextWasBuilt:
        boolean;

      topicIsMoney:
        boolean;

      intentIsPossibility:
        boolean;

      motiveIsSurvival:
        boolean;

      decisionTargetIsInvest:
        boolean;

      urgencyIsImmediate:
        boolean;

      debtBurdenWasExtracted:
        boolean;

      livingCostPressureWasExtracted:
        boolean;

      moneyReaderIsPrimary:
        boolean;

      moneyEvidenceWasUsed:
        boolean;

      capacityEvidenceWasUsed:
        boolean;

      destinyEvidenceWasUsed:
        boolean;

      verdictIsConditionallyRecommended:
        boolean;

      confidenceIsHigh:
        boolean;

      contextIsStronglyAligned:
        boolean;

      readinessRequiresConditions:
        boolean;

      verdictWasNotRaisedByStrengthAlone:
        boolean;

      decisionUsesHumanContext:
        boolean;

      decisionUsesQuestionContext:
        boolean;

      financialConditionUsesDebtAndLivingCost:
        boolean;

      financialRiskUsesDebtAndLivingCost:
        boolean;

      conditionKeepsExecutionRequirementRole:
        boolean;

      riskKeepsConsequenceRole:
        boolean;

      destinyEvidenceStaysNonPredictive:
        boolean;

      finalDecisionDoesNotPredictSuccess:
        boolean;
    };

    passed: boolean;
  };

  const MONEY_DECISION_QUESTION =
    "지금 생활비와 대출 부담이 있는 상황에서 여유자금 투자가 가능한가?";

  export function verifyMoneyDecisionRegression():
    MoneyDecisionRegressionVerificationResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          MONEY_DECISION_QUESTION,

        lifeContext: {
          financialResponsibility:
            "high",
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
      input.questionContext.reality.constraints
        .map(
          (constraint) =>
            constraint.signal,
        );

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

    const conditionDescriptions =
      result.conditions.map(
        (condition) =>
          condition.description,
      );

    const riskKeys =
      result.risks.map(
        (risk) =>
          risk.key,
      );

    const riskDescriptions =
      result.risks.map(
        (risk) =>
          risk.description,
      );

    const financialCondition =
      result.conditions.find(
        (condition) =>
          condition.key
          === "protectExistingCashFlow",
      );

    const financialRisk =
      result.risks.find(
        (risk) =>
          risk.key
          === "lifeContextFinancialPressure",
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

      topicIsMoney:
        input.question.topic
        === "money",

      intentIsPossibility:
        input.question.intent
        === "possibility",

      motiveIsSurvival:
        input.question.motive
        === "survival",

      decisionTargetIsInvest:
        input.question.decisionTarget
        === "invest",

      urgencyIsImmediate:
        input.question.urgency
        === "immediate",

      debtBurdenWasExtracted:
        realitySignals.includes(
          "debtBurden",
        ),

      livingCostPressureWasExtracted:
        realitySignals.includes(
          "livingCostPressure",
        ),

      moneyReaderIsPrimary:
        selectedReaderSources[0]
        === "money",

      moneyEvidenceWasUsed:
        evidenceSources.includes(
          "money",
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

      confidenceIsHigh:
        result.confidence
        === "high",

      contextIsStronglyAligned:
        result.contextAlignment
        === "stronglyAligned",

      readinessRequiresConditions:
        result.actionReadiness
        === "readyWithConditions",

      verdictWasNotRaisedByStrengthAlone:
        result.verdict
        !== "recommended",

      decisionUsesHumanContext:
        result.humanContextUsed,

      decisionUsesQuestionContext:
        result.questionContextUsed,

      financialConditionUsesDebtAndLivingCost:
        financialCondition
          ?.description
          .includes(
            "생활비와 대출 상환 재원",
          )
        === true
        && financialCondition
          .description
          .includes(
            "투자금과 분리",
          )
        && financialCondition
          .description
          .includes(
            "상환 의무",
          ),

      financialRiskUsesDebtAndLivingCost:
        financialRisk
          ?.description
          .includes(
            "생활비와 대출 상환 부담",
          )
        === true
        && financialRisk
          .description
          .includes(
            "자금 회수 지연",
          )
        && financialRisk
          .description
          .includes(
            "상환 일정과 기존 생활 기반",
          ),

      conditionKeepsExecutionRequirementRole:
        financialCondition
          ?.description
          .includes(
            "확정해야 한다.",
          )
        === true
        && !financialCondition
          .description
          .includes(
            "자금 회수 지연",
          )
        && !financialCondition
          .description
          .includes(
            "흔들릴 수 있다.",
          ),

      riskKeepsConsequenceRole:
        financialRisk
          ?.description
          .includes(
            "흔들릴 수 있다.",
          )
        === true
        && !financialRisk
          .description
          .includes(
            "투자금과 분리",
          )
        && !financialRisk
          .description
          .includes(
            "확정해야 한다.",
          ),

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
                "성공이 정해져",
              )
            && !evidence.description
              .includes(
                "시기가 정해져",
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
            "성공이 정해져",
          ),
    };

    return {
      question: {
        originalQuestion:
          input.question.originalQuestion,

        topic:
          input.question.topic,

        intent:
          input.question.intent,

        motive:
          input.question.motive,

        decisionTarget:
          input.question.decisionTarget,

        urgency:
          input.question.urgency,

        timingType:
          input.question.timingType,

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

        conditionDescriptions,

        riskKeys,

        riskDescriptions,
      },

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }