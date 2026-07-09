import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";

export type LoveJudgement = {
  suitability: string;
  loveType: string;
  expressionStyle: string;
  stabilityLevel: string;
  conflictPoint: string;
  matchingPartner: string;
  currentSituation: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  timing: string;
  recommendedStrategies: string[];
  avoidActions: string[];
};

function hasTenGod(profileTenGods: string[], targets: string[]) {
  return profileTenGods.some((tenGod) =>
    targets.some((target) => tenGod.includes(target))
  );
}

export function analyzeLove(basic: BasicSajuResult): LoveJudgement {
  const profile = buildSajuProfile(basic);

  const tenGods = [
    profile.yearTenGod,
    profile.monthTenGod,
    profile.timeTenGod,
  ];

  const hasOutput = hasTenGod(tenGods, ["식신", "상관"]);
  const hasOfficer = hasTenGod(tenGods, ["정관", "편관"]);
  const hasWealth = hasTenGod(tenGods, ["정재", "편재"]);
  const hasResource = hasTenGod(tenGods, ["정인", "편인"]);
  const hasCompanion = hasTenGod(tenGods, ["비견", "겁재"]);

  const isExpressionStrong =
    hasOutput || profile.strongestElement === "화" || profile.loveScore >= 70;
  const isStable =
    hasOfficer || profile.stabilityScore >= 70 || profile.strongestElement === "토";
  const isIndependent =
    hasCompanion || profile.strongestElement === "목" || profile.partnershipScore <= 40;
  const isSensitive =
    hasResource || profile.strongestElement === "수" || profile.weakestElement === "화";

  const suitability =
    profile.loveScore >= 70
      ? "높음"
      : profile.loveScore >= 50
      ? "보통"
      : "낮음";

  const loveType = isIndependent
    ? "독립강한형"
    : isExpressionStrong
    ? "적극표현형"
    : isStable
    ? "안정추구형"
    : isSensitive
    ? "신중관찰형"
    : "균형관계형";

  const expressionStyle = isExpressionStrong
    ? "마음을 비교적 직접 표현하는 방식"
    : isSensitive
    ? "상대의 반응을 살핀 뒤 천천히 표현하는 방식"
    : "큰 표현보다 행동과 책임으로 보여주는 방식";

  const stabilityLevel =
    suitability === "높음" && isStable
      ? "높음"
      : suitability === "낮음" || isIndependent
      ? "주의"
      : "보통";

  const conflictPoint = isIndependent
    ? "자기 방식이 강해 상대와 주도권 충돌이 생기는 점"
    : profile.weakestElement === "화"
    ? "감정 표현이 부족해 상대가 확신을 느끼기 어려운 점"
    : profile.weakestElement === "금"
    ? "관계의 기준과 경계가 늦게 정해지는 점"
    : "속도와 기대치가 서로 달라지는 점";

  const matchingPartner = isIndependent
    ? "간섭이 적고 각자의 영역을 존중하는 상대"
    : isStable
    ? "책임감 있고 생활 리듬이 안정적인 상대"
    : isExpressionStrong
    ? "감정 표현을 자연스럽게 받아주는 상대"
    : "천천히 신뢰를 쌓을 수 있는 상대";

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const recommendedStrategies: string[] = [];
  const avoidActions: string[] = [];

  if (hasOutput) {
    strengths.push("식상 구조가 있어 호감 표현, 대화, 분위기 형성에 강점이 있습니다.");
    recommendedStrategies.push("좋아하는 마음을 숨기기보다 말과 행동으로 분명히 표현하십시오.");
  }

  if (hasOfficer) {
    strengths.push("관성 구조가 있어 책임감 있고 안정적인 관계를 만들 수 있습니다.");
    recommendedStrategies.push("약속, 생활 리듬, 미래 계획을 함께 맞추는 관계가 좋습니다.");
  }

  if (hasWealth) {
    strengths.push("재성 구조가 있어 현실감 있는 연애와 생활 조건을 중요하게 봅니다.");
    recommendedStrategies.push("감정뿐 아니라 경제관, 생활 방식, 가족관까지 함께 확인하십시오.");
  }

  if (hasResource) {
    strengths.push("인성 구조가 있어 상대를 이해하고 배려하는 힘이 있습니다.");
    recommendedStrategies.push("상대를 챙기되 혼자 참고 쌓아두지 말고 필요한 감정은 말로 풀어야 합니다.");
  }

  if (hasCompanion) {
    weaknesses.push("비겁 구조가 강하면 연애에서도 자기 기준과 독립성이 강하게 나타납니다.");
    risks.push("서로 맞추기보다 각자 방식대로 가려 하면 관계가 쉽게 팽팽해질 수 있습니다.");
    avoidActions.push("상대를 이기려 하거나 관계를 주도권 싸움으로 만들지 마십시오.");
  }

  if (profile.weakestElement === "화") {
    weaknesses.push("감정 표현이 약하면 좋아하는 마음이 있어도 상대가 확신을 느끼기 어렵습니다.");
    risks.push("표현 부족이 반복되면 상대는 무관심으로 받아들일 수 있습니다.");
    recommendedStrategies.push("고맙다, 좋다, 보고 싶다 같은 표현을 의식적으로 늘리십시오.");
  }

  if (profile.weakestElement === "금") {
    weaknesses.push("관계의 기준과 경계가 약하면 애매한 관계가 길어질 수 있습니다.");
    risks.push("싫은 것을 분명히 말하지 못하면 피로한 관계가 반복될 수 있습니다.");
    avoidActions.push("외로움 때문에 기준 없는 관계를 시작하지 마십시오.");
  }

  if (profile.strongestElement === profile.gisin) {
    risks.push(`이미 강한 ${profile.gisin} 기운이 과해지면 연애에서 같은 실수가 반복될 수 있습니다.`);
    avoidActions.push("감정이 올라온 순간 바로 결론을 내리거나 관계를 끊지 마십시오.");
  }

  const currentSituation = `${profile.dayMaster} 일간 기준으로 보면 이 사주의 연애 유형은 '${loveType}'입니다. 감정 표현은 ${expressionStyle}이고, 관계 안정성은 '${stabilityLevel}'입니다. 핵심 갈등 원인은 ${conflictPoint}입니다.`;

  const timing =
    suitability === "높음"
      ? "지금은 인연을 적극적으로 만들어도 되는 흐름입니다. 다만 처음부터 관계의 속도와 기준을 분명히 해야 합니다."
      : suitability === "보통"
      ? "지금은 급하게 결론을 내리기보다 상대의 생활 방식과 감정 표현 방식을 확인하는 시기입니다."
      : "지금은 새로운 관계를 무리하게 시작하기보다 기존 감정 패턴과 반복되는 갈등 원인을 정리하는 시기입니다.";

  return {
    suitability,
    loveType,
    expressionStyle,
    stabilityLevel,
    conflictPoint,
    matchingPartner,
    currentSituation,
    strengths,
    weaknesses,
    risks,
    timing,
    recommendedStrategies,
    avoidActions,
  };
}