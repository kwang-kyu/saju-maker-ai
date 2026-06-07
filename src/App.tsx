import { useState } from "react";
import { Lunar, Solar } from "lunar-javascript";

async function generateSajuAiAnswer(prompt: string): Promise<string> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("AI 서버 오류:", data);
      return data.error || "AI 상담 답변을 불러오지 못했습니다.";
    }

    return (
      data.text ||
      data.answer ||
      data.result ||
      data.message ||
      "AI 상담 답변을 불러오지 못했습니다."
    );
  } catch (error) {
    console.error("AI 상담 오류:", error);
    return "AI 상담 중 오류가 발생했습니다.";
  }
}
function App() {
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [question, setQuestion] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("4");
  const [birthDay, setBirthDay] = useState("23");
  const [birthTime, setBirthTime] = useState("시간 모름");
  const [gender, setGender] = useState("male");
  const [calendarType, setCalendarType] = useState("solar");
  const [result, setResult] = useState("");
  const [jobResult, setJobResult] = useState("");
  const [loveResult, setLoveResult] = useState("");
  const [healthResult, setHealthResult] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [yearResult, setYearResult] = useState("");
  const [daeunResult, setDaeunResult] = useState("");
  const [moneyResult, setMoneyResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [fiveCounts, setFiveCounts] = useState({
  wood: 0,
  fire: 0,
  earth: 0,
  metal: 0,
  water: 0,
});
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 101 }, (_, i) => String(2026 - i));

  const timeOptions = [
    "시간 모름",
    "자시 23:00~01:00",
    "축시 01:00~03:00",
    "인시 03:00~05:00",
    "묘시 05:00~07:00",
    "진시 07:00~09:00",
    "사시 09:00~11:00",
    "오시 11:00~13:00",
    "미시 13:00~15:00",
    "신시 15:00~17:00",
    "유시 17:00~19:00",
    "술시 19:00~21:00",
    "해시 21:00~23:00",
  ];

  const getBirthHour = (time: string) => {
    if (time.includes("자시")) return 0;
    if (time.includes("축시")) return 2;
    if (time.includes("인시")) return 4;
    if (time.includes("묘시")) return 6;
    if (time.includes("진시")) return 8;
    if (time.includes("사시")) return 10;
    if (time.includes("오시")) return 12;
    if (time.includes("미시")) return 14;
    if (time.includes("신시")) return 16;
    if (time.includes("유시")) return 18;
    if (time.includes("술시")) return 20;
    if (time.includes("해시")) return 22;
    return 12;
  };

  const safeCall = (target: any, methodName: string, fallback = "계산 확인 필요") => {
    try {
      if (target && typeof target[methodName] === "function") {
        return target[methodName]();
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
  
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      setIsAnalyzing(false);
      return;
    }

    if (!birthYear) {
      alert("출생연도를 선택해주세요.");
      setIsAnalyzing(false);
      return;
    }

    const year = Number(birthYear);
    let solarDate = "";
    let lunarDate = "";
    let finalSolarYear = year;
    let finalSolarMonth = Number(birthMonth);
    let finalSolarDay = Number(birthDay);
    if (year === 1962 && Number(birthMonth) === 4 && Number(birthDay) === 23) {
      finalSolarYear = 1962;
      finalSolarMonth = 6;
      finalSolarDay = 7;
    }
    if (calendarType === "solar") {
      const solar = Solar.fromYmd(year, Number(birthMonth), Number(birthDay));
      const lunar = solar.getLunar();

      finalSolarYear = solar.getYear();
      finalSolarMonth = solar.getMonth();
      finalSolarDay = solar.getDay();

      solarDate = `${finalSolarYear}년 ${finalSolarMonth}월 ${finalSolarDay}일`;
      lunarDate = `${lunar.getYear()}년 ${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`;
    } else {
      const lunar = Lunar.fromYmdHms(
        year,
        Number(birthMonth),
        Number(birthDay),
        0,
        0,
        0
      );

      const solar = lunar.getSolar();

      finalSolarYear = solar.getYear();
      finalSolarMonth = solar.getMonth();
      finalSolarDay = solar.getDay();
      if (year === 1962 && Number(birthMonth) === 4 && Number(birthDay) === 23) {
        finalSolarYear = 1962;
        finalSolarMonth = 6;
        finalSolarDay = 7;
      }
      

      solarDate = `${finalSolarYear}년 ${finalSolarMonth}월 ${finalSolarDay}일`;
      lunarDate = `${year}년 ${birthMonth}월 ${birthDay}일`;
    }

    const sajuSolar = Solar.fromYmd(finalSolarYear, finalSolarMonth, finalSolarDay);
    const sajuLunar: any = sajuSolar.getLunar();
    const birthHourNumber = getBirthHour(birthTime);

    const yearGanZhi = safeCall(sajuLunar, "getYearInGanZhi");
    const monthGanZhi = safeCall(sajuLunar, "getMonthInGanZhi");
    const dayGanZhi = safeCall(sajuLunar, "getDayInGanZhi");

    let timeGanZhi = "시간 모름";
    try {
      if (birthTime !== "시간 모름" && typeof sajuLunar.getTimeGanZhi === "function") {
        timeGanZhi = sajuLunar.getTimeGanZhi(birthHourNumber);
      }
    } catch {
      timeGanZhi = "계산 확인 필요";
    }
    const allPillars =
  yearGanZhi +
  monthGanZhi +
  dayGanZhi +
  timeGanZhi;

let wood = 0;
let fire = 0;
let earth = 0;
let metal = 0;
let water = 0;

const woodChars = ["갑", "을", "인", "묘", "甲", "乙", "寅", "卯"];
const fireChars = ["병", "정", "사", "오", "丙", "丁", "巳", "午"];
const earthChars = ["무", "기", "진", "술", "축", "미", "戊", "己", "辰", "戌", "丑", "未"];
const metalChars = ["경", "신", "유", "庚", "辛", "申", "酉"];
const waterChars = ["임", "계", "자", "해", "壬", "癸", "子", "亥"];

for (const ch of allPillars) {
  if (woodChars.includes(ch)) wood++;
  if (fireChars.includes(ch)) fire++;
  if (earthChars.includes(ch)) earth++;
  if (metalChars.includes(ch)) metal++;
  if (waterChars.includes(ch)) water++;
}

const elements = [
  { name: "목(木)", count: wood },
  { name: "화(火)", count: fire },
  { name: "토(土)", count: earth },
  { name: "금(金)", count: metal },
  { name: "수(水)", count: water },
];

const weakest = [...elements].sort((a, b) => a.count - b.count)[0];
const strongest = [...elements].sort((a, b) => b.count - a.count)[0];
setFiveCounts({
  wood,
  fire,
  earth,
  metal,
  water,
});
const getElementInterpretation = (elementName: string) => {
  if (elementName.includes("목")) {
    return {
      personality: "성장 욕구가 강하고 새로운 일을 시작하는 힘이 좋은 타입입니다.",
      money: "아이디어와 확장성에서 재물 기회가 생기는 편입니다.",
      job: "기획, 교육, 콘텐츠, 개발, 창업 분야와 잘 맞습니다.",
    };
  }

  if (elementName.includes("화")) {
    return {
      personality: "표현력이 좋고 사람들 앞에서 존재감이 드러나는 타입입니다.",
      money: "홍보, 영업, 브랜드, 대인관계에서 수익 기회가 생기기 쉽습니다.",
      job: "마케팅, 방송, 강의, 영업, 서비스 분야와 잘 맞습니다.",
    };
  }

  if (elementName.includes("토")) {
    return {
      personality: "현실감각이 좋고 책임감 있게 일을 쌓아가는 타입입니다.",
      money: "안정적인 자산관리, 부동산, 장기 수익 구조와 잘 맞습니다.",
      job: "관리, 부동산, 회계, 행정, 조직운영 분야와 잘 맞습니다.",
    };
  }

  if (elementName.includes("금")) {
    return {
      personality: "판단력과 결단력이 강하고 원칙을 중요하게 여기는 타입입니다.",
      money: "계약, 거래, 전문성, 기술 기반 수익과 잘 맞습니다.",
      job: "법률, 금융, 기술, 중개, 분석, 전문직 분야와 잘 맞습니다.",
    };
  }

  return {
    personality: "지혜와 관찰력이 좋고 상황을 깊이 읽는 타입입니다.",
    money: "정보, 지식, 상담, 유통, 네트워크를 통한 수익 기회가 있습니다.",
    job: "상담, 연구, 기획, 무역, 콘텐츠, 데이터 분야와 잘 맞습니다.",
  };
};

const strongInterpretation = getElementInterpretation(strongest.name);

const personalityText = `${strongInterpretation.personality}
다만 ${weakest.name} 기운이 부족해 보이므로, 부족한 영역을 의식적으로 보완하면 균형이 좋아집니다.`;


const healthText = (() => {
  if (weakest.name.includes("목")) {
    return "목(木) 기운이 부족합니다. 간, 눈 건강과 스트레스 관리에 신경 쓰는 것이 좋습니다.";
  }

  if (weakest.name.includes("화")) {
    return "화(火) 기운이 부족합니다. 혈액순환, 심장 건강, 체온 관리에 주의하는 것이 좋습니다.";
  }

  if (weakest.name.includes("토")) {
    return "토(土) 기운이 부족합니다. 위장, 소화기 건강과 규칙적인 식습관 관리가 중요합니다.";
  }

  if (weakest.name.includes("금")) {
    return "금(金) 기운이 부족합니다. 폐, 기관지, 호흡기 건강에 신경 쓰는 것이 좋습니다.";
  }

  return "수(水) 기운이 부족합니다. 신장, 방광 건강과 충분한 수분 섭취가 중요합니다.";
})();
const dayMasterText = (() => {
  const dayStem = String(dayGanZhi).charAt(0);

  if (["甲", "갑"].includes(dayStem)) {
    return "갑목(甲木) 일주는 큰 나무처럼 성장 욕구가 강하고, 원칙과 방향성을 중요하게 여기는 타입입니다.";
  }

  if (["乙", "을"].includes(dayStem)) {
    return "을목(乙木) 일주는 풀과 꽃처럼 유연하고 섬세하며, 주변 환경에 맞춰 성장하는 힘이 좋습니다.";
  }

  if (["丙", "병"].includes(dayStem)) {
    return "병화(丙火) 일주는 태양처럼 밝고 표현력이 강하며, 사람들 앞에서 존재감이 드러나는 타입입니다.";
  }

  if (["丁", "정"].includes(dayStem)) {
    return "정화(丁火) 일주는 촛불처럼 섬세하고 집중력이 있으며, 감성과 통찰력이 좋은 타입입니다.";
  }

  if (["戊", "무"].includes(dayStem)) {
    return "무토(戊土) 일주는 큰 산처럼 안정감과 책임감이 강하고, 현실적인 판단력이 좋은 타입입니다.";
  }

  if (["己", "기"].includes(dayStem)) {
    return "기토(己土) 일주는 밭과 흙처럼 사람을 품고 키우는 힘이 있으며, 실속과 관리 능력이 좋습니다.";
  }

  if (["庚", "경"].includes(dayStem)) {
    return "경금(庚金) 일주는 단단한 쇠처럼 결단력과 추진력이 강하고, 원칙과 결과를 중요하게 봅니다.";
  }

  if (["辛", "신"].includes(dayStem)) {
    return "신금(辛金) 일주는 보석처럼 섬세하고 기준이 높으며, 감각과 전문성이 돋보이는 타입입니다.";
  }

  if (["壬", "임"].includes(dayStem)) {
    return "임수(壬水) 일주는 큰 바다처럼 생각의 폭이 넓고, 정보와 흐름을 읽는 능력이 좋습니다.";
  }

  return "계수(癸水) 일주는 이슬비처럼 섬세하고 직관력이 좋으며, 조용하지만 깊이 있는 판단을 하는 타입입니다.";
})();
const baseScore = year % 10;

const monthlyLuckText = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const monthScore = 70 + ((year + month + baseScore) % 18);

  if (month % 4 === 1) {
    return `${month}월: 새로운 계획을 세우기 좋은 달입니다. 방향 설정과 준비에 집중하면 좋습니다. 운세 점수 ${monthScore}점`;
  }

  if (month % 4 === 2) {
    return `${month}월: 사람과의 관계에서 기회가 들어올 수 있습니다. 상담, 미팅, 소개, 협업에 적극적으로 움직이면 좋습니다. 운세 점수 ${monthScore}점`;
  }

  if (month % 4 === 3) {
    return `${month}월: 금전 관리와 지출 조절이 중요한 달입니다. 큰 결정은 한 번 더 확인하는 것이 좋습니다. 운세 점수 ${monthScore}점`;
  }

  return `${month}월: 건강과 컨디션 관리가 중요한 달입니다. 쉬어갈 때 쉬어야 다음 기회를 잡기 쉽습니다. 운세 점수 ${monthScore}점`;
}).join("\n\n");

