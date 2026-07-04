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
  if (!age) return "현재상황점검기";
  if (age <= 29) return "기반구축기";
  if (age <= 39) return "도약기";
  if (age <= 49) return "확장기";
  if (age <= 59) return "전환기";
  return "안정정리기";
}

function getLifeStageAdvice(age: number) {
  const stage = getLifeStage(age);

  if (stage === "기반구축기") {
    return "지금은 큰 결론보다 경험, 공부, 직업 기반, 종잣돈을 만드는 것이 중요한 시기입니다.";
  }

  if (stage === "도약기") {
    return "지금은 결혼, 자산, 직업 방향처럼 인생의 큰 기준을 현실적으로 정해야 하는 시기입니다.";
  }

  if (stage === "확장기") {
    return "지금은 자산 확대, 책임 증가, 가족과 일의 균형을 함께 봐야 하는 시기입니다.";
  }

  if (stage === "전환기") {
    return "지금은 무리한 확장보다 정리, 안정, 제2의 방향을 함께 준비해야 하는 시기입니다.";
  }

  if (stage === "안정정리기") {
    return "지금은 자산 보존, 건강, 가족관계, 노후 안정성을 중심으로 판단해야 하는 시기입니다.";
  }

  return "지금은 사주 구조와 현재 선택의 감당 가능성을 함께 봐야 하는 시기입니다.";
}

