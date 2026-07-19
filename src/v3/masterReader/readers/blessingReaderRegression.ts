import {
    readBlessing,
  } from "./blessingReader";
  import type {
    BlessingArea,
    BlessingConfidence,
    BlessingLevel,
    BlessingResult,
  } from "../types/blessing";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  
  type BlessingAreaRegressionSnapshot = {
    level: BlessingLevel | null;
  
    confidence: BlessingConfidence;
  
    evidenceCount: number;
  
    counterEvidenceCount: number;
  };
  
  type BlessingReaderRegressionSnapshot = {
    opportunityReception:
      BlessingAreaRegressionSnapshot;
  
    benefactorConnection:
      BlessingAreaRegressionSnapshot;
  
    relationshipSupport:
      BlessingAreaRegressionSnapshot;
  
    resourceSupport:
      BlessingAreaRegressionSnapshot;
  
    environmentSupport:
      BlessingAreaRegressionSnapshot;
  
    crisisProtection:
      BlessingAreaRegressionSnapshot;
  
    blessingRetention:
      BlessingAreaRegressionSnapshot;
  
    blessingCirculation:
      BlessingAreaRegressionSnapshot;
  
    interpretationExists: boolean;
  
    corePattern: string | null;
  };
  
  export type BlessingReaderRegressionResult = {
    id: string;
  
    description: string;
  
    actual:
      BlessingReaderRegressionSnapshot;
  
    expected:
      BlessingReaderRegressionSnapshot;
  
    comparison: {
      opportunityReceptionMatched:
        boolean;
  
      benefactorConnectionMatched:
        boolean;
  
      relationshipSupportMatched:
        boolean;
  
      resourceSupportMatched:
        boolean;
  
      environmentSupportMatched:
        boolean;
  
      crisisProtectionMatched:
        boolean;
  
      blessingRetentionMatched:
        boolean;
  
      blessingCirculationMatched:
        boolean;
  
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
          "자기 힘과 외부 조건이 균형을 이루어 외부의 변화를 받아들일 수 있는 상태이다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "감당 범위를 확인한 뒤 외부 변화를 받아들일 것",
        ],
        exceptions: [
          "여러 변화가 동시에 집중되는 경우",
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
          "내부 버팀이 형성되어 외부 변화가 생겨도 자기 상태를 안정적으로 보존할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기존의 안정 구조를 지속적으로 관리할 것",
        ],
        exceptions: [
          "내부 여력을 넘어서는 부담이 장기간 계속되는 경우",
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
          "십성 배치가 분산되어 있으며 인성의 작용이 상대적으로 분명하게 드러난다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "여러 작용의 역할과 범위를 구분할 것",
        ],
        exceptions: [
          "특정 작용에 책임이 과도하게 집중되는 경우",
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
          "계절 조건이 일간에 우호적으로 작용하여 외부 조건과의 결합이 가능하다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "우호적인 외부 조건을 구체적으로 확인할 것",
        ],
        exceptions: [
          "계절 조건과 현실 조건이 서로 다르게 작용하는 경우",
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
    BlessingReaderRegressionSnapshot = {
      opportunityReception: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      benefactorConnection: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      relationshipSupport: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      resourceSupport: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      environmentSupport: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      crisisProtection: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      blessingRetention: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      blessingCirculation: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      interpretationExists: true,
  
      corePattern:
        "복은 한 번의 우연보다 사람·자원·환경과의 연결을 통해 조건부로 들어오고 유지되는 구조이다.",
    };
  
  function buildAreaSnapshot(
    result: BlessingResult,
    area: BlessingArea,
  ): BlessingAreaRegressionSnapshot {
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
    result: BlessingResult,
  ): BlessingReaderRegressionSnapshot {
    return {
      opportunityReception:
        buildAreaSnapshot(
          result,
          "opportunityReception",
        ),
  
      benefactorConnection:
        buildAreaSnapshot(
          result,
          "benefactorConnection",
        ),
  
      relationshipSupport:
        buildAreaSnapshot(
          result,
          "relationshipSupport",
        ),
  
      resourceSupport:
        buildAreaSnapshot(
          result,
          "resourceSupport",
        ),
  
      environmentSupport:
        buildAreaSnapshot(
          result,
          "environmentSupport",
        ),
  
      crisisProtection:
        buildAreaSnapshot(
          result,
          "crisisProtection",
        ),
  
      blessingRetention:
        buildAreaSnapshot(
          result,
          "blessingRetention",
        ),
  
      blessingCirculation:
        buildAreaSnapshot(
          result,
          "blessingCirculation",
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
    actual: BlessingAreaRegressionSnapshot,
    expected: BlessingAreaRegressionSnapshot,
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
    actual: BlessingReaderRegressionSnapshot,
    expected: BlessingReaderRegressionSnapshot,
  ): BlessingReaderRegressionResult[
    "comparison"
  ] {
    const comparison = {
      opportunityReceptionMatched:
        areaMatches(
          actual.opportunityReception,
          expected.opportunityReception,
        ),
  
      benefactorConnectionMatched:
        areaMatches(
          actual.benefactorConnection,
          expected.benefactorConnection,
        ),
  
      relationshipSupportMatched:
        areaMatches(
          actual.relationshipSupport,
          expected.relationshipSupport,
        ),
  
      resourceSupportMatched:
        areaMatches(
          actual.resourceSupport,
          expected.resourceSupport,
        ),
  
      environmentSupportMatched:
        areaMatches(
          actual.environmentSupport,
          expected.environmentSupport,
        ),
  
      crisisProtectionMatched:
        areaMatches(
          actual.crisisProtection,
          expected.crisisProtection,
        ),
  
      blessingRetentionMatched:
        areaMatches(
          actual.blessingRetention,
          expected.blessingRetention,
        ),
  
      blessingCirculationMatched:
        areaMatches(
          actual.blessingCirculation,
          expected.blessingCirculation,
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
  
  export function verifyBlessingReaderRegression():
    BlessingReaderRegressionResult {
    const result =
      readBlessing(
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
        "stable-structured-blessing",
  
      description:
        "균형 일간·통근·분산 인성 구조·월령 지원으로 구성된 BlessingResult의 8개 판단 영역과 corePattern이 동일하게 유지되는지 검증한다.",
  
      actual,
  
      expected,
  
      comparison,
  
      passed:
        comparison.passed,
    };
  }