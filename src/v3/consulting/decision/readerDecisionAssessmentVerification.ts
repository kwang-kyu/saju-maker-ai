import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";
  import {
    assessReaderDecision,
    type ReaderDecisionAssessment,
  } from "./readerDecisionAssessment";
  import type {
    DecisionEngineInput,
  } from "./decisionTypes";

  export type ReaderDecisionAssessmentVerificationResult = {
    cases: Array<{
      name: string;

      checks: Record<
        string,
        boolean
      >;

      assessment:
        ReaderDecisionAssessment;

      passed: boolean;
    }>;

    passed: boolean;
  };

  function buildBusinessInput():
    DecisionEngineInput {
    const input =
      buildDecisionEngineRegressionInput();

    return {
      ...input,

      question: {
        ...input.question,

        topic: "business",
      },
    };
  }

  function buildHighConstraintInput():
    DecisionEngineInput {
    const input =
      buildBusinessInput();

    const identity =
      input.humanContext.identity;

    const profile =
      identity.profile;

    const capacity =
      profile.capacity;

    return {
      ...input,

      humanContext: {
        ...input.humanContext,

        identity: {
          ...identity,

          profile: {
            ...profile,

            capacity: {
              ...capacity,

              risk: {
                ...capacity.risk,

                level: "limited",

                confidence: "high",

                evidence: [],

                counterEvidence: [
                  ...capacity
                    .risk
                    .evidence,
                ],
              },

              time: {
                ...capacity.time,

                level: "limited",

                confidence: "high",

                evidence: [],

                counterEvidence: [
                  ...capacity
                    .time
                    .evidence,
                ],
              },
            },
          },
        },
      },
    };
  }

  function buildConflictInput():
    DecisionEngineInput {
    const input =
      buildBusinessInput();

    const identity =
      input.humanContext.identity;

    const profile =
      identity.profile;

    const capacity =
      profile.capacity;

    return {
      ...input,

      humanContext: {
        ...input.humanContext,

        identity: {
          ...identity,

          profile: {
            ...profile,

            capacity: {
              ...capacity,

              risk: {
                ...capacity.risk,

                level: "moderate",

                confidence: "high",

                counterEvidence: [
                  ...capacity
                    .risk
                    .evidence,
                ],
              },
            },
          },
        },
      },
    };
  }

  function buildInsufficientInput():
  DecisionEngineInput {
  const input =
    buildDecisionEngineRegressionInput();

  const identity =
    input.humanContext.identity;

  const profile =
    identity.profile;

  const relationship =
    profile.relationship;

  const blessing =
    profile.blessing;

  const destiny =
    profile.destiny;

  return {
    ...input,

    question: {
      ...input.question,

      topic: "love",
    },

    humanContext: {
      ...input.humanContext,

      identity: {
        ...identity,

        profile: {
          ...profile,

          relationship: {
            ...relationship,

            connectionExpansion: {
              ...relationship
                .connectionExpansion,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            intimacyMaintenance: {
              ...relationship
                .intimacyMaintenance,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            emotionalExchange: {
              ...relationship
                .emotionalExchange,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            boundaryMaintenance: {
              ...relationship
                .boundaryMaintenance,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            conflictAdjustment: {
              ...relationship
                .conflictAdjustment,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            trustRecovery: {
              ...relationship
                .trustRecovery,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },
          },

          blessing: {
            ...blessing,

            relationshipSupport: {
              ...blessing
                .relationshipSupport,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            blessingRetention: {
              ...blessing
                .blessingRetention,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            blessingCirculation: {
              ...blessing
                .blessingCirculation,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },
          },

          destiny: {
            ...destiny,

            choiceAlignment: {
              ...destiny
                .choiceAlignment,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },

            longTermCoherence: {
              ...destiny
                .longTermCoherence,

              level: null,

              interpretation: null,

              confidence: "low",

              evidence: [],

              counterEvidence: [],

              exceptionConditions: [],
            },
          },
        },
      },
    },
  };
}
  function hasItem(
    assessment:
      ReaderDecisionAssessment,
    source:
      ReaderDecisionAssessment["items"][number]["source"],
    area: string,
  ): boolean {
    return assessment.items.some(
      (item) =>
        item.source === source
        && item.area === area,
    );
  }

  function buildCase(
    name: string,
    assessment:
      ReaderDecisionAssessment,
    checks: Record<
      string,
      boolean
    >,
  ): ReaderDecisionAssessmentVerificationResult["cases"][number] {
    return {
      name,

      checks,

      assessment,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  function verifyBusinessSelection():
    ReaderDecisionAssessmentVerificationResult["cases"][number] {
    const assessment =
      assessReaderDecision(
        buildBusinessInput(),
      );

    return buildCase(
      "business-relevant-reader-areas",

      assessment,

      {
        relevantCountIsExact:
          assessment
            .relevantJudgementCount
          === 28,

        capacityRiskIncluded:
          hasItem(
            assessment,
            "capacity",
            "risk",
          ),

        moneyCashflowIncluded:
          hasItem(
            assessment,
            "money",
            "cashflowManagement",
          ),

        careerPerformanceIncluded:
          hasItem(
            assessment,
            "career",
            "performanceConversion",
          ),

        partnershipIncluded:
          hasItem(
            assessment,
            "relationship",
            "partnershipCooperation",
          ),

        destinyChoiceIncluded:
          hasItem(
            assessment,
            "destiny",
            "choiceAlignment",
          ),

        emotionalExchangeExcluded:
          !hasItem(
            assessment,
            "relationship",
            "emotionalExchange",
          ),

        blessingExcluded:
          !assessment.items.some(
            (item) =>
              item.source
                === "blessing",
          ),

        healthExcluded:
          !assessment.items.some(
            (item) =>
              item.source
                === "health",
          ),
      },
    );
  }

  function verifyHighConstraint():
    ReaderDecisionAssessmentVerificationResult["cases"][number] {
    const assessment =
      assessReaderDecision(
        buildHighConstraintInput(),
      );

    return buildCase(
      "high-confidence-limited-constraint",

      assessment,

      {
        highConstraint:
          assessment
            .constraintLevel
          === "high",

        limitedCountExists:
          assessment
            .limitedCount
          >= 2,

        highConfidenceLimitedCount:
          assessment
            .highConfidenceLimitedCount
          >= 2,

        capacityRiskLimited:
          assessment.items.some(
            (item) =>
              item.source
                === "capacity"
              && item.area === "risk"
              && item.level
                === "limited"
              && item.confidence
                === "high",
          ),

        capacityTimeLimited:
          assessment.items.some(
            (item) =>
              item.source
                === "capacity"
              && item.area === "time"
              && item.level
                === "limited"
              && item.confidence
                === "high",
          ),

        limitationsExist:
          assessment
            .limitations
            .length >= 2,

        conditionDescriptionsExist:
        assessment
          .limitations
          .some(
            (item) =>
              item.conditionDescriptions
                .length > 0,
          ),
      limitationsAndConditionsAreSeparated:
        assessment
          .limitations
          .every(
            (item) =>
              item.conditionDescriptions
                .every(
                  (condition) =>
                    !item
                      .limitationDescriptions
                      .includes(
                        condition,
                      ),
                ),
          ),
      },
    );
  }

  function verifyConflict():
    ReaderDecisionAssessmentVerificationResult["cases"][number] {
    const assessment =
      assessReaderDecision(
        buildConflictInput(),
      );

    return buildCase(
      "support-limit-conflict",

      assessment,

      {
        moderateConstraint:
          assessment
            .constraintLevel
          === "moderate",

        conflictExists:
          assessment
            .conflictedCount
          >= 1,

        highConfidenceConflictExists:
          assessment
            .highConfidenceConflictCount
          >= 1,

        riskAreaConflictExists:
          assessment.items.some(
            (item) =>
              item.source
                === "capacity"
              && item.area === "risk"
              && item.conflictExists,
          ),

        limitationCaptured:
          assessment
            .limitations
            .some(
              (item) =>
                item.source
                  === "capacity"
                && item.area
                  === "risk",
            ),
      },
    );
  }

  function verifyInsufficient():
    ReaderDecisionAssessmentVerificationResult["cases"][number] {
    const assessment =
      assessReaderDecision(
        buildInsufficientInput(),
      );

    return buildCase(
      "insufficient-relevant-reader-evidence",

      assessment,

      {
        relevantCountIsExact:
          assessment
            .relevantJudgementCount
          === 11,

        noAssessedJudgements:
          assessment
            .assessedJudgementCount
          === 0,

        allJudgementsInsufficient:
          assessment
            .insufficientJudgementCount
          === 11,

        constraintIsInsufficient:
          assessment
            .constraintLevel
          === "insufficient",

        supportIsInsufficient:
          assessment
            .supportLevel
          === "insufficient",

        noLimitations:
          assessment
            .limitations
            .length === 0,
      },
    );
  }

  export function verifyReaderDecisionAssessment():
    ReaderDecisionAssessmentVerificationResult {
    const cases = [
      verifyBusinessSelection(),

      verifyHighConstraint(),

      verifyConflict(),

      verifyInsufficient(),
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