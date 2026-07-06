import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";

function getDayMasterMessage(dayMaster: string) {
  const value = String(dayMaster);

  if (value.includes("갑") || value.includes("을")) {
    return {
      person: "성장하고 넓혀가는 힘이 강한 사람입니다. 사람, 일, 계획이 한 번 연결되면 꾸준히 키워가는 장점이 있습니다.",
      caution: "방향이 자주 바뀌면 힘이 흩어질 수 있으니, 한 가지 기준을 정하고 오래 밀고 가는 것이 중요합니다.",
      keyword: "성장과 관계",
    };
  }

  if (value.includes("병") || value.includes("정")) {
    return {
      person: "표현력과 존재감이 살아날 때 운이 열리는 사람입니다. 마음이 움직이면 행동도 빠르고 결과도 비교적 빨리 드러나는 편입니다.",
      caution: "감정이나 분위기에 따라 에너지가 크게 흔들릴 수 있으니, 무리하게 앞서가기보다 리듬을 조절하는 것이 중요합니다.",
      keyword: "표현과 추진력",
    };
  }

  if (value.includes("무") || value.includes("기")) {
    return {
      person: "책임감과 현실감이 강한 사람입니다. 주변을 받쳐주고 오래 유지하는 힘이 있어, 시간이 갈수록 신뢰가 쌓이는 타입입니다.",
      caution: "모든 것을 혼자 책임지려 하면 몸과 마음이 쉽게 무거워질 수 있으니, 책임의 범위를 나누는 연습이 필요합니다.",
      keyword: "책임과 신뢰",
    };
  }

  if (value.includes("경") || value.includes("신")) {
    return {
      person: "판단력과 정리 능력이 강한 사람입니다. 흐릿한 상황보다 기준과 결과가 분명할 때 실력이 잘 살아납니다.",
      caution: "기준이 너무 강해지면 스스로도 피곤해지고 관계가 딱딱해질 수 있으니, 여유를 남겨두는 것이 좋습니다.",
      keyword: "판단과 정리",
    };
  }

  if (value.includes("임") || value.includes("계")) {
    return {
      person: "생각이 깊고 흐름을 읽는 힘이 있는 사람입니다. 상황을 넓게 보고 유연하게 움직일 때 좋은 선택을 만들 수 있습니다.",
      caution: "생각이 길어지면 결정을 미루기 쉬우니, 중요한 일은 기준을 정해 실행까지 연결하는 것이 필요합니다.",
      keyword: "지혜와 유연함",
    };
  }

  return {
    person: "자기 기준을 세우고 현실적으로 삶을 정리해가는 힘이 있는 사람입니다.",
    caution: "기준이 흐려질 때 선택이 흔들릴 수 있으니, 중요한 일일수록 우선순위를 분명히 하는 것이 좋습니다.",
    keyword: "기준과 균형",
  };
}

function getElementMessage(element: string, type: "strong" | "weak") {
  const prefix = type === "strong" ? "잘 살아나는 강점은" : "앞으로 보완하면 좋은 부분은";

  if (element.includes("목")) {
    return `${prefix} 계획을 세우고 관계를 넓히며 새로운 일을 시작하는 힘입니다.`;
  }

  if (element.includes("화")) {
    return `${prefix} 표현력, 활동성, 존재감, 성과를 밖으로 드러내는 힘입니다.`;
  }

  if (element.includes("토")) {
    return `${prefix} 안정감, 책임감, 관리 능력, 현실적으로 버티는 힘입니다.`;
  }

  if (element.includes("금")) {
    return `${prefix} 판단력, 정리 능력, 결단력, 결과를 만들어내는 힘입니다.`;
  }

  if (element.includes("수")) {
    return `${prefix} 지혜, 유연함, 소통, 흐름을 읽고 조절하는 힘입니다.`;
  }

  return `${prefix} 생활의 균형과 현실적인 선택입니다.`;
}

