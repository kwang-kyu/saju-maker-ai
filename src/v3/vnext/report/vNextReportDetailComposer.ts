/**
 * vNext Report Detail chapter composer.
 *
 * Assembles existing structured facts into 13 Detail composition chapters.
 * Does not calculate saju, judge luck, call Decision/QuestionReader/GPT,
 * invent new facts/crosses, or create new judgement prose.
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
  LifeDriverJudgement,
} from "../../masterReader/types/lifeDriver.js";
import type {
  CapacityJudgementExplanation,
  CapacityResultExplanation,
} from "../../masterReader/readers/capacityExplanationBuilder.js";
import type {
  DestinyAreaExplanation,
  DestinyResultExplanation,
} from "../../masterReader/readers/destinyExplanationBuilder.js";
import type {
  BlessingAreaExplanation,
  BlessingResultExplanation,
} from "../../masterReader/readers/blessingExplanationBuilder.js";
import type {
  CareerJudgementExplanation,
  CareerResultExplanation,
} from "../../masterReader/readers/careerExplanationBuilder.js";
import type {
  MoneyJudgementExplanation,
  MoneyResultExplanation,
} from "../../masterReader/readers/moneyExplanationBuilder.js";
import type {
  RelationshipJudgementExplanation,
  RelationshipResultExplanation,
} from "../../masterReader/readers/relationshipExplanationBuilder.js";
import type {
  HealthJudgementExplanation,
  HealthResultExplanation,
} from "../../masterReader/readers/healthExplanationBuilder.js";
import type {
  TimeState,
} from "../types/timeState.js";
import type {
  SajuCurrentDaeunFact,
  SajuCurrentSeunFact,
  SajuTargetIlunFact,
  SajuYearGanZhiSegmentFact,
} from "../../types/luckFlowFact.js";
import type {
  VNextReportPeriodLuckFlowFacts,
} from "./vNextReportPeriodLuckFlowBuilder.js";

export const VNEXT_REPORT_DETAIL_CHAPTER_DEFS = [
  { id: "ch01", title: "상담 기본 정보" },
  { id: "ch02", title: "인생 구조 심층" },
  { id: "ch03", title: "감당력" },
  { id: "ch04", title: "장기 운명 구조" },
  { id: "ch05", title: "복·지원 통로" },
  { id: "ch06", title: "직업/역할" },
  { id: "ch07", title: "재물" },
  { id: "ch08", title: "관계/연애" },
  { id: "ch09", title: "활력/건강 리듬" },
  { id: "ch10", title: "인생 국면 + 대운" },
  { id: "ch11", title: "올해 세운 + yearSegments" },
  { id: "ch12", title: "오늘 일운 + 관계/재물 병치" },
  { id: "ch13", title: "종합 실행 정리" },
] as const;

export type VNextReportDetailChapterId =
  (typeof VNEXT_REPORT_DETAIL_CHAPTER_DEFS)[number]["id"];

export type VNextReportDetailFactField = {
  key: string;
  value: string | number | boolean;
};

export type VNextReportDetailBodyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "kv"; label: string; value: string }
  | {
    kind: "factObject";
    source: string;
    fields: readonly VNextReportDetailFactField[];
  }
  | {
    kind: "factList";
    source: string;
    items: readonly string[];
  };

export type VNextReportDetailSection = {
  id: string;
  title: string;
  blocks: VNextReportDetailBodyBlock[];
};

export type VNextReportDetailChapter = {
  id: VNextReportDetailChapterId;
  index: number;
  title: string;
  sections: VNextReportDetailSection[];
};

export type VNextReportDetailComposition = {
  displayName: string;
  chapters: VNextReportDetailChapter[];
  usedSources: string[];
  missingSources: string[];
};

export type VNextReportDetailComposerInput = {
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
   * Composer does not call GPT; it only places this text in CH13.
   */
  responseText?: string | null;
};

type DedupeContext = {
  /** Exact texts already used by Summary (section 18). */
  summaryProhibited: Set<string>;
  /** Exact texts already emitted inside Detail composition. */
  globalSeen: Set<string>;
};

const CAPACITY_AREA_KEYS = [
  "responsibility",
  "money",
  "organization",
  "relationship",
  "risk",
  "time",
] as const;

const DESTINY_AREA_KEYS = [
  "lifeDirection",
  "coreLifeTask",
  "strengthFulfillment",
  "growthPath",
  "choiceAlignment",
  "changeIntegration",
  "contributionPattern",
  "longTermCoherence",
] as const;

const BLESSING_AREA_KEYS = [
  "opportunityReception",
  "benefactorConnection",
  "relationshipSupport",
  "resourceSupport",
  "environmentSupport",
  "crisisProtection",
  "blessingRetention",
  "blessingCirculation",
] as const;

const CAREER_AREA_KEYS = [
  "roleOrientation",
  "workStyle",
  "expertiseGrowth",
  "organizationFit",
  "independenceFit",
  "leadershipFit",
  "performanceConversion",
  "careerContinuity",
] as const;

const MONEY_AREA_KEYS = [
  "generation",
  "repeatability",
  "retention",
  "assetConversion",
  "cashflowManagement",
  "debtHandling",
  "volatilityResponse",
  "lossRecovery",
] as const;

const RELATIONSHIP_AREA_KEYS = [
  "connectionExpansion",
  "intimacyMaintenance",
  "emotionalExchange",
  "boundaryMaintenance",
  "conflictAdjustment",
  "trustRecovery",
  "partnershipCooperation",
  "spouseBonding",
] as const;

const HEALTH_AREA_KEYS = [
  "vitalityStability",
  "stressRegulation",
  "fatigueManagement",
  "recoveryCapacity",
  "rhythmMaintenance",
  "overloadTolerance",
  "habitSelfManagement",
  "imbalanceAdaptation",
] as const;

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
  input: VNextReportDetailComposerInput,
): string {
  const fromProfile = input.birthProfile.displayName?.trim();
  if (fromProfile) {
    return fromProfile;
  }

  return "상담자";
}

function addProhibited(
  set: Set<string>,
  value: string | null | undefined,
): void {
  if (!hasText(value)) {
    return;
  }

  set.add(trimText(value));
}

