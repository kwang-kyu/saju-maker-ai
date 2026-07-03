import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";

function getAge(birthDate?: string) {
  const birthYear = Number(String(birthDate || "").slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getAgeStrategy(age: number) {
  if (!age) {
    return "현재는 나이보다 현금 흐름, 고정 지출, 투자 경험 수준을 기준으로 자산 전략을 세우는 것이 좋습니다. 특히 무리한 수익보다 내 생활을 흔들지 않는 돈의 구조를 먼저 잡아야 합니다.";
  }

  if (age <= 29) {
    return "20대 재물운은 큰돈을 한 번에 잡는 시기라기보다 돈을 다루는 습관을 만드는 시기입니다. 소득이 아직 커지는 과정이므로 저축, 소액 투자, ETF, 청약, 자기계발에 돈을 나누는 것이 좋습니다. 이 시기에는 손실을 크게 보는 투자보다 경험을 쌓는 투자가 중요합니다.";
  }

  if (age <= 39) {
    return "30대 재물운은 소득 증가와 자산 형성을 동시에 봐야 하는 시기입니다. 결혼, 주거, 대출, 자녀 계획이 함께 들어올 수 있으므로 현금, ETF, 연금, 주식, 청약, 부동산 자금을 구분해야 합니다. 무리한 단기 투자보다 5년 이상 버틸 수 있는 구조가 유리합니다.";
  }

  if (age <= 49) {
    return "40대 재물운은 공격보다 균형이 핵심입니다. 가족 지출, 교육비, 대출, 사업자금, 노후 준비가 동시에 올라올 수 있어 돈을 벌어도 새는 구멍이 생기기 쉽습니다. 이 시기에는 부동산, 연금, 현금, 주식형 자산을 나누고 투자보다 자산 방어력을 먼저 봐야 합니다.";
  }

  if (age <= 59) {
    return "50대 재물운은 자산을 크게 불리는 것보다 지키고 정리하는 힘이 중요해집니다. 퇴직, 은퇴, 자녀 독립, 노후 생활비가 현실 문제가 되므로 현금흐름, 연금, 임대수익, 안정형 ETF, 부업형 수입을 함께 봐야 합니다. 원금 손실이 큰 투자는 비중을 줄이는 것이 좋습니다.";
  }

  if (age <= 64) {
    return "60대 초반 재물운은 은퇴 전후의 현금흐름을 안정시키는 것이 가장 중요합니다. 큰 수익을 노리는 투자보다 생활비, 의료비, 비상자금, 연금 수령, 임대수익을 정리해야 합니다. 이 시기에는 돈을 더 버는 전략보다 매달 버틸 수 있는 구조를 만드는 것이 우선입니다.";
  }

  return "65세 이후 재물운은 자산 확장보다 보존과 생활 안정이 핵심입니다. 원금 손실 가능성이 큰 투자는 줄이고, 현금성 자산, 연금, 의료비, 생활비, 가족 지원 여부를 차분히 정리해야 합니다. 특히 명의, 상속, 증여, 자녀 지원 문제는 감정보다 기준을 세워 판단하는 것이 좋습니다.";
}
function getInvestmentStyle(data: BasicSajuResult) {
  const strong = data.strongestElement;
  const weak = data.weakestElement;

  if (strong.includes("화")) {
    return "기회 포착과 실행력은 빠르지만 분위기에 휩쓸린 단기 투자는 조심해야 합니다. 코인테마주처럼 변동성이 큰 자산은 비중을 작게 제한하는 것이 좋습니다.";
  }

  if (strong.includes("금")) {
    return "분석과 판단 기준이 비교적 강한 편입니다. 주식, ETF, 채권, 달러 자산처럼 숫자와 구조를 보고 접근하는 투자가 잘 맞습니다.";
  }

  if (strong.includes("토")) {
    return "안정성과 현실 감각이 강한 편입니다. 부동산, 연금, 현금흐름형 자산처럼 눈에 보이고 오래 유지되는 자산과 잘 맞습니다.";
  }

  if (strong.includes("수")) {
    return "흐름을 읽고 정보를 모으는 감각이 있습니다. 다만 생각이 많아 매수매도 타이밍이 흔들릴 수 있으니 투자 원칙을 문서로 정해두는 것이 좋습니다.";
  }

  if (strong.includes("목")) {
    return "성장형 자산과 장기 투자에 어울리는 흐름입니다. ETF, 우량주, 자기계발형 부업처럼 시간을 두고 커지는 방식이 잘 맞습니다.";
  }

  return `강한 ${strong} 기운은 투자 판단의 장점으로 쓰고, 부족한 ${weak} 기운은 리스크 관리 기준으로 보완하는 것이 좋습니다.`;
}

export function moneyConsulting(data: BasicSajuResult, birthDate?: string): string {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);
  const age = getAge(birthDate);
  const ageStrategy = getAgeStrategy(age);
  const investmentStyle = getInvestmentStyle(data);

  return buildConsultingFramework({
    name,
    title: "재테크 상담",
    firstImpression: `${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 함께 보면 ${name}님의 재테크는 단순히 돈복이 있느냐 없느냐로 볼 문제가 아닙니다.

중요한 것은 지금 나이와 사주 흐름에 맞게 현금, 투자, 부동산, 연금, 부업, 사업 가능성을 어떻게 나누느냐입니다.

${identity.moneyStyle}

${identity.decisionStyle}`,

    personInsight: `${name}님은 돈을 무작정 따라가기보다 스스로 납득되는 기준이 있어야 안정적으로 움직이는 편입니다. 강하게 살아나는 ${data.strongestElement} 기운은 돈을 벌고 기회를 잡을 때 장점으로 나타나지만, 부족한 ${data.weakestElement} 기운은 투자 판단이 흔들리거나 리스크 관리가 약해질 수 있는 지점입니다.

${investmentStyle}

${ageStrategy}`,

    repeatedPattern: `${name}님은 수익 가능성이 보이면 관심이 생기지만, 막상 결정할 때는 확신과 불안이 함께 올라올 수 있습니다. 그래서 재테크는 감으로 들어가는 방식보다 자산을 나누고 비중을 정해두는 방식이 훨씬 잘 맞습니다.

현금, ETF, 주식, 부동산, 연금, 코인, 사업자금은 한 바구니에 담으면 안 됩니다. 특히 ${name}님은 투자 전에 얼마를 벌 수 있나보다 얼마까지 잃어도 생활이 흔들리지 않나를 먼저 봐야 합니다.

${identity.riskPoint}`,

    realCase: `실제 상담에서 이런 흐름을 가진 분들은 돈을 못 버는 것이 문제가 아니라 돈을 어떻게 배치할지 정하지 못해 기회를 놓치거나 손실을 키우는 경우가 많습니다.

예를 들어 주식이 좋아 보이면 주식에 몰리고, 부동산 이야기가 들리면 부동산으로 마음이 흔들리고, 코인이 오르면 뒤늦게 들어가고 싶은 마음이 생길 수 있습니다. 하지만 ${name}님에게 필요한 것은 유행을 따라가는 재테크가 아니라 본인 사주와 생활 구조에 맞는 자산관리 기준입니다.`,

    futureFlow: `앞으로 3년 재테크 흐름은 정리, 분산, 확장의 순서로 보는 것이 좋습니다.

1년 차에는 고정 지출, 대출, 보험, 카드 사용, 현금 비중을 먼저 정리해야 합니다. 이 시기에는 수익률보다 돈이 새는 구멍을 막는 것이 먼저입니다.

2년 차에는 ETF, 연금, 현금성 자산, 주식형 자산을 나누어 본인에게 맞는 투자 비중을 만들어야 합니다. 공격형 투자는 전체 자산의 일부로 제한하고, 장기적으로 쌓이는 구조를 우선해야 합니다.

3년 차에는 부업, 사업, 부동산, 임대수익, 전문성 기반 수입처럼 현금흐름을 넓히는 방향을 검토할 수 있습니다. 다만 준비 없는 확장보다 검증된 방식 안에서 넓히는 것이 좋습니다.`,

    actionGuide: `첫째, 최소 6개월 생활비에 해당하는 현금성 자산을 먼저 확보하는 것이 좋습니다.
둘째, 코인이나 단기 매매는 가능하더라도 전체 자산의 작은 비중으로 제한해야 합니다.
셋째, ETF와 연금처럼 오래 쌓이는 자산을 기본 축으로 두는 것이 안정적입니다.
넷째, 부동산은 무리한 대출보다 현금흐름과 보유 능력을 먼저 계산해야 합니다.
다섯째, 사업이나 부업은 한 번에 크게 시작하기보다 작게 검증한 뒤 키우는 방식이 좋습니다.
여섯째, 매달 투자 금액, 현금 비중, 손실 한도를 숫자로 정해두어야 합니다.`,

    finalMessage: `${name}님의 재테크 운은 돈복이 있다, 없다로 끝낼 흐름이 아닙니다. 핵심은 돈이 들어오는 운을 현실적인 자산관리 구조로 바꾸는 것입니다.

지금부터는 주식이 맞는지, 코인이 맞는지, 부동산이 맞는지만 따로 볼 것이 아니라 현금 비중, 투자 비중, 연금, 부업, 사업 가능성을 함께 봐야 합니다.

${identity.successPoint}

최종적으로 ${name}님에게 가장 중요한 재테크 기준은 큰돈을 한 번에 잡는 것이 아니라 오래 버티고, 꾸준히 쌓고, 준비된 순간에 확장하는 것입니다.`,
  });
}