function resolveQuestionKey(question: string): CaseQuestionKey {
  const q = question.toLowerCase();

  if (q.includes("재혼")) return "remarriage";
  if (q.includes("인연") || q.includes("새로운")) return "newRelationship";
  if (q.includes("결혼")) return "marriageTiming";
  if (q.includes("자녀") || q.includes("아이")) return "children";

  if (q.includes("이직") || q.includes("퇴사") || q.includes("직장")) return "jobChange";
  if (q.includes("동업")) return "partnership";
  if (q.includes("확장") || q.includes("확대")) return "businessExpand";
  if (q.includes("사업") || q.includes("창업")) return "businessStart";

  if (q.includes("주식")) return "stockInvestment";
  if (q.includes("투자")) return "investment";
  if (q.includes("돈") || q.includes("금전") || q.includes("재물")) return "moneyTiming";

  if (q.includes("부동산") || q.includes("매수") || q.includes("구입")) return "realEstateBuy";
  if (q.includes("매도") || q.includes("팔")) return "realEstateSell";
  if (q.includes("이사") || q.includes("이전")) return "houseMove";

  if (q.includes("건강") || q.includes("질병") || q.includes("몸")) return "healthCare";

  return "importantChoice";
}
function buildOpening(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);
  const age = getAge(data);
  const ageLine = age
    ? `${name}님은 현재 ${age}세 흐름에서 이 질문을 보셔야 합니다. ${getLifeStageAdvice(age)}`
    : `${name}님은 나이보다 사주 구조와 현재 선택의 감당 가능성을 먼저 보는 것이 좋습니다.`;

  if (
    [
      "marriagePrepare",
      "newRelationship",
      "marriageTiming",
      "remarriage",
    ].includes(questionKey)
  ) {
    return `결론부터 보면, 이 관계 문제는 감정만으로 결정하면 안 됩니다.

${name}님 사주는 사람을 만나는 운보다 그 관계를 오래 유지할 수 있는 조건이 더 중요합니다.

${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 보면, 생활 리듬, 책임감, 경제 기준, 대화 방식이 맞을 때 관계가 안정됩니다.

${ageLine}

${identity.relationshipStyle}`;
  }

  if (questionKey === "healthCare") {
    return `건강은 지금부터 생활 리듬을 바로잡는 쪽으로 보셔야 합니다.

${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 보면, ${name}님은 무리하게 버티는 방식보다 수면, 식사, 회복 시간을 일정하게 잡을 때 전체 운도 안정됩니다.

${ageLine}

${identity.riskPoint}`;
  }

  return `결론부터 말씀드리면, 이 사안은 가능성보다 감당 가능성을 먼저 봐야 합니다.

${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 보면, ${name}님은 감정적으로 밀어붙일 때보다 기준을 세우고 움직일 때 결과가 안정됩니다.

${ageLine}

${identity.decisionStyle}`;
}
function buildWealthAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);

  let reality = "";
  let caution = "";
  let strategy = "";
  const opening = `재테크는 돈을 많이 버는 기술보다
  돈을 지키고 키우는 구조를 만드는 상담입니다.
  
  ${name}님의 사주는 한 번에 크게 승부를 보기보다,
  현금흐름과 손실 기준을 먼저 세울 때 재물운이 안정됩니다.
  
  이번 상담에서는 투자상품보다
  돈이 새지 않고 쌓이는 구조를 중심으로 말씀드리겠습니다.`;
  switch (questionKey) {
    case "stockInvestment":
      reality = "주식 투자는 가능하지만 단기 수익보다 오래 버틸 수 있는 구조가 먼저입니다. 사주상 감정에 따라 매수매도를 반복하기보다 ETF, 우량주, 배당주처럼 기준을 세워 관리하는 방식이 더 안정적입니다.";
      caution = "급등주, 테마주, 레버리지, 몰빵 투자는 손실이 커질 수 있으니 조심해야 합니다.";
      strategy = `1. 전체 자산 중 주식 비중을 먼저 정하세요.
2. ETF와 우량주를 기본 축으로 두세요.
3. 손실 한도와 보유 기간을 미리 정하세요.
4. 단기 매매보다 월별 적립식 투자가 좋습니다.`;
      break;

    case "moneyTiming":
      reality = "금전 흐름은 수입보다 지출 구조가 안정될 때부터 좋아집니다. 지금은 큰 기회를 기다리기보다 고정비, 현금 흐름, 저축 비율을 먼저 정리하는 것이 현실적입니다.";
      caution = "돈이 들어오기도 전에 지출 계획부터 늘리거나, 불안해서 무리한 투자를 시작하는 흐름은 피해야 합니다.";
      strategy = `1. 월 고정비와 변동비를 나누어 정리하세요.
2. 최소 6개월 생활비를 현금으로 확보하세요.
3. 수입이 늘어도 지출을 바로 늘리지 마세요.
4. 부업이나 반복 수입 구조를 함께 만들어보세요.`;
      break;

    case "investment":
    default:
      reality = "투자는 시작할 수 있습니다. 다만 지금은 투자금의 크기보다 원칙을 세우고 본인에게 맞는 자산군을 찾는 과정이 중요합니다. 예금, 연금, ETF, 부동산처럼 안정성과 지속성이 있는 구조가 먼저입니다.";
      caution = "남들이 좋다고 하는 투자나 단기간에 큰 수익을 기대하는 선택은 흔들림을 만들 수 있습니다.";
      strategy = `1. 투자 전 생활비와 비상금을 먼저 확보하세요.
2. 처음에는 소액으로 경험을 쌓으세요.
3. 예금, 연금, ETF처럼 안정적인 축을 먼저 만드세요.
4. 고위험 투자는 전체 자산의 일부로만 제한하세요.`;
      break;
  }

  
  return `${opening}

[사주 근거 분석]
${identity.moneyStyle}

강하게 살아나는 ${data.strongestElement} 기운은 돈을 벌고 기회를 잡는 방식에 장점으로 나타납니다. 반대로 부족한 ${data.weakestElement} 기운은 투자 판단이 흔들리거나 손실 관리가 약해질 수 있는 지점입니다.

[현실 판단]
${reality}

[지금 가장 조심할 점]
${caution}

[실천 전략]
${strategy}

[AI 원장 최종 판단]
${name}님에게 지금 필요한 것은 큰 수익보다 오래 살아남는 재테크 구조입니다.

${identity.successPoint}`;
}

function buildJobAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);

  let reality = "";
  let caution = "";
  let strategy = "";
  const opening = `직업은 단순히 회사를 선택하는 문제가 아닙니다.

${name}님의 사주를 보면 어떤 환경에서 능력이 살아나는지가 훨씬 중요합니다.

이번 상담에서는 지금 당장 취업이나 이직을 해야 하는지를 판단하는 것이 아니라,
앞으로 오래 성장할 수 있는 직업 구조를 중심으로 말씀드리겠습니다.`;
  switch (questionKey) {
    case "jobChange":
      reality = "이직운은 열려 있습니다. 다만 지금 흐름은 단순히 회사를 벗어나는 이직보다, 역할과 성장 구조가 더 맞는 자리로 옮길 때 좋아집니다. 연봉만 보고 움직이기보다 조직 분위기, 상사 스타일, 업무 권한, 장기 성장성을 함께 봐야 합니다.";
      caution = "감정적으로 퇴사하거나, 현재 불만을 피하기 위해 급하게 옮기면 비슷한 문제가 반복될 수 있습니다.";
      strategy = `1. 퇴사 전 다음 선택지를 먼저 확보하세요.
2. 연봉보다 역할, 성장성, 조직문화를 비교하세요.
3. 최소 2곳 이상을 비교한 뒤 결정하세요.
4. 면접에서는 실제 업무 범위와 의사결정 권한을 꼭 확인하세요.`;
      break;

    case "promotion":
      reality = "승진과 인정운은 있습니다. 다만 단순히 오래 버틴다고 올라가는 흐름보다, 맡은 역할의 성과가 분명해지고 주변 신뢰가 쌓일 때 강하게 살아납니다. 지금은 조용히 일만 하기보다 성과를 보이게 정리하는 것이 중요합니다.";
      caution = "상사와 감정적으로 부딪히거나 조직 내 정치 싸움에 깊게 들어가는 것은 피해야 합니다.";
      strategy = `1. 최근 성과를 숫자와 결과 중심으로 정리하세요.
2. 상사에게 진행 상황을 자주 공유하세요.
3. 책임 있는 일을 피하지 말고 작은 리더 역할을 맡아보세요.
4. 동료와의 협업 태도가 승진운을 함께 올립니다.`;
      break;

    case "exam":
      reality = "시험이나 자격증운은 활용할 수 있습니다. 다만 벼락치기보다 반복 루틴을 만들 때 결과가 좋아지는 사주입니다. 단기간 몰아붙이는 방식보다 매일 같은 시간에 쌓아가는 공부가 훨씬 유리합니다.";
      caution = "기분에 따라 공부량이 흔들리거나, 시험 직전에만 몰아서 준비하는 방식은 맞지 않습니다.";
      strategy = `1. 매일 같은 시간에 공부하는 루틴을 만드세요.
2. 3개월 단위로 진도와 복습 계획을 나누세요.
3. 기출문제와 모의시험을 반복하세요.
4. 암기보다 틀린 문제를 다시 보는 방식이 중요합니다.`;
      break;

    case "careerDirection":
    default:
      reality = "앞으로의 일은 직업 이름보다 어떤 환경에서 능력이 살아나는지를 기준으로 봐야 합니다. 사주상 스스로 판단하고 책임질 수 있는 구조, 기준이 분명한 일, 경험이 쌓일수록 전문성이 커지는 일이 잘 맞습니다.";
      caution = "남들이 좋다고 하는 직업만 따라가거나, 당장의 안정감만 보고 선택하면 장점이 충분히 살아나지 않을 수 있습니다.";
      strategy = `1. 반복 업무보다 판단과 책임이 있는 일을 고르세요.
2. 전문성이 쌓이는 분야를 우선으로 보세요.
3. 혼자 잘하는 일과 사람을 상대하는 일의 비중을 비교하세요.
4. 앞으로 3년 동안 쌓을 기술과 경력을 먼저 정하세요.`;
      break;
  }

  return `${opening}

${identity.workStyle}

${reality}

${caution}

${strategy}

${identity.successPoint}`;
}
function buildBusinessAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);

  let reality = "";
  let caution = "";
  let strategy = "";
  const opening = `사업은 업종보다 구조가 중요합니다.

  ${name}님의 사주는 무조건 사업을 하라는 사주가 아니라,
  어떤 방식으로 시작해야 오래 살아남는지를 먼저 보는 구조입니다.
  
  이번 상담에서는 창업 여부보다
  지속 가능한 사업 구조를 중심으로 말씀드리겠습니다.`;
  switch (questionKey) {
    case "businessStart":
      reality = "사업 시작은 가능하지만 초반에는 시장 반응을 확인하면서 규모를 조절하는 방식이 맞습니다. 사주상 추진력은 살릴 수 있지만, 수익 구조와 고객 반응이 확인되기 전까지는 고정비를 낮게 유지하는 것이 좋습니다.";
      caution = "확신만 믿고 대출, 임대료, 인건비를 먼저 크게 만드는 것은 위험합니다.";
      strategy = `1. 처음에는 작게 시작해 시장 반응을 확인하세요.
2. 월 고정비와 손익분기점을 먼저 계산하세요.
3. 3개월 안에 첫 고객과 반복 구매 가능성을 확인하세요.
4. 사업자금과 생활비는 반드시 분리하세요.`;
      break;

    case "businessExpand":
      reality = "사업 확장은 검토할 수 있습니다. 다만 매출이 늘었다는 이유만으로 확장하기보다 순이익, 반복 고객, 직원 관리, 고정비 부담을 함께 봐야 합니다. 지금 흐름에서는 외형보다 버틸 수 있는 구조가 중요합니다.";
      caution = "매출 증가만 보고 지점, 인력, 설비를 늘리면 현금 흐름이 압박될 수 있습니다.";
      strategy = `1. 최근 6개월 순이익을 먼저 확인하세요.
2. 반복 고객과 재구매율을 점검하세요.
3. 확장 후 고정비가 얼마나 늘어나는지 계산하세요.
4. 매출과 고객 반응이 확인된 뒤 단계적으로 확장하세요.`;
      break;

    case "partnership":
      reality = "동업은 가능하지만 사람을 믿는 것과 사업 구조를 믿는 것은 다르게 봐야 합니다. 사주상 관계에서 정이나 신뢰가 먼저 앞서면 책임과 권한이 흐려질 수 있으므로 역할, 지분, 의사결정권을 분명히 해야 합니다.";
      caution = "친분만 믿고 시작하는 동업, 구두 약속, 애매한 지분 구조는 반드시 피해야 합니다.";
      strategy = `1. 역할과 책임을 문서로 정리하세요.
2. 지분, 급여, 비용 부담 기준을 명확히 하세요.
3. 의사결정권과 해지 조건을 미리 정하세요.
4. 돈 문제는 시작 전에 불편해도 분명히 말하세요.`;
      break;

    case "contract":
    default:
      reality = "계약은 진행할 수 있지만 좋은 말보다 문서 조건을 먼저 봐야 합니다. 사주상 지금은 상대의 말만 믿기보다 계약금, 위약 조건, 책임 범위, 특약을 꼼꼼히 확인할수록 운이 안정됩니다.";
      caution = "급하게 도장을 찍거나, 상대가 괜찮다고 해서 특약 없이 진행하는 것은 조심해야 합니다.";
      strategy = `1. 계약금, 잔금, 해지 조건을 확인하세요.
2. 구두 약속은 반드시 특약으로 넣으세요.
3. 책임 범위와 손해배상 조건을 확인하세요.
4. 큰 계약은 전문가 검토 후 진행하세요.`;
      break;
  }

  return `${opening}

${identity.workStyle}

${identity.moneyStyle}

${reality}

${caution}

${strategy}`;
}
function buildRealEstateAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);

  let reality = "";
  let caution = "";
  let strategy = "";
  const opening = `부동산은 가격보다 타이밍과 보유 전략이 더 중요합니다.

  ${name}님의 사주는 무조건 사거나 파는 것이 중요한 것이 아니라,
  언제 움직이고 얼마나 오래 보유해야 하는지가 더 중요한 구조입니다.
  
  이번 상담에서는 시세 예측보다
  매수·매도 시기와 보유 전략을 중심으로 말씀드리겠습니다.`;  

  switch (questionKey) {
    case "realEstateBuy":
      reality = "부동산 매수는 검토할 수 있습니다. 다만 지금은 가격 상승 기대보다 대출 부담, 보유 기간, 실거주 안정성, 환금성을 먼저 봐야 합니다. 사주상 큰돈이 묶이는 선택은 감정이 아니라 버틸 수 있는 구조가 핵심입니다.";
      caution = "주변 말만 듣고 급하게 매수하거나, 월 상환액을 낙관적으로 계산하는 것은 위험합니다.";
      strategy = `1. 월 대출 상환액이 소득을 압박하지 않는지 확인하세요.
2. 최소 2년 이상 보유할 수 있는 자금 구조를 보세요.
3. 실거주는 생활 편의와 직장 동선을 우선하세요.
4. 투자는 임대 수요와 환금성을 먼저 확인하세요.`;
      break;

    case "realEstateSell":
      reality = "부동산 매도는 단순히 가격이 올랐는지만 볼 문제가 아닙니다. 보유 부담, 현금화 필요성, 갈아타기 계획, 세금, 다음 투자처까지 함께 봐야 합니다. 지금 매도는 목적이 분명할 때 안정적입니다.";
      caution = "불안해서 급매로 던지거나, 다음 계획 없이 현금화만 하는 것은 좋지 않습니다.";
      strategy = `1. 매도 이유가 현금화인지 갈아타기인지 먼저 정하세요.
2. 세금과 중개비를 뺀 실제 손익을 계산하세요.
3. 급매보다 적정 매도 기간을 확보하세요.
4. 매도 후 자금 운용 계획을 미리 세우세요.`;
      break;

    case "houseMove":
    default:
      reality = "이사는 가능합니다. 다만 단순히 방향이나 집의 크기보다 생활 리듬, 출퇴근, 가족 상황, 비용 부담, 새로운 환경 적응력을 함께 봐야 합니다. 사주상 환경 변화는 좋게 쓰면 운을 바꾸지만, 준비 없이 움직이면 피로가 커질 수 있습니다.";
      caution = "집만 보고 생활 동선, 관리비, 가족 적응 문제를 가볍게 보는 것은 피해야 합니다.";
      strategy = `1. 출퇴근 시간과 생활 동선을 먼저 확인하세요.
2. 가족 구성원의 생활 변화까지 함께 보세요.
3. 이사 비용과 보증금 변동을 계산하세요.
4. 새 환경에서 최소 1년 이상 안정적으로 살 수 있는지 판단하세요.`;
      break;
  }

  return `${opening}

${identity.lifeStyle}

${identity.moneyStyle}

${reality}

${caution}

${strategy}`;
}
function buildRelationshipAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const identity = buildSajuIdentityProfile(data);
  const age = getAge(data);
  const stage = getLifeStage(age);

  let reality = "";
  let caution = "";
  let strategy = "";

  switch (questionKey) {
    case "marriagePrepare":
      reality =
        stage === "기반구축기"
          ? "결혼 준비는 가능하지만 지금은 결혼 자체보다 직업 기반, 경제 기준, 생활 습관을 먼저 세워야 합니다. 급하게 결혼을 결정하기보다 좋은 배우자를 알아보는 눈을 키우는 시기입니다."
          : stage === "도약기"
          ? "결혼을 현실적으로 준비하기 좋은 시기입니다. 다만 감정보다 경제관, 생활 패턴, 가족관계, 책임감을 함께 확인해야 안정적인 결혼으로 이어집니다."
          : stage === "확장기"
          ? "결혼은 감정보다 생활 안정과 가족 구조가 더 중요합니다. 서로의 과거, 경제 상황, 자녀 계획, 가족관계까지 차분히 확인해야 합니다."
          : "결혼은 새로운 출발보다 서로의 생활 안정, 건강, 가족과의 거리감, 노후 방향이 맞는지를 보는 것이 중요합니다.";
      caution = "좋은 감정만 보고 돈, 가족, 생활 기준을 뒤로 미루면 결혼 후 현실 문제가 커질 수 있습니다.";
      strategy = `1. 경제관과 소비 습관을 반드시 확인하세요.
2. 가족과의 거리, 역할 분담, 생활 리듬을 이야기하세요.
3. 결혼 준비는 감정보다 현실 조건을 먼저 정리하세요.
4. 불편한 문제를 결혼 후로 미루지 마세요.`;
      break;

    case "marriageTiming":
      reality =
        stage === "기반구축기"
          ? "결혼 시기는 너무 서두르기보다 나의 기반이 먼저 잡힌 뒤가 좋습니다. 지금은 인연을 넓히되 결혼 결정은 신중하게 보는 흐름입니다."
          : stage === "도약기"
          ? "결혼 시기를 현실적으로 잡아볼 수 있는 흐름입니다. 다만 상대가 있다는 이유만으로 서두르기보다 생활 준비와 경제 기준이 맞는지가 더 중요합니다."
          : stage === "확장기"
          ? "결혼 시기는 감정보다 안정성이 기준입니다. 초혼이든 늦은 결혼이든 서로의 생활 방식과 가족관계가 맞아야 오래 갑니다."
          : "결혼 시기보다 함께 살아도 편안한 사람인지, 건강과 노후 방향이 맞는지가 더 중요한 흐름입니다.";
      caution = "나이 때문에 조급하게 결정하거나, 주변 압박 때문에 결혼을 서두르는 것은 피해야 합니다.";
      strategy = `1. 결혼 가능성보다 결혼 후 생활 모습을 먼저 그려보세요.
2. 상대의 책임감과 경제 습관을 확인하세요.
3. 시기보다 사람의 안정성을 먼저 보세요.
4. 결혼 결정 전 가족 문제와 돈 문제를 반드시 대화하세요.`;
      break;

    case "remarriage":
      reality = "재혼은 가능합니다. 다만 재혼운은 새로운 인연보다 과거의 반복을 피하는 기준이 핵심입니다. 지금은 감정보다 생활 안정, 자녀 문제, 재산 문제, 가족과의 거리감까지 현실적으로 봐야 합니다.";
      caution = "외로움이나 급한 마음으로 관계를 시작하면 이전과 비슷한 문제가 반복될 수 있습니다.";
      strategy = `1. 과거 관계에서 반복된 문제를 먼저 정리하세요.
2. 자녀, 재산, 가족관계 문제를 숨기지 말고 확인하세요.
3. 동거, 재혼, 경제 통합은 단계적으로 진행하세요.
4. 감정보다 생활 안정성을 기준으로 보세요.`;
      break;

    case "newRelationship":
      reality = "새로운 인연은 들어올 수 있습니다. 다만 지금은 설렘보다 상대의 생활 태도, 책임감, 말과 행동의 일치 여부를 보는 것이 중요합니다. 좋은 인연은 빠르게 불타오르기보다 안정적으로 쌓이는 쪽이 좋습니다.";
      caution = "외로움 때문에 급하게 마음을 주거나, 상대의 현실 조건을 보지 않는 것은 조심해야 합니다.";
      strategy = `1. 처음부터 깊게 몰입하지 말고 천천히 보세요.
2. 말보다 행동이 꾸준한 사람인지 확인하세요.
3. 돈, 시간, 약속을 대하는 태도를 보세요.
4. 나를 불안하게 만드는 관계는 속도를 늦추세요.`;
      break;

    case "children":
      reality = "자녀운은 책임과 생활 안정이 함께 갖춰질 때 편안하게 흐릅니다. 자녀 문제는 단순한 운보다 부부의 협력, 경제 기반, 건강 리듬, 양육 환경을 함께 보는 것이 중요합니다.";
      caution = "자녀 문제를 감정이나 기대만으로 밀어붙이면 몸과 마음의 부담이 커질 수 있습니다.";
      strategy = `1. 부부의 양육 기준을 먼저 맞추세요.
2. 경제적 준비와 시간 계획을 함께 보세요.
3. 건강 리듬을 무리하지 않게 관리하세요.
4. 주변의 말보다 본인의 생활 여건을 기준으로 판단하세요.`;
      break;

    case "familyConflict":
      reality = "가족 갈등은 누가 맞는지보다 선을 정하고 대화 방식을 바꾸는 것이 먼저입니다. 사주상 정 때문에 참다가 한 번에 터지는 흐름을 조심해야 합니다.";
      caution = "계속 참고 맞추기만 하거나, 감정이 폭발한 상태에서 결론을 내리는 것은 좋지 않습니다.";
      strategy = `1. 가족과 돈 문제를 분리해서 보세요.
2. 반복되는 갈등은 거리 조절부터 시작하세요.
3. 말로 해결되지 않는 문제는 기준을 문서나 일정으로 정하세요.
4. 모든 가족을 만족시키려는 생각은 내려놓으세요.`;
      break;

    case "relationshipCleanUp":
    default:
      reality = "인간관계는 모두 끊는 것이 아니라 나를 계속 소모시키는 관계를 구분하는 것이 중요합니다. 지금은 관계를 정리하더라도 단절보다 거리 조절이 먼저입니다.";
      caution = "감정적으로 한 번에 끊거나, 반대로 계속 참고만 있는 극단은 피해야 합니다.";
      strategy = `1. 나를 편안하게 하는 관계와 소모시키는 관계를 나누세요.
2. 바로 끊기보다 연락 빈도와 만남 횟수를 줄이세요.
3. 돈, 부탁, 감정노동이 반복되는 관계는 선을 정하세요.
4. 관계 정리는 죄책감보다 회복을 기준으로 보세요.`;
      break;
  }

  return `${buildOpening(data, questionKey)}

${identity.lifeStyle}

${reality}

${caution}

${strategy}

${identity.relationshipStyle}`;
}
function buildHealthLifeAdvice(data: BasicSajuResult, questionKey: CaseQuestionKey) {
  const identity = buildSajuIdentityProfile(data);
  const age = getAge(data);
  const stage = getLifeStage(age);

  let reality = "";
  let caution = "";
  let strategy = "";

  switch (questionKey) {
    case "healthCare":
      reality =
        stage === "기반구축기"
          ? "건강은 큰 문제를 걱정하기보다 수면, 식사, 운동 루틴을 만드는 것이 먼저입니다. 지금 시기에는 생활 습관이 앞으로의 체력 기반을 결정합니다."
          : stage === "도약기"
          ? "건강은 일과 책임이 늘면서 무너지기 쉽습니다. 과로, 수면 부족, 스트레스성 피로를 관리해야 운도 안정됩니다."
          : stage === "확장기"
          ? "건강은 체력보다 누적 피로와 만성 관리가 중요합니다. 일, 가족, 자산 책임이 커질수록 몸의 신호를 가볍게 보면 안 됩니다."
          : stage === "전환기"
          ? "건강은 무리한 확장보다 회복과 예방이 우선입니다. 정기검진, 수면, 혈압혈당소화 리듬처럼 기본 관리가 중요합니다."
          : "건강은 노후 생활의 중심입니다. 큰 변화보다 꾸준한 관리, 검진, 무리하지 않는 생활 리듬이 가장 중요합니다.";
      caution = "몸의 신호를 참고 넘기거나, 바쁘다는 이유로 수면과 식사를 무너뜨리는 것은 피해야 합니다.";
      strategy = `1. 수면 시간을 먼저 고정하세요.
2. 과로가 반복되는 일정은 줄이세요.
3. 정기검진과 기본 수치를 확인하세요.
4. 무리한 운동보다 꾸준한 걷기와 회복이 중요합니다.`;
      break;

    case "legalIssue":
      reality = "소송이나 분쟁은 감정 대응보다 증거, 문서, 일정, 책임 범위를 정리하는 것이 먼저입니다. 지금 흐름에서는 말로 해결하려 하기보다 기록과 절차를 갖출수록 유리합니다.";
      caution = "상대 말만 믿거나, 감정적으로 대응하거나, 중요한 내용을 구두로만 남기는 것은 위험합니다.";
      strategy = `1. 문자, 계약서, 입금 내역, 통화 기록을 정리하세요.
2. 쟁점과 날짜를 시간순으로 정리하세요.
3. 감정적인 답변보다 짧고 명확하게 대응하세요.
4. 금액이나 책임이 큰 문제는 전문가 검토를 받으세요.`;
      break;

    case "overseas":
      reality =
        stage === "기반구축기"
          ? "해외 이동이나 장거리 이동은 경험과 시야를 넓히는 데 도움이 될 수 있습니다. 다만 목적 없는 이동보다 공부, 일, 경력으로 연결되는 이동이 좋습니다."
          : stage === "도약기"
          ? "해외 이동은 커리어와 자산 흐름을 넓힐 수 있지만 비용, 체류 계획, 가족 계획을 함께 봐야 합니다."
          : stage === "확장기"
          ? "해외 이동은 새로운 기회가 될 수 있지만 가족, 사업, 자산 관리 부담이 함께 커질 수 있습니다. 준비 없는 이동은 피해야 합니다."
          : "해외 이동은 무리한 도전보다 건강, 체류 안정성, 가족과의 거리, 비용 부담을 중심으로 판단해야 합니다.";
      caution = "막연한 기대만으로 이동하거나, 비용비자거주 계획 없이 움직이는 것은 좋지 않습니다.";
      strategy = `1. 이동 목적을 공부, 일, 가족, 사업 중 하나로 분명히 정하세요.
2. 최소 6개월 비용을 계산하세요.
3. 체류 조건과 비자 문제를 먼저 확인하세요.
4. 돌아올 경우의 계획도 함께 세우세요.`;
      break;

    case "importantChoice":
    default:
      reality =
        stage === "기반구축기"
          ? "올해의 중요한 선택은 큰 성공보다 기반을 만드는 방향이어야 합니다. 직업, 공부, 인간관계, 종잣돈처럼 앞으로 3년을 버틸 기초를 세우는 선택이 좋습니다."
          : stage === "도약기"
          ? "올해는 결혼, 직업, 자산처럼 인생의 큰 기준을 정해야 하는 시기입니다. 선택을 미루기보다 현실 기준을 세우는 것이 중요합니다."
          : stage === "확장기"
          ? "올해는 확장과 안정 사이의 균형이 핵심입니다. 일, 가족, 자산을 모두 넓히려 하기보다 우선순위를 정해야 합니다."
          : stage === "전환기"
          ? "올해는 정리와 전환이 중요합니다. 무리한 확장보다 제2의 일, 건강, 자산 안정성을 함께 준비해야 합니다."
          : "올해는 보존과 안정이 중심입니다. 자산, 건강, 가족관계, 노후 생활을 무리 없이 정리하는 선택이 좋습니다.";
      caution = "급하게 결정하거나, 주변 말에 흔들리거나, 모든 것을 한 번에 바꾸려는 선택은 피해야 합니다.";
      strategy = `1. 올해 꼭 해야 할 선택을 1순위만 정하세요.
2. 돈, 건강, 가족, 일 중 가장 급한 문제를 먼저 보세요.
3. 선택 전 최악의 경우를 계산하세요.
4. 앞으로 3년 동안 유지 가능한 방향인지 확인하세요.`;
      break;
  }

  return `${buildOpening(data, questionKey)}

${identity.lifeStyle}

${reality}

${caution}

${strategy}

${identity.riskPoint}`;
}
export function getCaseConsulting(data: BasicSajuResult, question: CaseQuestionKey | string) {
  const questionKey = resolveQuestionKey(question);
  if (["investment", "moneyTiming", "stockInvestment"].includes(questionKey)) {
    return buildWealthAdvice(data, questionKey);
  }

  if (["jobChange", "careerDirection", "promotion", "exam"].includes(questionKey)) {
    return buildJobAdvice(data, questionKey);
  }

  if (["businessStart", "businessExpand", "partnership", "contract"].includes(questionKey)) {
    return buildBusinessAdvice(data, questionKey);
  }

  if (["realEstateBuy", "realEstateSell", "houseMove"].includes(questionKey)) {
    return buildRealEstateAdvice(data, questionKey);
  }

  if (
    [
      "marriagePrepare",
      "newRelationship",
      "marriageTiming",
      "remarriage",
      "children",
      "relationshipCleanUp",
      "familyConflict",
    ].includes(questionKey)
  ) {
    return buildRelationshipAdvice(data, questionKey);
  }

  return buildHealthLifeAdvice(data, questionKey);
}




















