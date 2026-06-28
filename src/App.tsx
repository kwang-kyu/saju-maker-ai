import { useState } from "react";
import {
  getJobComboText,
  getCareerPersonaText,
  getCareerAgeText,
} from "./data/jobComboData";
import { getHealthComboText } from "./data/healthComboData";
import {
  getPersonalizedSinsalText,
  getSinsalEventText,
  getSinsalReportSectionText,
  getSinsalFlagsByDayBranch,
} from "./data/sinsalData";
import {
  getTenGodReportSectionText,
} from "./data/tenGodTextService";
import {
  getBasicSajuReportHeaderText,
  getLifePatternSectionText,
  getFiveElementReportSectionText,
  optimizePremiumReportText,
  getTimingEventText,
  getCategoryTimingEventText,
  getPremiumActionTimingText,
} from "./data/aiPromptData";

import {
  getDayMasterAdvancedAnalysis,
  getDayMasterReportSectionText,
} from "./data/dayMasterData";
import {
  createDynamicLifePatternText,
  createSummaryInsightText,
  createSummaryAdviceText,
  createLifeStoryText,
} from "./data/lifePatternData";
import { getSeunCombinationText } from "./data/seunCombinationData";
import { getSajuGrade } from "./data/sajuGradeData";
import {
  getScoreComment,
  getTodayLuckSummary,
  getFortuneScoreSectionText,
  getTodayLuckReportSectionText,
} from "./data/luckScoreData";
import { getSajuGradeComment } from "./data/sajuGradeCommentData";
import { getCareerRecommendText } from "./data/careerRecommendService";
import { getBusinessRecommendText } from "./data/businessRecommendService";
import {
  getTenGodScoreSummary,
  getStarRating,
} from "./data/tenGodScoreSummaryService";
import { getTimeGanZhiByDayStem } from "./data/tenGodService";
import {
  personalizeTenGodDetail,
  getDayTenGodComboText,
} from "./data/tenGodPersonalService";
import { getLoveAnalysisText } from "./data/loveComboData";
import {
  downloadDetailSajuPdf,
  downloadSummarySajuPdf,
} from "./services/reportPdfService";
import {
  cleanDetailText,
  cleanSummaryText,
} from "./services/textCleanupService";
import { cleanPdfFinalText } from "./services/pdfFinalCleanupService";
import {
  getSajuEventPredictionText,
  getMultiYearEventPredictionText,
} from "./services/sajuEventPredictionService";
import { getRelationEventText } from "./services/sajuRelationEventService";
import { getEventLevel } from "./services/sajuEventLevelService";
import { getLifePhaseText } from "./services/sajuLifePhaseService";
import { convertToSajuSolarDate } from "./services/sajuDateService";
import { getSajuGanjiInfo } from "./services/sajuGanjiService";
import { getSajuElementInfo } from "./services/sajuElementService";
import { getSajuStrengthInfo } from "./services/sajuStrengthService";
import { getSajuYongsinInfo } from "./services/sajuYongsinService";
import {
  getSajuTenGod,
  getTenGodDetails,
} from "./services/sajuTenGodService";
import { getSajuTodayLuckInfo } from "./services/sajuTodayLuckService";
import { getSajuDayMaster } from "./services/sajuDayMasterService";
import { getSajuHealthText } from "./services/sajuHealthService";
import { getHealthFiveSetText } from "./services/sajuHealthFiveSetService";
import { getMoneyFiveSetText } from "./services/sajuMoneyFiveSetService";
import { getRealEstateDetailText } from "./services/sajuRealEstateDetailService";
import { getSpouseDetailText } from "./services/sajuSpouseDetailService";
import { getHealthDetailText } from "./services/sajuHealthDetailService";
import { getJobDetailText } from "./services/sajuJobDetailService";
import { getMoneyDetailText } from "./services/sajuMoneyDetailService";
import { getLoveDetailText } from "./services/sajuLoveDetailService";
import { getSajuInfoReportText } from "./services/sajuInfoReportService";
import { getCurrentYearLuckInfo } from "./services/sajuTodayLuckService";
import {
  getSajuResultReportText,
  getLifeAreaPersonalTexts,
} from "./services/sajuResultReportService";
import { getSajuAiPromptText } from "./services/sajuAiPromptService";
import { getPremiumAiReportText } from "./services/sajuPremiumReportService";
import { getTodayLuckFullReportText } from "./services/sajuTodayLuckReportService";
import {
  getTimingReportText,
  getCategoryTimingTexts,
} from "./services/sajuTimingReportService";
import { getHapChungPersonalReportText } from "./services/sajuSinsalReportService";
import {
  getLifeAreaConsultingTexts,
  getLifeAreaGuideTexts,
  getLifeAreaEventTexts,
} from "./services/sajuYearLuckBuildService";
import { getSajuFortuneScores } from "./services/sajuFortuneScoreService";
import {
  getHealthDetailScores,
  getSajuDetailScoreBundle,
} from "./services/sajuDetailScoreService";
import { getMoneyPersonalTypeText } from "./services/sajuMoneyPersonalTypeService";
import { getSajuLuckyInfo } from "./services/sajuLuckyService";
import { getSajuGyeokguk } from "./services/sajuGyeokgukService";
import { FiveElementGraph } from "./components/FiveElementGraph";
import { TodayLuckTabs } from "./components/TodayLuckTabs";
import { TodayLuckContent } from "./components/TodayLuckContent";
import { PdfDownloadButtons } from "./components/PdfDownloadButtons";
import {
  getFiveYearSeunText,
  getMonthlyLuckText,
  getSeunText,
  getDaeunText,
  getYearLuckText,
  getGyeokgukStrengthSeunText,
  getPremiumYearLuckText,
  getMonthBranchSeunText,
  getDaeunSeunCombinedText,
  getYongsinSeunText,
  getDaeunSeunYongsinCrossText,
  getActionGuideText,
  getFiveCrossEventText,
  getLifeAreaEventText,
  getConsultingWrapText,
} from "./data/seunDaeunService";
import {
  getYearLuckReportSectionText,
} from "./data/yearLuckReportService";
import {
  TEN_GOD_DB,
  getTenGodPositionReportText,
} from "./data/tenGodPositionService";
import {
  getWeakElementGuide,
  getLuckyDirectionByYongsin,
  getLuckyEnvironmentByYongsin,
  normalizeStem,
  getLuckyColorByYongsin,
} from "./data/fiveElementService";

