import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Paragraph,
  ShadingType,
  TextRun,
} from "docx";

type TextRunOptions = {
  bold?: boolean;
  size?: number;
  color?: string;
  font?: string;
};

const BODY_FONT = "Malgun Gothic";
const TITLE_COLOR = "1E3A8A";
const GOLD_COLOR = "B45309";
const BODY_COLOR = "1F2937";
const LIGHT_BLUE = "EFF6FF";
const LIGHT_GOLD = "FFFBEB";
const BORDER_BLUE = "93C5FD";
const BORDER_GOLD = "FCD34D";

export function splitContent(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function textRun(text: string, options?: TextRunOptions) {
  return new TextRun({
    text,
    bold: options?.bold,
    size: options?.size ?? 22,
    color: options?.color ?? BODY_COLOR,
    font: options?.font ?? BODY_FONT,
  });
}

export function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [textRun(text, { size: 22 })],
  });
}

export function guideParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 240, line: 380 },
    shading: {
      type: ShadingType.CLEAR,
      color: "auto",
      fill: LIGHT_BLUE,
    },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: BORDER_BLUE },
    },
    indent: { left: 240 },
    children: [textRun(text, { size: 23, bold: true, color: TITLE_COLOR })],
  });
}

export function smallParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [textRun(text, { size: 20, color: "4B5563" })],
  });
}

export function sectionTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    alignment: AlignmentType.CENTER,
    spacing: { before: 260, after: 320 },
    children: [
      textRun("CONFIDENTIAL PREMIUM REPORT", {
        bold: true,
        size: 16,
        color: GOLD_COLOR,
      }),
      textRun(`\n${title}`, {
        bold: true,
        size: 34,
        color: TITLE_COLOR,
      }),
    ],
  });
}

export function subTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 180 },
    shading: {
      type: ShadingType.CLEAR,
      color: "auto",
      fill: LIGHT_BLUE,
    },
    border: {
      left: { style: BorderStyle.SINGLE, size: 10, color: BORDER_BLUE },
    },
    indent: { left: 180 },
    children: [
      textRun(` ${title}`, {
        bold: true,
        size: 26,
        color: TITLE_COLOR,
      }),
    ],
  });
}

export function premiumBoxTitle(title: string) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    shading: {
      type: ShadingType.CLEAR,
      color: "auto",
      fill: LIGHT_GOLD,
    },
    border: {
      top: { style: BorderStyle.SINGLE, size: 8, color: BORDER_GOLD },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: BORDER_GOLD },
      left: { style: BorderStyle.SINGLE, size: 8, color: BORDER_GOLD },
      right: { style: BorderStyle.SINGLE, size: 8, color: BORDER_GOLD },
    },
    indent: { left: 180 },
    children: [
      textRun(` ${title}`, {
        bold: true,
        size: 26,
        color: GOLD_COLOR,
      }),
    ],
  });
}

export function premiumBoxParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 160, line: 360 },
    shading: {
      type: ShadingType.CLEAR,
      color: "auto",
      fill: LIGHT_GOLD,
    },
    border: {
      left: { style: BorderStyle.SINGLE, size: 8, color: BORDER_GOLD },
    },
    indent: { left: 260 },
    children: [textRun(text, { size: 22, color: "374151" })],
  });
}

export function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    alignment: AlignmentType.CENTER,
    children: [
      textRun("", {
        size: 16,
        color: "D1D5DB",
      }),
    ],
  });
}
