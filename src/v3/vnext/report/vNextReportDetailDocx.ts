/**
 * vNext Report Detail DOCX writer — DetailComposition formatting/output only.
 *
 * Does not calculate, judge, call GPT/Decision/QuestionReader, or invent facts.
 * Chapter/section/block text comes from composeVNextReportDetail output.
 * Does not modify Summary DOCX writer or Summary Composer.
 */

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import fileSaver from "file-saver";

import {
  VNEXT_REPORT_DETAIL_CHAPTER_DEFS,
  type VNextReportDetailBodyBlock,
  type VNextReportDetailChapter,
  type VNextReportDetailComposition,
  type VNextReportDetailSection,
} from "./vNextReportDetailComposer.js";

type SaveAsFn = (blob: Blob, fileName: string) => void;

function resolveSaveAs(): SaveAsFn {
  const candidate: unknown = fileSaver;

  if (typeof candidate === "function") {
    return candidate as SaveAsFn;
  }

  if (
    candidate
    && typeof candidate === "object"
    && "saveAs" in candidate
    && typeof (candidate as { saveAs: unknown }).saveAs === "function"
  ) {
    return (candidate as { saveAs: SaveAsFn }).saveAs;
  }

  throw new Error(VNEXT_REPORT_DETAIL_DOCX_ERROR_MESSAGE);
}

const BODY_FONT = "Malgun Gothic";
const TITLE_COLOR = "1E3A8A";
const BODY_COLOR = "1F2937";
const MUTED_COLOR = "4B5563";
const GOLD_COLOR = "B45309";

export const VNEXT_REPORT_DETAIL_DOCX_ERROR_MESSAGE =
  "상세 문서를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/**
 * Writer input: DetailComposition is the Source of Truth.
 * Optional metadata is layout/filename only — never used for judgement.
 */
export type VNextReportDetailDocxInput = {
  composition: VNextReportDetailComposition;
  sectionLabels?: readonly string[];
};

function textRun(
  text: string,
  options?: {
    bold?: boolean;
    size?: number;
    color?: string;
  },
): TextRun {
  return new TextRun({
    text,
    bold: options?.bold,
    size: options?.size ?? 22,
    color: options?.color ?? BODY_COLOR,
    font: BODY_FONT,
  });
}

export function sanitizeVNextReportDetailDocxFileNamePart(
  value: string,
): string {
  const cleaned = value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "사주리포트";
}

export function buildVNextReportDetailDocxFileName(
  displayName?: string,
): string {
  const namePart = sanitizeVNextReportDetailDocxFileNamePart(
    displayName?.trim() || "사주리포트",
  );

  return `${namePart}_사주상세리포트.docx`;
}

function chapterHasContent(chapter: VNextReportDetailChapter): boolean {
  return chapter.sections.some((section) => section.blocks.length > 0);
}

function nonEmptyChapters(
  composition: VNextReportDetailComposition,
): VNextReportDetailChapter[] {
  return composition.chapters.filter(chapterHasContent);
}

function coverParagraphs(
  composition: VNextReportDetailComposition,
): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 200 },
      children: [
        textRun("사주 리포트", {
          bold: true,
          size: 20,
          color: GOLD_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        textRun("상세 분석", {
          bold: true,
          size: 48,
          color: TITLE_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        textRun("DETAIL REPORT", {
          bold: true,
          size: 28,
          color: TITLE_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        textRun(`${composition.displayName}님을 위한 사주 상세 리포트`, {
          bold: true,
          size: 26,
          color: BODY_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        textRun(
          "확정된 분석 사실을 장·영역별로 펼친 상세 문서입니다.",
          { size: 22, color: MUTED_COLOR },
        ),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 320, after: 80 },
      children: [
        textRun(`상담자: ${composition.displayName}`, {
          size: 22,
          color: MUTED_COLOR,
        }),
      ],
    }),
  ];
}

function tocParagraphs(
  composition: VNextReportDetailComposition,
  sectionLabels: readonly string[] | undefined,
): Paragraph[] {
  const chapters = nonEmptyChapters(composition);

  const paragraphs: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 280 },
      children: [
        textRun("목차 / 구성", {
          bold: true,
          size: 32,
          color: TITLE_COLOR,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        textRun("Detail 장 구성", {
          bold: true,
          size: 24,
          color: TITLE_COLOR,
        }),
      ],
    }),
    ...chapters.map((chapter) => new Paragraph({
      spacing: { after: 100 },
      children: [
        textRun(`· Chapter ${chapter.index}. ${chapter.title}`, {
          size: 22,
          color: BODY_COLOR,
        }),
      ],
    })),
  ];

  if (sectionLabels && sectionLabels.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          textRun("리포트 화면 메뉴", {
            bold: true,
            size: 24,
            color: TITLE_COLOR,
          }),
        ],
      }),
      ...sectionLabels.map((label) => new Paragraph({
        spacing: { after: 100 },
        children: [
          textRun(`· ${label}`, {
            size: 20,
            color: MUTED_COLOR,
          }),
        ],
      })),
    );
  }

  return paragraphs;
}

function formatFactFieldLabel(key: string): string {
  return key;
}

