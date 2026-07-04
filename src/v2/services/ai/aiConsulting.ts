import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingDecision } from "../case/consultingDecision";
import { buildMasterDecision } from "../framework/masterDecisionEngine";

function getMainConcern(concern?: string) {
  const value = String(concern ?? "").trim();
  return value || "지금 제 운의 흐름에서 가장 중요한 조언을 듣고 싶습니다.";
}

function getLatestQuestion(text: string) {
  const marker = "[현재 추가 질문]";
  if (!text.includes(marker)) return text.trim();

  return text
    .split(marker)
    .pop()
    ?.replace("위 이전 상담 흐름을 이어받아 같은 말을 반복하지 말고, 현재 추가 질문에 맞춰 연속 상담처럼 답변하세요.", "")
    .trim() || text.trim();
}

function hasPreviousContext(text: string) {
  return text.includes("[이전 상담 흐름]");
}

function getTopicType(topic: string) {
  if (
    topic.includes("재혼") ||
    topic.includes("이혼 후") ||
    topic.includes("다시 결혼")
  ) {
    return "remarriage";
  }

  if (
    topic.includes("자녀") ||
    topic.includes("아이") ||
    topic.includes("출산") ||
    topic.includes("임신") ||
    topic.includes("교육")
  ) {
    return "children";
  }

  if (
    topic.includes("건강") ||
    topic.includes("몸") ||
    topic.includes("병원") ||
    topic.includes("수면") ||
    topic.includes("검진") ||
    topic.includes("회복")
  ) {
    return "health";
  }

  if (
    topic.includes("사업") ||
    topic.includes("창업") ||
    topic.includes("부업") ||
    topic.includes("장사") ||
    topic.includes("동업") ||
    topic.includes("확장")
  ) {
    return "business";
  }

  if (
    topic.includes("돈") ||
    topic.includes("재물") ||
    topic.includes("투자") ||
    topic.includes("집") ||
    topic.includes("부동산") ||
    topic.includes("대출")
  ) {
    return "money";
  }

  if (
    topic.includes("직업") ||
    topic.includes("이직") ||
    topic.includes("퇴사") ||
    topic.includes("커리어") ||
    topic.includes("직장")
  ) {
    return "job";
  }

  if (
    topic.includes("결혼") ||
    topic.includes("배우자") ||
    topic.includes("혼인")
  ) {
    return "marriage";
  }

  if (
    topic.includes("연애") ||
    topic.includes("인연") ||
    topic.includes("상대") ||
    topic.includes("사람") ||
    topic.includes("만남")
  ) {
    return "love";
  }

  if (
    topic.includes("인간관계") ||
    topic.includes("관계") ||
    topic.includes("가족") ||
    topic.includes("동료") ||
    topic.includes("믿을")
  ) {
    return "relationship";
  }

  return "general";
}

function getOpening(topic: string, continued: boolean) {
  if (continued) {
    return `앞에서 나눈 흐름까지 같이 보면, 이번 질문은 따로 떼어 볼 문제가 아니라 앞 상담의 연장선에서 봐야 합니다.`;
  }

  if (topic.includes("?") || topic.includes("까요")) {
    return `질문에 바로 답을 드리면, 가능성은 있습니다. 다만 그냥 된다고 보기보다 조건을 같이 봐야 합니다.`;
  }

  return `지금 질문은 단순히 운이 좋다, 나쁘다로 볼 문제가 아닙니다. 현실에서 어떤 선택을 해야 하는지가 더 중요합니다.`;
}

