import type {
    RelationshipJudgement,
    RelationshipResult,
  } from "../types/relationship";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    buildRelationshipExplanation,
  } from "./relationshipExplanationBuilder";
  import {
    readRelationship,
  } from "./relationshipReader";
  
  export type RelationshipReaderVerificationCase = {
    name: string;
  
    checks: Record<string, boolean>;
  
    passed: boolean;
  };
  
  export type RelationshipReaderVerificationResult = {
    cases:
      RelationshipReaderVerificationCase[];
  
    passed: boolean;
  };
  
  const STRONG_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "자기 요구와 상대 요구가 균형을 이루어 가까운 관계와 갈등을 안정적으로 조정할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "역할과 책임 범위를 명확히 할 것",
        ],
        exceptions: [
          "여러 사람의 감정과 책임을 동시에 떠안는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "balanced",
          score: 2,
          supportScore: 7,
          opposingScore: 5,
          monthCommandScore: 3,
          rootingScore: 3,
        },
      },
      {
        category: "rooting",
        description:
          "내부 기반과 버팀력이 있어 친밀감과 신뢰를 장기간 유지하고 관계를 회복할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "관계의 책임을 상호 분담할 것",
        ],
        exceptions: [
          "상대의 문제를 대신 책임지는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 3,
          totalBranches: 4,
          rooted: true,
        },
      },
      {
        category: "tenGodStrength",
        description:
          "식상의 표현력과 분산된 관계 기능을 통해 사람과 연결되고 감정을 교류할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "상대의 표현 방식도 함께 존중할 것",
        ],
        exceptions: [
          "자기 표현만 일방적으로 강조하는 경우",
        ],
        signal: {
          kind: "tenGodDominance",
          dominantTenGod: "식신",
          dominantCount: 3,
          totalCount: 8,
          counts: {
            비견: 1,
            식신: 3,
            정재: 1,
            정관: 1,
            정인: 2,
          },
          distributed: true,
        },
      },
      {
        category: "monthCommand",
        description:
          "환경의 지원을 받아 가까운 관계와 신뢰 회복을 안정적으로 이어갈 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "관계 회복에 필요한 시간을 확보할 것",
        ],
        exceptions: [
          "관계 변화를 지나치게 서두르는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "spring",
          supported: true,
          dayMasterElement: "wood",
        },
      },
    ];
  
  const LIMITED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "외부 감정과 관계 책임의 압력이 커지면 자기 경계와 갈등 조정력이 약해질 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "관계 책임의 범위를 제한할 것",
        ],
        exceptions: [
          "타인의 문제와 감정을 모두 떠안는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "weak",
          score: -6,
          supportScore: 2,
          opposingScore: 8,
          monthCommandScore: 0,
          rootingScore: 0,
        },
      },
      {
        category: "rooting",
        description:
          "관계 기반과 버팀력이 부족하여 친밀감 유지와 신뢰 회복이 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "관계의 속도와 책임을 작게 유지할 것",
        ],
        exceptions: [
          "준비 없이 관계 책임을 확대하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 0,
          totalBranches: 4,
          rooted: false,
        },
      },
      {
        category: "tenGodStrength",
        description:
          "비겁의 경쟁성과 집중된 관계 방식으로 주도권·갈등·이익 배분 충돌이 생길 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "역할과 이익 배분을 사전에 정할 것",
        ],
        exceptions: [
          "친분만으로 동업과 협력을 시작하는 경우",
        ],
        signal: {
          kind: "tenGodDominance",
          dominantTenGod: "겁재",
          dominantCount: 5,
          totalCount: 8,
          counts: {
            비견: 1,
            겁재: 5,
            식신: 1,
            정재: 1,
          },
          distributed: false,
        },
      },
      {
        category: "monthCommand",
        description:
          "환경 지원이 약하여 배우자 관계와 가까운 생활 책임을 안정적으로 유지하기 어려울 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "개인 공간과 생활 책임을 명확히 할 것",
        ],
        exceptions: [
          "관계 부담이 큰 환경에서 무리하게 버티는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "autumn",
          supported: false,
          dayMasterElement: "wood",
        },
      },
    ];
  
  const MIXED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "자기 기준과 상대 요구를 조정하여 관계 경계와 갈등을 안정적으로 관리할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "관계 책임을 명확히 할 것",
        ],
        exceptions: [
          "책임 범위를 지나치게 확대하는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "balanced",
          score: 3,
          supportScore: 7,
          opposingScore: 4,
          monthCommandScore: 2,
          rootingScore: 2,
        },
      },
      {
        category: "dayMasterStrength",
        description:
          "관계 압력이 커지면 자기 경계가 약해지고 갈등을 회피할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "감정과 책임을 분리할 것",
        ],
        exceptions: [
          "여러 관계의 문제를 동시에 떠안는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "weak",
          score: -5,
          supportScore: 2,
          opposingScore: 7,
          monthCommandScore: 0,
          rootingScore: 0,
        },
      },
      {
        category: "rooting",
        description:
          "일정한 관계 기반이 있어 친밀감과 신뢰를 회복할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기존 신뢰 기반을 활용할 것",
        ],
        exceptions: [
          "회복 전에 관계 부담을 추가하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 2,
          totalBranches: 4,
          rooted: true,
        },
      },
      {
        category: "rooting",
        description:
          "새로운 관계에서는 기반이 약해 친밀감 유지와 신뢰 회복이 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "신뢰를 단계적으로 확인할 것",
        ],
        exceptions: [
          "기반 없이 관계를 빠르게 확대하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 0,
          totalBranches: 4,
          rooted: false,
        },
      },
    ];
  
  function getJudgements(
    result: RelationshipResult,
  ): RelationshipJudgement[] {
    return [
      result.connectionExpansion,
      result.intimacyMaintenance,
      result.emotionalExchange,
      result.boundaryMaintenance,
      result.conflictAdjustment,
      result.trustRecovery,
      result.partnershipCooperation,
      result.spouseBonding,
    ];
  }
  
  function buildCase(
    name: string,
    checks: Record<string, boolean>,
  ): RelationshipReaderVerificationCase {
    return {
      name,
      checks,
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyStrongStructure():
    RelationshipReaderVerificationCase {
    const result =
      readRelationship(
        STRONG_STRUCTURE_FACTS,
      );
  
    const explanation =
      buildRelationshipExplanation(
        result,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanationAreas = [
      explanation.connectionExpansion,
      explanation.intimacyMaintenance,
      explanation.emotionalExchange,
      explanation.boundaryMaintenance,
      explanation.conflictAdjustment,
      explanation.trustRecovery,
      explanation.partnershipCooperation,
      explanation.spouseBonding,
    ];
  
    return buildCase(
      "strong-structured-relationship",
      {
        allAreasExist:
          judgements.length === 8,
  
        strongAreaExists:
          judgements.some(
            (judgement) =>
              judgement.level
                === "strong",
          ),
  
        interpretationExists:
          result.interpretation
            !== null,
  
        supportingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.evidence
                .length > 0,
          ),
  
        confidenceIsNotAllLow:
          judgements.some(
            (judgement) =>
              judgement.confidence
                !== "low",
          ),
  
        explanationExists:
          explanation.summary
            .trim()
            .length > 0,
  
        explanationPreservesLevels:
          explanationAreas.every(
            (area, index) =>
              area.level
                === judgements[index]
                  ?.level,
          ),
      },
    );
  }
  
  function verifyLimitedStructure():
    RelationshipReaderVerificationCase {
    const result =
      readRelationship(
        LIMITED_STRUCTURE_FACTS,
      );
  
    const explanation =
      buildRelationshipExplanation(
        result,
      );
  
    const judgements =
      getJudgements(result);
  
    const limitedJudgements =
      judgements.filter(
        (judgement) =>
          judgement.level
            === "limited",
      );
  
    return buildCase(
      "limited-relationship-pressure",
      {
        allAreasExist:
          judgements.length === 8,
  
        limitedAreaExists:
          limitedJudgements.length > 0,
  
        limitingEvidenceExists:
          limitedJudgements.some(
            (judgement) =>
              judgement.counterEvidence
                .length > 0,
          ),
  
        limitedInterpretationExists:
          limitedJudgements.some(
            (judgement) =>
              judgement.interpretation
                !== null,
          ),
  
        explanationPreservesLimitedLevel:
          [
            explanation.connectionExpansion,
            explanation.intimacyMaintenance,
            explanation.emotionalExchange,
            explanation.boundaryMaintenance,
            explanation.conflictAdjustment,
            explanation.trustRecovery,
            explanation.partnershipCooperation,
            explanation.spouseBonding,
          ].some(
            (area) =>
              area.level === "limited",
          ),
  
        explanationRisksExist:
          explanation.risks.length > 0,
      },
    );
  }
  
  function verifyMixedStructure():
    RelationshipReaderVerificationCase {
    const result =
      readRelationship(
        MIXED_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const conflictingJudgements =
      judgements.filter(
        (judgement) =>
          judgement.evidence.length > 0
          && judgement.counterEvidence
            .length > 0,
      );
  
    return buildCase(
      "mixed-relationship-structure",
      {
        allAreasExist:
          judgements.length === 8,
  
        supportingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.evidence
                .length > 0,
          ),
  
        limitingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.counterEvidence
                .length > 0,
          ),
  
        conflictExists:
          conflictingJudgements.length
            > 0,
  
        conflictDoesNotProduceHighConfidence:
          conflictingJudgements.some(
            (judgement) =>
              judgement.confidence
                !== "high",
          ),
  
        interpretationExists:
          result.interpretation
            !== null,
      },
    );
  }
  
  function verifyInsufficientStructure():
    RelationshipReaderVerificationCase {
    const result =
      readRelationship([]);
  
    const explanation =
      buildRelationshipExplanation(
        result,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanationAreas = [
      explanation.connectionExpansion,
      explanation.intimacyMaintenance,
      explanation.emotionalExchange,
      explanation.boundaryMaintenance,
      explanation.conflictAdjustment,
      explanation.trustRecovery,
      explanation.partnershipCooperation,
      explanation.spouseBonding,
    ];
  
    return buildCase(
      "insufficient-relationship-evidence",
      {
        allAreasExist:
          judgements.length === 8,
  
        allLevelsAreNull:
          judgements.every(
            (judgement) =>
              judgement.level === null,
          ),
  
        allInterpretationsAreNull:
          judgements.every(
            (judgement) =>
              judgement.interpretation
                === null,
          ),
  
        allConfidenceIsLow:
          judgements.every(
            (judgement) =>
              judgement.confidence
                === "low",
          ),
  
        resultInterpretationIsNull:
          result.interpretation === null,
  
        explanationUsesPendingLabel:
          explanationAreas.every(
            (area) =>
              area.levelLabel
                === "판단 보류",
          ),
  
        explanationPreservesNull:
          explanationAreas.every(
            (area) =>
              area.level === null,
          ),
      },
    );
  }
  
  export function verifyRelationshipReader():
    RelationshipReaderVerificationResult {
    const cases = [
      verifyStrongStructure(),
      verifyLimitedStructure(),
      verifyMixedStructure(),
      verifyInsufficientStructure(),
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