function addProhibitedAll(
  set: Set<string>,
  values: readonly string[] | null | undefined,
): void {
  for (const value of values ?? []) {
    addProhibited(set, value);
  }
}

function addProhibitedKv(
  set: Set<string>,
  label: string,
  value: string | number | boolean | null | undefined,
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

  set.add(`${label}:${rendered}`);
}

/**
 * Exact Summary strings that must not be copied into Detail as-is.
 * Does not strip facts; only blocks exact duplicate presentation text.
 */
function collectSummaryProhibitedTexts(
  input: VNextReportDetailComposerInput,
): Set<string> {
  const prohibited = new Set<string>();
  const identity = input.humanContext?.identity ?? null;
  const humanSummary = identity?.humanSummary ?? null;
  const explanation = identity?.explanation ?? null;

  addProhibited(prohibited, humanSummary?.coreIdentity);
  addProhibited(prohibited, humanSummary?.summary);
  addProhibitedAll(prohibited, humanSummary?.strengths);
  addProhibitedAll(prohibited, humanSummary?.cautions);

  addProhibited(prohibited, explanation?.lifeDriver?.title);
  addProhibited(prohibited, explanation?.lifeDriver?.summary);
  if (hasText(explanation?.lifeDriver?.title)) {
    addProhibited(
      prohibited,
      `제목: ${trimText(explanation.lifeDriver.title)}`,
    );
  }

  const survivalPrimary = explanation?.survivalStyle?.primary ?? null;
  addProhibited(prohibited, survivalPrimary?.title);
  addProhibited(prohibited, survivalPrimary?.summary);
  if (hasText(survivalPrimary?.title)) {
    addProhibited(
      prohibited,
      `제목: ${trimText(survivalPrimary.title)}`,
    );
  }

  const repeatedPrimary = explanation?.repeatedPattern?.primary ?? null;
  addProhibited(prohibited, repeatedPrimary?.title);
  addProhibited(prohibited, repeatedPrimary?.summary);
  if (hasText(repeatedPrimary?.title)) {
    addProhibited(
      prohibited,
      `제목: ${trimText(repeatedPrimary.title)}`,
    );
  }

  const currentPhase = input.humanContext?.currentPhase ?? null;
  addProhibited(prohibited, currentPhase?.title);
  addProhibited(prohibited, currentPhase?.description);

  const daeun = input.timeState?.daeun ?? null;
  addProhibited(prohibited, daeun?.label);
  addProhibited(prohibited, daeun?.summary);

  const targetSeun = input.periodLuckFlowFacts?.year?.targetSeun ?? null;
  if (targetSeun) {
    addProhibitedKv(prohibited, "연도", targetSeun.year);
    addProhibitedKv(prohibited, "나이", targetSeun.age);
    addProhibitedKv(prohibited, "간지", targetSeun.ganZhi);
    addProhibitedKv(prohibited, "십신", targetSeun.tenGod);
    addProhibitedKv(prohibited, "오행", targetSeun.element);
    addProhibitedKv(prohibited, "천간", targetSeun.heavenlyStem);
    addProhibitedKv(prohibited, "지지", targetSeun.earthlyBranch);
  }

  const targetIlun = input.periodLuckFlowFacts?.day?.targetIlun ?? null;
  if (targetIlun) {
    addProhibitedKv(prohibited, "날짜", targetIlun.targetDate);
    addProhibitedKv(prohibited, "간지", targetIlun.ganZhi);
    addProhibitedKv(prohibited, "십신", targetIlun.tenGod);
    addProhibitedKv(prohibited, "오행", targetIlun.element);
    addProhibitedKv(prohibited, "천간", targetIlun.heavenlyStem);
    addProhibitedKv(prohibited, "지지", targetIlun.earthlyBranch);
  }

  addProhibited(prohibited, explanation?.career?.summary);
  addProhibited(prohibited, explanation?.money?.summary);
  addProhibited(prohibited, explanation?.relationship?.summary);

  return prohibited;
}

function isBlockedText(
  text: string,
  ctx: DedupeContext,
): boolean {
  return ctx.summaryProhibited.has(text) || ctx.globalSeen.has(text);
}

function markSeen(text: string, ctx: DedupeContext): void {
  ctx.globalSeen.add(text);
}

function pushHeading(
  blocks: VNextReportDetailBodyBlock[],
  text: string,
): void {
  blocks.push({ kind: "heading", text: trimText(text) });
}

function pushParagraph(
  blocks: VNextReportDetailBodyBlock[],
  text: string | null | undefined,
  ctx: DedupeContext,
): void {
  if (!hasText(text)) {
    return;
  }

  const normalized = trimText(text);
  if (isBlockedText(normalized, ctx)) {
    return;
  }

  markSeen(normalized, ctx);
  blocks.push({ kind: "paragraph", text: normalized });
}

function pushKv(
  blocks: VNextReportDetailBodyBlock[],
  label: string,
  value: string | number | boolean | null | undefined,
  ctx: DedupeContext,
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
  if (isBlockedText(fingerprint, ctx) || isBlockedText(rendered, ctx)) {
    return;
  }

  markSeen(fingerprint, ctx);
  blocks.push({ kind: "kv", label, value: rendered });
}

/**
 * Structured fact payload — preserves source fields even when Summary
 * already rendered the same values as KV text.
 */
function pushFactObject(
  blocks: VNextReportDetailBodyBlock[],
  source: string,
  fields: ReadonlyArray<{
    key: string;
    value: string | number | boolean | null | undefined;
  }>,
): void {
  const normalized: VNextReportDetailFactField[] = [];

  for (const field of fields) {
    if (field.value === null || field.value === undefined) {
      continue;
    }

    if (typeof field.value === "string") {
      const trimmed = trimText(field.value);
      if (!trimmed) {
        continue;
      }

      normalized.push({ key: field.key, value: trimmed });
      continue;
    }

    normalized.push({ key: field.key, value: field.value });
  }

  if (normalized.length === 0) {
    return;
  }

  blocks.push({
    kind: "factObject",
    source,
    fields: normalized,
  });
}

