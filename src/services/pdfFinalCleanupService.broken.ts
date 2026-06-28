import { mergeCanonicalPremiumText } from "./premiumCanonicalMergeService";
import { premiumSemanticDedupText } from "./premiumSemanticDedupService";
import { compressPremiumText } from "./premiumAiCompressorService";
import { mergeShortSentences } from "./premiumSentenceMergeService";
import { optimizePremiumReport } from "./premiumReportOptimizer";
import { removeDuplicateSentences } from "./textCleanupService";
import {
    shortenLongParagraph,
    removeEmptyTitles,
    removeNumberHeadings,
  } from "./premiumReportOptimizerService";
export function cleanPdfFinalText(text: string): string {
    if (!text) return "";
  
    let cleaned = text;
    if (
      cleaned.includes("월별 운세") ||
      cleaned.includes("월별운세") ||
      cleaned.includes("월 사건성 포인트") ||
      cleaned.includes("월 부동산 전용 해석") ||
      cleaned.includes("월 실행 체크리스트")
    ) {
      return cleaned
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{4,}/g, "\n\n\n")
        .trim();
    }
    // 1. Markdown 제목/강조 기호 제거
    cleaned = cleaned.replace(/강한\s+강한/g, "강한");
cleaned = cleaned.replace(/부족한\s+부족한/g, "부족한");
cleaned = cleaned.replace(
    /재물운 점수\s*:\s*(\d+)점(?:\s*★+)?[\s\S]*?재물운 점수\s*:\s*\1점(?:\s*★+)?/g,
    (_, score) => {
      const stars =
        Number(score) >= 90
          ? "★★★★★"
          : Number(score) >= 80
          ? "★★★★☆"
          : Number(score) >= 70
          ? "★★★★"
          : "★★★";
  
      return `재물운 점수 : ${score}점 ${stars}`;
    }
  );
    cleaned = cleaned.replace(/^#{1,6}\s*/gm, "");
    cleaned = cleaned.replace(/#{1,6}\s*\d+\.\s*/g, "");
    cleaned = cleaned.replace(/#{1,6}\s*/g, "");
    cleaned = cleaned.replace(/\*\*/g, "");
    cleaned = cleaned.replace(/###\s*\d+\./g, "");
    cleaned = cleaned.replace(/###/g, "");
    cleaned = cleaned.replace(/##+\s*\d+\.\s*/g, "");
    cleaned = cleaned.replace(/---+/g, "");
    cleaned = cleaned.replace(/##/g, "");
    cleaned = cleaned.replace(/#/g, "");
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
    cleaned = cleaned.replace(/__(.*?)__/g, "$1");
    cleaned = cleaned.replace(/_(.*?)_/g, "$1");
    cleaned = cleaned
    .replace(/^직업\s*$/gm, "")
    .replace(/^신살 흐름상\s*$/gm, "")
    .replace(/^합충형파해 흐름\s*$/gm, "")
    .replace(/^이 사주는\s*$/gm, "")
    .replace(/^\.\.\s*$/gm, "")
    .replace(/\n\s*\d+\.\s*\n/g, "\n")
    .replace(/^\s*\d+\.\s*$/gm, "")
    .replace(/\n\s*[\d]+[.)]\s*(?=\n)/g, "\n")
    .replace(/\n\s*\d+\.\s*(?:\r?\n)+/g, "\n")
    .replace(/^\s*[\d]+[.)]\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\s*\d+\.\s*\n+/g, "\n");
    // 2. 빈 번호/빈 불릿 제거
    cleaned = cleaned.replace(/^\s*\d+\.\s*$/gm, "");
    cleaned = cleaned.replace(/^\s*[-•]\s*$/gm, "");
  
    // 3. 제목만 남은 블록 제거
    cleaned = cleaned.replace(/\[조합 해석\]\s*(?=\n\s*\[|\n\s*$)/g, "");
    cleaned = cleaned.replace(/\[균형 조언\]\s*(?=\n\s*\[|\n\s*$)/g, "");
    cleaned = cleaned.replace(/\[핵심 해석\]\s*(?=\n\s*\[|\n\s*$)/g, "");
    cleaned = cleaned.replace(/\[상담 조언\]\s*(?=\n\s*\[|\n\s*$)/g, "");
  
    // 4. 빈 섹션 제목 제거
    cleaned = cleaned.replace(
      /(?:■\s*)?(재물|직업|인간관계|건강)\s*\n(?=\n|$)/g,
      ""
    );
  
    cleaned = cleaned.replace(
      /\[\s*(조합 해석|균형 조언|핵심 해석|상담 조언)\s*\]\s*\n?(?=\n|$)/g,
      ""
    );
  
    // 5. 반복 핵심 패턴 제거
    // text = removeRepeatedPatterns(text);
  
    // 6. 완전히 같은 문단 중복 제거
    const paragraphs = cleaned
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  
    const seen = new Set<string>();
    const uniqueParagraphs: string[] = [];
  
    for (const paragraph of paragraphs) {
      const key = paragraph
        .replace(/\s+/g, " ")
        .replace(/[.,!?。]/g, "")
        .trim();
  
      if (!seen.has(key)) {
        seen.add(key);
        uniqueParagraphs.push(paragraph);
      }
    }
  
    cleaned = uniqueParagraphs.join("\n\n");
  
    // 7. 비슷한 줄 반복 제거
    cleaned = removeSimilarRepeatedLines(cleaned);
    cleaned = cleaned.replace(
        /^올해 좋은 방향\s*$[\r\n]*/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^올해 조심할 점\s*$[\r\n]*/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^직업·사업에서 반드시 활용해야 할 기회\s*$[\r\n]*/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^(10월|11월|12월)\s*$[\r\n]*/gm,
        ""
      );
      
      cleaned = cleaned.replace(/AI\s*상담\s*중\s*오류가\s*발생했습니다\.?/g, "");

    cleaned = compressPremiumText(cleaned);
    cleaned = mergeShortSentences(cleaned);
    cleaned = cleaned
  .replace(/입니다\./g, "입니다.\n")
  .replace(/합니다\./g, "합니다.\n")
  .replace(/됩니다\./g, "됩니다.\n")
  .replace(/좋습니다\./g, "좋습니다.\n")
  .replace(/중요합니다\./g, "중요합니다.\n")
  .replace(/필요합니다\./g, "필요합니다.\n");
    // text = removeRepeatedPatterns(text);
cleaned = removeEmptyTitles(cleaned);
cleaned = removeNumberHeadings(cleaned);
if (cleaned.length > 12000) {
    cleaned = shortenLongParagraph(cleaned);
  }
  cleaned = cleaned.replace(
    /^(단순 사건 사고보다|앞으로는 새로운 일을 많이 벌이기보다|무엇이 들어오는가보다)$/gm,
    ""
  );
  cleaned = cleaned.replace(
    /^\s*(직업운|재물운|연애운|건강운)\s*$/gm,
    ""
  );
  cleaned = removeSimilarRepeatedLines(cleaned);

cleaned = cleaned.replace(
  /^운이 무겁게 느껴질 때는 무리하게 버티기보다\s*$/gm,
  ""
);

cleaned = cleaned.replace(
  /^이 사주는 혼자 조용히 쌓기보다\s*$/gm,
  ""
);

cleaned = cleaned.replace(
  /^이 사주는 조직 안에서 조용히 묻혀 있기보다\s*$/gm,
  ""
);

cleaned = cleaned.replace(/이 사주는 가만히 기다리기보다\s*/g, "");
  cleaned = cleaned.replace(/---+\s*/g, "");
cleaned = cleaned.replace(/###\s*\d+\.\s*/g, "");
cleaned = cleaned.replace(/##+\s*\d+\.\s*/g, "");
cleaned = cleaned.replace(/#+\s*/g, "");

cleaned = cleaned.replace(
  /(재물운 점수\s*:\s*\d+점\s*★+[☆]*)[\s\n]+\1/g,
  "$1"
);

cleaned = cleaned.replace(
  /\n(무엇이 들어오는가 보다|들어온 운을 어떻게 활용할 것인가가)\n?/g,
  ""
);

cleaned = cleaned.replace(
  /\n(이 사주는 가만히 기다리기보다)\n?/g,
  ""
);
    // 8. 과도한 줄바꿈 정리
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    cleaned = optimizePremiumReport(cleaned);
    cleaned = cleaned.replace(/^\s*\.\.\s*$/gm, "");
    cleaned = removeSimilarRepeatedLines(cleaned);
    cleaned = cleaned.replace(
        /^이 사주는 조직 안에서 조용히 묻혀 있기보다,?\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^'무엇이 들어오는가' 보다\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^'들어온 운을 어떻게 활용할 것인가'가\s*$/gm,
        ""
      );
      cleaned = cleaned.replace(
        /^AI 상담 중 오류가 발생했습니다\.\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^\.\.\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^주의할 점\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^.*부\.\.\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /(목\(木\) 기운.*보완.*\n)(?:.*목\(木\).*보완.*\n)+/g,
        "$1"
      );
    cleaned = cleaned.replace(/^AI 상담 중 오류가 발생했습니다\..*$/gm, "");
    cleaned = cleaned.replace(
        /^이 사주는 조직 안에서 조용히 묻혀 있기보다,?\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^이 사주는 가만히 기다리기보다\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^무엇이 들어오는가 보다\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^들어온 운을 어떻게 활용할 것인가가\s*$/gm,
        ""
      );
      
      cleaned = cleaned.replace(
        /^\.\.\s*$/gm,
        ""
      );
    cleaned = cleaned.replace(/^올해 좋은 방향\s*$/gm, "");
    cleaned = cleaned.replace(/^주의할 점\s*$/gm, "");
    cleaned = cleaned.replace(/^직업·사업에서 반드시 활용해야 할 기회\s*$/gm, "");

    cleaned = cleaned.replace(/^10월\s*$/gm, "");
    cleaned = cleaned.replace(/^11월\s*$/gm, "");
    cleaned = cleaned.replace(/^12월\s*$/gm, "");
    cleaned = cleaned.replace(/이 사주는 가만히 기다리기보다\s*/g, "");
    cleaned = cleaned.replace(/^AI 상담 중 오류가 발생했습니다\..*$/gm, "");

cleaned = cleaned.replace(/^['"“”‘’]?\s*무엇이 들어오는가\s*['"“”‘’]?\s*보다\s*$/gm, "");
cleaned = cleaned.replace(/^['"“”‘’]?\s*들어온 운을 어떻게 활용할 것인가\s*['"“”‘’]?\s*가\s*$/gm, "");

cleaned = cleaned.replace(/^신살 흐름\s*$/gm, "");
cleaned = cleaned.replace(/^합충형파해 흐름\s*$/gm, "");

cleaned = cleaned.replace(
  /(■ 현실 조언[\s\S]*?)(?=\n■|\n[A-Z가-힣]+운|\n?$)[\s\S]*?■ 현실 조언[\s\S]*?(?=\n■|\n[A-Z가-힣]+운|\n?$)/g,
  "$1"
);

cleaned = cleaned.replace(
  /(토\(土\) 기운은 생활 기반·계획성·현실 감각을 만드는 핵심 에너지이므로 규칙적인 생활 습관으로 보완하는 것이 좋습니다\.)[\s\S]*?\1/g,
  "$1"
);

cleaned = removeSimilarRepeatedLines(cleaned);
cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
cleaned = removeDuplicateParagraphs(cleaned);
cleaned = removeSemanticDuplicateParagraphs(cleaned);
cleaned = removeDuplicateSentences(cleaned, 0.62);
cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
cleaned = cleaned.replace(/AI\s*상담\s*중\s*오류가\s*발생했습니다\.?/g, "");
cleaned = cleaned.replace(/상담\s*중\s*오류가\s*발생했습니다\.?/g, "");
cleaned = removeEmptyHeadings(cleaned);
    return cleaned.trim();
  }
  function removeDuplicateParagraphs(text: string): string {
    const lines = text
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
  
    const seen = new Set<string>();
  
    return lines
      .filter((line) => {
        const key = line
          .replace(/\s+/g, "")
          .replace(/[.,!?:'"~·]/g, "");
  
        if (key.length < 12) return true;
        if (seen.has(key)) return false;
  
        seen.add(key);
        return true;
      })
      .join("\n");
  }
  function removeEmptyHeadings(text: string): string {
    const lines = text.split("\n");
    const result: string[] = [];
  
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i].trim();
      const next = lines[i + 1]?.trim() ?? "";
  
      if (
        /^(■|📦|❤️|💰|📋|⭐)/.test(current) &&
        (next === "" || /^(■|📦|❤️|💰|📋|⭐)/.test(next))
      ) {
        continue;
      }
  
      if (current.includes("AI 상담 중 오류가 발생했습니다")) {
        continue;
      }
  
      result.push(lines[i]);
    }
  
    return result.join("\n");
  }
  
  
  function removeSemanticDuplicateParagraphs(text: string): string {
    function normalizeSemanticKey(text: string): string {
      const compact = text
        .replace(/\s+/g, "")
        .replace(/[.,!?~ㆍ·]/g, "");
  
      if (
        (compact.includes("비견격") || compact.includes("비견") || compact.includes("신강")) &&
        (compact.includes("독립성") || compact.includes("주체성") || compact.includes("스스로결정") || compact.includes("추진하는힘"))
      ) {
        return "SEMANTIC_BIGEON_STRONG_INDEPENDENCE";
      }
  
      if (
        compact.includes("강한화") &&
        compact.includes("부족한토")
      ) {
        return "SEMANTIC_STRONG_FIRE_WEAK_EARTH";
      }
  
      if (
        compact.includes("돈이들어오는방식") &&
        compact.includes("새어나가는습관")
      ) {
        return "SEMANTIC_MONEY_IN_OUT_HABIT";
      }
  
      if (
        compact.includes("AI상담중오류가발생했습니다") ||
        compact.includes("상담중오류가발생했습니다")
      ) {
        return "REMOVE_AI_ERROR";
      }
  
      return "";
    }
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((v) => v.trim())
      .filter(Boolean);
  
    const seen = new Set<string>();
  
    return paragraphs
    .filter((p) => {
        const fixedKey = normalizeSemanticKey(p);
      
        if (fixedKey === "REMOVE_AI_ERROR") {
          return false;
        }
      
        if (fixedKey) {
          if (seen.has(fixedKey)) return false;
          seen.add(fixedKey);
          return true;
        }
      
        const key = p
  .replace(/\s+/g, "")
  .replace(/[.,!?:"'~]/g, "")
  
  .slice(0, 50);
  
        if (seen.has(key)) {
          return false;
        }
  
        seen.add(key);
        return true;
      })
      .join("\n\n");
  }
  function normalizeForSimilarity(line: string): string {
    return line
      .toLowerCase()
  
      .replace(/[0-9０-９]+년/g, "년")
      .replace(/[0-9０-９]+월/g, "월")
      .replace(/[0-9０-９]+일/g, "일")
      .replace(/[0-9０-９]+/g, "")
  
      .replace(/목\(木\)|목/g, "오행")
      .replace(/화\(火\)|화/g, "오행")
      .replace(/토\(土\)|토/g, "오행")
      .replace(/금\(金\)|금/g, "오행")
      .replace(/수\(水\)|수/g, "오행")
  
      .replace(
        /강한|강하게|많은|과다|부족한|약한|보완|활용|중요|필요|핵심|주의|경계/g,
        ""
      )
  
      .replace(
        /재물|직업|연애|건강|관계|계약|기록|관리|확장|투자|사업|문서|현금흐름/g,
        "분야"
      )
  
      .replace(/[①-⑳•·\-–—▶▷■□◆◇★☆※]/g, "")
      .replace(/[.,!?~…:;'"“”‘’()\[\]{}]/g, "")
      .replace(/\s+/g, "")
      .trim();
  }
  
  function getKeywordSignature(line: string): string {
    
    const keywords = [
      "목", "화", "토", "금", "수",
      "강한", "강하게", "많은", "과다", "부족", "약한", "보완",
      "재물", "직업", "연애", "건강",
      "결정", "실행", "주의", "관리", "관계", "기회", "변화",
      "용신", "희신", "기신", "격국", "신강", "신약",
      "협력",
"소통",
"균형",
"환경",
"성장",
"확장",
"관리",
"기반",
"안정",
"신뢰",
"전문성",
"추진력",
"관계",
"반복",
"습관",
"실행",
"기회",
"변화",
"조화",
"계획",
    ];
  
    return keywords.filter((keyword) => line.includes(keyword)).join("|");
  }
  function getMeaningSignature(line: string): string {
    return line
      .replace(/화\(火\)|화/g, "강한오행")
      .replace(/토\(土\)|토/g, "부족오행")
      .replace(
        /독립|주도|자기주장|자기브랜드|프리랜서|독립형/g,
        "비견"
      )
      .replace(
        /보완|균형|관리|안정|생활습관/g,
        "보완"
      );
  }

  function getParagraphSignature(text: string): string {
    return [
      "목", "화", "토", "금", "수",
      "비견", "겁재",
      "정재", "편재",
      "정관", "편관",
      "정인", "편인",
      "식신", "상관",
      "신강", "신약",
      "용신", "희신", "기신",
      "독립", "주도", "프리랜서",
      "협력", "소통",
      "계획", "관리",
      "안정", "균형",
      "확장", "변화",
      "재물", "직업", "연애", "건강"
    ]
      .filter((keyword) => text.includes(keyword))
      .sort()
      .join("|");
  }
  function getBigrams(text: string): Set<string> {
    const result = new Set<string>();
    for (let i = 0; i < text.length - 1; i++) {
      result.add(text.slice(i, i + 2));
    }
    return result;
  }
  
  function calcSimilarity(a: string, b: string): number {
    const aa = normalizeForSimilarity(a);
    const bb = normalizeForSimilarity(b);
  
    if (!aa || !bb) return 0;
    if (aa === bb) return 1;
  
    const shorter = aa.length < bb.length ? aa : bb;
    const longer = aa.length >= bb.length ? aa : bb;
  
    if (shorter.length >= 18 && longer.includes(shorter)) return 0.95;
  
    const setA = getBigrams(aa);
    const setB = getBigrams(bb);
  
    let intersection = 0;
    setA.forEach((item) => {
      if (setB.has(item)) intersection++;
    });
  
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
  }
  
  function isProtectedLine(line: string): boolean {
    const trimmed = line.trim();
  
    if (!trimmed) return true;
    if (trimmed.length < 14) return true;
  
    if (/^#+\s/.test(trimmed)) return true;
    if (/^[0-9０-９]+월/.test(trimmed) && trimmed.length <= 12) return true;
    if (/^(재물운|직업운|연애운|건강운|종합상담|오행분석|신살분석|월별운세)/.test(trimmed)) {
      return true;
    }
  
    return false;
  }
  const uselessLines = [
    "[신살 종합 분석]",
    "[세운에서의 신살 작용]",
    "[합충형파해와 신살의 연결]",
    "예민함",
    "핵심 에너지 요약",
  ];

  function removeSimilarRepeatedLines(text: string): string {
    const lines = text.split("\n");
    const kept: string[] = [];
    const seenNormalized: string[] = [];
    const seenKeywordSignatures = new Map<string, number>();
  
    for (const line of lines) {
        const trimmed = line.trim();
    
        if (
          uselessLines.some((v) => trimmed.includes(v)) ||
/^\d+\.\s*$/.test(trimmed) ||
/^\d+점\s*★/.test(trimmed)
        ) {
          continue;
        }
        const patternNormalized = trimmed
  .replace(/\s+/g, "")
  .replace(/[.,!?~]/g, "")
  .replace(/비견격.*?신강.*?구조/g, "PATTERN_BIGEON");
        if (isProtectedLine(trimmed)) {
        kept.push(line);
        continue;
      }
  
      const normalized = normalizeForSimilarity(trimmed);
      const keywordSignature = getKeywordSignature(trimmed);
      const paragraphSignature = getParagraphSignature(trimmed);
      if (!normalized) {
        kept.push(line);
        continue;
      }
  
      let duplicated = false;
      if (
        seenNormalized.some(
          (v) =>
            v.includes("PATTERN_BIGEON") &&
patternNormalized.includes("PATTERN_BIGEON")
        )
      ) {
        continue;
      }
      for (const prev of seenNormalized) {
        const similarity = calcSimilarity(normalized, prev);
        const meaning1 = getMeaningSignature(normalized);
        const meaning2 = getMeaningSignature(prev);
  
        if (
          meaning1.length > 14 &&
          meaning1 === meaning2
        ) {
          duplicated = true;
          break;
        }
  
        if (similarity >= 0.78) {
          duplicated = true;
          break;
        }
      }
        
      if (
        !duplicated &&
        paragraphSignature
      ) {
        const count =
          seenKeywordSignatures.get(
            `p:${paragraphSignature}`
          ) ?? 0;
  
        if (
          count >= 1 &&
          normalized.length >= 30
        ) {
          duplicated = true;
        } else {
          seenKeywordSignatures.set(
            `p:${paragraphSignature}`,
            count + 1
          );
        }
      }
  
      if (!duplicated && keywordSignature) {
        const count = seenKeywordSignatures.get(keywordSignature) ?? 0;
  
        if (count >= 1 && normalized.length >= 18) {
          duplicated = true;
        } else {
          seenKeywordSignatures.set(keywordSignature, count + 1);
        }
      }
  
      if (!duplicated) {
        kept.push(line);
        seenNormalized.push(normalized);
      }
    }
  
    const semanticCleaned = premiumSemanticDedupText(kept.join("\n"), {
        similarityThreshold: 0.70,
        maxSentenceLength: 90,
      });
      
      const finalText = mergeCanonicalPremiumText(semanticCleaned)
      .replace(/강한 목\(木\) 기운은 장점으로 살리고,?\s*/g, "")
      .replace(/부족한 금\(金\) 기운은 .*?보완해야 합니다\.?\s*/g, "")
      .replace(/강한 목\(木\)과 부족한 금\(金\) 기운.*?작용합니다\.?\s*/g, "")
      .replace(/강한 오행\(목\(木\)\)과 부족한 오행\(금\(金\)\)을 함께 보면.*?더 분명해집니다\.?\s*/g, "")
      .replace(/^\s*【[^】]+\s*】\s*$/gm, "")
      .replace(/\n\s*\d+\.\s*\n/g, "\n")
      .replace(/\b1\.\s*/g, "")
      .replace(/\b2\.\s*/g, "")
      .replace(/\b3\.\s*/g, "")
      .replace(/\b4\.\s*/g, "")
      .replace(/\b5\.\s*/g, "")
      .replace(/\b6\.\s*/g, "")
      .replace(/\b7\.\s*/g, "")
      .replace(/금\(金\) 기운을 의식적으로 보완하는 것이 좋습니다\.?\s*/g, "")
      .replace(/금\(金\) 기운을 보완할수록 운의 균형이 좋아집니다\.?\s*/g, "")
      .replace(/부족한 금\(金\) 기운을 보완해 주는 사람이 안정적 인연이 될 가능성이 큽니다\.?\s*/g, "")
      .replace(/부족한 금\(金\) 기운은 .*?보완해야 합니다\.?\s*/g, "")
      .replace(/^대운 초반 1~3년\s*$/gm, "")
      .replace(/^대운 중반 4~7년\s*$/gm, "")
      .replace(/^대운 후반 8~10년\s*$/gm, "")
      .replace(/^🧭?\s*대운 간지표\s*$/gm, "")
      .replace(/^📈?\s*대운 10년 단계별 흐름\s*$/gm, "")
      .replace(/^🔮?\s*대운 10년 흐름 정밀 해석\s*$/gm, "")
      .replace(/5세~14세\s*:\s*.*$/gm, "")
      .replace(/15세~24세\s*:\s*.*$/gm, "")
      .replace(/25세~34세\s*:\s*.*$/gm, "")
      .replace(/35세~44세\s*:\s*.*$/gm, "")
      .replace(/45세~54세\s*:\s*.*$/gm, "")
      .replace(/55세~64세\s*:\s*.*$/gm, "")
      .replace(/65세~74세\s*:\s*.*$/gm, "")
      .replace(/75세~84세\s*:\s*.*$/gm, "")
      .replace(/85세~94세\s*:\s*.*$/gm, "")
      .replace(/95세~104세\s*:\s*.*$/gm, "")
      .replace(/대운 간지는 10년 동안 반복적으로 작용하는 큰 환경입니다\.?\s*/g, "")
      .replace(/부족한 토\(土\) 기운은 반드시 보완해야 할 과제입니다\.?\s*/g, "")
      .replace(/부족한 금\(金\) 기운을 보완할 수 있는 협업과 환경이 도움이 됩니다\.?\s*/g, "")
      .replace(/부족한 금\(金\) 기운은 의식적으로 보완하는 것이 좋습니다\.?\s*/g, "")
      .replace(/금\(金\) 기운은 수면·식사·운동·회복 루틴을 통해 균형을 맞추는 것이 좋습니다\.?\s*/g, "")
      .replace(/부족한 금\(金\) 기운을 보완해 주는 사람이 안정적인 인연이 될 가능성이 큽니다\.?\s*/g, "")
      .replace(/강한 목\(木\) 기운은 .*?\.\s*/g, "")
      .replace(/부족한 금\(金\) 기운은 .*?\.\s*/g, "")
      .replace(/대운은 단순히 좋은 운과 나쁜 운으로 나누기보다.*?\.\s*/g, "")
      .replace(/강한 목\(木\) 기운은.*$/gm, "")
      .replace(/부족한 금\(金\) 기운은.*$/gm, "")
      .replace(/목\(木\) 기운은 이미 강하게.*$/gm, "")
      .replace(/금\(金\)의 부족.*$/gm, "")
      .replace(/^대운 초반 1~3년.*$/gm, "")
      .replace(/^대운 후반 8~10년.*$/gm, "")
      .replace(/^---- AI 종합 상담.*$/gm, "")
      .replace(/^\[AI 종합상담 핵심 정리\]\s*$/gm, "")
      .replace(/강한 목\(木\).*$/gm, "")
      .replace(/부족한 금\(金\).*$/gm, "")
      .replace(/혼자 밀어붙이기보다.*$/gm, "")
      .replace(/^\[AI 종합상담 핵심 정리\]\s*$/gm, "")
      .replace(/재물운은 단기적인 한 번의 수익보다.*$/gm, "")
      .replace(/직업운은 여러 분야를 자주 바꾸기보다.*$/gm, "")
      .replace(/건강운은 큰 질병 자체보다.*$/gm, "")
      .replace(/강한 목\(木\) 기운을 가진 만큼 추진력과 확장성이 뛰어납니다\.\s*/g, "")
      .replace(/부족한 금 기운을 현실에서 보완하는 실천력이 있어야 합니다\.\s*/g, "")
      .replace(/직업운은 여러 분야를 자주 바꾸기보다 한 분야를 깊이 있게 파고들수록 운이 상승하는 특징이 있습니다\.\s*/g, "")
        // ✅ Semantic 중복 최종 제거: 협업/관계/환경 성장 계열
      .replace(/(협업|파트너|사람\s*활용|관계\s*활용|주변\s*사람의\s*도움)/g, "협력 구조")
      .replace(/(관계\s*속에서\s*기회가\s*열립니다|사람을\s*통해\s*기회가\s*들어옵니다|인연을\s*통해\s*흐름이\s*열립니다)/g, "협력 구조 안에서 기회가 열립니다")
      .replace(/사람과 구조를 활용할 때 운의 흐름이 안정됩니다\.\s*/g, "")
      .replace(/협력과 의사소통 방식을 더욱 꼼꼼히 점검해야 합니다\.\s*/g, "")
      .replace(/기반을 다지고 협력자와 시스템을 구축하는 시간이 될 것입니다\.\s*/g, "")
      .replace(/건강운은 큰 질병 자체보다 생활 리듬이 무너질 때 컨디션 저하가 반복되기 쉬우므로 규칙적인 습관 관리가 중요합니다\.\s*/g, "")
      .replace(/\n{3,}/g, "\n\n");

return finalText;
}
    

  