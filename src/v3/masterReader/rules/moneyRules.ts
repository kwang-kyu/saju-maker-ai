import type {
    MoneyArea,
    MoneyEvidence,
    MoneyEvidenceSource,
  } from "../types/money.js";
  import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type MoneyRuleDirection =
    | "support"
    | "limit";
  
  export type MoneySignalKind =
    SajuStructureSignal["kind"];
  
  export type MoneySignalMatcher = (
    signal: SajuStructureSignal,
  ) => boolean;
  
  export type MoneyRule = {
    id: string;
  
    area: MoneyArea;
  
    direction: MoneyRuleDirection;
  
    signalKinds?: readonly MoneySignalKind[];
  
    signalMatcher?: MoneySignalMatcher;
  
    sources?: readonly MoneyEvidenceSource[];
  
    minimumWeight?: number;
  
    keywords?: readonly string[];
  
    score: number;
  
    reason: string;
  };
  
  export type MoneyRuleMatchBasis = {
    signalMatched: boolean;
  
    sourceMatched: boolean;
  
    weightMatched: boolean;
  
    keywordMatched: boolean;
  };
  
  export type MatchedMoneyRule = {
    rule: MoneyRule;
  
    evidence: MoneyEvidence;
  
    matchBasis: MoneyRuleMatchBasis;
  };
  
  function isDayMasterStrengthSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "dayMasterStrength" }
  > {
    return signal.kind === "dayMasterStrength";
  }
  
  function isTenGodDominanceSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "tenGodDominance" }
  > {
    return signal.kind === "tenGodDominance";
  }
  
  function isMonthCommandSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "monthCommand" }
  > {
    return signal.kind === "monthCommand";
  }
  
  function isRootingSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "rooting" }
  > {
    return signal.kind === "rooting";
  }
  
  function includesAny(
    value: string,
    keywords: readonly string[],
  ): boolean {
    return keywords.some(
      (keyword) => value.includes(keyword),
    );
  }
  
  function hasWealthDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && signal.dominantTenGod !== null
      && includesAny(
        signal.dominantTenGod,
        ["재성", "정재", "편재"],
      )
    );
  }
  
  function hasOutputDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && signal.dominantTenGod !== null
      && includesAny(
        signal.dominantTenGod,
        ["식상", "식신", "상관"],
      )
    );
  }
  
  const DESCRIPTION_SOURCES: readonly MoneyEvidenceSource[] = [
    "structure",
    "tenGodStrength",
    "fiveElementFlow",
    "rooting",
    "usefulGod",
    "interaction",
  ];
  
  export const MONEY_RULES: MoneyRule[] = [
    {
      id: "generation-wealth-dominance",
      area: "generation",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasWealthDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "재물과 현실 자원을 인식하고 다루는 성향이 뚜렷하여 수입 기회를 재물 흐름으로 연결할 수 있는 근거이다.",
    },
    {
      id: "generation-output-dominance",
      area: "generation",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasOutputDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "생산·표현·기획·성과 창출 성향이 뚜렷하여 활동 결과를 수입으로 연결할 수 있는 근거이다.",
    },
    {
      id: "generation-weak-day-master-pressure",
      area: "generation",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 요구와 부담이 자기 자원보다 강하여 수입 기회가 생겨도 이를 지속적인 성과로 완성하는 과정에서 소진될 수 있는 근거이다.",
    },
  
    {
      id: "repeatability-rooted",
      area: "repeatability",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount > 0,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "성과를 반복해서 유지할 수 있는 내부 기반이 확인되어 일회성 수입을 지속적인 흐름으로 발전시킬 수 있는 근거이다.",
    },
    {
      id: "repeatability-supported-month-command",
      area: "repeatability",
      direction: "support",
      signalKinds: ["monthCommand"],
      signalMatcher: (signal) =>
        isMonthCommandSignal(signal)
        && signal.supported === true,
      sources: ["monthCommand"],
      minimumWeight: 2,
      score: 2,
      reason:
        "환경적 지원이 뒷받침되어 일정한 활동과 성과를 반복적으로 유지할 수 있는 근거이다.",
    },
    {
      id: "repeatability-unsupported-month-command",
      area: "repeatability",
      direction: "limit",
      signalKinds: ["monthCommand"],
      signalMatcher: (signal) =>
        isMonthCommandSignal(signal)
        && signal.supported === false,
      sources: ["monthCommand"],
      minimumWeight: 2,
      score: 3,
      reason:
        "환경의 지원이 부족하여 한 번의 성과를 같은 수준으로 반복하는 과정에서 힘의 소모가 커질 수 있는 근거이다.",
    },
  
    {
      id: "retention-rooted",
      area: "retention",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount > 0,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "재물이 들어온 뒤에도 중심을 유지할 수 있는 내부 기반이 있어 수입을 보유하고 축적할 수 있는 근거이다.",
    },
    {
      id: "retention-balanced-day-master",
      area: "retention",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "balanced",
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 2,
      reason:
        "자기 자원과 외부 부담이 균형을 이루어 들어온 재물을 무리 없이 관리하고 보유할 수 있는 근거이다.",
    },
    {
      id: "retention-weak-day-master",
      area: "retention",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 부담이 자기 자원보다 커서 수입이 생겨도 책임·비용·압박으로 빠져나갈 가능성이 커지는 근거이다.",
    },
  
    {
      id: "asset-conversion-wealth-dominance",
      area: "assetConversion",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasWealthDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "재물과 현실 자산에 대한 인식이 뚜렷하여 수입을 소비로 끝내지 않고 보유 가능한 자원으로 전환할 수 있는 근거이다.",
    },
    {
      id: "asset-conversion-rooted",
      area: "assetConversion",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount > 0,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 2,
      reason:
        "장기적으로 자원을 붙들고 유지할 기반이 있어 반복 수익을 축적 자산으로 전환할 수 있는 근거이다.",
    },
    {
      id: "asset-conversion-unrooted",
      area: "assetConversion",
      direction: "limit",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && !signal.rooted,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 2,
      reason:
        "자원을 장기간 유지하는 내부 기반이 약하여 수입이 생겨도 자산으로 고정되기 전에 소진되거나 이동할 수 있는 근거이다.",
    },
  
    {
      id: "cashflow-distributed-structure",
      area: "cashflowManagement",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && signal.distributed
        && signal.totalCount > 0,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "역할과 자원의 흐름이 한곳에 과도하게 집중되지 않아 여러 수입과 지출 흐름을 나누어 관리할 수 있는 근거이다.",
    },
    {
      id: "cashflow-balanced-day-master",
      area: "cashflowManagement",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "balanced",
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 2,
      reason:
        "유입과 부담 사이의 균형을 유지할 수 있어 현금흐름의 규모와 속도를 조절할 수 있는 근거이다.",
    },
    {
      id: "cashflow-overconcentrated-structure",
      area: "cashflowManagement",
      direction: "limit",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && !signal.distributed
        && signal.dominantCount >= 4,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "재물 활동이 한 기능이나 흐름에 과도하게 집중되어 수입원이 흔들릴 때 전체 현금흐름이 함께 불안정해질 수 있는 근거이다.",
    },
  
    {
      id: "debt-handling-strong-day-master",
      area: "debtHandling",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "strong"
        && signal.supportScore >= signal.opposingScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 의무와 상환 압력을 감당할 자기 자원이 확인되어 일정 범위의 고정 부담을 관리할 수 있는 근거이다.",
    },
    {
      id: "debt-handling-rooted",
      area: "debtHandling",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount >= 2,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 2,
      reason:
        "지속적인 상환과 고정비 부담을 견딜 수 있는 내부 기반이 확인되는 근거이다.",
    },
    {
      id: "debt-handling-weak-day-master",
      area: "debtHandling",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 압력이 자기 자원보다 강하여 부채와 고정비가 늘어날수록 선택 범위와 회복 여력이 빠르게 줄어들 수 있는 근거이다.",
    },
  
    {
      id: "volatility-balanced-day-master",
      area: "volatilityResponse",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "balanced"
        && signal.supportScore >= signal.opposingScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "지원 자원과 외부 압력의 균형이 유지되어 수익 변동 속에서도 판단과 자원 배분을 안정적으로 유지할 수 있는 근거이다.",
    },
    {
      id: "volatility-strong-rooting",
      area: "volatilityResponse",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount >= 2,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 2,
      reason:
        "변동과 충격이 발생해도 즉시 기반이 흔들리지 않는 버팀 구조가 확인되는 근거이다.",
    },
    {
      id: "volatility-weak-day-master",
      area: "volatilityResponse",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 변동과 손실 압력이 커질 때 자기 기준과 자원 배분을 유지하기 어려울 수 있는 근거이다.",
    },
  
    {
      id: "loss-recovery-rooted",
      area: "lossRecovery",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount > 0,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "손실 이후 다시 시작하고 자원을 재구성할 수 있는 내부 기반이 확인되는 근거이다.",
    },
    {
      id: "loss-recovery-supported-month-command",
      area: "lossRecovery",
      direction: "support",
      signalKinds: ["monthCommand"],
      signalMatcher: (signal) =>
        isMonthCommandSignal(signal)
        && signal.supported === true,
      sources: ["monthCommand"],
      minimumWeight: 2,
      score: 2,
      reason:
        "환경의 지원을 활용하여 손실 이후 활동과 수입 기반을 다시 세울 수 있는 근거이다.",
    },
    {
      id: "loss-recovery-unrooted",
      area: "lossRecovery",
      direction: "limit",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && !signal.rooted,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "손실을 흡수할 내부 기반이 약하여 재정적 충격 이후 원래 수준으로 복구하는 데 시간이 오래 걸릴 수 있는 근거이다.",
    },
  
    {
      id: "generation-description-support",
      area: "generation",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "수입 창출",
        "재물 생성",
        "성과 창출",
        "생산",
        "영업",
        "수익 기회",
      ],
      score: 1,
      reason:
        "설명 근거에서 활동과 성과를 수입으로 연결하는 재물 생성 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "generation-description-limit",
      area: "generation",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "수입 단절",
        "성과 부족",
        "기회 상실",
        "생산 저하",
        "소득 불안",
      ],
      score: 1,
      reason:
        "설명 근거에서 수입 생성 과정이 막히거나 불안정해질 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "repeatability-description-support",
      area: "repeatability",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "반복 수익",
        "지속 수입",
        "꾸준한 성과",
        "재현",
        "정기 수입",
        "장기 수익",
      ],
      score: 1,
      reason:
        "설명 근거에서 일회성 성과를 반복 가능한 수입으로 유지할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "repeatability-description-limit",
      area: "repeatability",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "일회성",
        "반복 어려움",
        "수입 변동",
        "성과 단절",
        "지속 어려움",
      ],
      score: 1,
      reason:
        "설명 근거에서 수입과 성과의 반복성이 약해질 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "retention-description-support",
      area: "retention",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "재물 보존",
        "돈을 지키",
        "축적",
        "저축",
        "비용 통제",
        "지출 관리",
      ],
      score: 1,
      reason:
        "설명 근거에서 들어온 재물을 보유하고 축적하는 힘을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "retention-description-limit",
      area: "retention",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "재물 누수",
        "돈이 새",
        "과소비",
        "지출 과다",
        "금전 손실",
        "확장 욕구",
      ],
      score: 1,
      reason:
        "설명 근거에서 수입이 비용·소비·무리한 확장으로 빠져나갈 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "asset-conversion-description-support",
      area: "assetConversion",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "자산 축적",
        "자산 전환",
        "장기 보유",
        "재투자",
        "복리",
        "축적 자산",
      ],
      score: 1,
      reason:
        "설명 근거에서 반복 수익을 장기 보유 자산으로 전환하는 힘을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "asset-conversion-description-limit",
      area: "assetConversion",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "자산화 실패",
        "보유 어려움",
        "단기 소비",
        "자산 처분",
        "축적 실패",
      ],
      score: 1,
      reason:
        "설명 근거에서 수입이 장기 자산으로 고정되지 못하고 소진될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "cashflow-description-support",
      area: "cashflowManagement",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "현금흐름 관리",
        "수입원 분산",
        "비용 관리",
        "자금 배분",
        "유동성 관리",
      ],
      score: 1,
      reason:
        "설명 근거에서 여러 수입과 지출 흐름을 나누어 관리하는 힘을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "cashflow-description-limit",
      area: "cashflowManagement",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "현금흐름 불안",
        "유동성 부족",
        "고정비 부담",
        "자금 경색",
        "수입 집중",
      ],
      score: 1,
      reason:
        "설명 근거에서 현금흐름이 특정 수입원이나 과도한 비용 부담으로 불안정해질 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "debt-handling-description-support",
      area: "debtHandling",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "부채 관리",
        "상환 능력",
        "고정비 통제",
        "채무 조절",
        "레버리지 통제",
      ],
      score: 1,
      reason:
        "설명 근거에서 부채와 상환 부담을 일정 범위 안에서 관리할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "debt-handling-description-limit",
      area: "debtHandling",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "부채 부담",
        "상환 압박",
        "과도한 대출",
        "고정비 과다",
        "채무 위험",
      ],
      score: 1,
      reason:
        "설명 근거에서 부채와 고정비가 재물 흐름과 선택 범위를 압박할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "volatility-description-support",
      area: "volatilityResponse",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "변동 대응",
        "위험 통제",
        "손실 제한",
        "분산 관리",
        "판단 유지",
      ],
      score: 1,
      reason:
        "설명 근거에서 수익 변동과 시장 충격 속에서도 판단과 자원 배분을 유지할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "volatility-description-limit",
      area: "volatilityResponse",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "변동성 취약",
        "감정적 투자",
        "충동적 확장",
        "과신",
        "위험 통제 부족",
      ],
      score: 1,
      reason:
        "설명 근거에서 변동과 불확실성이 커질 때 판단이 흔들리거나 손실 규모가 확대될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "loss-recovery-description-support",
      area: "lossRecovery",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "손실 복구",
        "재기",
        "재건",
        "회복",
        "다시 시작",
      ],
      score: 1,
      reason:
        "설명 근거에서 손실 이후 자원과 수입 기반을 다시 세울 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "loss-recovery-description-limit",
      area: "lossRecovery",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "회복 지연",
        "손실 누적",
        "재기 어려움",
        "기반 붕괴",
        "복구 부담",
      ],
      score: 1,
      reason:
        "설명 근거에서 손실이 누적되거나 재정 기반의 복구가 지연될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  ];
  
  function normalizeDescription(
    description: string,
  ): string {
    return description
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  
  function matchesSignal(
    rule: MoneyRule,
    evidence: MoneyEvidence,
  ): boolean {
    const requiresSignal =
      rule.signalKinds !== undefined
      || rule.signalMatcher !== undefined;
  
    if (!requiresSignal) {
      return false;
    }
  
    if (!evidence.signal) {
      return false;
    }
  
    if (
      rule.signalKinds
      && !rule.signalKinds.includes(
        evidence.signal.kind,
      )
    ) {
      return false;
    }
  
    if (
      rule.signalMatcher
      && !rule.signalMatcher(evidence.signal)
    ) {
      return false;
    }
  
    return true;
  }
  
  function matchesSource(
    rule: MoneyRule,
    evidence: MoneyEvidence,
  ): boolean {
    if (!rule.sources) {
      return false;
    }
  
    return rule.sources.includes(evidence.source);
  }
  
  function matchesWeight(
    rule: MoneyRule,
    evidence: MoneyEvidence,
  ): boolean {
    if (rule.minimumWeight === undefined) {
      return false;
    }
  
    return evidence.weight >= rule.minimumWeight;
  }
  
  function matchesKeyword(
    rule: MoneyRule,
    evidence: MoneyEvidence,
  ): boolean {
    if (
      !rule.keywords
      || rule.keywords.length === 0
    ) {
      return false;
    }
  
    const normalizedDescription =
      normalizeDescription(evidence.description);
  
    return rule.keywords.some((keyword) =>
      normalizedDescription.includes(
        keyword.toLowerCase(),
      ),
    );
  }
  
  function hasRequiredSignal(
    rule: MoneyRule,
  ): boolean {
    return (
      rule.signalKinds !== undefined
      || rule.signalMatcher !== undefined
    );
  }
  
  function hasRequiredSource(
    rule: MoneyRule,
  ): boolean {
    return rule.sources !== undefined;
  }
  
  function hasRequiredWeight(
    rule: MoneyRule,
  ): boolean {
    return rule.minimumWeight !== undefined;
  }
  
  function hasRequiredKeyword(
    rule: MoneyRule,
  ): boolean {
    return (
      rule.keywords !== undefined
      && rule.keywords.length > 0
    );
  }
  
  function isRuleMatched(
    rule: MoneyRule,
    matchBasis: MoneyRuleMatchBasis,
  ): boolean {
    if (
      hasRequiredSignal(rule)
      && !matchBasis.signalMatched
    ) {
      return false;
    }
  
    if (
      hasRequiredSource(rule)
      && !matchBasis.sourceMatched
    ) {
      return false;
    }
  
    if (
      hasRequiredWeight(rule)
      && !matchBasis.weightMatched
    ) {
      return false;
    }
  
    if (
      hasRequiredKeyword(rule)
      && !matchBasis.keywordMatched
    ) {
      return false;
    }
  
    return true;
  }
  
  export function matchMoneyRules(
    evidenceList: MoneyEvidence[],
  ): MatchedMoneyRule[] {
    const matched: MatchedMoneyRule[] = [];
  
    for (const evidence of evidenceList) {
      for (const rule of MONEY_RULES) {
        const matchBasis: MoneyRuleMatchBasis = {
          signalMatched:
            matchesSignal(rule, evidence),
  
          sourceMatched:
            matchesSource(rule, evidence),
  
          weightMatched:
            matchesWeight(rule, evidence),
  
          keywordMatched:
            matchesKeyword(rule, evidence),
        };
  
        if (!isRuleMatched(rule, matchBasis)) {
          continue;
        }
  
        matched.push({
          rule,
          evidence,
          matchBasis,
        });
      }
    }
  
    return matched;
  }