import type {
    HealthArea,
    HealthEvidence,
    HealthEvidenceSource,
  } from "../types/health.js";
  import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type HealthRuleDirection =
    | "support"
    | "limit";
  
  export type HealthSignalKind =
    SajuStructureSignal["kind"];
  
  export type HealthSignalMatcher = (
    signal: SajuStructureSignal,
  ) => boolean;
  
  export type HealthRule = {
    id: string;
  
    area: HealthArea;
  
    direction: HealthRuleDirection;
  
    signalKinds?:
      readonly HealthSignalKind[];
  
    signalMatcher?:
      HealthSignalMatcher;
  
    sources?:
      readonly HealthEvidenceSource[];
  
    minimumWeight?: number;
  
    keywords?: readonly string[];
  
    score: number;
  
    reason: string;
  };
  
  export type HealthRuleMatchBasis = {
    signalMatched: boolean;
  
    sourceMatched: boolean;
  
    weightMatched: boolean;
  
    keywordMatched: boolean;
  };
  
  export type MatchedHealthRule = {
    rule: HealthRule;
  
    evidence: HealthEvidence;
  
    matchBasis:
      HealthRuleMatchBasis;
  };
  
  function isDayMasterStrengthSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "dayMasterStrength" }
  > {
    return (
      signal.kind
        === "dayMasterStrength"
    );
  }
  
  function isTenGodDominanceSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "tenGodDominance" }
  > {
    return (
      signal.kind
        === "tenGodDominance"
    );
  }
  
  function isMonthCommandSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "monthCommand" }
  > {
    return (
      signal.kind === "monthCommand"
    );
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
      (keyword) =>
        value.includes(keyword),
    );
  }
  
  function hasTenGodDominance(
    signal: SajuStructureSignal,
    tenGods: readonly string[],
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && signal.dominantTenGod !== null
      && includesAny(
        signal.dominantTenGod,
        tenGods,
      )
    );
  }
  
  function hasOutputDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["식상", "식신", "상관"],
    );
  }
  
  function hasWealthDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["재성", "정재", "편재"],
    );
  }
  
  function hasOfficerDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["관성", "정관", "편관"],
    );
  }
  
  function hasResourceDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["인성", "정인", "편인"],
    );
  }
  
  function hasPeerDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["비겁", "비견", "겁재"],
    );
  }
  
  function isBalancedDayMaster(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isDayMasterStrengthSignal(signal)
      && signal.type === "balanced"
    );
  }
  
  function isStrongDayMaster(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isDayMasterStrengthSignal(signal)
      && signal.type === "strong"
    );
  }
  
  function isWeakDayMaster(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isDayMasterStrengthSignal(signal)
      && signal.type === "weak"
    );
  }
  
  function isSupportedMonthCommand(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isMonthCommandSignal(signal)
      && signal.supported === true
    );
  }
  
  function isUnsupportedMonthCommand(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isMonthCommandSignal(signal)
      && signal.supported === false
    );
  }
  
  function isRooted(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isRootingSignal(signal)
      && signal.rooted
    );
  }
  
  function isUnrooted(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isRootingSignal(signal)
      && !signal.rooted
    );
  }
  
  function isDistributedTenGodStructure(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && signal.distributed
    );
  }
  
  function isConcentratedTenGodStructure(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && !signal.distributed
    );
  }
  
  function defineSignalRule(
    id: string,
    area: HealthArea,
    direction: HealthRuleDirection,
    signalKinds:
      readonly HealthSignalKind[],
    signalMatcher:
      HealthSignalMatcher,
    score: number,
    reason: string,
  ): HealthRule {
    return {
      id,
      area,
      direction,
      signalKinds,
      signalMatcher,
      score,
      reason,
    };
  }
  
  const SIGNAL_RULES:
    HealthRule[] = [
      defineSignalRule(
        "vitality-balanced-support",
        "vitalityStability",
        "support",
        ["dayMasterStrength"],
        isBalancedDayMaster,
        3,
        "균형 일간은 활동과 휴식 사이의 기본 활력 안정성을 지원한다.",
      ),
      defineSignalRule(
        "vitality-strong-support",
        "vitalityStability",
        "support",
        ["dayMasterStrength"],
        isStrongDayMaster,
        3,
        "강한 일간은 활동을 시작하고 유지하는 기본 추진력을 지원한다.",
      ),
      defineSignalRule(
        "vitality-rooted-support",
        "vitalityStability",
        "support",
        ["rooting"],
        isRooted,
        3,
        "통근 구조는 활력이 쉽게 흔들리지 않도록 내부 기반을 지원한다.",
      ),
      defineSignalRule(
        "vitality-peer-support",
        "vitalityStability",
        "support",
        ["tenGodDominance"],
        hasPeerDominance,
        2,
        "비겁 중심 구조는 자기 동력과 활동 지속성을 보조한다.",
      ),
      defineSignalRule(
        "vitality-weak-limit",
        "vitalityStability",
        "limit",
        ["dayMasterStrength"],
        isWeakDayMaster,
        3,
        "약한 일간은 외부 부담이 커질 때 기본 활력의 안정성을 제한할 수 있다.",
      ),
  
      defineSignalRule(
        "stress-balanced-support",
        "stressRegulation",
        "support",
        ["dayMasterStrength"],
        isBalancedDayMaster,
        3,
        "균형 일간은 외부 압력과 자기 요구를 조정하여 스트레스 반응을 안정시키는 힘을 지원한다.",
      ),
      defineSignalRule(
        "stress-output-support",
        "stressRegulation",
        "support",
        ["tenGodDominance"],
        hasOutputDominance,
        2,
        "식상 중심 구조는 표현과 활동을 통해 긴장을 밖으로 해소하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "stress-distributed-support",
        "stressRegulation",
        "support",
        ["tenGodDominance"],
        isDistributedTenGodStructure,
        2,
        "십성이 분산된 구조는 한 가지 압력에 고정되지 않고 반응 방식을 바꾸는 힘을 지원한다.",
      ),
      defineSignalRule(
        "stress-concentrated-limit",
        "stressRegulation",
        "limit",
        ["tenGodDominance"],
        isConcentratedTenGodStructure,
        2,
        "십성이 한 기능에 집중되면 스트레스 반응이 한 방향으로 반복될 수 있다.",
      ),
      defineSignalRule(
        "stress-weak-limit",
        "stressRegulation",
        "limit",
        ["dayMasterStrength"],
        isWeakDayMaster,
        3,
        "약한 일간은 외부 요구가 누적될 때 긴장과 부담을 조절하는 힘이 제한될 수 있다.",
      ),
  
      defineSignalRule(
        "fatigue-balanced-support",
        "fatigueManagement",
        "support",
        ["dayMasterStrength"],
        isBalancedDayMaster,
        3,
        "균형 일간은 활동량과 휴식 필요를 조절하여 피로 누적을 관리하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "fatigue-rooted-support",
        "fatigueManagement",
        "support",
        ["rooting"],
        isRooted,
        2,
        "통근 구조는 활동 후에도 기반을 유지하여 피로가 급격히 누적되는 것을 완화한다.",
      ),
      defineSignalRule(
        "fatigue-resource-support",
        "fatigueManagement",
        "support",
        ["tenGodDominance"],
        hasResourceDominance,
        2,
        "인성 중심 구조는 멈추고 보충하는 과정을 통해 피로를 관리하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "fatigue-strong-limit",
        "fatigueManagement",
        "limit",
        ["dayMasterStrength"],
        isStrongDayMaster,
        1,
        "강한 일간은 활동 능력을 과신할 때 피로 신호를 늦게 알아차릴 수 있다.",
      ),
      defineSignalRule(
        "fatigue-weak-limit",
        "fatigueManagement",
        "limit",
        ["dayMasterStrength"],
        isWeakDayMaster,
        3,
        "약한 일간은 회복 전에 부담이 추가되면 피로가 빠르게 누적될 수 있다.",
      ),
      defineSignalRule(
        "fatigue-peer-limit",
        "fatigueManagement",
        "limit",
        ["tenGodDominance"],
        hasPeerDominance,
        1,
        "비겁 중심 구조는 경쟁과 자기 추진이 강해질 때 휴식 시점을 놓칠 수 있다.",
      ),
  
      defineSignalRule(
        "recovery-rooted-support",
        "recoveryCapacity",
        "support",
        ["rooting"],
        isRooted,
        3,
        "통근 구조는 소진 뒤 다시 안정 상태로 돌아오는 내부 회복 기반을 지원한다.",
      ),
      defineSignalRule(
        "recovery-resource-support",
        "recoveryCapacity",
        "support",
        ["tenGodDominance"],
        hasResourceDominance,
        3,
        "인성 중심 구조는 휴식과 보충을 통해 에너지를 회복하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "recovery-month-support",
        "recoveryCapacity",
        "support",
        ["monthCommand"],
        isSupportedMonthCommand,
        2,
        "월령 지원은 회복에 필요한 환경적 기반과 리듬을 지원한다.",
      ),
      defineSignalRule(
        "recovery-unrooted-limit",
        "recoveryCapacity",
        "limit",
        ["rooting"],
        isUnrooted,
        3,
        "무근 구조는 소진 뒤 안정 상태로 돌아오는 내부 기반을 제한할 수 있다.",
      ),
  
      defineSignalRule(
        "rhythm-month-support",
        "rhythmMaintenance",
        "support",
        ["monthCommand"],
        isSupportedMonthCommand,
        3,
        "월령 지원은 활동과 휴식의 생활 리듬을 일정하게 유지하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "rhythm-rooted-support",
        "rhythmMaintenance",
        "support",
        ["rooting"],
        isRooted,
        2,
        "통근 구조는 환경 변화 속에서도 기본 생활 리듬을 유지하는 기반을 지원한다.",
      ),
      defineSignalRule(
        "rhythm-officer-support",
        "rhythmMaintenance",
        "support",
        ["tenGodDominance"],
        hasOfficerDominance,
        2,
        "관성 중심 구조는 규칙과 일정에 맞춰 생활 리듬을 관리하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "rhythm-unsupported-limit",
        "rhythmMaintenance",
        "limit",
        ["monthCommand"],
        isUnsupportedMonthCommand,
        3,
        "월령 비지원은 환경 변화에 따라 활동과 휴식 리듬이 흔들릴 가능성을 높인다.",
      ),
  
      defineSignalRule(
        "overload-strong-support",
        "overloadTolerance",
        "support",
        ["dayMasterStrength"],
        isStrongDayMaster,
        3,
        "강한 일간은 일정 수준의 장기 압력과 활동 부담을 견디는 힘을 지원한다.",
      ),
      defineSignalRule(
        "overload-balanced-support",
        "overloadTolerance",
        "support",
        ["dayMasterStrength"],
        isBalancedDayMaster,
        3,
        "균형 일간은 부담을 조절하면서 장기 압력을 감당하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "overload-rooted-support",
        "overloadTolerance",
        "support",
        ["rooting"],
        isRooted,
        2,
        "통근 구조는 장기 압박 속에서도 기반이 급격히 흔들리지 않도록 지원한다.",
      ),
      defineSignalRule(
        "overload-weak-limit",
        "overloadTolerance",
        "limit",
        ["dayMasterStrength"],
        isWeakDayMaster,
        3,
        "약한 일간은 외부 부담이 장기간 지속될 때 과부하 감당력이 제한될 수 있다.",
      ),
  
      defineSignalRule(
        "habit-officer-support",
        "habitSelfManagement",
        "support",
        ["tenGodDominance"],
        hasOfficerDominance,
        3,
        "관성 중심 구조는 규칙과 기준을 통해 생활 습관을 관리하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "habit-wealth-support",
        "habitSelfManagement",
        "support",
        ["tenGodDominance"],
        hasWealthDominance,
        2,
        "재성 중심 구조는 현실적인 시간과 자원 배분을 통해 생활 습관을 관리하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "habit-distributed-support",
        "habitSelfManagement",
        "support",
        ["tenGodDominance"],
        isDistributedTenGodStructure,
        2,
        "십성이 분산된 구조는 상황에 맞춰 생활 관리 방식을 조정하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "habit-concentrated-limit",
        "habitSelfManagement",
        "limit",
        ["tenGodDominance"],
        isConcentratedTenGodStructure,
        2,
        "십성이 한 기능에 집중되면 특정 활동에 몰입하여 생활 관리가 한쪽으로 치우칠 수 있다.",
      ),
  
      defineSignalRule(
        "adaptation-balanced-support",
        "imbalanceAdaptation",
        "support",
        ["dayMasterStrength"],
        isBalancedDayMaster,
        3,
        "균형 일간은 환경 변화에 따라 활동과 회복 방식을 조정하는 힘을 지원한다.",
      ),
      defineSignalRule(
        "adaptation-month-support",
        "imbalanceAdaptation",
        "support",
        ["monthCommand"],
        isSupportedMonthCommand,
        3,
        "월령 지원은 계절과 환경 변화에 안정적으로 적응하는 기반을 지원한다.",
      ),
      defineSignalRule(
        "adaptation-distributed-support",
        "imbalanceAdaptation",
        "support",
        ["tenGodDominance"],
        isDistributedTenGodStructure,
        2,
        "십성이 분산된 구조는 한 가지 반응에 고정되지 않고 적응 방식을 바꾸는 힘을 지원한다.",
      ),
      defineSignalRule(
        "adaptation-unsupported-limit",
        "imbalanceAdaptation",
        "limit",
        ["monthCommand"],
        isUnsupportedMonthCommand,
        3,
        "월령 비지원은 환경 변화에 대한 적응 과정에서 리듬이 흔들릴 가능성을 높인다.",
      ),
      defineSignalRule(
        "adaptation-weak-limit",
        "imbalanceAdaptation",
        "limit",
        ["dayMasterStrength"],
        isWeakDayMaster,
        2,
        "약한 일간은 환경 변화와 외부 부담이 동시에 커질 때 적응력이 제한될 수 있다.",
      ),
    ];
  
  const DESCRIPTION_SOURCES:
    readonly HealthEvidenceSource[] = [
      "structure",
      "tenGodStrength",
      "fiveElementFlow",
      "rooting",
      "usefulGod",
      "interaction",
    ];
  
  type DescriptionRuleDefinition = {
    area: HealthArea;
  
    supportKeywords: readonly string[];
  
    limitKeywords: readonly string[];
  };
  
  const DESCRIPTION_RULE_DEFINITIONS:
    DescriptionRuleDefinition[] = [
      {
        area: "vitalityStability",
        supportKeywords: [
          "활력",
          "기력 유지",
          "에너지 안정",
          "체력 기반",
          "지속력",
        ],
        limitKeywords: [
          "활력 저하",
          "기력 약화",
          "에너지 부족",
          "쉽게 지침",
          "체력 부담",
        ],
      },
      {
        area: "stressRegulation",
        supportKeywords: [
          "스트레스 조절",
          "긴장 해소",
          "압력 조정",
          "감정 안정",
          "부담 조절",
        ],
        limitKeywords: [
          "스트레스 누적",
          "긴장 지속",
          "압박",
          "예민",
          "부담 집중",
        ],
      },
      {
        area: "fatigueManagement",
        supportKeywords: [
          "피로 관리",
          "휴식 조절",
          "활동량 조절",
          "피로 해소",
          "에너지 배분",
        ],
        limitKeywords: [
          "피로 누적",
          "과로",
          "휴식 부족",
          "소진",
          "무리한 활동",
        ],
      },
      {
        area: "recoveryCapacity",
        supportKeywords: [
          "회복력",
          "회복 기반",
          "재충전",
          "보충",
          "안정 회복",
        ],
        limitKeywords: [
          "회복 지연",
          "회복 부족",
          "소진 지속",
          "재충전 어려움",
          "회복 기반 약화",
        ],
      },
      {
        area: "rhythmMaintenance",
        supportKeywords: [
          "생활 리듬",
          "수면 리듬",
          "규칙적인 생활",
          "활동 주기",
          "휴식 주기",
        ],
        limitKeywords: [
          "리듬 불안정",
          "수면 부족",
          "불규칙",
          "생활 주기 혼란",
          "밤낮 변화",
        ],
      },
      {
        area: "overloadTolerance",
        supportKeywords: [
          "압박 감당",
          "과부하 조절",
          "장기 지속",
          "부담 유지",
          "책임 지속",
        ],
        limitKeywords: [
          "과부하",
          "책임 과중",
          "장기 압박",
          "버티기 어려움",
          "부담 초과",
        ],
      },
      {
        area: "habitSelfManagement",
        supportKeywords: [
          "생활 습관",
          "자기 관리",
          "규칙 유지",
          "건강 관리",
          "일정 관리",
        ],
        limitKeywords: [
          "습관 불안정",
          "관리 부족",
          "과도한 몰입",
          "생활 방치",
          "불규칙한 습관",
        ],
      },
      {
        area: "imbalanceAdaptation",
        supportKeywords: [
          "환경 적응",
          "변화 적응",
          "균형 회복",
          "계절 적응",
          "상태 조절",
        ],
        limitKeywords: [
          "환경 변화 부담",
          "적응 어려움",
          "불균형",
          "변화 취약",
          "리듬 변화",
        ],
      },
    ];
  
  function buildDescriptionRules():
    HealthRule[] {
    return DESCRIPTION_RULE_DEFINITIONS
      .flatMap(
        (
          definition,
        ): HealthRule[] => [
          {
            id:
              `${definition.area}-description-support`,
            area: definition.area,
            direction: "support",
            sources:
              DESCRIPTION_SOURCES,
            minimumWeight: 2,
            keywords:
              definition.supportKeywords,
            score: 1,
            reason:
              `${definition.area} 영역을 지원하는 설명 근거가 확인된다.`,
          },
          {
            id:
              `${definition.area}-description-limit`,
            area: definition.area,
            direction: "limit",
            sources:
              DESCRIPTION_SOURCES,
            minimumWeight: 2,
            keywords:
              definition.limitKeywords,
            score: 1,
            reason:
              `${definition.area} 영역을 제한하는 설명 근거가 확인된다.`,
          },
        ],
      );
  }
  
  export const HEALTH_RULES:
    readonly HealthRule[] = [
      ...SIGNAL_RULES,
      ...buildDescriptionRules(),
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
    rule: HealthRule,
    evidence: HealthEvidence,
  ): boolean {
    const requiresSignal =
      rule.signalKinds !== undefined
      || rule.signalMatcher !== undefined;
  
    if (
      !requiresSignal
      || !evidence.signal
    ) {
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
      && !rule.signalMatcher(
        evidence.signal,
      )
    ) {
      return false;
    }
  
    return true;
  }
  
  function matchesSource(
    rule: HealthRule,
    evidence: HealthEvidence,
  ): boolean {
    return (
      rule.sources?.includes(
        evidence.source,
      )
      ?? false
    );
  }
  
  function matchesWeight(
    rule: HealthRule,
    evidence: HealthEvidence,
  ): boolean {
    return (
      rule.minimumWeight !== undefined
      && evidence.weight
        >= rule.minimumWeight
    );
  }
  
  function matchesKeyword(
    rule: HealthRule,
    evidence: HealthEvidence,
  ): boolean {
    if (
      !rule.keywords
      || rule.keywords.length === 0
    ) {
      return false;
    }
  
    const normalized =
      normalizeDescription(
        evidence.description,
      );
  
    return rule.keywords.some(
      (keyword) =>
        normalized.includes(
          keyword.toLowerCase(),
        ),
    );
  }
  
  function isRuleMatched(
    rule: HealthRule,
    basis: HealthRuleMatchBasis,
  ): boolean {
    if (
      (
        rule.signalKinds !== undefined
        || rule.signalMatcher
          !== undefined
      )
      && !basis.signalMatched
    ) {
      return false;
    }
  
    if (
      rule.sources !== undefined
      && !basis.sourceMatched
    ) {
      return false;
    }
  
    if (
      rule.minimumWeight !== undefined
      && !basis.weightMatched
    ) {
      return false;
    }
  
    if (
      rule.keywords !== undefined
      && rule.keywords.length > 0
      && !basis.keywordMatched
    ) {
      return false;
    }
  
    return true;
  }
  
  export function matchHealthRules(
    evidenceList: HealthEvidence[],
  ): MatchedHealthRule[] {
    const matched:
      MatchedHealthRule[] = [];
  
    for (const evidence of evidenceList) {
      for (const rule of HEALTH_RULES) {
        const matchBasis:
          HealthRuleMatchBasis = {
            signalMatched:
              matchesSignal(
                rule,
                evidence,
              ),
  
            sourceMatched:
              matchesSource(
                rule,
                evidence,
              ),
  
            weightMatched:
              matchesWeight(
                rule,
                evidence,
              ),
  
            keywordMatched:
              matchesKeyword(
                rule,
                evidence,
              ),
          };
  
        if (
          !isRuleMatched(
            rule,
            matchBasis,
          )
        ) {
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