import {
  AlignmentType,
  Paragraph,
} from "docx";

import { textRun } from "./docxCommon";

export function coverPage(name: string, reportTitle: string) {
  const year = new Date().getFullYear();

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1400, after: 220 },
      children: [textRun("CONFIDENTIAL REPORT", { bold: true, size: 20 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [textRun("", { size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [textRun("천운문 PREMIUM", { bold: true, size: 56 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [textRun("사주 종합 컨설팅 리포트", { bold: true, size: 34 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [textRun("", { size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 520 },
      children: [textRun(reportTitle, { bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [textRun(`${name}님`, { bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 620 },
      children: [textRun("사주를 넘어 인생의 방향을 제시합니다.", { size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [textRun("Premium Edition", { bold: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [textRun(`${year}`, { size: 22 })],
    }),
  ];
}
