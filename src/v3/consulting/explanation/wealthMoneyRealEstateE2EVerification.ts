import {
    runDecisionEngine,
  } from "../decision/decisionEngine.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "../decision/regression/decisionEngineRegressionFixture.js";
  import {
    selectReaderDecisionSources,
    type ReaderDecisionSource,
  } from "../decision/readerDecisionSelectionBuilder.js";
  import type {
    DecisionTarget,
    QuestionIntentOrLegacy,
  } from "../question/questionReader.js";
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

  type WealthE2ETopic =
    | "money"
    | "realEstate";

  type WealthMoneyRealEstateE2EFixture = {
    name: string;

    questionText: string;

    expectedTopic:
      WealthE2ETopic;

    expectedIntent:
      QuestionIntentOrLegacy;

    expectedDecisionTarget:
      DecisionTarget;

    expectedRealitySignals:
      readonly QuestionRealitySignal[];

    expectedReaderSources:
      readonly ReaderDecisionSource[];

    financialResponsibility?:
      "low"
      | "medium"
      | "high";
  };

  export type WealthMoneyRealEstateE2ECaseResult = {
    name: string;

    questionText: string;

    actualTopic: string;

    actualIntent: string;

    actualDecisionTarget: string;

    realitySignals:
      QuestionRealitySignal[];

    selectedReaderSources:
      ReaderDecisionSource[];

    verdict: string;

    actionReadiness: string;

    realityEvidenceKeys: string[];

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

  export type WealthMoneyRealEstateE2EVerificationResult = {
    cases:
      WealthMoneyRealEstateE2ECaseResult[];

    passed: boolean;
  };

  const WEALTH_MONEY_REAL_ESTATE_E2E_FIXTURES:
    readonly WealthMoneyRealEstateE2EFixture[] = [
      {
        name:
          "money-surplus-funds-investment",

        questionText:
          "여유자금으로 ETF에 투자해도 될까요?",

        expectedTopic:
          "money",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",

        expectedRealitySignals: [],

        expectedReaderSources: [
          "money",
          "capacity",
          "destiny",
        ],

        financialResponsibility:
          "low",
      },
      {
        name:
          "money-debt-and-living-cost-investment",

        questionText:
          "지금 생활비와 대출 부담이 있는 상황에서 여유자금 투자가 가능한가?",

        expectedTopic:
          "money",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",

        expectedRealitySignals: [
          "debtBurden",
          "livingCostPressure",
        ],

        expectedReaderSources: [
          "money",
          "capacity",
          "destiny",
        ],

        financialResponsibility:
          "high",
      },
      {
        name:
          "money-retirement-funds-investment",

        questionText:
          "퇴직금 전부를 주식에 넣어도 될까요?",

        expectedTopic:
          "money",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",

        expectedRealitySignals: [
          "essentialFundsExposure",
        ],

        expectedReaderSources: [
          "money",
          "capacity",
          "destiny",
        ],

        financialResponsibility:
          "low",
      },
      {
        name:
          "money-combined-reality-investment",

        questionText:
          "퇴직금 전부를 한 자산에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 진행해도 될까요?",

        expectedTopic:
          "money",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",

        expectedRealitySignals: [
          "essentialFundsExposure",
          "liquidityConstraint",
          "assetConcentration",
        ],

        expectedReaderSources: [
          "money",
          "capacity",
          "destiny",
        ],

        financialResponsibility:
          "low",
      },
      {
        name:
          "real-estate-apartment-purchase",

        questionText:
          "아파트를 매수하는 게 가능할까요?",

        expectedTopic:
          "realEstate",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",

        expectedRealitySignals: [],

        expectedReaderSources: [
          "money",
          "capacity",
          "career",
          "destiny",
        ],
      },
      {
        name:
          "real-estate-commercial-purchase-with-debt",

        questionText:
          "대출 부담이 있는데 상가를 매수해도 될까요?",

        expectedTopic:
          "realEstate",

        expectedIntent:
          "possibility",

        expectedDecisionTarget:
          "invest",

        expectedRealitySignals: [
          "debtBurden",
        ],

        expectedReaderSources: [
          "money",
          "capacity",
          "career",
          "destiny",
        ],

        financialResponsibility:
          "high",
      },
      {
        name:
          "real-estate-owned-building-sale",

        questionText:
          "보유 중인 건물을 매도해야 하나요?",

        expectedTopic:
          "realEstate",

        expectedIntent:
          "termination",

        expectedDecisionTarget:
          "sell",

        expectedRealitySignals: [],

        expectedReaderSources: [
          "money",
          "capacity",
          "career",
          "destiny",
        ],
      },
      {
        name:
          "real-estate-asset-selection",

        questionText:
          "아파트와 상가 중 어느 것을 선택해야 할까요?",

        expectedTopic:
          "realEstate",

        expectedIntent:
          "selection",

        expectedDecisionTarget:
          "choose",

        expectedRealitySignals: [],

        expectedReaderSources: [
          "money",
          "capacity",
          "career",
          "destiny",
        ],
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

  function arraysMatchExactly<T>(
    actual: readonly T[],
    expected: readonly T[],
  ): boolean {
    return (
      actual.length === expected.length
      && expected.every(
        (item, index) =>
          actual[index] === item,
      )
    );
  }

  function verifyWealthMoneyRealEstateE2ECase(
    fixture:
      WealthMoneyRealEstateE2EFixture,
  ): WealthMoneyRealEstateE2ECaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          fixture.questionText,

        lifeContext:
          fixture.financialResponsibility
            ? {
                financialResponsibility:
                  fixture.financialResponsibility,
              }
            : undefined,
      });

    const selectedReaderSources =
      selectReaderDecisionSources(
        input.question.topic,
      );

    const result =
      runDecisionEngine(
        input,
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

    const realitySignals =
      input.questionContext.reality.constraints
        .map(
          (constraint) =>
            constraint.signal,
        );

    const realityEvidence =
      result.evidence.filter(
        (evidence) =>
          evidence.key.startsWith(
            "reality-",
          ),
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

    const expectedRealityEvidenceKeys =
      fixture.expectedRealitySignals.map(
        (signal) =>
          `reality-financial-${signal}`,
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

    const explanationConditionLines =
      getContentLines(
        conditionsBlock?.content
        ?? "",
      );

    const explanationRiskLines =
      getContentLines(
        risksBlock?.content
        ?? "",
      );

    const evidenceSources = [
      ...new Set(
        result.evidence.map(
          (evidence) =>
            evidence.source,
        ),
      ),
    ];

    const checks = {
      humanContextWasReadFirst:
        input.question.humanContextReceived,

      questionContextWasBuilt:
        input.questionContext.question
        === input.question,

      topicMatched:
        result.topic
        === fixture.expectedTopic,

      intentMatched:
        result.intent
        === fixture.expectedIntent,

      decisionTargetMatched:
        result.decisionTarget
        === fixture.expectedDecisionTarget,

      readerSourcesMatched:
        arraysMatchExactly(
          selectedReaderSources,
          fixture.expectedReaderSources,
        ),

      selectedReaderEvidenceWasUsed:
        fixture.expectedReaderSources.every(
          (source) =>
            evidenceSources.includes(
              source,
            ),
        ),

      realitySignalsMatched:
        realitySignals.length
        === fixture.expectedRealitySignals.length
        && fixture.expectedRealitySignals.every(
          (signal) =>
            realitySignals.includes(
              signal,
            ),
        ),

      realityConstraintsStayExplicit:
        input.questionContext.reality.constraints
          .every(
            (constraint) =>
              constraint.explicit
              && constraint.evidence.length > 0,
          ),

      realityEvidenceReachedDecision:
        arraysMatchExactly(
          realityEvidenceKeys,
          expectedRealityEvidenceKeys,
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

      noRealityQuestionAddsNoRealityEvidence:
        fixture.expectedRealitySignals.length !== 0
        || realityEvidence.length === 0,

      explanationIncludesRealityEvidenceOnce:
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

      explanationDoesNotInventConditions:
        explanationConditionLines.every(
          (description) =>
            engineConditionDescriptions
              .includes(
                description,
              ),
        ),

      explanationDoesNotInventRisks:
        explanationRiskLines.every(
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

      promptIncludesConditionsOnce:
        !conditionsBlock?.required
        || countOccurrences(
          prompt.userPrompt,
          conditionsBlock.content,
        ) === 1,

      promptIncludesRisksOnce:
        !risksBlock?.required
        || countOccurrences(
          prompt.userPrompt,
          risksBlock.content,
        ) === 1,

      decisionUsesHumanContext:
        result.humanContextUsed,

      decisionUsesQuestionContext:
        result.questionContextUsed,

      decisionProducedCanonicalVerdict:
        [
          "recommended",
          "conditionallyRecommended",
          "wait",
          "notRecommended",
        ].includes(
          result.verdict,
        ),

      finalDecisionWasProduced:
        result.finalDecisionSentence
          .trim()
          .length > 0,

      finalDecisionReachesPromptOnce:
        countOccurrences(
          prompt.userPrompt,
          result.finalDecisionSentence,
        ) === 1,

      payloadPreservesDecision:
        payload.verdict
        === result.verdict
        && payload.finalDecision
        === result.finalDecisionSentence,

      engineDecisionStaysLocked:
        plan.engineDecisionLocked
        === true
        && plan.gptMayRejudge
        === false
        && payload.engineDecisionLocked
        === true
        && payload.gptMayRejudge
        === false,
    };

    return {
      name:
        fixture.name,

      questionText:
        fixture.questionText,

      actualTopic:
        result.topic,

      actualIntent:
        result.intent,

      actualDecisionTarget:
        result.decisionTarget,

      realitySignals,

      selectedReaderSources,

      verdict:
        result.verdict,

      actionReadiness:
        result.actionReadiness,

      realityEvidenceKeys,

      plan,

      payload,

      prompt,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  export function verifyWealthMoneyRealEstateE2E():
  WealthMoneyRealEstateE2EVerificationResult {
  const cases =
    WEALTH_MONEY_REAL_ESTATE_E2E_FIXTURES
      .map(
        verifyWealthMoneyRealEstateE2ECase,
      );

  /*
   * v3 핵심 개인화 검증.
   *
   * 같은 "투자" 질문이라도
   * 현실조건이 달라지면 실제 판단 경로의 결과가
   * 동일하게 고정되어서는 안 된다.
   *
   * 단,
   * 현실조건이 다르다고 반드시 verdict 자체가
   * 달라져야 하는 것은 아니다.
   *
   * 따라서 verdict,
   * actionReadiness,
   * realityEvidenceKeys 중
   * 하나 이상의 의미 있는 차이가 발생했는지를 검증한다.
   */
  const moneyInvestmentCases =
    cases.filter(
      (verificationCase) =>
        verificationCase.actualTopic
          === "money"
        && verificationCase.actualDecisionTarget
          === "invest",
    );

  const baselineCase =
    moneyInvestmentCases.find(
      (verificationCase) =>
        verificationCase.name
          === "money-surplus-funds-investment",
    );

  const debtCase =
    moneyInvestmentCases.find(
      (verificationCase) =>
        verificationCase.name
          === "money-debt-and-living-cost-investment",
    );

  const retirementCase =
    moneyInvestmentCases.find(
      (verificationCase) =>
        verificationCase.name
          === "money-retirement-funds-investment",
    );

  const combinedRealityCase =
    moneyInvestmentCases.find(
      (verificationCase) =>
        verificationCase.name
          === "money-combined-reality-investment",
    );

  const casesExistForPersonalization =
    Boolean(
      baselineCase
      && debtCase
      && retirementCase
      && combinedRealityCase,
    );

  function hasMeaningfulDecisionDifference(
    left:
      WealthMoneyRealEstateE2ECaseResult,
    right:
      WealthMoneyRealEstateE2ECaseResult,
  ): boolean {
    const verdictDiffers =
      left.verdict
      !== right.verdict;

    const actionReadinessDiffers =
      left.actionReadiness
      !== right.actionReadiness;

    const realityEvidenceDiffers =
      left.realityEvidenceKeys.join("|")
      !== right.realityEvidenceKeys.join("|");

    return (
      verdictDiffers
      || actionReadinessDiffers
      || realityEvidenceDiffers
    );
  }

  const personalizationChecks = {
    investmentPersonalizationCasesExist:
      casesExistForPersonalization,

    debtBurdenChangesDecisionPath:
      casesExistForPersonalization
      && hasMeaningfulDecisionDifference(
        baselineCase!,
        debtCase!,
      ),

    essentialFundsChangesDecisionPath:
      casesExistForPersonalization
      && hasMeaningfulDecisionDifference(
        baselineCase!,
        retirementCase!,
      ),

    combinedRealityChangesDecisionPath:
      casesExistForPersonalization
      && hasMeaningfulDecisionDifference(
        baselineCase!,
        combinedRealityCase!,
      ),

    combinedRealityPreservesItsSpecificEvidence:
      casesExistForPersonalization
      && combinedRealityCase!
        .realityEvidenceKeys
        .includes(
          "reality-financial-essentialFundsExposure",
        )
      && combinedRealityCase!
        .realityEvidenceKeys
        .includes(
          "reality-financial-liquidityConstraint",
        )
      && combinedRealityCase!
        .realityEvidenceKeys
        .includes(
          "reality-financial-assetConcentration",
        ),
  };

  const allCasesPassed =
    cases.every(
      (verificationCase) =>
        verificationCase.passed,
    );

  const personalizationPassed =
    Object.values(
      personalizationChecks,
    ).every(Boolean);

  return {
    cases,

    passed:
      allCasesPassed
      && personalizationPassed,
  };
}
