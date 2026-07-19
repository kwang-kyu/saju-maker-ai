import {
    readDestiny,
  } from "./destinyReader";
  import type {
    DestinyArea,
    DestinyConfidence,
    DestinyLevel,
    DestinyResult,
  } from "../types/destiny";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  
  type DestinyAreaRegressionSnapshot = {
    level: DestinyLevel | null;
  
    confidence: DestinyConfidence;
  
    evidenceCount: number;
  
    counterEvidenceCount: number;
  };
  
  type DestinyReaderRegressionSnapshot = {
    lifeDirection:
      DestinyAreaRegressionSnapshot;
  
    coreLifeTask:
      DestinyAreaRegressionSnapshot;
  
    strengthFulfillment:
      DestinyAreaRegressionSnapshot;
  
    growthPath:
      DestinyAreaRegressionSnapshot;
  
    choiceAlignment:
      DestinyAreaRegressionSnapshot;
  
    changeIntegration:
      DestinyAreaRegressionSnapshot;
  
    contributionPattern:
      DestinyAreaRegressionSnapshot;
  
    longTermCoherence:
      DestinyAreaRegressionSnapshot;
  
    interpretationExists: boolean;
  
    corePattern: string | null;
  };
  
  export type DestinyReaderRegressionResult = {
    id: string;
  
    description: string;
  
    actual:
      DestinyReaderRegressionSnapshot;
  
    expected:
      DestinyReaderRegressionSnapshot;
  
    comparison: {
      lifeDirectionMatched: boolean;
  
      coreLifeTaskMatched: boolean;
  
      strengthFulfillmentMatched:
        boolean;
  
      growthPathMatched: boolean;
  
      choiceAlignmentMatched: boolean;
  
      changeIntegrationMatched:
        boolean;
  
      contributionPatternMatched:
        boolean;
  
      longTermCoherenceMatched:
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
          "자기 힘과 외부 조건이 균형을 이루어 삶의 방향과 선택 기준을 현실적으로 조율할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "가능성과 감당 범위를 함께 확인할 것",
        ],
        exceptions: [
          "여러 외부 요구가 동시에 집중되는 경우",
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
          "내부 기반과 버팀력이 있어 경험과 성과를 축적하고 변화 이후에도 장기 방향을 유지할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기존 경험을 다음 역할과 환경에 연결할 것",
        ],
        exceptions: [
          "축적한 기반을 한 번에 포기하고 방향을 바꾸는 경우",
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
          "분산된 인성 구조가 여러 관점에서 과제를 이해하고 경험을 지식과 가치로 전환하게 한다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "지식과 경험을 현실적인 역할로 연결할 것",
        ],
        exceptions: [
          "이해와 준비에 머물러 실제 역할로 전환하지 않는 경우",
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
          "환경적 지원이 자기 성장 방식과 연결되어 경험과 방향을 장기적인 기반으로 발전시킬 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "환경의 지원을 자기 성장 기반으로 전환할 것",
        ],
        exceptions: [
          "환경의 지원에만 의존하여 자기 기준을 만들지 않는 경우",
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
    DestinyReaderRegressionSnapshot = {
      lifeDirection: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      coreLifeTask: {
        level: "moderate",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      strengthFulfillment: {
        level: "moderate",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      growthPath: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      choiceAlignment: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      changeIntegration: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      contributionPattern: {
        level: "moderate",
        confidence: "medium",
        evidenceCount: 1,
        counterEvidenceCount: 0,
      },
  
      longTermCoherence: {
        level: "strong",
        confidence: "high",
        evidenceCount: 2,
        counterEvidenceCount: 0,
      },
  
      interpretationExists: true,
  
      corePattern:
        "변화를 단절로 만들지 않고 기존 경험과 성과를 다음 기반에 연결하며 성장하는 구조이다.",
    };
  
  function buildAreaSnapshot(
    result: DestinyResult,
    area: DestinyArea,
  ): DestinyAreaRegressionSnapshot {
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
    result: DestinyResult,
  ): DestinyReaderRegressionSnapshot {
    return {
      lifeDirection:
        buildAreaSnapshot(
          result,
          "lifeDirection",
        ),
  
      coreLifeTask:
        buildAreaSnapshot(
          result,
          "coreLifeTask",
        ),
  
      strengthFulfillment:
        buildAreaSnapshot(
          result,
          "strengthFulfillment",
        ),
  
      growthPath:
        buildAreaSnapshot(
          result,
          "growthPath",
        ),
  
      choiceAlignment:
        buildAreaSnapshot(
          result,
          "choiceAlignment",
        ),
  
      changeIntegration:
        buildAreaSnapshot(
          result,
          "changeIntegration",
        ),
  
      contributionPattern:
        buildAreaSnapshot(
          result,
          "contributionPattern",
        ),
  
      longTermCoherence:
        buildAreaSnapshot(
          result,
          "longTermCoherence",
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
    actual: DestinyAreaRegressionSnapshot,
    expected: DestinyAreaRegressionSnapshot,
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
    actual: DestinyReaderRegressionSnapshot,
    expected: DestinyReaderRegressionSnapshot,
  ): DestinyReaderRegressionResult[
    "comparison"
  ] {
    const comparison = {
      lifeDirectionMatched:
        areaMatches(
          actual.lifeDirection,
          expected.lifeDirection,
        ),
  
      coreLifeTaskMatched:
        areaMatches(
          actual.coreLifeTask,
          expected.coreLifeTask,
        ),
  
      strengthFulfillmentMatched:
        areaMatches(
          actual.strengthFulfillment,
          expected.strengthFulfillment,
        ),
  
      growthPathMatched:
        areaMatches(
          actual.growthPath,
          expected.growthPath,
        ),
  
      choiceAlignmentMatched:
        areaMatches(
          actual.choiceAlignment,
          expected.choiceAlignment,
        ),
  
      changeIntegrationMatched:
        areaMatches(
          actual.changeIntegration,
          expected.changeIntegration,
        ),
  
      contributionPatternMatched:
        areaMatches(
          actual.contributionPattern,
          expected.contributionPattern,
        ),
  
      longTermCoherenceMatched:
        areaMatches(
          actual.longTermCoherence,
          expected.longTermCoherence,
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
  
  export function verifyDestinyReaderRegression():
    DestinyReaderRegressionResult {
    const result =
      readDestiny(
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
        "stable-structured-destiny",
  
      description:
        "균형 일간·통근·분산 인성 구조·월령 지원으로 구성된 DestinyResult의 8개 판단 영역과 corePattern이 동일하게 유지되는지 검증한다.",
  
      actual,
  
      expected,
  
      comparison,
  
      passed:
        comparison.passed,
    };
  }