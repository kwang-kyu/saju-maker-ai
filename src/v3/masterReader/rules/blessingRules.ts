import type {
    BlessingArea,
    BlessingEvidence,
    BlessingEvidenceSource,
  } from "../types/blessing";
  import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts";
  
  export type BlessingRuleDirection =
    | "support"
    | "limit";
  
  export type BlessingSignalKind =
    SajuStructureSignal["kind"];
  
  export type BlessingSignalMatcher = (
    signal: SajuStructureSignal,
  ) => boolean;
  
  export type BlessingRule = {
    id: string;
  
    area: BlessingArea;
  
    direction: BlessingRuleDirection;
  
    signalKinds?:
      readonly BlessingSignalKind[];
  
    signalMatcher?:
      BlessingSignalMatcher;
  
    sources?:
      readonly BlessingEvidenceSource[];
  
    minimumWeight?: number;
  
    keywords?: readonly string[];
  
    score: number;
  
    reason: string;
  };
  
  export type BlessingRuleMatchBasis = {
    signalMatched: boolean;
  
    sourceMatched: boolean;
  
    weightMatched: boolean;
  
    keywordMatched: boolean;
  };
  
  export type MatchedBlessingRule = {
    rule: BlessingRule;
  
    evidence: BlessingEvidence;
  
    matchBasis: BlessingRuleMatchBasis;
  };
  
  function isDayMasterStrengthSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "dayMasterStrength" }
  > {
    return signal.kind
      === "dayMasterStrength";
  }
  
  function isMonthCommandSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "monthCommand" }
  > {
    return signal.kind
      === "monthCommand";
  }
  
  function isRootingSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "rooting" }
  > {
    return signal.kind === "rooting";
  }
  
  function isTenGodDominanceSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "tenGodDominance" }
  > {
    return signal.kind
      === "tenGodDominance";
  }
  
  function hasTenGod(
    signal: SajuStructureSignal,
    names: readonly string[],
  ): boolean {
    if (
      !isTenGodDominanceSignal(signal)
      || signal.dominantTenGod === null
    ) {
      return false;
    }
  
    const dominantTenGod =
      signal.dominantTenGod;
  
    return names.some(
      (name) =>
        dominantTenGod.includes(name),
    );
  }
  
  function signalRule(params: {
    id: string;
    area: BlessingArea;
    direction: BlessingRuleDirection;
    kinds: readonly BlessingSignalKind[];
    matcher?: BlessingSignalMatcher;
    score: number;
    reason: string;
  }): BlessingRule {
    return {
      id: params.id,
      area: params.area,
      direction: params.direction,
      signalKinds: params.kinds,
      signalMatcher: params.matcher,
      score: params.score,
      reason: params.reason,
    };
  }
  
  function keywordRule(params: {
    id: string;
    area: BlessingArea;
    direction: BlessingRuleDirection;
    keywords: readonly string[];
    score: number;
    reason: string;
  }): BlessingRule {
    return {
      id: params.id,
      area: params.area,
      direction: params.direction,
      sources: [
        "structure",
        "tenGodStrength",
        "fiveElementFlow",
        "usefulGod",
        "interaction",
      ],
      minimumWeight: 2,
      keywords: params.keywords,
      score: params.score,
      reason: params.reason,
    };
  }
  
  export const BLESSING_RULES:
    BlessingRule[] = [
      signalRule({
        id: "opportunity-balanced-support",
        area: "opportunityReception",
        direction: "support",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "balanced",
        score: 2,
        reason:
          "자기 힘과 외부 조건의 균형이 기회를 받아들이는 기반을 지원한다.",
      }),
      {
        id:
          "opportunity-useful-god-support",
  
        area:
          "opportunityReception",
  
        direction:
          "support",
  
        sources: [
          "usefulGod",
        ],
  
        minimumWeight: 2,
  
        score: 2,
  
        reason:
          "유용한 기운의 Fact는 기회가 들어오는 구조적 통로를 지원한다.",
      },
      signalRule({
        id: "opportunity-weak-limit",
        area: "opportunityReception",
        direction: "limit",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "weak",
        score: 2,
        reason:
          "자기 기반이 약하면 들어온 기회를 감당하는 범위가 제한될 수 있다.",
      }),
  
      signalRule({
        id: "benefactor-resource-support",
        area: "benefactorConnection",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          hasTenGod(
            signal,
            ["정인", "편인", "인성"],
          ),
        score: 2,
        reason:
          "인성 구조는 조언·보호·지식 제공자와 연결되는 통로를 지원한다.",
      }),
      {
        id:
          "benefactor-useful-god-support",
  
        area:
          "benefactorConnection",
  
        direction:
          "support",
  
        sources: [
          "usefulGod",
        ],
  
        minimumWeight: 2,
  
        score: 2,
  
        reason:
          "유용한 기운의 Fact는 필요한 도움과 연결되는 구조적 통로를 지원한다.",
      },
  
      signalRule({
        id: "relationship-distributed-support",
        area: "relationshipSupport",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && signal.distributed,
        score: 2,
        reason:
          "분산된 십성 구조는 여러 관계에서 지원을 교환하는 기반을 만든다.",
      }),
      signalRule({
        id: "relationship-concentrated-limit",
        area: "relationshipSupport",
        direction: "limit",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && !signal.distributed,
        score: 2,
        reason:
          "집중된 관계 구조는 지원 통로가 한쪽에 편중될 가능성을 높인다.",
      }),
  
      signalRule({
        id: "resource-resource-star-support",
        area: "resourceSupport",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          hasTenGod(
            signal,
            ["정인", "편인", "정재", "편재"],
          ),
        score: 2,
        reason:
          "인성과 재성 구조는 지식·정보·현실 자원의 유입을 지원한다.",
      }),
      {
        id:
          "resource-useful-god-support",
  
        area:
          "resourceSupport",
  
        direction:
          "support",
  
        sources: [
          "usefulGod",
        ],
  
        minimumWeight: 2,
  
        score: 2,
  
        reason:
          "유용한 기운의 Fact는 필요한 자원이 연결되는 통로를 지원한다.",
      },
  
      signalRule({
        id: "environment-month-support",
        area: "environmentSupport",
        direction: "support",
        kinds: ["monthCommand"],
        matcher: (signal) =>
            isMonthCommandSignal(signal)
            && signal.supported === true,
        score: 3,
        reason:
          "월령의 지원은 환경과 제도에서 도움을 받을 기반을 강화한다.",
      }),
      signalRule({
        id: "environment-month-limit",
        area: "environmentSupport",
        direction: "limit",
        kinds: ["monthCommand"],
        matcher: (signal) =>
            isMonthCommandSignal(signal)
            && signal.supported === false,
        score: 3,
        reason:
          "월령 지원이 약하면 환경의 도움을 안정적으로 활용하기 어려울 수 있다.",
      }),
  
      signalRule({
        id: "crisis-rooting-support",
        area: "crisisProtection",
        direction: "support",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && signal.rooted,
        score: 3,
        reason:
          "통근은 위기 상황에서 기반과 지원망이 쉽게 무너지지 않도록 돕는다.",
      }),
      signalRule({
        id: "crisis-rooting-limit",
        area: "crisisProtection",
        direction: "limit",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && !signal.rooted,
        score: 3,
        reason:
          "통근이 약하면 위기 때 활용할 내부 기반과 보호 구조가 제한될 수 있다.",
      }),
  
      signalRule({
        id: "retention-rooting-support",
        area: "blessingRetention",
        direction: "support",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && signal.rooted,
        score: 3,
        reason:
          "통근은 들어온 도움과 자원을 자기 기반으로 유지하는 힘을 지원한다.",
      }),
      signalRule({
        id: "retention-weak-limit",
        area: "blessingRetention",
        direction: "limit",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "weak",
        score: 2,
        reason:
          "자기 기반이 약하면 받은 도움을 장기적인 기반으로 유지하기 어려울 수 있다.",
      }),
  
      signalRule({
        id: "circulation-output-support",
        area: "blessingCirculation",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          hasTenGod(
            signal,
            ["식신", "상관", "식상"],
          ),
        score: 2,
        reason:
          "식상 구조는 받은 자원을 표현·생산·기여로 순환시키는 힘을 지원한다.",
      }),
      signalRule({
        id: "circulation-distributed-support",
        area: "blessingCirculation",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && signal.distributed,
        score: 2,
        reason:
          "분산된 구조는 도움과 성과가 여러 통로로 다시 순환될 가능성을 높인다.",
      }),
  
      keywordRule({
        id: "opportunity-description-support",
        area: "opportunityReception",
        direction: "support",
        keywords: [
          "기회",
          "가능성",
          "연결",
          "제안",
        ],
        score: 1,
        reason:
          "설명 근거에서 기회가 열리고 연결되는 양상이 확인된다.",
      }),
      keywordRule({
        id: "benefactor-description-support",
        area: "benefactorConnection",
        direction: "support",
        keywords: [
          "귀인",
          "조언",
          "보호",
          "도움",
        ],
        score: 1,
        reason:
          "설명 근거에서 사람을 통한 조언과 보호 통로가 확인된다.",
      }),
      keywordRule({
        id: "relationship-description-support",
        area: "relationshipSupport",
        direction: "support",
        keywords: [
          "협력",
          "관계 지원",
          "인맥",
          "상호 도움",
        ],
        score: 1,
        reason:
          "설명 근거에서 관계를 통한 상호 지원 구조가 확인된다.",
      }),
      keywordRule({
        id: "resource-description-support",
        area: "resourceSupport",
        direction: "support",
        keywords: [
          "자원",
          "정보",
          "지식",
          "현실 지원",
        ],
        score: 1,
        reason:
          "설명 근거에서 필요한 자원과 정보가 유입되는 구조가 확인된다.",
      }),
      keywordRule({
        id: "environment-description-support",
        area: "environmentSupport",
        direction: "support",
        keywords: [
          "환경 지원",
          "제도",
          "기반",
          "월령 지원",
        ],
        score: 1,
        reason:
          "설명 근거에서 환경과 제도의 지원을 활용할 기반이 확인된다.",
      }),
      keywordRule({
        id: "crisis-description-support",
        area: "crisisProtection",
        direction: "support",
        keywords: [
          "보호",
          "위기 회복",
          "버팀",
          "안전망",
        ],
        score: 1,
        reason:
          "설명 근거에서 위기 때 활용할 보호와 안전망이 확인된다.",
      }),
      keywordRule({
        id: "retention-description-support",
        area: "blessingRetention",
        direction: "support",
        keywords: [
          "유지",
          "축적",
          "정착",
          "기반으로 전환",
        ],
        score: 1,
        reason:
          "설명 근거에서 들어온 도움을 유지하고 기반으로 바꾸는 힘이 확인된다.",
      }),
      keywordRule({
        id: "circulation-description-support",
        area: "blessingCirculation",
        direction: "support",
        keywords: [
          "순환",
          "나눔",
          "기여",
          "재생산",
        ],
        score: 1,
        reason:
          "설명 근거에서 받은 자원을 기여와 성과로 순환시키는 힘이 확인된다.",
      }),
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
    rule: BlessingRule,
    evidence: BlessingEvidence,
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
    rule: BlessingRule,
    evidence: BlessingEvidence,
  ): boolean {
    return (
      rule.sources?.includes(
        evidence.source,
      )
      ?? false
    );
  }
  
  function matchesWeight(
    rule: BlessingRule,
    evidence: BlessingEvidence,
  ): boolean {
    return (
      rule.minimumWeight !== undefined
      && evidence.weight
        >= rule.minimumWeight
    );
  }
  
  function matchesKeyword(
    rule: BlessingRule,
    evidence: BlessingEvidence,
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
    rule: BlessingRule,
    basis: BlessingRuleMatchBasis,
  ): boolean {
    if (
      (
        rule.signalKinds !== undefined
        || rule.signalMatcher !== undefined
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
  
  export function matchBlessingRules(
    evidenceList: BlessingEvidence[],
  ): MatchedBlessingRule[] {
    const matched:
      MatchedBlessingRule[] = [];
  
    for (const evidence of evidenceList) {
      for (const rule of BLESSING_RULES) {
        const matchBasis:
          BlessingRuleMatchBasis = {
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