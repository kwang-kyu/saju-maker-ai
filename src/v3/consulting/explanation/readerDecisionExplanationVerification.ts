import {
    runDecisionEngine,
  } from "../decision/decisionEngine.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "../decision/regression/decisionEngineRegressionFixture.js";
  import {
    readDecisionResult,
    type DecisionExplanationInput,
  } from "./decisionResultReader.js";
  import {
    buildReaderDecisionExplanation,
    type ReaderDecisionExplanation,
  } from "./readerDecisionExplanationBuilder.js";
  
  export type ReaderDecisionExplanationVerificationResult = {
    cases: Array<{
      name: string;
  
      explanation:
        ReaderDecisionExplanation;
  
      checks: Record<
        string,
        boolean
      >;
  
      passed: boolean;
    }>;
  
    passed: boolean;
  };
  
  function buildBaseInput():
    DecisionExplanationInput {
    const result =
      runDecisionEngine(
        buildDecisionEngineRegressionInput(),
      );
  
    return readDecisionResult(
      result,
    );
  }
  
  function buildCase(
    name: string,
    input:
      DecisionExplanationInput,
    checksBuilder: (
      explanation:
        ReaderDecisionExplanation,
    ) => Record<string, boolean>,
  ): ReaderDecisionExplanationVerificationResult["cases"][number] {
    const explanation =
      buildReaderDecisionExplanation(
        input,
      );
  
    const checks =
      checksBuilder(
        explanation,
      );
  
    return {
      name,
  
      explanation,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyWaitExplanation():
    ReaderDecisionExplanationVerificationResult["cases"][number] {
    const base =
      buildBaseInput();
  
    const conditionDescription =
      "위험 감당 범위를 먼저 확정해야 한다.";
  
    const riskDescription =
      "감당 범위를 넘으면 실행이 중단될 수 있다.";
  
    const input:
      DecisionExplanationInput = {
        ...base,
  
        verdict: "wait",
  
        conditions: [
          ...base.conditions,
  
          {
            key:
              "readerDecisionCondition-capacity-risk",
  
            description:
              conditionDescription,
  
            required: true,
  
            satisfied: false,
          },
        ],
  
        risks: [
          ...base.risks,
  
          {
            key:
              "readerDecisionRisk-capacity-risk",
  
            source: "capacity",
  
            description:
              riskDescription,
  
            severity: "high",
          },
        ],
      };
  
    return buildCase(
      "wait-explains-capacity-constraint",
  
      input,
  
      (explanation) => ({
        explanationRequired:
          explanation.required,
  
        capacitySourceIncluded:
          explanation.sources
            .includes(
              "capacity",
            ),
  
        waitEffectExplained:
          explanation.content
            .includes(
              "기다리는 판단",
            ),
  
        capacityLabelIncluded:
          explanation.content
            .includes(
              "감당력",
            ),
  
        conditionPreserved:
          explanation
            .conditionDescriptions
            .includes(
              conditionDescription,
            ),
  
        riskPreserved:
          explanation
            .riskDescriptions
            .includes(
              riskDescription,
            ),
  
        evidenceIsSufficient:
          !explanation
            .insufficientEvidence,
      }),
    );
  }
  
  function verifyConditionalExplanation():
    ReaderDecisionExplanationVerificationResult["cases"][number] {
    const base =
      buildBaseInput();
  
    const input:
      DecisionExplanationInput = {
        ...base,
  
        verdict:
          "conditionallyRecommended",
  
        conditions: [
          ...base.conditions,
  
          {
            key:
              "readerDecisionCondition-money-cashflowManagement",
  
            description:
              "현금흐름과 고정비를 먼저 확인해야 한다.",
  
            required: true,
  
            satisfied: false,
          },
        ],
  
        risks: [
          ...base.risks,
  
          {
            key:
              "readerDecisionRisk-career-performanceConversion",
  
            source: "career",
  
            description:
              "성과가 지속되지 않을 위험이 있다.",
  
            severity: "medium",
          },
        ],
      };
  
    return buildCase(
      "conditional-explains-multiple-reader-sources",
  
      input,
  
      (explanation) => ({
        explanationRequired:
          explanation.required,
  
        moneySourceIncluded:
          explanation.sources
            .includes(
              "money",
            ),
  
        careerSourceIncluded:
          explanation.sources
            .includes(
              "career",
            ),
  
        sourceCountIsExact:
          explanation.sources.length
          === 2,
  
        conditionalEffectExplained:
          explanation.content
            .includes(
              "조건을 갖춘 뒤 제한적으로 진행",
            ),
  
        moneyLabelIncluded:
          explanation.content
            .includes(
              "재물 구조",
            ),
  
        careerLabelIncluded:
          explanation.content
            .includes(
              "직업 구조",
            ),
      }),
    );
  }
  
  function verifyInsufficientExplanation():
    ReaderDecisionExplanationVerificationResult["cases"][number] {
    const base =
      buildBaseInput();
  
    const input:
      DecisionExplanationInput = {
        ...base,
  
        verdict:
          "insufficientEvidence",
  
        conditions: [
          ...base.conditions,
  
          {
            key:
              "confirmReaderDecisionEvidence",
  
            description:
              "관련 Reader 근거를 추가로 확인해야 한다.",
  
            required: true,
  
            satisfied: false,
          },
        ],
  
        risks: [
          ...base.risks,
  
          {
            key:
              "insufficientReaderDecisionEvidence",
  
            source:
              "questionIntent",
  
            description:
              "근거 부족 상태에서 결론을 내릴 위험이 있다.",
  
            severity: "medium",
          },
        ],
      };
  
    return buildCase(
      "insufficient-evidence-is-explained",
  
      input,
  
      (explanation) => ({
        explanationRequired:
          explanation.required,
  
        insufficientDetected:
          explanation
            .insufficientEvidence,
  
        noInventedReaderSource:
          explanation.sources
            .length === 0,
  
        insufficientEffectExplained:
          explanation.content
            .includes(
              "근거가 충분하지 않아",
            ),
  
        additionalInformationExplained:
          explanation.content
            .includes(
              "추가 확인",
            ),
      }),
    );
  }
  
  function verifyNotRecommendedExplanation():
    ReaderDecisionExplanationVerificationResult["cases"][number] {
    const base =
      buildBaseInput();
  
    const input:
      DecisionExplanationInput = {
        ...base,
  
        verdict:
          "notRecommended",
  
        risks: [
          ...base.risks,
  
          {
            key:
              "readerDecisionRisk-relationship-partnershipCooperation",
  
            source:
              "relationship",
  
            description:
              "역할과 책임이 불분명하면 신뢰가 손상될 수 있다.",
  
            severity: "high",
          },
        ],
      };
  
    return buildCase(
      "not-recommended-is-not-upgraded",
  
      input,
  
      (explanation) => ({
        explanationRequired:
          explanation.required,
  
        relationshipSourceIncluded:
          explanation.sources
            .includes(
              "relationship",
            ),
  
        relationshipLabelIncluded:
          explanation.content
            .includes(
              "관계 구조",
            ),
  
        noUpgradeExplained:
          explanation.content
            .includes(
              "기존 비권장 판단을 상향하지 않고",
            ),
      }),
    );
  }
  
  function verifyNoReaderEffect():
    ReaderDecisionExplanationVerificationResult["cases"][number] {
    const input =
      buildBaseInput();
  
    return buildCase(
      "no-reader-effect-does-not-create-block",
  
      input,
  
      (explanation) => ({
        explanationNotRequired:
          !explanation.required,
  
        contentIsEmpty:
          explanation.content === "",
  
        sourcesAreEmpty:
          explanation.sources
            .length === 0,
  
        conditionsAreEmpty:
          explanation
            .conditionDescriptions
            .length === 0,
  
        risksAreEmpty:
          explanation
            .riskDescriptions
            .length === 0,
  
        insufficientIsFalse:
          !explanation
            .insufficientEvidence,
      }),
    );
  }
  
  export function verifyReaderDecisionExplanation():
    ReaderDecisionExplanationVerificationResult {
    const cases = [
      verifyWaitExplanation(),
  
      verifyConditionalExplanation(),
  
      verifyInsufficientExplanation(),
  
      verifyNotRecommendedExplanation(),
  
      verifyNoReaderEffect(),
    ];
  
    return {
      cases,
  
      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }