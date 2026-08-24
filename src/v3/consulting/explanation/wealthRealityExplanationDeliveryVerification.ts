import {
    runDecisionEngine,
  } from "../decision/decisionEngine.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "../decision/regression/decisionEngineRegressionFixture.js";
  import type {
    QuestionRealitySignal,
  } from "../question/questionContext.js";
  import {
    readDecisionResult,
  } from "./decisionResultReader.js";
  import {
    buildDecisionExplanationPlan,
    type DecisionExplanationPlan,
  } from "./decisionExplanationPlan.js";
  import {
    buildDecisionExplanationPayload,
    type DecisionExplanationPayload,
  } from "./decisionExplanationPayload.js";
  import {
    buildConsultingPrompt,
    type ConsultingPrompt,
  } from "./consultingPromptBuilder.js";

  type WealthRealityExplanationDeliveryFixture = {
    name: string;

    questionText: string;

    expectedSignals:
      readonly QuestionRealitySignal[];
  };

  export type WealthRealityExplanationDeliveryCaseResult = {
    name: string;

    questionText: string;

    realityEvidenceKeys: string[];

    realityEvidenceDescriptions: string[];

    plan:
      DecisionExplanationPlan;

    payload:
      DecisionExplanationPayload;

    prompt:
      ConsultingPrompt;

    checks: Record<
      string,
      boolean
    >;

    passed: boolean;
  };

  export type WealthRealityExplanationDeliveryVerificationResult = {
    cases:
      WealthRealityExplanationDeliveryCaseResult[];

    passed: boolean;
  };

  const WEALTH_REALITY_EXPLANATION_DELIVERY_FIXTURES:
    readonly WealthRealityExplanationDeliveryFixture[] = [
      {
        name:
          "essential-funds-reaches-explanation",

        questionText:
          "퇴직금 전부를 주식에 넣어도 될까요?",

        expectedSignals: [
          "essentialFundsExposure",
        ],
      },
      {
        name:
          "liquidity-constraint-reaches-explanation",

        questionText:
          "ETF는 중도 환매가 어렵고 자금이 묶이는데 투자해도 될까요?",

        expectedSignals: [
          "liquidityConstraint",
        ],
      },
      {
        name:
          "asset-concentration-reaches-explanation",

        questionText:
          "한 종목에 집중해서 투자해도 될까요?",

        expectedSignals: [
          "assetConcentration",
        ],
      },
      {
        name:
          "combined-reality-reaches-explanation-once",

        questionText:
          "퇴직금 전부를 한 자산에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 진행해도 될까요?",

        expectedSignals: [
          "essentialFundsExposure",
          "liquidityConstraint",
          "assetConcentration",
        ],
      },
      {
        name:
          "unused-reality-adds-no-explanation-evidence",

        questionText:
          "채권에 투자해도 될까요?",

        expectedSignals: [],
      },
    ];

  function countOccurrences(
    value: string,
    target: string,
  ): number {
    if (target.length === 0) {
      return 0;
    }

    return value
      .split(target)
      .length - 1;
  }

  function findPlanBlock(
    plan: DecisionExplanationPlan,
    step:
      DecisionExplanationPlan["blocks"][number]["step"],
  ) {
    return plan.blocks.find(
      (block) =>
        block.step === step,
    );
  }

  function findPayloadContent(
    payload: DecisionExplanationPayload,
    title: string,
  ): string {
    return (
      payload.explanationOrder.find(
        (item) =>
          item.title === title,
      )?.content
      ?? ""
    );
  }

  function getContentLines(
    content: string,
  ): string[] {
    return content
      .split(/\r?\n/)
      .map(
        (line) =>
          line.trim(),
      )
      .filter(Boolean);
  }

  function verifyWealthRealityExplanationDeliveryCase(
    fixture:
      WealthRealityExplanationDeliveryFixture,
  ): WealthRealityExplanationDeliveryCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          fixture.questionText,

        lifeContext: {
          maritalStatus: "single",

          hasChildren: false,

          occupationStatus: "unemployed",

          hasActiveBusiness: false,

          financialResponsibility: "low",
        },
      });

    const result =
      runDecisionEngine(
        input,
      );

    const realityEvidence =
      result.evidence.filter(
        (evidence) =>
          evidence.key.startsWith(
            "reality-",
          ),
      );

    const explanationInput =
      readDecisionResult(
        result,
      );

      const plan =
      buildDecisionExplanationPlan(
        explanationInput,
        input.question
          .originalQuestion,
      );

    const payload =
      buildDecisionExplanationPayload(
        plan,
      );

    const prompt =
      buildConsultingPrompt(
        payload,
      );

    const evidenceBlock =
      findPlanBlock(
        plan,
        "evidence",
      );

    const conditionsBlock =
      findPlanBlock(
        plan,
        "conditions",
      );

    const risksBlock =
      findPlanBlock(
        plan,
        "risks",
      );

      const payloadEvidence =
      evidenceBlock
        ? findPayloadContent(
            payload,
            evidenceBlock.title,
          )
        : "";

    const payloadConditions =
      conditionsBlock
        ? findPayloadContent(
            payload,
            conditionsBlock.title,
          )
        : "";

    const payloadRisks =
      risksBlock
        ? findPayloadContent(
            payload,
            risksBlock.title,
          )
        : "";

    const expectedRealityEvidenceKeys =
      fixture.expectedSignals.map(
        (signal) =>
          `reality-financial-${signal}`,
      );

    const realityEvidenceKeys =
      realityEvidence.map(
        (evidence) =>
          evidence.key,
      );

    const realityEvidenceDescriptions =
      realityEvidence.map(
        (evidence) =>
          evidence.description,
      );

    const explanationRealityDescriptions =
      explanationInput.evidence
        .filter(
          (evidence) =>
            evidence.source
            === "currentContext",
        )
        .map(
          (evidence) =>
            evidence.description,
        );

    const conditionLines =
      getContentLines(
        conditionsBlock?.content
        ?? "",
      );

    const riskLines =
      getContentLines(
        risksBlock?.content
        ?? "",
      );

    const engineConditionDescriptions =
      result.conditions.map(
        (condition) =>
          condition.description,
      );

    const engineRiskDescriptions =
      result.risks.map(
        (risk) =>
          risk.description,
      );

    const checks = {
      topicIsMoney:
        result.topic === "money",

      expectedRealityEvidenceReachedDecision:
        realityEvidenceKeys.length
        === expectedRealityEvidenceKeys.length
        && expectedRealityEvidenceKeys.every(
          (key) =>
            realityEvidenceKeys.includes(
              key,
            ),
        ),

      realityEvidenceUsesCurrentContext:
        realityEvidence.every(
          (evidence) =>
            evidence.source
            === "currentContext",
        ),

      realityEvidenceKeepsHighestWeight:
        realityEvidence.every(
          (evidence) =>
            evidence.weight === 5,
        ),

      decisionResultReaderPreservesRealityEvidence:
        realityEvidenceDescriptions.every(
          (description) =>
            explanationRealityDescriptions
              .includes(
                description,
              ),
        ),

      explanationPlanIncludesRealityEvidenceOnce:
        realityEvidenceDescriptions.every(
          (description) =>
            countOccurrences(
              evidenceBlock?.content
              ?? "",
              description,
            ) === 1,
        ),

      payloadIncludesRealityEvidenceOnce:
        realityEvidenceDescriptions.every(
          (description) =>
            countOccurrences(
              payloadEvidence,
              description,
            ) === 1,
        ),

      promptIncludesRealityEvidenceOnce:
        realityEvidenceDescriptions.every(
          (description) =>
            countOccurrences(
              prompt.userPrompt,
              description,
            ) === 1,
        ),

      noRealityEvidenceStaysAbsent:
        fixture.expectedSignals.length !== 0
        || (
          realityEvidence.length === 0
          && explanationRealityDescriptions
            .length === 0
        ),

      explanationDoesNotInventConditions:
        conditionLines.every(
          (description) =>
            engineConditionDescriptions
              .includes(
                description,
              ),
        ),

      explanationDoesNotInventRisks:
        riskLines.every(
          (description) =>
            engineRiskDescriptions
              .includes(
                description,
              ),
        ),

      payloadConditionsMatchPlan:
        payloadConditions
        === (
          conditionsBlock?.required
            ? conditionsBlock.content
            : ""
        ),

      payloadRisksMatchPlan:
        payloadRisks
        === (
          risksBlock?.required
            ? risksBlock.content
            : ""
        ),

      promptIncludesConditionBlockOnce:
        !conditionsBlock?.required
        || countOccurrences(
          prompt.userPrompt,
          conditionsBlock.content,
        ) === 1,

      promptIncludesRiskBlockOnce:
        !risksBlock?.required
        || countOccurrences(
          prompt.userPrompt,
          risksBlock.content,
        ) === 1,

      payloadUsesLockedEngineDecision:
        payload.verdict
        === result.verdict
        && payload.engineDecisionLocked
        === true
        && payload.gptMayRejudge
        === false,

      promptIncludesCanonicalFinalDecisionOnce:
        countOccurrences(
          prompt.userPrompt,
          result.finalDecisionSentence,
        ) === 1,

      explanationPlanKeepsEngineLocked:
        plan.engineDecisionLocked
        === true
        && plan.gptMayRejudge
        === false,
    };

    return {
      name:
        fixture.name,

      questionText:
        fixture.questionText,

      realityEvidenceKeys,

      realityEvidenceDescriptions,

      plan,

      payload,

      prompt,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  export function verifyWealthRealityExplanationDelivery():
    WealthRealityExplanationDeliveryVerificationResult {
    const cases =
      WEALTH_REALITY_EXPLANATION_DELIVERY_FIXTURES
        .map(
            verifyWealthRealityExplanationDeliveryCase,
        );

    return {
      cases,

      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }
