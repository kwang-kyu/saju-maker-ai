import {
  AlignmentType,
  Footer,
  Header,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";

import { textRun } from "./docxCommon";

export function createHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [textRun("천운문 Premium Report", { size: 18 })],
      }),
    ],
  });
}

export function createFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          textRun("천운문 Premium  Confidential  ", { size: 18 }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
          }),
        ],
      }),
    ],
  });
}
