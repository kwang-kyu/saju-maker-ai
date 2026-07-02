import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";

function getAge(birthDate?: string) {
  const birthYear = Number(String(birthDate || "").slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getHealthAgeStrategy(age: number) {
  if (!age) {
    return "현재 건강운은 나이보다 수면, 식사, 스트레스, 회복 리듬이 얼마나 일정하게 유지되는지를 중심으로 보는 것이 좋습니다.";
  }

  if (age <= 29) {
    return "20대 흐름에서는 체력이 있다고 무리하기 쉽습니다. 밤샘, 불규칙한 식사, 과한 카페인, 운동 부족이 반복되면 젊은 나이에도 피로가 빨리 쌓일 수 있습니다.";
  }

  if (age <= 39) {
    return "30대 흐름에서는 일과 생활의 균형이 건강운을 크게 좌우합니다. 수면 부족, 스트레스성 소화 문제, 체중 변화, 자세 불균형을 관리해야 합니다.";
  }

  if (age <= 49) {
    return "40대 흐름에서는 체력보다 회복력이 중요해집니다. 건강검진, 혈압, 혈당, 간 기능, 체중 관리처럼 숫자로 확인할 수 있는 관리가 필요합니다.";
  }

  if (age <= 59) {
    return "50대 흐름에서는 무리해서 버티는 습관을 줄여야 합니다. 근력, 관절, 혈관 건강, 수면의 질을 함께 관리해야 건강운이 안정됩니다.";
  }

  return "60대 이후 흐름에서는 큰 운동보다 꾸준한 관리가 중요합니다. 걷기, 근력 유지, 식사 조절, 정기검진, 낙상 예방처럼 생활 속 안정이 건강운의 중심입니다.";
}

function getElementHealthPoint(data: BasicSajuResult) {
  const strong = data.strongestElement;
  const weak = data.weakestElement;

  if (weak.includes("목")) {
    return "부족한 목 기운은 몸의 유연성, 순환, 근육의 긴장과 연결해 볼 수 있습니다. 오래 앉아 있거나 움직임이 부족하면 몸이 쉽게 굳을 수 있으니 스트레칭과 가벼운 걷기가 필요합니다.";
  }

  if (weak.includes("화")) {
    return "부족한 화 기운은 활력, 체온, 표현, 순환 리듬과 연결해 볼 수 있습니다. 몸이 차거나 의욕이 떨어질 때는 햇빛, 가벼운 유산소 운동, 규칙적인 생활 리듬이 도움이 됩니다.";
  }

  if (weak.includes("토")) {
    return "부족한 토 기운은 소화, 생활의 중심, 식사 리듬과 연결해 볼 수 있습니다. 불규칙한 식사와 과식, 야식이 반복되면 컨디션이 쉽게 흔들릴 수 있습니다.";
  }

  if (weak.includes("금")) {
    return "부족한 금 기운은 호흡, 피부, 정리 능력, 몸의 경계선과 연결해 볼 수 있습니다. 실내 공기, 호흡 습관, 알레르기성 피로, 과로 후 면역 저하를 조심하는 것이 좋습니다.";
  }

  if (weak.includes("수")) {
    return "부족한 수 기운은 수면, 회복력, 신장방광 계통의 부담, 깊은 휴식과 연결해 볼 수 있습니다. 쉬지 않고 버티는 습관이 길어지면 피로가 깊게 쌓일 수 있습니다.";
  }

  return `강한 ${strong} 기운은 버티는 힘으로 쓰되, 부족한 ${weak} 기운은 생활 습관으로 보완하는 것이 좋습니다.`;
}

export function getHealthConsulting(data: BasicSajuResult, birthDate?: string): string {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);
  const age = getAge(birthDate);
  const ageStrategy = getHealthAgeStrategy(age);
  const elementHealthPoint = getElementHealthPoint(data);

  return buildConsultingFramework({
    name,
    title: "건강 상담",
    firstImpression: `${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 함께 보면 ${name}님의 건강운은 체력 자체보다 생활 리듬과 회복력의 균형에서 더 크게 갈립니다.

${identity.lifeStyle}

${identity.riskPoint}`,

    personInsight: `${name}님은 몸이 한 번에 크게 무너지는 흐름보다는 작은 피로가 쌓이다가 어느 순간 컨디션이 떨어지는 흐름을 조심해야 합니다.

강하게 살아나는 ${data.strongestElement} 기운은 몸과 마음을 버티게 하는 기본 힘이고, 부족한 ${data.weakestElement} 기운은 건강 관리에서 보완해야 할 지점입니다.

${elementHealthPoint}

${ageStrategy}`,

    repeatedPattern: `${name}님은 바쁠 때는 참고 버티다가 일이 끝난 뒤에 피로가 몰려오는 흐름이 생기기 쉽습니다.

당장은 괜찮다고 느껴도 몸은 이미 긴장 상태를 오래 유지하고 있을 수 있습니다. 이런 흐름이 반복되면 잠을 자도 개운하지 않거나, 몸이 무겁고, 작은 일에도 예민해질 수 있습니다.

특히 ${name}님은 건강을 크게 망치는 한 가지 원인보다 수면 부족, 식사 불균형, 스트레스, 운동 부족이 조금씩 겹치면서 컨디션이 떨어지는 흐름을 조심해야 합니다.`,

    realCase: `실제 상담에서 이런 흐름을 가진 분들은 몸에 좋은 것을 많이 챙기기보다 나쁜 습관을 줄이는 것이 더 중요하게 나타납니다.

늦은 식사, 불규칙한 수면, 과한 카페인, 오래 앉아 있는 습관, 스트레스를 참고 넘기는 습관이 건강운을 약하게 만들 수 있습니다.

건강운을 좋게 만드는 핵심은 특별한 보약이나 무리한 운동이 아니라 매일 반복되는 생활 리듬을 안정시키는 것입니다.`,

    futureFlow: `앞으로 3년 동안 ${name}님의 건강운에서 중요한 것은 큰 변화보다 생활 리듬을 안정시키는 것입니다.

1년 차에는 무리한 목표보다 수면과 식사 시간을 먼저 정리하는 것이 좋습니다. 이 시기에는 몸을 강하게 만드는 것보다 피로가 새는 구멍을 막는 것이 먼저입니다.

2년 차에는 체력 관리가 중요합니다. 가벼운 운동을 꾸준히 이어가야 몸의 기본 힘이 살아납니다. 걷기, 스트레칭, 근력 운동처럼 오래 할 수 있는 방식이 좋습니다.

3년 차에는 스트레스 관리가 핵심입니다. 일이 많아질수록 쉬는 시간을 의식적으로 확보해야 합니다. 몸이 보내는 신호를 빨리 알아차릴수록 건강운이 안정됩니다.

건강운은 단순히 병이 있다 없다로 보는 것이 아니라 몸이 어떤 방식으로 피로를 쌓고, 어떤 생활 리듬에서 무너지기 쉬운지를 보는 것이 중요합니다.`,

    actionGuide: `첫째, 피곤할 때 더 버티지 말고 바로 쉬는 습관을 만드세요.
둘째, 식사와 수면 시간을 일정하게 유지하는 것이 좋습니다.
셋째, 무리한 운동보다 오래 할 수 있는 가벼운 운동이 더 잘 맞습니다.
넷째, 몸이 보내는 작은 신호를 무시하지 마세요.
다섯째, 스트레스를 혼자 오래 담아두지 않는 것이 중요합니다.
여섯째, 정기검진과 기본 수치를 확인하는 습관을 가져야 합니다.`,

    finalMessage: `${name}님의 건강운은 큰 병을 겁내기보다 생활 리듬이 무너지면서 생기는 피로 누적을 조심해야 하는 흐름입니다.

앞으로는 몸을 더 강하게 몰아붙이기보다 규칙적인 생활, 충분한 회복, 마음을 쉬게 하는 시간을 만들어가는 것이 중요합니다.

${identity.successPoint}

최종적으로 ${name}님에게 가장 중요한 건강 관리 기준은 무리해서 버티는 힘이 아니라 오래 유지할 수 있는 생활 리듬을 만드는 것입니다.`,
  });
}