function pushFactList(
  blocks: VNextReportDetailBodyBlock[],
  source: string,
  items: readonly string[] | null | undefined,
  ctx: DedupeContext,
): void {
  const filtered: string[] = [];

  for (const item of nonEmptyStrings(items)) {
    if (isBlockedText(item, ctx)) {
      continue;
    }

    markSeen(item, ctx);
    filtered.push(item);
  }

  if (filtered.length === 0) {
    return;
  }

  blocks.push({
    kind: "factList",
    source,
    items: filtered,
  });
}

function sectionFromBlocks(
  id: string,
  title: string,
  blocks: VNextReportDetailBodyBlock[],
): VNextReportDetailSection | null {
  if (blocks.length === 0) {
    return null;
  }

  return { id, title, blocks };
}

function pushSection(
  sections: VNextReportDetailSection[],
  section: VNextReportDetailSection | null,
): void {
  if (section) {
    sections.push(section);
  }
}

function composeChapter01(
  input: VNextReportDetailComposerInput,
  displayName: string,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const blocks: VNextReportDetailBodyBlock[] = [];
  const birthDate = formatVNextBirthDate(input.birthProfile);
  const birthTimeLabel = findBirthTimeBranchOption(
    input.birthProfile.birthTimeBranch,
  ).label;

  pushKv(blocks, "이름", displayName, ctx);
  pushKv(blocks, "생년월일", birthDate, ctx);
  pushKv(blocks, "출생시간", birthTimeLabel, ctx);
  pushKv(
    blocks,
    "성별",
    resolveGenderLabel(input.birthProfile.gender),
    ctx,
  );
  pushKv(
    blocks,
    "역법",
    resolveCalendarLabel(input.birthProfile.calendarType),
    ctx,
  );

  const sections: VNextReportDetailSection[] = [];
  pushSection(
    sections,
    sectionFromBlocks("identity", "상담 식별 정보", blocks),
  );

  return {
    id: "ch01",
    index: 1,
    title: "상담 기본 정보",
    sections,
  };
}

function composeLifeDriverSecondaryBlocks(
  secondary: LifeDriverJudgement,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];
  const interpretation = secondary.interpretation;

  pushFactObject(blocks, "profile.lifeDriver.secondary", [
    { key: "driver", value: secondary.driver },
    { key: "confidence", value: secondary.confidence },
    { key: "mode", value: interpretation?.mode },
    { key: "operatingStyle", value: interpretation?.operatingStyle },
    {
      key: "strengthExpression",
      value: interpretation?.strengthExpression,
    },
    { key: "riskPattern", value: interpretation?.riskPattern },
  ]);

  pushFactList(
    blocks,
    "profile.lifeDriver.secondary.suitableConditions",
    interpretation?.suitableConditions,
    ctx,
  );
  pushFactList(
    blocks,
    "profile.lifeDriver.secondary.evidence",
    secondary.evidence.map(
      (item) => `[${item.source}] ${item.description}`,
    ),
    ctx,
  );
  pushFactList(
    blocks,
    "profile.lifeDriver.secondary.counterEvidence",
    secondary.counterEvidence.map(
      (item) => `[${item.source}] ${item.description}`,
    ),
    ctx,
  );
  pushFactList(
    blocks,
    "profile.lifeDriver.secondary.exceptionConditions",
    secondary.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter02(
  humanContext: HumanDestinyContext | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];
  const explanation = humanContext?.identity?.explanation ?? null;
  const profile = humanContext?.identity?.profile ?? null;

  const lifeDriver = explanation?.lifeDriver ?? null;
  if (lifeDriver) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    // Primary title/summary intentionally omitted (Summary already used them).
    pushFactList(blocks, "lifeDriver.strengths", lifeDriver.strengths, ctx);
    pushFactList(blocks, "lifeDriver.cautions", lifeDriver.cautions, ctx);
    pushFactList(blocks, "lifeDriver.evidence", lifeDriver.evidence, ctx);

    const secondary = profile?.lifeDriver?.secondary ?? null;
    if (secondary) {
      pushHeading(blocks, "보조 동력 (profile.secondary)");
      blocks.push(...composeLifeDriverSecondaryBlocks(secondary, ctx));
    }

    pushSection(
      sections,
      sectionFromBlocks("lifeDriver", "삶의 동력 심층", blocks),
    );
  }

  const survival = explanation?.survivalStyle ?? null;
  if (survival) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    // Primary title/summary intentionally omitted.
    if (survival.secondary) {
      pushFactObject(blocks, "survivalStyle.secondary", [
        { key: "title", value: survival.secondary.title },
      ]);
      // secondary title may be Summary-prohibited only for primary; still
      // pass via factObject. Narrative summary of secondary is a Fact.
      pushParagraph(blocks, survival.secondary.summary, ctx);
      pushFactList(
        blocks,
        "survivalStyle.secondary.evidence",
        survival.secondary.evidence,
        ctx,
      );
    }

    pushFactList(
      blocks,
      "survivalStyle.crisisBehaviors",
      survival.crisisBehaviors,
      ctx,
    );
    pushFactList(
      blocks,
      "survivalStyle.recoveryMethods",
      survival.recoveryMethods,
      ctx,
    );
    pushFactList(
      blocks,
      "survivalStyle.prohibitedActions",
      survival.prohibitedActions,
      ctx,
    );

    pushSection(
      sections,
      sectionFromBlocks("survivalStyle", "생존 방식 심층", blocks),
    );
  }

  const repeated = explanation?.repeatedPattern ?? null;
  if (repeated) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    if (repeated.secondary) {
      pushFactObject(blocks, "repeatedPattern.secondary", [
        { key: "title", value: repeated.secondary.title },
      ]);
      pushParagraph(blocks, repeated.secondary.summary, ctx);
      pushFactList(
        blocks,
        "repeatedPattern.secondary.evidence",
        repeated.secondary.evidence,
        ctx,
      );
    }

    pushFactList(
      blocks,
      "repeatedPattern.repeatedBehaviors",
      repeated.repeatedBehaviors,
      ctx,
    );
    pushFactList(
      blocks,
      "repeatedPattern.strengths",
      repeated.strengths,
      ctx,
    );
    pushFactList(
      blocks,
      "repeatedPattern.risks",
      repeated.risks,
      ctx,
    );

    pushSection(
      sections,
      sectionFromBlocks("repeatedPattern", "반복 패턴 심층", blocks),
    );
  }

  return {
    id: "ch02",
    index: 2,
    title: "인생 구조 심층",
    sections,
  };
}

function composeCapacityAreaBlocks(
  area: CapacityJudgementExplanation,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];

  // Whitelist only — never read non-existent overload/suitable fields.
  pushFactObject(blocks, `capacity.${area.area}`, [
    { key: "area", value: area.area },
    { key: "title", value: area.title },
    { key: "level", value: area.level },
    { key: "levelLabel", value: area.levelLabel },
    { key: "summary", value: area.summary },
    { key: "manageableScope", value: area.manageableScope },
    { key: "strengthExpression", value: area.strengthExpression },
    { key: "limitationPattern", value: area.limitationPattern },
    { key: "confidence", value: area.confidence },
  ]);

  pushFactList(
    blocks,
    `capacity.${area.area}.overloadConditions`,
    area.overloadConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `capacity.${area.area}.suitableConditions`,
    area.suitableConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `capacity.${area.area}.evidence`,
    area.evidence,
    ctx,
  );
  pushFactList(
    blocks,
    `capacity.${area.area}.counterEvidence`,
    area.counterEvidence,
    ctx,
  );
  pushFactList(
    blocks,
    `capacity.${area.area}.exceptionConditions`,
    area.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter03(
  capacity: CapacityResultExplanation | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];

  if (capacity) {
    for (const key of CAPACITY_AREA_KEYS) {
      const area = capacity[key];
      pushSection(
        sections,
        sectionFromBlocks(
          key,
          area.title || key,
          composeCapacityAreaBlocks(area, ctx),
        ),
      );
    }
  }

  return {
    id: "ch03",
    index: 3,
    title: "감당력",
    sections,
  };
}

function composeDestinyAreaBlocks(
  area: DestinyAreaExplanation,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];

  // Area whitelist only — do not invent strengthExpression/growthConditions.
  pushFactObject(blocks, `destiny.${area.area}`, [
    { key: "area", value: area.area },
    { key: "title", value: area.title },
    { key: "level", value: area.level },
    { key: "levelLabel", value: area.levelLabel },
    { key: "summary", value: area.summary },
    { key: "confidence", value: area.confidence },
  ]);

  pushFactList(
    blocks,
    `destiny.${area.area}.evidence`,
    area.evidence,
    ctx,
  );
  pushFactList(
    blocks,
    `destiny.${area.area}.counterEvidence`,
    area.counterEvidence,
    ctx,
  );
  pushFactList(
    blocks,
    `destiny.${area.area}.exceptionConditions`,
    area.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter04(
  destiny: DestinyResultExplanation | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];

  if (destiny) {
    for (const key of DESTINY_AREA_KEYS) {
      const area = destiny[key];
      pushSection(
        sections,
        sectionFromBlocks(
          key,
          area.title || key,
          composeDestinyAreaBlocks(area, ctx),
        ),
      );
    }

    const resultBlocks: VNextReportDetailBodyBlock[] = [];
    pushFactList(
      resultBlocks,
      "destiny.supportiveConditions",
      destiny.supportiveConditions,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "destiny.cautionConditions",
      destiny.cautionConditions,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "destiny.strengths",
      destiny.strengths,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "destiny.risks",
      destiny.risks,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "destiny.evidence",
      destiny.evidence,
      ctx,
    );

    pushSection(
      sections,
      sectionFromBlocks("result", "운명 결과 정리", resultBlocks),
    );
  }

  return {
    id: "ch04",
    index: 4,
    title: "장기 운명 구조",
    sections,
  };
}

function composeBlessingAreaBlocks(
  area: BlessingAreaExplanation,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];

  pushFactObject(blocks, `blessing.${area.area}`, [
    { key: "area", value: area.area },
    { key: "title", value: area.title },
    { key: "level", value: area.level },
    { key: "levelLabel", value: area.levelLabel },
    { key: "summary", value: area.summary },
    { key: "confidence", value: area.confidence },
  ]);

  pushFactList(
    blocks,
    `blessing.${area.area}.evidence`,
    area.evidence,
    ctx,
  );
  pushFactList(
    blocks,
    `blessing.${area.area}.counterEvidence`,
    area.counterEvidence,
    ctx,
  );
  pushFactList(
    blocks,
    `blessing.${area.area}.exceptionConditions`,
    area.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter05(
  blessing: BlessingResultExplanation | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];

  if (blessing) {
    for (const key of BLESSING_AREA_KEYS) {
      const area = blessing[key];
      pushSection(
        sections,
        sectionFromBlocks(
          key,
          area.title || key,
          composeBlessingAreaBlocks(area, ctx),
        ),
      );
    }

    const resultBlocks: VNextReportDetailBodyBlock[] = [];
    pushFactList(
      resultBlocks,
      "blessing.supportiveConditions",
      blessing.supportiveConditions,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "blessing.cautionConditions",
      blessing.cautionConditions,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "blessing.strengths",
      blessing.strengths,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "blessing.risks",
      blessing.risks,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "blessing.evidence",
      blessing.evidence,
      ctx,
    );

    pushSection(
      sections,
      sectionFromBlocks("result", "복·지원 결과 정리", resultBlocks),
    );
  }

  return {
    id: "ch05",
    index: 5,
    title: "복·지원 통로",
    sections,
  };
}

