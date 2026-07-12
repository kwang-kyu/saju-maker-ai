export type SajuPillarPosition =
  | "year"
  | "month"
  | "day"
  | "time";

export type SajuEvidenceStrength =
  | "weak"
  | "medium"
  | "strong";

export type SajuFiveElement =
  | "wood"
  | "fire"
  | "earth"
  | "metal"
  | "water";

export type SajuPillarFact = {
  position: SajuPillarPosition;

  ganZhi: string;

  heavenlyStem: string;

  earthlyBranch: string;

  tenGod?: string;
};

export type SajuElementDistribution = {
  wood: number;

  fire: number;

  earth: number;

  metal: number;

  water: number;
};

export type SajuStructureSignal =
  | {
      kind: "tenGodDominance";

      dominantTenGod: string | null;

      dominantCount: number;

      totalCount: number;

      counts: Record<string, number>;

      distributed: boolean;
    }
  | {
      kind: "dayMasterStrength";

      type: "strong" | "balanced" | "weak";

      score: number;

      supportScore: number;

      opposingScore: number;

      monthCommandScore: number;

      rootingScore: number;
    }
  | {
      kind: "monthCommand";

      season:
        | "spring"
        | "summer"
        | "autumn"
        | "winter"
        | null;

      supported: boolean | null;

      dayMasterElement: SajuFiveElement;
    }
  | {
      kind: "rooting";

      rootingCount: number;

      totalBranches: number;

      rooted: boolean;
    };

export type SajuStructureFact = {
  category:
    | "monthCommand"
    | "dayMasterStrength"
    | "structure"
    | "tenGodStrength"
    | "fiveElementFlow"
    | "rooting"
    | "usefulGod"
    | "interaction";

  description: string;

  strength: SajuEvidenceStrength;

  confidence: SajuEvidenceStrength;

  evidence?: string[];

  conditions?: string[];

  exceptions?: string[];

  signal?: SajuStructureSignal;
};

export type SajuInteractionFact = {
  type:
    | "combination"
    | "clash"
    | "punishment"
    | "break"
    | "harm"
    | "mixed";

  targets: string[];

  description: string;

  strength: SajuEvidenceStrength;
};

export type SajuLuckFlowFact = {
  currentAge: number;

  daeun?: string;

  seun?: string;

  descriptions: string[];
};

export type SajuFacts = {
  name: string;

  birthDate: string;

  birthTime: string;

  gender: string;

  calendarType: string;

  solarDate: string;

  lunarDate: string;

  pillars: SajuPillarFact[];

  dayMaster: string;

  strongestElement: SajuFiveElement | null;

  weakestElement: SajuFiveElement | null;

  elementDistribution: SajuElementDistribution;

  structureFacts: SajuStructureFact[];

  interactionFacts: SajuInteractionFact[];

  usefulGod?: string;

  favorableGod?: string;

  harmfulGod?: string;

  luckFlow: SajuLuckFlowFact;
};