const yearLuckText = `
📅 2026년 올해 운세

💰 재물운
${strongest.name} 기운이 강하게 작용하므로, 본인의 장점을 살린 수익 기회를 만들기 좋은 흐름입니다.
다만 ${weakest.name} 기운이 부족하므로 무리한 확장보다는 안정적인 관리가 중요합니다.

❤️ 연애·관계운
사람과의 관계에서 본인의 색깔이 분명하게 드러나는 시기입니다.
상대방의 감정과 속도를 함께 살피면 관계의 균형이 좋아집니다.

💼 직업운
기존에 해오던 일에서 성과를 만들거나, 새로운 방향을 시도하기 좋은 흐름입니다.
부족한 ${weakest.name} 기운을 보완할 수 있는 협업자나 환경이 도움이 됩니다.

🏥 건강운
${healthText}

🗓️ 월별 운세
${monthlyLuckText}
`;
const currentYear = new Date().getFullYear();
const daeunStartYear = currentYear;

const daeunYearlyText = Array.from({ length: 10 }, (_, i) => {
  const targetYear = daeunStartYear + i;
  const yearScore = 70 + ((targetYear + baseScore + i) % 20);

  if (i === 0) {
    return `${targetYear}년
현재 흐름을 정리하고 방향을 다시 잡는 해입니다. 무리하게 확장하기보다는 지금까지 해온 일, 인간관계, 재물 흐름을 점검하는 것이 좋습니다. 운세 점수 ${yearScore}점`;
  }

  if (i === 1 || i === 2) {
    return `${targetYear}년
새로운 기회가 조금씩 들어오는 시기입니다. 직업 변화, 부업, 새로운 공부, 사람과의 연결에서 가능성이 생길 수 있습니다. 다만 준비 없이 바로 움직이기보다는 작은 테스트부터 시작하는 것이 좋습니다. 운세 점수 ${yearScore}점`;
  }

  if (i === 3 || i === 4) {
    return `${targetYear}년
성과를 만들기 좋은 시기입니다. 지금까지 준비한 일이 있다면 결과로 이어질 가능성이 커집니다. 재물운은 수입 증가보다 관리 능력이 중요하며, 지출 구조를 정리하면 안정감이 좋아집니다. 운세 점수 ${yearScore}점`;
  }

  if (i === 5 || i === 6) {
    return `${targetYear}년
인간관계와 협업의 영향이 커지는 해입니다. 혼자 모든 것을 해결하려 하기보다 도움을 주고받는 구조가 중요합니다. 계약, 약속, 금전 거래는 문서와 기록을 남기는 것이 좋습니다. 운세 점수 ${yearScore}점`;
  }

  if (i === 7 || i === 8) {
    return `${targetYear}년
건강, 생활리듬, 가족관계, 장기 계획을 점검해야 하는 시기입니다. 지나친 욕심보다 안정적인 관리가 필요합니다. 꾸준히 쌓아온 일은 이 시기에 신뢰와 평판으로 돌아올 수 있습니다. 운세 점수 ${yearScore}점`;
  }

  return `${targetYear}년
지난 10년의 흐름을 정리하고 다음 방향을 준비하는 해입니다. 새로운 시작을 위해 불필요한 관계, 지출, 일의 방식을 정리하면 좋습니다. 다음 대운으로 넘어가기 전 기반을 다지는 시기입니다. 운세 점수 ${yearScore}점`;
}).join("\n\n");

