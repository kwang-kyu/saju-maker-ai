export function getAiPromptCoreText(
  dayStem: string,
  gyeokguk: string,
  monthTenGod: string,
  strengthType: string,
  strongElement: string,
  weakElement: string,
  yongsin: string,
  heesin: string,
  gisin: string,
  gender: string
): string {
  return `
당신은 30년 이상 실제 상담을 해온 철학관 원장입니다.

아래 정보는 고객에게 설명하기 위한 문장이 아니라,
상담자가 속으로 참고하는 최소 자료입니다.

[내부 참고]
- 성별: ${gender}
- 중심 성향: ${dayStem}
- 인생 구조 참고: ${gyeokguk}
- 월간 성향 참고: ${monthTenGod}
- 기운 상태 참고: ${strengthType}
- 강하게 드러나는 성향: ${strongElement}
- 보완이 필요한 성향: ${weakElement}
- 도움이 되는 방향 참고: ${yongsin}, ${heesin}
- 주의할 방향 참고: ${gisin}

[작성 원칙]
사주 정보를 설명하지 말고, 그 사람의 현실 문제를 상담하십시오.
재물운, 직업운, 연애운, 건강운을 각각 나누어 쓰지 마십시오.
돈, 일, 사람, 몸의 흐름을 하나의 인생 이야기처럼 연결하십시오.
전문용어는 가능한 한 쓰지 말고, 현실적인 말로 바꾸어 설명하십시오.
보고서 요약 말투가 아니라 실제 상담 말투로 작성하십시오.
`;
}

export function getAiPersonalInfoPromptText(params: {
  name: string;
  dayStem: string;
  gyeokguk: string;
  monthTenGod: string;
  yearTenGod: string;
  timeTenGod: string;
  monthTenGodJob?: string;
  yearTenGodJob?: string;
  timeTenGodJob?: string;
  tenGodBalanceText: string;
  strengthType: string;
  strongestName: string;
  weakestName: string;
  yongsin: string;
  heesin: string;
  gisin: string;
  sajuGrade: string;
  totalTenGodScore: number;
  moneyScore: number;
  jobScore: number;
  loveScore: number;
  healthScore: number;
    scoreComment: (score: number) => string;
}): string {
  return `
  [상담 대상 내부 참고]
  
  이름: ${params.name}
  
  성향 참고:
  ${params.tenGodBalanceText}
  
  기본 흐름 참고:
  - 중심 성향: ${params.dayStem}
  - 인생 구조 참고: ${params.gyeokguk}
  - 강하게 드러나는 부분: ${params.strongestName}
  - 보완이 필요한 부분: ${params.weakestName}
  
  상담 판단용 내부 참고값:
  - 돈 흐름: ${params.moneyScore}
  - 일 흐름: ${params.jobScore}
  - 관계 흐름: ${params.loveScore}
  - 몸 상태: ${params.healthScore}
  
  주의:
  위 참고값은 고객에게 절대로 말하지 마십시오.
  숫자, 점수, 등급, 항목별 해석은 출력하지 마십시오.
  이 자료는 지금 가장 중요한 문제 하나를 고르기 위한 내부 판단용입니다.
  `;
}

