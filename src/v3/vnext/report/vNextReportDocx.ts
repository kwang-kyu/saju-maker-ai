/**
 * vNext Report DOCX writer — formatting/output only.
 *
 * Does not calculate, judge, call GPT, or reuse V2 consulting mappers.
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
  findBirthTimeBranchOption,
  formatVNextBirthDate,
  type VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";

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

function resolveGenderLabel(
  gender: VNextBirthProfile["gender"],
): string {
  return gender === "male"
    ? "남성"
    : "여성";
}

function resolveCalendarLabel(
  calendarType: VNextBirthProfile["calendarType"],
): string {
  return calendarType === "solar"
    ? "양력"
    : "음력";
}

function resolveDisplayName(
  input: VNextReportDocxInput,
): string {
  const fromInput = input.displayName?.trim();
  if (fromInput) {
    return fromInput;
  }

  const fromProfile = input.birthProfile.displayName?.trim();
  if (fromProfile) {
    return fromProfile;
  }

  return "상담자";
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

function titleParagraph(
  text: string,
): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [
      textRun(text, {
        bold: true,
        size: 36,
        color: TITLE_COLOR,
      }),
    ],
  });
}

function headingParagraph(
  text: string,
): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [
      textRun(text, {
        bold: true,
        size: 26,
        color: TITLE_COLOR,
      }),
    ],
  });
}

function infoParagraph(
  text: string,
): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      textRun(text, {
        size: 20,
        color: MUTED_COLOR,
      }),
    ],
  });
}

function bodyParagraph(
  text: string,
): Paragraph {
  if (!text) {
    return new Paragraph({
      spacing: { after: 120 },
      children: [],
    });
  }

  return new Paragraph({
    spacing: { after: 160, line: 360 },
    children: [textRun(text, { size: 22 })],
  });
}

function buildBirthInfoParagraphs(
  birthProfile: VNextReportDocxInput["birthProfile"],
  displayName: string,
): Paragraph[] {
  const birthDate = formatVNextBirthDate(birthProfile);
  const birthTimeLabel = findBirthTimeBranchOption(
    birthProfile.birthTimeBranch,
  ).label;
  const genderLabel = resolveGenderLabel(birthProfile.gender);
  const calendarLabel = resolveCalendarLabel(
    birthProfile.calendarType,
  );

  return [
    headingParagraph("기본 정보"),
    infoParagraph(`이름: ${displayName}`),
    infoParagraph(`생년월일: ${birthDate}`),
    infoParagraph(`출생 시진: ${birthTimeLabel}`),
    infoParagraph(`성별: ${genderLabel}`),
    infoParagraph(`역법: ${calendarLabel}`),
  ];
}

function buildSectionLabelParagraphs(
  sectionLabels: readonly string[] | undefined,
): Paragraph[] {
  if (!sectionLabels || sectionLabels.length === 0) {
    return [];
  }

  return [
    headingParagraph("구성"),
    ...sectionLabels.map((label) => infoParagraph(`· ${label}`)),
  ];
}

function buildBodyParagraphs(
  responseText: string,
): Paragraph[] {
  const lines = responseText.replace(/\r\n/g, "\n").split("\n");

  return [
    headingParagraph("리포트 본문"),
    ...lines.map((line) => bodyParagraph(line)),
  ];
}

export function buildVNextReportDocxChildren(
  input: VNextReportDocxInput,
): Paragraph[] {
  const displayName = resolveDisplayName(input);

  return [
    titleParagraph("사주 리포트"),
    ...buildBirthInfoParagraphs(input.birthProfile, displayName),
    ...buildSectionLabelParagraphs(input.sectionLabels),
    ...buildBodyParagraphs(input.responseText),
  ];
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

export async function downloadVNextReportDocx(
  input: VNextReportDocxInput,
): Promise<void> {
  if (!input.responseText.trim()) {
    throw new Error(VNEXT_REPORT_DOCX_ERROR_MESSAGE);
  }

  const blob = await buildVNextReportDocxBlob(input);
  const fileName = buildVNextReportDocxFileName(
    resolveDisplayName(input),
  );
  resolveSaveAs()(blob, fileName);
}