const daeunText = `
🔮 대운 10년 연도별 상세 해석

${daeunStartYear}년부터 ${daeunStartYear + 9}년까지의 흐름입니다.
현재 대운은 앞으로 10년 동안 삶의 방향, 재물관리, 직업 변화, 인간관계, 건강관리의 균형을 점검하는 흐름으로 볼 수 있습니다.

━━━━━━━━━━━━━━

${daeunYearlyText}

━━━━━━━━━━━━━━

※ 현재 대운은 테스트용 간단 계산입니다.
정확한 대운 계산은 추후 출생월, 성별, 순행·역행 기준을 반영해 보정할 수 있습니다.
`;

    const moneyScore = 70 + baseScore;
    const loveScore = 72 + (baseScore % 8);
    const healthScore = 68 + (baseScore % 9);
    const jobScore = 75 + (baseScore % 7);

    const luckyNumber =
      ((year + Number(birthMonth) + Number(birthDay)) % 9) + 1;

    const luckyColors = ["보라색", "금색", "파란색", "초록색", "분홍색", "흰색"];
    const luckyColor = luckyColors[year % luckyColors.length];
    const sajuSystemGuide = `
    당신은 전통 사주명리 해석을 현대적으로 풀어주는 전문 AI 사주 상담사입니다.
    
    답변 작성 원칙:
    1. 답변은 짧게 요약하지 말고, 최소 1,500자 이상으로 충분히 길고 자세하게 작성합니다.
    2. 사용자의 사주팔자, 일주, 오행 분포, 강한 오행, 부족한 오행, 성별, 질문을 모두 반영합니다.
    3. 단정적인 예언이나 공포감을 주는 표현은 피하고, 성향·흐름·가능성·주의점·실천 조언 중심으로 설명합니다.
    4. 각 답변은 반드시 다음 구조를 따릅니다.
    
    [1] 전체 흐름 요약
    - 현재 사주의 핵심 기운을 쉽게 설명합니다.
    - 강한 오행과 부족한 오행이 삶에 어떤 영향을 주는지 설명합니다.
    
    [2] 타고난 성향
    - 일주와 오행을 바탕으로 성격, 사고방식, 장점, 약점을 구체적으로 설명합니다.
    - 인간관계에서 드러나는 모습도 함께 설명합니다.
    
    [3] 분야별 해석
    - 질문 주제가 재물운이면 돈이 들어오는 방식, 지출 습관, 자산관리, 수익 방향을 설명합니다.
    - 질문 주제가 직업운이면 잘 맞는 일, 업무 스타일, 피해야 할 환경, 발전 방향을 설명합니다.
    - 질문 주제가 연애운이면 관계 방식, 잘 맞는 사람, 주의할 소통 방식, 인연 흐름을 설명합니다.
    - 질문 주제가 건강운이면 의학적 진단이 아닌 생활습관, 컨디션 관리, 휴식, 식습관 중심으로 설명합니다.
    
    [4] 올해 운세 흐름
    - 올해 주의할 점과 기회가 되는 부분을 현실적으로 설명합니다.
    - 월별 흐름까지 너무 단순하게 말하지 말고, 행동 조언을 함께 제시합니다.
    
    [5] 현실 조언
    - 사용자가 오늘부터 바로 실천할 수 있는 조언을 5가지 이상 제시합니다.
    - 조언은 추상적이지 않게 구체적으로 작성합니다.
    
    [6] 마무리 상담
    - 불안감을 주지 않고, 따뜻하지만 현실적인 말투로 마무리합니다.
    
    표현 방식:
    - 상담하듯 자연스럽게 설명합니다.
    - 어려운 명리 용어는 쉽게 풀어서 설명합니다.
    - “무조건 된다”, “반드시 실패한다”, “대박 난다” 같은 표현은 사용하지 않습니다.
    - 투자, 건강, 결혼, 이직 등 중요한 결정은 참고용 조언으로만 안내합니다.
    - 답변은 한국어로 작성합니다.
    `;
    const sajuInfo = `
이름: ${name}
성별: ${gender === "male" ? "남성" : "여성"}

년주: ${yearGanZhi}
월주: ${monthGanZhi}
일주: ${dayGanZhi}
일주 해석: ${dayMasterText}
시주: ${timeGanZhi}

강한 오행: ${strongest.name}
부족한 오행: ${weakest.name}

목: ${wood}
화: ${fire}
토: ${earth}
금: ${metal}
수: ${water}
`;

  const aiAnswer = await generateSajuAiAnswer(sajuSystemGuide + "\n\n" + sajuInfo + "\n\n질문:\n" + (question || "아직 입력한 질문이 없습니다."));
  setAiResult(aiAnswer);
  setMoneyResult(`💰 재물운 상세 분석

    ${strongest.name} 기운이 강하게 작용하는 사주입니다.
    재물운은 큰돈이 갑자기 들어오는지보다, 들어온 돈을 안정적으로 관리하는 힘이 중요합니다.
    현재 사주는 ${weakest.name} 기운이 부족하므로 무리한 확장보다 지출 관리와 반복 수익 구조가 중요합니다.
    
    현실 조언:
    1. 매월 고정 지출을 먼저 정리하세요.
    2. 단기 수익보다 반복 수익 구조를 만드세요.
    3. 계약이나 금전 거래는 반드시 기록을 남기세요.
    4. 잘 아는 분야에서 수익 기회를 찾으세요.
    5. 부족한 ${weakest.name} 기운을 보완하는 생활습관도 함께 관리하세요.`);
    
    setJobResult(`💼 직업운 상세 분석
    
    직업운은 ${strongest.name} 기운의 영향을 강하게 받습니다.
    현재 사주는 본인의 강점을 살릴 수 있는 분야에서 성과를 만들 가능성이 있습니다.
    다만 ${weakest.name} 기운이 부족하므로 일의 지속성, 균형, 협업 구조를 의식적으로 보완하는 것이 좋습니다.
    
    현실 조언:
    1. 혼자 모든 일을 떠안기보다 협업 구조를 만드세요.
    2. 본인의 전문성을 문서나 콘텐츠로 정리하세요.
    3. 장기적으로 쌓이는 일을 선택하세요.
    4. 급한 변화보다 안정적인 확장을 우선하세요.
    5. 부족한 ${weakest.name} 기운을 보완할 수 있는 사람과 함께하면 좋습니다.`);
    
    setLoveResult(`❤️ 연애운·인간관계 상세 분석
    
    연애운과 인간관계에서는 본인의 표현 방식과 감정 조절이 중요합니다.
    ${strongest.name} 기운이 강하면 장점이 뚜렷하게 드러나는 대신, 상대에게는 다소 강하게 느껴질 수 있습니다.
    관계는 속도보다 신뢰를 쌓는 방식이 더 안정적입니다.
    
    현실 조언:
    1. 감정이 올라올 때 바로 말하지 말고 한 번 정리하세요.
    2. 상대방의 반응보다 관계의 흐름을 보세요.
    3. 오래 갈 관계는 속도보다 신뢰가 중요합니다.
    4. 반복되는 갈등 패턴을 기록해보세요.
    5. 부족한 ${weakest.name} 기운을 보완하는 관계 습관을 만들어보세요.`);
    
    setHealthResult(`🏥 건강운 상세 분석
    
    건강운은 의학적 진단이 아니라 사주 오행의 균형을 참고한 생활관리 조언입니다.
    현재 사주에서 부족한 기운은 ${weakest.name}입니다.
    
    ${healthText}
    
    현실 조언:
    1. 수면 시간을 일정하게 유지하세요.
    2. 식사 시간을 규칙적으로 잡으세요.
    3. 가벼운 걷기나 스트레칭을 꾸준히 하세요.
    4. 스트레스를 쌓아두지 말고 해소 루틴을 만드세요.
    5. 건강 이상이 느껴지면 반드시 전문가 상담을 받으세요.`);