import {
  getGeokgukAdvancedAnalysis,
  getStrengthGeokgukCombinationAnalysis,
  getGyeokgukYongsinCrossText,
} from "./data/gyeokgukPersonalData";
import {
  getPersonalizedHapChungText,
  getHapChungEventText,
} from "./data/hapChungData";
import {
  getMonthlyEventText,
  getMonthlyRealEstateGuideText,
  getMonthlyChecklistText,
} from "./data/monthlyConsultingService";
import { getPremiumSummaryText } from "./data/premiumSummaryService";
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
  const [summaryAdviceText, setSummaryAdviceText] = useState("");
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
  
  const handleDownloadDetailPdf = async () => {
    await downloadDetailSajuPdf({
      name,
      result,
      aiResult,
      daeunResult,
      moneyResult,
      jobResult,
      loveResult,
      healthResult,
    });
  };
  const handleDownloadSummaryPdf = async () => {
    await downloadSummarySajuPdf({
      name,
      birthYear,
      birthMonth,
      birthDay,
      gender,
      result: cleanPdfFinalText(cleanSummaryText(result)),
      moneyResult: cleanPdfFinalText(cleanSummaryText(moneyResult)),
      jobResult: cleanPdfFinalText(cleanSummaryText(jobResult)),
      loveResult: cleanPdfFinalText(cleanSummaryText(loveResult)),
      healthResult: cleanPdfFinalText(cleanSummaryText(healthResult)),
      summaryAdviceText: cleanPdfFinalText(cleanSummaryText(summaryAdviceText)),
    });
  };  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult("");
    setAiResult("");
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
      const {
        year,
        solarDate,
        lunarDate,
        finalSolarYear,
        finalSolarMonth,
        finalSolarDay,
      } = convertToSajuSolarDate({
        birthYear,
        birthMonth,
        birthDay,
        calendarType,
      });

      const {
          yearGanZhi,
          monthGanZhi,
          dayGanZhi,
        } = getSajuGanjiInfo({
          finalSolarYear,
          finalSolarMonth,
          finalSolarDay,
          safeCall,
        });
        
    const rawDayStemForTime = String(dayGanZhi).charAt(0);
const dayStemForTime =
  normalizeStem(rawDayStemForTime) ?? rawDayStemForTime;
    
    const timeGanZhi = getTimeGanZhiByDayStem(dayStemForTime, birthTime);
    const {
      wood,
      fire,
      earth,
      metal,
      water,
      weakest,
      strongest,
    } = getSajuElementInfo({
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      timeGanZhi,
    });  
    const {
      yongsin,
      heesin,
      gisin,
      yongsinDescription,
    } = getSajuYongsinInfo(weakest.name, strongest.name);
const dayStem = String(dayGanZhi).charAt(0);
const yearStem = String(yearGanZhi).charAt(0);
const monthStem = String(monthGanZhi).charAt(0);

const normalizedDayStem = normalizeStem(dayStem) ?? dayStem;
const normalizedYearStem = normalizeStem(yearStem) ?? yearStem;
const normalizedMonthStem = normalizeStem(monthStem) ?? monthStem;
const dayBranch = String(dayGanZhi).charAt(1);

const {
  hasCheonEul,
  hasDohwa,
  hasYeokma,
  hasHwagae,
  hasMoonChang,
} = getSinsalFlagsByDayBranch(dayBranch);
const dayStrengthAnalysis = getSajuStrengthInfo(
  normalizedDayStem,
  monthGanZhi,
  wood,
  fire,
  earth,
  metal,
  water
);


const luckyColorByYongsin =
  getLuckyColorByYongsin(yongsin);
    const luckyDirectionByYongsin =
    getLuckyDirectionByYongsin(yongsin);
  
  const luckyEnvironmentByYongsin =
    getLuckyEnvironmentByYongsin(yongsin);
      const weakElementGuide =
      getWeakElementGuide(weakest.name); 
