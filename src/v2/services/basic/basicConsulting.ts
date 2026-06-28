import type { BasicSajuResult } from "../../types/basic";

function getDayMasterMessage(dayMaster: string) {
  const value = String(dayMaster);
  if (value.includes("갑") || value.includes("을")) {
    return "나무의 기운처럼 성장, 확장, 관계의 흐름을 중요하게 보는 타입입니다. 한 번 방향이 잡히면 꾸준히 뻗어가려는 힘이 있습니다.";
  }

  if (value.includes("병") || value.includes("정")) {
    return "불의 기운처럼 표현력, 추진력, 존재감이 중요한 타입입니다. 마음이 살아날 때 행동력과 결과가 빠르게 나타납니다.";
  }

  if (value.includes("무") || value.includes("기")) {
    return "흙의 기운처럼 책임감, 현실감, 안정감이 중요한 타입입니다. 주변을 받쳐주고 오래 유지하는 힘이 강합니다.";
  }

  if (value.includes("경") || value.includes("신")) {
    return "금의 기운처럼 판단력, 기준, 정리가 중요한 타입입니다. 흐릿한 상황보다 원칙과 결과가 분명한 환경에서 강점이 살아납니다.";
  }

  if (value.includes("임") || value.includes("계")) {
    return "물의 기운처럼 생각, 흐름, 지혜가 중요한 타입입니다. 상황을 읽고 유연하게 움직이는 힘이 있습니다.";
  }

  return "자기 기준을 세우고 현실적으로 삶을 정리해가는 힘이 있는 타입입니다.";
}

function getElementMessage(element: string, type: "strong" | "weak") {
  const prefix = type === "strong" ? "강하게 살아나는 기운은" : "보완하면 좋은 기운은";

  if (element.includes("목")) {
    return `${prefix} 성장, 계획, 인간관계, 시작의 흐름입니다.`;
  }

  if (element.includes("화")) {
    return `${prefix} 표현, 활동성, 명예, 드러나는 성과의 흐름입니다.`;
  }

  if (element.includes("토")) {
    return `${prefix} 안정, 책임, 현실감, 관리의 흐름입니다.`;
  }

  if (element.includes("금")) {
    return `${prefix} 판단, 정리, 결단, 결과를 만드는 흐름입니다.`;
  }

  if (element.includes("수")) {
    return `${prefix} 지혜, 유연함, 소통, 흐름을 읽는 감각입니다.`;
  }

  return `${prefix} 생활의 균형과 현실적인 선택입니다.`;
}

export function basicConsulting(data: BasicSajuResult): string {
  const dayMasterMessage = getDayMasterMessage(data.dayMaster);
  const strongMessage = getElementMessage(data.strongestElement, "strong");
  const weakMessage = getElementMessage(data.weakestElement, "weak");

  return `
🌿 원장님이 처음 드리는 말씀

${data.name}님 사주를 보면 먼저 ${data.dayMaster} 일간의 기질이 중심에 놓여 있습니다.

${dayMasterMessage}

또한 ${data.name}님의 사주는 ${data.yearGanZhi}, ${data.monthGanZhi}, ${data.dayGanZhi}의 흐름을 기준으로 볼 때, 겉으로 보이는 성격보다 안쪽의 기준과 생활 리듬이 더 중요하게 작용합니다.

${strongMessage}

이 기운은 ${data.name}님이 일을 선택하고, 사람을 대하고, 돈을 관리할 때 자연스럽게 드러나는 장점입니다. 억지로 만들어야 하는 능력이라기보다 이미 가지고 있는 기본 힘에 가깝습니다.

${weakMessage}

이 부분은 약점이라고 보기보다 운을 오래 유지하기 위해 반드시 보완해야 하는 균형 포인트입니다. 이 균형이 잡히면 같은 선택을 하더라도 결과가 훨씬 안정적으로 나타납니다.


타고난 기질

${data.name}님은 한 번 마음을 정하면 쉽게 흔들리지 않는 면이 있습니다.

다만 무조건 빠르게 움직이는 사람이라기보다, 스스로 납득하고 방향이 분명해졌을 때 힘이 제대로 살아나는 편입니다.

그래서 남이 좋다고 하는 길보다, 본인이 오래 유지할 수 있는 길을 선택할 때 운이 안정됩니다.


생활에서 드러나는 모습

${data.name}님은 관계나 일에서 가볍게 흘러가는 것보다 신뢰와 기준을 중요하게 봅니다.

처음에는 조심스럽게 살피지만, 한 번 믿음이 생기면 쉽게 놓지 않는 편입니다.

이 장점은 장기적으로 신뢰를 얻는 데 도움이 됩니다. 반대로 마음속에 불편함을 오래 쌓아두면 판단이 무거워질 수 있으니, 중요한 일일수록 생각을 정리해서 표현하는 습관이 필요합니다.


원장님 총평

한마디로 말씀드리면, ${data.name}님은 자기 기준이 잡힐수록 운이 안정되는 사람입니다.

지금 중요한 것은 남들보다 빠르게 가는 것이 아니라, 본인에게 맞는 방향을 분명히 세우는 것입니다.

강한 기운은 더 잘 살리고, 부족한 기운은 생활 속에서 보완하면 앞으로의 선택이 훨씬 편안해질 수 있습니다.
`.trim();
}