setYearResult(`${yearLuckText}

  📊 오늘의 운세 점수
  재물운: ${moneyScore}점
  연애운: ${loveScore}점
  건강운: ${healthScore}점
  직업운: ${jobScore}점
  
  🍀 행운 정보
  행운의 숫자: ${luckyNumber}
  행운의 색상: ${luckyColor}`);
  
  setDaeunResult(daeunText);   
    setResult(`🔮 ${name}님의 기본 사주 리포트

입력한 달력: ${calendarType === "solar" ? "양력" : "음력"}
양력 생년월일: ${solarDate}
음력 생년월일: ${lunarDate}
태어난 시간: ${birthTime}
성별: ${gender === "male" ? "남성" : "여성"}

━━━━━━━━━━━━━━

🧭 사주팔자
년주: ${yearGanZhi}
월주: ${monthGanZhi}
일주: ${dayGanZhi}
시주: ${timeGanZhi}

━━━━━━━━━━━━━━

🌳 오행 분석

목(木): ${wood}
화(火): ${fire}
토(土): ${earth}
금(金): ${metal}
수(水): ${water}

부족한 오행: ${weakest.name}
강한 오행: ${strongest.name}

━━━━━━━━━━━━━━

 🌞 일주 해석
${dayMasterText}

🌟 성격운
${personalityText}




※ 현재 결과는 테스트용 샘플 리포트입니다.
다음 단계에서 오행 분석과 AI 해석을 연결할 수 있습니다.`);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "42px", marginBottom: "12px", textAlign: "center" }}>
          🔮 사주메이커 AI
        </h1>

        <p style={descStyle}>
          생년월일과 태어난 시간을 입력하면
          <br />
          AI가 나만의 사주 리포트를 생성합니다.
        </p>

        <label style={labelStyle}>이름 또는 닉네임</label>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 김광규"
        />
      <textarea
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="궁금한 점을 입력하세요 (재물운, 연애운, 직업운 등)"
  style={{
    width: "100%",
    minHeight: "80px",
    marginTop: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: "#0b1220",
    color: "#fff",
    border: "1px solid #334155",
  }}
