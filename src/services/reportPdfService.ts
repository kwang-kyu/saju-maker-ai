import { downloadPdfFromElement } from "./pdfService";
import { cleanPdfFinalText } from "./pdfFinalCleanupService";
import { normalizeListText } from "./textCleanupService";
type PdfBaseParams = {
  name: string;
  result: string;
  aiResult: string;
  daeunResult: string;
  moneyResult: string;
  jobResult: string;
  loveResult: string;
  healthResult: string;
};

export async function downloadDetailSajuPdf({
  name,
  result,
  aiResult,
  daeunResult,
  moneyResult,
  jobResult,
  loveResult,
  healthResult,
}: PdfBaseParams) {
  const cleanResult = cleanPdfFinalText(result);
  const cleanAiResult = aiResult;
  const cleanDaeunResult = cleanPdfFinalText(daeunResult);
  const cleanMoneyResult = cleanPdfFinalText(moneyResult);
  const cleanJobResult = cleanPdfFinalText(jobResult);
  const cleanLoveResult = cleanPdfFinalText(loveResult);
  const cleanHealthResult = cleanPdfFinalText(healthResult);
  const element = document.createElement("div");

  element.style.width = "794px";
  element.style.padding = "40px";
  element.style.background = "#ffffff";
  element.style.color = "#111111";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.lineHeight = "1.8";

  element.innerHTML = `
    <div style="
      text-align:center;
      padding:40px 20px;
      border:2px solid #222;
      margin-bottom:40px;
    ">
      <h1 style="font-size:30px; margin-bottom:10px;">
        사주메이커 AI 프리미엄 리포트
      </h1>
      <p style="font-size:16px; margin:6px 0;">
        ${name || "이름 미입력"}님의 맞춤 사주 분석 보고서
      </p>
      <p style="font-size:14px; color:#555;">
        분석일: ${new Date().toLocaleDateString("ko-KR")}
      </p>
    </div>

    <h2>기본 사주</h2>
    <pre style="white-space:pre-wrap; font-size:14px;">${cleanResult || "기본 사주 결과가 없습니다."}

    <h2>AI 종합상담</h2>
    <pre style="white-space:pre-wrap; font-size:14px;">${(cleanAiResult || "AI 종합상담 결과가 없습니다.").replace(/#{1,6}\s*/g, "")}

    <h2>대운</h2>
    <pre style="white-space:pre-wrap; font-size:14px;">${cleanDaeunResult || "대운 결과가 없습니다."}

    <h2>재물운</h2>
    <pre style="white-space:pre-wrap; font-size:14px;">${cleanMoneyResult || "재물운 결과가 없습니다."}

    <h2>직업운</h2>
    <pre style="white-space:pre-wrap; font-size:14px;">${cleanJobResult || "직업운 결과가 없습니다."}

    <h2>연애운</h2>
    <pre style="white-space:pre-wrap; font-size:14px;">${cleanLoveResult || "연애운 결과가 없습니다."}

    <h2>건강운</h2>
    <pre style="white-space:pre-wrap; font-size:14px;">${cleanHealthResult || "건강운 결과가 없습니다."}
  `;

  await downloadPdfFromElement(element, "saju-detail.pdf");
}
type PdfSummaryParams = {
    name: string;
    birthYear: string;
    birthMonth: string;
    birthDay: string;
    gender: string;
    result: string;
    moneyResult: string;
    jobResult: string;
    loveResult: string;
    healthResult: string;
    summaryAdviceText: string;
  };
  
  export async function downloadSummarySajuPdf({
    name,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    result,
    moneyResult,
    jobResult,
    loveResult,
    healthResult,
    summaryAdviceText,
  }: PdfSummaryParams) {
    const cleanResult = cleanPdfFinalText(result);
    const cleanMoneyResult = cleanPdfFinalText(moneyResult);
    const cleanJobResult = cleanPdfFinalText(jobResult);
    const cleanLoveResult = cleanPdfFinalText(loveResult);
    const cleanHealthResult = cleanPdfFinalText(healthResult);
    const cleanSummaryAdviceText = normalizeListText(
      cleanPdfFinalText(summaryAdviceText)
    );

const element = document.createElement("div");

element.style.width = "794px";
    element.style.width = "794px";
    element.style.padding = "40px";
    element.style.background = "#ffffff";
    element.style.color = "#111111";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.lineHeight = "1.8";
  
    element.innerHTML = `
      <div style="border:3px solid #222; padding:34px; min-height:1040px;">
        <div style="text-align:center; margin-top:20px;">
          <div style="font-size:13px; letter-spacing:3px; color:#777;">PREMIUM SAJU SUMMARY REPORT</div>
          <h1 style="font-size:30px; margin:18px 0 8px;">📘 사주메이커 AI 요약 리포트</h1>
          <div style="font-size:15px; color:#666;">핵심만 짧게 정리한 2페이지 요약본</div>
  
          <div style="margin:24px auto 0; width:82%; padding:16px; background:#fafafa; border:1px solid #ddd; border-radius:12px; font-size:14px; line-height:1.8;">
            <strong>분석 대상</strong> : ${name || "이름 미입력"}<br />
            <strong>생년월일</strong> : ${birthYear}년 ${birthMonth}월 ${birthDay}일<br />
            <strong>성별</strong> : ${gender === "male" ? "남성" : "여성"}<br />
            <strong>리포트 생성일</strong> : ${new Date().toLocaleDateString("ko-KR")}
          </div>
        </div>
  
        <div style="margin-top:30px; padding:20px; background:#fff8ec; border:1px solid #e5d2aa; border-radius:12px;">
          <h2 style="margin-top:0;">🌟 사주 한줄 요약</h2>
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanResult || "기본 사주 분석 결과가 없습니다."}
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">재물운 요약</h2>
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanMoneyResult || "재물운 분석 결과가 없습니다."}
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">직업운 요약</h2>
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanJobResult || "직업운 분석 결과가 없습니다."}
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">연애·관계운 요약</h2>
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanLoveResult || "연애운 분석 결과가 없습니다."}
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">건강운 요약</h2>
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanHealthResult || "건강운 분석 결과가 없습니다."}
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">실천 조언 5가지</h2>
          <div style="line-height:1.9; font-size:14px;">
          ${cleanSummaryAdviceText}
          </div>
        </div>
  
        <div style="margin-top:34px; padding-top:18px; border-top:1px solid #ddd; text-align:center; color:#777; font-size:12px; line-height:1.8;">
          <strong>SAJU MAKER AI SUMMARY REPORT</strong><br />
          본 리포트는 핵심만 정리한 요약본입니다.<br />
          자세한 내용은 상세 리포트를 함께 참고해 주세요.
        </div>
      </div>
    `;
  
    await downloadPdfFromElement(element, "saju-summary.pdf");
  }