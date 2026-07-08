import type { BasicSajuResult } from "../../../types/basic";

function getDayMasterLove(dayMaster?: string): string {
  if (!dayMaster) return "연애에서는 자신의 감정 리듬을 먼저 아는 것이 중요합니다.";

  if (dayMaster.includes("갑") || dayMaster.includes("을")) {
    return "목(木) 일간은 관계에서 성장과 진정성을 중요하게 봅니다. 함께 발전할 수 있는 사람에게 마음이 깊어지기 쉽습니다.";
  }

  if (dayMaster.includes("병") || dayMaster.includes("정")) {
    return "화(火) 일간은 표현과 설렘이 중요한 편입니다. 다만 감정이 뜨거울수록 관계의 속도를 조절해야 오래 갑니다.";
  }

  if (dayMaster.includes("무") || dayMaster.includes("기")) {
    return "토(土) 일간은 안정감과 책임감을 중요하게 봅니다. 믿을 수 있는 사람과 천천히 쌓아가는 관계가 잘 맞습니다.";
  }

  if (dayMaster.includes("경") || dayMaster.includes("신")) {
    return "금(金) 일간은 기준과 신뢰가 중요합니다. 쉽게 마음을 열지는 않지만, 한번 신뢰하면 오래 지키려는 성향이 강합니다.";
  }

  if (dayMaster.includes("임") || dayMaster.includes("계")) {
    return "수(水) 일간은 정서적 교감과 편안한 대화를 중요하게 봅니다. 부담스럽지 않게 흐르는 관계에서 안정감을 느끼기 쉽습니다.";
  }

  return "연애에서는 상대보다 먼저 자신의 관계 기준을 분명히 세우는 것이 중요합니다.";
}

function getElementLoveAdvice(element: string): string {
  switch (element) {
    case "목":
      return "목 기운이 강하면 상대와 함께 성장하려는 마음이 큽니다. 다만 내 기준을 상대에게 강하게 요구하지 않도록 조심해야 합니다.";
    case "화":
      return "화 기운이 강하면 매력과 표현력이 좋습니다. 다만 감정이 앞서면 관계가 빨리 뜨거워지고 빨리 지칠 수 있습니다.";
    case "토":
      return "토 기운이 강하면 안정적인 관계를 선호합니다. 다만 지나치게 참거나 책임을 혼자 짊어지지 않는 것이 중요합니다.";
    case "금":
      return "금 기운이 강하면 관계에서 선을 분명히 긋는 편입니다. 다만 너무 차갑게 보이지 않도록 감정 표현을 조금 더 열어야 합니다.";
    case "수":
      return "수 기운이 강하면 감수성과 이해력이 좋습니다. 다만 애매한 관계를 오래 끌지 않도록 방향을 분명히 해야 합니다.";
    default:
      return "강한 기운이 뚜렷하지 않을 때는 상대와의 균형과 대화 방식이 연애운을 좌우합니다.";
  }
}

export function buildLoveSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const dayMaster = basic.dayMaster ?? "";
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";

  return [
    `[연애 심층 상담]
${name}님의 연애운은 인연의 많고 적음보다 어떤 사람과 관계를 이어갈 때 안정감을 느끼는지가 더 중요합니다.

[타고난 연애 성향]
${getDayMasterLove(dayMaster)}

[강한 기운으로 보는 연애 패턴]
${getElementLoveAdvice(strongElement)}

[보완해야 할 관계 포인트]
약한 오행은 ${weakElement}입니다. 이 부분은 연애에서 부족하게 느끼는 감정 표현, 안정감, 대화 방식으로 나타날 수 있습니다. 그래서 상대를 판단하기 전에 내가 무엇을 불안해하는지 먼저 보는 것이 좋습니다.

[실천 전략]
첫째, 관계를 급하게 결론 내리기보다 신뢰가 쌓이는 속도를 보세요.
둘째, 감정이 격할 때는 중요한 결정을 잠시 미루는 것이 좋습니다.
셋째, 상대를 바꾸려 하기보다 서로의 차이를 이해하는 방향이 좋습니다.
넷째, 자신의 생활 균형을 잃지 않는 관계가 오래 갑니다.`,
  ];
}