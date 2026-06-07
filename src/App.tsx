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

    console.log("AI 응답 데이터:", data);

return (
  data.answer ||
  data.result ||
  data.message ||
  data.text ||
  data.content ||
  data.output ||
  data.aiAnswer ||
  data.analysis ||
  data.summary ||
  JSON.stringify(data, null, 2) ||
  "AI 상담 결과를 불러오지 못했습니다."
);
  } catch (error) {
    console.error("AI 상담 오류:", error);
    return "AI 상담 중 오류가 발생했습니다.";
  }
}
const stemElementMap: Record<string, string> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

const stemYinYangMap: Record<string, "양" | "음"> = {
  갑: "양", 을: "음",
  병: "양", 정: "음",
  무: "양", 기: "음",
  경: "양", 신: "음",
  임: "양", 계: "음",
};

const elementGenerates: Record<string, string> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

const elementControls: Record<string, string> = {
  목: "토",
  토: "수",
  수: "화",
  화: "금",
  금: "목",
};

function getTenGodByStem(dayStem: string, targetStem: string): string {
  const dayElement = stemElementMap[dayStem];
  const targetElement = stemElementMap[targetStem];
  const dayYinYang = stemYinYangMap[dayStem];
  const targetYinYang = stemYinYangMap[targetStem];

  if (!dayElement || !targetElement || !dayYinYang || !targetYinYang) {
    return "계산불가";
  }

  const sameYinYang = dayYinYang === targetYinYang;

  if (dayElement === targetElement) return sameYinYang ? "비견" : "겁재";
  if (elementGenerates[dayElement] === targetElement) return sameYinYang ? "식신" : "상관";
  if (elementGenerates[targetElement] === dayElement) return sameYinYang ? "편인" : "정인";
  if (elementControls[dayElement] === targetElement) return sameYinYang ? "편재" : "정재";
  if (elementControls[targetElement] === dayElement) return sameYinYang ? "편관" : "정관";

  return "계산불가";
}
function getGyeokgukByMonthTenGod(monthTenGod: string): string {
  switch (monthTenGod) {
    case "편관":
      return "편관격";
    case "정관":
      return "정관격";
    case "정재":
      return "정재격";
    case "편재":
      return "편재격";
    case "식신":
      return "식신격";
    case "상관":
      return "상관격";
    default:
      return "일반격";
  }
}
function getGyeokgukDescription(gyeokguk: string): string {
  switch (gyeokguk) {
    case "편관격":
      return "편관격은 압박과 경쟁 속에서 능력이 살아나는 격입니다. 책임감과 추진력이 강하고, 위기 상황에서 결단력이 드러납니다.";
    case "정관격":
      return "정관격은 원칙, 질서, 명예를 중시하는 격입니다. 조직생활, 관리직, 공직, 안정적인 직업 구조와 잘 맞습니다.";
    case "정재격":
      return "정재격은 현실감각과 재물 관리 능력이 좋은 격입니다. 성실하게 모으고 지키는 힘이 있으며 안정적인 수익 구조에 강합니다.";
    case "편재격":
      return "편재격은 사업성, 활동성, 대인관계, 기회 포착 능력이 좋은 격입니다. 영업, 투자, 유통, 장사 분야와 잘 맞습니다.";
    case "식신격":
      return "식신격은 표현력, 생산성, 꾸준한 결과물의 힘이 강한 격입니다. 콘텐츠, 교육, 기술, 창작, 먹고사는 복과 관련이 깊습니다.";
    case "상관격":
      return "상관격은 창의력, 말솜씨, 기획력, 개성이 강한 격입니다. 자유로운 환경에서 능력이 살아나며 콘텐츠와 표현 분야에 강합니다.";
    default:
      return "대표 격국으로 분류되지 않아 전체 사주 구조와 오행 균형을 함께 보고 해석하는 것이 좋습니다.";
  }
}
function getYongsinDescription(yongsin: string, heesin: string, gisin: string): string {
  return `용신 ${yongsin}은 현재 사주에서 가장 보완하면 좋은 핵심 기운입니다.
희신 ${heesin}은 용신을 도와주는 보조 기운으로 함께 활용하면 운의 흐름이 좋아질 수 있습니다.
기신 ${gisin}은 이미 강하거나 과해지기 쉬운 기운으로 균형을 유지하는 것이 중요합니다.`;
}
function App() {
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  
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
  
  const [yearResult, setYearResult] = useState("");
  const [daeunResult, setDaeunResult] = useState("");
  const [aiResult, setAiResult] = useState("");
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
  
  
  
  const handleDownloadPdf = () => {
    alert("PDF 기능은 다시 정리 중입니다. 우선 화면 내용을 복사해서 사용해주세요.");
  };
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult("");
    await new Promise((resolve) => setTimeout(resolve, 300));
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
    try {
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
const yongsin = weakest.name;
const heesin =
  weakest.name === "수(水)"
    ? "금(金)"
    : weakest.name === "목(木)"
    ? "수(水)"
    : weakest.name === "화(火)"
    ? "목(木)"
    : weakest.name === "토(土)"
    ? "화(火)"
    : "토(土)";

const gisin = strongest.name;
const yongsinDescription = getYongsinDescription(yongsin, heesin, gisin);
const luckyColorByYongsin =
  yongsin === "수(水)"
    ? "파란색, 남색, 검정색"
    : yongsin === "목(木)"
    ? "초록색, 연두색"
    : yongsin === "화(火)"
    ? "빨간색, 주황색, 보라색"
    : yongsin === "토(土)"
    ? "노란색, 베이지색, 갈색"
    : "흰색, 은색, 금색";

const luckyDirectionByYongsin =
  yongsin === "수(水)"
    ? "북쪽"
    : yongsin === "목(木)"
    ? "동쪽"
    : yongsin === "화(火)"
    ? "남쪽"
    : yongsin === "토(土)"
    ? "중앙 · 남서쪽 · 북동쪽"
    : "서쪽";

    const luckyEnvironmentByYongsin =
    yongsin === "수(水)"
      ? "물가, 카페, 상담실, 연구실"
      : yongsin === "목(木)"
      ? "공원, 숲길, 도서관, 교육공간"
      : yongsin === "화(火)"
      ? "무대, 강의실, 사람 많은 공간"
      : yongsin === "토(土)"
      ? "부동산, 사무실, 안정된 공간"
      : "금융기관, 전문직 사무실, 분석 공간";
  
  const weakElementGuide =
    weakest.name === "목(木)"
      ? "목(木) 보완법: 독서, 공부, 산책, 공원·숲 방문, 새로운 배움 시작이 좋습니다."
      : weakest.name === "화(火)"
      ? "화(火) 보완법: 사람들과 교류, 발표, 운동, 햇빛 보기, 적극적인 표현이 좋습니다."
      : weakest.name === "토(土)"
      ? "토(土) 보완법: 규칙적인 생활, 부동산 공부, 정리정돈, 꾸준한 루틴 만들기가 좋습니다."
      : weakest.name === "금(金)"
      ? "금(金) 보완법: 문서 정리, 재무관리, 계약 검토, 전문기술 습득이 좋습니다."
      : "수(水) 보완법: 충분한 휴식, 여행, 상담, 명상, 독서, 물과 관련된 활동이 좋습니다.";
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

const todaySolar = Solar.fromDate(new Date());
const todayLunar: any = todaySolar.getLunar();
const todayGanZhi = safeCall(todayLunar, "getDayInGanZhi");
const getElementFromGanZhi = (ganZhi: string) => {
  const text = String(ganZhi);

  if (["甲", "乙", "寅", "卯", "갑", "을", "인", "묘"].some((v) => text.includes(v))) return "목(木)";
  if (["丙", "丁", "巳", "午", "병", "정", "사", "오"].some((v) => text.includes(v))) return "화(火)";
  if (["戊", "己", "辰", "戌", "丑", "未", "무", "기", "진", "술", "축", "미"].some((v) => text.includes(v))) return "토(土)";
  if (["庚", "辛", "申", "酉", "경", "신", "유"].some((v) => text.includes(v))) return "금(金)";
  return "수(水)";
};

const todayElement = getElementFromGanZhi(todayGanZhi);
const getElementGuide = (elementName: string) => {
  if (elementName.includes("목")) {
    return {
      color: "초록색, 연두색",
      direction: "동쪽",
      action: "새 계획 세우기, 공부 시작, 기획 정리, 성장형 업무",
      caution: "성급하게 시작만 하고 마무리를 놓치지 않도록 주의하세요.",
    };
  }

  if (elementName.includes("화")) {
    return {
      color: "빨간색, 보라색",
      direction: "남쪽",
      action: "홍보, 발표, 만남, 영업, 콘텐츠 노출",
      caution: "감정 표현이 강해질 수 있으니 말투와 속도를 조절하세요.",
    };
  }

  if (elementName.includes("토")) {
    return {
      color: "노란색, 갈색, 베이지색",
      direction: "중앙, 남서쪽, 북동쪽",
      action: "정리정돈, 부동산 검토, 재정 점검, 생활 루틴 안정",
      caution: "고집이 강해질 수 있으니 유연한 판단이 필요합니다.",
    };
  }

  if (elementName.includes("금")) {
    return {
      color: "흰색, 금색, 은색",
      direction: "서쪽",
      action: "계약 검토, 돈관리, 문서 정리, 중요한 판단",
      caution: "너무 단정적으로 판단하거나 차갑게 말하지 않도록 주의하세요.",
    };
  }

  return {
    color: "검정색, 파란색, 남색",
    direction: "북쪽",
    action: "휴식, 상담, 정보수집, 생각 정리, 조용한 계획",
    caution: "생각이 많아져 결정이 늦어질 수 있으니 우선순위를 정하세요.",
  };
};

const todayGuide = getElementGuide(todayElement);
const dayStem = String(dayGanZhi).charAt(0);
const yearStem = String(yearGanZhi).charAt(0);
const monthStem = String(monthGanZhi).charAt(0);

const yearTenGod = getTenGodByStem(dayStem, yearStem);
const monthTenGod = getTenGodByStem(dayStem, monthStem);

const timeTenGod =
  birthTime === "시간 모름"
    ? "시간 미입력"
    : getTenGodByStem(dayStem, String(timeGanZhi).charAt(0));
    const TEN_GOD_DB: Record<string, string> = {
      비견: "독립심이 강하고 스스로 길을 개척하는 힘이 강합니다.",
      겁재: "경쟁심이 강하며 사람들과 함께 성장하는 성향입니다.",
      식신: "생산성과 실행력이 좋고 꾸준히 결과를 만드는 힘이 있습니다.",
      상관: "창의력과 표현력이 뛰어나고 아이디어가 풍부합니다.",
      편재: "사업 감각과 기회 포착 능력이 뛰어납니다.",
      정재: "안정적인 재물관리와 자산 축적 능력이 강합니다.",
      편관: "추진력과 돌파력이 강하며 도전을 두려워하지 않습니다.",
      정관: "책임감과 신뢰성이 높고 조직생활에 강합니다.",
      편인: "직관력이 뛰어나고 새로운 지식 습득이 빠릅니다.",
      정인: "배움과 연구를 좋아하며 안정적인 사고방식을 가집니다."
    };
    const TEN_GOD_DETAIL_DB: Record<
  string,
  {
    money: string;
    job: string;
    love: string;
    caution: string;
  }
> = {
  비견: {
    money: "독립적인 수입원 확보에 유리합니다. 월급 하나보다 부업, 개인 브랜드, 프리랜서 수익처럼 스스로 만드는 돈과 잘 맞습니다.",
    job: "자영업, 프리랜서, 전문직, 1인 사업, 독립적인 업무 환경에서 능력이 살아납니다.",
    love: "주도적인 연애 성향이 강합니다. 상대와 동등한 관계를 원하며 간섭이 많으면 답답함을 느낄 수 있습니다.",
    caution: "고집과 자존심이 강해질 수 있습니다. 혼자 결정하기보다 주변 조언을 듣는 균형이 필요합니다.",
  },

  겁재: {
    money: "사람과의 연결, 공동사업, 영업, 네트워크를 통해 재물 기회가 생깁니다. 다만 돈 거래는 신중해야 합니다.",
    job: "영업, 유통, 조직관리, 공동 프로젝트, 사람을 상대하는 일에 강점이 있습니다.",
    love: "인맥을 통해 인연이 들어오는 경우가 많습니다. 다만 경쟁심이나 비교심이 관계를 흔들 수 있습니다.",
    caution: "금전 거래, 보증, 동업은 반드시 문서화해야 합니다. 가까운 사람과의 돈 문제를 조심하세요.",
  },

  식신: {
    money: "꾸준히 만들어내는 힘으로 재물을 쌓는 타입입니다. 기술, 콘텐츠, 생산성, 반복 수익 구조와 잘 맞습니다.",
    job: "교육, 기술, 생산, 콘텐츠, 요리, 강의, 블로그, 유튜브처럼 결과물을 만드는 분야에 적합합니다.",
    love: "배려심이 많고 안정적인 연애를 선호합니다. 상대를 챙기는 방식으로 호감이 커집니다.",
    caution: "편안함에 머물면 발전이 느려질 수 있습니다. 꾸준함은 장점이지만 게으름은 경계해야 합니다.",
  },

  상관: {
    money: "아이디어, 말솜씨, 콘텐츠, 마케팅, 기획력에서 수익 기회가 생깁니다. 남들과 다른 표현 방식이 돈이 됩니다.",
    job: "마케팅, 광고, 콘텐츠 제작, 강의, 디자인, 기획, 상담, 크리에이터 분야와 잘 맞습니다.",
    love: "표현력이 좋고 매력이 강하지만, 말이 직설적으로 나가면 갈등이 생길 수 있습니다.",
    caution: "규칙이나 권위와 충돌하기 쉽습니다. 말의 속도와 표현 수위를 조절하는 것이 중요합니다.",
  },

  편재: {
    money: "사업 감각, 투자 감각, 기회 포착 능력이 강합니다. 유통, 영업, 부동산, 장사, 온라인 판매와 잘 맞습니다.",
    job: "사업가, 영업직, 투자상담, 무역, 유통, 부동산 중개, 공동구매, 마케팅 분야에 강점이 있습니다.",
    love: "활동적이고 매력적인 인연이 들어오기 쉽습니다. 다만 관계가 넓어질수록 신뢰 관리가 중요합니다.",
    caution: "큰돈을 빠르게 움직이고 싶은 욕심이 생길 수 있습니다. 투자와 확장은 반드시 검토 후 진행하세요.",
  },

  정재: {
    money: "안정적인 재물 관리와 자산 축적 능력이 좋습니다. 저축, 월급, 임대수익, 고정수입 구조와 잘 맞습니다.",
    job: "회계, 세무, 금융, 행정, 사무관리, 부동산 관리, 안정적인 조직 업무에 적합합니다.",
    love: "현실적이고 책임감 있는 관계를 선호합니다. 안정감과 신뢰를 주는 연애가 잘 맞습니다.",
    caution: "너무 안정만 추구하면 기회를 놓칠 수 있습니다. 계획은 좋지만 변화에 대한 유연성도 필요합니다.",
  },

  편관: {
    money: "위기 속에서 기회를 잡는 힘이 있습니다. 경쟁이 있는 시장, 성과형 수익, 도전적인 일에서 재물 기회가 생깁니다.",
    job: "현장관리, 영업관리, 안전관리, 군경, 스포츠, 위기관리, 경쟁형 업무에 적합합니다.",
    love: "강한 끌림과 긴장감 있는 관계가 생기기 쉽습니다. 다만 감정 조절이 중요합니다.",
    caution: "압박감과 스트레스를 크게 받을 수 있습니다. 무리한 책임을 혼자 떠안지 않는 것이 좋습니다.",
  },

  정관: {
    money: "신뢰와 안정성을 바탕으로 재물을 쌓는 타입입니다. 직장, 조직, 자격, 명예를 통한 수입 구조와 잘 맞습니다.",
    job: "공무원, 공기업, 관리자, 행정직, 법률, 교육, 조직관리, 책임 있는 직책과 잘 맞습니다.",
    love: "책임감 있고 진지한 관계를 선호합니다. 결혼운이나 공식적인 관계 형성에 유리한 편입니다.",
    caution: "체면과 원칙에 묶여 답답해질 수 있습니다. 완벽주의를 조금 내려놓는 것이 필요합니다.",
  },

  편인: {
    money: "독특한 지식, 직관, 연구, 특수기술, 상담 능력에서 수익 기회가 생깁니다.",
    job: "연구, 상담, 기획, 심리, 종교, 철학, AI, 데이터, 전문지식 기반 업무에 적합합니다.",
    love: "감정 표현이 조심스럽고 혼자만의 시간이 필요합니다. 깊이 있는 관계를 선호합니다.",
    caution: "생각이 많아 실행이 늦어질 수 있습니다. 아이디어를 현실화하는 습관이 중요합니다.",
  },

  정인: {
    money: "배움, 자격, 문서, 지식, 보호받는 구조에서 안정적인 재물 흐름이 생깁니다.",
    job: "교육, 연구, 문서작성, 자격증, 공공기관, 상담, 복지, 행정 분야와 잘 맞습니다.",
    love: "따뜻하고 안정적인 관계를 선호합니다. 배려심이 좋지만 지나치게 의존적인 관계는 피하는 것이 좋습니다.",
    caution: "생각과 준비가 많아 행동이 늦어질 수 있습니다. 완벽한 준비보다 실행이 중요합니다.",
  },
};
    console.log(TEN_GOD_DETAIL_DB);
    const getTenGodMeaning = (tenGod: string) => {
      return TEN_GOD_DB[tenGod] || "";
    };
    const getTenGodScore = (tenGod: string) => {
      const scoreMap: Record<string, number> = {
        정재: 88,
        편재: 90,
        정관: 87,
        편관: 82,
        정인: 85,
        편인: 78,
        식신: 86,
        상관: 76,
        비견: 74,
        겁재: 70,
      };
    
      return scoreMap[tenGod] || 75;
    };
    const getStarRating = (score: number) => {
      if (score >= 90) return "★★★★★";
      if (score >= 85) return "★★★★☆";
      if (score >= 80) return "★★★★";
      if (score >= 75) return "★★★☆";
      if (score >= 70) return "★★★";
      return "★★☆";
    };
    const getSajuGrade = (score: number) => {
      if (score >= 90) return "S";
      if (score >= 85) return "A+";
      if (score >= 80) return "A";
      if (score >= 75) return "B+";
      if (score >= 70) return "B";
      return "C";
    };
      const getLuckScore = (tenGod: string, type: "money" | "job" | "love") => {
      const scoreMap: Record<string, { money: number; job: number; love: number }> = {
        정재: { money: 90, job: 86, love: 82 },
        편재: { money: 92, job: 84, love: 80 },
        정관: { money: 82, job: 90, love: 86 },
        편관: { money: 78, job: 88, love: 76 },
        정인: { money: 80, job: 86, love: 84 },
        편인: { money: 76, job: 82, love: 78 },
        식신: { money: 88, job: 84, love: 86 },
        상관: { money: 80, job: 78, love: 82 },
        비견: { money: 76, job: 80, love: 78 },
        겁재: { money: 72, job: 76, love: 74 },
      };
      
      
      return scoreMap[tenGod]?.[type] || 75;
    };
    const getScoreComment = (score: number) => {
      if (score >= 90) return "매우 강한 운입니다. 적극적으로 기회를 잡아도 좋은 흐름입니다.";
      if (score >= 85) return "좋은 흐름입니다. 꾸준히 추진하면 성과를 기대할 수 있습니다.";
      if (score >= 80) return "안정적인 운입니다. 무리하지 않으면 좋은 결과가 따릅니다.";
      if (score >= 75) return "보통 이상입니다. 준비와 관리가 함께 필요합니다.";
      if (score >= 70) return "조심스럽게 접근해야 합니다. 욕심보다 안정이 중요합니다.";
      return "기복이 있을 수 있습니다. 당분간은 신중한 판단이 필요합니다.";
    };
    const yearTenGodText = getTenGodMeaning(yearTenGod);
    const monthTenGodText = getTenGodMeaning(monthTenGod);
    const yearTenGodScore = getTenGodScore(yearTenGod);
    const monthTenGodScore = getTenGodScore(monthTenGod);
    const timeTenGodScore = getTenGodScore(timeTenGod);
    const yearTenGodStars = getStarRating(yearTenGodScore);
    const monthTenGodStars = getStarRating(monthTenGodScore);
    const timeTenGodStars = getStarRating(timeTenGodScore);
    const totalTenGodScore = Math.round(
      (yearTenGodScore + monthTenGodScore + timeTenGodScore) / 3
    );
    
    const sajuGrade = getSajuGrade(totalTenGodScore);
    const sajuGradeStars = getStarRating(totalTenGodScore);
    const tenGodMoneyScore = getLuckScore(yearTenGod, "money");
    const tenGodJobScore = getLuckScore(monthTenGod, "job");
    const tenGodLoveScore = getLuckScore(timeTenGod, "love");
    const tenGodMoneyComment = getScoreComment(tenGodMoneyScore);
    const tenGodJobComment = getScoreComment(tenGodJobScore);
    const tenGodLoveComment = getScoreComment(tenGodLoveScore);
    const earningScore = Math.min(100, tenGodMoneyScore + 3);
const savingScore = Math.max(60, tenGodMoneyScore - 5);
const investmentScore = Math.max(60, tenGodMoneyScore - 8);
const realEstateScore = Math.min(100, tenGodMoneyScore + 5);
const businessScore = Math.min(100, tenGodMoneyScore + 2);

const moneyFiveSetText = `
💰 재물운 5종 세트

1️⃣ 돈 버는 능력
${earningScore}점 ${getStarRating(earningScore)}

2️⃣ 돈 지키는 능력
${savingScore}점 ${getStarRating(savingScore)}

3️⃣ 투자운
${investmentScore}점 ${getStarRating(investmentScore)}

4️⃣ 부동산운
${realEstateScore}점 ${getStarRating(realEstateScore)}

5️⃣ 사업운
${businessScore}점 ${getStarRating(businessScore)}
`;
const realEstateDetailText = `
🏢 부동산운 전용 해석

1️⃣ 토지운
${Math.min(100, realEstateScore + 2)}점 ${getStarRating(Math.min(100, realEstateScore + 2))}
장기 보유, 개발 가능성, 입지 판단과 관련된 운입니다.

2️⃣ 상가운
${Math.max(60, realEstateScore - 3)}점 ${getStarRating(Math.max(60, realEstateScore - 3))}
임대수익, 유동인구, 상권 분석, 수익형 부동산과 관련된 운입니다.

3️⃣ 아파트운
${Math.max(60, realEstateScore - 5)}점 ${getStarRating(Math.max(60, realEstateScore - 5))}
실거주 안정성, 주거 자산, 가족 기반 자산 형성과 관련된 운입니다.

4️⃣ 임대수익운
${Math.min(100, realEstateScore + 1)}점 ${getStarRating(Math.min(100, realEstateScore + 1))}
월세, 전세, 임대관리, 반복 수익 구조와 관련된 운입니다.

5️⃣ 중개·컨설팅 적성
${Math.min(100, businessScore + 4)}점 ${getStarRating(Math.min(100, businessScore + 4))}
사람을 연결하고, 정보를 해석하고, 계약을 조율하는 능력과 관련된 운입니다.
`;
const spouseScore = Math.min(100, tenGodLoveScore + 2);
const meetingScore = Math.max(60, tenGodLoveScore - 3);
const marriageScore = Math.min(100, tenGodLoveScore + 1);
const spouseJobScore = Math.max(60, tenGodJobScore - 2);
const relationshipCautionScore = Math.max(60, 100 - Math.abs(tenGodLoveScore - 80));

const spouseDetailText = `
❤️ 배우자운 5종 세트

1️⃣ 배우자 성향
${spouseScore}점 ${getStarRating(spouseScore)}
나와 잘 맞는 배우자 성향, 관계에서 끌리는 사람의 분위기를 보는 항목입니다.

2️⃣ 만남운
${meetingScore}점 ${getStarRating(meetingScore)}
새로운 인연, 소개, 자연스러운 만남, 관계가 시작되는 흐름을 보는 항목입니다.

3️⃣ 결혼운
${marriageScore}점 ${getStarRating(marriageScore)}
연애가 안정적인 관계로 이어질 가능성, 책임감 있는 관계 형성 흐름을 보는 항목입니다.

4️⃣ 배우자 직업 성향
${spouseJobScore}점 ${getStarRating(spouseJobScore)}
배우자 또는 인연이 직업적으로 어떤 성향을 가질 가능성이 있는지 참고하는 항목입니다.

5️⃣ 관계 주의사항
${relationshipCautionScore}점 ${getStarRating(relationshipCautionScore)}
관계에서 조심해야 할 감정 표현, 거리감, 소통 방식을 점검하는 항목입니다.
`;

    const yearTenGodDetail =
     TEN_GOD_DETAIL_DB[yearTenGod] || null;
    const monthTenGodDetail =
     TEN_GOD_DETAIL_DB[monthTenGod] || null; 
     const timeTenGodDetail =
     TEN_GOD_DETAIL_DB[timeTenGod] || null;

    const gyeokguk = getGyeokgukByMonthTenGod(monthTenGod);
    const gyeokgukDescription = getGyeokgukDescription(gyeokguk);
    const careerRecommendText = (() => {
  if (gyeokguk === "정관격") {
    return "추천 직업: 공무원, 관리자, 공기업, 행정직, 조직관리자\n추천 사업: 교육, 자격증, 행정대행, 안정형 컨설팅";
  }

  if (gyeokguk === "편관격") {
    return "추천 직업: 영업관리자, 현장관리자, 보안·안전관리, 스포츠·군경 계열, 위기관리 컨설턴트\n추천 사업: 관리대행, 현장 서비스, 위기관리, 경쟁형 영업";
  }

  if (gyeokguk === "정재격") {
    return "추천 직업: 회계, 세무, 금융, 자산관리, 부동산 관리, 사무관리\n추천 사업: 임대관리, 재무컨설팅, 소매업, 안정형 수익사업";
  }

  if (gyeokguk === "편재격") {
    return "추천 직업: 사업가, 영업직, 투자상담, 유통, 무역, 부동산 중개\n추천 사업: 부동산, 공동구매, 유통, 온라인 판매, 마케팅";
  }

  if (gyeokguk === "식신격") {
    return "추천 직업: 콘텐츠 제작자, 강사, 요리·식품, 기술직, 기획자\n추천 사업: 교육 콘텐츠, 블로그·유튜브, 식품사업, 온라인 클래스";
  }

  if (gyeokguk === "상관격") {
    return "추천 직업: 마케터, 기획자, 크리에이터, 강사, 상담가, 디자이너\n추천 사업: 광고대행, 콘텐츠 제작, 브랜딩, 컨설팅, AI 도구 제작";
  }

  return "추천 직업: 상담, 기획, 관리, 영업, 콘텐츠 분야\n추천 사업: 개인 컨설팅, 온라인 콘텐츠, 생활서비스, 소규모 창업";
})();
const businessRecommendText = (() => {
  if (gyeokguk === "편재격") {
    return "부동산 중개업, 부동산 컨설팅, 공동구매, 유통업, 온라인 쇼핑몰, 마케팅 대행";
  }

  if (gyeokguk === "정재격") {
    return "임대관리업, 세무·회계 서비스, 재무컨설팅, 안정형 소매업";
  }

  if (gyeokguk === "정관격") {
    return "교육사업, 행정대행, 자격증 교육, 공공기관 협력사업";
  }

  if (gyeokguk === "편관격") {
    return "현장관리, 안전관리, 시설관리, 스포츠 관련 사업";
  }

  if (gyeokguk === "식신격") {
    return "유튜브, 블로그, 온라인 강의, 콘텐츠 제작, 식품사업";
  }

  if (gyeokguk === "상관격") {
    return "광고대행, 브랜딩, 디자인, AI 자동화툴, 컨설팅";
  }

  return "컨설팅, 교육, 콘텐츠, 온라인 서비스 사업";
})();
const timeTenGodText =
  timeTenGod === "시간 미입력"
    ? ""
    : getTenGodMeaning(timeTenGod);
    const yearTenGodPositionText =
    `년간의 ${yearTenGod}은 부모·가문·초년운의 영향을 봅니다. 어린 시절 환경, 윗사람과의 관계, 기본 성향 형성에 영향을 주는 자리입니다.`;
  
  const monthTenGodPositionText =
    `월간의 ${monthTenGod}은 직업·사회생활·현실 활동성을 봅니다. 사회에서 드러나는 성향, 일하는 방식, 직업운의 방향을 판단하는 중요한 자리입니다.`;
  
  const timeTenGodPositionText =
    timeTenGod === "시간 미입력"
      ? "태어난 시간이 입력되지 않아 시간 십성의 위치 해석은 생략됩니다."
      : `시간의 ${timeTenGod}은 노년운·자녀운·미래 성향을 봅니다. 나이가 들수록 드러나는 방향, 후반 인생의 관심사, 자녀나 결과물과의 관계를 참고하는 자리입니다.`;


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

const currentYear = new Date().getFullYear();
const currentYearGanji = safeCall(todayLunar, "getYearInGanZhi");
const currentYearElement = getElementFromGanZhi(currentYearGanji);
const currentYearTenGod = getTenGodByStem(dayStem, String(currentYearGanji).charAt(0));
const currentYearTenGodText = getTenGodMeaning(currentYearTenGod);

const seunText = `
📌 ${currentYear}년 세운 분석

올해 간지: ${currentYearGanji}
올해 오행: ${currentYearElement}
나와의 십성 관계: ${currentYearTenGod}

${currentYearTenGodText}

올해는 ${currentYearElement} 기운이 강하게 작용하는 해입니다.
본인의 사주에서 부족한 기운인 ${weakest.name}과 강한 기운인 ${strongest.name}을 함께 비교해 보면,
무리한 확장보다는 균형 잡힌 선택이 중요합니다.

✅ 올해 좋은 방향
- 본인의 강점이 드러나는 분야에 집중하기
- 새로운 일은 작게 테스트하고 확장하기
- 계약, 금전, 건강 관리는 기록 중심으로 관리하기

⚠️ 올해 조심할 점
- 감정적인 결정
- 무리한 투자나 확장
- 체력 관리 소홀
`;
const fiveYearSeunText = Array.from({ length: 5 }, (_, i) => {
  const targetYear = currentYear + i;
  const targetYearScore = 70 + ((targetYear + baseScore + i) % 20);

  if (i === 0) {
    return `${targetYear}년 세운
현재 흐름을 점검하고 방향을 정리하는 해입니다. 무리한 확장보다는 기존 일, 재물 흐름, 인간관계를 차분히 살피는 것이 좋습니다. 운세 점수 ${targetYearScore}점`;
  }

  if (i === 1) {
    return `${targetYear}년 세운
새로운 기회가 조금씩 들어오는 해입니다. 공부, 부업, 사업 아이디어, 사람과의 연결에서 가능성이 생길 수 있습니다. 단, 처음부터 크게 움직이기보다 작게 테스트하는 전략이 좋습니다. 운세 점수 ${targetYearScore}점`;
  }

  if (i === 2) {
    return `${targetYear}년 세운
성과를 만들기 좋은 해입니다. 그동안 준비한 일이 있다면 결과로 이어질 수 있습니다. 재물운은 수입 확대보다 지출 관리와 반복 수익 구조를 점검하는 것이 중요합니다. 운세 점수 ${targetYearScore}점`;
  }

  if (i === 3) {
    return `${targetYear}년 세운
인간관계와 협업의 영향이 커지는 해입니다. 혼자 해결하려 하기보다 도움을 주고받는 구조를 만드는 것이 좋습니다. 계약과 금전 거래는 반드시 기록으로 남기세요. 운세 점수 ${targetYearScore}점`;
  }

  return `${targetYear}년 세운
앞으로의 방향을 다시 정리하는 해입니다. 불필요한 지출, 관계, 일의 방식을 정리하면 다음 단계로 넘어가는 힘이 생깁니다. 건강과 생활 리듬 관리도 중요합니다. 운세 점수 ${targetYearScore}점`;
}).join("\n\n");
const healthBaseScore = Math.max(60, 68 + (baseScore % 9));
const middleAgeHealthScore = Math.max(60, 66 + (baseScore % 9));
const oldAgeHealthScore = Math.max(60, 64 + (baseScore % 9));
const weakOrganScore = Math.max(60, 62 + (baseScore % 9));
const lifestyleScore = Math.min(100, 73 + (baseScore % 9));
const healthFiveSetText = `
🏥 건강운 5종 세트

1️⃣ 선천 건강운
${healthBaseScore}점 ${getStarRating(healthBaseScore)}
타고난 체력과 기본 회복력을 참고하는 항목입니다.

2️⃣ 중년 건강운
${middleAgeHealthScore}점 ${getStarRating(middleAgeHealthScore)}
일, 책임, 스트레스가 많아지는 시기의 건강 관리 흐름입니다.

3️⃣ 노년 건강운
${oldAgeHealthScore}점 ${getStarRating(oldAgeHealthScore)}
장기적인 생활습관과 노후 건강 관리 흐름을 보는 항목입니다.

4️⃣ 주의 장기
${weakOrganScore}점 ${getStarRating(weakOrganScore)}
부족한 오행인 ${weakest.name}과 관련해 특히 신경 쓰면 좋은 건강 영역입니다.

5️⃣ 생활습관 조언
${lifestyleScore}점 ${getStarRating(lifestyleScore)}
수면, 식사, 운동, 스트레스 관리처럼 일상에서 보완할 수 있는 항목입니다.

※ 건강운은 의학적 진단이 아니라 사주 오행 균형을 참고한 생활관리 조언입니다.
`;

const yearLuckText = `

📅 2026년 올해 운세
📆 5년 세운 전망
${fiveYearSeunText}
${seunText}
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
${healthFiveSetText}
🗓️ 월별 운세
${monthlyLuckText}
`;

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
🧭 대운 간지표
${Array.from({ length: 10 }, (_, i) => {
  const isYangYear =
  year % 10 === 0 ||
  year % 10 === 2 ||
  year % 10 === 4 ||
  year % 10 === 6 ||
  year % 10 === 8;

const isForward =
  (gender === "male" && isYangYear) ||
  (gender === "female" && !isYangYear);

  const step = isForward ? i : -i;

  const stem =
    ["갑","을","병","정","무","기","경","신","임","계"]
    [((year + step) % 10 + 10) % 10];
  
  const branch =
    ["자","축","인","묘","진","사","오","미","신","유","술","해"]
    [((Number(birthMonth) + step) % 12 + 12) % 12];
    const daeunStartAge = Math.max(3, Math.min(10, Math.round(Number(birthMonth) / 2 + 3)));
  const startAge = daeunStartAge + i * 10;
  const endAge = startAge + 9;

  return `${startAge}세~${endAge}세 : ${stem}${branch}대운`;
}).join("\n")}

현재 대운은 앞으로 10년 동안 삶의 방향, 재물관리, 직업 변화, 인간관계, 건강관리의 균형을 점검하는 흐름으로 볼 수 있습니다.

━━━━━━━━━━━━━━



${daeunYearlyText}

━━━━━━━━━━━━━━


`;

    const moneyScore = 70 + baseScore;
    const loveScore = 72 + (baseScore % 8);
    const healthScore = 68 + (baseScore % 9);
    const jobScore = 75 + (baseScore % 7);
    
    const luckyNumber =
      ((year + Number(birthMonth) + Number(birthDay)) % 9) + 1;

    const luckyColors = ["보라색", "금색", "파란색", "초록색", "분홍색", "흰색"];
    const luckyColor = luckyColors[year % luckyColors.length];
    
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
행운의 색상: ${todayGuide.color}

🌞 오늘의 일진과 오행
오늘의 일진: ${todayGanZhi}
오늘의 오행: ${todayElement}

🎨 오늘 나에게 맞는 색상
${todayGuide.color}

🧭 오늘 좋은 방향
${todayGuide.direction}

✅ 오늘 추천 행동
${todayGuide.action}

⚠️ 오늘 주의할 점
${todayGuide.caution}
  행운의 숫자: ${luckyNumber}
  행운의 색상: ${luckyColor}`);
  const sajuInfo = `
  [기본 정보]
  이름: ${name}
  성별: ${gender === "male" ? "남성" : "여성"}
  양력 생년월일: ${solarDate}
  음력 생년월일: ${lunarDate}
  태어난 시간: ${birthTime}
  
  [사주팔자]
  년주: ${yearGanZhi}
  월주: ${monthGanZhi}
  일주: ${dayGanZhi}
  시주: ${timeGanZhi}
  
  [오행]
  목: ${wood}
  화: ${fire}
  토: ${earth}
  금: ${metal}
  수: ${water}
  
  부족한 오행: ${weakest.name}
  강한 오행: ${strongest.name}
  
  ==================================================
                [ 십성 종합 분석 ]
==================================================
종합 십성 점수: ${totalTenGodScore}점
사주 등급: ${sajuGrade}
종합 별점: ${sajuGradeStars}

재물운 점수: ${tenGodMoneyScore}점 ${getStarRating(tenGodMoneyScore)}
재물운 해석: ${tenGodMoneyComment}

${moneyFiveSetText}

${realEstateDetailText}

직업운 점수: ${tenGodJobScore}점 ${getStarRating(tenGodJobScore)}
직업운 해석: ${tenGodJobComment}

연애운 점수: ${tenGodLoveScore}점 ${getStarRating(tenGodLoveScore)}
연애운 해석: ${tenGodLoveComment}
${spouseDetailText}
구분 | 십성 | 점수 | 별점 | 해석
년간 | ${yearTenGod} | ${yearTenGodScore}점 | ${yearTenGodStars} | ${yearTenGodText}
월간 | ${monthTenGod} | ${monthTenGodScore}점 | ${monthTenGodStars} | ${monthTenGodText}
시간 | ${timeTenGod} | ${timeTenGodScore}점 | ${timeTenGodStars} | 자녀운·말년운·표현력 참고
══════════════════════════════
📘 년간 십성 분석 : ${yearTenGod}
══════════════════════════════

💰 재물운
${yearTenGodDetail?.money || ""}

💼 직업운
${yearTenGodDetail?.job || ""}

❤️ 연애운
${yearTenGodDetail?.love || ""}

⚠️ 주의사항
${yearTenGodDetail?.caution || ""}
══════════════════════════════
📗 월간 십성 분석 : ${monthTenGod}
══════════════════════════════

월간 십성: ${monthTenGod}

💰 재물운
${monthTenGodDetail?.money || ""}

💼 직업운
${monthTenGodDetail?.job || ""}

❤️ 연애운
${monthTenGodDetail?.love || ""}

⚠️ 주의사항
${monthTenGodDetail?.caution || ""}
══════════════════════════════
📕 시간 십성 분석 : ${timeTenGod}
══════════════════════════════

시간 십성: ${timeTenGod}

💰 재물운
${timeTenGodDetail?.money || ""}

💼 직업운
${timeTenGodDetail?.job || ""}

❤️ 연애운
${timeTenGodDetail?.love || ""}

⚠️ 주의사항
${timeTenGodDetail?.caution || ""}
  [격국]
  격국: ${gyeokguk}
  격국 해석: ${gyeokgukDescription}
  
  [용신]
  용신: ${yongsin}
  희신: ${heesin}
  기신: ${gisin}
  용신 해석: ${yongsinDescription}
  
  [직업과 사업]
  직업 적성: ${careerRecommendText}
  추천 사업: ${businessRecommendText}
  
  [세운]
  ${seunText}
  
  [대운]
  ${daeunText}
  `;  
    
  setDaeunResult(daeunText);
  const aiAnswer = await generateSajuAiAnswer(`
    당신은 30년 이상 경력의 사주명리 상담가입니다.
    
    아래 사주 정보를 바탕으로 현실적인 종합 상담을 작성하세요.
    
    작성 형식:
    1. 전체 사주 총평
    2. 성격과 기질
    3. 재물운
    4. 직업운
    5. 연애운과 인간관계
    6. 건강운
    7. 올해 세운 해석
    8. 대운 흐름 해석
    9. 앞으로 3년 현실 조언
    10. 오늘부터 실천할 행동 조언
    
    조건:
- 최소 3000자 이상 작성
- 가능하면 5000자 내외 작성
- 너무 단정하지 말 것
- 격국, 십성, 용신, 희신, 기신, 세운, 대운을 반드시 반영할 것

아래 순서로 작성:

1. 전체 사주 총평
2. 성격과 기질
3. 재물운
4. 돈 버는 방식
5. 직업운
6. 사업운
7. 연애운
8. 인간관계 특징
9. 건강운
10. 올해 세운
11. 현재 대운
12. 향후 3년 전망
13. 인생에서 가장 중요한 성공 포인트
14. 반드시 조심해야 할 부분
15. 현실적인 행동 조언

실제 사주 상담소에서 상담하듯 자세히 작성할 것.
    
    ${sajuInfo}
    `);
    
    setAiResult(aiAnswer); 
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
용신 : ${yongsin}
희신 : ${heesin}
기신 : ${gisin}
━━━━━━━━━━━━━━
${yongsinDescription}
🌈 행운 색상
${luckyColorByYongsin}

🧭 행운 방향
${luckyDirectionByYongsin}

🏠 추천 환경
${luckyEnvironmentByYongsin}

🔧 부족한 오행 보완법
${weakElementGuide}

 🌞 일주 해석
${dayMasterText}

🌟 성격운
${personalityText}

💼 직업 적성 추천
${careerRecommendText}

💰 추천 사업 아이템
${businessRecommendText}

────────────

⭐ 십성 분석

👨‍👩‍👧 년간 십성 : ${yearTenGod}
${yearTenGodText}
${yearTenGodPositionText}

💼 월간 십성 : ${monthTenGod}
${monthTenGodText}
${monthTenGodPositionText}
🎯 격국 분석
기준 십성 : ${monthTenGod}
격국 : ${gyeokguk}
해석 : ${gyeokgukDescription}
⏳ 시간 십성 : ${timeTenGod}
${timeTenGodText}
${timeTenGodPositionText}

━━━━━━━━━━━━━━
🏆 종합 사주 등급
${sajuGrade} 등급
${sajuGradeStars}

종합 십성 점수 : ${totalTenGodScore}점
전체 별점 : ${sajuGradeStars}

📊 분야별 운세 점수 요약

💰 재물운
${tenGodMoneyScore}점 ${getStarRating(tenGodMoneyScore)}
${tenGodMoneyComment}

💼 직업운
${tenGodJobScore}점 ${getStarRating(tenGodJobScore)}
${tenGodJobComment}

❤️ 연애운
${tenGodLoveScore}점 ${getStarRating(tenGodLoveScore)}
${tenGodLoveComment}

━━━━━━━━━━━━━━
`);
} catch (error) {
  console.error("사주 분석 오류:", error);
  setResult("사주 분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
} finally {
  setIsAnalyzing(false);
}
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
        {isAnalyzing ? "✨ AI 사주 분석 중..." : "사주 분석하기"}
</button>
{result && (
  <button
    onClick={handleDownloadPdf}
    style={{
      width: "100%",
      marginTop: "12px",
      border: "none",
      borderRadius: "14px",
      padding: "16px",
      fontSize: "18px",
      fontWeight: "bold",
      color: "#fff",
      background: "linear-gradient(135deg,#2563eb,#06b6d4)",
      cursor: "pointer",
    }}
  >
    📄 PDF 다운로드
  </button>
)}
{isAnalyzing && (
  <div className="analyzing-box">
    <div className="spinner"></div>

    <h3>✨ AI 사주 분석 중...</h3>

    <p>🔮 사주팔자 계산 중</p>
    <p>🌳 오행 분석 중</p>
    <p>📅 올해 운세 생성 중</p>
    <p>💬 AI 상담 작성 중</p>

    <span>
      잠시만 기다려주세요.
      <br />
      나만의 사주 리포트를 생성하고 있습니다.
    </span>
  </div>
)}

        {result && (
  <>
    <div style={tabWrapStyle}>
    <button style={activeTab === "basic" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("basic")}>기본사주</button>
<button style={activeTab === "ai" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("ai")}>AI종합상담</button>
<button style={activeTab === "year" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("year")}>올해운세</button>
<button style={activeTab === "daeun" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("daeun")}>대운</button>
<button style={activeTab === "money" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("money")}>오늘의 재물운</button>
<button style={activeTab === "job" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("job")}>오늘의 직업운</button>
<button style={activeTab === "love" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("love")}>오늘의 연애운</button>
<button style={activeTab === "health" ? activeTabStyle : tabButtonStyle} onClick={() => setActiveTab("health")}>오늘의 건강운</button>
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
  padding: "24px",
  borderRadius: "18px",
  background: "#020617",
  border: "1px solid #334155",
  color: "#ffffff",
  whiteSpace: "pre-line" as const,
  lineHeight: "2",
  textAlign: "left" as const,
  fontSize: "16px",
  letterSpacing: "-0.2px",
  wordBreak: "keep-all" as const,
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
                  width: percent + "%",
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