function getNaturalAnswer(topic: string, data: BasicSajuResult) {
  const type = getTopicType(topic);
  const strong = data.strongestElement;
  const weak = data.weakestElement;

  if (type === "love") {
    return `새로운 인연운은 막혀 있다고 보기는 어렵습니다. 다만 ${data.name}님은 아무 사람이나 빨리 가까워지는 흐름보다는, 신뢰가 쌓이면서 관계가 깊어지는 쪽이 더 맞습니다.

특히 강한 ${strong} 기운은 매력이나 주도성으로 나타날 수 있지만, 약한 ${weak} 기운은 상대를 고를 때 흔들리는 부분으로 나타날 수 있습니다. 그래서 중요한 것은 인연이 들어오느냐보다 들어온 인연을 제대로 구분하느냐입니다.

처음부터 말이 너무 좋거나, 감정만 빠르게 끌고 가는 사람은 조심하는 게 좋습니다. 반대로 말보다 행동이 일정하고, 돈과 생활 태도가 안정적인 사람은 길게 볼 만합니다.`;
  }

  if (type === "marriage") {
    return `결혼운은 있습니다. 다만 ${data.name}님 사주는 결혼을 감정 하나로 밀어붙이면 피곤해질 수 있고, 생활 조건과 현실 기준을 맞춰야 안정됩니다.

배우자를 볼 때는 외적인 조건보다 생활 리듬, 돈 쓰는 습관, 가족과의 거리, 갈등을 풀어가는 태도를 봐야 합니다. 이 부분이 맞지 않으면 초반 감정이 좋아도 뒤에서 부담이 커질 수 있습니다.

결혼은 서두르기보다 이 사람과 일상을 같이 살아도 내가 무너지지 않는가를 기준으로 보시는 게 맞습니다.`;
  }

  if (type === "remarriage") {
    return `재혼 가능성은 있습니다. 다만 초혼보다 더 현실적으로 봐야 합니다. 재혼은 감정만 보는 문제가 아니라 자녀, 재산, 가족관계, 생활비, 주거 문제까지 같이 보는 선택입니다.

${data.name}님은 강한 ${strong} 기운을 잘 쓰면 다시 관계를 세우는 힘이 있지만, 약한 ${weak} 기운 때문에 마음이 급할 때 상대의 현실 조건을 놓칠 수 있습니다.

재혼을 생각한다면 처음부터 돈, 자녀, 가족 문제를 피하지 말고 대화해야 합니다. 이 이야기를 불편해하거나 회피하는 사람은 조심해야 합니다.`;
  }

  if (type === "children") {
    return `자녀운은 단순히 있다, 없다로 끊어서 볼 문제는 아닙니다. 사주에서는 자녀와의 인연, 책임, 관계의 방식까지 같이 봅니다.

${data.name}님은 자녀 문제에서 정이 깊어질 수 있지만, 동시에 걱정이 많아질 수 있는 흐름도 있습니다. 그래서 자녀와의 관계는 통제보다 기준, 간섭보다 대화가 중요합니다.

출산이나 자녀 계획을 묻는 것이라면 몸 상태와 현실 여건을 먼저 같이 봐야 하고, 이미 자녀가 있다면 아이의 기질을 억누르기보다 방향을 잡아주는 방식이 좋습니다.`;
  }

  if (type === "relationship") {
    return `인간관계는 좋아질 수 있습니다. 다만 모든 사람과 좋아지는 운이라기보다, 사람을 정리하고 진짜 남을 사람을 가르는 흐름에 가깝습니다.

${data.name}님은 강한 ${strong} 기운 때문에 자기 기준이 분명하게 보일 수 있습니다. 이 장점이 좋게 쓰이면 신뢰가 생기지만, 피곤한 사람에게는 강하게 보일 수 있습니다.

믿을 사람은 말이 많은 사람이 아니라 약속을 지키는 사람입니다. 반대로 필요할 때만 연락하거나, 돈과 부탁이 섞이는 관계는 거리를 두는 것이 좋습니다.`;
  }

  if (type === "business") {
    return `사업은 가능성이 있습니다. 다만 크게 시작하는 방식은 맞지 않습니다. 지금은 작게 검증하고, 반응을 보고, 그다음 키우는 방식이 안전합니다.

${data.name}님은 강한 ${strong} 기운을 추진력으로 쓸 수 있습니다. 다만 약한 ${weak} 기운이 준비 부족이나 관리 부담으로 나타나면, 시작은 잘해도 유지에서 흔들릴 수 있습니다.

업종은 단순 유행보다 본인이 설명을 잘하고, 고객과 신뢰를 쌓을 수 있고, 반복 판매가 가능한 쪽이 좋습니다. 동업은 역할과 돈 계산이 명확하지 않으면 피하는 편이 낫습니다.`;
  }

  if (type === "money") {
    return `재물운은 돈이 아예 안 들어오는 구조는 아닙니다. 다만 들어온 돈을 지키고 배치하는 방식이 더 중요합니다.

강한 ${strong} 기운은 기회를 잡는 힘으로 쓸 수 있지만, 약한 ${weak} 기운은 충동적 지출이나 무리한 투자에서 흔들릴 수 있습니다.

지금은 크게 버는 것보다 새는 돈을 막는 것이 먼저입니다. 투자나 부동산은 감당 가능한 대출, 현금흐름, 손실 가능성을 계산한 뒤 움직이는 것이 맞습니다.`;
  }

  if (type === "job") {
    return `직업운은 변화 가능성이 있습니다. 다만 감정적으로 퇴사하거나, 조건 하나만 보고 이직하는 것은 좋지 않습니다.

${data.name}님은 역할이 분명하고 책임 범위가 명확한 환경에서 힘이 살아납니다. 반대로 기준 없이 시키는 일이 많거나, 성과가 인정되지 않는 곳에서는 쉽게 지칠 수 있습니다.

이직을 본다면 연봉만 보지 말고 권한, 성장성, 1년 뒤 경력에 남는 결과물을 같이 봐야 합니다.`;
  }

  if (type === "health") {
    return `건강은 겁부터 낼 문제는 아니지만 방치하면 안 됩니다. 사주에서 건강은 병명을 단정하는 것이 아니라, 몸이 쉽게 지치는 방향과 생활 리듬을 보는 것입니다.

약한 ${weak} 기운은 관리해야 할 지점입니다. 수면, 식사, 걷기, 검진처럼 기본을 먼저 잡아야 합니다.

특히 반복되는 증상이 있으면 운으로 넘기지 말고 검진을 받는 것이 맞습니다. 사주는 조심할 방향을 알려주는 것이지 병원 진단을 대신하지는 않습니다.`;
  }

  return `${data.name}님의 사주 흐름을 보면, 지금은 막연히 운이 좋다 나쁘다를 따질 때보다 선택의 기준을 세우는 것이 더 중요합니다.

강한 ${strong} 기운은 밀고 나가는 힘으로 쓸 수 있지만, 약한 ${weak} 기운은 결정이 흔들리거나 현실 계산이 부족해지는 부분으로 나타날 수 있습니다.

그래서 지금 질문은 할 수 있느냐보다 어떤 조건이면 해도 되는가로 보는 것이 맞습니다.`;
}

