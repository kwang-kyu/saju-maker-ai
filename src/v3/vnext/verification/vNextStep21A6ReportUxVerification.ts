/**
 * vNext STEP 21-6 Report UX Completion verification.
 */

import {
  createMockResponseGateway,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import type {
  ResponseGenerationOptions,
  ResponseGenerationResult,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseStreamListener,
} from "../gpt/responseStreamingTypes.js";
import {
  VNextEntryController,
} from "../entry/vNextEntryController.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  canDownloadVNextReportDocx,
} from "../report/vNextReportDocx.js";
import {
  VNextReportController,
} from "../report/vNextReportController.js";
import {
  resolveVNextReportUxActions,
} from "../report/vNextReportState.js";

export type VNextStep21A6ReportUxCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep21A6ReportUxVerificationResult = {
  passed: boolean;
  cases: VNextStep21A6ReportUxCase[];
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

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextStep21A6ReportUxCase {
  const result = run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

async function runAsyncCase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
  }>,
): Promise<VNextStep21A6ReportUxCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

function createFailOnceThenMockGateway(): ResponseGateway & {
  getCallCount: () => number;
} {
  const mock = createMockResponseGateway();
  let callCount = 0;

  return {
    getCallCount: () => callCount,
    async generate(
      prompt: ResponsePrompt,
      options?: ResponseGenerationOptions,
    ): Promise<ResponseGenerationResult> {
      callCount += 1;

      if (callCount === 1) {
        throw new Error("simulated report failure");
      }

      return mock.generate(prompt, options);
    },
    async generateStream(
      prompt: ResponsePrompt,
      options: ResponseGenerationOptions | undefined,
      listener: ResponseStreamListener,
    ): Promise<ResponseGenerationResult> {
      callCount += 1;

      if (callCount === 1) {
        throw new Error("simulated report failure");
      }

      return mock.generateStream!(prompt, options, listener);
    },
  };
}

export async function verifyVNextStep21A6ReportUx(): Promise<
  VNextStep21A6ReportUxVerificationResult
