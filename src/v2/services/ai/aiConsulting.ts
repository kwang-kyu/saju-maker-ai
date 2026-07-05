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


type QuestionIntent = {
  topic: string;
  intent: string;
  wantsTiming: boolean;
  wantsWarning: boolean;
  wantsPersonality: boolean;
  wantsMoney: boolean;
  wantsAction: boolean;
};

function analyzeQuestionIntent(question: string): QuestionIntent {
  const topic = getTopicType(question);

  const wantsTiming =
    question.includes("언제") ||
    question.includes("시기") ||
    question.includes("올해") ||
    question.includes("내년") ||
    question.includes("몇 월") ||
    question.includes("몇년") ||
    question.includes("흐름");

  const wantsWarning =
    question.includes("조심") ||
    question.includes("위험") ||
    question.includes("피해야") ||
    question.includes("문제") ||
    question.includes("갈등") ||
    question.includes("불안");

  const wantsPersonality =
    question.includes("어떤 사람") ||
    question.includes("성격") ||
    question.includes("상대") ||
    question.includes("배우자") ||
    question.includes("인연") ||
    question.includes("좋은 사람");

  const wantsMoney =
    question.includes("돈") ||
    question.includes("재산") ||
    question.includes("재물") ||
    question.includes("대출") ||
    question.includes("투자") ||
    question.includes("부동산") ||
    question.includes("생활비");

  const wantsAction =
    question.includes("해야") ||
    question.includes("하면") ||
    question.includes("어떻게") ||
    question.includes("가능") ||
    question.includes("될까요") ||
    question.includes("좋을까요");

  let intent = "general_question";

  if (topic === "love" && question.includes("인연")) {
    intent = "new_relationship";
  }

  if (topic === "love" && wantsTiming) {
    intent = "love_timing";
  }

  if (topic === "marriage" && wantsTiming) {
    intent = "marriage_timing";
  }

  if (topic === "marriage" && wantsPersonality) {
    intent = "spouse_type";
  }

  if (topic === "remarriage" && question.includes("자녀")) {
    intent = "children_after_remarriage";
  }

  if (topic === "remarriage" && wantsMoney) {
    intent = "money_after_remarriage";
  }

  if (topic === "children" && question.includes("출산")) {
    intent = "childbirth";
  }

  if (topic === "children" && question.includes("교육")) {
    intent = "children_education";
  }

  if (topic === "relationship" && question.includes("믿")) {
    intent = "trusted_people";
  }

  if (topic === "relationship" && wantsWarning) {
    intent = "relationship_warning";
  }

  if (topic === "business" && (question.includes("시작") || question.includes("창업"))) {
    intent = "business_start";
  }

  if (topic === "business" && question.includes("동업")) {
    intent = "business_partner";
  }

  if (topic === "business" && question.includes("확장")) {
    intent = "business_expansion";
  }

  if (topic === "money" && question.includes("부동산")) {
    intent = "real_estate_money";
  }

  if (topic === "money" && question.includes("투자")) {
    intent = "investment";
  }

  if (topic === "money" && question.includes("돈")) {
    intent = "money_flow";
  }

  if (topic === "job" && question.includes("이직")) {
    intent = "job_change";
  }

  if (topic === "job" && question.includes("퇴사")) {
    intent = "resignation";
  }

  if (topic === "health" && question.includes("검진")) {
    intent = "health_checkup";
  }

  return {
    topic,
    intent,
    wantsTiming,
    wantsWarning,
    wantsPersonality,
    wantsMoney,
    wantsAction,
  };
}


