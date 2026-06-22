export function shortenLongParagraph(text: string): string {
    if (!text) return "";
  
    return text
      .replace(/([.!?])\s+/g, "$1\n")
      .replace(/(입니다\.|습니다\.|합니다\.|됩니다\.)\s+/g, "$1\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  
  export function removeEmptyTitles(text: string): string {
    if (!text) return "";
  
    return text.replace(
      /■\s*[^\n]+\n(?=\s*■|\s*$)/g,
      ""
    );
  }
  
  export function removeNumberHeadings(text: string): string {
    if (!text) return "";
  
    return text
      .replace(/###\s*\d+\./g, "")
      .replace(/#+\s*\d+\./g, "")
      .replace(/^\s*\d+\.\s*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  export function optimizePremiumReportText(text: string): string {
    if (!text) return "";
  
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((v) => v.trim())
      .filter(Boolean);
  
    const optimized: string[] = [];
    const signatures = new Set<string>();
    const keywordCounter = new Map<string, number>();
    for (const p of paragraphs) {
      const signature = p
        .replace(/[0-9０-９]+월/g, "월")
        .replace(/[0-9０-９]+년/g, "년")
        .replace(/[목화토금수]\([木火土金水]\)/g, "오행")
        .replace(/\s+/g, "")
        .replace(/[.,!?~…:;'"“”‘’()\[\]{}]/g, "")
        .slice(0, 90);
        const keywordSignature = [
            "화",
            "토",
            "재물",
            "직업",
            "연애",
            "건강",
            "계약",
            "기록",
            "확장",
            "관리",
          ]
            .filter((v) => p.includes(v))
            .join("|");
      if (signatures.has(signature)) continue;
      if (keywordSignature) {
        const count =
          keywordCounter.get(keywordSignature) ?? 0;
      
        if (count >= 1 && p.length > 80) {
          continue;
        }
      
        keywordCounter.set(
          keywordSignature,
          count + 1
        );
      }
      signatures.add(signature);
      optimized.push(p);
    }
  
    return optimized.join("\n\n");
  }