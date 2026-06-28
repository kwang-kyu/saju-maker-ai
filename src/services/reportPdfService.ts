import { downloadPdfFromElement } from "./pdfService";
import { cleanPdfFinalText } from "./pdfFinalCleanupService";
import { normalizeListText } from "./textCleanupService";
function safePdfText(text: string): string {
  return text
    .replace(/①/g, "1.")
    .replace(/②/g, "2.")
    .replace(/③/g, "3.")
    .replace(/④/g, "4.")
    .replace(/⑤/g, "5.")
    .replace(/⑥/g, "6.")
    .replace(/⑦/g, "7.")
    .replace(/⑧/g, "8.")
    .replace(/⑨/g, "9.")
    .replace(/⑩/g, "10.")
    .replace(/[★☆]/g, "별")
    .replace(/[■●◆▶•]/g, "-")
    .trim();
}
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

  const cleanResult = safePdfText(cleanPdfFinalText(result));
  const cleanAiResult = safePdfText(aiResult);
  const cleanDaeunResult = safePdfText(cleanPdfFinalText(daeunResult));

const cleanMoneyResult = safePdfText(moneyResult);
const cleanJobResult = safePdfText(jobResult);
const cleanLoveResult = safePdfText(loveResult);
const cleanHealthResult = safePdfText(healthResult);
const element = document.createElement("div");
  element.style.width = "794px";
  element.style.padding = "30px";
  element.style.background = "#ffffff";
  element.style.color = "#111111";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.lineHeight = "1.6";

  element.innerHTML = `
    <div style="
      text-align:center;
      padding:28px 20px;
      border:2px solid #222;
      margin-bottom:24px;
    ">
      <h1 style="font-size:30px; margin-bottom:10px;">
        천운문
      </h1>
      <p style="font-size:18px; margin:8px 0; color:#666;">
  당신의 운명을 읽는 문
</p>

<p style="font-size:15px; margin:8px 0; color:#888;">
  사주를 넘어, 인생의 방향을 제시합니다.
</p>

<p style="font-size:16px; margin:6px 0;">
  ${name || "이름 미입력"}님의 맞춤 사주 분석 보고서
</p>
      <p style="font-size:14px; color:#555;">
        분석일: ${new Date().toLocaleDateString("ko-KR")}
      </p>
    </div>

      <div style="margin-top:24px;">
      <h2 style="background:#222; color:white; padding:12px 16px; border-radius:10px; margin:0; font-size:20px;">📌 기본 사주 분석</h2>
      <div style="background:#fafafa; border:1px solid #e4e4e4; border-radius:12px; padding:18px; margin-top:10px;">
           <pre style="
    white-space:pre-wrap;
    font-size:14px;
    line-height:1.7;
    margin:0;
    
">${cleanResult || "기본 사주 결과가 없습니다."}</pre>
      </div>
    </div>

    <div style="margin-top:24px;">
      <h2 style="background:#222; color:white; padding:12px 16px; border-radius:10px; margin:0; font-size:20px;">🌟 AI 종합상담</h2>
    <div style="background:#fafafa; border:1px solid #e4e4e4; border-radius:12px; padding:18px; margin-top:10px;">        
<pre style="
    white-space:pre-wrap;
    font-size:14px;
    line-height:1.7;
    margin:0;
    
">
    ${(cleanAiResult || "AI 종합상담 결과가 없습니다.").replace(/#{1,6}\s*/g, "")}</pre>
      </div>
    </div>

    <div style="margin-top:24px;">
      <h2 style="background:#222; color:white; padding:12px 16px; border-radius:10px; margin:0; font-size:20px;">🔮 대운 10년 흐름</h2>
    <div style="background:#fafafa; border:1px solid #e4e4e4; border-radius:12px; padding:18px; margin-top:10px;">
      <pre style="
    white-space:pre-wrap;
    font-size:14px;
    line-height:1.7;
    margin:0;
    
">
    ${cleanDaeunResult || "대운 결과가 없습니다."}</pre>
      </div>
    </div>

    <div style="margin-top:24px;">
      <h2 style="background:#222; color:white; padding:12px 16px; border-radius:10px; margin:0; font-size:20px;">💰 재물운 상세 분석</h2>
      <div style="background:#fafafa; border:1px solid #e4e4e4; border-radius:12px; padding:18px; margin-top:10px;">
        <pre style="
    white-space:pre-wrap;
    font-size:14px;
    line-height:1.7;
    margin:0;
    
">
    ${cleanMoneyResult || "재물운 결과가 없습니다."}</pre>
      </div>
    </div>

    <div style="margin-top:24px;">
      <h2 style="background:#222; color:white; padding:12px 16px; border-radius:10px; margin:0; font-size:20px;">💼 직업운 상세 분석</h2>
      <div style="background:#fafafa; border:1px solid #e4e4e4; border-radius:12px; padding:18px; margin-top:10px;">
        <pre style="
    white-space:pre-wrap;
    font-size:14px;
    line-height:1.7;
    margin:0;
    
">
    ${cleanJobResult || "직업운 결과가 없습니다."}</pre>
      </div>
    </div>

    <div style="margin-top:24px;">
      <h2 style="background:#222; color:white; padding:12px 16px; border-radius:10px; margin:0; font-size:20px;">❤️ 연애·궁합 상세 분석</h2>
      <div style="background:#fafafa; border:1px solid #e4e4e4; border-radius:12px; padding:18px; margin-top:10px;">
        <pre style="
    white-space:pre-wrap;
    font-size:14px;
    line-height:1.7;
    margin:0;
    
">
${cleanLoveResult || "연애운 결과가 없습니다."}</pre>
      </div>
    </div>

    <div style="margin-top:24px;">
      <h2 style="background:#222; color:white; padding:12px 16px; border-radius:10px; margin:0; font-size:20px;">🩺 건강운 상세 분석</h2>
      <div style="background:#fafafa; border:1px solid #e4e4e4; border-radius:12px; padding:18px; margin-top:10px;">
      <pre style="
    white-space:pre-wrap;
    font-size:14px;
    line-height:1.7;
    margin:0;
    
">
${cleanHealthResult || "건강운 결과가 없습니다."}</pre>
      </div>
    </div>
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
    const cleanSummaryAdviceText = normalizeListText(summaryAdviceText);

const element = document.createElement("div");

element.style.width = "794px";
    element.style.width = "794px";
    element.style.padding = "40px";
    element.style.background = "#ffffff";
    element.style.color = "#111111";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.lineHeight = "1.6";
  
    element.innerHTML = `
      <div style="border:3px solid #222; padding:28px; min-height:960px;">
        <div style="text-align:center; margin-top:20px;">
          <div style="font-size:13px; letter-spacing:3px; color:#777;">
  CHEONUNMOON
