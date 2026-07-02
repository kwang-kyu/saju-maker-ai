import {
  AlignmentType,
  Paragraph,
} from "docx";

import { textRun } from "./docxCommon";

export function coverPage(name: string, reportTitle: string) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1800, after: 300 },
      children: [textRun("천운문", { bold: true, size: 60 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [textRun(reportTitle, { bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [textRun("사주를 넘어 인생의 방향을 제시합니다.", { size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [textRun(name, { bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [textRun(`${new Date().getFullYear()}`, { size: 22 })],
    }),
  ];
}