export function getAiConsultingStructureText(params: {
  name: string;
  dayStem: string;
  gyeokguk: string;
  strengthType: string;
  strongestName: string;
  weakestName: string;
  yongsin: string;
  heesin: string;
  gisin: string;
}): string {
  return `
당신은 사주 보고서를 읽어주는 사람이 아니라 실제 철학관에서 오래 상담해 온 원장입니다.
아래 정보는 고객에게 그대로 설명하기 위한 문장이 아니라, 상담자가 속으로 참고하는 최소 자료입니다.

[내부 참고]
이름: ${params.name}
중심 기질: ${params.dayStem}
전체 구조: ${params.gyeokguk}
기운의 상태: ${params.strengthType}
강하게 드러나는 흐름: ${params.strongestName}
보완해야 할 흐름: ${params.weakestName}
도움 되는 방향: ${params.yongsin}, ${params.heesin}
주의할 방향: ${params.gisin}

[상담 목표]
상담의 목적은 사주 구조를 설명하는 것이 아닙니다.
현재 이 사람의 삶에서 가장 먼저 다뤄야 할 핵심 문제 하나를 찾아 실제 상담처럼 말하는 것입니다.
재물, 직업, 인간관계, 건강을 각각 따로 설명하지 말고, 핵심 문제 하나를 중심으로 자연스럽게 연결하십시오.

[작성 방식]
첫 문장은 반드시 "한마디로 말하면"으로 시작하십시오.
첫 문장은 한 문장으로 현재 인생의 핵심 문제를 단정적으로 말하십시오.
처음 3문장 안에서 현재 가장 중요한 문제 하나를 분명히 말하십시오.
그 문제를 중심으로 왜 돈, 일, 사람, 건강의 흐름이 함께 흔들리거나 좋아질 수 있는지 설명하십시오.
같은 내용을 다른 표현으로 다시 말하지 마십시오.
이미 말한 원인, 성향, 조언은 다시 반복하지 마십시오.
상담자는 분석표를 읽는 사람이 아니라, 고객 앞에서 직접 말하는 사람처럼 자연스럽게 이어가십시오.

[강력 금지]
소제목을 쓰지 마십시오.
번호를 쓰지 마십시오.
체크리스트를 쓰지 마십시오.
구분선을 쓰지 마십시오.
점수, 등급, 별점은 절대로 언급하지 마십시오.
재물운, 직업운, 연애운, 건강운을 제목처럼 나누어 설명하지 마십시오.
"이 사주는", "구조입니다", "기운입니다", "점입니다" 같은 보고서식 표현을 반복하지 마십시오.
비견격, 신강, 용신, 희신, 기신, 오행, 화, 토, 목, 금, 수 같은 전문용어는 전체 상담에서 합산 2회 이하만 사용하십시오.
전문용어를 쓰더라도 바로 현실적인 말로 바꾸어 설명하십시오.
같은 단어를 반복하지 말고, 이미 사용한 핵심 표현은 다시 쓰지 마십시오.
절대로 "재물운은", "직업운은", "연애운은", "건강운은"처럼 항목별 설명을 하지 마십시오.

반드시 하나의 상담 이야기처럼 이어서 설명하십시오.

상담 중에는
"그리고",
"반대로",
"그래서",
"다만",
"특히",
"결국"
같은 연결어를 적극 사용하십시오.

상담이 끝날 때까지 하나의 흐름으로 이야기하십시오.
사주 용어보다 현실 언어를 사용하십시오.

예)

비견격 → 혼자 해결하려는 성향
신강 → 스스로 밀어붙이는 힘
용신 → 삶을 안정시키는 요소
희신 → 도움이 되는 환경
기신 → 반복되는 약점
일간 → 타고난 성향
[상담 내용]
지금 가장 중요한 문제는 하나만 선택하십시오.
예를 들어 무리한 확장, 돈 관리, 협력 부족, 고집, 과로, 감정 표현, 관계 갈등, 일의 방향성 중 가장 핵심이 되는 하나를 고르십시오.
그 하나를 중심으로 실제 생활에서 어떤 일이 반복될 수 있는지 말하십시오.
앞으로 3년 전략은 1년차, 2년차, 3년차로 나열하지 말고 하나의 흐름으로 자연스럽게 말하십시오.
"올해는", "내년에는", "그다음에는" 정도의 자연스러운 표현만 사용하십시오.
마지막은 실제 상담을 마무리하듯 따뜻하지만 단호하게 정리하십시오.
마지막 문단은 반드시 "최종 총평"으로 시작하십시오.
같은 핵심 단어(예: 균형, 추진력, 고집, 자신감, 신뢰 등)를 2회 이상 반복하지 마십시오.
같은 의미를 다른 표현으로 바꾸어 설명하십시오.
같은 성향을 여러 문단에서 다시 설명하지 마십시오.
앞 문단에서 사용한 핵심 표현은 다음 문단에서 사용하지 마십시오.
상담자는 고객이

"맞아요."

"정말 제 이야기네요."

라고 느끼도록 상담하십시오.

보고서를 설명하지 말고

사람을 상담하십시오.
마지막 문장은 상담을 마무리하는 한마디로 강하게 끝내십시오.

[분량]
전체 상담은 700자 이상 1000자 이하로 작성하십시오.
문단은 4개 이하로 작성하십시오.
각 문단은 서로 다른 내용을 말해야 하며, 앞 문단의 내용을 반복하지 마십시오.
`;
}
export function getAiFullSajuInfoPromptText(
  sajuInfo: string
): string {


  return `
[전체 사주 원본 정보]

아래 내용은 상담자가 미리 읽고 이해하는 참고자료입니다.

절대로 이 자료를 그대로 설명하거나 요약하지 마십시오.

사주 용어를 고객에게 풀어 설명하는 것이 목적이 아닙니다.

먼저 자료 전체를 읽은 뒤,
'이 사람 인생에서 지금 가장 중요한 문제는 무엇인가'
를 스스로 한 가지 선택하십시오.

그 핵심 문제를 중심으로 상담을 시작하십시오.

돈, 일, 인간관계, 건강은 각각 따로 설명하지 말고,
그 핵심 문제 때문에 서로 어떤 영향을 주고받는지
하나의 이야기처럼 연결해서 설명하십시오.

상담자는 보고서를 읽는 사람이 아니라,
30년 이상 상담한 철학관 원장입니다.

자료를 설명하지 말고,
자료를 바탕으로 새로운 상담을 진행하십시오.

${sajuInfo}
`;
}

