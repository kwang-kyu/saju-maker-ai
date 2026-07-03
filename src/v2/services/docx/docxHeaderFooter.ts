import {
  AlignmentType,
  BorderStyle,
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
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: "D6B25E",
          },
        },
        children: [
          textRun("천운문 PREMIUM", {
            bold: true,
            size: 18,
            color: "1E3A8A",
          }),
          textRun("   |   CONFIDENTIAL REPORT", {
            bold: true,
            size: 16,
            color: "B45309",
          }),
        ],
      }),
    ],
  });
}

export function createFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80 },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: "D6B25E",
          },
        },
        children: [
          textRun(" Cheonunmun Premium Report      Page ", {
            size: 17,
            color: "6B7280",
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 17,
            color: "6B7280",
            font: "Malgun Gothic",
          }),
        ],
      }),
    ],
  });
}
