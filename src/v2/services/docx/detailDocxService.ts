import { coverPage } from "./docxCover";

import {
  reportIntro,
  personalStandard,
  originalSajuGuide,
} from "./docxIntro";

import { tableOfContents } from "./docxToc";

import { sectionToDocx } from "./docxChapter";

import {
  threeYearStrategy,
  checklist,
  finalReview,
} from "./docxClosing";

import { buildAndSaveDocx } from "./docxBuilder";

export type DocxSection = {
  title: string;
  content: string;
};

export async function downloadDetailDocx({
  name,
  sections,
  reportTitle = "Premium Report",
  fileSuffix = "Premium_상세리포트",
}: {
  name: string;
  sections: DocxSection[];
  reportTitle?: string;
  fileSuffix?: string;
}) {
  await buildAndSaveDocx({
    name,
    fileSuffix,
    children: [
      ...coverPage(name, reportTitle),
      ...reportIntro(name),
      ...tableOfContents(sections),
      ...personalStandard(name),
      ...originalSajuGuide(),
      ...sections.flatMap(sectionToDocx),
      ...threeYearStrategy(),
      ...checklist(),
      ...finalReview(name),
    ],
  });
}