function composeCareerAreaBlocks(
  area: CareerJudgementExplanation,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];

  pushFactObject(blocks, `career.${area.area}`, [
    { key: "area", value: area.area },
    { key: "title", value: area.title },
    { key: "level", value: area.level },
    { key: "levelLabel", value: area.levelLabel },
    { key: "summary", value: area.summary },
    { key: "strengthExpression", value: area.strengthExpression },
    { key: "limitationPattern", value: area.limitationPattern },
    { key: "confidence", value: area.confidence },
  ]);

  pushFactList(
    blocks,
    `career.${area.area}.suitableConditions`,
    area.suitableConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `career.${area.area}.cautionConditions`,
    area.cautionConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `career.${area.area}.evidence`,
    area.evidence,
    ctx,
  );
  pushFactList(
    blocks,
    `career.${area.area}.counterEvidence`,
    area.counterEvidence,
    ctx,
  );
  pushFactList(
    blocks,
    `career.${area.area}.exceptionConditions`,
    area.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter06(
  career: CareerResultExplanation | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];

  if (career) {
    for (const key of CAREER_AREA_KEYS) {
      const area = career[key];
      pushSection(
        sections,
        sectionFromBlocks(
          key,
          area.title || key,
          composeCareerAreaBlocks(area, ctx),
        ),
      );
    }

    // career.summary excluded (Summary domain summary).
    const methodBlocks: VNextReportDetailBodyBlock[] = [];
    pushFactObject(methodBlocks, "career.method", [
      { key: "workMethod", value: career.workMethod },
      { key: "expertiseGrowthMethod", value: career.expertiseGrowthMethod },
      { key: "organizationMethod", value: career.organizationMethod },
      { key: "independenceMethod", value: career.independenceMethod },
      { key: "leadershipMethod", value: career.leadershipMethod },
      { key: "performanceMethod", value: career.performanceMethod },
      { key: "continuityPattern", value: career.continuityPattern },
      { key: "corePattern", value: career.corePattern },
      { key: "primaryRole", value: career.primaryRole },
    ]);

    pushSection(
      sections,
      sectionFromBlocks("method", "직업 방법 패턴", methodBlocks),
    );
  }

  return {
    id: "ch06",
    index: 6,
    title: "직업/역할",
    sections,
  };
}

function composeMoneyAreaBlocks(
  area: MoneyJudgementExplanation,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];

  pushFactObject(blocks, `money.${area.area}`, [
    { key: "area", value: area.area },
    { key: "title", value: area.title },
    { key: "level", value: area.level },
    { key: "levelLabel", value: area.levelLabel },
    { key: "summary", value: area.summary },
    { key: "strengthExpression", value: area.strengthExpression },
    { key: "limitationPattern", value: area.limitationPattern },
    { key: "confidence", value: area.confidence },
  ]);

  pushFactList(
    blocks,
    `money.${area.area}.suitableConditions`,
    area.suitableConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `money.${area.area}.cautionConditions`,
    area.cautionConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `money.${area.area}.evidence`,
    area.evidence,
    ctx,
  );
  pushFactList(
    blocks,
    `money.${area.area}.counterEvidence`,
    area.counterEvidence,
    ctx,
  );
  pushFactList(
    blocks,
    `money.${area.area}.exceptionConditions`,
    area.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter07(
  money: MoneyResultExplanation | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];

  if (money) {
    for (const key of MONEY_AREA_KEYS) {
      const area = money[key];
      pushSection(
        sections,
        sectionFromBlocks(
          key,
          area.title || key,
          composeMoneyAreaBlocks(area, ctx),
        ),
      );
    }

    // money.summary excluded.
    const methodBlocks: VNextReportDetailBodyBlock[] = [];
    pushFactObject(methodBlocks, "money.method", [
      { key: "generationMethod", value: money.generationMethod },
      { key: "repetitionCondition", value: money.repetitionCondition },
      { key: "accumulationMethod", value: money.accumulationMethod },
      {
        key: "assetConversionMethod",
        value: money.assetConversionMethod,
      },
      { key: "leakagePattern", value: money.leakagePattern },
      { key: "riskControlMethod", value: money.riskControlMethod },
      { key: "corePattern", value: money.corePattern },
    ]);

    pushSection(
      sections,
      sectionFromBlocks("method", "재물 방법 패턴", methodBlocks),
    );
  }

  return {
    id: "ch07",
    index: 7,
    title: "재물",
    sections,
  };
}

function composeRelationshipAreaBlocks(
  area: RelationshipJudgementExplanation,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];

  pushFactObject(blocks, `relationship.${area.area}`, [
    { key: "area", value: area.area },
    { key: "title", value: area.title },
    { key: "level", value: area.level },
    { key: "levelLabel", value: area.levelLabel },
    { key: "summary", value: area.summary },
    { key: "strengthExpression", value: area.strengthExpression },
    { key: "limitationPattern", value: area.limitationPattern },
    { key: "confidence", value: area.confidence },
  ]);

  pushFactList(
    blocks,
    `relationship.${area.area}.suitableConditions`,
    area.suitableConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `relationship.${area.area}.cautionConditions`,
    area.cautionConditions,
    ctx,
  );
  pushFactList(
    blocks,
    `relationship.${area.area}.evidence`,
    area.evidence,
    ctx,
  );
  pushFactList(
    blocks,
    `relationship.${area.area}.counterEvidence`,
    area.counterEvidence,
    ctx,
  );
  pushFactList(
    blocks,
    `relationship.${area.area}.exceptionConditions`,
    area.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter08(
  relationship: RelationshipResultExplanation | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];

  if (relationship) {
    for (const key of RELATIONSHIP_AREA_KEYS) {
      const area = relationship[key];
      pushSection(
        sections,
        sectionFromBlocks(
          key,
          area.title || key,
          composeRelationshipAreaBlocks(area, ctx),
        ),
      );
    }

    // relationship.summary excluded.
    const methodBlocks: VNextReportDetailBodyBlock[] = [];
    pushFactObject(methodBlocks, "relationship.method", [
      { key: "connectionMethod", value: relationship.connectionMethod },
      { key: "intimacyMethod", value: relationship.intimacyMethod },
      {
        key: "emotionalExchangeMethod",
        value: relationship.emotionalExchangeMethod,
      },
      { key: "boundaryMethod", value: relationship.boundaryMethod },
      { key: "conflictMethod", value: relationship.conflictMethod },
      {
        key: "trustRecoveryMethod",
        value: relationship.trustRecoveryMethod,
      },
      { key: "partnershipMethod", value: relationship.partnershipMethod },
      {
        key: "spouseBondingMethod",
        value: relationship.spouseBondingMethod,
      },
      { key: "corePattern", value: relationship.corePattern },
    ]);

    pushSection(
      sections,
      sectionFromBlocks("method", "관계 방법 패턴", methodBlocks),
    );
  }

  return {
    id: "ch08",
    index: 8,
    title: "관계/연애",
    sections,
  };
}

