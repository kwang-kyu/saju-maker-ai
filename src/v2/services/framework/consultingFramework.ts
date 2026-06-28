export type ConsultingFrameworkParams = {
  name: string;
  title: string;
  firstImpression: string;
  personInsight: string;
  repeatedPattern: string;
  realCase: string;
  futureFlow: string;
  actionGuide: string;
  finalMessage: string;
};

export function buildConsultingFramework(params: ConsultingFrameworkParams) {
  return `
${params.title}

원장님이 먼저 드리는 말씀

${params.name}님, 제가 상담에서 가장 먼저 보는 것은 좋은 운이 있느냐 없느냐가 아닙니다.
이 사람이 어떤 환경에서 힘이 살아나고, 어떤 상황에서 쉽게 지치는지를 먼저 봅니다.

${params.firstImpression}

당신은 어떤 사람인가

${params.personInsight}

반복되는 흐름

${params.repeatedPattern}

실제 상담에서 자주 보이는 모습

${params.realCase}

앞으로의 방향

${params.futureFlow}

실천 처방

${params.actionGuide}

원장님의 마지막 한마디

${params.finalMessage}
`.trim();
}
