import type { BasicSajuInput } from "../../types/basic";
import { basicMapper } from "../basic/basicMapper";
import { buildConsultingFramework } from "../framework/consultingFramework";

function getCurrentAge(birthDate: string) {
  const birthYear = Number(birthDate.slice(0, 4));
  const currentYear = new Date().getFullYear();

  if (!birthYear) return 0;

  return currentYear - birthYear + 1;
}

function getLifeStage(age: number) {
  if (age <= 29) {
    return {
      label: "기초 형성기",
      message: "현재는 인생의 기초를 만들고 방향을 정하는 시기입니다.",
      focus: "경험, 공부, 직업 방향, 생활 습관을 정리하는 것",
    };
  }

  if (age <= 44) {
    return {
      label: "사회 기반 형성기",
      message: "현재는 사회적 기반을 만들고 실질적인 성과를 쌓아가야 하는 시기입니다.",
      focus: "직업 안정, 수입 구조, 인간관계의 기준을 세우는 것",
    };
  }

  if (age <= 59) {
    return {
      label: "선택과 정리의 시기",
      message: "현재는 그동안 쌓아온 경험을 바탕으로 선택과 정리를 해야 하는 시기입니다.",
      focus: "무리한 확장보다 오래 갈 일, 돈, 관계의 구조를 만드는 것",
    };
  }

  return {
    label: "안정과 관리의 시기",
    message: "현재는 무리한 확장보다 안정, 정리, 건강, 관계의 균형이 더 중요한 시기입니다.",
    focus: "건강, 자산 안정, 가족 관계, 생활 리듬을 지키는 것",
  };
}

function getElementMeaning(element: string) {
  const meanings: Record<string, string> = {
    목: "성장, 기획, 배움, 확장성",
    화: "표현, 명예, 활동성, 드러나는 성과",
    토: "안정, 축적, 책임, 현실 감각",
    금: "판단, 정리, 원칙, 결과물",
    수: "지혜, 유연성, 이동, 정보 흐름",
  };

  return meanings[element] ?? "개인의 기질과 선택 방식";
}

function getDayMasterAdvice(dayMaster: string) {
  if (dayMaster.includes("갑") || dayMaster.includes("을")) {
    return "일간의 흐름상 성장 욕구와 방향성이 중요합니다. 무작정 버티기보다 어떤 환경에서 자랄 수 있는지, 어떤 사람들과 함께할 때 기운이 살아나는지를 보는 것이 핵심입니다.";
  }

  if (dayMaster.includes("병") || dayMaster.includes("정")) {
    return "일간의 흐름상 표현력과 활동성이 중요합니다. 다만 감정과 속도가 앞서면 결정이 흔들릴 수 있으므로, 빛을 내되 기준을 함께 세우는 것이 필요합니다.";
  }

  if (dayMaster.includes("무") || dayMaster.includes("기")) {
    return "일간의 흐름상 안정감과 책임감이 강하게 작용합니다. 한 번 맡은 일은 오래 끌고 가는 힘이 있지만, 혼자 짊어지는 일이 많아지면 지치기 쉽습니다.";
  }

  if (dayMaster.includes("경") || dayMaster.includes("신")) {
    return "일간의 흐름상 판단력과 정리 능력이 중요합니다. 기준이 분명할수록 강점이 살아나지만, 지나치게 단호해지면 관계에서 부드러움이 부족해질 수 있습니다.";
  }

  if (dayMaster.includes("임") || dayMaster.includes("계")) {
    return "일간의 흐름상 유연성, 정보력, 판단의 폭이 중요합니다. 생각이 깊고 흐름을 읽는 힘이 있지만, 방향이 흐려지면 실행이 늦어질 수 있습니다.";
  }

  return "일간은 이 사람의 중심 기질을 보여줍니다. 총운에서는 이 중심 기질이 어떤 환경에서 살아나고, 어떤 선택에서 흔들리는지를 함께 봐야 합니다.";
}