function composeHealthAreaBlocks(
  area: HealthJudgementExplanation,
  ctx: DedupeContext,
): VNextReportDetailBodyBlock[] {
  const blocks: VNextReportDetailBodyBlock[] = [];
  const interpretation = area.interpretation;

  pushFactObject(blocks, `health.${area.area}`, [
    { key: "area", value: area.area },
    { key: "title", value: area.title },
    { key: "level", value: area.level },
    { key: "levelLabel", value: area.levelLabel },
    { key: "summary", value: area.summary },
    { key: "confidence", value: area.confidence },
  ]);

  if (interpretation) {
    pushFactObject(blocks, `health.${area.area}.interpretation`, [
      { key: "corePattern", value: interpretation.corePattern },
      {
        key: "strengthExpression",
        value: interpretation.strengthExpression,
      },
      {
        key: "limitationPattern",
        value: interpretation.limitationPattern,
      },
    ]);
    pushFactList(
      blocks,
      `health.${area.area}.interpretation.supportiveConditions`,
      interpretation.supportiveConditions,
      ctx,
    );
    pushFactList(
      blocks,
      `health.${area.area}.interpretation.cautionConditions`,
      interpretation.cautionConditions,
      ctx,
    );
  }

  pushFactList(
    blocks,
    `health.${area.area}.evidence`,
    area.evidence,
    ctx,
  );
  pushFactList(
    blocks,
    `health.${area.area}.counterEvidence`,
    area.counterEvidence,
    ctx,
  );
  pushFactList(
    blocks,
    `health.${area.area}.exceptionConditions`,
    area.exceptionConditions,
    ctx,
  );

  return blocks;
}

function composeChapter09(
  health: HealthResultExplanation | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];

  if (health) {
    if (hasText(health.disclaimer)) {
      const disclaimerBlocks: VNextReportDetailBodyBlock[] = [];
      pushParagraph(disclaimerBlocks, health.disclaimer, ctx);
      pushSection(
        sections,
        sectionFromBlocks("disclaimer", "건강 안내", disclaimerBlocks),
      );
    }

    for (const key of HEALTH_AREA_KEYS) {
      const area = health[key];
      pushSection(
        sections,
        sectionFromBlocks(
          key,
          area.title || key,
          composeHealthAreaBlocks(area, ctx),
        ),
      );
    }

    const resultBlocks: VNextReportDetailBodyBlock[] = [];
    pushFactList(
      resultBlocks,
      "health.supportiveConditions",
      health.supportiveConditions,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "health.cautionConditions",
      health.cautionConditions,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "health.strengths",
      health.strengths,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "health.risks",
      health.risks,
      ctx,
    );
    pushFactList(
      resultBlocks,
      "health.evidence",
      health.evidence,
      ctx,
    );

    pushSection(
      sections,
      sectionFromBlocks("result", "건강 결과 정리", resultBlocks),
    );
  }

  return {
    id: "ch09",
    index: 9,
    title: "활력/건강 리듬",
    sections,
  };
}

function composeCurrentDaeunFields(
  currentDaeun: SajuCurrentDaeunFact,
): VNextReportDetailFactField[] {
  return [
    { key: "index", value: currentDaeun.index },
    { key: "ganZhi", value: currentDaeun.ganZhi },
    { key: "heavenlyStem", value: currentDaeun.heavenlyStem },
    { key: "earthlyBranch", value: currentDaeun.earthlyBranch },
    { key: "tenGod", value: currentDaeun.tenGod },
    { key: "element", value: currentDaeun.element },
    { key: "startYear", value: currentDaeun.startYear },
    { key: "endYear", value: currentDaeun.endYear },
    { key: "startAge", value: currentDaeun.startAge },
    { key: "endAge", value: currentDaeun.endAge },
  ];
}

function composeChapter10(
  humanContext: HumanDestinyContext | null | undefined,
  timeState: TimeState | null | undefined,
  periodLuckFlowFacts: VNextReportPeriodLuckFlowFacts | null | undefined,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];
  const currentPhase = humanContext?.currentPhase ?? null;

  if (currentPhase) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    // Do not copy Summary title/description/focusAreas/avoidAreas.
    pushFactObject(blocks, "currentPhase", [
      { key: "phase", value: currentPhase.phase },
    ]);

    pushSection(
      sections,
      sectionFromBlocks("currentPhase", "현재 인생 국면", blocks),
    );
  }

  const daeun = timeState?.daeun ?? null;
  if (daeun) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    // label/summary excluded (Summary). Pass facts + period fields only.
    const factFields = Object.entries(daeun.facts ?? {}).map(
      ([key, value]) => ({ key, value }),
    );
    pushFactObject(blocks, "timeState.daeun.facts", factFields);

    pushSection(
      sections,
      sectionFromBlocks("daeun", "대운 facts", blocks),
    );
  }

  const yearDaeun = periodLuckFlowFacts?.year?.currentDaeun ?? null;
  const dayDaeun = periodLuckFlowFacts?.day?.currentDaeun ?? null;

  if (yearDaeun) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    pushFactObject(
      blocks,
      "periodLuckFlowFacts.year.currentDaeun",
      composeCurrentDaeunFields(yearDaeun),
    );
    pushSection(
      sections,
      sectionFromBlocks("yearCurrentDaeun", "연 기준 현재 대운", blocks),
    );
  }

  if (dayDaeun) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    pushFactObject(
      blocks,
      "periodLuckFlowFacts.day.currentDaeun",
      composeCurrentDaeunFields(dayDaeun),
    );
    pushSection(
      sections,
      sectionFromBlocks("dayCurrentDaeun", "일 기준 현재 대운", blocks),
    );
  }

  return {
    id: "ch10",
    index: 10,
    title: "인생 국면 + 대운",
    sections,
  };
}