export function optimizePremiumReportText(text: string): string {

  if (!text) return "";

  const repeatedKeywords = [
    "비견격",
    "겁재격",
    "식신격",
    "상관격",
    "편재격",
    "정재격",
    "편관격",
    "정관격",
    "편인격",
    "정인격",
    "신약 구조",
    "신강 구조",
    "강한 목(木)",
    "강한 화(火)",
    "강한 토(土)",
    "강한 금(金)",
    "강한 수(水)",
    "보완이 필요한 오행",
    "부족한 화(火)",
    "부족한 토(土)",
    "부족한 금(金)",
    "부족한 수(水)",
    "용신",
    "희신",
    "기신",
  ];

  const meaningGroups = [
    ["협력", "함께", "주변 사람", "사람들과", "관계 속에서"],
    ["시스템", "구조", "체계", "루틴", "관리 방식"],
    ["독립성", "자기주도성", "주도성", "스스로", "혼자 결정"],
    ["재물", "돈", "수익", "현금흐름", "소득"],
    ["직업", "일", "업무", "커리어", "직장"],
    ["연애", "관계", "배우자", "인연", "감정"],
    ["건강", "체력", "컨디션", "생활 리듬", "몸"],
  ];

  let result = text;
  result = result
  .replaceAll("비견격", "자기주도 성향")
  .replaceAll("신강", "의지가 강한 구조")
  .replaceAll("용신", "보완 방향")
  .replaceAll("희신", "도움이 되는 방향")
  .replaceAll("기신", "주의할 방향")
  .replaceAll("화(火)", "추진력")
  .replaceAll("토(土)", "안정감")
  .replaceAll("토의 기운", "안정감")
  .replaceAll("화의 기운", "추진력");
  repeatedKeywords.forEach((keyword) => {
    let count = 0;
    result = result.replaceAll(keyword, () => {
      count += 1;
      return count <= 2 ? keyword : "";
    });
  });

  const paragraphs = result
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const groupCount: Record<string, number> = {};
  const seen = new Set<string>();
  const optimized: string[] = [];

  paragraphs.forEach((paragraph) => {
    const cleanKey = paragraph
      .replace(/[0-9]/g, "")
      .replace(/[^\uAC00-\uD7A3a-zA-Z]/g, "")
      .slice(0, 45);

    if (seen.has(cleanKey)) return;
    seen.add(cleanKey);

    const matchedGroup = meaningGroups.find((group) =>
      group.some((word) => paragraph.includes(word))
    );

    if (matchedGroup) {
      const groupName = matchedGroup[0];
      groupCount[groupName] = (groupCount[groupName] || 0) + 1;

      if (groupCount[groupName] > 3 && paragraph.length < 120) {
        return;
      }
    }

    optimized.push(paragraph);
  });

  return optimized
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .replace(/ ,/g, ",")
    .replace(/ \./g, ".")
    .replace(/\(\s+\)/g, "")
    .trim();
}