function getIntentFocusedAdvice(intent: QuestionIntent, data: BasicSajuResult): string {
  if (intent.intent === "new_relationship") {
    return `${data.name}님 질문의 핵심은 단순히 사람이 들어오느냐가 아니라, 들어온 인연이 오래 갈 수 있는 인연인가입니다.

이 경우에는 세 가지를 보셔야 합니다.
첫째, 만남이 갑자기 뜨겁게 시작되는지보다 꾸준히 이어지는지 보세요.
둘째, 상대가 말보다 행동으로 신뢰를 주는지 보세요.
셋째, 돈과 생활 태도가 안정적인 사람인지 확인하세요.`;
  }

  if (intent.intent === "love_timing") {
    return `만남의 시기를 묻는 질문이라면, 지금은 억지로 사람을 만들기보다 생활 반경을 넓히는 쪽이 좋습니다.

소개, 모임, 일 관련 만남처럼 자연스럽게 반복해서 얼굴을 보는 자리에서 인연 가능성이 더 살아납니다. 단기간에 결론을 내기보다 2~3번 이상 만났을 때 편안함이 유지되는지를 보세요.`;
  }

  if (intent.intent === "marriage_timing") {
    return `결혼 시기를 묻는다면, 지금은 날짜보다 조건을 먼저 봐야 합니다.

결혼운은 감정만으로 움직일 때보다 돈, 주거, 가족과의 거리, 생활 리듬이 맞을 때 안정됩니다. 결혼 이야기가 나온다면 먼저 현실 조건을 정리한 뒤 시기를 잡는 것이 맞습니다.`;
  }

  if (intent.intent === "spouse_type") {
    return `배우자운을 볼 때는 화려한 사람보다 생활이 안정된 사람을 보셔야 합니다.

${data.name}님에게 맞는 상대는 감정 표현만 강한 사람이 아니라, 약속을 지키고 돈 문제를 숨기지 않고 갈등이 생겼을 때 대화가 되는 사람입니다.`;
  }

  if (intent.intent === "children_after_remarriage") {
    return `재혼 후 자녀 문제는 가장 먼저 봐야 할 현실 변수입니다.

이 문제는 감정으로 덮으면 나중에 커질 수 있습니다. 상대가 자녀의 존재를 존중하는지, 생활비와 양육 책임을 어떻게 볼 것인지, 가족 사이 경계를 어디까지 둘 것인지 초기에 확인해야 합니다.`;
  }

  if (intent.intent === "money_after_remarriage") {
    return `재혼에서 재산과 돈 문제는 피하면 안 됩니다.

좋아서 만나는 것과 생활을 합치는 것은 다릅니다. 재산, 부채, 생활비, 자녀 관련 지출은 처음부터 선을 정해야 합니다. 이 이야기를 불편해하는 사람이라면 신중하게 봐야 합니다.`;
  }

  if (intent.intent === "business_start") {
    return `사업 시작 질문이라면, 지금 중요한 것은 가능성보다 시작 방식입니다.

처음부터 크게 시작하지 말고 3개월 테스트로 가야 합니다. 작은 상품, 작은 고객, 작은 매출을 먼저 만들고 그 결과가 반복되는지 확인하세요. 고정비가 먼저 커지면 운이 좋아도 버티기 어렵습니다.`;
  }

  if (intent.intent === "business_partner") {
    return `동업 질문이라면 매우 신중해야 합니다.

동업은 사람 좋다고 하는 것이 아니라 역할, 돈, 책임, 퇴장 조건이 문서로 정리될 때 가능한 일입니다. 특히 매출이 나기 전보다 돈이 들어오기 시작한 뒤 갈등이 커질 수 있습니다.`;
  }

  if (intent.intent === "business_expansion") {
    return `확장 질문이라면 지금은 속도보다 관리력이 핵심입니다.

매출이 조금 늘었다고 바로 임대료, 인건비, 광고비를 키우면 부담이 커질 수 있습니다. 먼저 반복 매출이 있는지, 고객이 다시 오는지, 내가 없어도 돌아가는 구조인지 확인해야 합니다.`;
  }

  if (intent.intent === "real_estate_money") {
    return `부동산 질문이라면 실거주인지 투자용인지 먼저 나눠야 합니다.

실거주라면 월 상환 부담과 생활 안정성이 기준이고, 투자라면 공실, 대출금리, 환금성, 보유기간이 기준입니다. 지금은 분위기보다 숫자로 판단해야 합니다.`;
  }

  if (intent.intent === "investment") {
    return `투자 질문이라면 지금은 수익률보다 손실 한도를 먼저 정해야 합니다.

${data.name}님은 기회가 보이면 움직일 수 있지만, 기준 없이 들어가면 마음이 흔들릴 수 있습니다. 투자금과 생활비를 분리하고, 잃어도 생활이 무너지지 않는 범위에서만 해야 합니다.`;
  }

  if (intent.intent === "job_change") {
    return `이직 질문이라면 가능성은 있지만, 이동 이유를 분명히 해야 합니다.

단순히 힘들어서 옮기면 비슷한 문제가 반복될 수 있습니다. 다음 직장에서 역할, 권한, 성장성, 인정 구조가 나아지는지 확인해야 합니다.`;
  }

  if (intent.intent === "resignation") {
    return `퇴사 질문이라면 감정적으로 바로 움직이면 안 됩니다.

최소 3개월에서 6개월 생활비, 다음 수입 계획, 현재 직장에서 정리할 결과물이 있어야 합니다. 준비된 퇴사는 전환이지만, 준비 없는 퇴사는 부담이 됩니다.`;
  }

  if (intent.intent === "relationship_warning") {
    return `사람을 조심해야 하는 질문이라면, 말이 아니라 반복 행동을 보셔야 합니다.

필요할 때만 연락하는 사람, 돈 이야기를 자주 꺼내는 사람, 약속을 가볍게 여기는 사람, 감정적으로 몰아붙이는 사람은 거리를 두는 것이 좋습니다.`;
  }

  if (intent.intent === "trusted_people") {
    return `믿을 사람은 말이 큰 사람이 아니라 행동이 일정한 사람입니다.

약속을 지키는지, 불리할 때도 태도가 변하지 않는지, 돈 문제에서 선을 지키는지를 보면 됩니다. ${data.name}님은 가까운 사람을 빨리 믿기보다 시간을 두고 보는 편이 안전합니다.`;
  }

  if (intent.intent === "health_checkup") {
    return `검진 질문이라면 미루지 않는 것이 좋습니다.

사주 상담에서 건강은 병명을 맞히는 것이 아니라 약해지기 쉬운 흐름을 미리 관리하는 것입니다. 반복되는 증상, 수면 문제, 피로감이 있다면 검진으로 확인하는 것이 가장 현실적입니다.`;
  }

  if (intent.wantsTiming) {
    return `시기를 묻는 질문이므로, 지금은 바로 결론을 내기보다 1개월은 관찰하고 3개월 안에 다시 판단하는 흐름이 좋습니다. 운은 방향을 주지만, 결과는 준비 상태에 따라 달라집니다.`;
  }

  if (intent.wantsWarning) {
    return `조심할 점을 묻는 질문이므로, 지금은 좋은 가능성보다 위험요인을 먼저 보는 것이 맞습니다. 특히 사람, 돈, 건강, 시간 중 어디에서 부담이 생기는지 확인해야 합니다.`;
  }

  return `이 질문은 가능성만 볼 것이 아니라 조건을 같이 봐야 합니다. 지금 할 수 있는 작은 행동, 감당 가능한 부담, 3개월 뒤 확인할 결과를 기준으로 판단하는 것이 좋습니다.`;
}