function composeTargetSeunFields(
  targetSeun: SajuCurrentSeunFact,
): VNextReportDetailFactField[] {
  return [
    { key: "year", value: targetSeun.year },
    { key: "age", value: targetSeun.age },
    { key: "ganZhi", value: targetSeun.ganZhi },
    { key: "heavenlyStem", value: targetSeun.heavenlyStem },
    { key: "earthlyBranch", value: targetSeun.earthlyBranch },
    { key: "tenGod", value: targetSeun.tenGod },
    { key: "element", value: targetSeun.element },
  ];
}

function composeYearSegmentFields(
  segment: SajuYearGanZhiSegmentFact,
  index: number,
): VNextReportDetailFactField[] {
  const fields: Array<{
    key: string;
    value: string | number | boolean | null | undefined;
  }> = [
    { key: "index", value: index },
    { key: "ganZhi", value: segment.ganZhi },
    { key: "heavenlyStem", value: segment.heavenlyStem },
    { key: "earthlyBranch", value: segment.earthlyBranch },
    { key: "tenGod", value: segment.tenGod },
    { key: "element", value: segment.element },
    { key: "startDate", value: segment.startDate },
    { key: "endDate", value: segment.endDate },
    {
      key: "jieQiBoundary.name",
      value: segment.jieQiBoundary?.name,
    },
    {
      key: "jieQiBoundary.date",
      value: segment.jieQiBoundary?.date,
    },
  ];

  return fields
    .filter((field) => {
      if (field.value === null || field.value === undefined) {
        return false;
      }

      if (typeof field.value === "string") {
        return trimText(field.value).length > 0;
      }

      return true;
    })
    .map((field) => ({
      key: field.key,
      value: typeof field.value === "string"
        ? trimText(field.value)
        : field.value as string | number | boolean,
    }));
}

function composeChapter11(
  periodLuckFlowFacts: VNextReportPeriodLuckFlowFacts | null | undefined,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];
  const yearFacts = periodLuckFlowFacts?.year ?? null;

  // Never read wolunSegments. Never calculate monthly luck.
  if (yearFacts?.targetSeun) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    // factObject avoids Summary KV exact-text clones while keeping Facts.
    pushFactObject(
      blocks,
      "periodLuckFlowFacts.year.targetSeun",
      composeTargetSeunFields(yearFacts.targetSeun),
    );
    pushSection(
      sections,
      sectionFromBlocks("targetSeun", "올해 세운", blocks),
    );
  }

  const yearSegments = yearFacts?.yearSegments ?? [];
  if (yearSegments.length > 0) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    yearSegments.forEach((segment, index) => {
      pushFactObject(
        blocks,
        `periodLuckFlowFacts.year.yearSegments[${index}]`,
        composeYearSegmentFields(segment, index),
      );
    });
    pushSection(
      sections,
      sectionFromBlocks("yearSegments", "연간 간지 구간", blocks),
    );
  }

  return {
    id: "ch11",
    index: 11,
    title: "올해 세운 + yearSegments",
    sections,
  };
}

function composeTargetIlunFields(
  targetIlun: SajuTargetIlunFact,
): VNextReportDetailFactField[] {
  return [
    { key: "targetDate", value: targetIlun.targetDate },
    { key: "ganZhi", value: targetIlun.ganZhi },
    { key: "heavenlyStem", value: targetIlun.heavenlyStem },
    { key: "earthlyBranch", value: targetIlun.earthlyBranch },
    { key: "tenGod", value: targetIlun.tenGod },
    { key: "element", value: targetIlun.element },
  ];
}

function composeChapter12(
  periodLuckFlowFacts: VNextReportPeriodLuckFlowFacts | null | undefined,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];
  const targetIlun = periodLuckFlowFacts?.day?.targetIlun ?? null;

  // No cross type. Keep targetIlun only; CH07/CH08 already own method detail.
  if (targetIlun) {
    const blocks: VNextReportDetailBodyBlock[] = [];
    pushFactObject(
      blocks,
      "periodLuckFlowFacts.day.targetIlun",
      composeTargetIlunFields(targetIlun),
    );
    pushSection(
      sections,
      sectionFromBlocks("targetIlun", "오늘 일운", blocks),
    );
  }

  return {
    id: "ch12",
    index: 12,
    title: "오늘 일운 + 관계/재물 병치",
    sections,
  };
}

function composeChapter13(
  humanContext: HumanDestinyContext | null | undefined,
  responseText: string | null | undefined,
  ctx: DedupeContext,
): VNextReportDetailChapter {
  const sections: VNextReportDetailSection[] = [];
  const explanation = humanContext?.identity?.explanation ?? null;

  const strengthBlocks: VNextReportDetailBodyBlock[] = [];
  pushFactList(
    strengthBlocks,
    "integratedStrengths",
    explanation?.integratedStrengths,
    ctx,
  );
  pushSection(
    sections,
    sectionFromBlocks("integratedStrengths", "통합 강점", strengthBlocks),
  );

  const riskBlocks: VNextReportDetailBodyBlock[] = [];
  pushFactList(
    riskBlocks,
    "integratedRisks",
    explanation?.integratedRisks,
    ctx,
  );
  pushSection(
    sections,
    sectionFromBlocks("integratedRisks", "통합 주의", riskBlocks),
  );

  if (hasText(responseText)) {
    const narrationBlocks: VNextReportDetailBodyBlock[] = [];
    const lines = responseText
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      // Exact overlap with earlier Detail chapters / Summary prohibited
      // text is skipped; remaining narration is passed as Fact explanation.
      pushParagraph(narrationBlocks, line, ctx);
    }

    pushSection(
      sections,
      sectionFromBlocks(
        "responseText",
        "종합 설명 (기존 narration)",
        narrationBlocks,
      ),
    );
  }

  return {
    id: "ch13",
    index: 13,
    title: "종합 실행 정리",
    sections,
  };
}

