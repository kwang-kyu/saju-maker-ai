import {
    buildDecisionRealityEvidence,
  } from "./decisionRealityEvidenceBuilder";
  import type {
    DecisionRealityAssessment,
  } from "./decisionRealityAssessment";

  export type DecisionRealityEvidenceVerificationResult = {
    unusedRealityProducesNoEvidence: boolean;

    explicitConstraintsProduceEvidence: boolean;

    evidenceUsesCurrentContextSource: boolean;

    evidenceUsesStableRealityKey: boolean;

    duplicateConstraintsAreRemoved: boolean;

    explicitExpressionsAreNormalized: boolean;

    explicitEvidenceKeepsHighestWeight: boolean;

    passed: boolean;
  };

  function createRealityAssessment(
    overrides: Partial<DecisionRealityAssessment> = {},
  ): DecisionRealityAssessment {
    return {
      executionConstraint: "low",

      familyResponsibility: "low",

      financialPressure: "low",

      transitionDifficulty: "low",

      expansionRisk: "low",

      questionConstraints: [],

      questionRealityUsed: false,

      ...overrides,
    };
  }

  export function verifyDecisionRealityEvidence():
    DecisionRealityEvidenceVerificationResult {
    const unusedEvidence =
      buildDecisionRealityEvidence(
        createRealityAssessment(),
      );

    const explicitEvidence =
      buildDecisionRealityEvidence(
        createRealityAssessment({
          financialPressure: "high",

          questionRealityUsed: true,

          questionConstraints: [
            {
              area: "financial",

              signal: "debtBurden",

              description:
                "대출 부담이 투자 실행 여력을 제한하는 현실이 질문에 명시되어 있다.",

              evidence: [
                "대출이 많",
                " 대출이 많 ",
                "빚이 있",
              ],

              explicit: true,
            },

            {
              area: "financial",

              signal: "debtBurden",

              description:
                "동일한 부채 부담이 중복 추출되었다.",

              evidence: [
                "대출이 많",
              ],

              explicit: true,
            },

            {
              area: "financial",

              signal: "liquidityConstraint",

              description:
                "즉시 사용할 수 있는 현금이 부족한 현실이 질문에 명시되어 있다.",

              evidence: [
                "현금이 부족",
              ],

              explicit: true,
            },
          ],
        }),
      );

    const debtEvidence =
      explicitEvidence.find(
        (evidence) =>
          evidence.key
          === "reality-financial-debtBurden",
      );

    const liquidityEvidence =
      explicitEvidence.find(
        (evidence) =>
          evidence.key
          === "reality-financial-liquidityConstraint",
      );

    const unusedRealityProducesNoEvidence =
      unusedEvidence.length === 0;

    const explicitConstraintsProduceEvidence =
      debtEvidence !== undefined
      && liquidityEvidence !== undefined;

    const evidenceUsesCurrentContextSource =
      explicitEvidence.every(
        (evidence) =>
          evidence.source
          === "currentContext",
      );

    const evidenceUsesStableRealityKey =
      explicitEvidence.every(
        (evidence) =>
          evidence.key.startsWith(
            "reality-financial-",
          ),
      );

    const duplicateConstraintsAreRemoved =
      explicitEvidence.length === 2;

    const explicitExpressionsAreNormalized =
      debtEvidence !== undefined
      && debtEvidence.description.includes(
        "질문에서 확인된 표현: 대출이 많, 빚이 있",
      )
      && !debtEvidence.description.includes(
        "대출이 많, 대출이 많",
      );

    const explicitEvidenceKeepsHighestWeight =
      explicitEvidence.every(
        (evidence) =>
          evidence.weight === 5,
      );

    return {
      unusedRealityProducesNoEvidence,

      explicitConstraintsProduceEvidence,

      evidenceUsesCurrentContextSource,

      evidenceUsesStableRealityKey,

      duplicateConstraintsAreRemoved,

      explicitExpressionsAreNormalized,

      explicitEvidenceKeepsHighestWeight,

      passed:
        unusedRealityProducesNoEvidence
        && explicitConstraintsProduceEvidence
        && evidenceUsesCurrentContextSource
        && evidenceUsesStableRealityKey
        && duplicateConstraintsAreRemoved
        && explicitExpressionsAreNormalized
        && explicitEvidenceKeepsHighestWeight,
    };
  }
