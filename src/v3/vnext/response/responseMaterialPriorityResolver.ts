import type {
  QuestionSpecificMaterialSelection,
  QuestionSpecificMaterialTier,
  QuestionSpecificMaterialTierKey,
} from "../../consulting/explanation/questionSpecificMaterialSelector.js";
import type {
  DecisionExplanationCondition,
  DecisionExplanationEvidence,
  DecisionExplanationRisk,
} from "../../consulting/explanation/decisionResultReader.js";
import type {
  AssessmentCondition,
  AssessmentRisk,
} from "../types/assessment.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";

const TIER_ORDER: readonly QuestionSpecificMaterialTierKey[] = [
  "primary",
  "secondary",
  "supporting",
];

type TierRankMap = Map<string, QuestionSpecificMaterialTierKey>;

function buildTierRankMap<TTierMaterial>(
  tier: QuestionSpecificMaterialTier<TTierMaterial> | undefined,
  resolveTierIdentity: (material: TTierMaterial) => string,
): TierRankMap {
  const rankMap: TierRankMap = new Map();

  if (!tier) {
    return rankMap;
  }

  for (const tierKey of TIER_ORDER) {
    for (const material of tier[tierKey]) {
      const identity = resolveTierIdentity(material);

      if (!rankMap.has(identity)) {
        rankMap.set(identity, tierKey);
      }
    }
  }

  return rankMap;
}

function hasAnyTierMatch<TCandidate>(
  candidates: readonly TCandidate[],
  rankMap: TierRankMap,
  resolveCandidateIdentity: (candidate: TCandidate) => string,
): boolean {
  if (rankMap.size === 0) {
    return false;
  }

  return candidates.some((candidate) =>
    rankMap.has(resolveCandidateIdentity(candidate)),
  );
}

function orderByTierRank<TCandidate>(
  candidates: readonly TCandidate[],
  rankMap: TierRankMap,
  resolveCandidateIdentity: (candidate: TCandidate) => string,
): TCandidate[] {
  const grouped: Record<
    QuestionSpecificMaterialTierKey | "unmatched",
    TCandidate[]
  > = {
    primary: [],
    secondary: [],
    supporting: [],
    unmatched: [],
  };

  for (const candidate of candidates) {
    const tierKey = rankMap.get(
      resolveCandidateIdentity(candidate),
    );

    if (tierKey) {
      grouped[tierKey].push(candidate);
      continue;
    }

    grouped.unmatched.push(candidate);
  }

  return [
    ...grouped.primary,
    ...grouped.secondary,
    ...grouped.supporting,
    ...grouped.unmatched,
  ];
}

function orderCandidatesByQuestionSpecificTier<
  TCandidate,
  TTierMaterial,
>(
  candidates: readonly TCandidate[],
  tier: QuestionSpecificMaterialTier<TTierMaterial> | undefined,
  resolveTierIdentity: (material: TTierMaterial) => string,
  resolveCandidateIdentity: (candidate: TCandidate) => string,
): TCandidate[] {
  if (candidates.length === 0) {
    return [];
  }

  const rankMap = buildTierRankMap(
    tier,
    resolveTierIdentity,
  );

  if (!hasAnyTierMatch(
    candidates,
    rankMap,
    resolveCandidateIdentity,
  )) {
    return [...candidates];
  }

  return orderByTierRank(
    candidates,
    rankMap,
    resolveCandidateIdentity,
  );
}

function buildEvidenceIdentity(
  source: string,
  description: string,
): string {
  return `${source}\0${description}`;
}

function resolveTierEvidenceIdentity(
  evidence: DecisionExplanationEvidence,
): string {
  return buildEvidenceIdentity(
    evidence.source,
    evidence.description,
  );
}

function resolveCandidateEvidenceIdentity(
  item: VNextEvidenceItem,
): string {
  return buildEvidenceIdentity(
    item.sourceKey,
    item.description,
  );
}

function resolveTierConditionIdentity(
  condition: DecisionExplanationCondition,
): string {
  return condition.key;
}

function resolveCandidateConditionIdentity(
  condition: AssessmentCondition,
): string {
  return condition.key;
}

function resolveTierRiskIdentity(
  risk: DecisionExplanationRisk,
): string {
  return risk.key;
}

function resolveCandidateRiskIdentity(
  risk: AssessmentRisk,
): string {
  return risk.key;
}

/**
 * 기존 block selector가 선택한 Evidence 후보에
 * Question-Specific Material tier 우선순위를 적용한다.
 *
 * relevance 판단·material 생성·후보 제거는 하지 않는다.
 */
export function orderEvidenceByQuestionSpecificPriority(
  candidates: readonly VNextEvidenceItem[],
  questionSpecificMaterials?: QuestionSpecificMaterialSelection,
): VNextEvidenceItem[] {
  return orderCandidatesByQuestionSpecificTier(
    candidates,
    questionSpecificMaterials?.evidence,
    resolveTierEvidenceIdentity,
    resolveCandidateEvidenceIdentity,
  );
}

/**
 * 기존 block selector가 선택한 Condition 후보에
 * Question-Specific Material tier 우선순위를 적용한다.
 */
export function orderConditionsByQuestionSpecificPriority(
  candidates: readonly AssessmentCondition[],
  questionSpecificMaterials?: QuestionSpecificMaterialSelection,
): AssessmentCondition[] {
  return orderCandidatesByQuestionSpecificTier(
    candidates,
    questionSpecificMaterials?.conditions,
    resolveTierConditionIdentity,
    resolveCandidateConditionIdentity,
  );
}

/**
 * 기존 block selector가 선택한 Risk 후보에
 * Question-Specific Material tier 우선순위를 적용한다.
 */
export function orderRisksByQuestionSpecificPriority(
  candidates: readonly AssessmentRisk[],
  questionSpecificMaterials?: QuestionSpecificMaterialSelection,
): AssessmentRisk[] {
  return orderCandidatesByQuestionSpecificTier(
    candidates,
    questionSpecificMaterials?.risks,
    resolveTierRiskIdentity,
    resolveCandidateRiskIdentity,
  );
}
