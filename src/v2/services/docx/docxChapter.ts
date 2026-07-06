import type { DocxSection } from "./detailDocxService";

import {
  bodyParagraph,
  premiumBoxParagraph,
  premiumBoxTitle,
  sectionTitle,
  splitContent,
} from "./docxCommon";

function isMonthLine(line: string) {
  return /^(1월|2월|3월|4월|5월|6월|7월|8월|9월|10월|11월|12월)$/.test(line);
}

function isMonthlyDetailLine(line: string) {
  return line.startsWith("- 핵심 흐름:")
    || line.startsWith("- 기회:")
    || line.startsWith("- 주의사항:")
    || line.startsWith("- 재물/일 흐름:")
    || line.startsWith("- 관계/건강 흐름:")
    || line.startsWith("- 실천 조언:");
}

function yearlyLineToDocx(line: string) {
  if (isMonthLine(line)) {
    return premiumBoxTitle(`📅 ${line}`);
  }

  if (isMonthlyDetailLine(line)) {
    return premiumBoxParagraph(line);
  }

  return bodyParagraph(line);
}

export function buildChapter(section: DocxSection) {
  const lines = splitContent(section.content);
  const isYearSection = section.title.includes("올해 운세");

  return [
    sectionTitle(section.title),
    ...lines.map((line) => isYearSection ? yearlyLineToDocx(line) : bodyParagraph(line)),
  ];
}

export function sectionToDocx(section: DocxSection) {
  return buildChapter(section);
}