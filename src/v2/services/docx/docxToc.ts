import type { DocxSection } from "./detailDocxService";

import {
  sectionTitle,
  smallParagraph,
} from "./docxCommon";

export function tableOfContents(sections: DocxSection[]) {
  return [
    sectionTitle("목차"),
    ...[
      "1. 상담 안내문",
      "2. 개인 상담 기준",
      "3. 사주 원국 해석",
      ...sections.map((section, index) => `${index + 4}. ${section.title}`),
      `${sections.length + 4}. 3년 전략`,
      `${sections.length + 5}. 실천 체크리스트`,
      `${sections.length + 6}. 최종 총평`,
    ].map(smallParagraph),
  ];
}
