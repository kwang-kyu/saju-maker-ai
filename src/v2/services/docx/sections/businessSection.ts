import type { BasicSajuResult } from "../../../types/basic";

function getBusinessStyle(dayMaster?: string): string {
  if (!dayMaster) {
    return "사업운은 업종보다 어떤 방식으로 사업을 운영하는지가 더 중요합니다.";
  }

  if (dayMaster.includes("갑") || dayMaster.includes("을")) {
    return "목(木) 일간은 새로운 시장을 개척하고 사람을 연결하는 사업에 강점이 있습니다. 성장형 사업 모델이 잘 맞습니다.";
  }

  if (dayMaster.includes("병") || dayMaster.includes("정")) {
    return "화(火) 일간은 홍보, 마케팅, 교육, 콘텐츠, 서비스업처럼 사람과 소통하는 사업에서 경쟁력이 높습니다.";
  }

  if (dayMaster.includes("무") || dayMaster.includes("기")) {
    return "토(土) 일간은 안정적인 운영과 신뢰를 바탕으로 하는 사업에 적합합니다. 장기적인 브랜드 구축에 강점이 있습니다.";
  }

  if (dayMaster.includes("경") || dayMaster.includes("신")) {
    return "금(金) 일간은 전문성과 품질 관리가 중요한 사업에서 능력을 발휘합니다. 제조, 기술, 전문 서비스 분야와 잘 맞습니다.";
  }

  if (dayMaster.includes("임") || dayMaster.includes("계")) {
    return "수(水) 일간은 유통, 플랫폼, 무역, 중개, 정보 기반 사업에서 흐름을 읽는 능력이 뛰어난 편입니다.";
  }

  return "사업은 자신의 강점을 수익 구조로 연결하는 방식이 가장 중요합니다.";
}

function getBusinessAdvice(element: string): string {
  switch (element) {
    case "목":
      return "목 기운이 강하면 확장력은 좋지만 준비되지 않은 투자와 사업 확장은 신중해야 합니다.";
    case "화":
      return "화 기운이 강하면 고객을 모으는 힘이 뛰어나지만 감정적인 의사결정을 줄이는 것이 중요합니다.";
    case "토":
      return "토 기운이 강하면 안정적인 운영은 좋지만 변화가 필요한 시기를 놓치지 않아야 합니다.";
    case "금":
      return "금 기운이 강하면 체계적인 운영 능력이 뛰어나지만 지나친 완벽주의는 사업 속도를 늦출 수 있습니다.";
    case "수":
      return "수 기운이 강하면 시장 변화에 빠르게 대응할 수 있지만 실행 시점을 놓치지 않는 것이 중요합니다.";
    default:
      return "사업은 자신의 장점을 중심으로 운영 구조를 만드는 것이 가장 중요합니다.";
  }
}

export function buildBusinessSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const dayMaster = basic.dayMaster ?? "";
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";

  return [
    `[사업 심층 상담]

${name}님의 사업운은 단순히 사업을 할 수 있느냐보다 어떤 방식으로 운영할 때 성공 가능성이 높아지는지를 보는 것이 중요합니다.

[사업 성향]
${getBusinessStyle(dayMaster)}

[강한 기운이 주는 장점]
${getBusinessAdvice(strongElement)}

[보완해야 할 부분]
약한 오행은 ${weakElement}입니다. 이 부분은 사업 운영에서 부족할 수 있는 영역이므로 시스템이나 협업으로 보완하는 것이 좋습니다.

[실천 전략]
첫째, 자신이 잘하는 분야에 집중하십시오.
둘째, 무리한 확장보다 검증된 성장을 선택하십시오.
셋째, 숫자와 현금 흐름을 항상 우선 관리하십시오.
넷째, 사람보다 시스템을 먼저 만드는 사업이 오래갑니다.`,
  ];
}