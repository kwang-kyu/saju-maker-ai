import type {
    MoneyArea,
    MoneyLevel,
    MoneyResult,
  } from "../types/money";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    buildMoneyExplanation,
  } from "./moneyExplanationBuilder";
  import {
    readMoney,
  } from "./moneyReader";
  
  export type MoneyVerificationCaseResult = {
    name: string;
  
    checks: Record<string, boolean>;
  
    passed: boolean;
  };
  
  export type MoneyReaderVerificationResult = {
    cases: MoneyVerificationCaseResult[];
  
    passed: boolean;
  };
  
  const MONEY_AREAS: MoneyArea[] = [
    "generation",
    "repeatability",
    "retention",
    "assetConversion",
    "cashflowManagement",
    "debtHandling",
    "volatilityResponse",
    "lossRecovery",
  ];
  
  const STRONG_STRUCTURE_FACTS:
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
          "외부 책임이 동시에 급증하는 경우",
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
          "내부 기반이 두 곳에서 안정적으로 확인된다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "기반을 단계적으로 확대할 것",
        ],
  
        exceptions: [
          "회복 없이 부담을 계속 추가하는 경우",
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
          "정재 중심의 현실 감각이 여러 기능과 함께 분포한다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "수입과 비용의 기준을 구분할 것",
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
  
  const LIMITED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
  
        description:
          "외부 요구가 자기 기반보다 크게 작용한다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "부담의 총량을 먼저 제한할 것",
        ],
  
        exceptions: [
          "외부 의무가 동시에 증가하는 경우",
        ],
  
        signal: {
          kind: "dayMasterStrength",
  
          type: "weak",
  
          score: -5,
  
          supportScore: 2,
  
          opposingScore: 8,
  
          monthCommandScore: -2,
  
          rootingScore: -1,
        },
      },
  
      {
        category: "rooting",
  
        description:
          "지속성을 받치는 내부 기반이 확인되지 않는다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "회복 자원을 먼저 확보할 것",
        ],
  
        exceptions: [
          "기반 없이 부담을 확대하는 경우",
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
          "환경의 지원이 자기 활동과 연결되지 않는다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "환경 변화에 맞춰 범위를 조정할 것",
        ],
  
        exceptions: [
          "지원이 없는 상태에서 활동을 반복하는 경우",
        ],
  
        signal: {
          kind: "monthCommand",
  
          season: "winter",
  
          supported: false,
  
          dayMasterElement: "fire",
        },
      },
    ];
  
  const MIXED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "tenGodStrength",
  
        description:
          "정재 중심의 현실 성과 성향이 확인된다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "성과와 비용을 함께 점검할 것",
        ],
  
        exceptions: [
          "수입보다 책임이 먼저 확대되는 경우",
        ],
  
        signal: {
          kind: "tenGodDominance",
  
          dominantTenGod: "정재",
  
          dominantCount: 3,
  
          totalCount: 8,
  
          counts: {
            정재: 3,
            편재: 1,
            식신: 1,
            정관: 1,
            정인: 1,
            비견: 1,
          },
  
          distributed: true,
        },
      },
  
      {
        category: "dayMasterStrength",
  
        description:
          "외부 부담이 자기 자원보다 크게 작용한다.",
  
        strength: "strong",
  
        confidence: "strong",
  
        conditions: [
          "성과 확대보다 부담 한도를 먼저 정할 것",
        ],
  
        exceptions: [
          "비용과 책임을 동시에 확대하는 경우",
        ],
  
        signal: {
          kind: "dayMasterStrength",
  
          type: "weak",
  
          score: -4,
  
          supportScore: 3,
  
          opposingScore: 8,
  
          monthCommandScore: -1,
  
          rootingScore: 0,
        },
      },
    ];
  
  const INSUFFICIENT_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "interaction",
  
        description:
          "두 지지 사이에 구조적 움직임이 확인된다.",
  
        strength: "weak",
  
        confidence: "weak",
  
        conditions: [],
  
        exceptions: [],
      },
    ];
  
  function getJudgement(
    result: MoneyResult,
    area: MoneyArea,
  ) {
    return result[area];
  }
  
  function hasAllAreas(
    result: MoneyResult,
  ): boolean {
    return MONEY_AREAS.every(
      (area) =>
        getJudgement(result, area).area
        === area,
    );
  }
  
  function areasHaveExpectedLevel(
    result: MoneyResult,
    expectations: Partial<
      Record<MoneyArea, MoneyLevel | null>
    >,
  ): boolean {
    return Object.entries(expectations).every(
      ([area, level]) =>
        getJudgement(
          result,
          area as MoneyArea,
        ).level === level,
    );
  }
  
  function allAreasHaveLevel(
    result: MoneyResult,
    level: MoneyLevel | null,
  ): boolean {
    return MONEY_AREAS.every(
      (area) =>
        getJudgement(result, area).level
        === level,
    );
  }
  
  function buildCaseResult(
    name: string,
    checks: Record<string, boolean>,
  ): MoneyVerificationCaseResult {
    return {
      name,
  
      checks,
  
      passed:
        Object.values(checks).every(Boolean),
    };
  }
  
  function verifyStrongStructure():
    MoneyVerificationCaseResult {
    const result =
      readMoney(STRONG_STRUCTURE_FACTS);
  
    const explanation =
      buildMoneyExplanation(result);
  
    return buildCaseResult(
      "strong-structured-money",
      {
        allAreasExist:
          hasAllAreas(result),
  
        expectedLevels:
          areasHaveExpectedLevel(
            result,
            {
              generation: "strong",
  
              repeatability: "strong",
  
              retention: "strong",
  
              assetConversion: "strong",
  
              cashflowManagement: "strong",
  
              debtHandling: "moderate",
  
              volatilityResponse: "strong",
  
              lossRecovery: "strong",
            },
          ),
  
        interpretationExists:
          result.interpretation !== null,
  
        generationEvidenceExists:
          result.generation.evidence.length
          > 0,
  
        confidenceIsNotLow:
          result.generation.confidence
          !== "low",
  
        explanationExists:
          explanation.summary.trim().length
          > 0,
  
        explanationPreservesLevel:
          explanation.generation.level
          === result.generation.level,
      },
    );
  }
  
  function verifyLimitedStructure():
    MoneyVerificationCaseResult {
    const result =
      readMoney(LIMITED_STRUCTURE_FACTS);
  
    return buildCaseResult(
      "limited-structural-pressure",
      {
        allAreasExist:
          hasAllAreas(result),
  
        expectedLimitedLevels:
          areasHaveExpectedLevel(
            result,
            {
              generation: "limited",
  
              repeatability: "limited",
  
              retention: "limited",
  
              assetConversion: "limited",
  
              debtHandling: "limited",
  
              volatilityResponse: "limited",
  
              lossRecovery: "limited",
            },
          ),
  
        cashflowIsInsufficient:
          result.cashflowManagement.level
          === null,
  
        limitingEvidenceExists:
          result.debtHandling
            .counterEvidence.length
          > 0,
  
        limitedConfidenceSeparated:
          result.debtHandling.confidence
          !== undefined,
      },
    );
  }
  
  function verifyMixedStructure():
    MoneyVerificationCaseResult {
    const result =
      readMoney(MIXED_STRUCTURE_FACTS);
  
    return buildCaseResult(
      "mixed-generation-structure",
      {
        generationIsModerate:
          result.generation.level
          === "moderate",
  
        supportingEvidenceExists:
          result.generation.evidence.length
          > 0,
  
        limitingEvidenceExists:
          result.generation
            .counterEvidence.length
          > 0,
  
        conflictLowersConfidence:
          result.generation.confidence
          === "low",
  
        interpretationExists:
          result.generation.interpretation
          !== null,
      },
    );
  }
  
  function verifyInsufficientStructure():
    MoneyVerificationCaseResult {
    const result =
      readMoney(
        INSUFFICIENT_STRUCTURE_FACTS,
      );
  
    const explanation =
      buildMoneyExplanation(result);
  
    return buildCaseResult(
      "insufficient-money-evidence",
      {
        allAreasExist:
          hasAllAreas(result),
  
        allLevelsAreNull:
          allAreasHaveLevel(result, null),
  
        interpretationIsNull:
          result.interpretation === null,
  
        allConfidenceIsLow:
          MONEY_AREAS.every(
            (area) =>
              getJudgement(result, area)
                .confidence === "low",
          ),
  
        explanationUsesPendingLabel:
          explanation.generation.levelLabel
          === "판단 보류",
  
        explanationPreservesNull:
          explanation.generation.level
          === null,
      },
    );
  }
  
  export function verifyMoneyReader():
    MoneyReaderVerificationResult {
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