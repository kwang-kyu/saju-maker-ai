import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";

export type MarriageJudgement = {
  marriageScore: number;
  marriageGrade: string;
  marriageType: string;
  agePerspective: string;
  currentSituation: string;
  stability: string;
  familyValue: string;
  financialView: string;
  partnership: string;
  conflictCause: string;
  longTermStability: string;
  recommendedPartner: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  timing: string;
  recommendedStrategies: string[];
  avoidActions: string[];
};

function grade(score: number): string {
  if (score >= 85) return "결혼 안정도가 높은 사주";
  if (score >= 70) return "현실 조건을 맞추면 안정되는 사주";
  if (score >= 55) return "선택 기준이 중요한 사주";
  if (score >= 40) return "서두르면 흔들리기 쉬운 사주";
  return "관계 훈련이 먼저 필요한 사주";
}

function marriageType(params: {
  monthTenGod: string;
  timeTenGod: string;
  yongsin: string;
  stabilityScore: number;
  partnershipScore: number;
}): string {
  const { monthTenGod, timeTenGod, yongsin, stabilityScore, partnershipScore } = params;

  if (stabilityScore >= 75 && partnershipScore >= 70) return "생활안정형";
  if (partnershipScore >= 75) return "성장동반형";
  if (monthTenGod.includes("정관") || timeTenGod.includes("정관")) return "책임중심형";
  if (monthTenGod.includes("정재") || timeTenGod.includes("정재")) return "현실관리형";
  if (monthTenGod.includes("식신") || timeTenGod.includes("식신")) return "배려생활형";
  if (monthTenGod.includes("상관") || timeTenGod.includes("상관")) return "표현강한형";
  if (yongsin === "토" || yongsin === "금") return "안정추구형";

  return "신중선택형";
}

function agePerspective(): string {
  return "연령 정보는 별도 계산 단계에서 연결합니다. 현재 Marriage Core는 결혼 시기보다 관계 구조, 생활 안정성, 경제관, 배우자 유형을 먼저 판단합니다.";
}

