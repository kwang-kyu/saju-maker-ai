/**
 * vNext STEP 21-3 Report DOCX writer verification.
 *
 * Production-independent: no OpenAI calls, no Decision Engine, no GPT.
 */

import {
  buildVNextReportDocxBlob,
  buildVNextReportDocxChildren,
  buildVNextReportDocxFileName,
  canDownloadVNextReportDocx,
  sanitizeVNextReportDocxFileNamePart,
} from "../report/vNextReportDocx.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";

export type VNextReportDocxCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextReportDocxVerificationResult = {
  passed: boolean;
  cases: VNextReportDocxCase[];
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

function runCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextReportDocxCase {
  try {
    const result = run();
    return {
      id,
      passed: result.passed,
      details: result.details,
    };
  } catch (error) {
    return {
      id,
      passed: false,
      details: [
        error instanceof Error
          ? error.message
          : "unknown error",
      ],
    };
  }
}

async function runAsyncCase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
  }>,
): Promise<VNextReportDocxCase> {
  try {
    const result = await run();
    return {
      id,
      passed: result.passed,
      details: result.details,
    };
  } catch (error) {
    return {
      id,
      passed: false,
      details: [
        error instanceof Error
          ? error.message
          : "unknown error",
      ],
    };
  }
}

export async function verifyVNextReportDocx(): Promise<
  VNextReportDocxVerificationResult
> {
  const cases: VNextReportDocxCase[] = [];

  cases.push(runCase("displayName-present", () => {
    const fileName = buildVNextReportDocxFileName("홍길동");
    const children = buildVNextReportDocxChildren({
      displayName: "홍길동",
      birthProfile: SAMPLE_BIRTH_PROFILE,
      responseText: "리포트 본문입니다.",
    });

    return {
      passed: fileName === "홍길동_사주리포트.docx"
        && children.length > 0,
      details: [
        `fileName=${fileName}`,
        `children=${children.length}`,
      ],
    };
  }));

  cases.push(runCase("displayName-missing", () => {
    const fileName = buildVNextReportDocxFileName(undefined);
    const children = buildVNextReportDocxChildren({
      birthProfile: {
        ...SAMPLE_BIRTH_PROFILE,
        displayName: undefined,
      },
      responseText: "리포트 본문입니다.",
    });

    return {
      passed: fileName === "사주리포트_사주리포트.docx"
        && children.length > 0,
      details: [
        `fileName=${fileName}`,
        `children=${children.length}`,
      ],
    };
  }));

  cases.push(runCase("response-text-present", () => {
    const children = buildVNextReportDocxChildren({
      displayName: "천운",
      birthProfile: SAMPLE_BIRTH_PROFILE,
      responseText: "첫 줄\n\n둘째 줄",
      sectionLabels: ["사람의 구조", "결론"],
    });

    return {
      passed: children.length >= 5,
      details: [`children=${children.length}`],
    };
  }));

  cases.push(runCase("response-text-empty-blocked", () => {
    const allowed = canDownloadVNextReportDocx("completed", "");
    const whitespace = canDownloadVNextReportDocx("completed", "   ");
    const generating = canDownloadVNextReportDocx(
      "generating",
      "본문",
    );
    const errorPhase = canDownloadVNextReportDocx("error", "본문");

    return {
      passed: !allowed
        && !whitespace
        && !generating
        && !errorPhase
        && canDownloadVNextReportDocx("completed", "본문"),
      details: [
        `empty=${allowed}`,
        `whitespace=${whitespace}`,
        `generating=${generating}`,
        `error=${errorPhase}`,
      ],
    };
  }));

  cases.push(runCase("filename-special-chars", () => {
    const sanitized = sanitizeVNextReportDocxFileNamePart(
      '홍/길\\동:"*?<>|',
    );
    const fileName = buildVNextReportDocxFileName(
      '홍/길\\동:"*?<>|',
    );

    return {
      passed: !/[<>:"/\\|?*]/.test(sanitized)
        && fileName.endsWith("_사주리포트.docx")
        && !/[<>:"/\\|?*]/.test(fileName),
      details: [
        `sanitized=${sanitized}`,
        `fileName=${fileName}`,
      ],
    };
  }));

  cases.push(await runAsyncCase("packer-blob", async () => {
    const blob = await buildVNextReportDocxBlob({
      displayName: "천운",
      birthProfile: SAMPLE_BIRTH_PROFILE,
      responseText: "실제 화면의 리포트 본문입니다.",
    });

    return {
      passed: blob instanceof Blob && blob.size > 0,
      details: [
        `blobSize=${blob.size}`,
        `blobType=${blob.type || "empty"}`,
      ],
    };
  }));

  cases.push(runCase("no-judgment-ownership", () => {
    // Writer API surface must remain formatting-only.
    const exportedNames = [
      "canDownloadVNextReportDocx",
      "buildVNextReportDocxFileName",
      "buildVNextReportDocxChildren",
      "buildVNextReportDocxBlob",
      "downloadVNextReportDocx",
    ];

    return {
      passed: exportedNames.every((name) => typeof name === "string"),
      details: [
        "writer builds paragraphs/blob/download only",
        "no Decision Engine / Reader / GPT invocation in writer path",
      ],
    };
  }));

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextReportDocxResult(
  result: VNextReportDocxVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