const summaryPatterns: Record<string, string> = {
  협력:
    "이 사주는 독단보다 사람과의 협력 구조 속에서 운이 확장되는 특징이 있습니다.",

  독립성:
    "스스로 방향을 결정하고 책임지는 환경에서 잠재력이 크게 발휘되는 구조입니다.",

  재물:
    "재물은 단기 수익보다 자신의 강점을 장기적으로 축적할 때 더욱 안정적으로 형성됩니다.",

  직업:
    "직업운은 한 분야를 꾸준히 발전시키면서 전문성을 높일수록 상승하는 흐름입니다.",

  연애:
    "인연은 감정의 속도보다 신뢰와 공감이 형성될 때 더욱 깊어지는 특징이 있습니다.",

  건강:
    "건강은 무리한 생활 패턴보다 규칙적인 생활 리듬을 유지하는 것이 핵심 과제가 됩니다.",
};

export function compressMeaningParagraphs(
  text: string
): string {
  if (!text) return "";

  let result = text;

  Object.entries(summaryPatterns).forEach(
    ([key, summary]) => {
      const count =
        (result.match(new RegExp(key, "g")) || [])
          .length;

      if (count >= 3) {
        result += `\n\n${summary}`;
      }
    }
  );

  return result;
}
const eventStoryMap: Record<string, string> = {
  협력:
    "이 사주는 혼자 밀어붙일 때보다 사람과 조직을 활용할 때 운의 상승폭이 커집니다. 특히 소개, 인맥, 협업, 동업 형태에서 예상보다 큰 기회가 만들어질 가능성이 있습니다.",

  독립성:
    "다른 사람의 지시를 따르는 구조보다 스스로 판단하고 책임지는 환경에서 실력과 성과가 크게 상승하는 특징이 있습니다.",

  재물:
    "재물운은 단기적인 한 번의 수익보다 자신의 전문성과 경험이 축적되면서 점진적으로 커지는 구조입니다.",

  직업:
    "직업운은 여러 분야를 자주 바꾸기보다 한 분야를 깊이 있게 파고들수록 운이 상승하는 특징이 있습니다.",

  연애:
    "인연은 빠르게 시작되는 관계보다 신뢰와 공감이 쌓이면서 깊어지는 관계에서 안정적으로 이어질 가능성이 높습니다.",

  건강:
    "건강운은 큰 질병 자체보다 생활 리듬이 무너질 때 컨디션 저하가 반복되기 쉬우므로 규칙적인 습관 관리가 중요합니다.",
};

