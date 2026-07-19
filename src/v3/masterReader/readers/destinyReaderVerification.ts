import {
    buildDestinyExplanation,
  } from "./destinyExplanationBuilder";
  import {
    readDestiny,
  } from "./destinyReader";
  import type {
    DestinyJudgement,
    DestinyResult,
  } from "../types/destiny";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  
  export type DestinyReaderVerificationCase = {
    name: string;
  
    checks: Record<string, boolean>;
  
    passed: boolean;
  };
  
  export type DestinyReaderVerificationResult = {
    cases: DestinyReaderVerificationCase[];
  
    passed: boolean;
  };
  
  const STRONG_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "자기 힘과 외부 조건이 균형을 이루어 삶의 방향과 선택 기준을 안정적으로 조율할 수 있다.",
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
  
  const LIMITED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "외부 부담이 자기 기반보다 커서 삶의 방향과 선택이 주변의 요구에 따라 흔들릴 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "외부 요구보다 자기 감당 범위를 먼저 확인할 것",
        ],
        exceptions: [
          "여러 책임을 동시에 떠안는 경우",
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
          "내부 기반이 약하여 변화 때마다 경험과 성과의 축적이 단절될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "변화 이전에 유지할 기반과 경험을 정리할 것",
        ],
        exceptions: [
          "기존 기반 없이 새로운 역할을 반복해서 시작하는 경우",
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
          "집중된 십성 구조로 인해 익숙한 역할과 선택 방식이 반복적인 한계로 굳어질 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "익숙한 방식 외의 대안을 함께 검토할 것",
        ],
        exceptions: [
          "한 가지 강점과 역할만으로 모든 문제를 해결하려는 경우",
        ],
        signal: {
          kind: "tenGodDominance",
          dominantTenGod: "비견",
          dominantCount: 5,
          totalCount: 8,
          counts: {
            비견: 5,
            겁재: 1,
            식신: 1,
            정재: 1,
          },
          distributed: false,
        },
      },
      {
        category: "monthCommand",
        description:
          "환경의 지원이 약하여 자기 방향과 현실 조건을 연결하는 데 지속적인 조정이 필요하다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "현재 환경에서 유지 가능한 성장 조건을 먼저 만들 것",
        ],
        exceptions: [
          "환경적 기반 없이 장기 계획만 확대하는 경우",
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
          "자기 힘과 외부 조건을 조율하며 삶의 방향과 선택 기준을 세울 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "자기 기준과 현실 조건을 함께 확인할 것",
        ],
        exceptions: [
          "가능성만 보고 감당 범위를 놓치는 경우",
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
        category: "dayMasterStrength",
        description:
          "특정 조건에서는 외부 부담이 커져 삶의 방향보다 주변 요구를 우선할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "외부 부담이 커질 때 선택 범위를 줄일 것",
        ],
        exceptions: [
          "여러 책임이 동시에 집중되는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "weak",
          score: -4,
          supportScore: 3,
          opposingScore: 7,
          monthCommandScore: 1,
          rootingScore: 0,
        },
      },
      {
        category: "rooting",
        description:
          "일정한 내부 기반이 있어 경험과 성과를 다음 단계로 축적할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기존 기반을 유지하며 변화를 진행할 것",
        ],
        exceptions: [
          "기존 기반을 모두 포기하고 전환하는 경우",
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
          "다른 조건에서는 내부 기반이 약해져 변화 과정에서 경험의 연속성이 끊길 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "변화 전에 유지할 경험과 역할을 구분할 것",
        ],
        exceptions: [
          "준비 없이 역할과 환경을 동시에 바꾸는 경우",
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
          "분산된 십성 구조가 여러 관점과 역할을 활용하여 변화에 대응하게 한다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "여러 역할의 우선순위를 명확히 할 것",
        ],
        exceptions: [
          "모든 역할을 동시에 유지하려는 경우",
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
        category: "tenGodStrength",
        description:
          "다른 조건에서는 특정 역할이 집중되어 익숙한 방식에 선택이 고정될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "익숙한 역할 외의 선택 가능성을 확인할 것",
        ],
        exceptions: [
          "한 가지 역할과 방식만 고집하는 경우",
        ],
        signal: {
          kind: "tenGodDominance",
          dominantTenGod: "비견",
          dominantCount: 5,
          totalCount: 8,
          counts: {
            비견: 5,
            겁재: 1,
            식신: 1,
            정재: 1,
          },
          distributed: false,
        },
      },
      {
        category: "monthCommand",
        description:
          "환경의 지원이 성장과 장기 방향을 유지하는 데 도움이 될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "지원 환경을 자기 성장 기반으로 연결할 것",
        ],
        exceptions: [
          "환경 지원을 영구적인 조건으로 가정하는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "spring",
          supported: true,
          dayMasterElement: "wood",
        },
      },
      {
        category: "monthCommand",
        description:
          "동시에 환경 지원이 약해지는 조건도 있어 장기 방향의 유지가 흔들릴 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "환경 변화에 대비한 대체 기반을 마련할 것",
        ],
        exceptions: [
          "하나의 환경에 전적으로 의존하는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "winter",
          supported: false,
          dayMasterElement: "wood",
        },
      },
    ];
  
  function getJudgements(
    result: DestinyResult,
  ): DestinyJudgement[] {
    return [
      result.lifeDirection,
      result.coreLifeTask,
      result.strengthFulfillment,
      result.growthPath,
      result.choiceAlignment,
      result.changeIntegration,
      result.contributionPattern,
      result.longTermCoherence,
    ];
  }
  
  function allAreasExist(
    result: DestinyResult,
  ): boolean {
    return (
      result.lifeDirection.area
        === "lifeDirection"
      && result.coreLifeTask.area
        === "coreLifeTask"
      && result.strengthFulfillment.area
        === "strengthFulfillment"
      && result.growthPath.area
        === "growthPath"
      && result.choiceAlignment.area
        === "choiceAlignment"
      && result.changeIntegration.area
        === "changeIntegration"
      && result.contributionPattern.area
        === "contributionPattern"
      && result.longTermCoherence.area
        === "longTermCoherence"
    );
  }
  
  function buildCase(
    name: string,
    checks: Record<string, boolean>,
  ): DestinyReaderVerificationCase {
    return {
      name,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyStrongStructure():
    DestinyReaderVerificationCase {
    const result =
      readDestiny(
        STRONG_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildDestinyExplanation(result);
  
    return buildCase(
      "strong-structured-destiny",
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
          explanation.lifeDirection.level
            === result.lifeDirection.level
          && explanation.growthPath.level
            === result.growthPath.level
          && explanation.longTermCoherence.level
            === result.longTermCoherence.level,
      },
    );
  }
  
  function verifyLimitedStructure():
    DestinyReaderVerificationCase {
    const result =
      readDestiny(
        LIMITED_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildDestinyExplanation(result);
  
    const limitedJudgement =
      judgements.find(
        (judgement) =>
          judgement.level === "limited",
      );
  
    return buildCase(
      "limited-destiny-structure",
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
    DestinyReaderVerificationCase {
    const result =
      readDestiny(
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
      "mixed-destiny-structure",
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
    DestinyReaderVerificationCase {
    const result =
      readDestiny([]);
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildDestinyExplanation(result);
  
    return buildCase(
      "insufficient-destiny-evidence",
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
          explanation.lifeDirection
            .levelLabel === "판단 보류"
          && explanation.coreLifeTask
            .levelLabel === "판단 보류"
          && explanation.longTermCoherence
            .levelLabel === "판단 보류",
  
        explanationPreservesNull:
          explanation.lifeDirection.level
            === null
          && explanation.coreLifeTask.level
            === null
          && explanation.strengthFulfillment.level
            === null
          && explanation.growthPath.level
            === null
          && explanation.choiceAlignment.level
            === null
          && explanation.changeIntegration.level
            === null
          && explanation.contributionPattern.level
            === null
          && explanation.longTermCoherence.level
            === null,
      },
    );
  }
  
  export function verifyDestinyReader():
    DestinyReaderVerificationResult {
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