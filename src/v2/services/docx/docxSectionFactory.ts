import type { DocxSection } from "./detailDocxService";

export function buildSummarySections(
  sections: DocxSection[],
): DocxSection[] {
  return sections;
}

export function buildDetailSections(
  sections: DocxSection[],
): DocxSection[] {
  return sections;
}

export function buildCaseSections(
  sections: DocxSection[],
): DocxSection[] {
  return sections.filter(
    (section) =>
      section.title.includes("상담") &&
      !section.title.includes("AI"),
  );
}

export function buildAiSections(
  sections: DocxSection[],
): DocxSection[] {
  return sections.filter((section) =>
    section.title.includes("AI"),
  );
}
