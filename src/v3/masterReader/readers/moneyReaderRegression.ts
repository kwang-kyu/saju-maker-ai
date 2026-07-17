import type {
    MoneyArea,
    MoneyConfidence,
    MoneyLevel,
    MoneyResult,
  } from "../types/money";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    readMoney,
  } from "./moneyReader";
  
  export type MoneyAreaRegressionSnapshot = {
    level: MoneyLevel | null;
  
    confidence: MoneyConfidence;
  
    evidenceCount: number;
  
    counterEvidenceCount: number;
  };
  
  export type MoneyReaderRegressionSnapshot = {
    generation: MoneyAreaRegressionSnapshot;
  
    repeatability: MoneyAreaRegressionSnapshot;
  
    retention: MoneyAreaRegressionSnapshot;
  
    assetConversion: MoneyAreaRegressionSnapshot;
  
    cashflowManagement:
      MoneyAreaRegressionSnapshot;
  
    debtHandling: MoneyAreaRegressionSnapshot;
  
    volatilityResponse:
      MoneyAreaRegressionSnapshot;
  
    lossRecovery: MoneyAreaRegressionSnapshot;
  
    interpretationExists: boolean;
  
    corePattern: string | null;
  };
  
  export type MoneyReaderRegressionComparison = {
    generationMatched: boolean;
  
    repeatabilityMatched: boolean;
  
    retentionMatched: boolean;
  
    assetConversionMatched: boolean;
  
    cashflowManagementMatched: boolean;
  
    debtHandlingMatched: boolean;
  
    volatilityResponseMatched: boolean;
  
    lossRecoveryMatched: boolean;
  
    interpretationExistsMatched: boolean;
  
    corePatternMatched: boolean;
  
    passed: boolean;
  };
  
  export type MoneyReaderRegressionResult = {
    id: string;
  
    description: string;
  
    actual: MoneyReaderRegressionSnapshot;
  
    expected: MoneyReaderRegressionSnapshot;
  
    comparison: MoneyReaderRegressionComparison;
  
    passed: boolean;
  };
  
  const REGRESSION_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
  
        description:
          "자기 자원과 외부 요구가 균형을 이루는 구조이다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "자원 배분 기준을 유지할 것",
        ],
  
        exceptions: [
          "외부 책임이 동시에 증가하는 경우",
        ],
  
        signal: {
          kind: "dayMasterStrength",
  
          type: "balanced",
  
          score: 3,
  
          supportScore: 7,
  
          opposingScore: 5,
  
          monthCommandScore: 2,
  
          rootingScore: 2,
        },
      },
  
      {
        category: "rooting",
  
        description:
          "내부 기반이 두 곳에서 확인된다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "기반을 단계적으로 확대할 것",
        ],
  
        exceptions: [
          "회복 전에 부담을 추가하는 경우",
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
          "정재 중심의 현실 감각이 여러 기능에 분포한다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "수입과 비용 기준을 구분할 것",
        ],
  
        exceptions: [
          "하나의 기회에 자원을 집중하는 경우",
        ],
  
        signal: {
          kind: "tenGodDominance",
  
          dominantTenGod: "정재",
  
          dominantCount: 2,
  
          totalCount: 8,
  
          counts: {
            비견: 1,
            겁재: 1,
            식신: 1,
            상관: 1,
            정재: 2,
            정관: 1,
            정인: 1,
          },
  
          distributed: true,
        },
      },
  
      {
        category: "monthCommand",
  
        description:
          "환경의 지원을 받아 활동을 이어갈 수 있다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "단계별 점검 기준을 유지할 것",
        ],
  
        exceptions: [
          "검증 없이 속도만 높이는 경우",
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
    MoneyReaderRegressionSnapshot = {
      generation: {
        level: "strong",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      repeatability: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      retention: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      assetConversion: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      cashflowManagement: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      debtHandling: {
        level: "moderate",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      volatilityResponse: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      lossRecovery: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      interpretationExists: true,
  
      corePattern:
        "한 번의 큰 성과보다 반복 수익을 유지하고 이를 보유 자산으로 전환하면서 재물 규모를 키우는 구조이다.",
    };
  
  function buildAreaSnapshot(
    result: MoneyResult,
    area: MoneyArea,
  ): MoneyAreaRegressionSnapshot {
    const judgement = result[area];
  
    return {
      level: judgement.level,
  
      confidence: judgement.confidence,
  
      evidenceCount:
        judgement.evidence.length,
  
      counterEvidenceCount:
        judgement.counterEvidence.length,
    };
  }
  
  function buildRegressionSnapshot(
    result: MoneyResult,
  ): MoneyReaderRegressionSnapshot {
    return {
      generation:
        buildAreaSnapshot(
          result,
          "generation",
        ),
  
      repeatability:
        buildAreaSnapshot(
          result,
          "repeatability",
        ),
  
      retention:
        buildAreaSnapshot(
          result,
          "retention",
        ),
  
      assetConversion:
        buildAreaSnapshot(
          result,
          "assetConversion",
        ),
  
      cashflowManagement:
        buildAreaSnapshot(
          result,
          "cashflowManagement",
        ),
  
      debtHandling:
        buildAreaSnapshot(
          result,
          "debtHandling",
        ),
  
      volatilityResponse:
        buildAreaSnapshot(
          result,
          "volatilityResponse",
        ),
  
      lossRecovery:
        buildAreaSnapshot(
          result,
          "lossRecovery",
        ),
  
      interpretationExists:
        result.interpretation !== null,
  
      corePattern:
        result.interpretation?.corePattern
        ?? null,
    };
  }
  
  function areaSnapshotMatched(
    actual: MoneyAreaRegressionSnapshot,
    expected: MoneyAreaRegressionSnapshot,
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
    actual: MoneyReaderRegressionSnapshot,
    expected: MoneyReaderRegressionSnapshot,
  ): MoneyReaderRegressionComparison {
    const comparison = {
      generationMatched:
        areaSnapshotMatched(
          actual.generation,
          expected.generation,
        ),
  
      repeatabilityMatched:
        areaSnapshotMatched(
          actual.repeatability,
          expected.repeatability,
        ),
  
      retentionMatched:
        areaSnapshotMatched(
          actual.retention,
          expected.retention,
        ),
  
      assetConversionMatched:
        areaSnapshotMatched(
          actual.assetConversion,
          expected.assetConversion,
        ),
  
      cashflowManagementMatched:
        areaSnapshotMatched(
          actual.cashflowManagement,
          expected.cashflowManagement,
        ),
  
      debtHandlingMatched:
        areaSnapshotMatched(
          actual.debtHandling,
          expected.debtHandling,
        ),
  
      volatilityResponseMatched:
        areaSnapshotMatched(
          actual.volatilityResponse,
          expected.volatilityResponse,
        ),
  
      lossRecoveryMatched:
        areaSnapshotMatched(
          actual.lossRecovery,
          expected.lossRecovery,
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
  
  export function verifyMoneyReaderRegression():
    MoneyReaderRegressionResult {
    const result =
      readMoney(REGRESSION_STRUCTURE_FACTS);
  
    const actual =
      buildRegressionSnapshot(result);
  
    const expected =
      EXPECTED_REGRESSION_SNAPSHOT;
  
    const comparison =
      buildComparison(actual, expected);
  
    return {
      id: "stable-structured-money",
  
      description:
        "균형 일간·통근·정재 분포·월령 지원 구조의 MoneyResult가 동일하게 유지되는지 검증한다.",
  
      actual,
  
      expected,
  
      comparison,
  
      passed: comparison.passed,
    };
  }