setFiveCounts({
  wood,
  fire,
  earth,
  metal,
  water,
});

  
const dayMasterDetail = getSajuDayMaster(dayGanZhi);

const healthText = getSajuHealthText(
  dayMasterDetail.weakness,
  weakest.name
); 
const baseScore = year % 10;

const { todayGanZhi,todayElement, todayGuide } =
  getSajuTodayLuckInfo(safeCall);

const yearTenGod = getSajuTenGod(normalizedDayStem, normalizedYearStem);
const currentYearLuckInfo = getCurrentYearLuckInfo("비견");

console.log(
  "세운 객체 확인",
  JSON.stringify(currentYearLuckInfo, null, 2)
);
const monthTenGod = getSajuTenGod(normalizedDayStem, normalizedMonthStem);
const gyeokguk = getSajuGyeokguk(monthTenGod);
 
const gyeokgukYongsinCrossText = getGyeokgukYongsinCrossText(
  gyeokguk,
  dayStrengthAnalysis.strengthType,
  yongsin,
  heesin,
  dayStem,
  strongest.name,
  weakest.name
);
console.log("십성 계산 확인", {
  dayGanZhi,
  yearGanZhi,
  monthGanZhi,
  dayStem,
  yearStem,
  monthStem,
  yearTenGod,
  monthTenGod,
});
const timeTenGod =
  birthTime === "시간 모름"
    ? "시간 미입력"
    : getSajuTenGod(dayStem, String(timeGanZhi).charAt(0));
    const tenGodList = [yearTenGod, monthTenGod, timeTenGod];

const tenGodCounts = tenGodList.reduce((acc, tenGod) => {
  if (!acc[tenGod]) acc[tenGod] = 0;
  acc[tenGod] += 1;
  return acc;
}, {} as Record<string, number>);

const mainTenGod = tenGodList
  .filter((tenGod) => tenGod && tenGod !== "시간 미입력")
  .sort((a, b) => (tenGodCounts[b] || 0) - (tenGodCounts[a] || 0))[0];

  const tenGodBalanceText =
  mainTenGod && tenGodCounts[mainTenGod] >= 2
    ? `${mainTenGod} 기운이 ${tenGodCounts[mainTenGod]}회 반복되어 나타납니다.

이 사주에서는 ${mainTenGod} 십성이 성격, 재물, 직업, 인간관계 해석의 중심축으로 작용합니다.

${mainTenGod === "비견" ? "독립심·주도성이 강하며 자신의 방식으로 결과를 만들려는 성향이 강합니다." : ""}
${mainTenGod === "겁재" ? "경쟁심과 추진력이 강하지만 돈거래나 공동투자에는 신중해야 합니다." : ""}
${mainTenGod === "식신" ? "꾸준히 생산하고 결과를 만드는 능력이 강한 구조입니다." : ""}
${mainTenGod === "상관" ? "창의성·표현력·기획력이 강하게 드러나는 타입입니다." : ""}
${mainTenGod === "편재" ? "사업 감각과 기회 포착 능력이 뛰어난 편입니다." : ""}
${mainTenGod === "정재" ? "안정적인 재물 관리와 자산 축적 능력이 강합니다." : ""}
${mainTenGod === "편관" ? "도전정신과 돌파력이 강하며 압박에도 강한 편입니다." : ""}
${mainTenGod === "정관" ? "책임감과 조직 적응력이 뛰어난 구조입니다." : ""}
${mainTenGod === "편인" ? "새로운 지식 습득과 직관력이 강하게 나타납니다." : ""}
${mainTenGod === "정인" ? "배움·연구·문서·자격 분야와 인연이 깊습니다." : ""}`
    : "십성이 고르게 분포되어 있어 특정 성향 하나로 단정하기보다 상황에 따라 여러 능력이 함께 나타나는 구조입니다.";
   
    const yearTenGodText = TEN_GOD_DB[yearTenGod] || "";
    const monthTenGodText = TEN_GOD_DB[monthTenGod] || "";
    
    const {
      yearTenGodScore,
      monthTenGodScore,
      timeTenGodScore,
      yearTenGodStars,
      monthTenGodStars,
      timeTenGodStars,
      totalTenGodScore,
      sajuGradeStars,
      tenGodMoneyScore,
      tenGodJobScore,
      tenGodLoveScore,
      tenGodMoneyComment,
      tenGodJobComment,
      tenGodLoveComment,
    
    } = getTenGodScoreSummary(
      yearTenGod,
      monthTenGod,
      timeTenGod
    );
    const tenGodReportSectionText = getTenGodReportSectionText({
      yearTenGod,
      monthTenGod,
      timeTenGod,
      yearTenGodScore,
      monthTenGodScore,
      timeTenGodScore,
      yearTenGodStars,
      monthTenGodStars,
      timeTenGodStars,
    });
    const {
      earningScore,
      savingScore,
      investmentScore,
      realEstateScore,
      businessScore,
      spouseScore,
      meetingScore,
      marriageScore,
      spouseJobScore,
      relationshipCautionScore,
    } = getSajuDetailScoreBundle({
      tenGodMoneyScore,
      tenGodLoveScore,
      tenGodJobScore,
      baseScore,
    });
      const moneyFiveSetText = getMoneyFiveSetText({
        earningScore,
        savingScore,
        investmentScore,
        realEstateScore,
        businessScore,
      });
      
      const realEstateDetailText = getRealEstateDetailText({
        realEstateScore,
        businessScore,
      });
      
      const spouseDetailText = getSpouseDetailText({
        spouseScore,
        meetingScore,
        marriageScore,
        spouseJobScore,
        relationshipCautionScore,
      });
  

      const {
        yearTenGodDetail,
        monthTenGodDetail,
        timeTenGodDetail,
      } = getTenGodDetails({
        yearTenGod,
        monthTenGod,
        timeTenGod,
        tenGodCounts,
        dayStem,
        gyeokguk,
        dayStrengthAnalysis,
        strongest,
        weakest,
        personalizeTenGodDetail,
      });
  