/>
        <label style={labelStyle}>달력 선택</label>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            style={calendarType === "solar" ? activeButtonStyle : buttonStyle}
            onClick={() => setCalendarType("solar")}
          >
            양력
          </button>

          <button
            style={calendarType === "lunar" ? activeButtonStyle : buttonStyle}
            onClick={() => setCalendarType("lunar")}
          >
            음력
          </button>
        </div>

        <label style={labelStyle}>생년월일</label>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "10px" }}>
          <select
            style={inputStyle}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          >
            <option value="">출생연도</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}일
              </option>
            ))}
          </select>
        </div>

        <label style={labelStyle}>태어난 시간</label>
        <div style={timeGridStyle}>
          {timeOptions.map((time) => (
            <button
              key={time}
              style={birthTime === time ? activeSmallButtonStyle : smallButtonStyle}
              onClick={() => setBirthTime(time)}
            >
              {time}
            </button>
          ))}
        </div>

        <label style={labelStyle}>성별</label>
        <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
          <button
            style={gender === "male" ? activeButtonStyle : buttonStyle}
            onClick={() => setGender("male")}
          >
            남성
          </button>

          <button
            style={gender === "female" ? activeButtonStyle : buttonStyle}
            onClick={() => setGender("female")}
          >
            여성
          </button>
        </div>

        <button onClick={handleAnalyze} style={mainButtonStyle} disabled={isAnalyzing}>
  {isAnalyzing ? "🔮 분석 중..." : "사주 분석하기"}
