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
import { downloadSummaryPdf } from "../services/pdf/downloadSummaryPdf";
import { downloadDetailPdf } from "../services/pdf/downloadDetailPdf";
import { downloadCasePdf } from "../services/pdf/downloadCasePdf";
import { downloadAiTotalPdf } from "../services/pdf/downloadAiTotalPdf";

import { basicConsulting } from "../services/basic/basicConsulting";
import { basicMapper } from "../services/basic/basicMapper";
import { totalConsulting } from "../services/total/totalConsulting";
import { yearConsulting } from "../services/year/yearConsulting";
import { todayConsulting } from "../services/today/todayConsulting";
import { moneyConsulting } from "../services/money/moneyConsulting";
import { jobConsulting } from "../services/job/jobConsulting";
import { loveConsulting } from "../services/love/loveConsulting";
import { getHealthConsulting } from "../services/health/healthConsulting";
import { getMarriageConsulting } from "../services/marriage/marriageConsulting";
import { getBusinessConsulting } from "../services/business/businessConsulting";
import { getRealEstateConsulting } from "../services/realEstate/realEstateConsulting";
import { getAiConsulting } from "../services/ai/aiConsulting";

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

function formatBirthTime(value: string) {
  const map: Record<string, string> = {
    "23:00": "자시 (23:00~01:00)",
    "01:00": "축시 (01:00~03:00)",
    "03:00": "인시 (03:00~05:00)",
    "05:00": "묘시 (05:00~07:00)",
    "07:00": "진시 (07:00~09:00)",
    "09:00": "사시 (09:00~11:00)",
    "11:00": "오시 (11:00~13:00)",
    "13:00": "미시 (13:00~15:00)",
    "15:00": "신시 (15:00~17:00)",
    "17:00": "유시 (17:00~19:00)",
    "19:00": "술시 (19:00~21:00)",
    "21:00": "해시 (21:00~23:00)",
  };

  return map[value] ?? value;
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
  const age = getCurrentAge(birthDate);
  const genderText = gender === "male" ? "남성" : "여성";
  const calendarText = calendarType === "lunar" ? "음력" : "양력";

  return `${name}님의 상담은 아래 입력 정보를 기준으로 작성되었습니다.

이름: ${name}
출생 기준: ${calendarText}
입력 생년월일: ${birthDate}
출생 당시 양력 환산일: ${solarDate}
음력 생일: ${lunarDate}
출생시간: ${formatBirthTime(birthTime)}
성별: ${genderText}
현재 나이: ${age ? `${age}세` : "확인 필요"}
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
  const age = getCurrentAge(birthDate);
  const genderText = gender === "male" ? "남성" : "여성";
  const calendarText = calendarType === "lunar" ? "음력" : "양력";

  return `${area}은 ${name}님의 ${birthDate} ${calendarText} 출생, ${formatBirthTime(birthTime)} 출생시간, ${genderText} 기준으로 해석합니다.
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

  const sajuInfo = calculateSaju({
    name,
    birthDate,
    birthTime,
    gender,
    calendarType,
  });

  const sajuPillars = `${sajuInfo.yearGanZhi} / ${sajuInfo.monthGanZhi} / ${sajuInfo.dayGanZhi} / ${sajuInfo.timeGanZhi}`;

  const getPdfSections = () => {
    const inputData = { name, birthDate, birthTime, gender };
    const mappedBasic = basicMapper(inputData);

    const sajuPersonalNote = `${name}님은 일간 기준으로 ${mappedBasic.summary}
강하게 살아나는 기운은 ${mappedBasic.strongestElement}, 보완이 필요한 기운은 ${mappedBasic.weakestElement}입니다.
이 흐름은 돈, 일, 관계, 건강, 사업 판단에 함께 반영됩니다.`;

    return [
      {
        title: "개인 상담 기준",
        content: buildPersonalProfile({
          name,
          birthDate,
          birthTime,
          gender,
          calendarType,
          solarDate: sajuInfo.solarDate,
          lunarDate: sajuInfo.lunarDate,
          sajuPillars,
        }),
      },
      { title: "기본 사주", content: basicConsulting(mappedBasic) },
      { title: "전체 운세", content: totalConsulting(inputData) },
      { title: "올해 운세", content: yearConsulting(name) },
      { title: "오늘의 운세", content: todayConsulting(name) },
      {
        title: "재물 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "재물 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          moneyConsulting(mappedBasic),
      },
      {
        title: "직업 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "직업 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          jobConsulting(mappedBasic),
      },
      {
        title: "연애 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "연애 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          loveConsulting(mappedBasic),
      },
      {
        title: "건강 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "건강 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getHealthConsulting(mappedBasic),
      },
      {
        title: "결혼 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "결혼 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getMarriageConsulting(mappedBasic),
      },
      {
        title: "사업 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "사업 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getBusinessConsulting(mappedBasic),
      },
      {
        title: "부동산 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "부동산 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getRealEstateConsulting(mappedBasic),
      },
      {
        title: "사안별 상담",
        content: "사안별 상담은 질문 선택 방식으로 제공됩니다. 구체적인 고민이 입력되면 해당 사안에 맞춰 상담을 진행합니다.",
      },
      { title: "AI 종합상담", content: getAiConsulting(mappedBasic) },
    ];
  };

  const getSummaryPdfSections = () => [
    {
      title: "개인 상담 기준",
      content: buildPersonalProfile({
        name,
        birthDate,
        birthTime,
        gender,
        calendarType,
        solarDate: sajuInfo.solarDate,
        lunarDate: sajuInfo.lunarDate,
        sajuPillars,
      }),
    },
    {
      title: "기본 사주 요약",
      content: `${name}님의 기본 사주는 스스로 기준을 세우고 차분히 쌓아갈 때 강점이 살아나는 흐름입니다.

겉으로는 조용하거나 신중해 보여도, 속으로는 생각이 깊고 판단 기준이 분명한 편입니다.

무리하게 빠르게 움직이기보다 본인이 납득할 수 있는 방향을 정한 뒤 꾸준히 가는 것이 좋습니다.`,
    },
    {
      title: "전체 운세 요약",
      content: `${name}님은 앞으로 무리한 확장보다 안정, 정리, 건강, 관계의 균형이 더 중요한 시기입니다.

일과 돈은 크게 벌리는 것보다 새는 부분을 막고, 오래 가져갈 기준을 세울 때 흐름이 안정됩니다.`,
    },
    {
      title: "올해 운세 요약",
      content: `${name}님에게 올해는 속도보다 방향이 중요한 해입니다.

새로운 일을 무리하게 늘리기보다 지금 하는 일의 완성도와 안정성을 높이는 것이 좋습니다.`,
    },
    {
      title: "오늘의 운세 요약",
      content: `${name}님은 오늘 많은 일을 한꺼번에 처리하기보다 중요한 일 하나를 먼저 끝내는 것이 좋습니다.

돈, 약속, 문서, 건강 리듬을 차분히 점검하면 하루 흐름이 안정됩니다.`,
    },
  ];

  const handleSummaryPdf = () => {
    downloadSummaryPdf({ name, sections: getSummaryPdfSections() });
  };

  const handleDetailPdf = () => {
    downloadDetailPdf({ name, sections: getPdfSections() });
  };

  const handleCasePdf = () => {
    const sections = getPdfSections().filter((section) =>
      section.title.includes("사안별")
    );

    downloadCasePdf({ name, sections });
  };

  const handleAiTotalPdf = () => {
    const sections = getPdfSections().filter((section) =>
      section.title.includes("AI 종합")
    );

    downloadAiTotalPdf({ name, sections });
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

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={handleSummaryPdf}
          style={{
            flex: 1,
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background: "#f59e0b",
            color: "#111827",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          📄 요약 리포트
        </button>

        <button
          type="button"
          onClick={handleDetailPdf}
          style={{
            flex: 1,
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background: "#38bdf8",
            color: "#0f172a",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          📘 상세 리포트
        </button>
        <button
          type="button"
          onClick={handleCasePdf}
          style={{
            flex: 1,
            minWidth: "180px",
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background: "#a78bfa",
            color: "#111827",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          🧭 사안별 상담
        </button>

        <button
          type="button"
          onClick={handleAiTotalPdf}
          style={{
            flex: 1,
            minWidth: "180px",
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background: "#f97316",
            color: "#111827",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          🤖 AI 종합상담
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
        <div>출생 시간: {formatBirthTime(birthTime)}</div>
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
          lineHeight: "2",
          fontSize: "16px",
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










