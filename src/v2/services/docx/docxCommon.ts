import {
  HeadingLevel,
  Paragraph,
  TextRun,
} from "docx";

export function splitContent(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function textRun(text: string, options?: { bold?: boolean; size?: number }) {
  return new TextRun({
    text,
    bold: options?.bold,
    size: options?.size ?? 22,
  });
}

export function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 180 },
    children: [textRun(text)],
  });
}

export function guideParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 220 },
    children: [textRun(text, { size: 23 })],
  });
}

export function smallParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [textRun(text, { size: 20 })],
  });
}

export function sectionTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { before: 240, after: 320 },
    children: [textRun(title, { bold: true, size: 34 })],
  });
}

export function subTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [textRun(title, { bold: true, size: 26 })],
  });
}

export function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    children: [textRun("", { size: 18 })],
  });
}
