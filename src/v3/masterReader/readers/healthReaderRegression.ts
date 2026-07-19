import {
    readHealth,
  } from "./healthReader";
  import type {
    HealthArea,
    HealthConfidence,
    HealthLevel,
    HealthResult,
  } from "../types/health";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  
  type HealthAreaRegressionSnapshot = {
    level: HealthLevel | null;
  
    confidence: HealthConfidence;
  
    evidenceCount: number;
  
    counterEvidenceCount: number;
  };
  
  type HealthReaderRegressionSnapshot = {
    vitalityStability:
      HealthAreaRegressionSnapshot;
  
    stressRegulation:
      HealthAreaRegressionSnapshot;
  
    fatigueManagement:
      HealthAreaRegressionSnapshot;
  
    recoveryCapacity:
      HealthAreaRegressionSnapshot;
  
    rhythmMaintenance:
      HealthAreaRegressionSnapshot;
  
    overloadTolerance:
      HealthAreaRegressionSnapshot;
  
    habitSelfManagement:
      HealthAreaRegressionSnapshot;
  
    imbalanceAdaptation:
      HealthAreaRegressionSnapshot;
  
    interpretationExists: boolean;
  
    corePattern: string | null;
  };
  
  export type HealthReaderRegressionResult = {
    id: string;
  
    description: string;
  
    actual:
      HealthReaderRegressionSnapshot;
  
    expected:
      HealthReaderRegressionSnapshot;
  
    comparison: {
      vitalityStabilityMatched: boolean;
  
      stressRegulationMatched: boolean;
  
      fatigueManagementMatched: boolean;
  
      recoveryCapacityMatched: boolean;
  
      rhythmMaintenanceMatched: boolean;
  
      overloadToleranceMatched: boolean;
  
      habitSelfManagementMatched: boolean;
  
      imbalanceAdaptationMatched: boolean;
  
      interpretationExistsMatched:
        boolean;
  
      corePatternMatched: boolean;
  
      passed: boolean;
    };
  
    passed: boolean;
  };
  
  const REGRESSION_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "자기 에너지와 외부 부담이 균형을 이루어 활력과 스트레스를 안정적으로 조절할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "일과 휴식의 범위를 명확히 구분할 것",
        ],
        exceptions: [
          "여러 부담을 동시에 장기간 떠안는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "balanced",
          score: 1,
          supportScore: 6,
          opposingScore: 5,
          monthCommandScore: 2,
          rootingScore: 2,
        },
      },
      {
        category: "rooting",
        description:
          "내부 기반과 버팀력이 있어 피로가 누적되어도 생활 리듬을 회복하고 유지할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "회복 시간을 규칙적으로 확보할 것",
        ],
        exceptions: [
          "휴식 없이 과부하를 반복하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 2,
          totalBranches: 4,
          rooted: true,
        },
      },
      {
        category: "tenGodStrength",
        description:
          "에너지 사용이 한쪽으로 치우치지 않아 스트레스와 피로를 분산하여 관리할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "활동과 휴식의 균형을 유지할 것",
        ],
        exceptions: [
          "특정 활동에 에너지를 과도하게 집중하는 경우",
        ],
        signal: {
          kind: "tenGodDominance",
          dominantTenGod: "정인",
          dominantCount: 2,
          totalCount: 8,
          counts: {
            비견: 1,
            겁재: 1,
            식신: 1,
            상관: 1,
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
          "환경적 지원과 생활 기반이 연결되어 일정한 리듬으로 활력과 회복을 유지할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "생활 시간을 일정하게 유지할 것",
        ],
        exceptions: [
          "수면과 휴식 리듬이 장기간 불규칙한 경우",
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
    HealthReaderRegressionSnapshot = {
      vitalityStability: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      stressRegulation: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      fatigueManagement: {
        level: "strong",
        confidence: "high",
        evidenceCount: 3,
        counterEvidenceCount: 0,
      },
  
      recoveryCapacity: {
        level: "strong",
        confidence: "high",
        evidenceCount: 3,
        counterEvidenceCount: 0,
      },
  
      rhythmMaintenance: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      overloadTolerance: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      habitSelfManagement: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      imbalanceAdaptation: {
        level: "strong",
        confidence: "high",
        evidenceCount: 3,
        counterEvidenceCount: 0,
      },
  
      interpretationExists: true,
  
      corePattern:
        "활력·스트레스·피로·회복·생활 리듬을 비교적 안정적으로 조정하며 활동 기반을 유지하는 구조이다.",
    };
  
  
    function buildAreaSnapshot(
        result: HealthResult,
        area: HealthArea,
      ): HealthAreaRegressionSnapshot {
        const judgement =
          result[area];
      
        return {
          level:
            judgement.level,
      
          confidence:
            judgement.confidence,
      
          evidenceCount:
            judgement.evidence.length,
      
          counterEvidenceCount:
            judgement.counterEvidence.length,
        };
      }
      
    function buildRegressionSnapshot(
    result: HealthResult,
  ): HealthReaderRegressionSnapshot {
    return {
      vitalityStability:
        buildAreaSnapshot(
          result,
          "vitalityStability",
        ),
  
      stressRegulation:
        buildAreaSnapshot(
          result,
          "stressRegulation",
        ),
  
      fatigueManagement:
        buildAreaSnapshot(
          result,
          "fatigueManagement",
        ),
  
      recoveryCapacity:
        buildAreaSnapshot(
          result,
          "recoveryCapacity",
        ),
  
      rhythmMaintenance:
        buildAreaSnapshot(
          result,
          "rhythmMaintenance",
        ),
  
      overloadTolerance:
        buildAreaSnapshot(
          result,
          "overloadTolerance",
        ),
  
      habitSelfManagement:
        buildAreaSnapshot(
          result,
          "habitSelfManagement",
        ),
  
      imbalanceAdaptation:
        buildAreaSnapshot(
          result,
          "imbalanceAdaptation",
        ),
  
      interpretationExists:
        result.interpretation !== null,
  
      corePattern:
        result.interpretation
          ?.corePattern
        ?? null,
    };
  }
  
  function areaMatches(
    actual: HealthAreaRegressionSnapshot,
    expected: HealthAreaRegressionSnapshot,
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
    actual: HealthReaderRegressionSnapshot,
    expected: HealthReaderRegressionSnapshot,
  ): HealthReaderRegressionResult[
    "comparison"
  ] {
    const comparison = {
      vitalityStabilityMatched:
        areaMatches(
          actual.vitalityStability,
          expected.vitalityStability,
        ),
  
      stressRegulationMatched:
        areaMatches(
          actual.stressRegulation,
          expected.stressRegulation,
        ),
  
      fatigueManagementMatched:
        areaMatches(
          actual.fatigueManagement,
          expected.fatigueManagement,
        ),
  
      recoveryCapacityMatched:
        areaMatches(
          actual.recoveryCapacity,
          expected.recoveryCapacity,
        ),
  
      rhythmMaintenanceMatched:
        areaMatches(
          actual.rhythmMaintenance,
          expected.rhythmMaintenance,
        ),
  
      overloadToleranceMatched:
        areaMatches(
          actual.overloadTolerance,
          expected.overloadTolerance,
        ),
  
      habitSelfManagementMatched:
        areaMatches(
          actual.habitSelfManagement,
          expected.habitSelfManagement,
        ),
  
      imbalanceAdaptationMatched:
        areaMatches(
          actual.imbalanceAdaptation,
          expected.imbalanceAdaptation,
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
  
  export function verifyHealthReaderRegression():
    HealthReaderRegressionResult {
    const result =
      readHealth(
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
        "stable-structured-health",
  
      description:
        "균형 일간·통근·분산 구조·월령 지원으로 구성된 HealthResult가 동일하게 유지되는지 검증한다.",
  
      actual,
  
      expected,
  
      comparison,
  
      passed:
        comparison.passed,
    };
  }