> {
  const cases: VNextStep21A6ReportUxCase[] = [
    await runAsyncCase("case-1-error-retry-same-birth", async () => {
      const gateway = createFailOnceThenMockGateway();
      const controller = new VNextReportController({ gateway });

      await controller.startReport(SAMPLE_BIRTH_PROFILE);
      const afterError = controller.getState();

      await controller.retryReport(SAMPLE_BIRTH_PROFILE);
      const afterRetry = controller.getState();

      return {
        passed: afterError.phase === "error"
          && afterError.errorMessage !== null
          && afterRetry.phase === "completed"
          && afterRetry.errorMessage === null
          && afterRetry.response !== null
          && gateway.getCallCount() === 2,
        details: [
          `afterErrorPhase=${afterError.phase}`,
          `afterRetryPhase=${afterRetry.phase}`,
          `callCount=${gateway.getCallCount()}`,
        ],
      };
    }),

    await runAsyncCase("case-2-completed-new-report", async () => {
      const mock = createMockResponseGateway();
      const controller = new VNextReportController({ gateway: mock });

      await controller.startReport(SAMPLE_BIRTH_PROFILE);
      const first = controller.getState();
      const firstText = first.response?.text ?? "";

      await controller.restartReport(SAMPLE_BIRTH_PROFILE);
      const second = controller.getState();

      const entry = new VNextEntryController();
      entry.startConsulting();
      entry.selectMode("report");
      entry.completeBirthInput(SAMPLE_BIRTH_PROFILE);
      const birthBefore = entry.getState().birthProfile;
      // restartReport only resets report session; entry birth stays.
      const birthAfter = entry.getState().birthProfile;

      return {
        passed: first.phase === "completed"
          && firstText.trim().length > 0
          && second.phase === "completed"
          && second.response !== null
          && second.errorMessage === null
          && second.streamingText === null
          && birthBefore !== null
          && birthAfter === birthBefore
          && mock.getCallRecord().callCount === 2,
        details: [
          `firstPhase=${first.phase}`,
          `secondPhase=${second.phase}`,
          `callCount=${mock.getCallRecord().callCount}`,
          `birthPreserved=${birthAfter === birthBefore}`,
        ],
      };
    }),

    runSyncCase("case-3-continue-to-consulting", () => {
      const entry = new VNextEntryController();
      entry.startConsulting();
      entry.selectMode("report");
      entry.completeBirthInput(SAMPLE_BIRTH_PROFILE);
      const before = entry.getState();

      entry.continueToConsulting();
      const after = entry.getState();

      return {
        passed: before.phase === "report"
          && before.birthProfile !== null
          && after.phase === "consulting"
          && after.selectedMode === "question"
          && after.birthProfile === before.birthProfile
          && after.birthProfile?.displayName
            === SAMPLE_BIRTH_PROFILE.displayName,
        details: [
          `beforePhase=${before.phase}`,
          `afterPhase=${after.phase}`,
          `selectedMode=${String(after.selectedMode)}`,
          `birthSame=${after.birthProfile === before.birthProfile}`,
        ],
      };
    }),

    runSyncCase("case-4-report-back-to-mode-selection", () => {
      const entry = new VNextEntryController();
      entry.startConsulting();
      entry.selectMode("report");
      entry.completeBirthInput(SAMPLE_BIRTH_PROFILE);
      const before = entry.getState();

      entry.goBack();
      const after = entry.getState();

      return {
        passed: before.phase === "report"
          && after.phase === "modeSelection"
          && after.selectedMode === "report"
          && after.birthProfile === before.birthProfile,
        details: [
          `afterPhase=${after.phase}`,
          `selectedMode=${String(after.selectedMode)}`,
          `birthPreserved=${after.birthProfile === before.birthProfile}`,
        ],
      };
    }),

    await runAsyncCase("case-5-generating-duplicate-guard", async () => {
      const mock = createMockResponseGateway();
      const controller = new VNextReportController({ gateway: mock });

      const first = controller.startReport(SAMPLE_BIRTH_PROFILE);
      const second = controller.startReport(SAMPLE_BIRTH_PROFILE);
      await Promise.all([first, second]);

      const state = controller.getState();

      return {
        passed: state.phase === "completed"
          && mock.getCallRecord().callCount === 1,
        details: [
          `phase=${state.phase}`,
          `callCount=${mock.getCallRecord().callCount}`,
        ],
      };
    }),

    runSyncCase("case-6-error-docx-blocked", () => {
      const actions = resolveVNextReportUxActions("error");

      return {
        passed: actions.canRetry === true
          && actions.canDownloadDocx === false
          && actions.canContinueToConsulting === false
          && actions.canNewReport === false
          && actions.canGoBack === true
          && canDownloadVNextReportDocx("error", "본문") === false,
        details: [
          `canRetry=${actions.canRetry}`,
          `canDownloadDocx=${actions.canDownloadDocx}`,
          `docxHelper=${canDownloadVNextReportDocx("error", "본문")}`,
        ],
      };
    }),

    runSyncCase("case-7-completed-docx-allowed", () => {
      const actions = resolveVNextReportUxActions("completed");

      return {
        passed: actions.canRetry === false
          && actions.canDownloadDocx === true
          && actions.canContinueToConsulting === true
          && actions.canNewReport === true
          && actions.canGoBack === true
          && canDownloadVNextReportDocx("completed", "리포트 본문") === true,
        details: [
          `canDownloadDocx=${actions.canDownloadDocx}`,
          `docxHelper=${canDownloadVNextReportDocx("completed", "리포트 본문")}`,
        ],
      };
    }),

    runSyncCase("case-8-idle-and-generating-action-matrix", () => {
      const idle = resolveVNextReportUxActions("idle");
      const generating = resolveVNextReportUxActions("generating");
      const streaming = resolveVNextReportUxActions("streaming");

      return {
        passed: idle.canGoBack === true
          && idle.canRetry === false
          && idle.canDownloadDocx === false
          && idle.canContinueToConsulting === false
          && idle.canNewReport === false
          && generating.canRetry === false
          && generating.canNewReport === false
          && generating.canGoBack === false
          && streaming.canRetry === false
          && streaming.canNewReport === false
          && streaming.canGoBack === false,
        details: [
          `idleGoBack=${idle.canGoBack}`,
          `generatingGoBack=${generating.canGoBack}`,
          `streamingRetry=${streaming.canRetry}`,
        ],
      };
    }),

    await runAsyncCase("case-9-retry-only-from-error", async () => {
      const mock = createMockResponseGateway();
      const controller = new VNextReportController({ gateway: mock });

      await controller.startReport(SAMPLE_BIRTH_PROFILE);
      await controller.retryReport(SAMPLE_BIRTH_PROFILE);
      const afterInvalidRetry = controller.getState();

      return {
        passed: afterInvalidRetry.phase === "completed"
          && mock.getCallRecord().callCount === 1,
        details: [
          `phase=${afterInvalidRetry.phase}`,
          `callCount=${mock.getCallRecord().callCount}`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep21A6ReportUxResult(
  result: VNextStep21A6ReportUxVerificationResult,
): string {
  const lines = [
    `passed=${result.passed}`,
    ...result.cases.map((item) => (
      `${item.passed ? "PASS" : "FAIL"} ${item.id} :: ${item.details.join(" | ")}`
    )),
  ];

  return lines.join("\n");
}
