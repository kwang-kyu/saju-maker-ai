import type { BasicSajuResult } from "../../types/basic";
import type {
  CompatibilityEvidence,
  CompatibilityLevel,
  CompatibilityMode,
  CompatibilityPersonProfile,
  CompatibilityResult,
  CompatibilityRiskLevel,
} from "./compatibilityTypes";

const GENERATING_RELATION: Record<string, string> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

const CONTROLLING_RELATION: Record<string, string> = {
  목: "토",
  토: "수",
  수: "화",
  화: "금",
  금: "목",
};

function buildPersonProfile(
  basic: BasicSajuResult
): CompatibilityPersonProfile {
  return {
    name: basic.name,
    dayMaster: basic.dayMaster,
    strongestElement: basic.strongestElement,
    weakestElement: basic.weakestElement,
    yearGanZhi: basic.yearGanZhi,
    dayGanZhi: basic.dayGanZhi,
  };
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function getCompatibilityLevel(
  score: number
): CompatibilityLevel {
  if (score >= 85) {
    return "veryGood";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 55) {
    return "mixed";
  }

  if (score >= 40) {
    return "caution";
  }

  return "difficult";
}

function getRiskLevel(
  score: number,
  negativeEvidenceCount: number
): CompatibilityRiskLevel {
  if (score < 45 || negativeEvidenceCount >= 3) {
    return "high";
  }

  if (score < 70 || negativeEvidenceCount >= 1) {
    return "medium";
  }

  return "low";
}

function isGeneratingRelation(
  firstElement: string,
  secondElement: string
): boolean {
  return (
    GENERATING_RELATION[firstElement] === secondElement ||
    GENERATING_RELATION[secondElement] === firstElement
  );
}

function isControllingRelation(
  firstElement: string,
  secondElement: string
): boolean {
  return (
    CONTROLLING_RELATION[firstElement] === secondElement ||
    CONTROLLING_RELATION[secondElement] === firstElement
  );
}

function buildElementEvidence(
  self: CompatibilityPersonProfile,
  other: CompatibilityPersonProfile
): {
  scoreChange: number;
  evidence: CompatibilityEvidence[];
  strengths: string[];
  conflicts: string[];
  recommendations: string[];
} {
  const evidence: CompatibilityEvidence[] = [];
  const strengths: string[] = [];
  const conflicts: string[] = [];
  const recommendations: string[] = [];
  let scoreChange = 0;

  if (
    self.strongestElement === other.weakestElement ||
    other.strongestElement === self.weakestElement
  ) {
    scoreChange += 14;

    evidence.push({
      category: "element",
      title: "오행 보완 관계",
      description:
        "한 사람의 강한 기운이 다른 사람의 부족한 부분을 채울 가능성이 있습니다.",
      influence: "positive",
    });

    strengths.push(
      "서로 다른 강점이 있어 역할을 나누면 한쪽의 부족한 부분을 보완할 수 있습니다."
    );
  }

  if (
    self.strongestElement === other.strongestElement
  ) {
    scoreChange -= 6;

    evidence.push({
      category: "element",
      title: "강한 기운의 중복",
      description:
        "두 사람의 강한 오행이 같아 추진 방식과 주도권이 겹칠 가능성이 있습니다.",
      influence: "negative",
    });

    conflicts.push(
      "두 사람 모두 비슷한 방식으로 주도하려 하면 의사결정 충돌이 생길 수 있습니다."
    );

    recommendations.push(
      "최종 의사결정권과 담당 업무를 시작 전에 분명하게 나누는 것이 좋습니다."
    );
  }

  if (
    isGeneratingRelation(
      self.strongestElement,
      other.strongestElement
    )
  ) {
    scoreChange += 10;

    evidence.push({
      category: "element",
      title: "상생 흐름",
      description:
        "두 사람의 강한 오행이 서로 이어지는 흐름이어서 협업 시 추진력을 만들기 쉽습니다.",
      influence: "positive",
    });

    strengths.push(
      "한 사람이 시작한 일을 다른 사람이 이어받아 발전시키는 협업 구조가 가능합니다."
    );
  }

  if (
    isControllingRelation(
      self.strongestElement,
      other.strongestElement
    )
  ) {
    scoreChange -= 10;

    evidence.push({
      category: "element",
      title: "상극 가능성",
      description:
        "두 사람의 강한 오행 사이에 통제와 제약의 관계가 있어 갈등 관리가 중요합니다.",
      influence: "negative",
    });

    conflicts.push(
      "한 사람은 추진하려 하고 다른 사람은 제동을 거는 형태가 반복될 수 있습니다."
    );

    recommendations.push(
      "의견 충돌이 생겼을 때 따를 기준과 중재 방식을 계약에 포함하는 것이 좋습니다."
    );
  }

  return {
    scoreChange,
    evidence,
    strengths,
    conflicts,
    recommendations,
  };
}

function buildDayMasterEvidence(
  self: CompatibilityPersonProfile,
  other: CompatibilityPersonProfile
): {
  scoreChange: number;
  evidence: CompatibilityEvidence[];
  strengths: string[];
  conflicts: string[];
} {
  const evidence: CompatibilityEvidence[] = [];
  const strengths: string[] = [];
  const conflicts: string[] = [];
  let scoreChange = 0;

  if (self.dayMaster === other.dayMaster) {
    scoreChange -= 5;

    evidence.push({
      category: "dayMaster",
      title: "일간 성향 중복",
      description:
        "기본 판단 방식이 비슷해 이해는 빠르지만 주도권 경쟁이 생길 수 있습니다.",
      influence: "neutral",
    });

    strengths.push(
      "서로의 판단 방식과 일 처리 속도를 이해하기 쉽습니다."
    );

    conflicts.push(
      "역할이 겹치면 서로 양보하지 않거나 같은 문제를 반복해서 지적할 수 있습니다."
    );
  } else {
    scoreChange += 5;

    evidence.push({
      category: "dayMaster",
      title: "서로 다른 판단 방식",
      description:
        "두 사람의 일간이 달라 업무를 바라보는 관점과 역할을 나눌 가능성이 있습니다.",
      influence: "positive",
    });

    strengths.push(
      "서로 다른 관점으로 사업의 빈틈을 점검할 수 있습니다."
    );
  }

  return {
    scoreChange,
    evidence,
    strengths,
    conflicts,
  };
}

function buildBusinessConclusion(
  level: CompatibilityLevel
): string {
  switch (level) {
    case "veryGood":
      return "두 사람은 동업을 긍정적으로 검토할 수 있는 조합입니다. 역할과 자금 기준만 명확히 하면 서로의 강점을 살릴 가능성이 높습니다.";

    case "good":
      return "동업은 가능한 편입니다. 다만 역할 분담과 수익 배분을 명확하게 정해야 장점이 오래 유지됩니다.";

    case "mixed":
      return "동업은 조건부로 가능합니다. 서로 보완되는 부분은 있지만 주도권과 자금 관리에서 충돌이 생길 수 있습니다.";

    case "caution":
      return "동업은 신중하게 접근해야 합니다. 처음부터 큰 자금을 합치기보다 소규모 시험 운영이 먼저입니다.";

    case "difficult":
      return "현재 기본 궁합만 보면 동업을 권하기 어렵습니다. 함께 사업하더라도 지분을 섞기보다 업무 협력 형태가 더 안전합니다.";
  }
}

function buildGeneralConclusion(
  level: CompatibilityLevel
): string {
  switch (level) {
    case "veryGood":
      return "두 사람은 서로의 강점을 잘 보완할 가능성이 높은 관계입니다.";

    case "good":
      return "두 사람은 전반적으로 협력 가능한 관계입니다.";

    case "mixed":
      return "두 사람은 장점과 충돌 요소가 함께 있는 관계입니다.";

    case "caution":
      return "두 사람의 관계는 기준과 역할을 분명히 해야 안정됩니다.";

    case "difficult":
      return "두 사람은 서로의 차이를 조정하지 않으면 갈등이 반복될 가능성이 큽니다.";
  }
}

function buildDirectConclusion(
  mode: CompatibilityMode,
  level: CompatibilityLevel
): string {
  if (mode === "business") {
    return buildBusinessConclusion(level);
  }

  return buildGeneralConclusion(level);
}

export function analyzeCompatibility(params: {
  selfBasic: BasicSajuResult;
  otherBasic: BasicSajuResult;
  mode?: CompatibilityMode;
}): CompatibilityResult {
  const {
    selfBasic,
    otherBasic,
    mode = "general",
  } = params;

  const self = buildPersonProfile(selfBasic);
  const other = buildPersonProfile(otherBasic);

  let score = 60;

  const evidence: CompatibilityEvidence[] = [];
  const strengths: string[] = [];
  const conflicts: string[] = [];
  const recommendations: string[] = [];

  const elementResult = buildElementEvidence(
    self,
    other
  );

  score += elementResult.scoreChange;
  evidence.push(...elementResult.evidence);
  strengths.push(...elementResult.strengths);
  conflicts.push(...elementResult.conflicts);
  recommendations.push(
    ...elementResult.recommendations
  );

  const dayMasterResult = buildDayMasterEvidence(
    self,
    other
  );

  score += dayMasterResult.scoreChange;
  evidence.push(...dayMasterResult.evidence);
  strengths.push(...dayMasterResult.strengths);
  conflicts.push(...dayMasterResult.conflicts);

  if (
    self.weakestElement === other.weakestElement
  ) {
    score -= 8;

    evidence.push({
      category: "risk",
      title: "공통 약점",
      description:
        "두 사람의 약한 오행이 같아 특정 문제를 서로 보완하지 못할 가능성이 있습니다.",
      influence: "negative",
    });

    conflicts.push(
      "두 사람 모두 같은 부분에서 판단이 느려지거나 관리가 약해질 수 있습니다."
    );

    recommendations.push(
      "공통으로 약한 영역은 외부 전문가나 별도의 관리 시스템으로 보완하는 것이 좋습니다."
    );
  }

  const overallScore = clampScore(score);
  const level = getCompatibilityLevel(
    overallScore
  );

  const negativeEvidenceCount = evidence.filter(
    (item) => item.influence === "negative"
  ).length;

  const riskLevel = getRiskLevel(
    overallScore,
    negativeEvidenceCount
  );

  const directConclusion = buildDirectConclusion(
    mode,
    level
  );

  const roleRecommendation =
    mode === "business"
      ? [
          "기획, 운영, 자금, 고객관리 가운데 각자의 담당을 구분하십시오.",
          "공동 책임보다 최종 책임자를 영역별로 한 명씩 정하십시오.",
        ]
      : [
          "서로 잘하는 역할과 어려워하는 역할을 구분해 관계를 운영하십시오.",
        ];

  const moneyCompatibility =
    mode === "business"
      ? [
          "투자금, 지분, 급여, 이익 배분 기준을 시작 전에 문서화해야 합니다.",
          "개인 자금과 사업 자금을 분리해야 갈등을 줄일 수 있습니다.",
        ]
      : [];

  const workCompatibility =
    mode === "business"
      ? [
          ...strengths,
          "서로 다른 판단 방식을 업무 분담으로 연결하면 협업의 장점이 커질 수 있습니다.",
        ]
      : [];

  const communicationCompatibility = [
    conflicts.length > 0
      ? "의견 충돌이 생겼을 때 감정으로 결론 내리지 말고 정해진 기준에 따라 판단해야 합니다."
      : "기본적인 의사소통 흐름은 무난한 편입니다.",
  ];

  const riskFactors = [
    ...conflicts,
    ...(riskLevel === "high"
      ? [
          "큰 자금과 지분을 한 번에 묶으면 갈등이 생겼을 때 회복이 어려울 수 있습니다.",
        ]
      : []),
  ];

  const finalRecommendations = [
    ...recommendations,
    ...(mode === "business"
      ? [
          "정식 동업 전에 일정 기간 시험 운영을 해보는 것이 좋습니다.",
          "계약서에 역할, 투자금, 이익 배분, 손실 책임, 탈퇴 조건을 포함하십시오.",
        ]
      : []),
  ];

  const summary = [
    directConclusion,
    strengths[0] ?? "",
    conflicts[0] ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    mode,
    self,
    other,
    overallScore,
    level,
    riskLevel,
    directConclusion,
    strengths,
    conflicts,
    moneyCompatibility,
    workCompatibility,
    communicationCompatibility,
    roleRecommendation,
    riskFactors,
    recommendations: finalRecommendations,
    evidence,
    summary,
  };
}