const sinsalText = getPersonalizedSinsalText({
  name,
  dayStem,
  dayBranch,
  gyeokguk,
  strongest,
  weakest,
  dayStrengthAnalysis,
  hasCheonEul,
  hasDohwa,
  hasYeokma,
  hasHwagae,
  hasMoonChang,
});
const sinsalEventText = getSinsalEventText([
  hasCheonEul ? "천을귀인" : "",
  hasDohwa ? "도화살" : "",
  hasYeokma ? "역마살" : "",
  hasHwagae ? "화개살" : "",
  hasMoonChang ? "문창귀인" : "",
].filter(Boolean));
const hapChungRelationText = getPersonalizedHapChungText(
  name,
  gyeokguk,
  strongest,
  weakest,
  dayStrengthAnalysis
);
const hapChungEventText = getHapChungEventText(
  hapChungRelationText
    .split("\n")
    .map((line) => line.match(/작용:\s*(.+?)\s*\//)?.[1])
    .filter(Boolean) as string[]
);
const hapChungPersonalText = getHapChungPersonalReportText({
  name,
  dayStem,
  dayBranch,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  hapChungRelationText,
});
const relationEventText = getRelationEventText({
  relationText: hapChungRelationText,
  dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  yongsin,
  strongestName: strongest.name,
  weakestName: weakest.name,
});
const relationEventLevel = getEventLevel({
  relationText: hapChungRelationText,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
});
const lifePhaseText = getLifePhaseText(45, relationEventLevel);
    const sajuGrade = getSajuGrade(
      totalTenGodScore,
      gyeokguk,
      strongest.name,
      weakest.name
    );
    const sajuGradeComment = getSajuGradeComment(
      sajuGrade,
      dayStem,
      gyeokguk,
      monthTenGod,
      strongest.name,
      weakest.name,
      dayStrengthAnalysis.strengthType,
      tenGodBalanceText
    );  
    const careerRecommendText = getCareerRecommendText({
      gyeokguk,
      dayStem,
      strongestName: strongest.name,
      weakestName: weakest.name,
      dayStrengthType: dayStrengthAnalysis.strengthType,
      monthTenGod,
    });    
    const businessRecommendText = getBusinessRecommendText({
      gyeokguk,
      strongestName: strongest.name,
    });

    
const tenGodPositionReportText = getTenGodPositionReportText({
  name,
  dayStem,
  yearTenGod,
  monthTenGod,
  timeTenGod,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  yearDetail: yearTenGodDetail,
  monthDetail: monthTenGodDetail,
  timeDetail: timeTenGodDetail,
});
  

    const monthlyLuckText = getMonthlyLuckText({
      dayMaster: dayStem,
      geokguk: gyeokguk,
      strengthType: dayStrengthAnalysis.strengthType,
      strongestElementName: strongest.name,
      weakestElementName: weakest.name,
    });

    const monthlyEventText = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthElementCycle = ["목", "화", "토", "금", "수"];
      const monthElement = monthElementCycle[index % monthElementCycle.length];
    
      return getMonthlyEventText({
        month,
        monthElement,
        monthTenGod,
        dayStem,
        gyeokguk,
        strengthType: dayStrengthAnalysis.strengthType,
        yongsin,
      });
    }).join("\n\n");
    const monthlyRealEstateGuideText = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthElementCycle = ["목", "화", "토", "금", "수"];
      const monthElement = monthElementCycle[index % monthElementCycle.length];
    
      return getMonthlyRealEstateGuideText({
        month,
        monthElement,
        monthTenGod,
        gyeokguk,
        strengthType: dayStrengthAnalysis.strengthType,
      });
    }).join("\n\n");

    const monthlyChecklistText = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthElementCycle = ["목", "화", "토", "금", "수"];
      const monthElement = monthElementCycle[index % monthElementCycle.length];
    
      return getMonthlyChecklistText({
        month,
        monthElement,
        monthTenGod,
        strengthType: dayStrengthAnalysis.strengthType,
      });
    }).join("\n\n");

    const currentYear = new Date().getFullYear();