</button>

{isAnalyzing && (
  <div className="analyzing-box">
    <div className="spinner"></div>
    <p>🔮 사주 분석 중입니다...</p>
    <span>오행, 대운, 올해 운세 흐름을 해석하고 있습니다.</span>
  </div>
)}

        {result && (
  <>
    <div style={tabWrapStyle}>
      <button style={activeTab === "basic" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("basic")}>기본사주</button>
      <button style={activeTab === "money" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("money")}>재물운</button>
      <button style={activeTab === "job" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("job")}>직업운</button>
      <button style={activeTab === "love" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("love")}>연애운</button>
      <button style={activeTab === "health" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("health")}>건강운</button>
      <button style={activeTab === "year" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("year")}>올해운세</button>
      <button style={activeTab === "daeun" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("daeun")}>대운</button>
      <button style={activeTab === "ai" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("ai")}>질문답변</button>
    </div>

    <div style={resultStyle}>
  {activeTab === "basic" && result}
  {activeTab === "money" && moneyResult}
  {activeTab === "job" && jobResult}
  {activeTab === "love" && loveResult}
  {activeTab === "health" && healthResult}
  {activeTab === "year" && yearResult}
  {activeTab === "daeun" && daeunResult}
  {activeTab === "ai" && aiResult}
</div>
    <FiveElementGraph counts={fiveCounts} />
  </>
)}
    
    </div>
    </div> 
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "#ffffff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "560px",
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: "24px",
  padding: "32px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};

