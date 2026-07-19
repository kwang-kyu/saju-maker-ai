import type {
    DestinyArea,
    DestinyEvidence,
    DestinyEvidenceSource,
  } from "../types/destiny";
  import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts";
  
  export type DestinyRuleDirection =
    | "support"
    | "limit";
  
  export type DestinySignalKind =
    SajuStructureSignal["kind"];
  
  export type DestinySignalMatcher = (
    signal: SajuStructureSignal,
  ) => boolean;
  
  export type DestinyRule = {
    id: string;
  
    area: DestinyArea;
  
    direction: DestinyRuleDirection;
  
    signalKinds?:
      readonly DestinySignalKind[];
  
    signalMatcher?:
      DestinySignalMatcher;
  
    sources?:
      readonly DestinyEvidenceSource[];
  
    minimumWeight?: number;
  
    score: number;
  
    reason: string;
  };
  
  export type DestinyRuleMatchBasis = {
    signalMatched: boolean;
  
    sourceMatched: boolean;
  
    weightMatched: boolean;
  };
  
  export type MatchedDestinyRule = {
    rule: DestinyRule;
  
    evidence: DestinyEvidence;
  
    matchBasis: DestinyRuleMatchBasis;
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
    area: DestinyArea;
    direction: DestinyRuleDirection;
    kinds: readonly DestinySignalKind[];
    matcher?: DestinySignalMatcher;
    score: number;
    reason: string;
  }): DestinyRule {
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
  
  function sourceRule(params: {
    id: string;
    area: DestinyArea;
    direction: DestinyRuleDirection;
    sources: readonly DestinyEvidenceSource[];
    minimumWeight: number;
    score: number;
    reason: string;
  }): DestinyRule {
    return {
      id: params.id,
  
      area: params.area,
  
      direction: params.direction,
  
      sources: params.sources,
  
      minimumWeight:
        params.minimumWeight,
  
      score: params.score,
  
      reason: params.reason,
    };
  }
  
  export const DESTINY_RULES:
    DestinyRule[] = [
      signalRule({
        id: "life-direction-balanced-support",
        area: "lifeDirection",
        direction: "support",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "balanced",
        score: 3,
        reason:
          "자기 힘과 외부 조건의 균형은 삶의 방향을 현실과 조율하며 유지하는 기반을 지원한다.",
      }),
  
      signalRule({
        id: "life-direction-strong-support",
        area: "lifeDirection",
        direction: "support",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "strong",
        score: 2,
        reason:
          "자기 추진 기반이 강하면 외부 변화 속에서도 자신의 장기 방향을 세울 수 있다.",
      }),
  
      signalRule({
        id: "life-direction-weak-limit",
        area: "lifeDirection",
        direction: "limit",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "weak",
        score: 3,
        reason:
          "자기 기반보다 외부 부담이 크면 삶의 방향이 환경과 책임에 따라 흔들릴 수 있다.",
      }),
  
      sourceRule({
        id: "life-direction-useful-god-support",
        area: "lifeDirection",
        direction: "support",
        sources: ["usefulGod"],
        minimumWeight: 2,
        score: 2,
        reason:
          "유용한 기운의 구조적 Fact는 장기 방향을 구체화하는 보조 기반을 제공한다.",
      }),
  
      signalRule({
        id: "core-task-balanced-support",
        area: "coreLifeTask",
        direction: "support",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "balanced",
        score: 2,
        reason:
          "균형 잡힌 자기 기반은 반복되는 과제를 인식하고 조정하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "core-task-distributed-support",
        area: "coreLifeTask",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && signal.distributed,
        score: 2,
        reason:
          "분산된 십성 구조는 한 가지 방식에 고착되지 않고 반복 과제를 여러 관점에서 다루게 한다.",
      }),
  
      signalRule({
        id: "core-task-concentrated-limit",
        area: "coreLifeTask",
        direction: "limit",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && !signal.distributed,
        score: 2,
        reason:
          "집중된 십성 구조는 특정 강점과 선택 방식이 반복적인 한계로 굳어질 가능성을 높인다.",
      }),
  
      signalRule({
        id: "core-task-weak-limit",
        area: "coreLifeTask",
        direction: "limit",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "weak",
        score: 2,
        reason:
          "외부 부담이 자기 기반보다 크면 핵심 과제를 다루기보다 당장의 책임에 끌려갈 수 있다.",
      }),
  
      signalRule({
        id: "strength-fulfillment-strong-support",
        area: "strengthFulfillment",
        direction: "support",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "strong",
        score: 3,
        reason:
          "강한 자기 기반은 타고난 강점을 주도적인 역할과 지속적인 결과로 연결하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "strength-fulfillment-balanced-support",
        area: "strengthFulfillment",
        direction: "support",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "balanced",
        score: 2,
        reason:
          "균형 잡힌 자기 기반은 강점을 현실 조건에 맞게 조절하여 발현하도록 돕는다.",
      }),
  
      signalRule({
        id: "strength-fulfillment-rooting-support",
        area: "strengthFulfillment",
        direction: "support",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && signal.rooted,
        score: 2,
        reason:
          "통근은 타고난 강점을 일회성 성과가 아니라 지속 가능한 능력으로 정착시키는 기반을 지원한다.",
      }),
  
      signalRule({
        id: "strength-fulfillment-weak-limit",
        area: "strengthFulfillment",
        direction: "limit",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "weak",
        score: 3,
        reason:
          "자기 기반이 약하면 타고난 강점이 외부 부담을 처리하는 데 소모될 수 있다.",
      }),
  
      signalRule({
        id: "growth-path-rooting-support",
        area: "growthPath",
        direction: "support",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && signal.rooted,
        score: 3,
        reason:
          "통근은 경험과 성과를 자기 기반으로 축적하며 장기적으로 성장하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "growth-path-rooting-limit",
        area: "growthPath",
        direction: "limit",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && !signal.rooted,
        score: 3,
        reason:
          "통근이 약하면 경험과 성과가 축적되지 못하고 변화 때마다 기반을 다시 만들어야 할 수 있다.",
      }),
  
      signalRule({
        id: "growth-path-month-support",
        area: "growthPath",
        direction: "support",
        kinds: ["monthCommand"],
        matcher: (signal) =>
          isMonthCommandSignal(signal)
          && signal.supported === true,
        score: 2,
        reason:
          "월령의 지원은 자신의 성장 방식과 환경 조건이 연결될 가능성을 높인다.",
      }),
  
      signalRule({
        id: "growth-path-month-limit",
        area: "growthPath",
        direction: "limit",
        kinds: ["monthCommand"],
        matcher: (signal) =>
          isMonthCommandSignal(signal)
          && signal.supported === false,
        score: 2,
        reason:
          "월령의 지원이 약하면 환경에 맞추는 과정에서 성장 방향이 분산될 수 있다.",
      }),
  
      signalRule({
        id: "choice-alignment-balanced-support",
        area: "choiceAlignment",
        direction: "support",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "balanced",
        score: 3,
        reason:
          "자기 힘과 외부 조건의 균형은 가능성과 감당 범위를 함께 고려하는 선택을 지원한다.",
      }),
  
      signalRule({
        id: "choice-alignment-distributed-support",
        area: "choiceAlignment",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && signal.distributed,
        score: 2,
        reason:
          "분산된 십성 구조는 여러 기준을 비교하여 자기 구조와 맞는 선택을 찾도록 돕는다.",
      }),
  
      signalRule({
        id: "choice-alignment-concentrated-limit",
        area: "choiceAlignment",
        direction: "limit",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && !signal.distributed,
        score: 2,
        reason:
          "집중된 십성 구조는 익숙한 강점과 욕구만을 기준으로 선택하게 만들 수 있다.",
      }),
  
      signalRule({
        id: "choice-alignment-weak-limit",
        area: "choiceAlignment",
        direction: "limit",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "weak",
        score: 3,
        reason:
          "자기 기반이 약하면 자신의 장기 방향보다 외부 요구를 우선하여 선택할 수 있다.",
      }),
  
      sourceRule({
        id: "choice-alignment-useful-god-support",
        area: "choiceAlignment",
        direction: "support",
        sources: ["usefulGod"],
        minimumWeight: 2,
        score: 2,
        reason:
          "유용한 기운의 구조적 Fact는 자기 구조에 맞는 선택 기준을 구체화하는 보조 근거가 된다.",
      }),
  
      signalRule({
        id: "change-integration-rooting-support",
        area: "changeIntegration",
        direction: "support",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && signal.rooted,
        score: 3,
        reason:
          "통근은 변화가 생겨도 기존 경험을 잃지 않고 새로운 구조에 결합하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "change-integration-rooting-limit",
        area: "changeIntegration",
        direction: "limit",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && !signal.rooted,
        score: 3,
        reason:
          "통근이 약하면 변화 과정에서 기존 경험과 생활 기반이 단절될 수 있다.",
      }),
  
      signalRule({
        id: "change-integration-distributed-support",
        area: "changeIntegration",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && signal.distributed,
        score: 2,
        reason:
          "분산된 십성 구조는 변화에 대응할 수 있는 여러 역할과 해결 방식을 제공한다.",
      }),
  
      signalRule({
        id: "change-integration-concentrated-limit",
        area: "changeIntegration",
        direction: "limit",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          isTenGodDominanceSignal(signal)
          && !signal.distributed,
        score: 2,
        reason:
          "집중된 십성 구조는 익숙한 역할이 바뀔 때 적응 범위를 제한할 수 있다.",
      }),
  
      signalRule({
        id: "contribution-output-support",
        area: "contributionPattern",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          hasTenGod(
            signal,
            ["식신", "상관", "식상"],
          ),
        score: 3,
        reason:
          "식상 구조는 경험과 능력을 표현·생산·성과로 전환하여 외부에 제공하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "contribution-wealth-support",
        area: "contributionPattern",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          hasTenGod(
            signal,
            ["정재", "편재", "재성"],
          ),
        score: 2,
        reason:
          "재성 구조는 능력과 경험을 현실적인 가치와 성과로 전환하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "contribution-authority-support",
        area: "contributionPattern",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          hasTenGod(
            signal,
            ["정관", "편관", "관성"],
          ),
        score: 2,
        reason:
          "관성 구조는 책임과 역할을 통해 능력을 조직과 사회적 가치로 연결하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "contribution-resource-support",
        area: "contributionPattern",
        direction: "support",
        kinds: ["tenGodDominance"],
        matcher: (signal) =>
          hasTenGod(
            signal,
            ["정인", "편인", "인성"],
          ),
        score: 2,
        reason:
          "인성 구조는 지식과 경험을 정리하여 조언·교육·보호의 가치로 제공하는 힘을 지원한다.",
      }),
  
      signalRule({
        id: "long-term-rooting-support",
        area: "longTermCoherence",
        direction: "support",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && signal.rooted,
        score: 3,
        reason:
          "통근은 역할과 환경이 바뀌어도 삶의 중심을 장기적으로 유지하는 기반을 지원한다.",
      }),
  
      signalRule({
        id: "long-term-rooting-limit",
        area: "longTermCoherence",
        direction: "limit",
        kinds: ["rooting"],
        matcher: (signal) =>
          isRootingSignal(signal)
          && !signal.rooted,
        score: 3,
        reason:
          "통근이 약하면 환경 변화 때마다 삶의 중심과 축적 기반이 흔들릴 수 있다.",
      }),
  
      signalRule({
        id: "long-term-month-support",
        area: "longTermCoherence",
        direction: "support",
        kinds: ["monthCommand"],
        matcher: (signal) =>
          isMonthCommandSignal(signal)
          && signal.supported === true,
        score: 2,
        reason:
          "월령의 지원은 자기 방향과 환경 조건을 장기적으로 연결하는 힘을 보완한다.",
      }),
  
      signalRule({
        id: "long-term-month-limit",
        area: "longTermCoherence",
        direction: "limit",
        kinds: ["monthCommand"],
        matcher: (signal) =>
          isMonthCommandSignal(signal)
          && signal.supported === false,
        score: 2,
        reason:
          "월령의 지원이 약하면 자기 방향을 유지하기 위해 환경 조정이 지속적으로 필요할 수 있다.",
      }),
  
      signalRule({
        id: "long-term-weak-limit",
        area: "longTermCoherence",
        direction: "limit",
        kinds: ["dayMasterStrength"],
        matcher: (signal) =>
          isDayMasterStrengthSignal(signal)
          && signal.type === "weak",
        score: 2,
        reason:
          "외부 부담이 자기 기반보다 크면 장기 방향보다 당장의 책임에 삶의 중심이 분산될 수 있다.",
      }),
    ];
  
  function matchesSignal(
    rule: DestinyRule,
    evidence: DestinyEvidence,
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
    rule: DestinyRule,
    evidence: DestinyEvidence,
  ): boolean {
    return (
      rule.sources?.includes(
        evidence.source,
      )
      ?? false
    );
  }
  
  function matchesWeight(
    rule: DestinyRule,
    evidence: DestinyEvidence,
  ): boolean {
    return (
      rule.minimumWeight !== undefined
      && evidence.weight
        >= rule.minimumWeight
    );
  }
  
  function isRuleMatched(
    rule: DestinyRule,
    basis: DestinyRuleMatchBasis,
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
  
    return true;
  }
  
  export function matchDestinyRules(
    evidenceList: DestinyEvidence[],
  ): MatchedDestinyRule[] {
    const matched:
      MatchedDestinyRule[] = [];
  
    for (const evidence of evidenceList) {
      for (const rule of DESTINY_RULES) {
        const matchBasis:
          DestinyRuleMatchBasis = {
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