export function replaceRepeatedThemesWithStory(
  text: string
): string {
  if (!text) return "";

  let result = text;

  Object.entries(eventStoryMap).forEach(
    ([keyword, story]) => {
      const count =
        (result.match(new RegExp(keyword, "g")) || [])
          .length;

      if (count >= 4) {
        const lines = result
          .split("\n")
          .filter(
            (line) =>
              !line.includes(keyword) ||
              line.length > 120
          );

        result = lines.join("\n");
        result += `\n\n${story}`;
      }
    }
  );
  result = result
    .replace(/김광규님은/g, "당신은")
    .replace(/중요합니다\./g, "무엇보다 신경 써야 합니다.")
    .replace(/좋습니다\./g, "긍정적으로 이어질 가능성이 큽니다.")
    .replace(/필요합니다\./g, "실천하는 것이 좋겠습니다.")
    .replace(/특히\s+특히/g, "특히")
    .replace(/또한\s+또한/g, "또한")
    .replace(/따라서\s+따라서/g, "따라서")
    .replace(/한편\s+한편/g, "한편")
    .replace(/그러므로\s+그러므로/g, "그러므로");
  return result;
}
export function getTimingEventText(params: {
  strengthType: string;
  yongsin: string;
  gisin: string;
  currentYear: number;
  daeunStartYear: number;
}): string {
  const { strengthType, yongsin, gisin, currentYear, daeunStartYear } = params;

  const ageFlow =
    currentYear - daeunStartYear <= 2
      ? "대운 전환 초기"
      : currentYear - daeunStartYear <= 5
      ? "대운 적응기"
      : "대운 안정기";

  const strengthAdvice =
    strengthType.includes("신약")
      ? "무리하게 확장하기보다 사람, 제도, 자격, 시스템을 빌려 운을 키우는 시기입니다."
      : "스스로 주도권을 잡고 방향을 결정할수록 성과가 커지는 시기입니다.";

  return `
[사건 발생 시기 해석]

현재 흐름은 ${ageFlow}에 해당합니다.

이 시기에는 ${yongsin}의 기운을 살리는 선택이 중요하고, ${gisin}의 기운이 강해지는 환경은 피하는 것이 좋습니다.

${strengthAdvice}

특히 대운이 바뀐 직후 1~2년은 직업, 재물, 인간관계의 방향이 새롭게 정리되는 시기이므로 성급한 확장보다 흐름을 관찰하며 기반을 다지는 것이 좋습니다.
`;
}


export function getCategoryTimingEventText(params: {
  category: "재물" | "직업" | "연애" | "건강";
  tenGod: string;
  yongsin: string;
  gisin: string;
  strengthType: string;
}): string {
  const {
    category,
    tenGod,
    yongsin,
    gisin,
    strengthType,
  } = params;

  const baseMap: Record<string, string> = {
    재물:
      "재물운은 단기 수익보다 돈의 흐름을 정리하고 기반을 다지는 시기가 중요합니다.",
    직업:
      "직업운은 새로운 기회보다 현재 역할을 확장하는 과정에서 발전 가능성이 커집니다.",
    연애:
      "연애운은 감정보다 신뢰와 안정감을 쌓는 과정에서 깊어질 가능성이 높습니다.",
    건강:
      "건강운은 큰 변화보다 생활 리듬과 피로 관리가 핵심 과제가 됩니다.",
  };

  const strengthText =
    strengthType.includes("신약")
      ? "무리한 확장보다 주변 도움과 시스템을 활용할 때 안정됩니다."
      : "스스로 결정하고 주도권을 잡을 때 결과가 크게 나타납니다.";

  return `
[${category} 사건 시기]

${baseMap[category]}

${category} 영역에서는 ${tenGod}의 기운이 작용하는 시기입니다.

${yongsin}의 방향을 살리면 흐름이 안정되고,
${gisin}의 기운이 강해지는 선택은 부담으로 이어질 수 있습니다.

${strengthText}
`;
}


