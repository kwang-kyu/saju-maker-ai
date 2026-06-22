export function mergeShortSentences(text: string): string {
    if (!text) return "";
  
    let result = text;
  
    result = result.replace(
      /재물\s*\n직업\s*\n인간관계\s*\n건강/g,
      "재물·직업·인간관계·건강 영역"
    );
  
    result = result.replace(/재물\s*\n직업/g, "재물·직업");
    result = result.replace(/직업\s*\n건강/g, "직업·건강");
    result = result.replace(/재물\s*\n건강/g, "재물·건강");
  
    result = result.replace(/\n{3,}/g, "\n\n");
  
    return result.trim();
  }