export function basicConsulting(data: BasicSajuResult): string {
  const dayMasterMessage = getDayMasterMessage(data.dayMaster);
  const strongMessage = getElementMessage(data.strongestElement, "strong");
  const weakMessage = getElementMessage(data.weakestElement, "weak");

  return buildConsultingFramework({
    name: data.name,
    title: "기본 사주 상담",
    firstImpression: `${data.name}님 사주에서 가장 먼저 보이는 키워드는 '${dayMasterMessage.keyword}'입니다.

겉으로는 차분해 보여도 안쪽에는 쉽게 흔들리지 않는 기준이 있습니다. 중요한 일을 결정할 때도 남들이 좋다고 해서 바로 따라가기보다, 본인이 납득할 수 있어야 움직이는 사람입니다.

그래서 ${data.name}님은 속도가 빠른 사람이라기보다 방향이 맞을 때 오래 버티고 끝까지 해내는 사람에 가깝습니다.

${strongMessage}

이 부분은 억지로 만들어야 하는 능력이 아니라 이미 가지고 있는 기본 힘에 가깝습니다.`,

    personInsight: `${dayMasterMessage.person}

${data.name}님은 가볍게 흘러가는 관계나 일보다, 믿을 수 있는 사람과 오래 이어지는 일을 중요하게 보는 편입니다.

한 번 마음을 정하면 쉽게 흔들리지 않는 면도 있습니다. 그래서 남들이 좋다고 하는 길보다, 본인이 오래 유지할 수 있는 길을 선택할 때 운이 안정됩니다.`,

    repeatedPattern: `${data.name}님 인생에서는 처음부터 크게 드러나기보다 시간이 지나면서 진가가 나타나는 흐름이 반복될 수 있습니다.

처음에는 손해 보는 것처럼 보여도, 오래 쌓은 신뢰와 경험이 나중에는 큰 자산이 되는 구조입니다.

다만 마음속 불편함을 오래 쌓아두면 판단이 무거워질 수 있습니다. 중요한 일일수록 혼자 끌어안기보다 정리해서 표현하는 습관이 필요합니다.`,

    realCase: `실제 상담을 해보면 이런 사주를 가진 분들은 능력이 부족해서 힘든 것이 아닙니다.

오히려 다른 사람의 부탁을 쉽게 거절하지 못하거나, 일이 잘못될까 봐 결국 본인이 마무리하면서 지치는 경우가 많았습니다.

${data.name}님도 앞으로는 더 열심히 사는 것보다 무엇을 내가 책임지고 무엇은 내려놓을지를 구분하는 것이 중요합니다.`,

    futureFlow: `${weakMessage}

이것은 약점이라기보다 운을 오래 유지하기 위한 균형 포인트입니다.

${dayMasterMessage.caution}

앞으로의 운을 좋게 쓰려면 남의 속도에 끌려가기보다 본인의 리듬을 지켜야 합니다. 오래 가져갈 일과 빨리 정리할 일을 구분할수록 선택이 훨씬 편안해질 수 있습니다.`,

    actionGuide: `늘릴 것: 오래 유지할 수 있는 일, 신뢰할 수 있는 관계, 차분한 생활 리듬

줄일 것: 혼자 떠안는 책임, 마음속에 쌓아두는 불편함, 남의 속도에 끌려가는 선택

지켜야 할 습관: 중요한 결정은 바로 하지 말고 하루 정도 정리한 뒤 판단하기`,

    finalMessage: `${data.name}님은 운이 없는 사람이 아니라, 방향이 분명해질수록 힘이 살아나는 사람입니다.

남들보다 빠르게 가려 하기보다 본인에게 맞는 길을 꾸준히 가는 것이 중요합니다.

좋은 운은 갑자기 오는 것이 아니라, 나에게 맞지 않는 부담을 줄이고 오래 가져갈 가치를 선택할 때 열립니다. 시간이 지날수록 경험과 신뢰가 자산이 되는 사주입니다.`,
  });
}