const reportYearGanji = currentYearLuckInfo.yearGanji;
const currentYearElement = currentYearLuckInfo.yearElement;
const currentYearTenGod = currentYearLuckInfo.tenGodRelation;
const gyeokgukStrengthSeunText = getGyeokgukStrengthSeunText({
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  seunTenGod: currentYearTenGod,
});
const seunText = getSeunText({
  name,
  year: currentYear,
  seunGanji: reportYearGanji,
  seunTenGod: currentYearTenGod,
  dayMaster: dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestElement: strongest.name,
  weakestElement: weakest.name,
  combinationText: gyeokgukStrengthSeunText,
  sinsalText: `${sinsalText}

${sinsalEventText}`,
hapChungText: `${hapChungRelationText}

${hapChungEventText}`,
  moneyText: `${strongest.name} 기운이 강하게 작용하므로 자신의 장점을 활용한 안정적인 수익 구조를 만드는 것이 중요합니다. 부족한 ${weakest.name} 기운은 무리한 투자와 과도한 확장을 경계해야 함을 의미합니다.`,

jobText: `${gyeokguk}의 성향과 ${dayStrengthAnalysis.strengthType} 흐름을 고려할 때, 현재 직업에서는 실력과 신뢰를 쌓으며 장기적인 방향을 설계하는 것이 유리합니다.`,

loveText: `${currentYearTenGod} 기운이 들어오는 시기로 인간관계와 감정 표현 방식의 변화가 나타날 수 있습니다. 상대의 입장과 속도를 함께 고려하면 관계의 균형을 유지하기 좋습니다.`,
});


const fiveYearSeunText = getFiveYearSeunText({
  year,
  baseScore,
  currentYear,
  reportYearGanji,
  currentYearElement,
  currentYearTenGod,
  dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  strongestElementName: strongest.name,
  weakestElementName: weakest.name,
});
const {
  healthBaseScore,
  middleAgeHealthScore,
  oldAgeHealthScore,
  weakOrganScore,
  lifestyleScore,
} = getHealthDetailScores({
  baseScore,
});
const healthFiveSetText = getHealthFiveSetText({
  healthBaseScore,
  middleAgeHealthScore,
  oldAgeHealthScore,
  weakOrganScore,
  lifestyleScore,
  weakestName: weakest.name,
});
const monthBranchSeunText = getMonthBranchSeunText(
  "월지",
  currentYearTenGod
);

const daeunTenGod = monthTenGod;
const daeunSeunCombinedText = getDaeunSeunCombinedText(
  daeunTenGod,
  currentYearTenGod
);
const daeunSeunYongsinCrossText =
  getDaeunSeunYongsinCrossText({
    daeunTenGod,
    seunTenGod: currentYearTenGod,
    yongsin,
    heesin,
    gisin,
    gyeokguk,
    strengthType: dayStrengthAnalysis.strengthType,
  });
const yongsinSeunText = getYongsinSeunText(
  yongsin,
  heesin,
  gisin,
  currentYearTenGod
);

const moneyPredictedEventText = getSajuEventPredictionText({
  year: currentYear + 1,
  category: "money",
  dayStem: dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  yongsin,
});

const jobPredictedEventText = getSajuEventPredictionText({
  year: currentYear + 1,
  category: "job",
  dayStem: dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  yongsin,
});

const lovePredictedEventText = getSajuEventPredictionText({
  year: currentYear + 1,
  category: "love",
  dayStem: dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  yongsin,
});

const healthPredictedEventText = getSajuEventPredictionText({
  year: currentYear + 1,
  category: "health",
  dayStem: dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  yongsin,
});

const moneyLongEventText = getMultiYearEventPredictionText({
  startYear: currentYear + 1,
  category: "money",
});

const jobLongEventText = getMultiYearEventPredictionText({
  startYear: currentYear + 1,
  category: "job",
});

const loveLongEventText = getMultiYearEventPredictionText({
  startYear: currentYear + 1,
  category: "love",
});

const healthLongEventText = getMultiYearEventPredictionText({
  startYear: currentYear + 1,
  category: "health",
});
const {
  moneyEventText,
  jobEventText,
  loveEventText,
  healthEventText,
} = getLifeAreaEventTexts({
  getLifeAreaEventText,
  tenGod: currentYearTenGod,
  yongsin,
  gisin,
});
const enhancedMoneyEventText = moneyEventText + "\n\n" + moneyPredictedEventText + "\n\n" + moneyLongEventText;
const enhancedJobEventText = jobEventText + "\n\n" + jobPredictedEventText + "\n\n" + jobLongEventText;
const enhancedLoveEventText = loveEventText + "\n\n" + lovePredictedEventText + "\n\n" + loveLongEventText;
const enhancedHealthEventText = healthEventText + "\n\n" + healthPredictedEventText + "\n\n" + healthLongEventText;
const {
  moneyGuideText,
  jobGuideText,
  loveGuideText,
  healthGuideText,
} = getLifeAreaGuideTexts({
  currentYearTenGod,
  yongsin,
  gisin,
  getActionGuideText,
});

const {
  moneyConsultingText,
  jobConsultingText,
  loveConsultingText,
  healthConsultingText,
} = getLifeAreaConsultingTexts({
  moneyEventText: enhancedMoneyEventText,
jobEventText: enhancedJobEventText,
loveEventText: enhancedLoveEventText,
healthEventText: enhancedHealthEventText,
  moneyGuideText,
  jobGuideText,
  loveGuideText,
  healthGuideText,
  getConsultingWrapText,
});

