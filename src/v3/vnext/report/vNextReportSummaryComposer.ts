/**
 * vNext Report Summary chapter composer.
 *
 * Assembles existing structured facts into Summary DOCX chapters.
 * Does not calculate saju, judge luck, call Decision/QuestionReader/GPT.
 */

import {
  findBirthTimeBranchOption,
  formatVNextBirthDate,
  type VNextBirthProfile,
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

export const VNEXT_REPORT_SUMMARY_CHAPTER_DEFS = [
  { id: "basicInfo", title: "상담 기본 정보" },
  { id: "coreIdentity", title: "핵심 정체성" },
  { id: "basicStructure", title: "기본 구조" },
  { id: "strengthsCautions", title: "강점·주의" },
  { id: "currentPhase", title: "현재 인생 국면" },
  { id: "currentDaeun", title: "현재 대운 요약" },
  { id: "yearFlow", title: "올해 흐름 핵심" },
  { id: "dayFlow", title: "오늘 흐름 핵심" },
  { id: "domainSummary", title: "핵심 영역 요약" },
  { id: "integration", title: "종합 정리" },
] as const;

export type VNextReportSummaryChapterId =
  (typeof VNEXT_REPORT_SUMMARY_CHAPTER_DEFS)[number]["id"];

export type VNextReportSummaryBodyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "kv"; label: string; value: string };

export type VNextReportSummaryChapter = {
  id: VNextReportSummaryChapterId;
  index: number;
  title: string;
  blocks: VNextReportSummaryBodyBlock[];
};

export type VNextReportSummaryComposition = {
  displayName: string;
  coverSubtitle: string;
  basicInfoLines: string[];
  tocTitles: readonly string[];
  chapters: VNextReportSummaryChapter[];
  closingLines: string[];
  usedSources: string[];
  missingSources: string[];
};

