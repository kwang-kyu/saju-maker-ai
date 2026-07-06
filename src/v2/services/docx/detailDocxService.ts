import { coverPage } from "./docxCover";

import {
  reportIntro,
  personalStandard,
  originalSajuGuide,
  lifeStageFlow,
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
  reportTitle = "천운문 프리미엄 사주 리포트",
fileSuffix = "천운문_프리미엄사주리포트",
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
      ...lifeStageFlow(name),
      ...sections.flatMap(sectionToDocx),
      ...threeYearStrategy(),
      ...checklist(),
      ...finalReview(name),
    ],
  });
}