const fiveCrossEventText = getFiveCrossEventText({
  monthBranch: String(monthGanZhi).charAt(1),
  daeunTenGod,
  seunTenGod: currentYearTenGod,
  yongsin,
  gyeokguk,
});
const seunCombinationText = getSeunCombinationText({
  monthBranch: String(monthGanZhi).charAt(1),
  seunTenGod: currentYearTenGod,
  strengthType: dayStrengthAnalysis.strengthType,
  daeunTenGod,
});
const premiumYearLuckText = getPremiumYearLuckText({
  year: currentYear,
  dayStem,
  gyeokguk,
  strengthType: dayStrengthAnalysis.strengthType,
  yearTenGod: currentYearTenGod,
  monthBranch: String(monthGanZhi).charAt(1),
  yongsin,
  heesin,
  gisin,
  strongestName: strongest.name,
  weakestName: weakest.name,
  sinsalText,
  monthBranchSeunText,
  daeunSeunCombinedText,
  daeunSeunYongsinCrossText,
  yongsinSeunText,
  moneyGuideText: optimizePremiumReportText(moneyConsultingText),
  jobGuideText: optimizePremiumReportText(jobConsultingText),
  loveGuideText: optimizePremiumReportText(loveConsultingText),
  healthGuideText: optimizePremiumReportText(healthConsultingText),
  premiumSeunEventText: `${fiveCrossEventText}

${seunCombinationText}`,
});
const safePremiumYearLuckText = premiumYearLuckText
  .replaceAll("올해 간지 : undefined", `올해 간지 : ${reportYearGanji}`)
  .replaceAll("올해 간지: undefined", `올해 간지 : ${reportYearGanji}`)
  .replaceAll("올해 오행 : undefined", `올해 오행 : ${currentYearElement}`)
  .replaceAll("올해 오행: undefined", `올해 오행 : ${currentYearElement}`)
  .replaceAll("나와의 십성 관계 : undefined", `나와의 십성 관계 : ${currentYearTenGod}`)
  .replaceAll("나와의 십성 관계: undefined", `나와의 십성 관계 : ${currentYearTenGod}`)
  .replaceAll("올해는 undefined 기운", `올해는 ${currentYearElement} 기운`)
  .replaceAll("부족한 기운인 undefined", `부족한 기운인 ${weakest.name}`)
  .replaceAll("강한 기운인 undefined", `강한 기운인 ${strongest.name}`)
  .replace(/\nundefined\n/g, `\n${currentYearLuckInfo.summary}\n`);
  console.log("safePremiumYearLuckText");
  console.log(safePremiumYearLuckText);
const yearLuckText = getYearLuckText({
  currentYear,
  fiveYearSeunText,
  seunText: safePremiumYearLuckText,
  strongestName: strongest.name,
  weakestName: weakest.name,
  healthText,
  healthFiveSetText,
  monthlyLuckText,
});

const daeunStartYear = currentYear;
const daeunText = getDaeunText({
  daeunStartYear,
  birthMonth: Number(birthMonth),
  gender,
  dayMaster: dayStem,
gyeokguk,
strengthType: dayStrengthAnalysis.strengthType,
strongestElement: strongest.name,
weakestElement: weakest.name,
sinsalText,

});
const yearLuckReportSectionText =
  getYearLuckReportSectionText({
    yearLuckText,
    daeunText,
    fiveYearSeunText,
    monthlyLuckText: `${monthlyLuckText}

    ${monthlyEventText}

    ${monthlyRealEstateGuideText}

    ${monthlyChecklistText}`,
  });
const sinsalReportSectionText = getSinsalReportSectionText({
  sinsalText,
  sinsalEventText,
  hapChungEventText,
  yearLuckText,
  daeunText,
});
const {
  moneyScore,
  loveScore,
  healthScore,
  jobScore,
} = getSajuFortuneScores({
  baseScore,
  dayStem,
  gyeokguk,
  monthTenGod,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
});

    
const { luckyNumber, luckyColor } = getSajuLuckyInfo({
  year,
  birthMonth,
  birthDay,
});
    
const {
  moneyPersonalTypeText,
  jobTypeText,
  loveAnalysisText,
  healthPersonalTypeText,
} = getLifeAreaPersonalTexts({
  name,
  dayStem,
  gyeokguk,
  monthTenGod,
  timeTenGod,
  strengthType: dayStrengthAnalysis.strengthType,
  strongestName: strongest.name,
  weakestName: weakest.name,
  moneyScore,
  hasDohwa,
  hasYeokma,
  hasHwagae,

  getMoneyPersonalTypeText,
  getJobComboText,
  getLoveAnalysisText,
  getHealthComboText,
});
setMoneyResult(
  getMoneyDetailText({
    name,
    dayStem,
    gyeokguk,
    strengthType: dayStrengthAnalysis.strengthType,
    strongestName: strongest.name,
    weakestName: weakest.name,
    moneyScore,
    moneyPersonalTypeText,
  })
);

const careerPersonaText = getCareerPersonaText(
  dayStem,
  gyeokguk,
  dayStrengthAnalysis.strengthType,
  strongest.name,
  weakest.name
);
const careerAgeText = getCareerAgeText(
  Number(birthYear)
);