function collectSourceStatus(
  input: VNextReportDetailComposerInput,
): {
  usedSources: string[];
  missingSources: string[];
} {
  const usedSources: string[] = ["birthProfile"];
  const missingSources: string[] = [];
  const explanation = input.humanContext?.identity?.explanation ?? null;
  const profile = input.humanContext?.identity?.profile ?? null;

  if (explanation?.lifeDriver || explanation?.survivalStyle) {
    usedSources.push("explanation.lifeDriver/survival/repeated");
  } else {
    missingSources.push("explanation.lifeDriver/survival/repeated");
  }

  if (profile?.lifeDriver?.secondary) {
    usedSources.push("profile.lifeDriver.secondary");
  } else {
    missingSources.push("profile.lifeDriver.secondary");
  }

  if (explanation?.capacity) {
    usedSources.push("explanation.capacity");
  } else {
    missingSources.push("explanation.capacity");
  }

  if (explanation?.destiny) {
    usedSources.push("explanation.destiny");
  } else {
    missingSources.push("explanation.destiny");
  }

  if (explanation?.blessing) {
    usedSources.push("explanation.blessing");
  } else {
    missingSources.push("explanation.blessing");
  }

  if (explanation?.career) {
    usedSources.push("explanation.career");
  } else {
    missingSources.push("explanation.career");
  }

  if (explanation?.money) {
    usedSources.push("explanation.money");
  } else {
    missingSources.push("explanation.money");
  }

  if (explanation?.relationship) {
    usedSources.push("explanation.relationship");
  } else {
    missingSources.push("explanation.relationship");
  }

  if (explanation?.health) {
    usedSources.push("explanation.health");
  } else {
    missingSources.push("explanation.health");
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

  if ((input.periodLuckFlowFacts?.year?.yearSegments?.length ?? 0) > 0) {
    usedSources.push("periodLuckFlowFacts.year.yearSegments");
  } else {
    missingSources.push("periodLuckFlowFacts.year.yearSegments");
  }

  if (input.periodLuckFlowFacts?.day?.targetIlun) {
    usedSources.push("periodLuckFlowFacts.day.targetIlun");
  } else {
    missingSources.push("periodLuckFlowFacts.day.targetIlun");
  }

  if (
    nonEmptyStrings(explanation?.integratedStrengths).length > 0
    || nonEmptyStrings(explanation?.integratedRisks).length > 0
  ) {
    usedSources.push("integratedStrengths/Risks");
  } else {
    missingSources.push("integratedStrengths/Risks");
  }

  if (hasText(input.responseText)) {
    usedSources.push("responseText");
  } else {
    missingSources.push("responseText");
  }

  return { usedSources, missingSources };
}

/**
 * Compose Detail report chapter data from existing Report facts.
 */
export function composeVNextReportDetail(
  input: VNextReportDetailComposerInput,
): VNextReportDetailComposition {
  const displayName = resolveDisplayName(input);
  const ctx: DedupeContext = {
    summaryProhibited: collectSummaryProhibitedTexts(input),
    globalSeen: new Set<string>(),
  };

  const explanation = input.humanContext?.identity?.explanation ?? null;

  const chapters: VNextReportDetailChapter[] = [
    composeChapter01(input, displayName, ctx),
    composeChapter02(input.humanContext, ctx),
    composeChapter03(explanation?.capacity, ctx),
    composeChapter04(explanation?.destiny, ctx),
    composeChapter05(explanation?.blessing, ctx),
    composeChapter06(explanation?.career, ctx),
    composeChapter07(explanation?.money, ctx),
    composeChapter08(explanation?.relationship, ctx),
    composeChapter09(explanation?.health, ctx),
    composeChapter10(
      input.humanContext,
      input.timeState,
      input.periodLuckFlowFacts,
    ),
    composeChapter11(input.periodLuckFlowFacts),
    composeChapter12(input.periodLuckFlowFacts),
    composeChapter13(input.humanContext, input.responseText, ctx),
  ];

  const { usedSources, missingSources } = collectSourceStatus(input);

  return {
    displayName,
    chapters,
    usedSources,
    missingSources,
  };
}

export function listEmptyVNextReportDetailChapters(
  composition: VNextReportDetailComposition,
): string[] {
  return composition.chapters
    .filter((chapter) => {
      const blockCount = chapter.sections.reduce(
        (sum, section) => sum + section.blocks.length,
        0,
      );
      return blockCount === 0;
    })
    .map((chapter) => `${chapter.index}.${chapter.title}`);
}

export function countVNextReportDetailAreaSections(
  composition: VNextReportDetailComposition,
  chapterId: VNextReportDetailChapterId,
  areaKeys: readonly string[],
): number {
  const chapter = composition.chapters.find((item) => item.id === chapterId);
  if (!chapter) {
    return 0;
  }

  const areaKeySet = new Set(areaKeys);
  return chapter.sections.filter((section) => areaKeySet.has(section.id))
    .length;
}

export function compositionContainsSourceToken(
  composition: VNextReportDetailComposition,
  token: string,
): boolean {
  const json = JSON.stringify(composition);
  return json.includes(token);
}

export function findDetailSummaryProhibitedClones(
  composition: VNextReportDetailComposition,
  input: VNextReportDetailComposerInput,
): string[] {
  const prohibited = collectSummaryProhibitedTexts(input);
  const clones: string[] = [];

  for (const chapter of composition.chapters) {
    for (const section of chapter.sections) {
      for (const block of section.blocks) {
        if (block.kind === "heading" || block.kind === "factObject") {
          // factObject preserves Facts without Summary KV fingerprint clones.
          continue;
        }

        if (block.kind === "factList") {
          for (const item of block.items) {
            if (prohibited.has(item)) {
              clones.push(`[${chapter.id}/${section.id}] ${item}`);
            }
          }
          continue;
        }

        if (block.kind === "kv") {
          const fingerprint = `${block.label}:${block.value}`;
          if (prohibited.has(fingerprint) || prohibited.has(block.value)) {
            clones.push(`[${chapter.id}/${section.id}] ${fingerprint}`);
          }
          continue;
        }

        if (prohibited.has(block.text)) {
          clones.push(`[${chapter.id}/${section.id}] ${block.text}`);
        }
      }
    }
  }

  return clones;
}

export {
  CAPACITY_AREA_KEYS,
  DESTINY_AREA_KEYS,
  BLESSING_AREA_KEYS,
  CAREER_AREA_KEYS,
  MONEY_AREA_KEYS,
  RELATIONSHIP_AREA_KEYS,
  HEALTH_AREA_KEYS,
};
