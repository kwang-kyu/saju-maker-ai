import {
    buildReaderDecisionConditions,
  } from "./readerDecisionConditionBuilder";
  import type {
    ReaderDecisionAssessment,
    ReaderDecisionAssessmentItem,
    ReaderDecisionConfidence,
    ReaderDecisionConstraintLevel,
    ReaderDecisionLevel,
    ReaderDecisionSupportLevel,
  } from "./readerDecisionAssessment";
  import type {
    DecisionCondition,
  } from "./decisionTypes";
  
  export type ReaderDecisionConditionVerificationResult = {
    cases: Array<{
      name: string;
  
      conditions:
        DecisionCondition[];
  
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
      conditions:
        DecisionCondition[],
    ) => Record<string, boolean>,
  ): ReaderDecisionConditionVerificationResult["cases"][number] {
    const conditions =
      buildReaderDecisionConditions(
        assessment,
      );
  
    const checks =
      checksBuilder(
        conditions,
      );
  
    return {
      name,
  
      conditions,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyHighConstraint():
    ReaderDecisionConditionVerificationResult["cases"][number] {
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
      "high-constraint-builds-credible-condition",
  
      assessment,
  
      (conditions) => ({
        oneConditionOnly:
          conditions.length === 1,
  
        capacityRiskIncluded:
          conditions.some(
            (condition) =>
              condition.key
              === "readerDecisionCondition-capacity-risk",
          ),
  
        lowConfidenceExcluded:
          !conditions.some(
            (condition) =>
              condition.key.includes(
                "money-debtHandling",
              ),
          ),
  
        limitationEvidenceIncluded:
          conditions.some(
            (condition) =>
              condition.description.includes(
                "위험 부담이 커질수록 유지력이 낮아질 수 있다.",
              ),
          ),
  
        capacityGuidanceIncluded:
          conditions.some(
            (condition) =>
              condition.description.includes(
                "실제로 감당할 수 있는 책임, 규모, 시간과 보완 수단",
              ),
          ),
  
        conditionRequired:
          conditions.every(
            (condition) =>
              condition.required
              && !condition.satisfied,
          ),
      }),
    );
  }
  
  function verifyConflictCondition():
    ReaderDecisionConditionVerificationResult["cases"][number] {
    const conflict =
      buildAssessmentItem(
        "relationship",
        "partnershipCooperation",
        "moderate",
        "high",
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
      "credible-conflict-builds-condition",
  
      assessment,
  
      (conditions) => ({
        oneConditionOnly:
          conditions.length === 1,
  
        relationshipConditionIncluded:
          conditions.some(
            (condition) =>
              condition.key
              === "readerDecisionCondition-relationship-partnershipCooperation",
          ),
  
        conflictDescriptionIncluded:
          conditions.some(
            (condition) =>
              condition.description.includes(
                "협업 근거와 충돌 근거가 함께 확인된다.",
              ),
          ),
  
        relationshipGuidanceIncluded:
          conditions.some(
            (condition) =>
              condition.description.includes(
                "역할, 책임, 권한, 경계와 갈등 조정 기준",
              ),
          ),
      }),
    );
  }
  
  function verifyDuplicatePrevention():
    ReaderDecisionConditionVerificationResult["cases"][number] {
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
      "duplicate-reader-area-is-removed",
  
      assessment,
  
      (conditions) => ({
        oneConditionOnly:
          conditions.length === 1,
  
        uniqueKey:
          conditions[0]?.key
          === "readerDecisionCondition-money-cashflowManagement",
      }),
    );
  }
  
  function verifyInsufficientAssessment():
    ReaderDecisionConditionVerificationResult["cases"][number] {
    const assessment =
      buildAssessment(
        "insufficient",
        "insufficient",
        [],
      );
  
    return buildCase(
      "insufficient-assessment-requires-evidence",
  
      assessment,
  
      (conditions) => ({
        oneConditionOnly:
          conditions.length === 1,
  
        evidenceConditionIncluded:
          conditions[0]?.key
          === "confirmReaderDecisionEvidence",
  
        evidenceDescriptionIncluded:
          conditions[0]?.description
            .includes(
              "감당력과 작동 방식의 근거가 충분하지 않으므로",
            )
          === true,
  
        conditionRequired:
          conditions[0]?.required
          === true,
  
        conditionUnsatisfied:
          conditions[0]?.satisfied
          === false,
      }),
    );
  }
  
  function verifyNoConstraint():
    ReaderDecisionConditionVerificationResult["cases"][number] {
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
      "support-does-not-create-condition",
  
      assessment,
  
      (conditions) => ({
        noConditions:
          conditions.length === 0,
      }),
    );
  }
  
  export function verifyReaderDecisionConditions():
    ReaderDecisionConditionVerificationResult {
    const cases = [
      verifyHighConstraint(),
  
      verifyConflictCondition(),
  
      verifyDuplicatePrevention(),
  
      verifyInsufficientAssessment(),
  
      verifyNoConstraint(),
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