setJobResult(
  getJobDetailText({
    name,
    dayStem,
    gyeokguk,
    monthTenGod,
    strengthType: dayStrengthAnalysis.strengthType,
    strongestName: strongest.name,
    weakestName: weakest.name,
    jobTypeText,
  }) + "\n\n" + careerPersonaText + "\n\n" + careerAgeText
);

setLoveResult(
  getLoveDetailText({
    loveAnalysisText,
  })
);
setHealthResult(
  getHealthDetailText({
    name,
    dayStem,
    gyeokguk,
    strengthType: dayStrengthAnalysis.strengthType,
    strongestName: strongest.name,
    weakestName: weakest.name,
    healthPersonalTypeText,
  })
);

  const fortuneScoreSectionText = getFortuneScoreSectionText({
    moneyScore,
    jobScore,
    loveScore,
    healthScore,
    moneyText: moneyPersonalTypeText,
    jobText: jobTypeText,
    loveText: loveAnalysisText,
    healthText: healthPersonalTypeText,
    getStarRating,
  });

  const todayLuckReportSectionText = getTodayLuckReportSectionText({
    fortuneScoreSectionText,
    todayLuckSummaryText: getTodayLuckSummary({
      moneyScore,
      loveScore,
      healthScore,
      jobScore,
      luckyNumber,
      luckyColor,
      todayGanZhi,
      todayElement,
      todayGuide,
    }),
  });
  setYearResult(
    getTodayLuckFullReportText({
      yearLuckReportSectionText,
      todayLuckReportSectionText,
    })
  );

    const dayTenGodComboText = getDayTenGodComboText(
      dayStem,
      monthTenGod,
      dayMasterDetail.title
    );
    const summaryInsightText = createSummaryInsightText({
      monthTenGod,
      timeTenGod,
      strongestName: strongest.name,
      dayMasterPersonality: dayMasterDetail.personality,
      dayMasterMoney: dayMasterDetail.money,
      dayMasterJob: dayMasterDetail.job,
      dayMasterWeakness: dayMasterDetail.weakness,
    });  
    const lifeStoryText = createLifeStoryText({
      dayMaster: dayStem,
      gyeokguk,
      strengthType: dayStrengthAnalysis.strengthType,
      monthTenGod,
      strongestName: strongest.name,
    });
    const newSummaryAdviceText = createSummaryAdviceText({
      gyeokguk,
      strengthType: dayStrengthAnalysis.strengthType,
      strongestName: strongest.name,
      weakestName: weakest.name,
    });