</div>

<h1 style="font-size:30px; margin:18px 0 8px;">
  천운문
</h1>

<div style="font-size:18px; color:#666;">
  당신의 운명을 읽는 문
</div>

<div style="font-size:15px; color:#888; margin-top:10px;">
  사주를 넘어, 인생의 방향을 제시합니다.
</div>
  
          <div style="margin:24px auto 0; width:82%; padding:16px; background:#fafafa; border:1px solid #ddd; border-radius:12px; font-size:14px; line-height:1.6;">
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
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanMoneyResult || "재물운 분석 결과가 없습니다."}</pre>
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">직업운 요약</h2>
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanJobResult || "직업운 분석 결과가 없습니다."}</pre>
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">연애·관계운 요약</h2>
        <pre style="white-space:pre-wrap; font-size:14px;">${cleanLoveResult || "연애운 분석 결과가 없습니다."}</pre>
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">건강운 요약</h2>
          <pre style="white-space:pre-wrap; font-size:14px;">${cleanHealthResult || "건강운 분석 결과가 없습니다."}</pre>
        </div>
  
        <div style="margin-top:22px;">
          <h2 style="background:#222; color:white; padding:10px 14px; border-radius:8px;">실천 조언 5가지</h2>
          <div style="line-height:1.6; font-size:14px;">
          ${cleanSummaryAdviceText}
          </div>
        </div>
  
        <div style="margin-top:20px; padding-top:12px; border-top:1px solid #ddd; text-align:center; color:#777; font-size:12px; line-height:1.5;">
          <strong>천운문</strong><br />
          당신의 운명을 읽는 문
          본 리포트는 핵심만 정리한 요약본입니다.<br />
          자세한 내용은 상세 리포트를 함께 참고해 주세요.
        </div>
      </div>
    `;
  
    await downloadPdfFromElement(element, "saju-summary.pdf");
  }