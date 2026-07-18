import type {
    CareerArea,
    CareerConfidence,
    CareerLevel,
    CareerResult,
  } from "../types/career";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    readCareer,
  } from "./careerReader";
  
  export type CareerAreaRegressionSnapshot = {
    level: CareerLevel | null;
  
    confidence: CareerConfidence;
  
    evidenceCount: number;
  
    counterEvidenceCount: number;
  };
  
  export type CareerReaderRegressionSnapshot = {
    roleOrientation:
      CareerAreaRegressionSnapshot;
  
    workStyle:
      CareerAreaRegressionSnapshot;
  
    expertiseGrowth:
      CareerAreaRegressionSnapshot;
  
    organizationFit:
      CareerAreaRegressionSnapshot;
  
    independenceFit:
      CareerAreaRegressionSnapshot;
  
    leadershipFit:
      CareerAreaRegressionSnapshot;
  
    performanceConversion:
      CareerAreaRegressionSnapshot;
  
    careerContinuity:
      CareerAreaRegressionSnapshot;
  
    interpretationExists: boolean;
  
    corePattern: string | null;
  };
  
  export type CareerReaderRegressionComparison = {
    roleOrientationMatched: boolean;
  
    workStyleMatched: boolean;
  
    expertiseGrowthMatched: boolean;
  
    organizationFitMatched: boolean;
  
    independenceFitMatched: boolean;
  
    leadershipFitMatched: boolean;
  
    performanceConversionMatched: boolean;
  
    careerContinuityMatched: boolean;
  
    interpretationExistsMatched: boolean;
  
    corePatternMatched: boolean;
  
    passed: boolean;
  };
  
  export type CareerReaderRegressionResult = {
    id: string;
  
    description: string;
  
    actual: CareerReaderRegressionSnapshot;
  
    expected: CareerReaderRegressionSnapshot;
  
    comparison:
      CareerReaderRegressionComparison;
  
    passed: boolean;
  };
  
  const REGRESSION_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
  
        description:
          "자기 통제력과 외부 요구가 균형을 이루어 책임 있는 역할과 업무를 안정적으로 수행할 수 있다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "역할과 책임 범위를 명확히 할 것",
        ],
  
        exceptions: [
          "동시에 지나치게 많은 책임을 맡는 경우",
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
          "내부 기반과 버팀력이 있어 전문성을 축적하고 경력을 장기간 유지할 수 있다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "경험과 전문성을 단계적으로 축적할 것",
        ],
  
        exceptions: [
          "기반 없이 역할을 급격히 확대하는 경우",
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
          "정관의 책임성과 조직성이 확인되어 역할 조율과 리더 업무를 안정적으로 수행할 수 있다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "권한과 책임 기준을 명확히 할 것",
        ],
  
        exceptions: [
          "형식과 통제만 지나치게 강조하는 경우",
        ],
  
        signal: {
          kind: "tenGodDominance",
  
          dominantTenGod: "정관",
  
          dominantCount: 3,
  
          totalCount: 8,
  
          counts: {
            비견: 1,
            식신: 1,
            정재: 2,
            정관: 3,
            정인: 1,
          },
  
          distributed: true,
        },
      },
  
      {
        category: "monthCommand",
  
        description:
          "환경의 지원을 받아 조직 적응과 직업 활동을 안정적으로 이어갈 수 있다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "지속 가능한 업무 체계를 유지할 것",
        ],
  
        exceptions: [
          "환경 검토 없이 역할을 변경하는 경우",
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
    CareerReaderRegressionSnapshot = {
      roleOrientation: {
        level: "strong",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      workStyle: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      expertiseGrowth: {
        level: "strong",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      organizationFit: {
        level: "strong",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      independenceFit: {
        level: null,
      
        confidence: "low",
      
        evidenceCount: 0,
      
        counterEvidenceCount: 0,
      },
  
      leadershipFit: {
        level: "strong",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      performanceConversion: {
        level: "moderate",
  
        confidence: "medium",
  
        evidenceCount: 1,
  
        counterEvidenceCount: 0,
      },
  
      careerContinuity: {
        level: "strong",
  
        confidence: "high",
  
        evidenceCount: 2,
  
        counterEvidenceCount: 0,
      },
  
      interpretationExists: true,
  
      corePattern:
  "조직의 역할과 책임 구조를 이해하고 사람과 업무의 방향을 조정하면서 직업적 영향력을 확대하는 구조이다.",
    };
  
  function buildAreaSnapshot(
    result: CareerResult,
    area: CareerArea,
  ): CareerAreaRegressionSnapshot {
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
    result: CareerResult,
  ): CareerReaderRegressionSnapshot {
    return {
      roleOrientation:
        buildAreaSnapshot(
          result,
          "roleOrientation",
        ),
  
      workStyle:
        buildAreaSnapshot(
          result,
          "workStyle",
        ),
  
      expertiseGrowth:
        buildAreaSnapshot(
          result,
          "expertiseGrowth",
        ),
  
      organizationFit:
        buildAreaSnapshot(
          result,
          "organizationFit",
        ),
  
      independenceFit:
        buildAreaSnapshot(
          result,
          "independenceFit",
        ),
  
      leadershipFit:
        buildAreaSnapshot(
          result,
          "leadershipFit",
        ),
  
      performanceConversion:
        buildAreaSnapshot(
          result,
          "performanceConversion",
        ),
  
      careerContinuity:
        buildAreaSnapshot(
          result,
          "careerContinuity",
        ),
  
      interpretationExists:
        result.interpretation !== null,
  
      corePattern:
        result.interpretation
          ?.corePattern
        ?? null,
    };
  }
  
  function areaSnapshotMatched(
    actual: CareerAreaRegressionSnapshot,
    expected: CareerAreaRegressionSnapshot,
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
    actual: CareerReaderRegressionSnapshot,
    expected: CareerReaderRegressionSnapshot,
  ): CareerReaderRegressionComparison {
    const comparison = {
      roleOrientationMatched:
        areaSnapshotMatched(
          actual.roleOrientation,
          expected.roleOrientation,
        ),
  
      workStyleMatched:
        areaSnapshotMatched(
          actual.workStyle,
          expected.workStyle,
        ),
  
      expertiseGrowthMatched:
        areaSnapshotMatched(
          actual.expertiseGrowth,
          expected.expertiseGrowth,
        ),
  
      organizationFitMatched:
        areaSnapshotMatched(
          actual.organizationFit,
          expected.organizationFit,
        ),
  
      independenceFitMatched:
        areaSnapshotMatched(
          actual.independenceFit,
          expected.independenceFit,
        ),
  
      leadershipFitMatched:
        areaSnapshotMatched(
          actual.leadershipFit,
          expected.leadershipFit,
        ),
  
      performanceConversionMatched:
        areaSnapshotMatched(
          actual.performanceConversion,
          expected.performanceConversion,
        ),
  
      careerContinuityMatched:
        areaSnapshotMatched(
          actual.careerContinuity,
          expected.careerContinuity,
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
  
  export function verifyCareerReaderRegression():
    CareerReaderRegressionResult {
    const result =
      readCareer(
        REGRESSION_STRUCTURE_FACTS,
      );
  
    const actual =
      buildRegressionSnapshot(result);
  
    const expected =
      EXPECTED_REGRESSION_SNAPSHOT;
  
    const comparison =
      buildComparison(
        actual,
        expected,
      );
  
    return {
      id: "stable-structured-career",
  
      description:
        "균형 일간·통근·정관 구조·월령 지원으로 구성된 CareerResult가 동일하게 유지되는지 검증한다.",
  
      actual,
  
      expected,
  
      comparison,
  
      passed: comparison.passed,
    };
  }