setSummaryAdviceText(newSummaryAdviceText);
const sajuInfo = getSajuInfoReportText({
  summaryInsightText,
  lifeStoryText,

  name,
  gender,
  solarDate,
  lunarDate,
  birthTime,

  yearGanZhi,
  monthGanZhi,
  dayGanZhi,
  timeGanZhi,

  wood,
  fire,
  earth,
  metal,
  water,

  weakestName: weakest.name,
  strongestName: strongest.name,

  totalTenGodScore,
  sajuGrade,
  sajuGradeStars,

  tenGodMoneyScore,
  tenGodMoneyStars: getStarRating(tenGodMoneyScore),
  tenGodMoneyComment,

  moneyFiveSetText,
  realEstateDetailText,

  tenGodJobScore,
  tenGodJobStars: getStarRating(tenGodJobScore),
  tenGodJobComment,

  tenGodLoveScore,
  tenGodLoveStars: getStarRating(tenGodLoveScore),
  tenGodLoveComment,

  spouseDetailText,

  yearTenGod,
  monthTenGod,
  timeTenGod,

  yearTenGodScore,
  monthTenGodScore,
  timeTenGodScore,

  yearTenGodStars,
  monthTenGodStars,
  timeTenGodStars,

  yearTenGodText,
  monthTenGodText,

  tenGodPositionReportText,

  gyeokguk,
  geokgukAdvancedAnalysisText:
    getGeokgukAdvancedAnalysis(gyeokguk),

  gyeokgukYongsinCrossText,

  yongsin,
  heesin,
  gisin,
  yongsinDescription,

  dayTenGodComboText,

  careerRecommendText,
  businessRecommendText,

  seunText,
  daeunText,
});
    
  setDaeunResult(daeunText);
  const rawAiAnswer = await generateSajuAiAnswer(
    getSajuAiPromptText({
      name,
      dayStem,
      gyeokguk,
      monthTenGod,
      yearTenGod,
      timeTenGod,
  
      monthTenGodJob: monthTenGodDetail?.job,
      yearTenGodJob: yearTenGodDetail?.job,
      timeTenGodJob: timeTenGodDetail?.job,
  
      tenGodBalanceText,
      strengthType: dayStrengthAnalysis.strengthType,
      strongestName: strongest.name,
      weakestName: weakest.name,
  
      yongsin,
      heesin,
      gisin,
  
      sajuGrade,
      sajuGradeComment,
      totalTenGodScore,
  
      moneyScore,
      jobScore,
      loveScore,
      healthScore,
  
      hapChungRelationText,
      sinsalText,
  
      sajuInfo,
      scoreComment: getScoreComment,
    })
  );
    
    const dayStemForAdvanced = String(dayGanZhi).charAt(0);

    const dayMasterAdvancedText =
      getDayMasterAdvancedAnalysis(dayStemForAdvanced);
    
    const geokgukAdvancedText =
      getGeokgukAdvancedAnalysis(gyeokguk);
    
    const combinationAdvancedText =
      getStrengthGeokgukCombinationAnalysis(
        dayStrengthAnalysis.strengthType,
        gyeokguk
      );
    
    const dynamicLifePatternText = createDynamicLifePatternText(
      name,
      dayStemForAdvanced,
      gyeokguk,
      dayStrengthAnalysis.strengthType
    ); 
    const dayMasterReportSectionText = getDayMasterReportSectionText({
      dayMasterTitle: dayMasterDetail.title,
      personalityText: dayMasterDetail.personality,
      dynamicLifePatternText,
      loveText: dayMasterDetail.love,
      careerRecommendText,
      businessRecommendText,
    });
    setResult(
      cleanPdfFinalText(cleanDetailText(
        getSajuResultReportText({
          basicSajuReportHeaderText: getBasicSajuReportHeaderText({
            name,
            calendarType,
            solarDate,
            lunarDate,
            birthTime,
            gender,
            yearGanZhi,
            monthGanZhi,
            dayGanZhi,
            timeGanZhi,
            dayMasterAdvancedText,
          }),
    
        lifePatternSectionText: getLifePatternSectionText({
          geokgukAdvancedText,
          dynamicLifePatternText,
          combinationAdvancedText,
        }),

        premiumSummaryText: cleanSummaryText(
          getPremiumSummaryText({
            strongestName: strongest.name,
            weakestName: weakest.name,
            strengthType: dayStrengthAnalysis.strengthType,
            gyeokguk,
          })
        ),
    
        fiveElementReportSectionText: getFiveElementReportSectionText({
          wood,
          fire,
          earth,
          metal,
          water,
          weakestName: weakest.name,
          strongestName: strongest.name,
          yongsin,
          heesin,
          gisin,
          yongsinDescription,
          strengthType: dayStrengthAnalysis.strengthType,
          strengthScore: dayStrengthAnalysis.score,
          strengthReason: dayStrengthAnalysis.reason,
        }),
    
        sinsalReportSectionText,
        hapChungPersonalText:
        hapChungPersonalText +
        "\n\n■ 합충형파해 사건 강도 : " +
        relationEventLevel +
        "\n\n" +
        lifePhaseText +
        "\n\n" +
  
        relationEventText,
        luckyColorByYongsin,
        luckyDirectionByYongsin,
        luckyEnvironmentByYongsin,
        weakElementGuide,
        dayMasterReportSectionText,
        tenGodReportSectionText,
      })
    )
  )
);

const timingEventText = getTimingEventText({
  strengthType: dayStrengthAnalysis.strengthType,
  yongsin,
  gisin,
  currentYear,
  daeunStartYear,
});

const premiumActionTimingText = getPremiumActionTimingText({
  daeunTenGod,
  seunTenGod: currentYearTenGod,
  yongsin,
  gisin,
  strengthType: dayStrengthAnalysis.strengthType,
});
const {
  moneyTimingText,
  jobTimingText,
  loveTimingText,
  healthTimingText,
} = getCategoryTimingTexts({
  getCategoryTimingEventText,
  tenGod: currentYearTenGod,
  yongsin,
  gisin,
  strengthType: dayStrengthAnalysis.strengthType,
});

const timingReportText = getTimingReportText({
  timingEventText,
  moneyTimingText,
  jobTimingText,
  loveTimingText,
  healthTimingText,
  premiumActionTimingText,
});

const aiAnswer = getPremiumAiReportText({
  rawAiAnswer,
  timingEventText: timingReportText,
  moneyTimingText: "",
  jobTimingText: "",
  loveTimingText: "",
  healthTimingText: "",
  premiumActionTimingText: "",
});
setAiResult(aiAnswer);
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
              style={
                time === "시간 모름"
                  ? {
                      ...(birthTime === time ? activeSmallButtonStyle : smallButtonStyle),
                      gridColumn: "1 / span 2",
                      width: "100%",
                    }
                  : birthTime === time
                  ? activeSmallButtonStyle
                  : smallButtonStyle
              }
              onClick={() => setBirthTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "-10px", marginBottom: "18px" }}>
  현재 선택된 시간: {birthTime}
</p>
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
  <PdfDownloadButtons
    handleDownloadSummaryPdf={handleDownloadSummaryPdf}
    handleDownloadDetailPdf={handleDownloadDetailPdf}
  />
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
  <TodayLuckTabs
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  tabWrapStyle={tabWrapStyle}
  tabButtonStyle={tabButtonStyle}
  activeTabStyle={activeTabStyle}
/>

<TodayLuckContent
  activeTab={activeTab}
  result={result}
  moneyResult={moneyResult}
  jobResult={jobResult}
  loveResult={loveResult}
  healthResult={healthResult}
  yearResult={yearResult}
  daeunResult={daeunResult}
  aiResult={aiResult}
  resultStyle={resultStyle}
/>
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


export default App;
