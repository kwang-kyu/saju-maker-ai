import type {
    BlessingArea,
  } from "../../masterReader/types/blessing";
  import type {
    CapacityArea,
  } from "../../masterReader/types/capacity";
  import type {
    CareerArea,
  } from "../../masterReader/types/career";
  import type {
    DestinyArea,
  } from "../../masterReader/types/destiny";
  import type {
    HealthArea,
  } from "../../masterReader/types/health";
  import type {
    MoneyArea,
  } from "../../masterReader/types/money";
  import type {
    RelationshipArea,
  } from "../../masterReader/types/relationship";
  import type {
    QuestionTopic,
  } from "../question/questionReader";
  
  export type ReaderDecisionAreaSelection = {
    readonly capacity:
      readonly CapacityArea[];
  
    readonly money:
      readonly MoneyArea[];
  
    readonly career:
      readonly CareerArea[];
  
    readonly relationship:
      readonly RelationshipArea[];
  
    readonly health:
      readonly HealthArea[];
  
    readonly blessing:
      readonly BlessingArea[];
  
    readonly destiny:
      readonly DestinyArea[];
  };
  
  const EMPTY_SELECTION = {
    capacity: [],
    money: [],
    career: [],
    relationship: [],
    health: [],
    blessing: [],
    destiny: [],
  } satisfies ReaderDecisionAreaSelection;
  
  const TOPIC_READER_AREAS: Record<
    QuestionTopic,
    ReaderDecisionAreaSelection
  > = {
    business: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "responsibility",
        "money",
        "organization",
        "relationship",
        "risk",
        "time",
      ],
  
      money: [
        "generation",
        "repeatability",
        "retention",
        "assetConversion",
        "cashflowManagement",
        "debtHandling",
        "volatilityResponse",
        "lossRecovery",
      ],
  
      career: [
        "roleOrientation",
        "workStyle",
        "independenceFit",
        "leadershipFit",
        "performanceConversion",
        "careerContinuity",
      ],
  
      relationship: [
        "boundaryMaintenance",
        "conflictAdjustment",
        "trustRecovery",
        "partnershipCooperation",
      ],
  
      destiny: [
        "strengthFulfillment",
        "growthPath",
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    money: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "money",
        "risk",
        "time",
      ],
  
      money: [
        "generation",
        "repeatability",
        "retention",
        "assetConversion",
        "cashflowManagement",
        "debtHandling",
        "volatilityResponse",
        "lossRecovery",
      ],
  
      destiny: [
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    job: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "responsibility",
        "organization",
        "time",
      ],
  
      career: [
        "roleOrientation",
        "workStyle",
        "expertiseGrowth",
        "organizationFit",
        "independenceFit",
        "leadershipFit",
        "performanceConversion",
        "careerContinuity",
      ],
  
      destiny: [
        "lifeDirection",
        "strengthFulfillment",
        "growthPath",
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    realEstate: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "money",
        "risk",
        "time",
      ],
  
      money: [
        "generation",
        "repeatability",
        "retention",
        "assetConversion",
        "cashflowManagement",
        "debtHandling",
        "volatilityResponse",
        "lossRecovery",
      ],
  
      career: [
        "performanceConversion",
        "careerContinuity",
      ],
  
      destiny: [
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    relationship: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "relationship",
        "time",
      ],
  
      relationship: [
        "connectionExpansion",
        "intimacyMaintenance",
        "emotionalExchange",
        "boundaryMaintenance",
        "conflictAdjustment",
        "trustRecovery",
        "partnershipCooperation",
        "spouseBonding",
      ],
  
      destiny: [
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    love: {
      ...EMPTY_SELECTION,
  
      relationship: [
        "connectionExpansion",
        "intimacyMaintenance",
        "emotionalExchange",
        "boundaryMaintenance",
        "conflictAdjustment",
        "trustRecovery",
      ],
  
      blessing: [
        "relationshipSupport",
        "blessingRetention",
        "blessingCirculation",
      ],
  
      destiny: [
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    marriage: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "responsibility",
        "relationship",
        "time",
      ],
  
      relationship: [
        "intimacyMaintenance",
        "emotionalExchange",
        "boundaryMaintenance",
        "conflictAdjustment",
        "trustRecovery",
        "spouseBonding",
      ],
  
      destiny: [
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    family: {
      ...EMPTY_SELECTION,
  
      relationship: [
        "intimacyMaintenance",
        "emotionalExchange",
        "boundaryMaintenance",
        "conflictAdjustment",
        "trustRecovery",
        "spouseBonding",
      ],
  
      health: [
        "stressRegulation",
        "fatigueManagement",
        "recoveryCapacity",
        "rhythmMaintenance",
        "overloadTolerance",
      ],
  
      destiny: [
        "contributionPattern",
        "longTermCoherence",
      ],
    },
  
    health: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "risk",
        "time",
      ],
  
      health: [
        "vitalityStability",
        "stressRegulation",
        "fatigueManagement",
        "recoveryCapacity",
        "rhythmMaintenance",
        "overloadTolerance",
        "habitSelfManagement",
        "imbalanceAdaptation",
      ],
    },
  
    legal: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "responsibility",
        "risk",
        "time",
      ],
  
      relationship: [
        "boundaryMaintenance",
        "conflictAdjustment",
        "trustRecovery",
        "partnershipCooperation",
      ],
  
      destiny: [
        "choiceAlignment",
        "longTermCoherence",
      ],
    },
  
    lifeFlow: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "risk",
        "time",
      ],
  
      blessing: [
        "opportunityReception",
        "benefactorConnection",
        "relationshipSupport",
        "resourceSupport",
        "environmentSupport",
        "crisisProtection",
        "blessingRetention",
        "blessingCirculation",
      ],
  
      destiny: [
        "growthPath",
        "changeIntegration",
        "longTermCoherence",
      ],
    },
  
    lifeDirection: {
      ...EMPTY_SELECTION,
  
      capacity: [
        "responsibility",
        "time",
      ],
  
      career: [
        "roleOrientation",
        "expertiseGrowth",
        "independenceFit",
        "performanceConversion",
        "careerContinuity",
      ],
  
      blessing: [
        "opportunityReception",
        "resourceSupport",
        "environmentSupport",
        "blessingRetention",
        "blessingCirculation",
      ],
  
      destiny: [
        "lifeDirection",
        "coreLifeTask",
        "strengthFulfillment",
        "growthPath",
        "choiceAlignment",
        "changeIntegration",
        "contributionPattern",
        "longTermCoherence",
      ],
    },
  
    general: {
      capacity: [
        "responsibility",
        "money",
        "organization",
        "relationship",
        "risk",
        "time",
      ],
  
      money: [
        "generation",
        "repeatability",
        "retention",
        "assetConversion",
        "cashflowManagement",
        "debtHandling",
        "volatilityResponse",
        "lossRecovery",
      ],
  
      career: [
        "roleOrientation",
        "workStyle",
        "expertiseGrowth",
        "organizationFit",
        "independenceFit",
        "leadershipFit",
        "performanceConversion",
        "careerContinuity",
      ],
  
      relationship: [
        "connectionExpansion",
        "intimacyMaintenance",
        "emotionalExchange",
        "boundaryMaintenance",
        "conflictAdjustment",
        "trustRecovery",
        "partnershipCooperation",
        "spouseBonding",
      ],
  
      health: [
        "vitalityStability",
        "stressRegulation",
        "fatigueManagement",
        "recoveryCapacity",
        "rhythmMaintenance",
        "overloadTolerance",
        "habitSelfManagement",
        "imbalanceAdaptation",
      ],
  
      blessing: [
        "opportunityReception",
        "benefactorConnection",
        "relationshipSupport",
        "resourceSupport",
        "environmentSupport",
        "crisisProtection",
        "blessingRetention",
        "blessingCirculation",
      ],
  
      destiny: [
        "lifeDirection",
        "coreLifeTask",
        "strengthFulfillment",
        "growthPath",
        "choiceAlignment",
        "changeIntegration",
        "contributionPattern",
        "longTermCoherence",
      ],
    },
  };
  
  export function selectReaderDecisionAreas(
    topic: QuestionTopic,
  ): ReaderDecisionAreaSelection {
    return TOPIC_READER_AREAS[
      topic
    ];
  }