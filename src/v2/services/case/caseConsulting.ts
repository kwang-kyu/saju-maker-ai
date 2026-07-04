import type { BasicSajuResult } from "../../types/basic";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";
import type { CaseQuestionKey } from "./caseQuestions";

function getAge(data: BasicSajuResult) {
  const birthDate = String((data as unknown as { birthDate?: string }).birthDate || "");
  const birthYear = Number(birthDate.slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getLifeStage(age: number) {
  if (!age) return "현재 상황 점검기";
  if (age <= 29) return "기반 구축기";
  if (age <= 39) return "도약기";
  if (age <= 49) return "확장기";
  if (age <= 59) return "전환기";
  return "안정 정리기";
}

function getLifeStageAdvice(age: number) {
  const stage = getLifeStage(age);

  if (stage === "기반 구축기") {
    return "지금은 큰 결론보다 경험, 공부, 직업 기반, 좋은 습관을 만드는 것이 중요한 시기입니다.";
  }

  if (stage === "도약기") {
    return "지금은 결혼, 자산, 직업 방향처럼 인생의 큰 기준을 현실적으로 정해야 하는 시기입니다.";
  }

  if (stage === "확장기") {
    return "지금은 자산 정리, 책임 증가, 가족과 일의 균형을 함께 봐야 하는 시기입니다.";
  }

  if (stage === "전환기") {
    return "지금은 무리한 확장보다 정리, 안정, 다음 방향을 함께 준비해야 하는 시기입니다.";
  }

  if (stage === "안정 정리기") {
    return "지금은 자산 보존, 건강, 가족관계, 이후 안정성을 중심으로 판단해야 하는 시기입니다.";
  }

  return "지금은 사주 구조와 현재 선택의 감당 가능성을 함께 봐야 하는 시기입니다.";
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function toQuestionKey(value: string) {
  return value as CaseQuestionKey;
}

function resolveQuestionKey(question: string): CaseQuestionKey {
  const q = question.toLowerCase();

  if (includesAny(q, ["재혼", "다시 결혼"])) return toQuestionKey("remarriage");
  if (includesAny(q, ["연애", "새 인연", "새로운 인연", "남자", "여자", "만남"])) return toQuestionKey("newRelationship");
  if (includesAny(q, ["결혼", "혼인", "배우자"])) return toQuestionKey("marriageTiming");
  if (includesAny(q, ["자녀", "아이", "아들", "딸"])) return toQuestionKey("children");
  if (includesAny(q, ["가족", "부모", "갈등"])) return toQuestionKey("familyConflict");

  if (includesAny(q, ["이직", "퇴사", "직장", "회사"])) return toQuestionKey("jobChange");
  if (includesAny(q, ["승진", "인정"])) return toQuestionKey("promotion");
  if (includesAny(q, ["시험", "자격증", "합격"])) return toQuestionKey("exam");
  if (includesAny(q, ["진로", "직업", "일"])) return toQuestionKey("careerDirection");

  if (includesAny(q, ["동업", "파트너", "같이 사업"])) return toQuestionKey("partnership");
  if (includesAny(q, ["창업", "사업 시작", "개업"])) return toQuestionKey("businessStart");
  if (includesAny(q, ["확장", "늘려", "키워"])) return toQuestionKey("businessExpand");
  if (includesAny(q, ["계약", "거래"])) return toQuestionKey("contract");

  if (includesAny(q, ["주식", "코인"])) return toQuestionKey("stockInvestment");
  if (includesAny(q, ["투자", "재테크"])) return toQuestionKey("investment");
  if (includesAny(q, ["돈", "금전", "재물", "수입"])) return toQuestionKey("moneyTiming");

  if (includesAny(q, ["부동산 매수", "집 살", "매입", "구입"])) return toQuestionKey("realEstateBuy");
  if (includesAny(q, ["부동산 매도", "집 팔", "매각"])) return toQuestionKey("realEstateSell");
  if (includesAny(q, ["이사", "이전", "이동"])) return toQuestionKey("houseMove");

  if (includesAny(q, ["건강", "질병", "몸", "병원"])) return toQuestionKey("healthCare");

  return toQuestionKey("importantChoice");
}

function buildBaseReading(data: BasicSajuResult) {
  const identity = buildSajuIdentityProfile(data);
  const name = data.name || "의뢰인";
  const age = getAge(data);
  const ageLine = age
    ? `${name}님은 현재 ${age}세, ${getLifeStage(age)} 흐름에 있습니다. ${getLifeStageAdvice(age)}`
    : `${name}님은 현재 선택의 감당 가능성과 사주 구조의 방향을 함께 봐야 합니다.`;

  return {
    name,
    ageLine,
    identity,
    sajuLine: `${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi}의 흐름을 보면, 감정만으로 결정하기보다 현실의 구조를 세워야 운이 안정됩니다.`,
  };
}

function buildOpening(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const { name, ageLine, identity, sajuLine } = buildBaseReading(data);
  const key = String(questionKey);

  if (["marriagePrepare", "newRelationship", "marriageTiming", "remarriage"].includes(key)) {
    return `한마디로 말하면, ${name}님의 인연 문제는 감정보다 생활 리듬과 책임감의 궁합을 먼저 봐야 합니다.

${sajuLine}

${ageLine}

${identity.relationshipStyle}`;
  }

  if (key === "healthCare") {
    return `한마디로 말하면, ${name}님의 건강 문제는 큰 병을 단정하기보다 생활 리듬을 먼저 바로잡는 쪽으로 봐야 합니다.

${sajuLine}

${ageLine}

${identity.riskPoint}`;
  }

  return `한마디로 말하면, ${name}님의 이번 선택은 가능성보다 감당 가능성을 먼저 봐야 합니다.

${sajuLine}

${ageLine}

${identity.decisionStyle}`;
}

function buildMoneyAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const { name, identity } = buildBaseReading(data);
  const key = String(questionKey);

  let title = "재물 상담";
  let reality = "지금은 큰돈을 한 번에 벌려는 흐름보다 돈이 들어오고 나가는 구조를 안정시키는 것이 중요합니다.";
  let caution = "주변 말만 듣고 급하게 움직이면 수익보다 손실 관리가 먼저 무너질 수 있습니다.";
  let strategy = `1. 고정비와 변동비를 먼저 분리하세요.
2. 최소 6개월 생활비를 안전자금으로 남기세요.
3. 투자는 작게 검증한 뒤 키우세요.
4. 단기 수익보다 반복 수입 구조를 우선하세요.`;

  if (key === "stockInvestment") {
    title = "주식투자 상담";
    reality = "주식은 가능하지만 단타보다 장기적으로 버틸 수 있는 구조가 맞습니다. ETF, 우량주, 배당형 자산처럼 흔들림이 적은 축을 먼저 세우는 편이 좋습니다.";
    caution = "급등주, 테마주, 빚을 낸 투자는 사주 흐름상 감정 기복을 키울 수 있습니다.";
  }

  if (key === "moneyTiming") {
    title = "금전 흐름 상담";
    reality = "금전운은 들어오는 돈보다 새어나가는 돈을 잡을 때 좋아집니다. 지금은 돈이 풀리는 시기를 기다리기보다 지출 구조를 정리해야 합니다.";
    caution = "돈이 들어오기 전에 소비나 대출 계획을 먼저 키우면 운의 흐름을 스스로 막을 수 있습니다.";
  }

  return `[${title}]

${identity.moneyStyle}

[현실 판단]
${reality}

[주의할 점]
${caution}

[실천 전략]
${strategy}

[최종 총평]
${name}님에게 지금 필요한 것은 큰 수익을 노리는 판단보다 오래 버틸 수 있는 재물 구조입니다.

${identity.successPoint}`;
}

function buildJobAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const { name, identity } = buildBaseReading(data);
  const key = String(questionKey);

  let reality = "직업은 이름보다 구조가 중요합니다. 어떤 일을 하느냐보다 어떤 환경에서 능력이 살아나는지를 봐야 합니다.";
  let caution = "당장의 불만만 보고 움직이면 비슷한 문제가 반복될 수 있습니다.";
  let strategy = `1. 현재 일에서 무엇이 힘든지 먼저 분리하세요.
2. 연봉보다 역할, 권한, 성장 가능성을 함께 보세요.
3. 최소 두 가지 선택지를 비교한 뒤 움직이세요.
4. 앞으로 3년 동안 쌓을 기술과 경력을 정하세요.`;

  if (key === "jobChange") {
    reality = "이직은 가능하지만 감정적으로 퇴사하는 흐름은 맞지 않습니다. 다음 자리를 먼저 확보하고 움직여야 안정됩니다.";
  }

  if (key === "promotion") {
    reality = "승진운은 조용히 기다리는 것보다 성과를 보이게 정리할 때 강해집니다. 숫자와 결과로 인정받는 구조를 만들어야 합니다.";
  }

  if (key === "exam") {
    reality = "시험운은 벼락치기보다 반복 루틴에 강합니다. 매일 같은 시간에 공부하는 구조가 결과를 만듭니다.";
  }

  return `[직업진로 상담]

${identity.workStyle}

[현실 판단]
${reality}

[주의할 점]
${caution}

[실천 전략]
${strategy}

[최종 총평]
${name}님은 지금 당장의 자리보다 앞으로 오래 쌓일 전문성과 책임 구조를 봐야 합니다.

${identity.successPoint}`;
}

function buildBusinessAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const { name, identity } = buildBaseReading(data);
  const key = String(questionKey);

  let reality = "사업은 업종보다 구조가 중요합니다. 작게 검증하고, 돈의 흐름과 고객 반응을 확인한 뒤 키우는 방식이 맞습니다.";
  let caution = "확신만 믿고 고정비를 크게 만들면 초반 부담이 커질 수 있습니다.";
  let strategy = `1. 처음에는 작게 시작해 시장 반응을 보세요.
2. 생활비와 사업자금을 반드시 분리하세요.
3. 3개월 안에 반복 고객 가능성을 확인하세요.
4. 계약과 비용 구조는 문서로 남기세요.`;

  if (key === "businessExpand") {
    reality = "확장은 가능하지만 매출 증가만 보고 움직이면 위험합니다. 순이익, 고정비, 인력 관리가 함께 버텨야 합니다.";
  }

  if (key === "partnership") {
    reality = "동업은 가능하지만 사람을 믿는 것과 사업 구조를 믿는 것은 다릅니다. 역할, 지분, 권한, 책임을 시작 전에 정해야 합니다.";
    caution = "친분만 믿고 구두 약속으로 시작하는 동업은 피해야 합니다.";
  }

  if (key === "contract") {
    reality = "계약은 진행할 수 있으나 좋은 말보다 문서 조건을 먼저 봐야 합니다. 위약, 책임 범위, 해지 조건을 확인해야 합니다.";
  }

  return `[사업동업 상담]

${identity.workStyle}

${identity.moneyStyle}

[현실 판단]
${reality}

[주의할 점]
${caution}

[실천 전략]
${strategy}

[최종 총평]
${name}님에게 사업은 한 번에 크게 벌리는 방식보다 구조를 세워 오래 가져가는 방식이 맞습니다.`;
}

function buildRealEstateAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const { name, identity } = buildBaseReading(data);
  const key = String(questionKey);

  let reality = "부동산은 가격보다 보유 가능성이 중요합니다. 대출, 현금흐름, 실거주 안정성을 함께 봐야 합니다.";
  let caution = "주변 말이나 조급함 때문에 움직이면 장기 부담이 커질 수 있습니다.";
  let strategy = `1. 대출 상환액이 소득을 압박하지 않는지 확인하세요.
2. 최소 2년 이상 보유 가능한 구조인지 보세요.
3. 실거주는 생활 동선과 가족 상황을 우선하세요.
4. 투자 목적이라면 환금성을 먼저 확인하세요.`;

  if (key === "realEstateSell") {
    reality = "매도는 가격만 볼 문제가 아닙니다. 매도 후 자금 사용처와 세금, 갈아타기 계획까지 함께 봐야 합니다.";
  }

  if (key === "houseMove") {
    reality = "이사는 가능하지만 집의 크기보다 생활 리듬, 출퇴근, 가족 적응, 비용 부담을 먼저 봐야 합니다.";
  }

  return `[부동산 상담]

${identity.lifeStyle}

${identity.moneyStyle}

[현실 판단]
${reality}

[주의할 점]
${caution}

[실천 전략]
${strategy}

[최종 총평]
${name}님에게 부동산은 조급한 매매보다 감당 가능한 보유 전략이 핵심입니다.`;
}

function buildRelationshipAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const { name, identity, ageLine } = buildBaseReading(data);
  const key = String(questionKey);

  let reality = "인연은 들어올 수 있습니다. 다만 빠르게 끌리는 감정보다 오래 맞출 수 있는 생활 태도를 봐야 합니다.";
  let caution = "외로움이나 조급함 때문에 상대의 현실 조건을 보지 못하면 관계가 흔들릴 수 있습니다.";
  let strategy = `1. 처음부터 깊게 몰입하지 말고 천천히 보세요.
2. 말보다 행동이 꾸준한 사람인지 확인하세요.
3. 돈, 시간, 약속을 대하는 태도를 보세요.
4. 나를 불안하게 만드는 관계는 속도를 늦추세요.`;

  if (key === "marriageTiming") {
    reality = "결혼은 가능하지만 시기보다 사람이 더 중요합니다. 생활 습관, 경제관, 가족관계를 함께 봐야 합니다.";
  }

  if (key === "remarriage") {
    reality = "재혼은 가능합니다. 다만 과거 관계에서 반복된 문제를 정리한 뒤 시작해야 안정됩니다.";
    caution = "외로움 때문에 급하게 결정하면 이전과 비슷한 문제가 반복될 수 있습니다.";
  }

  if (key === "children") {
    reality = "자녀 문제는 감정보다 생활 안정, 건강 리듬, 부부 협력이 함께 준비될 때 좋습니다.";
  }

  if (key === "familyConflict") {
    reality = "가족 갈등은 누가 맞는지보다 선을 정하고 대화 방식을 바꾸는 것이 먼저입니다.";
    caution = "계속 참고만 있거나 한 번에 끊어내는 극단은 피해야 합니다.";
  }

  return `${buildOpening(data, questionKey)}

${ageLine}

${identity.lifeStyle}

[현실 판단]
${reality}

[주의할 점]
${caution}

[실천 전략]
${strategy}

[최종 총평]
${name}님에게 인연운은 빠른 결론보다 안정적으로 오래 갈 수 있는 사람을 고르는 눈이 중요합니다.

${identity.relationshipStyle}`;
}

