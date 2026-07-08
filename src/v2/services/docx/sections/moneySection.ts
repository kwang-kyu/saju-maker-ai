import type { BasicSajuResult } from "../../../types/basic";

function getMoneyStyle(dayMaster?: string): string {
  if (!dayMaster) return "재물운은 돈의 크기보다 돈을 다루는 방식에서 먼저 드러납니다.";

  if (dayMaster.includes("갑") || dayMaster.includes("을")) {
    return "목(木) 일간은 성장형 재물운입니다. 돈을 한 번에 크게 잡기보다 일, 사업, 사람관계가 커지면서 재물이 따라오는 흐름이 강합니다.";
  }

  if (dayMaster.includes("병") || dayMaster.includes("정")) {
    return "화(火) 일간은 표현형 재물운입니다. 영업, 홍보, 콘텐츠, 사람을 설득하는 능력이 돈으로 연결되기 쉽습니다.";
  }

  if (dayMaster.includes("무") || dayMaster.includes("기")) {
    return "토(土) 일간은 축적형 재물운입니다. 큰 모험보다 안정적인 기반, 부동산, 고정 수입, 장기 자산 관리에 강점이 있습니다.";
  }

  if (dayMaster.includes("경") || dayMaster.includes("신")) {
    return "금(金) 일간은 관리형 재물운입니다. 계산, 판단, 정리, 계약, 전문성, 시스템을 통해 돈을 만드는 흐름이 좋습니다.";
  }

  if (dayMaster.includes("임") || dayMaster.includes("계")) {
    return "수(水) 일간은 유통형 재물운입니다. 정보, 이동, 중개, 네트워크, 흐름을 읽는 능력이 재물로 이어지기 쉽습니다.";
  }

  return "재물운은 자신의 강점을 어떤 방식으로 현금 흐름으로 바꾸느냐가 핵심입니다.";
}

function getStrongMoneyAdvice(element: string): string {
  switch (element) {
    case "목":
      return "목 기운이 강하면 새로운 기회를 만드는 힘이 좋습니다. 다만 확장 욕심이 앞서면 지출과 투자가 커질 수 있으니 속도 조절이 필요합니다.";
    case "화":
      return "화 기운이 강하면 사람을 끌어들이고 알리는 능력이 좋습니다. 다만 분위기에 따라 소비가 커질 수 있어 감정 소비를 조심해야 합니다.";
    case "토":
      return "토 기운이 강하면 모으고 지키는 힘이 있습니다. 다만 변화가 필요한 때에도 지나치게 보수적으로 움직이면 기회를 놓칠 수 있습니다.";
    case "금":
      return "금 기운이 강하면 돈을 계산하고 관리하는 능력이 좋습니다. 다만 너무 단기 손익만 보면 장기 성장 기회를 놓칠 수 있습니다.";
    case "수":
      return "수 기운이 강하면 정보와 흐름을 읽는 감각이 좋습니다. 다만 판단이 늦어지면 좋은 기회가 지나갈 수 있으니 실행 기준이 필요합니다.";
    default:
      return "강한 기운이 뚜렷하지 않을 때는 무리한 투자보다 현금 흐름을 안정시키는 것이 먼저입니다.";
  }
}

function getWeakMoneyAdvice(element: string): string {
  switch (element) {
    case "목":
      return "목 기운이 약하면 돈을 키우는 장기 계획이 약해질 수 있습니다. 저축, 투자, 사업 확장을 단계별로 설계해야 합니다.";
    case "화":
      return "화 기운이 약하면 돈을 벌 기회를 알리거나 표현하는 힘이 부족할 수 있습니다. 영업, 홍보, 제안 능력을 보완하는 것이 좋습니다.";
    case "토":
      return "토 기운이 약하면 돈을 붙잡는 힘이 약해질 수 있습니다. 예산표, 고정비 관리, 비상금 확보가 가장 중요합니다.";
    case "금":
      return "금 기운이 약하면 계약, 숫자, 정산, 손익 관리가 약해질 수 있습니다. 돈 문제는 감으로 하지 말고 기록과 기준으로 관리해야 합니다.";
    case "수":
      return "수 기운이 약하면 정보 흐름과 유동성 관리가 약해질 수 있습니다. 현금 여유와 시장 정보 확인 습관을 가져야 합니다.";
    default:
      return "약한 기운이 뚜렷하지 않을 때는 돈의 규모보다 새는 돈을 막는 습관이 먼저입니다.";
  }
}

export function buildMoneySection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const dayMaster = basic.dayMaster ?? "";
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";

  return [
    `[재물 심층 상담]

${name}님의 재물운은 단순히 돈이 많다 적다로 보는 것이 아니라, 어떤 방식으로 돈이 들어오고 어떤 부분에서 돈이 새는지를 함께 봐야 합니다.

[타고난 재물 성향]
${getMoneyStyle(dayMaster)}

[돈이 들어오는 방식]
${getStrongMoneyAdvice(strongElement)}

[돈이 새기 쉬운 부분]
${getWeakMoneyAdvice(weakElement)}

[실천 전략]
첫째, 수입보다 먼저 고정 지출과 반복 지출을 정리해야 합니다.
둘째, 투자나 사업은 감정이 아니라 숫자와 기준으로 판단해야 합니다.
셋째, 한 번에 큰돈을 노리기보다 현금 흐름을 안정시키는 것이 우선입니다.
넷째, 자신의 강한 기운을 돈 버는 방식으로 연결하고, 약한 기운은 시스템으로 보완하는 것이 좋습니다.`,
  ];
}