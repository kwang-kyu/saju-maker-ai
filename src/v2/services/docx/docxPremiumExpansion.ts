import type { BasicSajuResult } from "../../types/basic";
import { buildTotalSection } from "./sections/totalSection";
import { buildTodaySection } from "./sections/todaySection";
import { buildMoneySection } from "./sections/moneySection.ts";
import { buildJobSection } from "./sections/jobSection.ts";
import { buildBusinessSection } from "./sections/businessSection.ts";
import { buildRealEstateSection } from "./sections/realEstateSection.ts";
export function buildPremiumPdfExpansion(params: {
  name: string;
  title: string;
  basic: BasicSajuResult;
}) {
  const { name, title, basic } = params;

  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";
  const dayMaster = basic.dayMaster ?? "일간";
  const strength = basic.summary ?? "보통";
  const profileText = `일간은 ${dayMaster}, 강한 오행은 ${strongElement}, 약한 오행은 ${weakElement}, 기본 흐름은 ${strength}입니다.`;
  void profileText;
    function buildBasicSajuSection(): string {
    const isSelfDriven =
      strongElement === "목" ||
      strongElement === "금" ||
      strength.includes("강");
  
    const isRelationshipDriven =
      strongElement === "화" ||
      weakElement === "금" ||
      weakElement === "수";
  
    const isFoundationDriven =
      strongElement === "토" ||
      strength.includes("균형") ||
      strength.includes("보통");
  
    const hasEarlyPressure =
      weakElement === "토" ||
      weakElement === "화" ||
      strength.includes("약");
  
    const growthBackground = isSelfDriven
      ? "성장 과정에서 일찍부터 스스로 판단하고 버텨야 하는 흐름이 강합니다. 부모나 주변의 도움만으로 길이 열리기보다, 자신의 선택과 책임을 통해 인생의 방향을 만들어가는 사주입니다."
      : isFoundationDriven
        ? "성장 과정에서 가족, 생활 기반, 주변 환경의 영향을 크게 받는 흐름입니다. 완전히 혼자 밀고 나가는 사주라기보다, 환경이 안정될수록 능력이 살아나는 구조가 강합니다."
        : "성장 과정에서 사람 관계와 주변 분위기의 영향을 많이 받는 흐름입니다. 좋은 사람을 만나면 운이 빨리 열리지만, 맞지 않는 관계에 오래 묶이면 마음과 현실이 함께 흔들릴 수 있습니다.";
  
    const earlyLife = hasEarlyPressure
      ? "초년에는 마음은 앞서도 현실 조건이 따라주지 않거나, 집안·환경·관계 문제로 인해 일찍 부담을 느끼는 흐름이 있습니다. 이 시기의 어려움은 약점이라기보다 사람을 보는 눈과 현실 감각을 키우는 과정으로 작용합니다."
      : "초년에는 비교적 자기 기질이 뚜렷하게 드러나는 편입니다. 다만 주변의 기대와 자신의 기준이 맞지 않으면 답답함을 느낄 수 있어, 일찍부터 자신에게 맞는 방향을 찾는 것이 중요합니다.";
  
    const middleLife = isSelfDriven
      ? "중년에는 자수성가의 흐름이 강해집니다. 남이 만들어 준 자리보다 자신이 쌓은 경험, 기술, 판단력이 재물과 직업의 기반이 되기 쉽습니다."
      : isRelationshipDriven
        ? "중년에는 사람을 통해 기회가 열리지만, 동시에 사람 때문에 손해를 볼 수도 있습니다. 인맥을 넓히는 것보다 믿을 사람과 정리할 사람을 구분하는 능력이 운을 좌우합니다."
        : "중년에는 안정적인 기반을 만드는 것이 가장 중요합니다. 직업, 재물, 가족, 주거가 한 방향으로 정리될수록 운이 단단해집니다.";
  
    const laterLife = weakElement === "수"
      ? "장년 이후에는 생각이 많아지거나 결정이 늦어지는 흐름을 조심해야 합니다. 경험을 흩어두지 말고 하나의 전문성이나 자산 구조로 묶어야 말년이 안정됩니다."
      : weakElement === "화"
        ? "장년 이후에는 표현 부족, 관계의 거리감, 의욕 저하를 조심해야 합니다. 마음속 생각을 혼자만 품기보다 주변과 나누는 습관이 말년 운을 부드럽게 만듭니다."
        : weakElement === "토"
          ? "장년 이후에는 기반 관리가 중요합니다. 건강, 주거, 현금흐름이 흔들리면 마음도 쉽게 불안해질 수 있으므로 안정 장치를 미리 만들어야 합니다."
          : "장년 이후에는 무리한 확장보다 지켜온 것을 정리하고, 오래 남길 것을 선택하는 힘이 중요합니다.";
  
    const relationship = isRelationshipDriven
      ? "인간관계에서는 정이 많거나 분위기에 약해 부탁을 거절하지 못하는 모습이 나타날 수 있습니다. 좋은 인연은 큰 힘이 되지만, 책임이 불분명한 관계는 재물과 마음의 부담으로 이어질 수 있습니다."
      : "인간관계에서는 쉽게 휩쓸리기보다 자신의 기준을 지키려는 성향이 강합니다. 다만 지나치게 혼자 판단하면 주변과 거리감이 생길 수 있으니, 중요한 관계에서는 설명과 조율이 필요합니다.";
  
    const caution = weakElement === "목"
      ? "부족한 목 기운은 시작하는 힘과 성장 방향을 흔들 수 있습니다. 계획만 세우고 실행이 늦어지지 않도록 작은 시작을 반복하는 것이 좋습니다."
      : weakElement === "화"
        ? "부족한 화 기운은 표현력, 활력, 대인 온도를 약하게 만들 수 있습니다. 좋은 생각이 있어도 밖으로 드러내지 않으면 기회가 늦게 올 수 있습니다."
        : weakElement === "토"
          ? "부족한 토 기운은 안정감, 생활 기반, 돈을 모아두는 힘을 약하게 만들 수 있습니다. 수입보다 지출 구조와 생활 리듬을 먼저 정리해야 합니다."
          : weakElement === "금"
            ? "부족한 금 기운은 결단력과 정리 능력을 약하게 만들 수 있습니다. 인간관계, 계약, 돈 문제에서 기준선을 분명히 세워야 합니다."
            : weakElement === "수"
              ? "부족한 수 기운은 유연한 판단과 장기 전략을 약하게 만들 수 있습니다. 감정적으로 밀어붙이기보다 시간을 두고 정보를 모으는 습관이 필요합니다."
              : "사주의 부족한 부분은 삶의 약점이 아니라 관리해야 할 방향입니다. 강한 기운은 활용하고 약한 기운은 생활 습관으로 보완할 때 운이 안정됩니다.";
  
    return `
  [개인 사주 기반 심층 프로필]
  ${profileText}
  
  [성장환경과 인생 출발점]
  ${growthBackground}
  
  [초년 흐름]
  ${earlyLife}
  
  [중년 흐름]
  ${middleLife}
  
  [장년·말년 흐름]
  ${laterLife}
  
  [부모덕·자수성가 흐름]
  ${isSelfDriven
    ? "부모덕이나 외부 도움만 바라보기보다 스스로 길을 만드는 자수성가 흐름이 강합니다. 도움을 받더라도 결국 자기 실력과 책임으로 결과를 만들어야 운이 열립니다."
    : "부모, 가족, 주변 환경의 영향이 비교적 크게 작용할 수 있습니다. 다만 환경에만 기대면 운이 정체되므로, 중년 이후에는 자기 기준과 독립적인 선택이 중요해집니다."}
  
  [인간관계 흐름]
  ${relationship}
  
  [현실적으로 보완할 점]
  ${caution}
  `;
  }
  if (title.includes("개인 상담 기준")) {
    return `
[Premium 4.0 안내]
이 리포트는 단순히 사주 정보를 나열하는 문서가 아닙니다.
${name}님의 출생 정보와 현재 시점의 흐름을 바탕으로, 인생의 방향을 현실적으로 정리하기 위한 프리미엄 상담서입니다.

${profileText}

${buildBasicSajuSection()}

[상담서 활용법]
한 번에 전부 맞고 틀림을 판단하기보다, 반복해서 읽으면서 지금 자신의 상황과 맞는 부분을 표시해 두는 것이 좋습니다.
특히 재물, 직업, 관계, 건강, 사업, 부동산 흐름은 서로 따로 움직이지 않고 함께 연결되어 나타나는 경우가 많습니다.

[중요한 기준]
운이 좋다는 것은 아무 노력 없이 결과가 생긴다는 뜻이 아닙니다.
좋은 흐름을 알아차리고, 불리한 선택을 줄이며, 본인에게 맞는 방향으로 현실을 조정하는 힘이 커진다는 뜻입니다.
`;
  }
  if (title.includes("기본 사주")) {
    return buildBasicSajuSection();
  }
  
  if (title.includes("전체 운세")) {
    return buildTotalSection(basic).join("\n\n");
  }
  
  if (title.includes("오늘")) {
    return buildTodaySection(basic).join("\n\n");
  }

  if (title.includes("재물")) {
    return buildMoneySection(basic).join("\n\n");
  }

  if (title.includes("직업")) {
    return buildJobSection(basic).join("\n\n");
  }

  if (title.includes("사업")) {
    return buildBusinessSection(basic).join("\n\n");
  }

  if (title.includes("부동산")) {
    return buildRealEstateSection(basic).join("\n\n");
  }

  if (title.includes("연애")) {
    return `
[연애 심층 상담]
${name}님의 연애운은 감정의 시작보다 관계를 유지하는 방식이 중요합니다.
처음에는 마음이 움직여도, 시간이 지나면서 신뢰와 생활 리듬이 맞는지를 크게 보게 됩니다.

[반복되는 관계 패턴]
상대에게 맞추다가 지치거나, 반대로 마음을 쉽게 표현하지 못해 오해가 생길 수 있습니다.
좋은 인연은 감정을 급하게 밀어붙이는 사람이 아니라, ${name}님의 속도를 존중하는 사람입니다.

[연애 조언]
말하지 않아도 알아주길 기대하기보다, 불편한 점을 부드럽게 표현하는 연습이 필요합니다.
관계는 참는 것이 아니라 조율하는 것입니다.
`;
  }

  if (title.includes("결혼")) {
    return `
[결혼 심층 상담]
결혼운은 좋은 사람을 만나는 것만큼, 함께 생활을 유지할 수 있는 구조가 중요합니다.
${name}님은 감정만으로 결혼을 결정하기보다 가치관, 돈 관리, 가족 관계, 생활 습관을 함께 봐야 합니다.

[배우자 관계에서 중요한 점]
상대가 화려하거나 강한 사람보다, 안정적으로 대화가 되고 책임을 나눌 수 있는 사람이 좋습니다.
결혼 후에는 작은 불만을 쌓아두지 않는 것이 중요합니다.

[결혼 전략]
경제 기준, 부모가족 문제, 주거 계획, 일과 생활의 균형을 결혼 전부터 현실적으로 이야기하는 것이 좋습니다.
`;
  }

  if (title.includes("건강")) {
    return `
[건강 심층 상담]
건강운은 병을 단정하는 것이 아니라 몸이 약해지는 생활 패턴을 보는 것입니다.
${name}님은 무리할 때 바로 무너지는 흐름보다, 피로가 누적되다가 어느 순간 크게 나타나는 흐름을 조심해야 합니다.

[생활에서 조심할 점]
수면 부족, 불규칙한 식사, 스트레스성 긴장, 오래 참는 습관이 몸의 리듬을 흔들 수 있습니다.
몸이 보내는 작은 신호를 무시하면 회복 시간이 길어질 수 있습니다.

[건강 전략]
첫째, 수면 시간을 일정하게 유지하세요.
둘째, 몸이 피곤할 때 중요한 결정을 미루세요.
셋째, 정기검진과 기본 운동을 생활화하세요.
`;
  }

  if (title.includes("AI")) {
    return `
[Premium 4.0 종합 총평]
한마디로 말하면, ${name}님은 빠르게 모든 것을 바꾸는 사람이라기보다 흐름을 읽고 기준을 세울 때 인생이 안정되는 사람입니다.
돈, 일, 관계, 건강은 따로 떨어져 있지 않습니다.
돈이 불안하면 관계가 흔들리고, 일이 과하면 건강이 약해지며, 건강이 무너지면 판단력도 흐려집니다.

[앞으로의 핵심 전략]
앞으로는 더 많이 벌고, 더 많이 만나고, 더 많이 벌리는 것보다 내게 맞는 것을 남기고 불필요한 것을 줄이는 방향이 중요합니다.
좋은 운은 무리해서 잡는 것이 아니라 준비된 상태에서 받아들이는 것입니다.

[3년 실행 방향]
1년 차에는 정리와 회복이 중요합니다.
2년 차에는 실력과 수입 구조를 안정시키는 것이 좋습니다.
3년 차에는 자산화, 전문화, 장기 계획으로 연결해야 합니다.

[최종 총평]
${name}님에게 가장 중요한 말은 이것입니다.
지금부터의 운은 속도가 아니라 선택의 질에서 갈립니다.
남들이 좋다고 하는 길보다, 오래 버틸 수 있고 실제로 내 삶에 남는 길을 선택할 때 천운문 리포트의 의미가 현실에서 살아납니다.
`;
  }

  return `
[Premium 4.0 보강 상담]
이 장은 ${name}님의 실제 생활 선택에 연결해서 읽는 것이 중요합니다.
좋은 흐름은 키우고, 부담이 되는 선택은 줄이는 방향으로 활용해 주세요.

[실천 기준]
지금 당장 크게 바꾸기보다 작은 선택을 꾸준히 바꾸는 것이 좋습니다.
운은 방향을 알고 움직일 때 더 안정적으로 열립니다.
`;
}


