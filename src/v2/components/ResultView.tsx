import BasicResult from "./BasicResult";
import TotalResult from "./TotalResult";
import YearResult from "./YearResult";
import TodayResult from "./TodayResult";
import MoneyResult from "./MoneyResult";
import MoneyTodayResult from "./MoneyTodayResult";
import JobResult from "./JobResult";
import LoveResult from "./LoveResult";
import HealthResult from "./HealthResult";
import MarriageResult from "./MarriageResult";
import BusinessResult from "./BusinessResult";
import RealEstateResult from "./RealEstateResult";
import CaseResult from "./CaseResult";
import AiResult from "./AiResult";
import LuckyResult from "./LuckyResult";
import LoveTodayResult from "./LoveTodayResult";
import HealthTodayResult from "./HealthTodayResult";

import { calculateSaju } from "../engine/sajuEngine";
import { downloadDetailDocx } from "../services/docx/detailDocxService";
import { downloadSummaryDocx } from "../services/docx/summaryDocxService";
import { downloadCaseDocx } from "../services/docx/caseDocxService";
import { downloadAiDocx } from "../services/docx/aiDocxService";
import { buildSummaryDocxSections } from "../services/docx/docxSummarySections";
import {
  buildDetailDocxSections,
  buildDetailDocxPreparedData,
  buildDetailDocxBaseSections,
  buildDetailDocxMoneyJobSections,
} from "../services/docx/docxDetailSections";
import { buildDetailDocxLoveHealthSections } from "../services/docx/docxLoveHealthSections";
import { buildDetailDocxLifeAssetSections } from "../services/docx/docxLifeAssetSections";
import { buildDetailDocxCaseAiSections } from "../services/docx/docxCaseAiSections";
import { buildPremiumPdfExpansion } from "../services/docx/docxPremiumExpansion";
import {
  buildSummarySections,
  buildDetailSections,
  buildCaseSections,
  buildAiSections,
} from "../services/docx/docxSectionFactory";

type ResultViewProps = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType?: string;
  selectedMenu: string;
};

function getCurrentAge(birthDate: string) {
  const birthYear = Number(birthDate.split("-")[0]);
  if (!birthYear) return "";
  return String(new Date().getFullYear() - birthYear + 1);
}

function getTimePeriodLabel(time: string) {
  const map: Record<string, string> = {
    "00:00": "자시 (23:00~01:00)",
    "01:00": "축시 (01:00~03:00)",
    "02:00": "축시 (01:00~03:00)",
    "03:00": "인시 (03:00~05:00)",
    "04:00": "인시 (03:00~05:00)",
    "05:00": "묘시 (05:00~07:00)",
    "06:00": "묘시 (05:00~07:00)",
    "07:00": "진시 (07:00~09:00)",
    "08:00": "진시 (07:00~09:00)",
    "09:00": "사시 (09:00~11:00)",
    "10:00": "사시 (09:00~11:00)",
    "11:00": "오시 (11:00~13:00)",
    "12:00": "오시 (11:00~13:00)",
    "13:00": "미시 (13:00~15:00)",
    "14:00": "미시 (13:00~15:00)",
    "15:00": "신시 (15:00~17:00)",
    "16:00": "신시 (15:00~17:00)",
    "17:00": "유시 (17:00~19:00)",
    "18:00": "유시 (17:00~19:00)",
    "19:00": "술시 (19:00~21:00)",
    "20:00": "술시 (19:00~21:00)",
    "21:00": "해시 (21:00~23:00)",
    "22:00": "해시 (21:00~23:00)",
    "23:00": "자시 (23:00~01:00)",
  };

  return map[time] ?? time;
}
function buildPersonalProfile(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType: string;
  solarDate: string;
  lunarDate: string;
  sajuPillars: string;
}) {
  const { name, birthDate, birthTime, gender, calendarType, solarDate, lunarDate, sajuPillars } = params;
  const timeText = getTimePeriodLabel(birthTime);
  const writtenDate = new Date().toLocaleDateString("ko-KR");
  const age = getCurrentAge(birthDate);
  const genderText = gender === "male" ? "남성" : "여성";
  const calendarText = calendarType === "lunar" ? "음력" : "양력";

  return `${name}님의 상담은 아래 입력 정보를 기준으로 작성되었습니다.

이름: ${name}
출생 기준: ${calendarText}
입력 생년월일: ${birthDate}
출생 당시 양력 환산일: ${solarDate}
음력 생일: ${lunarDate}
출생시간: ${timeText}
성별: ${genderText}
현재 나이: ${age ? `${age}세` : "확인 필요"}
작성일: ${writtenDate}
상담버전: 천운문 Premium 11.0
만세력 기준: 절기 기준 사주명리 해석
사주팔자: ${sajuPillars}

이번 리포트는 입력된 생년월일과 현재 나이 흐름을 기준으로 인생의 방향, 돈, 일, 관계, 건강, 결혼, 사업, 부동산 흐름을 종합 상담하는 방식으로 구성됩니다.`;
}

