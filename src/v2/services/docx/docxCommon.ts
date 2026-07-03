import {
  AlignmentType,
  HeadingLevel,
  Paragraph,
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
    spacing: { after: 200 },
    children: [textRun(text, { size: 22 })],
  });
}

export function guideParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 240 },
    children: [textRun(text, { size: 23 })],
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
      textRun("", { size: 18, color: GOLD_COLOR }),
      textRun(`\n${title}`, { bold: true, size: 34, color: TITLE_COLOR }),
      textRun("\n", { size: 18, color: GOLD_COLOR }),
    ],
  });
}

export function subTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 180 },
    children: [
      textRun(` ${title}`, { bold: true, size: 26, color: TITLE_COLOR }),
    ],
  });
}

export function premiumBoxTitle(title: string) {
  return new Paragraph({
    spacing: { before: 300, after: 160 },
    children: [
      textRun("", { size: 18, color: GOLD_COLOR }),
      textRun(`\n ${title}`, { bold: true, size: 26, color: GOLD_COLOR }),
      textRun("\n", { size: 18, color: GOLD_COLOR }),
    ],
  });
}

export function premiumBoxParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 180 },
    children: [textRun(`   ${text}`, { size: 22, color: "374151" })],
  });
}

export function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    alignment: AlignmentType.CENTER,
    children: [textRun("", { size: 16, color: "D1D5DB" })],
  });
}
