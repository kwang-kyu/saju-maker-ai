function normalizeSentence(sentence: string): string {
  return sentence
    .replace(/\s+/g, " ")
    .replace(/[■●◆▶\-•]/g, "")
    .replace(/[.,!?。]/g, "")
    .trim();
}
function normalizeMeaning(text: string): string {
  return text
    .replace(/강한\s*화\(火\)|화\(火\)\s*기운이\s*강함|강한\s*오행[:：]?\s*화\(火\)/g, "강한오행화")
    .replace(/부족한\s*토\(土\)|토\(土\)\s*기운\s*부족|약한\s*토\(土\)/g, "부족오행토")
    .replace(/비견격\s*구조|비견격/g, "비견격")
    .replace(/신강\s*구조|신강한\s*사주|신강\s*사주/g, "신강")
    .replace(/독립성|자기주도성|스스로\s*결정/g, "독립성")
    .replace(/\s+/g, "")
    .trim();
}
function splitSentences(text: string): string[] {
  return text
    .split(/\n|(?<=[.!?。])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function similarity(a: string, b: string): number {
  const aa = normalizeSentence(a);
  const bb = normalizeSentence(b);
  const ma = normalizeMeaning(aa);
  const mb = normalizeMeaning(bb);
  
  if (ma && ma === mb) {
    return 1;
  }
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  if (aa.includes(bb) || bb.includes(aa)) return 1;

  const aSet = new Set(aa.split(" "));
  const bSet = new Set(bb.split(" "));

  let same = 0;
  aSet.forEach((word) => {
    if (bSet.has(word)) same++;
  });

  return same / Math.max(aSet.size, bSet.size);
}

export function removeDuplicateSentences(
  text: string,
  similarityLimit = 0.72
): string {
  const sentences = splitSentences(text);
  const result: string[] = [];

  for (const sentence of sentences) {
    const normalized = normalizeSentence(sentence);

    if (normalized.length < 8) {
      result.push(sentence);
      continue;
    }

    const duplicated = result.some(
      (saved) => similarity(saved, sentence) >= similarityLimit
    );

    if (!duplicated) {
      result.push(sentence);
    }
  }

  return result.join("\n");
}

export function cleanDetailText(text: string): string {
  return removeDuplicateSentences(text, 0.68)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function cleanSummaryText(text: string): string {
  const cleaned = removeDuplicateSentences(text, 0.55);
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const importantLines = lines.filter((line) => {
    return (
      line.includes("핵심") ||
      line.includes("강점") ||
      line.includes("주의") ||
      line.includes("재물") ||
      line.includes("직업") ||
      line.includes("연애") ||
      line.includes("건강") ||
      line.includes("대운") ||
      line.includes("세운") ||
      line.includes("사건") ||
      line.includes("종합")
    );
  });

  return importantLines.slice(0, 90).join("\n");
}
export function normalizeListText(text: string): string {
  return text
    .replace(/(\d+)\.\s*\n/g, "$1. ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}