function buildConsultingPersonalNote(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType: string;
  area: string;
}) {
  const { name, birthDate, birthTime, gender, calendarType, area } = params;
  const timeText = getTimePeriodLabel(birthTime);
  const age = getCurrentAge(birthDate);
  const genderText = gender === "male" ? "남성" : "여성";
  const calendarText = calendarType === "lunar" ? "음력" : "양력";

  return `${area}은 ${name}님의 ${birthDate} ${calendarText} 출생, ${timeText}에 태어나신 ${genderText} 기준으로 해석합니다.
현재 나이는 ${age ? `${age}세` : "확인 필요"}로 보며, 지금 시점에서 어떤 선택을 줄이고 어떤 흐름을 키워야 하는지를 중심으로 상담합니다.`;
}


export default function ResultView({
  name,
  birthDate,
  birthTime,
  gender,
  calendarType = "solar",
  selectedMenu,
}: ResultViewProps) {
  const commonProps = { name, birthDate, birthTime, gender };
  const birthTimeText = getTimePeriodLabel(birthTime);
  const writtenDateText = new Date().toLocaleDateString("ko-KR");

  const sajuInfo = calculateSaju({
    name,
    birthDate,
    birthTime,
    gender,
    calendarType,
  });

  const displayTimeGanZhi =
    sajuInfo.timeGanZhi && !sajuInfo.timeGanZhi.includes("계산 확인")
      ? sajuInfo.timeGanZhi
      : "시간 미상";
  const sajuPillars = `${sajuInfo.yearGanZhi} / ${sajuInfo.monthGanZhi} / ${sajuInfo.dayGanZhi} / ${displayTimeGanZhi}`;

  const getDocxSections = () => {
    const { mappedBasic, sajuPersonalNote } =
      buildDetailDocxPreparedData({ name, birthDate, birthTime, gender });

    const baseSections = [
      ...buildDetailDocxBaseSections({
        name,
        birthDate,
        birthTime,
        gender,
        personalProfile: buildPersonalProfile({
          name,
          birthDate,
          birthTime,
          gender,
          calendarType,
          solarDate: sajuInfo.solarDate,
          lunarDate: sajuInfo.lunarDate,
          sajuPillars,
        }),
      }),
      ...buildDetailDocxMoneyJobSections({
        mappedBasic,
        birthDate,
        sajuPersonalNote,
        moneyPersonalNote: buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "재물 상담" }),
        jobPersonalNote: buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "직업 상담" }),
      }),
      ...buildDetailDocxLoveHealthSections({
        mappedBasic,
        name,
        birthDate,
        birthTime,
        gender,
        calendarType,
        sajuPersonalNote,
        buildConsultingPersonalNote,
      }),
      ...buildDetailDocxLifeAssetSections({
        mappedBasic,
        name,
        birthDate,
        birthTime,
        gender,
        calendarType,
        sajuPersonalNote,
        buildConsultingPersonalNote,
      }),
      ...buildDetailDocxCaseAiSections(),
    ];

    return baseSections.map((section) => ({
      ...section,
      content:
        section.content +
        "\n\n" +
        buildPremiumPdfExpansion({
          name,
          title: section.title,
        }),
    }));
  };

  const getSummaryDocxSections = () =>
    buildSummaryDocxSections({
      name,
      personalProfile: buildPersonalProfile({
        name,
        birthDate,
        birthTime,
        gender,
        calendarType,
        solarDate: sajuInfo.solarDate,
        lunarDate: sajuInfo.lunarDate,
        sajuPillars,
      }),
    });


  const handleSummaryDocx = () => {
    downloadSummaryDocx({
      name,
      sections: buildSummarySections(getSummaryDocxSections()),
    });
  };

  const handleDetailDocx = () => {
    downloadDetailDocx({
      name,
      sections: buildDetailDocxSections(buildDetailSections(getDocxSections())),
      reportTitle: "천운문 Premium 상세 리포트",
      fileSuffix: "Premium_상세리포트",
    });
  };

  const handleCaseDocx = () => {
    downloadCaseDocx({
      name,
      sections: buildCaseSections(getDocxSections()),
    });
  };


  const handleAiTotalDocx = () => {
    downloadAiDocx({
      name,
      sections: buildAiSections(getDocxSections()),
    });
  };


  const renderResult = () => {
    switch (selectedMenu) {
      case "basic":
        return <BasicResult {...commonProps} />;
      case "total":
        return <TotalResult {...commonProps} />;
      case "year":
        return <YearResult {...commonProps} />;
      case "today":
        return <TodayResult {...commonProps} />;
      case "moneyToday":
        return <MoneyTodayResult name={name} />;
      case "money":
        return <MoneyResult {...commonProps} />;
      case "job":
        return <JobResult {...commonProps} />;
      case "love":
        return <LoveResult {...commonProps} />;
      case "health":
        return <HealthResult {...commonProps} />;
      case "marriage":
        return <MarriageResult {...commonProps} />;
      case "business":
        return <BusinessResult {...commonProps} />;
      case "realEstate":
        return <RealEstateResult {...commonProps} />;
      case "case":
        return <CaseResult {...commonProps} />;
      case "ai":
        return <AiResult {...commonProps} />;
      case "lucky":
        return <LuckyResult name={name} />;
      case "loveToday":
        return <LoveTodayResult name={name} />;
      case "healthToday":
        return <HealthTodayResult name={name} />;
      default:
        return <BasicResult {...commonProps} />;
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <h2 style={{ marginBottom: "16px" }}>결과 확인</h2>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  }}
>
  <button
    type="button"
    onClick={handleSummaryDocx}
    style={{
      padding: "13px",
      border: "none",
      borderRadius: "12px",
      background: "#f59e0b",
      color: "#111827",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    📄 요약 DOCX
  </button>

  <button
    type="button"
    onClick={handleDetailDocx}
    style={{
      padding: "13px",
      border: "none",
      borderRadius: "12px",
      background: "#38bdf8",
      color: "#0f172a",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    📘 상세 DOCX
  </button>

  <button
    type="button"
    onClick={handleCaseDocx}
    style={{
      padding: "13px",
      border: "none",
      borderRadius: "12px",
      background: "#22c55e",
      color: "#052e16",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    📚 주제별 상담 DOCX
  </button>

  <button
    type="button"
    onClick={handleAiTotalDocx}
    style={{
      padding: "13px",
      border: "none",
      borderRadius: "12px",
      background: "#8b5cf6",
      color: "#ffffff",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    🤖 AI 종합상담 DOCX
  </button>
</div>
    

      <div
        style={{
          padding: "20px",
          border: "1px solid #334155",
          borderRadius: "16px",
          background: "#1e293b",
          lineHeight: "1.9",
          fontSize: "15px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "14px", fontSize: "20px" }}>
          📋 상담 기준 정보
        </h3>
        <div>이름: {name}</div>
        <div>출생 기준: {calendarType === "lunar" ? "음력 생일" : "양력 생일"}</div>
        <div>입력 생년월일: {birthDate}</div>
        <div>출생 당시 양력 환산일: {sajuInfo.solarDate}</div>
        <div>출생 시간: {birthTimeText}</div>
        <div>작성일: {writtenDateText}</div>
        <div>상담버전: 천운문 Premium 11.0</div>
        <div>만세력 기준: 절기 기준 사주명리 해석</div>
        <div>성별: {gender === "male" ? "남성" : "여성"}</div>
      </div>

      <div
        style={{
          marginTop: "14px",
          padding: "20px",
          border: "1px solid #334155",
          borderRadius: "16px",
          background: "#0f172a",
          lineHeight: "1.9",
          fontSize: "15px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "14px", fontSize: "20px" }}>
          📜 만세력 사주팔자
        </h3>
        <div>연주: {sajuInfo.yearGanZhi}</div>
        <div>월주: {sajuInfo.monthGanZhi}</div>
        <div>일주: {sajuInfo.dayGanZhi}</div>
        <div>시주: {sajuInfo.timeGanZhi}</div>
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "24px",
          border: "1px solid #334155",
          borderRadius: "16px",
          background: "#111827",
          lineHeight: "1.8",
          fontSize: "15px",
          letterSpacing: "-0.2px",
          wordBreak: "keep-all",
          overflowWrap: "break-word",
        }}
      >
        {renderResult()}
      </div>
    </div>
  );
}















































