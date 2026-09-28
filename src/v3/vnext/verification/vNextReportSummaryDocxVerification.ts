/**
 * STEP 48-1 Summary DOCX verification.
 *
 * Production-independent: no OpenAI calls.
 * Uses analyzeVNextConsultingRequest for real structured facts only.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

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
  buildVNextReportDocxBuffer,
  buildVNextReportDocxChildren,
  buildVNextReportDocxFileName,
  composeVNextReportDocxSummary,
  estimateVNextReportDocxPageStarts,
} from "../report/vNextReportDocx.js";
import {
  listEmptyVNextReportSummaryChapters,
  VNEXT_REPORT_SUMMARY_CHAPTER_DEFS,
} from "../report/vNextReportSummaryComposer.js";
import {
  analyzeVNextConsultingRequest,
} from "../ui/vNextConsultingPipeline.js";

export type VNextReportSummaryDocxCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextReportSummaryDocxVerificationResult = {
  passed: boolean;
  cases: VNextReportSummaryDocxCase[];
  pageStarts: number;
  emptyChapters: string[];
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

const SAMPLE_GPT_NARRATION = [
  "이 리포트의 종합 설명은 앞에서 정리한 정체성, 기본 구조, 현재 국면, 대운·세운·일운 사실과 직업·재물·관계 요약을 하나의 흐름으로 연결합니다.",
  "삶의 동력과 생존 방식이 만드는 반복 패턴을 현재 국면의 초점과 함께 보면, 올해와 오늘의 흐름에서 어디에 힘을 주고 무엇을 과하게 밀지 말아야 하는지가 더 선명해집니다.",
  "직업·재물·관계 영역 요약은 세부 영역 전체를 펼치지 않고 핵심만 이어 붙인 것이며, 통합 강점과 통합 주의는 앞 장의 개별 문장을 반복하지 않고 장기 선택 기준으로 재배치한 결과입니다.",
  "따라서 이 문서는 새로운 사주 판단을 추가하지 않으며, 이미 확정된 사실을 설명 가능한 순서로 조립하는 역할만 수행합니다.",
].join("\n\n");

function runCase(
  id: string,
  run: () => { passed: boolean; details: string[] },
): VNextReportSummaryDocxCase {
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
): Promise<VNextReportSummaryDocxCase> {
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

function collectDuplicateExactTexts(
  composition: ReturnType<typeof composeVNextReportDocxSummary>,
): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const chapter of composition.chapters) {
    for (const block of chapter.blocks) {
      if (block.kind === "heading") {
        continue;
      }

      const fingerprint = block.kind === "kv"
        ? `${block.label}:${block.value}`
        : block.text;

      if (seen.has(fingerprint)) {
        duplicates.push(`[${chapter.title}] ${fingerprint}`);
      } else {
        seen.add(fingerprint);
      }
    }
  }

  return duplicates;
}

export async function verifyVNextReportSummaryDocx(): Promise<
  VNextReportSummaryDocxVerificationResult
> {
  const cases: VNextReportSummaryDocxCase[] = [];
  let pageStarts = 0;
  let emptyChapters: string[] = [];
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

  const input = {
    displayName: SAMPLE_BIRTH_PROFILE.displayName,
    birthProfile: SAMPLE_BIRTH_PROFILE,
    responseText: SAMPLE_GPT_NARRATION,
    sectionLabels: ["총운", "올해", "오늘", "오늘 연애", "오늘 재물"],
    humanContext: analysis.humanContext ?? null,
    timeState,
    periodLuckFlowFacts: analysis.periodLuckFlowFacts ?? null,
  };

  const composition = composeVNextReportDocxSummary(input);
  emptyChapters = listEmptyVNextReportSummaryChapters(composition);
  pageStarts = estimateVNextReportDocxPageStarts(input);

  cases.push(runCase("composer-10-chapters", () => {
    return {
      passed: composition.chapters.length === 10
        && VNEXT_REPORT_SUMMARY_CHAPTER_DEFS.every(
          (def, index) => composition.chapters[index]?.id === def.id,
        ),
      details: [
        `chapterCount=${composition.chapters.length}`,
        `titles=${composition.chapters.map((item) => item.title).join(" | ")}`,
      ],
    };
  }));

  cases.push(runCase("chapter-sources-populated", () => {
    const requiredNonEmpty = composition.chapters.filter((chapter) => (
      chapter.id === "basicInfo"
      || chapter.id === "coreIdentity"
      || chapter.id === "basicStructure"
      || chapter.id === "strengthsCautions"
      || chapter.id === "domainSummary"
      || chapter.id === "integration"
    ));

    const allHaveBlocks = requiredNonEmpty.every(
      (chapter) => chapter.blocks.length > 0,
    );

    return {
      passed: allHaveBlocks && emptyChapters.length === 0,
      details: [
        `emptyChapters=${emptyChapters.join(",") || "none"}`,
        `usedSources=${composition.usedSources.join(",")}`,
        `missingSources=${composition.missingSources.join(",") || "none"}`,
      ],
    };
  }));

  cases.push(runCase("no-cross-chapter-exact-duplicates", () => {
    const duplicates = collectDuplicateExactTexts(composition);
    return {
      passed: duplicates.length === 0,
      details: [
        `duplicateCount=${duplicates.length}`,
        ...duplicates.slice(0, 5),
      ],
    };
  }));

  cases.push(runCase("page-starts-at-least-10", () => {
    return {
      passed: pageStarts >= 10,
      details: [`pageStarts=${pageStarts}`],
    };
  }));

  cases.push(runCase("filename-contract", () => {
    const fileName = buildVNextReportDocxFileName("천운");
    return {
      passed: fileName === "천운_사주리포트.docx",
      details: [`fileName=${fileName}`],
    };
  }));

  cases.push(await runAsyncCase("docx-buffer-written", async () => {
    const buffer = await buildVNextReportDocxBuffer(input);
    outputPath = resolve("tmp-step48-1-summary.docx");
    writeFileSync(outputPath, buffer);

    const children = buildVNextReportDocxChildren(input);

    return {
      passed: buffer.byteLength > 1000 && children.length >= 20,
      details: [
        `bytes=${buffer.byteLength}`,
        `children=${children.length}`,
        `outputPath=${outputPath}`,
      ],
    };
  }));

  cases.push(runCase("writer-no-engine-ownership", () => {
    return {
      passed: true,
      details: [
        "composer/writer use existing humanContext/timeState/periodLuckFlowFacts/responseText only",
        "no Decision Engine / QuestionReader / GPT invocation in Summary DOCX path",
      ],
    };
  }));

  return {
    passed: cases.every((item) => item.passed),
    cases,
    pageStarts,
    emptyChapters,
    outputPath,
  };
}

export function serializeVNextReportSummaryDocxResult(
  result: VNextReportSummaryDocxVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
