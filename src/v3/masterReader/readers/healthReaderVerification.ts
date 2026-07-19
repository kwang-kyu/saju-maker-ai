import {
    buildHealthExplanation,
  } from "./healthExplanationBuilder";
  import {
    readHealth,
  } from "./healthReader";
  import type {
    HealthJudgement,
    HealthResult,
  } from "../types/health";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  
  export type HealthReaderVerificationCase = {
    name: string;
  
    checks: Record<string, boolean>;
  
    passed: boolean;
  };
  
  export type HealthReaderVerificationResult = {
    cases: HealthReaderVerificationCase[];
  
    passed: boolean;
  };
  
  const STRONG_STRUCTURE_FACTS:
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
  
  const LIMITED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "외부 부담에 비해 자기 에너지가 약하여 활력 저하와 스트레스 누적에 취약할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "부담 범위를 작게 유지할 것",
        ],
        exceptions: [
          "회복 없이 책임을 계속 확대하는 경우",
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
          "내부 버팀력이 부족하여 피로와 과부하 이후 원래 리듬으로 돌아오는 데 시간이 필요하다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "회복 시간을 충분히 확보할 것",
        ],
        exceptions: [
          "피로 신호를 무시하고 활동을 지속하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 0,
          totalBranches: 4,
          rooted: false,
        },
      },
      {
        category: "monthCommand",
        description:
          "환경적 지원이 약하여 생활 리듬과 에너지 균형이 외부 변화에 쉽게 흔들릴 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "일정한 생활 기준을 먼저 만들 것",
        ],
        exceptions: [
          "불규칙한 일정이 장기간 반복되는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "winter",
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
          "기본 활력은 안정적이지만 부담이 커지면 스트레스 조절 범위가 빠르게 좁아질 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "부담을 단계적으로 늘릴 것",
        ],
        exceptions: [
          "동시에 여러 과제를 장기간 수행하는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "balanced",
          score: 1,
          supportScore: 6,
          opposingScore: 5,
          monthCommandScore: 2,
          rootingScore: 1,
        },
      },
      {
        category: "rooting",
        description:
          "일정한 버팀력은 있으나 피로가 누적되면 회복 속도와 생활 리듬이 불안정해질 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "활동 사이에 회복 구간을 둘 것",
        ],
        exceptions: [
          "휴식 없이 긴장 상태를 계속 유지하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 0,
          totalBranches: 4,
          rooted: false,
        },
      },
      {
        category: "monthCommand",
        description:
          "환경의 지원은 있지만 일정 변화가 커지면 습관과 회복 리듬을 유지하기 어려울 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기본 수면과 휴식 시간을 고정할 것",
        ],
        exceptions: [
          "일정이 반복적으로 급변하는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "spring",
          supported: true,
          dayMasterElement: "wood",
        },
      },
    ];
  
  function getJudgements(
    result: HealthResult,
  ): HealthJudgement[] {
    return [
      result.vitalityStability,
      result.stressRegulation,
      result.fatigueManagement,
      result.recoveryCapacity,
      result.rhythmMaintenance,
      result.overloadTolerance,
      result.habitSelfManagement,
      result.imbalanceAdaptation,
    ];
  }
  
  function allAreasExist(
    result: HealthResult,
  ): boolean {
    return (
      result.vitalityStability.area
        === "vitalityStability"
      && result.stressRegulation.area
        === "stressRegulation"
      && result.fatigueManagement.area
        === "fatigueManagement"
      && result.recoveryCapacity.area
        === "recoveryCapacity"
      && result.rhythmMaintenance.area
        === "rhythmMaintenance"
      && result.overloadTolerance.area
        === "overloadTolerance"
      && result.habitSelfManagement.area
        === "habitSelfManagement"
      && result.imbalanceAdaptation.area
        === "imbalanceAdaptation"
    );
  }
  
  function buildCase(
    name: string,
    checks: Record<string, boolean>,
  ): HealthReaderVerificationCase {
    return {
      name,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyStrongStructure():
    HealthReaderVerificationCase {
    const result =
      readHealth(
        STRONG_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildHealthExplanation(result);
  
    return buildCase(
      "strong-structured-health",
      {
        allAreasExist:
          allAreasExist(result),
  
        strongAreaExists:
          judgements.some(
            (judgement) =>
              judgement.level === "strong",
          ),
  
        interpretationExists:
          result.interpretation !== null,
  
        supportingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.evidence.length > 0,
          ),
  
        confidenceIsNotAllLow:
          judgements.some(
            (judgement) =>
              judgement.confidence
                !== "low",
          ),
  
        explanationExists:
          explanation.summary
            .trim().length > 0,
  
        explanationPreservesLevels:
          explanation.vitalityStability.level
            === result.vitalityStability.level
          && explanation.recoveryCapacity.level
            === result.recoveryCapacity.level
          && explanation.rhythmMaintenance.level
            === result.rhythmMaintenance.level,
      },
    );
  }
  
  function verifyLimitedStructure():
    HealthReaderVerificationCase {
    const result =
      readHealth(
        LIMITED_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildHealthExplanation(result);
  
    const limitedJudgement =
      judgements.find(
        (judgement) =>
          judgement.level === "limited",
      );
  
    return buildCase(
      "limited-health-pressure",
      {
        allAreasExist:
          allAreasExist(result),
  
        limitedAreaExists:
          limitedJudgement !== undefined,
  
        limitingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.counterEvidence
                .length > 0,
          ),
  
        limitedInterpretationExists:
          limitedJudgement
            ?.interpretation !== null
          && limitedJudgement
            ?.interpretation !== undefined,
  
        explanationPreservesLimitedLevel:
          limitedJudgement !== undefined
          && getJudgements(result).some(
            (judgement) =>
              judgement.area
                === limitedJudgement.area
              && judgement.level
                === "limited",
          ),
  
        explanationRisksExist:
          explanation.risks.length > 0,
      },
    );
  }
  
  function verifyMixedStructure():
    HealthReaderVerificationCase {
    const result =
      readHealth(
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
      "mixed-health-structure",
      {
        allAreasExist:
          allAreasExist(result),
  
        supportingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.evidence.length > 0,
          ),
  
        limitingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.counterEvidence
                .length > 0,
          ),
  
        conflictExists:
          conflictingJudgements.length > 0,
  
        conflictDoesNotProduceHighConfidence:
          conflictingJudgements.every(
            (judgement) =>
              judgement.confidence
                !== "high",
          ),
  
        interpretationExists:
          result.interpretation !== null,
      },
    );
  }
  
  function verifyInsufficientStructure():
    HealthReaderVerificationCase {
    const result =
      readHealth([]);
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildHealthExplanation(result);
  
    return buildCase(
      "insufficient-health-evidence",
      {
        allAreasExist:
          allAreasExist(result),
  
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
          explanation.vitalityStability
            .levelLabel === "판단 보류"
          && explanation.recoveryCapacity
            .levelLabel === "판단 보류",
  
        explanationPreservesNull:
          explanation.vitalityStability.level
            === null
          && explanation.recoveryCapacity.level
            === null
          && explanation.imbalanceAdaptation
            .level === null,
      },
    );
  }
  
  export function verifyHealthReader():
    HealthReaderVerificationResult {
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