export function totalConsulting(data: BasicSajuInput): string {
  const basic = basicMapper(data);
  const age = getCurrentAge(data.birthDate);
  const currentYear = new Date().getFullYear();
  const lifeStage = getLifeStage(age);

  const strongestMeaning = getElementMeaning(basic.strongestElement);
  const weakestMeaning = getElementMeaning(basic.weakestElement);
  const dayMasterAdvice = getDayMasterAdvice(basic.dayMaster);

  const formatAgeRange = (startOffset: number, endOffset: number) => {
    if (!age) return "현재 나이 기준";
    return `${age + startOffset}세~${age + endOffset}세`;
  };

  const tenYearFlow = [
    `${currentYear}년~${currentYear + 2}년 (${formatAgeRange(0, 2)})
- 핵심 흐름: 현재의 생활, 일, 돈, 관계 기준을 다시 정리하는 3년 구간입니다.
- 사주 근거: ${basic.dayMaster} 일간의 중심 기질과 ${basic.strongestElement} 기운이 강하게 작용하므로, 무작정 새로 벌리기보다 내 기준을 세울 때 운이 안정됩니다.
- 좋은 기회: 흩어져 있던 일을 정리하고, 오래 가져갈 방향을 다시 잡는 데 유리합니다.
- 주의할 점: ${basic.weakestElement} 기운이 약하게 작용하는 부분에서는 감정적 판단, 미루는 습관, 주변 말에 흔들리는 흐름이 생기기 쉽습니다.
- 현실 조언: 큰 결정보다 생활 구조, 지출 구조, 일의 우선순위를 먼저 정리하는 것이 좋습니다.`,

    `${currentYear + 3}년~${currentYear + 5}년 (${formatAgeRange(3, 5)})
- 핵심 흐름: 앞에서 정리한 기준이 실제 결과로 이어지기 시작하는 구간입니다.
- 사주 근거: ${basic.yearGanZhi}, ${basic.monthGanZhi}, ${basic.dayGanZhi}의 흐름을 함께 보면 결과는 한 번에 터지는 방식보다 쌓인 것이 드러나는 방식에 가깝습니다.
- 좋은 기회: 직업, 사업, 재테크에서 현실적인 성과를 만들 수 있습니다.
- 주의할 점: 성과가 보이기 시작할수록 욕심이 커져 관계나 건강 리듬이 흔들릴 수 있습니다.
- 현실 조언: 확장하더라도 숫자, 계약, 사람 관계의 조건을 확인하면서 움직이는 것이 좋습니다.`,

    `${currentYear + 6}년~${currentYear + 7}년 (${formatAgeRange(6, 7)})
- 핵심 흐름: 무리한 확장보다 안정적인 관리가 중요해지는 구간입니다.
- 사주 근거: 강한 ${basic.strongestElement} 기운은 장점이지만, 오래 쓰면 피로가 쌓일 수 있습니다. 약한 ${basic.weakestElement} 기운은 보완해야 할 생활 습관으로 나타납니다.
- 좋은 기회: 경험과 신뢰를 바탕으로 더 편안하고 오래 가는 구조를 만들 수 있습니다.
- 주의할 점: 오래된 습관, 미뤄둔 건강 문제, 정리하지 않은 돈 문제가 다시 올라올 수 있습니다.
- 현실 조언: 사람, 돈, 건강을 동시에 정리하면서 오래 갈 수 있는 방향을 선택해야 합니다.`,

    `${currentYear + 8}년~${currentYear + 9}년 (${formatAgeRange(8, 9)})
- 핵심 흐름: 앞선 흐름을 마무리하고 다음 10년의 방향을 준비하는 구간입니다.
- 사주 근거: ${basic.dayMaster} 일간의 중심이 안정될수록 선택이 단순해지고, 강한 ${basic.strongestElement} 기운은 경험과 신뢰로 바뀝니다.
- 좋은 기회: 불필요한 일을 줄이고, 남길 것과 정리할 것을 구분하기 좋습니다.
- 주의할 점: 익숙하다는 이유로 오래된 방식을 계속 고집하면 변화의 기회를 놓칠 수 있습니다.
- 현실 조언: 다음 흐름을 위해 일, 자산, 관계, 건강의 기준을 다시 점검하는 것이 좋습니다.`,
  ].join("\n\n");

  return buildConsultingFramework({
    name: data.name,
    title: "총운 상담",
    firstImpression: `${data.name}님의 총운은 단순히 운이 좋다, 나쁘다로 볼 수 없습니다. ${data.name}님의 인생 흐름은 빠르게 치고 나가는 방식보다, 시간이 지날수록 경험과 신뢰가 쌓이며 힘이 커지는 구조입니다.

    초년에는 방향을 찾는 데 시간이 걸릴 수 있지만, 중년 이후부터는 자신이 쌓아온 경험이 자산이 되고 선택의 기준이 분명해질수록 운이 안정됩니다. ${basic.dayMaster} 일간과 전체 사주 흐름을 함께 보면 빠른 승부보다 오래 가져갈 수 있는 길에서 성과가 살아납니다.`,

    personInsight: `${data.name}님은 현재 ${age ? `${age}세` : "현재 나이 기준"} 흐름에 있으며, 인생 단계로 보면 ${lifeStage.label}에 있습니다. ${lifeStage.message}

사주에서 강하게 살아나는 기운은 ${basic.strongestElement}입니다. 이 기운은 ${strongestMeaning}과 연결됩니다. 그래서 ${data.name}님은 자신의 강점을 제대로 쓰면 일, 돈, 관계에서 분명한 기준을 만들 수 있습니다.

반대로 보완이 필요한 기운은 ${basic.weakestElement}입니다. 이 기운은 ${weakestMeaning}과 연결됩니다. 이 부분은 약점이라기보다 앞으로 의식적으로 채워야 할 생활 방식에 가깝습니다.

${dayMasterAdvice}`,

    repeatedPattern: `

반대로 마음이 불안해서 계획을 자주 바꾸거나, 남의 속도와 비교해서 급하게 움직이면 이미 쌓아둔 흐름이 끊길 수 있습니다. 총운에서 가장 중요한 것은 속도가 아니라 방향입니다.`,

    realCase: `실제 상담에서 이런 흐름을 가진 분들은 일에서는 신뢰, 돈에서는 관리, 관계에서는 거리 조절이 중요하게 나타납니다.

예를 들어 직업에서는 완전히 낯선 분야로 갑자기 뛰어들기보다, 이미 해본 일이나 익숙한 환경 안에서 역할을 넓힐 때 성과가 더 안정적으로 나타납니다. 재테크에서는 큰 수익을 노리는 방식보다 지출, 현금흐름, 보유 기간을 정리할 때 운이 좋아집니다. 관계에서는 많은 사람을 넓게 만나는 것보다 오래 갈 사람을 구분하는 것이 중요합니다.`,

    futureFlow: `앞으로 10년에서 가장 중요한 것은 확장보다 기준입니다.

${tenYearFlow}

전체적으로 보면 앞으로 3년은 생활과 일의 기준을 다시 잡는 시기이고, 그 이후에는 쌓아온 것이 결과로 드러나는 흐름입니다. 이 흐름은 오늘 하루의 운세가 아니라 인생 전체의 방향을 보는 총운입니다.`,

    actionGuide: `첫째, 지금 나이에 맞는 우선순위를 다시 정해야 합니다. 현재 단계의 핵심은 ${lifeStage.focus}입니다.

둘째, 강한 ${basic.strongestElement} 기운은 장점으로 쓰되 과하게 쓰지 않아야 합니다. 장점도 오래 쓰면 피로가 됩니다.

셋째, 약한 ${basic.weakestElement} 기운은 생활 습관으로 보완해야 합니다. 부족한 부분을 억지로 고치기보다 일정, 사람, 돈, 건강 관리 방식으로 채워야 합니다.

넷째, 투자나 이직, 사업 판단은 감정보다 숫자와 조건을 확인한 뒤 움직여야 합니다.

다섯째, 앞으로의 선택은 “지금 당장 좋은가”보다 “3년 뒤에도 유지할 수 있는가”를 기준으로 보는 것이 좋습니다.`,

    finalMessage: `${data.name}님은 운이 없어서 늦어지는 사람이 아닙니다. 기준이 흩어질 때 결과가 늦게 나타나는 사람입니다.

앞으로는 불안해서 움직이기보다 오래 가져갈 수 있는 일, 사람, 돈의 기준을 세우는 것이 가장 중요합니다. ${basic.dayMaster} 일간의 중심을 살리고, 강한 ${basic.strongestElement} 기운은 장점으로 쓰며, 약한 ${basic.weakestElement} 기운은 생활 속에서 보완한다면 총운은 훨씬 안정적으로 열릴 수 있습니다.`,
  });
}