export function analyzeMarriage(basic: BasicSajuResult): MarriageJudgement {
  const profile = buildSajuProfile(basic);

  const dayMaster = profile.dayMaster;
  const strongElement = profile.strongestElement;
  const weakElement = profile.weakestElement;
  const monthTenGod = profile.monthTenGod;
  const timeTenGod = profile.timeTenGod;
  const yongsin = profile.yongsin;
  const gisin = profile.gisin;

  const loveScore = profile.loveScore;
  const stabilityScore = profile.stabilityScore;
  const partnershipScore = profile.partnershipScore;
  const cashFlowScore = profile.cashFlowScore;

  const marriageScore = Math.round(
    loveScore * 0.35 +
      stabilityScore * 0.3 +
      partnershipScore * 0.25 +
      cashFlowScore * 0.1
  );

  const marriageGrade = grade(marriageScore);
  const type = marriageType({
    monthTenGod,
    timeTenGod,
    yongsin,
    stabilityScore,
    partnershipScore,
  });

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const recommendedStrategies: string[] = [];
  const avoidActions: string[] = [];

  if (stabilityScore >= 70) {
    strengths.push("생활을 크게 흔들지 않고 관계를 안정적으로 유지하려는 힘이 있습니다.");
    recommendedStrategies.push("결혼 전 생활 리듬, 주거 계획, 돈 관리 방식을 먼저 맞추는 것이 좋습니다.");
  } else {
    weaknesses.push("관계가 좋아도 생활 방식이 맞지 않으면 결혼 후 피로가 커질 수 있습니다.");
    risks.push("감정만으로 결혼을 밀어붙이면 현실 문제에서 갈등이 반복될 수 있습니다.");
  }

  if (partnershipScore >= 70) {
    strengths.push("배우자와 역할을 나누고 공동의 목표를 만들어가는 힘이 있습니다.");
    recommendedStrategies.push("각자 잘하는 역할을 나누고 중요한 결정은 함께 정하는 구조가 좋습니다.");
  } else {
    weaknesses.push("혼자 결정하려는 흐름이 강해지면 배우자가 소외감을 느낄 수 있습니다.");
    avoidActions.push("주거, 돈, 가족 문제를 상대와 상의하지 않고 혼자 결정하는 방식은 피해야 합니다.");
  }

  if (loveScore >= 70) {
    strengths.push("정서적 끌림과 관계를 이어가려는 마음이 비교적 분명한 편입니다.");
  } else {
    weaknesses.push("좋아하는 마음이 있어도 표현이 부족하거나 관계 유지 방식이 서툴게 보일 수 있습니다.");
    recommendedStrategies.push("마음을 추측하게 만들기보다 말과 행동으로 확인시켜 주는 습관이 필요합니다.");
  }

  if (cashFlowScore < 60) {
    risks.push("결혼 후 경제 관리 방식이 정리되지 않으면 돈 문제가 갈등의 중심이 될 수 있습니다.");
    recommendedStrategies.push("결혼 전 고정지출, 저축 방식, 투자 성향, 가족 부양 책임을 구체적으로 확인해야 합니다.");
  }

  if (strongElement === gisin) {
    risks.push(`이미 강한 ${gisin} 기운이 과해지면 배우자에게 고집, 압박, 일방성으로 느껴질 수 있습니다.`);
    avoidActions.push("내 기준이 맞다는 생각으로 상대를 설득하거나 끌고 가려는 태도는 줄여야 합니다.");
  }

  if (weakElement === yongsin) {
    recommendedStrategies.push(`부족한 ${yongsin} 기운을 보완해 주는 사람이나 생활환경을 선택하면 결혼 안정성이 높아집니다.`);
  }

  const stability =
    stabilityScore >= 75
      ? "생활 안정성이 높은 편입니다. 결혼 후에도 기본 질서와 책임 구조를 만들기 쉽습니다."
      : stabilityScore >= 60
        ? "생활 안정성은 보통입니다. 규칙과 역할 분담을 정하면 안정될 수 있습니다."
        : "생활 안정성은 관리가 필요합니다. 감정이 좋아도 생활 구조를 먼저 정리해야 합니다.";

  const familyValue =
    monthTenGod.includes("정관") || timeTenGod.includes("정관")
      ? "가정관은 책임과 원칙을 중시하는 편입니다."
      : monthTenGod.includes("정재") || timeTenGod.includes("정재")
        ? "가정관은 현실적이고 생활 관리 중심으로 나타납니다."
        : monthTenGod.includes("식신") || timeTenGod.includes("식신")
          ? "가정관은 편안함, 배려, 일상의 만족을 중시하는 흐름입니다."
          : "가정관은 정해진 틀보다 서로의 방식과 거리를 조율하는 쪽에 가깝습니다.";

  const financialView =
    cashFlowScore >= 75
      ? "경제관은 안정적입니다. 결혼 후 공동 자산 관리에 유리합니다."
      : cashFlowScore >= 60
        ? "경제관은 조율형입니다. 지출 기준과 저축 목표를 함께 정해야 합니다."
        : "경제관은 결혼 전 반드시 점검해야 합니다. 돈이 새는 구조를 방치하면 관계 갈등으로 이어질 수 있습니다.";

  const partnership =
    partnershipScore >= 75
      ? "동반자 의식이 강합니다. 함께 계획하고 함께 책임지는 결혼에 잘 맞습니다."
      : partnershipScore >= 60
        ? "협력은 가능하지만 역할과 책임을 명확히 해야 안정됩니다."
        : "협력보다 독립성이 강하게 나타날 수 있습니다. 상대를 내 방식에 맞추려 하면 갈등이 생깁니다.";

  const conflictCause =
    weakElement === "화"
      ? "갈등 원인은 감정 표현 부족과 정서적 거리감이 될 수 있습니다."
      : weakElement === "토"
        ? "갈등 원인은 생활 안정감 부족, 책임 부담, 현실 문제에서 생길 수 있습니다."
        : weakElement === "금"
          ? "갈등 원인은 기준과 경계가 흐려지는 데서 생길 수 있습니다."
          : weakElement === "수"
            ? "갈등 원인은 속마음을 숨기거나 불안이 커지는 데서 생길 수 있습니다."
            : "갈등 원인은 장기 계획과 성장 방향이 맞지 않는 데서 생길 수 있습니다.";

  const longTermStability =
    marriageScore >= 80
      ? "장기 안정성은 높은 편입니다. 현실 조건만 무너지지 않으면 오래 가는 결혼 구조입니다."
      : marriageScore >= 65
        ? "장기 안정성은 충분히 만들 수 있습니다. 다만 돈과 생활 역할을 분명히 해야 합니다."
        : "장기 안정성은 관리가 필요합니다. 결혼 전부터 갈등 해결 방식과 경제 기준을 맞춰야 합니다.";

  const recommendedPartner =
    yongsin === "화"
      ? "감정 표현이 따뜻하고 관계에 활기를 주는 사람"
      : yongsin === "토"
        ? "생활감각이 있고 책임감 있게 가정을 지키는 사람"
        : yongsin === "금"
          ? "원칙, 약속, 경제 기준이 분명한 사람"
          : yongsin === "수"
            ? "차분하게 대화하고 감정을 조율할 줄 아는 사람"
            : "미래 계획을 함께 세우고 성장을 도와주는 사람";

  const currentSituation = `${dayMaster} 일간의 결혼 판단은 ${marriageGrade}입니다. 현재 구조는 ${type}에 가깝고, 강한 ${strongElement} 기운은 결혼생활에서 장점으로 쓰일 수 있지만 약한 ${weakElement} 기운은 반드시 보완해야 합니다.`;

  const timing = "지금은 결혼을 급하게 결정하기보다 생활 방식, 경제관, 가족관, 갈등 해결 방식을 차분히 확인하는 것이 중요합니다.";

  return {
    marriageScore,
    marriageGrade,
    marriageType: type,
    agePerspective: agePerspective(),
    currentSituation,
    stability,
    familyValue,
    financialView,
    partnership,
    conflictCause,
    longTermStability,
    recommendedPartner,
    strengths,
    weaknesses,
    risks,
    timing,
    recommendedStrategies,
    avoidActions,
  };
}
