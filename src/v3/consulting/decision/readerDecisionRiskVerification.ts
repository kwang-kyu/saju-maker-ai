import {
    buildReaderDecisionRisks,
  } from "./readerDecisionRiskBuilder";
  import type {
    ReaderDecisionAssessment,
    ReaderDecisionAssessmentItem,
    ReaderDecisionConfidence,
    ReaderDecisionConstraintLevel,
    ReaderDecisionLevel,
    ReaderDecisionSupportLevel,
  } from "./readerDecisionAssessment";
  import type {
    DecisionRisk,
  } from "./decisionTypes";
  
  export type ReaderDecisionRiskVerificationResult = {
    cases: Array<{
      name: string;
  
      risks:
        DecisionRisk[];
  
      checks: Record<
        string,
        boolean
      >;
  
      passed: boolean;
    }>;
  
    passed: boolean;
  };
  
  function buildAssessmentItem(
    source:
      ReaderDecisionAssessmentItem["source"],
    area: string,
    level:
      ReaderDecisionLevel | null,
    confidence:
      ReaderDecisionConfidence,
    conflictExists: boolean,
    limitationDescriptions:
      string[],
  ): ReaderDecisionAssessmentItem {
    return {
      source,
  
      area,
  
      level,
  
      confidence,
  
      evidenceCount:
        conflictExists
          ? 1
          : 0,
  
      counterEvidenceCount:
        limitationDescriptions.length,
  
      conflictExists,
  
      limitationDescriptions,
    };
  }
  
  function buildAssessment(
    constraintLevel:
      ReaderDecisionConstraintLevel,
    supportLevel:
      ReaderDecisionSupportLevel,
    limitations:
      ReaderDecisionAssessmentItem[],
  ): ReaderDecisionAssessment {
    const assessedItems =
      limitations.filter(
        (item) =>
          item.level !== null,
      );
  
    const strongItems =
      assessedItems.filter(
        (item) =>
          item.level === "strong",
      );
  
    const limitedItems =
      assessedItems.filter(
        (item) =>
          item.level === "limited",
      );
  
    const conflictedItems =
      assessedItems.filter(
        (item) =>
          item.conflictExists,
      );
  
    return {
      items: limitations,
  
      relevantJudgementCount:
        limitations.length,
  
      assessedJudgementCount:
        assessedItems.length,
  
      insufficientJudgementCount:
        limitations.length
        - assessedItems.length,
  
      strongCount:
        strongItems.length,
  
      limitedCount:
        limitedItems.length,
  
      conflictedCount:
        conflictedItems.length,
  
      highConfidenceStrongCount:
        strongItems.filter(
          (item) =>
            item.confidence === "high",
        ).length,
  
      highConfidenceLimitedCount:
        limitedItems.filter(
          (item) =>
            item.confidence === "high",
        ).length,
  
      highConfidenceConflictCount:
        conflictedItems.filter(
          (item) =>
            item.confidence === "high",
        ).length,
  
      constraintLevel,
  
      supportLevel,
  
      limitations,
    };
  }
  
  function buildCase(
    name: string,
    assessment:
      ReaderDecisionAssessment,
    checksBuilder: (
      risks:
        DecisionRisk[],
    ) => Record<string, boolean>,
  ): ReaderDecisionRiskVerificationResult["cases"][number] {
    const risks =
      buildReaderDecisionRisks(
        assessment,
      );
  
    const checks =
      checksBuilder(
        risks,
      );
  
    return {
      name,
  
      risks,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyHighConstraintRisk():
    ReaderDecisionRiskVerificationResult["cases"][number] {
    const credibleLimitation =
      buildAssessmentItem(
        "capacity",
        "risk",
        "limited",
        "high",
        false,
        [
          "위험 부담이 커질수록 유지력이 낮아질 수 있다.",
        ],
      );
  
    const lowConfidenceLimitation =
      buildAssessmentItem(
        "money",
        "debtHandling",
        "limited",
        "low",
        false,
        [
          "부채 감당 근거가 충분하지 않다.",
        ],
      );
  
    const assessment =
      buildAssessment(
        "high",
        "none",
        [
          credibleLimitation,
          lowConfidenceLimitation,
        ],
      );
  
    return buildCase(
      "high-confidence-limitation-builds-high-risk",
  
      assessment,
  
      (risks) => ({
        oneRiskOnly:
          risks.length === 1,
  
        capacityRiskIncluded:
          risks.some(
            (risk) =>
              risk.key
              === "readerDecisionRisk-capacity-risk",
          ),
  
        highSeverity:
          risks[0]?.severity
          === "high",
  
        capacitySource:
          risks[0]?.source
          === "capacity",
  
        lowConfidenceExcluded:
          !risks.some(
            (risk) =>
              risk.key.includes(
                "money-debtHandling",
              ),
          ),
  
        limitationEvidenceIncluded:
          risks.some(
            (risk) =>
              risk.description.includes(
                "위험 부담이 커질수록 유지력이 낮아질 수 있다.",
              ),
          ),
  
        consequenceIncluded:
          risks.some(
            (risk) =>
              risk.description.includes(
                "과부하와 실행 중단",
              ),
          ),
      }),
    );
  }
  
  function verifyModerateConflictRisk():
    ReaderDecisionRiskVerificationResult["cases"][number] {
    const conflict =
      buildAssessmentItem(
        "relationship",
        "partnershipCooperation",
        "moderate",
        "medium",
        true,
        [
          "협업 근거와 충돌 근거가 함께 확인된다.",
        ],
      );
  
    const assessment =
      buildAssessment(
        "moderate",
        "moderate",
        [
          conflict,
        ],
      );
  
    return buildCase(
      "medium-confidence-conflict-builds-medium-risk",
  
      assessment,
  
      (risks) => ({
        oneRiskOnly:
          risks.length === 1,
  
        relationshipRiskIncluded:
          risks.some(
            (risk) =>
              risk.key
              === "readerDecisionRisk-relationship-partnershipCooperation",
          ),
  
        mediumSeverity:
          risks[0]?.severity
          === "medium",
  
        relationshipSource:
          risks[0]?.source
          === "relationship",
  
        conflictDescriptionIncluded:
          risks.some(
            (risk) =>
              risk.description.includes(
                "협업 근거와 충돌 근거가 함께 확인된다.",
              ),
          ),
  
        consequenceIncluded:
          risks.some(
            (risk) =>
              risk.description.includes(
                "갈등과 신뢰 손상",
              ),
          ),
      }),
    );
  }
  
  function verifyDuplicatePrevention():
    ReaderDecisionRiskVerificationResult["cases"][number] {
    const first =
      buildAssessmentItem(
        "money",
        "cashflowManagement",
        "limited",
        "high",
        false,
        [
          "현금흐름 유지에 제한이 확인된다.",
        ],
      );
  
    const duplicate =
      buildAssessmentItem(
        "money",
        "cashflowManagement",
        "limited",
        "medium",
        false,
        [
          "추가적인 현금흐름 제한이 확인된다.",
        ],
      );
  
    const assessment =
      buildAssessment(
        "moderate",
        "none",
        [
          first,
          duplicate,
        ],
      );
  
    return buildCase(
      "duplicate-reader-area-risk-is-removed",
  
      assessment,
  
      (risks) => ({
        oneRiskOnly:
          risks.length === 1,
  
        uniqueKey:
          risks[0]?.key
          === "readerDecisionRisk-money-cashflowManagement",
  
        firstSeverityPreserved:
          risks[0]?.severity
          === "high",
      }),
    );
  }
  
  function verifyInsufficientAssessmentRisk():
    ReaderDecisionRiskVerificationResult["cases"][number] {
    const assessment =
      buildAssessment(
        "insufficient",
        "insufficient",
        [],
      );
  
    return buildCase(
      "insufficient-assessment-builds-risk",
  
      assessment,
  
      (risks) => ({
        oneRiskOnly:
          risks.length === 1,
  
        insufficientRiskIncluded:
          risks[0]?.key
          === "insufficientReaderDecisionEvidence",
  
        mediumSeverity:
          risks[0]?.severity
          === "medium",
  
        questionIntentSource:
          risks[0]?.source
          === "questionIntent",
  
        descriptionIncluded:
          risks[0]?.description
            .includes(
              "실제 제한을 확인하지 못한 채 책임과 위험을 떠안을 수 있다.",
            )
          === true,
      }),
    );
  }
  
  function verifyNoConstraintRisk():
    ReaderDecisionRiskVerificationResult["cases"][number] {
    const strongSupport =
      buildAssessmentItem(
        "career",
        "performanceConversion",
        "strong",
        "high",
        false,
        [],
      );
  
    const assessment =
      buildAssessment(
        "none",
        "strong",
        [
          strongSupport,
        ],
      );
  
    return buildCase(
      "support-does-not-create-risk",
  
      assessment,
  
      (risks) => ({
        noRisks:
          risks.length === 0,
      }),
    );
  }
  
  export function verifyReaderDecisionRisks():
    ReaderDecisionRiskVerificationResult {
    const cases = [
      verifyHighConstraintRisk(),
  
      verifyModerateConflictRisk(),
  
      verifyDuplicatePrevention(),
  
      verifyInsufficientAssessmentRisk(),
  
      verifyNoConstraintRisk(),
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