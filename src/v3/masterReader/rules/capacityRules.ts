import type {
    CapacityArea,
    CapacityEvidence,
    CapacityEvidenceSource,
  } from "../types/capacity";
  import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts";
  
  export type CapacityRuleDirection =
    | "support"
    | "limit";
  
  export type CapacitySignalKind =
    SajuStructureSignal["kind"];
  
  export type CapacitySignalMatcher = (
    signal: SajuStructureSignal,
  ) => boolean;
  
  export type CapacityRule = {
    id: string;
  
    area: CapacityArea;
  
    direction: CapacityRuleDirection;
  
    signalKinds?: readonly CapacitySignalKind[];
  
    signalMatcher?: CapacitySignalMatcher;
  
    sources?: readonly CapacityEvidenceSource[];
  
    minimumWeight?: number;
  
    keywords?: readonly string[];
  
    score: number;
  
    reason: string;
  };
  
  export type CapacityRuleMatchBasis = {
    signalMatched: boolean;
  
    sourceMatched: boolean;
  
    weightMatched: boolean;
  
    keywordMatched: boolean;
  };
  
  export type MatchedCapacityRule = {
    rule: CapacityRule;
  
    evidence: CapacityEvidence;
  
    matchBasis: CapacityRuleMatchBasis;
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
  
  export const CAPACITY_RULES: CapacityRule[] = [
    {
      id: "responsibility-strong-day-master",
      area: "responsibility",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "strong"
        && signal.score > 0,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "자기 통제력과 외부 압력을 견디는 힘이 확인되어 책임을 맡을 수 있는 범위가 넓어지는 근거이다.",
    },
    {
      id: "responsibility-balanced-day-master",
      area: "responsibility",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "balanced",
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 2,
      reason:
        "지원과 부담이 한쪽으로 과도하게 기울지 않아 책임을 안정적으로 유지할 수 있는 근거이다.",
    },
    {
      id: "responsibility-weak-day-master",
      area: "responsibility",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak",
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 요구가 자기 자원보다 커질 가능성이 있어 책임이 누적될수록 과부하가 발생할 수 있는 근거이다.",
    },
    {
      id: "responsibility-rooted",
      area: "responsibility",
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
        "내부 기반과 버티는 힘이 확인되어 맡은 책임을 지속할 수 있는 근거이다.",
    },
    {
      id: "responsibility-not-rooted",
      area: "responsibility",
      direction: "limit",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && !signal.rooted,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 2,
      reason:
        "내부 지지 기반이 약해 책임 범위가 넓어질수록 유지력이 떨어질 수 있는 근거이다.",
    },
  
    {
      id: "money-wealth-dominance",
      area: "money",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && signal.dominantTenGod !== null
        && (
          signal.dominantTenGod.includes("재성")
          || signal.dominantTenGod.includes("정재")
          || signal.dominantTenGod.includes("편재")
        ),
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "재물과 자원의 흐름을 인식하고 다루는 성향이 뚜렷해 금전 관리 범위가 넓어질 수 있는 근거이다.",
    },
    {
      id: "money-distributed-structure",
      area: "money",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && signal.distributed,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "한 가지 재물 흐름에 과도하게 집중되지 않아 자원을 분산하여 관리할 수 있는 근거이다.",
    },
    {
      id: "money-weak-day-master-pressure",
      area: "money",
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
        "자기 자원보다 외부 부담이 강해 큰 금액이나 복잡한 현금흐름을 동시에 감당할 때 압박이 커질 수 있는 근거이다.",
    },
  
    {
      id: "organization-officer-dominance",
      area: "organization",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && signal.dominantTenGod !== null
        && (
          signal.dominantTenGod.includes("관성")
          || signal.dominantTenGod.includes("정관")
          || signal.dominantTenGod.includes("편관")
        ),
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "규칙과 역할 구조를 인식하는 힘이 강해 조직 안에서 책임과 질서를 감당할 수 있는 근거이다.",
    },
    {
      id: "organization-resource-dominance",
      area: "organization",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && signal.dominantTenGod !== null
        && (
          signal.dominantTenGod.includes("인성")
          || signal.dominantTenGod.includes("정인")
          || signal.dominantTenGod.includes("편인")
        ),
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "정보와 체계를 이해하고 정리하는 힘이 있어 조직 구조를 운영하거나 지원할 수 있는 근거이다.",
    },
    {
      id: "organization-overconcentrated-dominance",
      area: "organization",
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
        "한 역할이나 기능에 힘이 과도하게 집중되어 조직 전체를 균형 있게 조율할 때 편중이 생길 수 있는 근거이다.",
    },
  
    {
      id: "relationship-distributed-structure",
      area: "relationship",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && signal.distributed
        && signal.totalCount > 0,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "역할과 관계 에너지가 분산되어 여러 사람의 입장과 요구를 조율할 수 있는 근거이다.",
    },
    {
      id: "relationship-balanced-day-master",
      area: "relationship",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "balanced",
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 2,
      reason:
        "자기 주장과 타인의 요구 사이의 균형을 유지할 수 있어 관계 부담을 감당하기 쉬운 근거이다.",
    },
    {
      id: "relationship-weak-day-master",
      area: "relationship",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 2,
      reason:
        "타인의 요구와 관계 압력이 자기 기준보다 강해질 경우 관계 피로가 누적될 수 있는 근거이다.",
    },
  
    {
      id: "risk-strong-rooted",
      area: "risk",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount >= 2,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "손실이나 변동이 발생해도 버틸 수 있는 내부 기반이 확인되어 일정 수준의 위험을 감당할 수 있는 근거이다.",
    },
    {
      id: "risk-balanced-day-master",
      area: "risk",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "balanced"
        && signal.supportScore >= signal.opposingScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 2,
      reason:
        "지원 자원과 외부 압력의 균형이 유지되어 변화와 손실을 일정 범위 안에서 흡수할 수 있는 근거이다.",
    },
    {
      id: "risk-weak-unrooted",
      area: "risk",
      direction: "limit",
      signalKinds: ["dayMasterStrength", "rooting"],
      signalMatcher: (signal) => {
        if (isDayMasterStrengthSignal(signal)) {
          return (
            signal.type === "weak"
            && signal.opposingScore > signal.supportScore
          );
        }
  
        if (isRootingSignal(signal)) {
          return !signal.rooted;
        }
  
        return false;
      },
      sources: ["dayMasterStrength", "rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 부담에 비해 자기 기반이 약해 손실과 변동이 커질수록 회복력이 빠르게 저하될 수 있는 근거이다.",
    },
  
    {
      id: "time-supported-month-command",
      area: "time",
      direction: "support",
      signalKinds: ["monthCommand"],
      signalMatcher: (signal) =>
        isMonthCommandSignal(signal)
        && signal.supported === true,
      sources: ["monthCommand"],
      minimumWeight: 2,
      score: 3,
      reason:
        "환경과 계절의 지원을 받아 일정 기간 동안 힘을 유지하고 시간을 견딜 수 있는 근거이다.",
    },
    {
      id: "time-rooted-continuity",
      area: "time",
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
        "지속성을 뒷받침하는 내부 기반이 있어 단기 성과보다 장기 유지에 힘을 쓸 수 있는 근거이다.",
    },
    {
      id: "time-unsupported-month-command",
      area: "time",
      direction: "limit",
      signalKinds: ["monthCommand"],
      signalMatcher: (signal) =>
        isMonthCommandSignal(signal)
        && signal.supported === false,
      sources: ["monthCommand"],
      minimumWeight: 2,
      score: 3,
      reason:
        "환경적 지원이 부족하여 같은 강도의 책임과 활동을 장기간 유지하기 어려울 수 있는 근거이다.",
    },
  
    {
      id: "responsibility-description-support",
      area: "responsibility",
      direction: "support",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "책임",
        "지속",
        "유지",
        "관리",
        "통제",
        "인내",
      ],
      score: 1,
      reason:
        "설명 근거에서 책임과 지속 능력을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "responsibility-description-limit",
      area: "responsibility",
      direction: "limit",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "과부하",
        "부담",
        "소진",
        "압박",
        "과도",
      ],
      score: 1,
      reason:
        "설명 근거에서 책임 누적에 따른 부담 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "money-description-support",
      area: "money",
      direction: "support",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "재물",
        "금전",
        "현금",
        "자원",
        "축적",
        "관리",
      ],
      score: 1,
      reason:
        "설명 근거에서 재물과 자원 관리 능력을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "money-description-limit",
      area: "money",
      direction: "limit",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "재물 손실",
        "금전 부담",
        "누수",
        "과소비",
        "변동",
      ],
      score: 1,
      reason:
        "설명 근거에서 금전 흐름의 불안정 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "organization-description-support",
      area: "organization",
      direction: "support",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "조직",
        "체계",
        "규칙",
        "조율",
        "운영",
        "관리",
      ],
      score: 1,
      reason:
        "설명 근거에서 조직과 체계를 다루는 능력을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "organization-description-limit",
      area: "organization",
      direction: "limit",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "충돌",
        "통제 갈등",
        "역할 혼선",
        "조직 피로",
        "불균형",
      ],
      score: 1,
      reason:
        "설명 근거에서 조직 운영 과정의 충돌 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "relationship-description-support",
      area: "relationship",
      direction: "support",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "관계",
        "협력",
        "조율",
        "연결",
        "배려",
        "소통",
      ],
      score: 1,
      reason:
        "설명 근거에서 관계를 조율하고 유지하는 능력을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "relationship-description-limit",
      area: "relationship",
      direction: "limit",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "관계 부담",
        "갈등",
        "단절",
        "의존",
        "피로",
      ],
      score: 1,
      reason:
        "설명 근거에서 관계 부담과 갈등 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "risk-description-support",
      area: "risk",
      direction: "support",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "rooting",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "회복",
        "대응",
        "버팀",
        "변화 적응",
        "위기 대응",
      ],
      score: 1,
      reason:
        "설명 근거에서 변동과 손실에 대응할 수 있는 능력을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "risk-description-limit",
      area: "risk",
      direction: "limit",
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "rooting",
        "interaction",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "회복 지연",
        "취약",
        "손실",
        "불안정",
        "붕괴",
      ],
      score: 1,
      reason:
        "설명 근거에서 위험 발생 후 회복이 지연될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "time-description-support",
      area: "time",
      direction: "support",
      sources: [
        "monthCommand",
        "dayMasterStrength",
        "structure",
        "fiveElementFlow",
        "rooting",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "장기",
        "지속",
        "유지",
        "축적",
        "점진",
        "안정",
      ],
      score: 1,
      reason:
        "설명 근거에서 시간을 두고 힘을 유지할 수 있는 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "time-description-limit",
      area: "time",
      direction: "limit",
      sources: [
        "monthCommand",
        "dayMasterStrength",
        "structure",
        "fiveElementFlow",
        "rooting",
        "usefulGod",
      ],
      minimumWeight: 2,
      keywords: [
        "단기",
        "급격",
        "소진",
        "지연",
        "유지 어려움",
      ],
      score: 1,
      reason:
        "설명 근거에서 장기 유지가 어려워질 가능성을 보조적으로 확인할 수 있는 근거이다.",
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
    rule: CapacityRule,
    evidence: CapacityEvidence,
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
      && !rule.signalKinds.includes(evidence.signal.kind)
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
    rule: CapacityRule,
    evidence: CapacityEvidence,
  ): boolean {
    if (!rule.sources) {
      return false;
    }
  
    return rule.sources.includes(evidence.source);
  }
  
  function matchesWeight(
    rule: CapacityRule,
    evidence: CapacityEvidence,
  ): boolean {
    if (rule.minimumWeight === undefined) {
      return false;
    }
  
    return evidence.weight >= rule.minimumWeight;
  }
  
  function matchesKeyword(
    rule: CapacityRule,
    evidence: CapacityEvidence,
  ): boolean {
    if (!rule.keywords || rule.keywords.length === 0) {
      return false;
    }
  
    const normalizedDescription = normalizeDescription(
      evidence.description,
    );
  
    return rule.keywords.some((keyword) =>
      normalizedDescription.includes(
        keyword.toLowerCase(),
      ),
    );
  }
  
  function hasRequiredSignal(
    rule: CapacityRule,
  ): boolean {
    return (
      rule.signalKinds !== undefined
      || rule.signalMatcher !== undefined
    );
  }
  
  function hasRequiredSource(
    rule: CapacityRule,
  ): boolean {
    return rule.sources !== undefined;
  }
  
  function hasRequiredWeight(
    rule: CapacityRule,
  ): boolean {
    return rule.minimumWeight !== undefined;
  }
  
  function hasRequiredKeyword(
    rule: CapacityRule,
  ): boolean {
    return (
      rule.keywords !== undefined
      && rule.keywords.length > 0
    );
  }
  
  function isRuleMatched(
    rule: CapacityRule,
    matchBasis: CapacityRuleMatchBasis,
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
  
  export function matchCapacityRules(
    evidenceList: CapacityEvidence[],
  ): MatchedCapacityRule[] {
    const matched: MatchedCapacityRule[] = [];
  
    for (const evidence of evidenceList) {
      for (const rule of CAPACITY_RULES) {
        const matchBasis: CapacityRuleMatchBasis = {
          signalMatched: matchesSignal(rule, evidence),
          sourceMatched: matchesSource(rule, evidence),
          weightMatched: matchesWeight(rule, evidence),
          keywordMatched: matchesKeyword(rule, evidence),
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