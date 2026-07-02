import {
  Document,
  Packer,
} from "docx";

import {
  createHeader,
  createFooter,
} from "./docxHeaderFooter";

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
import { saveAs } from "file-saver";

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
  const doc = new Document({
    sections: [
      {
        headers: {
          default: createHeader(),
        },
        footers: {
          default: createFooter(),
        },
        properties: {},
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
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${name}_천운문_${fileSuffix}.docx`);
}