function getPracticalAdvice(topic: string) {
  const type = getTopicType(topic);

  if (type === "love") {
    return `현실 조언을 드리면, 새로운 사람을 만날 때 처음 감정보다 반복되는 행동을 보세요. 연락이 일정한지, 약속을 지키는지, 돈 문제에서 무리하지 않는지를 보면 됩니다.`;
  }

  if (type === "marriage") {
    return `현실 조언은 분명합니다. 결혼 이야기가 나오면 돈, 주거, 가족과의 거리, 생활습관을 먼저 대화하세요. 이 이야기를 피하는 관계는 오래 가기 어렵습니다.`;
  }

  if (type === "remarriage") {
    return `재혼은 더더욱 현실 대화가 먼저입니다. 자녀, 재산, 생활비, 가족 문제를 초기에 확인해야 나중에 상처가 적습니다.`;
  }

  if (type === "children") {
    return `자녀 문제는 조급하게 결론 내리지 말고 몸 상태, 가정 형편, 양육 환경을 같이 보세요. 이미 자녀가 있다면 통제보다 대화가 중요합니다.`;
  }

  if (type === "relationship") {
    return `인간관계는 넓히기보다 정리하는 것이 먼저입니다. 부탁만 많은 사람, 감정 소모가 큰 사람, 돈 이야기가 섞이는 사람은 거리를 두세요.`;
  }

  if (type === "business") {
    return `사업은 3개월 테스트가 먼저입니다. 고정비를 늘리기 전에 작은 상품, 작은 고객, 작은 매출로 반응을 확인하세요.`;
  }

  if (type === "money") {
    return `돈 문제는 이번 달 고정지출부터 적으세요. 비상자금과 투자금을 분리하고, 대출이 들어가는 결정은 월 상환액부터 계산해야 합니다.`;
  }

  if (type === "job") {
    return `직업 문제는 30일만 정리해보세요. 지금 회사에서 남는 것, 잃는 것, 다음 선택지에서 얻을 것을 종이에 써보면 판단이 훨씬 선명해집니다.`;
  }

  if (type === "health") {
    return `건강은 오늘부터 수면 시간, 식사 시간, 걷기부터 잡으세요. 반복 증상이 있으면 검진을 미루지 않는 것이 가장 현실적인 조언입니다.`;
  }

  return `현실 조언은 하나입니다. 지금 바로 큰 결정을 하지 말고, 이번 주 안에 작게 확인할 수 있는 행동 하나를 먼저 하세요.`;
}

export function getAiConsulting(data: BasicSajuResult, concern?: string): string {
  const rawTopic = getMainConcern(concern);
  const topic = getLatestQuestion(rawTopic);
  const continued = hasPreviousContext(rawTopic);

  const caseDecision = buildConsultingDecision(data, topic);
  const masterDecision = buildMasterDecision(data);

  const opening = getOpening(topic, continued);
  const naturalAnswer = getNaturalAnswer(topic, data);
  const practicalAdvice = getPracticalAdvice(topic);

  return `
${opening}

${naturalAnswer}

사주 흐름으로 보면 ${data.name}님은 ${masterDecision.lifePhase} 흐름에 있고, 올해의 핵심 키워드는 "${masterDecision.yearlyKeyword}" 쪽으로 잡힙니다. 그래서 지금 질문도 단순히 마음만 보고 결정하기보다 ${masterDecision.priorityArea}을 먼저 기준으로 삼는 것이 좋습니다.

현재 판단은 이렇게 보시면 됩니다.

${caseDecision.verdict}

다만 이 말은 무조건 하라거나 무조건 피하라는 뜻이 아닙니다. ${data.name}님에게 중요한 것은 ${masterDecision.decisionStyle} 방식으로 결정하되, 한 번에 크게 움직이지 않는 것입니다.

${practicalAdvice}

그리고 한 가지는 꼭 조심하세요.

${masterDecision.warnings[0]}

이 부분을 놓치면 좋은 흐름이 와도 결과가 흔들릴 수 있습니다.

정리해서 말씀드리면, 지금 질문의 답은 가능성은 있다입니다. 다만 조건 없이 밀어붙일 일은 아니고, 사람돈건강시간 중 어디에서 부담이 생기는지 먼저 확인해야 합니다.

다음 질문에서는 이렇게 이어서 물어보시면 좋습니다.

그럼 제가 지금 제일 먼저 확인해야 할 것은 무엇인가요?
이 사람은 조심해야 할 사람인가요?
이 일을 시작하면 돈 문제는 어떻게 봐야 하나요?
언제쯤 다시 판단하는 게 좋을까요?
`.trim();
}
