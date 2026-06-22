export function optimizePremiumReport(text: string): string {
    if (!text) return "";
  
    let result = text;
  
    // 1. Markdown 제목 기호 완전 제거
    result = result.replace(/#{1,6}\s*/g, "");
  
    // 2. 빈 괄호 제거
    result = result.replace(/\(\s*\)/g, "");
  
    // 3. 어색한 조사 보정
    result = result.replace(/은 의/g, "은");
    result = result.replace(/는 의/g, "는");
    result = result.replace(/이 의/g, "이");
    result = result.replace(/가 의/g, "가");
    result = result.replace(/의 특성이/g, "특성이");
  
    // 4. 빈 값 문구 보정
    result = result.replace(/격국\(\)/g, "격국 정보 없음");
    result = result.replace(/신약\(\)/g, "신강신약 분석 중");
    result = result.replace(/신강\(\)/g, "신강신약 분석 중");
  
    // 5. AI 상담 번호 제목 제거
    result = result.replace(/^\s*\d+\.\s*$/gm, "");
    result = result.replace(/^\s*[-—]{2,}\s*$/gm, "");
  
    // 6. 너무 긴 AI 문단 줄바꿈
    result = result.replace(/(입니다\.|습니다\.|합니다\.|됩니다\.)\s+/g, "$1\n");
  
    // 7. 과도한 줄바꿈 정리
    result = result.replace(/\n{3,}/g, "\n\n");
  
    return result.trim();
  }