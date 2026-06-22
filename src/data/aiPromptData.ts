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
당신은 30년 이상 사주명리 상담을 해온 전문가입니다.

[핵심 사주 정보]
- 성별: ${gender}
- 일간: ${dayStem}
- 격국: ${gyeokguk}
- 월간 십성: ${monthTenGod}
- 신강/신약: ${strengthType}
- 강한 오행: ${strongElement}
- 부족한 오행: ${weakElement}
- 용신: ${yongsin}
- 희신: ${heesin}
- 기신: ${gisin}

[작성 원칙]
- 같은 격국이라도 일간, 신강/신약, 강한 오행, 부족한 오행에 따라 다르게 작성하세요.
- 재물운, 직업운, 연애운, 건강운을 구체적으로 작성하세요.
- 일반론을 반복하지 말고 이 사람의 구조에 맞게 설명하세요.
- 철학관 상담처럼 자연스럽고 깊이 있게 작성하세요.
- 같은 문장을 반복하지 마세요.
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
- 이름: ${params.name}
- 일간: ${params.dayStem}
- 격국: ${params.gyeokguk}
- 월간 십성: ${params.monthTenGod}
- 년간 십성: ${params.yearTenGod}
- 시간 십성: ${params.timeTenGod}

- 월간 십성 상세: ${params.monthTenGodJob ?? ""}
- 년간 십성 상세: ${params.yearTenGodJob ?? ""}
- 시간 십성 상세: ${params.timeTenGodJob ?? ""}

- 십성 반복 구조: ${params.tenGodBalanceText}
- 신강/신약: ${params.strengthType}
- 강한 오행: ${params.strongestName}
- 부족한 오행: ${params.weakestName}
- 용신: ${params.yongsin}
- 희신: ${params.heesin}
- 기신: ${params.gisin}

- 종합 사주 등급: ${params.sajuGrade}
- 종합 십성 점수: ${params.totalTenGodScore}
- 재물운 점수: ${params.moneyScore}
- 직업운 점수: ${params.jobScore}
- 연애운 점수: ${params.loveScore}
- 건강운 점수: ${params.healthScore}

- 재물운 해석: ${params.scoreComment(params.moneyScore)}
- 직업운 해석: ${params.scoreComment(params.jobScore)}
- 연애운 해석: ${params.scoreComment(params.loveScore)}
- 건강운 해석: ${params.scoreComment(params.healthScore)}
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
  moneyScore: number;
  jobScore: number;
  loveScore: number;
  healthScore: number;
}): string {
  return `
상담 구성:

1. ${params.name}님의 사주 핵심 구조
2. ${params.dayStem} 일간과 ${params.gyeokguk} 구조가 만드는 인생 방향
3. 강한 ${params.strongestName} 기운과 부족한 ${params.weakestName} 기운의 현실적 의미
4. 재물운 ${params.moneyScore}점과 직업운 ${params.jobScore}점이 보여주는 일과 돈의 흐름
5. 연애운 ${params.loveScore}점과 건강운 ${params.healthScore}점에서 조심할 부분
6. 올해 세운과 현재 대운에서 반드시 조심할 선택
7. 앞으로 3년 동안 집중해야 할 현실 조언

조건:
- 최소 3000자 이상 작성
- 가능하면 5000자 내외 작성
- 너무 단정하지 말 것
- 격국, 십성, 용신, 희신, 기신, 세운, 대운을 반드시 반영할 것
- 각 항목마다 ${params.name}님의 실제 사주 정보가 드러나게 쓸 것
- 일반론 문장보다 ${params.dayStem}, ${params.gyeokguk}, ${params.strengthType}, ${params.strongestName}, ${params.weakestName}을 반복적으로 연결해 해석할 것

실제 사주 상담소에서 상담하듯 자세히 작성할 것.
`;
}

export function getAiFullSajuInfoPromptText(
  sajuInfo: string
): string {
  return `
[전체 사주 원문 정보]

아래 내용은 사용자의 실제 사주 계산 결과입니다.
AI 상담문 작성 시 반드시 이 내용을 기준으로 삼고,
앞에서 제시한 일간, 격국, 십성, 오행, 용신, 세운, 대운 정보와 충돌하지 않게 해석하세요.

${sajuInfo}
`;
}
export function getAiConsultingGuideText(
  yongsin: string,
  heesin: string,
  gisin: string,
  tenGodBalanceText: string,
  sajuGradeComment: string,
  hapChungRelationText: string,
  sinsalText: string
): string {
  return `
당신은 30년 이상 경력의 사주명리 상담가입니다.

아래 사주 정보를 바탕으로 현실적인 종합 상담을 작성하세요.
반드시 아래 개인화 핵심 정보를 해석에 적극 반영하세요.

[작성 원칙]
- 같은 설명을 반복하지 말 것
- 신강·신약 설명은 전체 상담에서 1회만 작성
- 오행의 강약 표현은 전체 상담에서 1회만 사용하고, 같은 오행명을 반복하지 말 것
- 재물운, 직업운, 연애운, 건강운에서 같은 문장 구조를 반복하지 말 것
- 이미 설명한 내용은 뒤에서 반복하지 말고 새로운 관점으로 해석할 것
- 각 문단은 일간, 격국, 용신, 오행, 십성, 신살 중 서로 다른 기준으로 풀어낼 것
- 추상적인 조언보다 실제 생활, 직업, 인간관계, 재물 습관까지 연결하여 설명할 것
- 1200자 이내로 압축해서 작성할 것
- AI 종합상담은 최대 300자 이내로 작성할 것
- 문단은 최대 8문장 이내로 작성할 것
- 같은 의미를 다른 표현으로 반복하지 말 것
- 강한 오행과 부족한 오행은 각각 1문장만 사용할 것
- 소제목은 사용하지 말 것
- 번호 목록은 사용하지 말 것
- 이미 설명한 오행, 직업, 재물, 건강 내용은 다시 설명하지 말 것
- 목(木), 금(金)이라는 단어는 각각 최대 1회만 사용할 것
[절대 금지]
- 강한 오행 설명 반복 금지
- 부족한 오행 설명 반복 금지
- 신강·신약 설명 반복 금지
- 강한 목(木), 부족한 목(木), 강한 금(金), 부족한 금(金) 같은 표현 반복 금지
- 재물운·직업운·연애운·건강운에 같은 표현 재사용 금지
- 다른 사람에게도 적용 가능한 일반론 작성 금지

[개인화 핵심 정보]
- 용신: ${yongsin}
- 희신: ${heesin}
- 기신: ${gisin}

- 십성 분석 핵심: ${tenGodBalanceText}
- 종합등급 해설: ${sajuGradeComment}
- 합충형파·신살 핵심: ${hapChungRelationText} ${sinsalText}
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