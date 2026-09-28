/**
 * vNext Report DOCX writer — Summary DOCX formatting/output only.
 *
 * Does not calculate, judge, call GPT, or reuse V2 consulting mappers.
 * Chapter facts come from composeVNextReportSummary.
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

import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import type {
  TimeState,
} from "../types/timeState.js";
import type {
  VNextReportPeriodLuckFlowFacts,
} from "./vNextReportPeriodLuckFlowBuilder.js";
import {
  composeVNextReportSummary,
  type VNextReportSummaryBodyBlock,
  type VNextReportSummaryChapter,
  type VNextReportSummaryComposition,
} from "./vNextReportSummaryComposer.js";

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

  throw new Error(VNEXT_REPORT_DOCX_ERROR_MESSAGE);
}

const BODY_FONT = "Malgun Gothic";
const TITLE_COLOR = "1E3A8A";
const BODY_COLOR = "1F2937";
const MUTED_COLOR = "4B5563";
const GOLD_COLOR = "B45309";

export const VNEXT_REPORT_DOCX_ERROR_MESSAGE =
  "문서를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.";

export type VNextReportDocxInput = {
  displayName?: string;
  birthProfile: Pick<
    VNextBirthProfile,
    | "displayName"
    | "gender"
    | "year"
    | "month"
    | "day"
    | "birthTimeBranch"
    | "calendarType"
  >;
  responseText: string;
  sectionLabels?: readonly string[];
  humanContext?: HumanDestinyContext | null;
  timeState?: TimeState | null;
  periodLuckFlowFacts?: VNextReportPeriodLuckFlowFacts | null;
};

export function canDownloadVNextReportDocx(
  phase: string,
  responseText: string | null | undefined,
): boolean {
  return phase === "completed"
    && typeof responseText === "string"
    && responseText.trim().length > 0;
}

export function sanitizeVNextReportDocxFileNamePart(
  value: string,
): string {
  const cleaned = value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "사주리포트";
}

export function buildVNextReportDocxFileName(
  displayName?: string,
): string {
  const namePart = sanitizeVNextReportDocxFileNamePart(
    displayName?.trim() || "사주리포트",
  );

  return `${namePart}_사주리포트.docx`;
}

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

function coverParagraphs(
  composition: VNextReportSummaryComposition,
): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 200 },
      children: [
        textRun("사주 요약 리포트", {
          bold: true,
          size: 20,
          color: GOLD_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        textRun("SUMMARY REPORT", {
          bold: true,
          size: 48,
          color: TITLE_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        textRun(composition.coverSubtitle, {
          bold: true,
          size: 28,
          color: BODY_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        textRun(
          "확정된 분석 사실을 장별로 정리한 요약 문서입니다.",
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
  composition: VNextReportSummaryComposition,
  sectionLabels: readonly string[] | undefined,
): Paragraph[] {
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
        textRun("Summary 장 구성", {
          bold: true,
          size: 24,
          color: TITLE_COLOR,
        }),
      ],
    }),
    ...composition.tocTitles.map((title) => new Paragraph({
      spacing: { after: 100 },
      children: [
        textRun(`· ${title}`, {
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

function blockToParagraph(
  block: VNextReportSummaryBodyBlock,
): Paragraph {
  if (block.kind === "heading") {
    return new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 220, after: 120 },
      children: [
        textRun(block.text, {
          bold: true,
          size: 24,
          color: TITLE_COLOR,
        }),
      ],
    });
  }

  if (block.kind === "bullet") {
    return new Paragraph({
      spacing: { after: 120, line: 360 },
      indent: { left: 240 },
      children: [
        textRun(`• ${block.text}`, { size: 22 }),
      ],
    });
  }

  if (block.kind === "kv") {
    return new Paragraph({
      spacing: { after: 120, line: 360 },
      children: [
        textRun(`${block.label}: `, {
          bold: true,
          size: 22,
        }),
        textRun(block.value, { size: 22 }),
      ],
    });
  }

  return new Paragraph({
    spacing: { after: 160, line: 360 },
    children: [textRun(block.text, { size: 22 })],
  });
}

function chapterParagraphs(
  chapter: VNextReportSummaryChapter,
): Paragraph[] {
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

  if (chapter.blocks.length === 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          textRun("이 장에 연결할 분석 사실이 아직 준비되지 않았습니다.", {
            size: 22,
            color: MUTED_COLOR,
          }),
        ],
      }),
    );
    return paragraphs;
  }

  paragraphs.push(...chapter.blocks.map(blockToParagraph));
  return paragraphs;
}

function closingParagraphs(
  composition: VNextReportSummaryComposition,
): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 280 },
      children: [
        textRun("최종 정리", {
          bold: true,
          size: 32,
          color: TITLE_COLOR,
        }),
      ],
    }),
    ...composition.closingLines.map((line) => new Paragraph({
      spacing: { after: 160, line: 360 },
      children: [textRun(line, { size: 22 })],
    })),
  ];
}

export function composeVNextReportDocxSummary(
  input: VNextReportDocxInput,
): VNextReportSummaryComposition {
  return composeVNextReportSummary({
    displayName: input.displayName,
    birthProfile: input.birthProfile,
    humanContext: input.humanContext,
    timeState: input.timeState,
    periodLuckFlowFacts: input.periodLuckFlowFacts,
    gptNarration: input.responseText,
  });
}

export function buildVNextReportDocxChildren(
  input: VNextReportDocxInput,
): Paragraph[] {
  const composition = composeVNextReportDocxSummary(input);

  return [
    ...coverParagraphs(composition),
    ...tocParagraphs(composition, input.sectionLabels),
    ...composition.chapters.flatMap(chapterParagraphs),
    ...closingParagraphs(composition),
  ];
}

/**
 * Structural page starts for Summary DOCX:
 * Cover + 목차 + 10 chapters + 최종정리 = 13.
 * Chapter 1 carries 기본 정보 (no separate duplicate birth page).
 */
export function estimateVNextReportDocxPageStarts(
  _input: VNextReportDocxInput,
): number {
  return 1 + 1 + 10 + 1;
}

export function createVNextReportDocxDocument(
  input: VNextReportDocxInput,
): Document {
  return new Document({
    sections: [
      {
        properties: {},
        children: buildVNextReportDocxChildren(input),
      },
    ],
  });
}

export async function buildVNextReportDocxBlob(
  input: VNextReportDocxInput,
): Promise<Blob> {
  const document = createVNextReportDocxDocument(input);
  return Packer.toBlob(document);
}

export async function buildVNextReportDocxBuffer(
  input: VNextReportDocxInput,
): Promise<Uint8Array> {
  const document = createVNextReportDocxDocument(input);
  return Packer.toBuffer(document);
}

export async function downloadVNextReportDocx(
  input: VNextReportDocxInput,
): Promise<void> {
  if (!input.responseText.trim()) {
    throw new Error(VNEXT_REPORT_DOCX_ERROR_MESSAGE);
  }

  const blob = await buildVNextReportDocxBlob(input);
  const composition = composeVNextReportDocxSummary(input);
  const fileName = buildVNextReportDocxFileName(composition.displayName);
  resolveSaveAs()(blob, fileName);
}