function blockToParagraphs(
  block: VNextReportDetailBodyBlock,
): Paragraph[] {
  if (block.kind === "heading") {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 220, after: 120 },
        children: [
          textRun(block.text, {
            bold: true,
            size: 24,
            color: TITLE_COLOR,
          }),
        ],
      }),
    ];
  }

  if (block.kind === "bullet") {
    return [
      new Paragraph({
        spacing: { after: 120, line: 360 },
        indent: { left: 240 },
        children: [
          textRun(`• ${block.text}`, { size: 22 }),
        ],
      }),
    ];
  }

  if (block.kind === "kv") {
    return [
      new Paragraph({
        spacing: { after: 120, line: 360 },
        children: [
          textRun(`${block.label}: `, {
            bold: true,
            size: 22,
          }),
          textRun(block.value, { size: 22 }),
        ],
      }),
    ];
  }

  if (block.kind === "factObject") {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        spacing: { before: 160, after: 80 },
        children: [
          textRun(block.source, {
            bold: true,
            size: 20,
            color: MUTED_COLOR,
          }),
        ],
      }),
    ];

    for (const field of block.fields) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 100, line: 360 },
          indent: { left: 120 },
          children: [
            textRun(`${formatFactFieldLabel(field.key)}: `, {
              bold: true,
              size: 22,
            }),
            textRun(String(field.value), { size: 22 }),
          ],
        }),
      );
    }

    return paragraphs;
  }

  if (block.kind === "factList") {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        spacing: { before: 160, after: 80 },
        children: [
          textRun(block.source, {
            bold: true,
            size: 20,
            color: MUTED_COLOR,
          }),
        ],
      }),
    ];

    for (const item of block.items) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 120, line: 360 },
          indent: { left: 240 },
          children: [
            textRun(`• ${item}`, { size: 22 }),
          ],
        }),
      );
    }

    return paragraphs;
  }

  return [
    new Paragraph({
      spacing: { after: 160, line: 360 },
      children: [textRun(block.text, { size: 22 })],
    }),
  ];
}

function sectionParagraphs(
  chapter: VNextReportDetailChapter,
  section: VNextReportDetailSection,
  sectionOrdinal: number,
): Paragraph[] {
  if (section.blocks.length === 0) {
    return [];
  }

  const chapterPad = String(chapter.index).padStart(2, "0");
  const sectionTitle = `${chapterPad}-${sectionOrdinal} ${section.title}`;

  const paragraphs: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 160 },
      children: [
        textRun(sectionTitle, {
          bold: true,
          size: 26,
          color: TITLE_COLOR,
        }),
      ],
    }),
  ];

  for (const block of section.blocks) {
    paragraphs.push(...blockToParagraphs(block));
  }

  return paragraphs;
}

function chapterParagraphs(
  chapter: VNextReportDetailChapter,
): Paragraph[] {
  const contentSections = chapter.sections.filter(
    (section) => section.blocks.length > 0,
  );

  if (contentSections.length === 0) {
    return [];
  }

  const title = `Chapter ${chapter.index}. ${chapter.title}`;

  const paragraphs: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 280 },
      children: [
        textRun(title, {
          bold: true,
          size: 32,
          color: TITLE_COLOR,
        }),
      ],
    }),
  ];

  contentSections.forEach((section, index) => {
    paragraphs.push(...sectionParagraphs(chapter, section, index + 1));
  });

  return paragraphs;
}

/**
 * Structural page starts for Detail DOCX:
 * Cover + 목차 + non-empty chapters.
 */
export function estimateVNextReportDetailDocxPageStarts(
  input: VNextReportDetailDocxInput,
): number {
  return 1 + 1 + nonEmptyChapters(input.composition).length;
}

export function buildVNextReportDetailDocxChildren(
  input: VNextReportDetailDocxInput,
): Paragraph[] {
  const { composition } = input;
  const chapters = nonEmptyChapters(composition);

  return [
    ...coverParagraphs(composition),
    ...tocParagraphs(composition, input.sectionLabels),
    ...chapters.flatMap(chapterParagraphs),
  ];
}

export function createVNextReportDetailDocxDocument(
  input: VNextReportDetailDocxInput,
): Document {
  return new Document({
    sections: [
      {
        properties: {},
        children: buildVNextReportDetailDocxChildren(input),
      },
    ],
  });
}

export async function buildVNextReportDetailDocxBlob(
  input: VNextReportDetailDocxInput,
): Promise<Blob> {
  const document = createVNextReportDetailDocxDocument(input);
  return Packer.toBlob(document);
}

export async function buildVNextReportDetailDocxBuffer(
  input: VNextReportDetailDocxInput,
): Promise<Uint8Array> {
  const document = createVNextReportDetailDocxDocument(input);
  return Packer.toBuffer(document);
}

/**
 * Download helper for a later STEP. Not wired to Report UI in STEP 49-3.
 */
export async function downloadVNextReportDetailDocx(
  input: VNextReportDetailDocxInput,
): Promise<void> {
  if (nonEmptyChapters(input.composition).length === 0) {
    throw new Error(VNEXT_REPORT_DETAIL_DOCX_ERROR_MESSAGE);
  }

  const blob = await buildVNextReportDetailDocxBlob(input);
  const fileName = buildVNextReportDetailDocxFileName(
    input.composition.displayName,
  );
  resolveSaveAs()(blob, fileName);
}

export function listRenderedVNextReportDetailChapterTitles(
  input: VNextReportDetailDocxInput,
): string[] {
  return nonEmptyChapters(input.composition).map(
    (chapter) => `Chapter ${chapter.index}. ${chapter.title}`,
  );
}

export function assertDetailCompositionChapterOrder(
  composition: VNextReportDetailComposition,
): boolean {
  if (composition.chapters.length !== VNEXT_REPORT_DETAIL_CHAPTER_DEFS.length) {
    return false;
  }

  return VNEXT_REPORT_DETAIL_CHAPTER_DEFS.every((def, index) => {
    const chapter = composition.chapters[index];
    return chapter?.id === def.id
      && chapter.title === def.title
      && chapter.index === index + 1;
  });
}