export function getAiConsulting(data: BasicSajuResult, concern?: string): string {
  const rawTopic = getMainConcern(concern);
  const topic = getLatestQuestion(rawTopic);
  const continued = hasPreviousContext(rawTopic);
  const intent = analyzeQuestionIntent(topic);

  const caseDecision = buildConsultingDecision(data, topic);
  const masterDecision = buildMasterDecision(data);

  const opening = getOpening(topic, continued);
  const naturalAnswer = getNaturalAnswer(topic, data);
  const practicalAdvice = getPracticalAdvice(topic);
  const intentAdvice = getIntentFocusedAdvice(intent, data);

  return `
  ${opening}
  
  ${naturalAnswer}
  
  ${data.name}님의 사주 흐름에서 지금 이 질문은 ${intent.topic} 영역의 ${intent.intent} 상담으로 볼 수 있습니다. 올해의 핵심 키워드는 "${masterDecision.yearlyKeyword}"이며, 판단 기준은 ${masterDecision.priorityArea} 쪽에 두는 것이 좋습니다.
  
  제가 보는 핵심은 하나입니다.
  
  ${caseDecision.verdict}
  
  다만 중요한 것은 속도입니다. ${data.name}님은 ${masterDecision.decisionStyle} 방식으로 결정할 때 안정적이고, 한 번에 크게 움직이면 부담이 커질 수 있습니다.
  
  ${intentAdvice}
  
  현실적으로는 이렇게 보시면 됩니다.
  
  ${practicalAdvice}
  
  제 결론은 이렇습니다.
  
  지금은 가능성만 보고 움직일 때가 아니라, 조건을 먼저 확인해야 합니다. 특히 사람, 돈, 건강, 시간 중 어디에서 부담이 생기는지 따로 계산한 뒤 움직이는 것이 ${data.name}님에게 더 안전합니다.
  
  다음 상담에서는 이렇게 이어서 물어보셔도 좋습니다.
  
  제가 지금 가장 먼저 확인해야 할 것은 무엇인가요?
  이 사람은 믿어도 되는 사람인가요?
  돈 문제는 어떻게 봐야 하나요?
  언제쯤 다시 판단하는 게 좋을까요?
  `.trim();
}