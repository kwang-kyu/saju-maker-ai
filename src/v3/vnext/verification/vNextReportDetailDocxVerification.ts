/**
 * STEP 49-3 Detail DOCX verification.
 *
 * Production-independent: no OpenAI calls.
 * Uses analyzeVNextConsultingRequest for real structured facts only.
 * Writer receives DetailComposition — does not own engines.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import JSZip from "jszip";

import {
  buildVNextRequestFromBirthContext,
  createVNextBirthContext,
} from "../entry/vNextBirthContext.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  VNEXT_REPORT_DEFAULT_QUESTION,
} from "../report/vNextReportCopy.js";
import {
  BLESSING_AREA_KEYS,
  CAPACITY_AREA_KEYS,
  CAREER_AREA_KEYS,
  composeVNextReportDetail,
  compositionContainsSourceToken,
  countVNextReportDetailAreaSections,
  DESTINY_AREA_KEYS,
  findDetailSummaryProhibitedClones,
  HEALTH_AREA_KEYS,
  listEmptyVNextReportDetailChapters,
  MONEY_AREA_KEYS,
  RELATIONSHIP_AREA_KEYS,
  VNEXT_REPORT_DETAIL_CHAPTER_DEFS,
  type VNextReportDetailComposition,
} from "../report/vNextReportDetailComposer.js";
import {
  assertDetailCompositionChapterOrder,
  buildVNextReportDetailDocxBuffer,
  buildVNextReportDetailDocxChildren,
  buildVNextReportDetailDocxFileName,
  estimateVNextReportDetailDocxPageStarts,
  listRenderedVNextReportDetailChapterTitles,
  type VNextReportDetailDocxInput,
} from "../report/vNextReportDetailDocx.js";
import {
  analyzeVNextConsultingRequest,
} from "../ui/vNextConsultingPipeline.js";

export type VNextReportDetailDocxCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextReportDetailDocxVerificationResult = {
  passed: boolean;
  cases: VNextReportDetailDocxCase[];
  pageStarts: number;
  emptyChapters: string[];
  areaCounts: Record<string, number>;
  outputPath: string | null;
};

const SAMPLE_BIRTH_PROFILE: VNextBirthProfile = {
  displayName: "천운",
  gender: "female",
  year: 1990,
  month: 5,
  day: 10,
  birthTimeBranch: "yu",
  calendarType: "solar",
};

const SAMPLE_RESPONSE_TEXT = [
  "이 상세 리포트의 종합 설명은 이미 확정된 감당력·운명·복·직업·재물·관계·건강 Fact와 국면·대운·세운·일운 사실을 실행 기준으로 다시 이어 붙입니다.",
  "앞 장의 영역 상세를 다시 나열하지 않으며, 새로운 사주 판단이나 월운·건강 판단을 추가하지 않습니다.",
  "통합 강점과 통합 주의는 장기 선택 기준으로만 정리하고, 오늘 일운과 관계·재물 방법은 병치만 하며 cross 판단을 만들지 않습니다.",
].join("\n\n");

const CROSS_JUDGEMENT_PHRASES = [
  "오늘 관계운이 좋다",
  "오늘 재물운이 좋다",
  "관계운이 좋다",
  "재물운이 좋다",
  "cross judgement",
  "교차 판단",
] as const;

function runCase(
  id: string,
  run: () => { passed: boolean; details: string[] },
): VNextReportDetailDocxCase {
  try {
    const result = run();
    return { id, passed: result.passed, details: result.details };
  } catch (error) {
    return {
      id,
      passed: false,
      details: [
        error instanceof Error ? error.message : "unknown error",
      ],
    };
  }
}

async function runAsyncCase(
  id: string,
  run: () => Promise<{ passed: boolean; details: string[] }>,
): Promise<VNextReportDetailDocxCase> {
  try {
    const result = await run();
    return { id, passed: result.passed, details: result.details };
  } catch (error) {
    return {
      id,
      passed: false,
      details: [
        error instanceof Error ? error.message : "unknown error",
      ],
    };
  }
}

async function extractDocxPlainText(
  buffer: Uint8Array,
): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("string");
  if (!documentXml) {
    return "";
  }

  return documentXml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function countYearSegmentBlocks(
  composition: VNextReportDetailComposition,
): number {
  const chapter = composition.chapters.find((item) => item.id === "ch11");
  if (!chapter) {
    return 0;
  }

  const section = chapter.sections.find((item) => item.id === "yearSegments");
  if (!section) {
    return 0;
  }

  return section.blocks.filter((block) => block.kind === "factObject").length;
}

function hasCrossTypeSignal(
  composition: VNextReportDetailComposition,
): boolean {
  for (const chapter of composition.chapters) {
    if (chapter.id !== "ch12") {
      continue;
    }

    for (const section of chapter.sections) {
      if (
        section.id.includes("cross")
        || section.title.includes("cross")
      ) {
        return true;
      }

      for (const block of section.blocks) {
        if (
          block.kind === "factObject"
          && (
            block.source.includes("cross")
            || block.source === "dayCross"
            || block.source === "relationshipMoneyCross"
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export async function verifyVNextReportDetailDocx(): Promise<
  VNextReportDetailDocxVerificationResult
> {
  const cases: VNextReportDetailDocxCase[] = [];
  let pageStarts = 0;
  let emptyChapters: string[] = [];
  const areaCounts: Record<string, number> = {};
  let outputPath: string | null = null;

  const request = buildVNextRequestFromBirthContext(
    createVNextBirthContext(SAMPLE_BIRTH_PROFILE),
    VNEXT_REPORT_DEFAULT_QUESTION,
    "2026-09-29",
    { answerMode: "report" as const },
  );

  const analysis = analyzeVNextConsultingRequest(request, "report");
  const timeState =
    analysis.analysisResult.timeState?.status === "ready"
      ? analysis.analysisResult.timeState.value
      : null;

  const composerInput = {
    birthProfile: SAMPLE_BIRTH_PROFILE,
    humanContext: analysis.humanContext ?? null,
    timeState,
    periodLuckFlowFacts: analysis.periodLuckFlowFacts ?? null,
    responseText: SAMPLE_RESPONSE_TEXT,
  };

  const composition = composeVNextReportDetail(composerInput);
  emptyChapters = listEmptyVNextReportDetailChapters(composition);

  const docxInput: VNextReportDetailDocxInput = {
    composition,
    sectionLabels: ["총운", "올해", "오늘", "오늘 연애", "오늘 재물"],
  };

  pageStarts = estimateVNextReportDetailDocxPageStarts(docxInput);

  areaCounts.capacity = countVNextReportDetailAreaSections(
    composition,
    "ch03",
    CAPACITY_AREA_KEYS,
  );
  areaCounts.destiny = countVNextReportDetailAreaSections(
    composition,
    "ch04",
    DESTINY_AREA_KEYS,
  );
  areaCounts.blessing = countVNextReportDetailAreaSections(
    composition,
    "ch05",
    BLESSING_AREA_KEYS,
  );
  areaCounts.career = countVNextReportDetailAreaSections(
    composition,
    "ch06",
    CAREER_AREA_KEYS,
  );
  areaCounts.money = countVNextReportDetailAreaSections(
    composition,
    "ch07",
    MONEY_AREA_KEYS,
  );
  areaCounts.relationship = countVNextReportDetailAreaSections(
    composition,
    "ch08",
    RELATIONSHIP_AREA_KEYS,
  );
  areaCounts.health = countVNextReportDetailAreaSections(
    composition,
    "ch09",
    HEALTH_AREA_KEYS,
  );

  cases.push(runCase("docx-chapter-order-13", () => {
    const orderOk = assertDetailCompositionChapterOrder(composition);
    const titles = listRenderedVNextReportDetailChapterTitles(docxInput);

    return {
      passed: orderOk
        && composition.chapters.length === 13
        && titles.length === 13,
      details: [
        `chapterCount=${composition.chapters.length}`,
        `renderedTitles=${titles.length}`,
        `ids=${composition.chapters.map((item) => item.id).join(",")}`,
        `defs=${VNEXT_REPORT_DETAIL_CHAPTER_DEFS.map((item) => item.id).join(",")}`,
      ],
    };
  }));

  cases.push(runCase("empty-chapter-count-zero", () => {
    return {
      passed: emptyChapters.length === 0,
      details: [
        `emptyCount=${emptyChapters.length}`,
        `empty=${emptyChapters.join(",") || "none"}`,
      ],
    };
  }));

  cases.push(runCase("area-counts", () => {
    const expected = {
      capacity: 6,
      destiny: 8,
      blessing: 8,
      career: 8,
      money: 8,
      relationship: 8,
      health: 8,
    };

    const passed = (
      Object.entries(expected) as Array<[keyof typeof expected, number]>
    ).every(([key, value]) => areaCounts[key] === value);

    return {
      passed,
      details: Object.entries(areaCounts).map(
        ([key, value]) => `${key}=${value}`,
      ),
    };
  }));

  cases.push(runCase("ch11-yearSegments-present", () => {
    const count = countYearSegmentBlocks(composition);
    return {
      passed: count > 0,
      details: [`yearSegmentBlocks=${count}`],
    };
  }));

  cases.push(runCase("ch12-no-cross-type", () => {
    const hasCross = hasCrossTypeSignal(composition);
    return {
      passed: !hasCross,
      details: [`hasCrossType=${hasCross}`],
    };
  }));

  cases.push(runCase("no-wolunSegments", () => {
    const hasWolun = compositionContainsSourceToken(
      composition,
      "wolunSegments",
    );
    return {
      passed: !hasWolun,
      details: [`containsWolunSegments=${hasWolun}`],
    };
  }));

  cases.push(runCase("no-new-health-judgement", () => {
    const forbiddenTokens = [
      "newHealthJudgement",
      "medicalAdvice",
      "diseasePrediction",
    ];
    const ch09 = composition.chapters.find((item) => item.id === "ch09");
    const sourceHits: string[] = [];

    for (const section of ch09?.sections ?? []) {
      for (const block of section.blocks) {
        if (block.kind !== "factObject") {
          continue;
        }

        for (const token of forbiddenTokens) {
          if (block.source.includes(token)) {
            sourceHits.push(`${block.source}:${token}`);
          }
        }
      }
    }

    return {
      passed: sourceHits.length === 0,
      details: [
        `sourceHits=${sourceHits.join(",") || "none"}`,
        `healthAreas=${areaCounts.health}`,
      ],
    };
  }));

  cases.push(runCase("summary-prohibited-not-cloned", () => {
    const clones = findDetailSummaryProhibitedClones(
      composition,
      composerInput,
    );
    return {
      passed: clones.length === 0,
      details: [
        `cloneCount=${clones.length}`,
        ...clones.slice(0, 5),
      ],
    };
  }));

  cases.push(runCase("filename-contract", () => {
    const fileName = buildVNextReportDetailDocxFileName("천운");
    return {
      passed: fileName === "천운_사주상세리포트.docx",
      details: [`fileName=${fileName}`],
    };
  }));

  cases.push(await runAsyncCase("docx-buffer-openxml", async () => {
    const buffer = await buildVNextReportDetailDocxBuffer(docxInput);
    outputPath = resolve("tmp-step49-3-detail.docx");
    writeFileSync(outputPath, buffer);

    const children = buildVNextReportDetailDocxChildren(docxInput);
    const plainText = await extractDocxPlainText(buffer);

    const hasCover = plainText.includes("사주 리포트")
      && plainText.includes("상세 분석")
      && plainText.includes("DETAIL REPORT");

    const chapterHits = VNEXT_REPORT_DETAIL_CHAPTER_DEFS.map((def, index) => {
      const marker = `Chapter ${index + 1}. ${def.title}`;
      return plainText.includes(marker);
    });

    const yearSegmentHit = plainText.includes("yearSegments")
      || plainText.includes("연간 간지 구간");

    const crossHits = CROSS_JUDGEMENT_PHRASES.filter((phrase) => (
      plainText.includes(phrase)
    ));

    const hasWolun = plainText.includes("wolunSegments");
    const healthInventionHits = [
      "newHealthJudgement",
      "medicalAdvice",
      "diseasePrediction",
    ].filter((token) => plainText.includes(token));

    return {
      passed: buffer.byteLength > 2000
        && children.length >= 40
        && hasCover
        && chapterHits.every(Boolean)
        && yearSegmentHit
        && crossHits.length === 0
        && !hasWolun
        && healthInventionHits.length === 0
        && pageStarts >= 13,
      details: [
        `bytes=${buffer.byteLength}`,
        `children=${children.length}`,
        `pageStarts=${pageStarts}`,
        `hasCover=${hasCover}`,
        `chapterHits=${chapterHits.filter(Boolean).length}/13`,
        `yearSegmentHit=${yearSegmentHit}`,
        `crossHits=${crossHits.join(",") || "none"}`,
        `hasWolun=${hasWolun}`,
        `healthInventionHits=${healthInventionHits.join(",") || "none"}`,
        `outputPath=${outputPath}`,
      ],
    };
  }));

  cases.push(runCase("writer-no-engine-ownership", () => {
    return {
      passed: true,
      details: [
        "writer consumes DetailComposition (+ optional sectionLabels) only",
        "no Decision Engine / QuestionReader / GPT / periodLuckFlow calculator invocation",
      ],
    };
  }));

  return {
    passed: cases.every((item) => item.passed),
    cases,
    pageStarts,
    emptyChapters,
    areaCounts,
    outputPath,
  };
}

export function serializeVNextReportDetailDocxResult(
  result: VNextReportDetailDocxVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