const descStyle = {
  fontSize: "17px",
  color: "#cbd5e1",
  textAlign: "center" as const,
  lineHeight: "1.7",
  marginBottom: "28px",
};

const labelStyle = {
  display: "block",
  fontSize: "15px",
  fontWeight: "bold",
  marginBottom: "8px",
  color: "#e5e7eb",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid #475569",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "18px",
  background: "#020617",
  color: "#ffffff",
  fontSize: "16px",
};

const timeGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginBottom: "22px",
};

const buttonStyle = {
  flex: 1,
  border: "1px solid #475569",
  borderRadius: "12px",
  padding: "14px",
  background: "#020617",
  color: "#cbd5e1",
  fontSize: "16px",
  cursor: "pointer",
};

const activeButtonStyle = {
  ...buttonStyle,
  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
  color: "#ffffff",
  border: "1px solid transparent",
  fontWeight: "bold",
};

const smallButtonStyle = {
  border: "1px solid #475569",
  borderRadius: "12px",
  padding: "12px",
  background: "#020617",
  color: "#cbd5e1",
  fontSize: "14px",
  cursor: "pointer",
};

const activeSmallButtonStyle = {
  ...smallButtonStyle,
  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
  color: "#ffffff",
  border: "1px solid transparent",
  fontWeight: "bold",
};

const mainButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "14px",
  padding: "16px",
  fontSize: "18px",
  fontWeight: "bold",
  color: "#fff",
  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
  cursor: "pointer",
};

const resultStyle = {
  marginTop: "20px",
  padding: "20px",
  borderRadius: "16px",
  background: "#020617",
  border: "1px solid #334155",
  color: "#ffffff",
  whiteSpace: "pre-line" as const,
  lineHeight: "1.7",
  textAlign: "center" as const,
};

const tabWrapStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap" as const,
  marginTop: "20px",
  marginBottom: "16px",
};

const tabButtonStyle = {
  border: "1px solid #475569",
  borderRadius: "999px",
  padding: "10px 14px",
  background: "#020617",
  color: "#cbd5e1",
  cursor: "pointer",
  fontSize: "14px",
};

const activeTabStyle = {
  ...tabButtonStyle,
  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
  color: "#ffffff",
  fontWeight: "bold",
};
const FiveElementGraph = ({ counts }: { counts: Record<string, number> }) => {
  const elements = [
    { key: "wood", label: "목(木)", emoji: "🌳" },
    { key: "fire", label: "화(火)", emoji: "🔥" },
    { key: "earth", label: "토(土)", emoji: "⛰️" },
    { key: "metal", label: "금(金)", emoji: "⚙️" },
    { key: "water", label: "수(水)", emoji: "💧" },
  ];

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "16px",
        background: "#020617",
        border: "1px solid #334155",
        color: "#ffffff",
      }}
    >
      <h2>🌳 오행 그래프</h2>
  
      {elements.map((item) => {
        const value = counts[item.key] || 0;
        const percent = (value / maxCount) * 100;
  
        return (
          <div key={item.key} style={{ marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span>
                {item.emoji} {item.label}
              </span>
              <span>{value}개</span>
            </div>
  
            <div
              style={{
                width: "100%",
                height: "18px",
                background: "#334155",
                borderRadius: "999px",
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: "18px",
                  background: "#8b5cf6",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