export function getPremiumActionTimingText(params: {
  daeunTenGod: string;
  seunTenGod: string;
  yongsin: string;
  gisin: string;
  strengthType: string;
}): string {
  const { daeunTenGod, seunTenGod, yongsin, gisin, strengthType } = params;

  const actionType =
    seunTenGod.includes("재")
      ? "돈, 계약, 투자, 수익 구조를 점검해야 하는 시기"
      : seunTenGod.includes("관")
      ? "직업, 책임, 직책, 조직 내 역할 변화가 생기기 쉬운 시기"
      : seunTenGod.includes("인")
      ? "공부, 자격, 문서, 준비, 기반 정리에 유리한 시기"
      : seunTenGod.includes("식") || seunTenGod.includes("상")
      ? "표현, 영업, 콘텐츠, 결과물 생산이 중요한 시기"
      : "인간관계, 경쟁, 독립성, 자기 방향성이 강해지는 시기";

  const daeunText =
    daeunTenGod === seunTenGod
      ? "대운과 세운의 십성이 같은 방향으로 겹치므로 해당 사건성이 강하게 드러날 수 있습니다."
      : `대운의 ${daeunTenGod} 흐름 위에 세운의 ${seunTenGod} 기운이 들어오므로, 장기 흐름과 올해 사건이 서로 교차하는 시기입니다.`;

  const strengthText =
    strengthType.includes("신약")
      ? "신약 구조에서는 무리한 확장보다 준비, 협력, 제도권 활용이 먼저입니다."
      : "신강 구조에서는 본인이 직접 결정하고 움직일 때 결과가 빠르게 나타납니다.";

  return `
[프리미엄 행동 타이밍]

올해는 ${actionType}입니다.

${daeunText}

이 시기에는 ${yongsin}의 방향을 살리는 선택은 기회가 되고,
${gisin}의 기운이 강해지는 선택은 부담이나 반복 문제로 이어질 수 있습니다.

${strengthText}

따라서 지금은 단순히 운이 좋다, 나쁘다로 볼 것이 아니라
무엇을 시작하고, 무엇을 줄이고, 누구와 함께할지를 구분해야 하는 시기입니다.
`;
}

export function getAdvancedAnalysisText(params: {
  dayGanZhi: string;
  gyeokguk: string;
  strengthType: string;
  dayMasterAdvancedText: string;
  geokgukAdvancedText: string;
  combinationAdvancedText: string;
}): string {
  return `
[고급 사주 해석]

- 일주 기준: ${params.dayGanZhi}
- 격국: ${params.gyeokguk}
- 신강/신약: ${params.strengthType}

[일간 심층 분석]
${params.dayMasterAdvancedText}

[격국 심층 분석]
${params.geokgukAdvancedText}

[격국 × 신강신약 조합 분석]
${params.combinationAdvancedText}
`;
}

export function getBasicSajuReportHeaderText(params: {
  name: string;
  calendarType: string;
  solarDate: string;
  lunarDate: string;
  birthTime: string;
  gender: string;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  dayMasterAdvancedText: string;
}): string {
  return `
🔮 ${params.name}님의 기본 사주 리포트

입력한 달력: ${params.calendarType === "solar" ? "양력" : "음력"}
양력 생년월일: ${params.solarDate}
음력 생년월일: ${params.lunarDate}
태어난 시간: ${params.birthTime}
성별: ${params.gender === "male" ? "남성" : "여성"}

────────────

☯ 사주팔자
년주: ${params.yearGanZhi}
월주: ${params.monthGanZhi}
일주: ${params.dayGanZhi}
시주: ${params.timeGanZhi}

🌟 나의 일간 해석
나의 일간: ${String(params.dayGanZhi).charAt(0)}
${params.dayMasterAdvancedText}
────────────
`;
}

export function getLifePatternSectionText(params: {
  geokgukAdvancedText: string;
  dynamicLifePatternText: string;
  combinationAdvancedText: string;
}): string {
  return `
🏛 격국 해석

${params.geokgukAdvancedText}

────────────

🌱 맞춤 생활·재물·직업 패턴

${params.dynamicLifePatternText}

────────────

⚖ 신강·신약 × 격국 조합

${params.combinationAdvancedText}

────────────
`;
}

export function getFiveElementReportSectionText(params: {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  weakestName: string;
  strongestName: string;
  yongsin: string;
  heesin: string;
  gisin: string;
  yongsinDescription: string;
  strengthType: string;
  strengthScore: number;
  strengthReason: string;
}): string {
  return `
🌳 오행 분석

목(木): ${params.wood}
화(火): ${params.fire}
토(土): ${params.earth}
금(金): ${params.metal}
수(水): ${params.water}

부족한 오행: ${params.weakestName}
강한 오행: ${params.strongestName}
용신 : ${params.yongsin}
희신 : ${params.heesin}
기신 : ${params.gisin}
────────────
${params.yongsinDescription}

[전문가 분석] 일간 신강·신약 판단

판정: ${params.strengthType}
점수: ${params.strengthScore}

판단 이유:
${params.strengthReason}

────────────
`;
}