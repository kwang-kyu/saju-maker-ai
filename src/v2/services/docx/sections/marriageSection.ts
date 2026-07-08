import type { BasicSajuResult } from "../../../types/basic";

function getMarriageStyle(dayMaster?: string): string {
  if (!dayMaster) {
    return "결혼운은 배우자를 만나는 시기보다 어떤 가정을 만들어 가는지가 더 중요합니다.";
  }

  if (dayMaster.includes("갑") || dayMaster.includes("을")) {
    return "목(木) 일간은 함께 성장하는 배우자를 만날 때 가장 안정적인 결혼 생활을 이어가기 쉽습니다.";
  }

  if (dayMaster.includes("병") || dayMaster.includes("정")) {
    return "화(火) 일간은 따뜻한 표현과 공감이 많은 관계에서 행복감을 크게 느끼는 편입니다.";
  }

  if (dayMaster.includes("무") || dayMaster.includes("기")) {
    return "토(土) 일간은 안정적인 생활 기반과 신뢰를 가장 중요하게 생각하는 결혼 성향입니다.";
  }

  if (dayMaster.includes("경") || dayMaster.includes("신")) {
    return "금(金) 일간은 책임감이 강하며, 서로 존중하는 관계가 오래 유지되는 특징이 있습니다.";
  }

  if (dayMaster.includes("임") || dayMaster.includes("계")) {
    return "수(水) 일간은 대화와 정서적 교감을 중요하게 생각하며 편안한 배우자와 좋은 궁합을 이룹니다.";
  }

  return "배우자의 조건보다 서로의 생활 방식이 잘 맞는지가 결혼운을 좌우합니다.";
}

function getMarriageAdvice(element: string): string {
  switch (element) {
    case "목":
      return "목 기운이 강하면 서로 성장하는 관계를 만들 때 결혼 만족도가 높습니다.";
    case "화":
      return "화 기운이 강하면 감정 표현은 좋지만 순간적인 감정으로 큰 결정을 하지 않는 것이 중요합니다.";
    case "토":
      return "토 기운이 강하면 안정감은 좋지만 상대를 지나치게 책임지려는 성향은 줄이는 것이 좋습니다.";
    case "금":
      return "금 기운이 강하면 원칙이 분명한 장점이 있지만 상대를 너무 평가하려는 태도는 피하는 것이 좋습니다.";
    case "수":
      return "수 기운이 강하면 이해심은 좋지만 결정을 계속 미루지 않는 것이 중요합니다.";
    default:
      return "결혼은 서로의 차이를 인정하는 자세가 가장 중요한 요소입니다.";
  }
}

export function buildMarriageSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const dayMaster = basic.dayMaster ?? "";
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";

  return [
    `[결혼 심층 상담]

${name}님의 결혼운은 배우자를 언제 만나는가보다 어떤 가정을 만들어 갈 수 있는가를 중심으로 보는 것이 더 중요합니다.

[결혼 성향]
${getMarriageStyle(dayMaster)}

[강한 기운으로 보는 배우자 관계]
${getMarriageAdvice(strongElement)}

[보완해야 할 부분]
약한 오행은 ${weakElement}입니다. 이 부분은 결혼 생활에서 서로 이해하고 맞춰가야 할 영역으로 나타날 수 있습니다.

[실천 전략]
첫째, 조건보다 가치관을 먼저 확인하십시오.
둘째, 갈등은 오래 쌓기보다 바로 대화로 푸는 것이 좋습니다.
셋째, 서로의 생활 습관을 존중하는 관계가 오래갑니다.
넷째, 함께 성장할 수 있는 목표를 만드는 것이 결혼운을 더욱 안정적으로 만들어 줍니다.`,
  ];
}