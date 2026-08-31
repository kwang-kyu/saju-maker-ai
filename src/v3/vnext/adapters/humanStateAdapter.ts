import type {
  MasterProfileExplanation,
} from "../../masterReader/readers/masterProfileExplanationBuilder.js";
import type {
  MasterHumanSummary,
} from "../../masterReader/readers/masterHumanSummaryBuilder.js";
import type {
  HumanLifePhaseResult,
} from "../../masterReader/types/humanLifePhase.js";
import type {
  HumanState,
  HumanStateDomain,
  HumanStateSummary,
  VNextEvidence,
} from "../types/humanState.js";
import {
  emptyVNextEvidence,
  toVNextEvidenceFromStrings,
} from "./adapterEvidence.js";

/**
 * HumanStateAdapter 입력.
 *
 * HumanDestinyContext.identity와 동일한 구조를 최소화하여
 * Master Reader 결합을 어댑터 경계에 한정한다.
 */
export type HumanStateAdapterInput = {
  explanation: MasterProfileExplanation;
  humanSummary: MasterHumanSummary;
  currentPhase?: HumanLifePhaseResult | null;
};

function buildDomainSummary(
  domain: HumanStateDomain,
  summary: string,
  strengths: readonly string[],
  pressures: readonly string[],
  risks: readonly string[],
  evidence: readonly string[],
  sourceKey: string,
): HumanStateSummary {
  return {
    domain,
    summary,
    strengths: [...strengths],
    pressures: [...pressures],
    risks: [...risks],
    evidence: toVNextEvidenceFromStrings(evidence, sourceKey),
  };
}

function buildPersonalityDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const lifeDriver = explanation.lifeDriver;
  const survivalStyle = explanation.survivalStyle;

  return buildDomainSummary(
    "personality",
    [lifeDriver.summary, survivalStyle.primary.summary]
      .filter(Boolean)
      .join(" "),
    [
      ...lifeDriver.strengths,
      ...survivalStyle.recoveryMethods,
    ],
    survivalStyle.crisisBehaviors,
    [
      ...lifeDriver.cautions,
      ...survivalStyle.prohibitedActions,
    ],
    [
      ...lifeDriver.evidence,
      ...survivalStyle.primary.evidence,
    ],
    "masterReader.personality",
  );
}

function buildAbilityDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const career = explanation.career;

  return buildDomainSummary(
    "ability",
    career.primaryRole || career.summary,
    career.strengths,
    career.cautionConditions,
    career.risks,
    career.evidence,
    "masterReader.ability",
  );
}

function buildRepeatedPatternDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const repeatedPattern = explanation.repeatedPattern;

  return buildDomainSummary(
    "repeatedPattern",
    repeatedPattern.primary.summary,
    repeatedPattern.strengths,
    repeatedPattern.repeatedBehaviors,
    repeatedPattern.risks,
    repeatedPattern.primary.evidence,
    "masterReader.repeatedPattern",
  );
}

function buildMoneyDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const money = explanation.money;

  return buildDomainSummary(
    "money",
    money.summary,
    money.strengths,
    money.cautionConditions,
    money.risks,
    money.evidence,
    "masterReader.money",
  );
}

function buildCareerDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const career = explanation.career;

  return buildDomainSummary(
    "career",
    career.summary,
    career.strengths,
    career.cautionConditions,
    career.risks,
    career.evidence,
    "masterReader.career",
  );
}

function buildRelationshipDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const relationship = explanation.relationship;

  return buildDomainSummary(
    "relationship",
    relationship.summary,
    relationship.strengths,
    relationship.cautionConditions,
    relationship.risks,
    relationship.evidence,
    "masterReader.relationship",
  );
}

function buildCapacityDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const capacity = explanation.capacity;

  return buildDomainSummary(
    "capacity",
    capacity.summary,
    capacity.strengths,
    capacity.risk.overloadConditions,
    capacity.risks,
    capacity.evidence,
    "masterReader.capacity",
  );
}

function buildRiskDomain(
  explanation: MasterProfileExplanation,
): HumanStateSummary {
  const capacityRisk = explanation.capacity.risk;

  return buildDomainSummary(
    "risk",
    capacityRisk.summary,
    capacityRisk.suitableConditions,
    capacityRisk.overloadConditions,
    [
      ...explanation.integratedRisks,
      ...capacityRisk.limitationPattern
        ? [capacityRisk.limitationPattern]
        : [],
    ],
    [
      ...explanation.coreEvidence,
      ...capacityRisk.evidence,
    ],
    "masterReader.risk",
  );
}

const DOMAIN_BUILDERS: Record<
  HumanStateDomain,
  (explanation: MasterProfileExplanation) => HumanStateSummary
> = {
  personality: buildPersonalityDomain,
  ability: buildAbilityDomain,
  repeatedPattern: buildRepeatedPatternDomain,
  money: buildMoneyDomain,
  career: buildCareerDomain,
  relationship: buildRelationshipDomain,
  capacity: buildCapacityDomain,
  risk: buildRiskDomain,
};

/**
 * 기존 Master Reader / Human Destiny Profile 결과를
 * vNext HumanState로 읽기 전용 변환한다.
 */
export function adaptHumanState(
  input: HumanStateAdapterInput,
  requiredDomains?: readonly HumanStateDomain[],
): HumanState {
  const { explanation, humanSummary, currentPhase } = input;

  const domainsToBuild =
    requiredDomains && requiredDomains.length > 0
      ? requiredDomains
      : (Object.keys(DOMAIN_BUILDERS) as HumanStateDomain[]);

  const domains = domainsToBuild.map(
    (domain) => DOMAIN_BUILDERS[domain](explanation),
  );

  const identityEvidence: VNextEvidence =
    toVNextEvidenceFromStrings(
      humanSummary.evidence,
      "masterReader.humanSummary",
    );

  const phaseEvidence: VNextEvidence = currentPhase
    ? emptyVNextEvidence()
    : emptyVNextEvidence();

  return {
    identity: {
      label: humanSummary.title,
      description: humanSummary.coreIdentity || humanSummary.summary,
      evidence: identityEvidence,
    },
    domains,
    currentLifePhase: currentPhase
      ? {
          label: currentPhase.title,
          description: currentPhase.description,
          evidence: phaseEvidence,
        }
      : {
          label: "unknown",
          description: "현재 인생 국면 정보가 제공되지 않았다.",
          evidence: emptyVNextEvidence(),
        },
    evidence: toVNextEvidenceFromStrings(
      explanation.coreEvidence,
      "masterReader.coreEvidence",
    ),
  };
}