function buildHealthAdvice(data: BasicSajuResult) {
  const { name, identity, ageLine } = buildBaseReading(data);

  return `${buildOpening(data, toQuestionKey("healthCare"))}

${ageLine}

${identity.lifeStyle}

[현실 판단]
건강은 지금 당장 큰 문제를 단정하기보다 수면, 식사, 운동, 스트레스 리듬을 먼저 봐야 합니다. 사주 흐름상 무리하게 버티는 방식은 오래 가기 어렵습니다.

[주의할 점]
피곤해도 참고 넘기거나, 몸의 신호를 가볍게 보는 것은 좋지 않습니다. 특히 반복되는 통증이나 불편감은 전문가 상담을 받아야 합니다.

[실천 전략]
1. 수면 시간을 먼저 일정하게 만드세요.
2. 무리한 운동보다 매일 반복 가능한 운동을 하세요.
3. 스트레스가 쌓이는 사람과 환경을 조절하세요.
4. 증상이 반복되면 병원 검진을 미루지 마세요.

[최종 총평]
${name}님에게 건강운은 큰 변화보다 생활 리듬을 안정시키는 데서 좋아집니다.

${identity.riskPoint}`;
}

function buildImportantChoiceAdvice(data: BasicSajuResult, question: string) {
  const { name, identity, ageLine, sajuLine } = buildBaseReading(data);

  return `한마디로 말하면, ${name}님의 질문은 단순히 된다, 안 된다로 볼 문제가 아닙니다.

[질문]
${question}

[사주 기준]
${sajuLine}

${ageLine}

${identity.decisionStyle}

[현실 판단]
지금 선택은 가능성보다 감당 가능성이 중요합니다. 마음이 앞서면 속도는 빨라지지만, 결과를 오래 유지하기 어렵습니다.

[주의할 점]
주변 말, 순간 감정, 급한 돈 문제 때문에 결정하면 나중에 부담이 커질 수 있습니다.

[실천 전략]
1. 지금 선택의 목적을 한 문장으로 정리하세요.
2. 돈, 시간, 사람, 책임 부담을 따로 계산하세요.
3. 바로 크게 움직이지 말고 작게 검증하세요.
4. 3개월 뒤에도 같은 판단인지 다시 확인하세요.

[최종 총평]
${name}님은 빠른 결정보다 구조를 세운 뒤 움직일 때 운이 안정됩니다.

${identity.successPoint}`;
}

export function getCaseConsulting(
  data: BasicSajuResult,
  question: CaseQuestionKey | string
) {
  const questionText = String(question || "");
  const questionKey = resolveQuestionKey(questionText);
  const key = String(questionKey);

  if (["stockInvestment", "investment", "moneyTiming"].includes(key)) {
    return buildMoneyAdvice(data, questionKey);
  }

  if (["jobChange", "promotion", "exam", "careerDirection"].includes(key)) {
    return buildJobAdvice(data, questionKey);
  }

  if (["businessStart", "businessExpand", "partnership", "contract"].includes(key)) {
    return buildBusinessAdvice(data, questionKey);
  }

  if (["realEstateBuy", "realEstateSell", "houseMove"].includes(key)) {
    return buildRealEstateAdvice(data, questionKey);
  }

  if (
    [
      "marriagePrepare",
      "newRelationship",
      "marriageTiming",
      "remarriage",
      "children",
      "familyConflict",
      "relationshipCleanUp",
    ].includes(key)
  ) {
    return buildRelationshipAdvice(data, questionKey);
  }

  if (key === "healthCare") {
    return buildHealthAdvice(data);
  }

  return buildImportantChoiceAdvice(data, questionText);
}
