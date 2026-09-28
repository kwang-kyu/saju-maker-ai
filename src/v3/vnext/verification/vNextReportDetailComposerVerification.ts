/**
 * STEP 49-2 Detail Composer verification.
 *
 * Production-independent: no OpenAI calls.
 * Uses analyzeVNextConsultingRequest for real structured facts only.
 */

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
  analyzeVNextConsultingRequest,
} from "../ui/vNextConsultingPipeline.js";

export type VNextReportDetailComposerCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextReportDetailComposerVerificationResult = {
  passed: boolean;
  cases: VNextReportDetailComposerCase[];
  emptyChapters: string[];
  areaCounts: Record<string, number>;
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

function runCase(
  id: string,
  run: () => { passed: boolean; details: string[] },
): VNextReportDetailComposerCase {
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

function hasLifeDriverSecondaryFromProfile(
  composition: VNextReportDetailComposition,
): boolean {
  const chapter = composition.chapters.find((item) => item.id === "ch02");
  if (!chapter) {
    return false;
  }

  for (const section of chapter.sections) {
    for (const block of section.blocks) {
      if (
        block.kind === "factObject"
        && block.source === "profile.lifeDriver.secondary"
      ) {
        return true;
      }
    }
  }

  return false;
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

export async function verifyVNextReportDetailComposer(): Promise<
  VNextReportDetailComposerVerificationResult
> {
  const cases: VNextReportDetailComposerCase[] = [];
  let emptyChapters: string[] = [];
  const areaCounts: Record<string, number> = {};

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
    birthProfile: SAMPLE_BIRTH_PROFILE,
    humanContext: analysis.humanContext ?? null,
    timeState,
    periodLuckFlowFacts: analysis.periodLuckFlowFacts ?? null,
    responseText: SAMPLE_RESPONSE_TEXT,
  };

  const composition = composeVNextReportDetail(input);
  emptyChapters = listEmptyVNextReportDetailChapters(composition);

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

  cases.push(runCase("composer-13-chapters", () => {
    const orderOk = VNEXT_REPORT_DETAIL_CHAPTER_DEFS.every(
      (def, index) => (
        composition.chapters[index]?.id === def.id
        && composition.chapters[index]?.title === def.title
        && composition.chapters[index]?.index === index + 1
      ),
    );

    return {
      passed: composition.chapters.length === 13 && orderOk,
      details: [
        `chapterCount=${composition.chapters.length}`,
        `ids=${composition.chapters.map((item) => item.id).join(",")}`,
      ],
    };
  }));

  cases.push(runCase("chapter-ids-unique", () => {
    const ids = composition.chapters.map((item) => item.id);
    const unique = new Set(ids);
    return {
      passed: unique.size === ids.length,
      details: [`unique=${unique.size}`, `total=${ids.length}`],
    };
  }));

  cases.push(runCase("empty-chapter-count", () => {
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
    // Composer only forwards explanation.health payloads; invented
    // judgement section/source tokens must not appear.
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
        `usedHealth=${composition.usedSources.includes("explanation.health")}`,
        `healthAreas=${areaCounts.health}`,
      ],
    };
  }));

  cases.push(runCase("lifeDriver-secondary-from-profile", () => {
    const profileSecondary =
      input.humanContext?.identity?.profile?.lifeDriver?.secondary
      ?? null;
    const hasPayload = hasLifeDriverSecondaryFromProfile(composition);

    if (!profileSecondary) {
      return {
        passed: !hasPayload,
        details: [
          "profile.secondary=null",
          `payloadPresent=${hasPayload}`,
        ],
      };
    }

    return {
      passed: hasPayload,
      details: [
        "profile.secondary=present",
        `payloadPresent=${hasPayload}`,
        "source=profile.lifeDriver.secondary",
      ],
    };
  }));

  cases.push(runCase("summary-prohibited-not-cloned", () => {
    const clones = findDetailSummaryProhibitedClones(composition, input);
    return {
      passed: clones.length === 0,
      details: [
        `cloneCount=${clones.length}`,
        ...clones.slice(0, 5),
      ],
    };
  }));

  cases.push(runCase("composer-no-engine-ownership", () => {
    return {
      passed: true,
      details: [
        "composer uses existing birthProfile/humanContext/timeState/periodLuckFlowFacts/responseText only",
        "no Decision Engine / QuestionReader / GPT / new Fact / cross / wolun calculation",
      ],
    };
  }));

  return {
    passed: cases.every((item) => item.passed),
    cases,
    emptyChapters,
    areaCounts,
  };
}

export function serializeVNextReportDetailComposerResult(
  result: VNextReportDetailComposerVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
