import type {
    RelationshipArea,
    RelationshipConfidence,
    RelationshipLevel,
    RelationshipResult,
  } from "../types/relationship";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    readRelationship,
  } from "./relationshipReader";
  
  export type RelationshipAreaRegressionSnapshot = {
    level: RelationshipLevel | null;
  
    confidence:
      RelationshipConfidence;
  
    evidenceCount: number;
  
    counterEvidenceCount: number;
  };
  
  export type RelationshipReaderRegressionSnapshot = {
    connectionExpansion:
      RelationshipAreaRegressionSnapshot;
  
    intimacyMaintenance:
      RelationshipAreaRegressionSnapshot;
  
    emotionalExchange:
      RelationshipAreaRegressionSnapshot;
  
    boundaryMaintenance:
      RelationshipAreaRegressionSnapshot;
  
    conflictAdjustment:
      RelationshipAreaRegressionSnapshot;
  
    trustRecovery:
      RelationshipAreaRegressionSnapshot;
  
    partnershipCooperation:
      RelationshipAreaRegressionSnapshot;
  
    spouseBonding:
      RelationshipAreaRegressionSnapshot;
  
    interpretationExists: boolean;
  
    corePattern: string | null;
  };
  
  export type RelationshipReaderRegressionComparison = {
    connectionExpansionMatched:
      boolean;
  
    intimacyMaintenanceMatched:
      boolean;
  
    emotionalExchangeMatched:
      boolean;
  
    boundaryMaintenanceMatched:
      boolean;
  
    conflictAdjustmentMatched:
      boolean;
  
    trustRecoveryMatched: boolean;
  
    partnershipCooperationMatched:
      boolean;
  
    spouseBondingMatched: boolean;
  
    interpretationExistsMatched:
      boolean;
  
    corePatternMatched: boolean;
  
    passed: boolean;
  };
  
  export type RelationshipReaderRegressionResult = {
    id: string;
  
    description: string;
  
    actual:
      RelationshipReaderRegressionSnapshot;
  
    expected:
      RelationshipReaderRegressionSnapshot;
  
    comparison:
      RelationshipReaderRegressionComparison;
  
    passed: boolean;
  };
  
  const REGRESSION_STRUCTURE_FACTS:
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
  
  const EXPECTED_REGRESSION_SNAPSHOT:
    RelationshipReaderRegressionSnapshot = {
      connectionExpansion: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      intimacyMaintenance: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 3,
  
        counterEvidenceCount: 0,
      },
  
      emotionalExchange: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      boundaryMaintenance: {
        level: "strong",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      conflictAdjustment: {
        level: "strong",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      trustRecovery: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      partnershipCooperation: {
        level: "moderate",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      spouseBonding: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      interpretationExists: true,
  
      corePattern:
    "관계 안에서 자기 기준을 지키면서 충돌의 쟁점과 책임을 조정하여 신뢰를 유지하는 구조이다.",
    };
  
  function buildAreaSnapshot(
    result: RelationshipResult,
    area: RelationshipArea,
  ): RelationshipAreaRegressionSnapshot {
    const judgement =
      result[area];
  
    return {
      level: judgement.level,
  
      confidence:
        judgement.confidence,
  
      evidenceCount:
        judgement.evidence.length,
  
      counterEvidenceCount:
        judgement.counterEvidence
          .length,
    };
  }
  
  function buildRegressionSnapshot(
    result: RelationshipResult,
  ): RelationshipReaderRegressionSnapshot {
    return {
      connectionExpansion:
        buildAreaSnapshot(
          result,
          "connectionExpansion",
        ),
  
      intimacyMaintenance:
        buildAreaSnapshot(
          result,
          "intimacyMaintenance",
        ),
  
      emotionalExchange:
        buildAreaSnapshot(
          result,
          "emotionalExchange",
        ),
  
      boundaryMaintenance:
        buildAreaSnapshot(
          result,
          "boundaryMaintenance",
        ),
  
      conflictAdjustment:
        buildAreaSnapshot(
          result,
          "conflictAdjustment",
        ),
  
      trustRecovery:
        buildAreaSnapshot(
          result,
          "trustRecovery",
        ),
  
      partnershipCooperation:
        buildAreaSnapshot(
          result,
          "partnershipCooperation",
        ),
  
      spouseBonding:
        buildAreaSnapshot(
          result,
          "spouseBonding",
        ),
  
      interpretationExists:
        result.interpretation
          !== null,
  
      corePattern:
        result.interpretation
          ?.corePattern
        ?? null,
    };
  }
  
  function areaSnapshotMatched(
    actual:
      RelationshipAreaRegressionSnapshot,
    expected:
      RelationshipAreaRegressionSnapshot,
  ): boolean {
    return (
      actual.level === expected.level
      && actual.confidence
        === expected.confidence
      && actual.evidenceCount
        === expected.evidenceCount
      && actual.counterEvidenceCount
        === expected.counterEvidenceCount
    );
  }
  
  function buildComparison(
    actual:
      RelationshipReaderRegressionSnapshot,
    expected:
      RelationshipReaderRegressionSnapshot,
  ): RelationshipReaderRegressionComparison {
    const comparison = {
      connectionExpansionMatched:
        areaSnapshotMatched(
          actual.connectionExpansion,
          expected.connectionExpansion,
        ),
  
      intimacyMaintenanceMatched:
        areaSnapshotMatched(
          actual.intimacyMaintenance,
          expected.intimacyMaintenance,
        ),
  
      emotionalExchangeMatched:
        areaSnapshotMatched(
          actual.emotionalExchange,
          expected.emotionalExchange,
        ),
  
      boundaryMaintenanceMatched:
        areaSnapshotMatched(
          actual.boundaryMaintenance,
          expected.boundaryMaintenance,
        ),
  
      conflictAdjustmentMatched:
        areaSnapshotMatched(
          actual.conflictAdjustment,
          expected.conflictAdjustment,
        ),
  
      trustRecoveryMatched:
        areaSnapshotMatched(
          actual.trustRecovery,
          expected.trustRecovery,
        ),
  
      partnershipCooperationMatched:
        areaSnapshotMatched(
          actual.partnershipCooperation,
          expected.partnershipCooperation,
        ),
  
      spouseBondingMatched:
        areaSnapshotMatched(
          actual.spouseBonding,
          expected.spouseBonding,
        ),
  
      interpretationExistsMatched:
        actual.interpretationExists
        === expected.interpretationExists,
  
      corePatternMatched:
        actual.corePattern
        === expected.corePattern,
    };
  
    return {
      ...comparison,
  
      passed:
        Object.values(comparison)
          .every(Boolean),
    };
  }
  
  export function verifyRelationshipReaderRegression():
    RelationshipReaderRegressionResult {
    const result =
      readRelationship(
        REGRESSION_STRUCTURE_FACTS,
      );
  
    const actual =
      buildRegressionSnapshot(
        result,
      );
  
    const expected =
      EXPECTED_REGRESSION_SNAPSHOT;
  
    const comparison =
      buildComparison(
        actual,
        expected,
      );
  
    return {
      id:
        "stable-structured-relationship",
  
      description:
        "균형 일간·통근·식상 분포·월령 지원으로 구성된 RelationshipResult가 동일하게 유지되는지 검증한다.",
  
      actual,
  
      expected,
  
      comparison,
  
      passed: comparison.passed,
    };
  }