export type VNextReportSummaryComposerInput = {
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
  humanContext?: HumanDestinyContext | null;
  timeState?: TimeState | null;
  periodLuckFlowFacts?: VNextReportPeriodLuckFlowFacts | null;
  /**
   * Existing Report GPT narration (responseText).
   * Composer does not call GPT; it only places this text in Chapter 10.
   */
  gptNarration?: string | null;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function trimText(value: string): string {
  return value.trim();
}

function nonEmptyStrings(
  values: readonly string[] | null | undefined,
): string[] {
  if (!values || values.length === 0) {
    return [];
  }

  return values.filter((value) => hasText(value)).map(trimText);
}

function resolveGenderLabel(
  gender: VNextBirthProfile["gender"],
): string {
  return gender === "male" ? "남성" : "여성";
}

function resolveCalendarLabel(
  calendarType: VNextBirthProfile["calendarType"],
): string {
  return calendarType === "solar" ? "양력" : "음력";
}

function resolveDisplayName(
  input: VNextReportSummaryComposerInput,
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

function pushParagraph(
  blocks: VNextReportSummaryBodyBlock[],
  text: string | null | undefined,
  seen: Set<string>,
): void {
  if (!hasText(text)) {
    return;
  }

  const normalized = trimText(text);
  if (seen.has(normalized)) {
    return;
  }

  seen.add(normalized);
  blocks.push({ kind: "paragraph", text: normalized });
}

function pushHeading(
  blocks: VNextReportSummaryBodyBlock[],
  text: string,
): void {
  blocks.push({ kind: "heading", text: trimText(text) });
}

function pushBullets(
  blocks: VNextReportSummaryBodyBlock[],
  values: readonly string[],
  seen: Set<string>,
): void {
  for (const value of values) {
    const normalized = trimText(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    blocks.push({ kind: "bullet", text: normalized });
  }
}

function pushKv(
  blocks: VNextReportSummaryBodyBlock[],
  label: string,
  value: string | number | boolean | null | undefined,
  seen: Set<string>,
): void {
  if (value === null || value === undefined) {
    return;
  }

  const rendered = typeof value === "string"
    ? trimText(value)
    : String(value);

  if (!rendered) {
    return;
  }

  const fingerprint = `${label}:${rendered}`;
  if (seen.has(fingerprint)) {
    return;
  }

  seen.add(fingerprint);
  blocks.push({ kind: "kv", label, value: rendered });
}

function formatFactLabel(key: string): string {
  const labels: Record<string, string> = {
    ganZhi: "간지",
    heavenlyStem: "천간",
    earthlyBranch: "지지",
    tenGod: "십신",
    element: "오행",
    startYear: "시작 연도",
    endYear: "종료 연도",
    startAge: "시작 나이",
    endAge: "종료 나이",
    year: "연도",
    age: "나이",
    targetDate: "날짜",
  };

  return labels[key] ?? key;
}

function composeChapter1(
  input: VNextReportSummaryComposerInput,
  displayName: string,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const birthDate = formatVNextBirthDate(input.birthProfile);
  const birthTimeLabel = findBirthTimeBranchOption(
    input.birthProfile.birthTimeBranch,
  ).label;

  pushKv(blocks, "이름", displayName, seen);
  pushKv(blocks, "생년월일", birthDate, seen);
  pushKv(blocks, "출생시간", birthTimeLabel, seen);
  pushKv(
    blocks,
    "성별",
    resolveGenderLabel(input.birthProfile.gender),
    seen,
  );
  pushKv(
    blocks,
    "역법",
    resolveCalendarLabel(input.birthProfile.calendarType),
    seen,
  );

  return {
    id: "basicInfo",
    index: 1,
    title: "상담 기본 정보",
    blocks,
  };
}

function composeChapter2(
  humanContext: HumanDestinyContext | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const humanSummary = humanContext?.identity?.humanSummary ?? null;

  if (hasText(humanSummary?.title)) {
    pushHeading(blocks, trimText(humanSummary.title));
  }

  pushParagraph(blocks, humanSummary?.coreIdentity, seen);
  pushParagraph(blocks, humanSummary?.summary, seen);

  return {
    id: "coreIdentity",
    index: 2,
    title: "핵심 정체성",
    blocks,
  };
}

function composeChapter3(
  humanContext: HumanDestinyContext | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const explanation = humanContext?.identity?.explanation ?? null;
  const lifeDriver = explanation?.lifeDriver ?? null;
  const survivalPrimary = explanation?.survivalStyle?.primary ?? null;
  const repeatedPrimary = explanation?.repeatedPattern?.primary ?? null;

  if (lifeDriver && (hasText(lifeDriver.title) || hasText(lifeDriver.summary))) {
    pushHeading(blocks, "삶의 동력");
    if (hasText(lifeDriver.title)) {
      pushParagraph(blocks, `제목: ${trimText(lifeDriver.title)}`, seen);
    }
    pushParagraph(blocks, lifeDriver.summary, seen);
  }

  if (
    survivalPrimary
    && (hasText(survivalPrimary.title) || hasText(survivalPrimary.summary))
  ) {
    pushHeading(blocks, "생존 방식");
    if (hasText(survivalPrimary.title)) {
      pushParagraph(blocks, `제목: ${trimText(survivalPrimary.title)}`, seen);
    }
    pushParagraph(blocks, survivalPrimary.summary, seen);
  }

  if (
    repeatedPrimary
    && (hasText(repeatedPrimary.title) || hasText(repeatedPrimary.summary))
  ) {
    pushHeading(blocks, "반복 패턴");
    if (hasText(repeatedPrimary.title)) {
      pushParagraph(blocks, `제목: ${trimText(repeatedPrimary.title)}`, seen);
    }
    pushParagraph(blocks, repeatedPrimary.summary, seen);
  }

  return {
    id: "basicStructure",
    index: 3,
    title: "기본 구조",
    blocks,
  };
}

function composeChapter4(
  humanContext: HumanDestinyContext | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const humanSummary = humanContext?.identity?.humanSummary ?? null;
  const strengths = nonEmptyStrings(humanSummary?.strengths);
  const cautions = nonEmptyStrings(humanSummary?.cautions);

  if (strengths.length > 0) {
    pushHeading(blocks, "강점");
    pushBullets(blocks, strengths, seen);
  }

  if (cautions.length > 0) {
    pushHeading(blocks, "주의");
    pushBullets(blocks, cautions, seen);
  }

  return {
    id: "strengthsCautions",
    index: 4,
    title: "강점·주의",
    blocks,
  };
}

function composeChapter5(
  humanContext: HumanDestinyContext | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const currentPhase = humanContext?.currentPhase ?? null;

  if (currentPhase) {
    if (hasText(currentPhase.phase)) {
      pushKv(blocks, "국면", trimText(currentPhase.phase), seen);
    }

    if (hasText(currentPhase.title)) {
      pushParagraph(blocks, currentPhase.title, seen);
    }

    pushParagraph(blocks, currentPhase.description, seen);

    const focusAreas = nonEmptyStrings(currentPhase.focusAreas);
    if (focusAreas.length > 0) {
      pushHeading(blocks, "집중");
      pushBullets(blocks, focusAreas, seen);
    }

    const avoidAreas = nonEmptyStrings(currentPhase.avoidAreas);
    if (avoidAreas.length > 0) {
      pushHeading(blocks, "피할 점");
      pushBullets(blocks, avoidAreas, seen);
    }
  }

  return {
    id: "currentPhase",
    index: 5,
    title: "현재 인생 국면",
    blocks,
  };
}

function composeChapter6(
  timeState: TimeState | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const daeun = timeState?.daeun ?? null;

  if (daeun) {
    if (hasText(daeun.label)) {
      pushParagraph(blocks, daeun.label, seen);
    }

    pushParagraph(blocks, daeun.summary, seen);

    const facts = daeun.facts ?? {};
    for (const [key, value] of Object.entries(facts)) {
      pushKv(blocks, formatFactLabel(key), value, seen);
    }
  }

  return {
    id: "currentDaeun",
    index: 6,
    title: "현재 대운 요약",
    blocks,
  };
}

function composeChapter7(
  periodLuckFlowFacts: VNextReportPeriodLuckFlowFacts | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const targetSeun = periodLuckFlowFacts?.year?.targetSeun ?? null;

  if (targetSeun) {
    if (typeof targetSeun.year === "number" && Number.isFinite(targetSeun.year)) {
      pushKv(blocks, "연도", targetSeun.year, seen);
    }

    if (typeof targetSeun.age === "number" && Number.isFinite(targetSeun.age)) {
      pushKv(blocks, "나이", targetSeun.age, seen);
    }

    pushKv(blocks, "간지", targetSeun.ganZhi, seen);
    pushKv(blocks, "십신", targetSeun.tenGod, seen);
    pushKv(blocks, "오행", targetSeun.element, seen);

    if (hasText(targetSeun.heavenlyStem)) {
      pushKv(blocks, "천간", targetSeun.heavenlyStem, seen);
    }

    if (hasText(targetSeun.earthlyBranch)) {
      pushKv(blocks, "지지", targetSeun.earthlyBranch, seen);
    }
  }

  return {
    id: "yearFlow",
    index: 7,
    title: "올해 흐름 핵심",
    blocks,
  };
}

function composeChapter8(
  periodLuckFlowFacts: VNextReportPeriodLuckFlowFacts | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const targetIlun = periodLuckFlowFacts?.day?.targetIlun ?? null;

  if (targetIlun) {
    pushKv(blocks, "날짜", targetIlun.targetDate, seen);
    pushKv(blocks, "간지", targetIlun.ganZhi, seen);
    pushKv(blocks, "십신", targetIlun.tenGod, seen);
    pushKv(blocks, "오행", targetIlun.element, seen);

    if (hasText(targetIlun.heavenlyStem)) {
      pushKv(blocks, "천간", targetIlun.heavenlyStem, seen);
    }

    if (hasText(targetIlun.earthlyBranch)) {
      pushKv(blocks, "지지", targetIlun.earthlyBranch, seen);
    }
  }

  return {
    id: "dayFlow",
    index: 8,
    title: "오늘 흐름 핵심",
    blocks,
  };
}

function composeChapter9(
  humanContext: HumanDestinyContext | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const explanation = humanContext?.identity?.explanation ?? null;

  const domains: Array<{
    key: string;
    label: string;
    title?: string | null;
    summary?: string | null;
  }> = [
    {
      key: "career",
      label: "직업",
      title: explanation?.career?.title,
      summary: explanation?.career?.summary,
    },
    {
      key: "money",
      label: "재물",
      title: explanation?.money?.title,
      summary: explanation?.money?.summary,
    },
    {
      key: "relationship",
      label: "관계",
      title: explanation?.relationship?.title,
      summary: explanation?.relationship?.summary,
    },
  ];

  for (const domain of domains) {
    if (!hasText(domain.summary) && !hasText(domain.title)) {
      continue;
    }

    pushHeading(blocks, domain.label);
    if (hasText(domain.title)) {
      pushParagraph(blocks, domain.title, seen);
    }
    pushParagraph(blocks, domain.summary, seen);
  }

  return {
    id: "domainSummary",
    index: 9,
    title: "핵심 영역 요약",
    blocks,
  };
}

function composeChapter10(
  humanContext: HumanDestinyContext | null | undefined,
  gptNarration: string | null | undefined,
  seen: Set<string>,
): VNextReportSummaryChapter {
  const blocks: VNextReportSummaryBodyBlock[] = [];
  const explanation = humanContext?.identity?.explanation ?? null;
  const strengths = nonEmptyStrings(explanation?.integratedStrengths);
  const risks = nonEmptyStrings(explanation?.integratedRisks);

  if (strengths.length > 0) {
    pushHeading(blocks, "통합 강점");
    pushBullets(blocks, strengths, seen);
  }

  if (risks.length > 0) {
    pushHeading(blocks, "통합 주의");
    pushBullets(blocks, risks, seen);
  }

  if (hasText(gptNarration)) {
    pushHeading(blocks, "종합 설명");
    const lines = gptNarration
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      pushParagraph(blocks, line, seen);
    }
  }

  return {
    id: "integration",
    index: 10,
    title: "종합 정리",
    blocks,
  };
}

function collectSourceStatus(
  input: VNextReportSummaryComposerInput,
): {
  usedSources: string[];
  missingSources: string[];
} {
  const usedSources: string[] = ["birthProfile"];
  const missingSources: string[] = [];

  const identity = input.humanContext?.identity ?? null;
  const humanSummary = identity?.humanSummary ?? null;
  const explanation = identity?.explanation ?? null;

  if (hasText(humanSummary?.coreIdentity) || hasText(humanSummary?.summary)) {
    usedSources.push("humanSummary.coreIdentity");
  } else {
    missingSources.push("humanSummary.coreIdentity");
  }

  if (explanation?.lifeDriver || explanation?.survivalStyle?.primary) {
    usedSources.push("explanation.lifeDriver/survival/repeated");
  } else {
    missingSources.push("explanation.lifeDriver/survival/repeated");
  }

  if (
    nonEmptyStrings(humanSummary?.strengths).length > 0
    || nonEmptyStrings(humanSummary?.cautions).length > 0
  ) {
    usedSources.push("humanSummary.strengths/cautions");
  } else {
    missingSources.push("humanSummary.strengths/cautions");
  }

  if (input.humanContext?.currentPhase) {
    usedSources.push("currentPhase");
  } else {
    missingSources.push("currentPhase");
  }

  if (input.timeState?.daeun) {
    usedSources.push("timeState.daeun");
  } else {
    missingSources.push("timeState.daeun");
  }

  if (input.periodLuckFlowFacts?.year?.targetSeun) {
    usedSources.push("periodLuckFlowFacts.year.targetSeun");
  } else {
    missingSources.push("periodLuckFlowFacts.year.targetSeun");
  }

  if (input.periodLuckFlowFacts?.day?.targetIlun) {
    usedSources.push("periodLuckFlowFacts.day.targetIlun");
  } else {
    missingSources.push("periodLuckFlowFacts.day.targetIlun");
  }

  if (
    hasText(explanation?.career?.summary)
    || hasText(explanation?.money?.summary)
    || hasText(explanation?.relationship?.summary)
  ) {
    usedSources.push("explanation.career/money/relationship.summary");
  } else {
    missingSources.push("explanation.career/money/relationship.summary");
  }

  if (
    nonEmptyStrings(explanation?.integratedStrengths).length > 0
    || nonEmptyStrings(explanation?.integratedRisks).length > 0
  ) {
    usedSources.push("integratedStrengths/Risks");
  } else {
    missingSources.push("integratedStrengths/Risks");
  }

  if (hasText(input.gptNarration)) {
    usedSources.push("GPT narration (responseText)");
  } else {
    missingSources.push("GPT narration (responseText)");
  }

  return { usedSources, missingSources };
}

/**
 * Compose Summary DOCX chapter data from existing Report facts.
 */
export function composeVNextReportSummary(
  input: VNextReportSummaryComposerInput,
): VNextReportSummaryComposition {
  const displayName = resolveDisplayName(input);
  const globalSeen = new Set<string>();

  const chapters = [
    composeChapter1(input, displayName, new Set(globalSeen)),
    composeChapter2(input.humanContext, new Set(globalSeen)),
    composeChapter3(input.humanContext, new Set(globalSeen)),
    composeChapter4(input.humanContext, new Set(globalSeen)),
    composeChapter5(input.humanContext, new Set(globalSeen)),
    composeChapter6(input.timeState, new Set(globalSeen)),
    composeChapter7(input.periodLuckFlowFacts, new Set(globalSeen)),
    composeChapter8(input.periodLuckFlowFacts, new Set(globalSeen)),
    composeChapter9(input.humanContext, new Set(globalSeen)),
    composeChapter10(
      input.humanContext,
      input.gptNarration,
      new Set(globalSeen),
    ),
  ];

  // Cross-chapter exact-text de-duplication (later chapters skip earlier text).
  const emitted = new Set<string>();
  const dedupedChapters = chapters.map((chapter) => {
    const blocks: VNextReportSummaryBodyBlock[] = [];

    for (const block of chapter.blocks) {
      if (block.kind === "heading") {
        blocks.push(block);
        continue;
      }

      const fingerprint = block.kind === "kv"
        ? `${block.label}:${block.value}`
        : block.text;

      if (emitted.has(fingerprint)) {
        continue;
      }

      emitted.add(fingerprint);
      blocks.push(block);
    }

    return {
      ...chapter,
      blocks,
    };
  });

  const birthDate = formatVNextBirthDate(input.birthProfile);
  const birthTimeLabel = findBirthTimeBranchOption(
    input.birthProfile.birthTimeBranch,
  ).label;

  const { usedSources, missingSources } = collectSourceStatus(input);

  return {
    displayName,
    coverSubtitle: `${displayName}님을 위한 사주 요약 리포트`,
    basicInfoLines: [
      `이름: ${displayName}`,
      `생년월일: ${birthDate}`,
      `출생시간: ${birthTimeLabel}`,
      `성별: ${resolveGenderLabel(input.birthProfile.gender)}`,
      `역법: ${resolveCalendarLabel(input.birthProfile.calendarType)}`,
    ],
    tocTitles: VNEXT_REPORT_SUMMARY_CHAPTER_DEFS.map(
      (item, index) => `${index + 1}. ${item.title}`,
    ),
    chapters: dedupedChapters,
    closingLines: [
      `이상으로 ${displayName}님의 사주 요약 리포트를 마칩니다.`,
      "본 문서는 이미 확정된 분석 사실을 바탕으로 구성되었으며, 문서 작성 과정에서 새로운 사주 판단을 하지 않습니다.",
    ],
    usedSources,
    missingSources,
  };
}

export function countVNextReportSummaryBlocks(
  composition: VNextReportSummaryComposition,
): number {
  return composition.chapters.reduce(
    (sum, chapter) => sum + chapter.blocks.length,
    0,
  );
}

export function listEmptyVNextReportSummaryChapters(
  composition: VNextReportSummaryComposition,
): string[] {
  return composition.chapters
    .filter((chapter) => chapter.blocks.length === 0)
    .map((chapter) => `${chapter.index}.${chapter.title}`);
}
