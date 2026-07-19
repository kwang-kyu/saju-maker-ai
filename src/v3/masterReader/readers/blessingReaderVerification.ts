import {
    buildBlessingExplanation,
  } from "./blessingExplanationBuilder";
  import {
    readBlessing,
  } from "./blessingReader";
  import type {
    BlessingJudgement,
    BlessingResult,
  } from "../types/blessing";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  
  export type BlessingReaderVerificationCase = {
    name: string;
  
    checks: Record<string, boolean>;
  
    passed: boolean;
  };
  
  export type BlessingReaderVerificationResult = {
    cases: BlessingReaderVerificationCase[];
  
    passed: boolean;
  };
  
  const STRONG_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "자기 힘과 외부 조건이 균형을 이루어 들어온 기회를 현실적으로 받아들일 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기회의 성격과 감당 범위를 먼저 확인할 것",
        ],
        exceptions: [
          "여러 기회를 동시에 무리하게 받아들이는 경우",
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
          "내부 기반과 버팀력이 있어 들어온 도움과 자원을 자기 기반으로 유지할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "들어온 자원을 반복 가능한 기반으로 전환할 것",
        ],
        exceptions: [
          "기회와 자원을 단기 성과로만 소모하는 경우",
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
          "인성의 지원 구조와 분산된 관계 구조가 조언·지식·관계 지원의 통로를 만든다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "조언과 정보를 현실의 선택 기준으로 연결할 것",
        ],
        exceptions: [
          "도움을 받기만 하고 자기 판단으로 전환하지 못하는 경우",
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
          "식상의 표현과 생산 구조가 받은 도움을 성과와 기여로 순환시키는 기반을 만든다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "받은 자원을 결과와 기여로 연결할 것",
        ],
        exceptions: [
          "표현과 확장에 집중하여 유지 기반을 놓치는 경우",
        ],
        signal: {
          kind: "tenGodDominance",
          dominantTenGod: "식신",
          dominantCount: 2,
          totalCount: 8,
          counts: {
            비견: 1,
            겁재: 1,
            식신: 2,
            상관: 1,
            정재: 1,
            정관: 1,
            정인: 1,
          },
          distributed: true,
        },
      },
      {
        category: "monthCommand",
        description:
          "월령의 지원이 환경과 제도 안에서 이용 가능한 도움을 발견하고 활용하는 기반을 만든다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "환경에서 제공되는 지원 조건을 구체적으로 확인할 것",
        ],
        exceptions: [
          "지원 조건과 자신의 목적이 맞지 않는 경우",
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
          "환경적 지원이 반복적으로 연결되어 기회와 자원을 안정적으로 받아들이는 통로를 강화한다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "환경적 지원을 지속 가능한 기반으로 전환할 것",
        ],
        exceptions: [
          "환경의 도움에만 의존하여 자기 기반을 만들지 않는 경우",
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
          "외부 조건에 비해 자기 기반이 약하여 들어온 기회를 감당하고 유지하는 범위가 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "한 번에 받아들이는 기회와 책임의 범위를 줄일 것",
        ],
        exceptions: [
          "외부 지원 없이 여러 기회를 동시에 감당하는 경우",
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
          "내부 기반이 약하여 위기에서 활용할 보호 구조와 들어온 자원을 유지하는 힘이 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "외부 지원 경로와 회복 기반을 사전에 확보할 것",
        ],
        exceptions: [
          "준비 없이 외부 부담을 확대하는 경우",
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
          "집중된 십성 구조로 인해 관계 지원의 통로가 한쪽에 편중될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "지원 관계를 한 사람이나 한 조직에 집중하지 않을 것",
        ],
        exceptions: [
          "핵심 관계가 중단되었을 때 대체 통로가 없는 경우",
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
          "월령의 지원이 약하여 환경과 제도의 도움을 안정적으로 활용하기 어려울 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "현재 환경에서 실제로 이용할 수 있는 지원을 먼저 확인할 것",
        ],
        exceptions: [
          "환경적 지원을 당연한 전제로 두고 계획을 확대하는 경우",
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
          "자기 힘과 외부 조건의 균형이 기회를 받아들이는 기반을 지원한다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "감당 가능한 기회부터 단계적으로 받아들일 것",
        ],
        exceptions: [
          "여러 기회가 동시에 들어와 부담이 커지는 경우",
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
          "특정 조건에서는 자기 기반이 약해져 받은 기회를 유지하는 범위가 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "외부 부담이 커질 때 기회의 규모를 조절할 것",
        ],
        exceptions: [
          "자기 기반보다 큰 책임을 동시에 떠안는 경우",
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
          "일정한 내부 기반이 있어 위기에서 버티고 들어온 도움을 유지할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기존 기반을 유지하면서 새로운 자원을 받아들일 것",
        ],
        exceptions: [
          "기존 기반을 모두 포기하고 확장하는 경우",
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
          "다른 조건에서는 내부 기반이 약해져 위기 보호와 자원 유지가 흔들릴 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기반이 약한 영역에는 외부 지원 경로를 확보할 것",
        ],
        exceptions: [
          "회복 기반 없이 부담이 장기간 계속되는 경우",
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
          "환경의 지원을 받을 수 있는 통로가 확인된다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "지원 환경의 실제 조건을 확인할 것",
        ],
        exceptions: [
          "지원이 일시적이거나 목적과 맞지 않는 경우",
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
          "동시에 환경의 지원이 약해지는 조건도 있어 외부 도움의 지속성이 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "환경 변화에 대비한 대체 지원 통로를 마련할 것",
        ],
        exceptions: [
          "하나의 환경이나 제도에 전적으로 의존하는 경우",
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
    result: BlessingResult,
  ): BlessingJudgement[] {
    return [
      result.opportunityReception,
      result.benefactorConnection,
      result.relationshipSupport,
      result.resourceSupport,
      result.environmentSupport,
      result.crisisProtection,
      result.blessingRetention,
      result.blessingCirculation,
    ];
  }
  
  function allAreasExist(
    result: BlessingResult,
  ): boolean {
    return (
      result.opportunityReception.area
        === "opportunityReception"
      && result.benefactorConnection.area
        === "benefactorConnection"
      && result.relationshipSupport.area
        === "relationshipSupport"
      && result.resourceSupport.area
        === "resourceSupport"
      && result.environmentSupport.area
        === "environmentSupport"
      && result.crisisProtection.area
        === "crisisProtection"
      && result.blessingRetention.area
        === "blessingRetention"
      && result.blessingCirculation.area
        === "blessingCirculation"
    );
  }
  
  function buildCase(
    name: string,
    checks: Record<string, boolean>,
  ): BlessingReaderVerificationCase {
    return {
      name,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyStrongStructure():
    BlessingReaderVerificationCase {
    const result =
      readBlessing(
        STRONG_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildBlessingExplanation(result);
  
    return buildCase(
      "strong-structured-blessing",
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
          explanation.opportunityReception.level
            === result.opportunityReception.level
          && explanation.environmentSupport.level
            === result.environmentSupport.level
          && explanation.blessingRetention.level
            === result.blessingRetention.level
          && explanation.blessingCirculation.level
            === result.blessingCirculation.level,
      },
    );
  }
  
  function verifyLimitedStructure():
    BlessingReaderVerificationCase {
    const result =
      readBlessing(
        LIMITED_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildBlessingExplanation(result);
  
    const limitedJudgement =
      judgements.find(
        (judgement) =>
          judgement.level === "limited",
      );
  
    return buildCase(
      "limited-blessing-channel",
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
    BlessingReaderVerificationCase {
    const result =
      readBlessing(
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
      "mixed-blessing-structure",
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
    BlessingReaderVerificationCase {
    const result =
      readBlessing([]);
  
    const judgements =
      getJudgements(result);
  
    const explanation =
      buildBlessingExplanation(result);
  
    return buildCase(
      "insufficient-blessing-evidence",
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
          explanation.opportunityReception
            .levelLabel === "판단 보류"
          && explanation.environmentSupport
            .levelLabel === "판단 보류"
          && explanation.blessingRetention
            .levelLabel === "판단 보류",
  
        explanationPreservesNull:
          explanation.opportunityReception.level
            === null
          && explanation.benefactorConnection.level
            === null
          && explanation.relationshipSupport.level
            === null
          && explanation.resourceSupport.level
            === null
          && explanation.environmentSupport.level
            === null
          && explanation.crisisProtection.level
            === null
          && explanation.blessingRetention.level
            === null
          && explanation.blessingCirculation.level
            === null,
      },
    );
  }
  
  export function verifyBlessingReader():
    BlessingReaderVerificationResult {
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