import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";

function getAge(birthDate?: string) {
  const birthYear = Number(String(birthDate || "").slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getLoveAgeStrategy(age: number) {
  if (!age) {
    return "현재 연애운은 나이보다 관계를 선택하는 기준, 감정 표현 방식, 생활 리듬이 잘 맞는지를 중심으로 보는 것이 좋습니다.";
  }

  if (age <= 29) {
    return "20대 흐름에서는 많은 만남보다 사람을 보는 기준을 배우는 시기입니다. 설렘만 보고 빠르게 확신하기보다 상대의 태도와 책임감을 천천히 확인하는 것이 좋습니다.";
  }

  if (age <= 39) {
    return "30대 흐름에서는 연애가 단순한 감정보다 결혼, 생활 방식, 경제관념, 가족관계까지 함께 연결됩니다. 오래 갈 수 있는 현실적인 안정감을 보는 것이 중요합니다.";
  }

  if (age <= 49) {
    return "40대 흐름에서는 감정의 새로움보다 서로의 삶을 존중할 수 있는 관계가 중요합니다. 무리하게 맞추는 관계보다 편안하고 책임 있는 관계가 좋습니다.";
  }

  if (age <= 59) {
    return "50대 흐름에서는 외로움 때문에 관계를 시작하기보다 삶의 리듬이 맞는 사람을 선택해야 합니다. 말보다 생활 태도와 신뢰가 훨씬 중요합니다.";
  }

  return "60대 이후 흐름에서는 설렘보다 정서적 안정과 생활의 동반자성이 중요합니다. 서로에게 부담이 되지 않고 편안하게 기대는 관계가 좋은 인연입니다.";
}

export function loveConsulting(data: BasicSajuResult, birthDate?: string): string {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);
  const age = getAge(birthDate);
  const ageStrategy = getLoveAgeStrategy(age);

  return buildConsultingFramework({
    name,
    title: "연애 상담",
    firstImpression: `${name}님의 연애운은 만남의 횟수보다
관계 안에서 마음이 얼마나 편안해지고,
신뢰가 얼마나 자연스럽게 쌓이는지를 먼저 봐야 합니다.

${identity.lifeStyle}

${identity.relationshipStyle}`,

    personInsight: `${name}님은 연애를 가볍게 흘려보내는 사람이라기보다
마음이 움직이면 상대를 깊이 생각하고,
관계가 안정되기를 바라는 마음이 강한 편입니다.

좋아하는 마음이 생기면 쉽게 끊어내지 못하고,
상대의 말과 행동을 오래 곱씹는 흐름도 있습니다.

그래서 ${name}님에게 좋은 인연은
강한 설렘만 주는 사람이 아니라
시간이 지날수록 마음을 편안하게 해주는 사람입니다.

${ageStrategy}`,

    repeatedPattern: `${name}님은 상대가 나를 진심으로 존중해준다고 느낄 때
마음을 열기 쉽습니다.

반대로 감정 기복이 심하거나,
말은 많은데 책임감이 부족한 사람과는 오래 가기 어렵습니다.

관계가 깊어질수록 상대의 태도 변화에 민감해지고,
서운함을 바로 표현하지 못해 속으로 쌓아두는 흐름이 생길 수 있습니다.

${identity.riskPoint}`,

    realCase: `실제 상담에서 이런 흐름을 가진 분들은
겉으로는 괜찮은 척하거나 담담해 보여도
속으로는 상대의 말과 행동을 오래 생각하는 경우가 많습니다.

처음에는 설렘이 강해도
시간이 지나면서 말과 행동이 달라지는 사람을 만나면
마음이 쉽게 불안해질 수 있습니다.

반대로 표현이 화려하지 않아도
약속을 지키고, 생활 태도가 안정적이며,
나를 존중해주는 사람을 만날 때 관계가 오래 갑니다.

특히 ${name}님은 나를 불안하게 만드는 사람보다
내 생활 리듬을 흐트러뜨리지 않는 사람을 만나야 좋습니다.`,

    futureFlow: `앞으로 3년 동안 ${name}님의 연애운에서 중요한 것은
새로운 만남 자체보다 관계를 고르는 기준입니다.

1년 차에는 사람을 만날 기회가 생기더라도
겉모습이나 분위기만 보고 빠르게 판단하지 않는 것이 좋습니다.

2년 차에는 실제 생활 습관, 돈을 대하는 방식,
말투, 책임감 같은 현실적인 부분을 봐야 합니다.

3년 차에는 관계를 이어갈지 정리할지에 대한 판단이
조금 더 분명해질 수 있습니다.

이때 감정보다 현실을 함께 볼 수 있어야
좋은 선택을 할 수 있습니다.`,

    actionGuide: `첫째, 마음에 드는 사람이 생겨도 너무 빨리 확신하지 마세요.
둘째, 상대의 말보다 반복되는 행동과 책임감을 보세요.
셋째, 나를 불안하게 만드는 사람보다 편안하게 만드는 사람을 선택하세요.
넷째, 외로움 때문에 관계를 시작하지 않는 것이 좋습니다.
다섯째, 연애를 하더라도 내 생활 리듬과 기준은 지켜야 합니다.
여섯째, 관계가 불편해질 때는 참기보다 차분하게 표현하는 연습이 필요합니다.`,

    finalMessage: `${name}님의 연애운은 가볍고 빠른 인연보다
천천히 신뢰를 쌓아가는 인연에서 좋아집니다.

중요한 것은 많이 만나는 것이 아니라
나를 안정시키는 사람을 알아보는 눈입니다.

${identity.successPoint}

앞으로의 연애에서는 설렘만 보지 말고
이 사람이 내 마음을 편안하게 해주는 사람인지,
내 삶을 함께 건강하게 만들어갈 수 있는 사람인지를 보셔야 합니다.`,
  });
}
