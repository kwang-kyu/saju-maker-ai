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
      children: [textRun("천운문", { bold: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [textRun("", { size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [textRun("프리미엄 사주 리포트", { bold: true, size: 52 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [textRun("사주를 읽고 삶의 방향을 정리합니다", { bold: true, size: 30 })],
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
      children: [textRun(`${name}님을 위한 사주 상담서`, { bold: true, size: 34 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 620 },
      children: [textRun("사주를 설명하는 것이 아니라 사람의 방향을 함께 봅니다.", { size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [textRun("천운문 프리미엄 18.0", { bold: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [textRun(`${year}`, { size: 22 })],
    }),
  ];
}