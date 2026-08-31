/**
 * vNext STEP 6-5 Report Mode Verification.
 */

import {
  buildResponseContext,
} from "../response/responseContextBuilder.js";
import {
  createMockResponseGateway,
  generateNaturalConsultingResponse,
} from "../gpt/responseGateway.js";
import {
  buildVNextRequestFromBirthContext,
  createVNextBirthContext,
} from "../entry/vNextBirthContext.js";
import {
  VNextEntryController,
} from "../entry/vNextEntryController.js";
import {
  resolvePhaseAfterBirthInput,
} from "../entry/vNextEntryState.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  isVNextModeEnabled,
} from "../ui/vNextConsultingUIAdapter.js";
import {
  VNextConsultingController,
} from "../ui/vNextConsultingController.js";
import {
  analyzeVNextConsultingRequest,
} from "../ui/vNextConsultingPipeline.js";
import {
  VNEXT_REPORT_DEFAULT_QUESTION,
} from "../report/vNextReportCopy.js";
import {
  VNextReportController,
} from "../report/vNextReportController.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";

export type VNextStep6A5ReportCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep6A5ReportVerificationResult = {
  passed: boolean;
  cases: VNextStep6A5ReportCase[];
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

function buildReportRequest() {
  return buildVNextRequestFromBirthContext(
    createVNextBirthContext(SAMPLE_BIRTH_PROFILE),
    VNEXT_REPORT_DEFAULT_QUESTION,
    "2026-09-01",
    { answerMode: "report" as const },
  );
}

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextStep6A5ReportCase {
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
): Promise<VNextStep6A5ReportCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export async function verifyVNextStep6A5Report(): Promise<VNextStep6A5ReportVerificationResult> {
  const cases: VNextStep6A5ReportCase[] = [
    runSyncCase("case-1-report-mode-entry", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("report");
      controller.completeBirthInput(SAMPLE_BIRTH_PROFILE);
      const state = controller.getState();

      return {
        passed: state.phase === "report"
          && state.selectedMode === "report"
          && state.birthProfile !== null
          && resolvePhaseAfterBirthInput("report") === "report",
        details: [
          `phase=${state.phase}`,
          `selectedMode=${String(state.selectedMode)}`,
        ],
      };
    }),

    runSyncCase("case-2-answer-mode-report", () => {
      const request = buildReportRequest();

      return {
        passed: request.answerMode === "report"
          && request.question === VNEXT_REPORT_DEFAULT_QUESTION,
        details: [
          `answerMode=${request.answerMode}`,
          `question=${request.question}`,
        ],
      };
    }),

    runSyncCase("case-3-report-blueprint", () => {
      const request = buildReportRequest();
      const analysis = analyzeVNextConsultingRequest(
        request,
        "report",
      );
      const blueprint = analysis.analysisResult.answerBlueprint;
      const reportBlueprint = blueprint?.status === "ready"
        && blueprint.value.mode === "report"
        ? blueprint.value
        : null;

      return {
        passed: reportBlueprint !== null
          && reportBlueprint.sections.length > 0,
        details: [
          `mode=${reportBlueprint?.mode ?? "none"}`,
          `sections=${reportBlueprint?.sections.join(",") ?? ""}`,
        ],
      };
    }),

    runSyncCase("case-4-response-context-report", () => {
      const request = buildReportRequest();
      const analysis = analyzeVNextConsultingRequest(
        request,
        "report",
      );
      const context = buildResponseContext({
        analysisResult: analysis.analysisResult,
        originalQuestion: request.question,
        answerMode: "report",
      });

      return {
        passed: context !== null
          && context.answerMode === "report"
          && context.blueprint.mode === "report",
        details: [
          `answerMode=${context?.answerMode ?? "null"}`,
          `blueprintMode=${context?.blueprint.mode ?? "null"}`,
        ],
      };
    }),

    await runAsyncCase("case-5-consulting-action-gpt-once", async () => {
      const gateway = createMockResponseGateway();
      const controller = new VNextReportController({ gateway });

      await controller.startReport(SAMPLE_BIRTH_PROFILE);
      const state = controller.getState();

      return {
        passed: state.phase === "completed"
          && state.actionType === "consulting"
          && state.response !== null
          && state.response.apiCallCount === 1
          && state.response.text.trim().length > 0,
        details: [
          `action=${String(state.actionType)}`,
          `apiCallCount=${state.response?.apiCallCount ?? 0}`,
        ],
      };
    }),

    await runAsyncCase("case-6-clarification-direct-zero-gpt", async () => {
      const clarificationRequest = buildReportRequest();
      clarificationRequest.question = "상대방과 궁합은 어떤가요?";

      const clarificationAnalysis = analyzeVNextConsultingRequest(
        clarificationRequest,
        "report",
      );
      const clarificationResponse = await generateNaturalConsultingResponse({
        action: clarificationAnalysis.action,
        prompt: clarificationAnalysis.prompt,
        gateway: createMockResponseGateway(),
      });

      const defaultAnalysis = analyzeVNextConsultingRequest(
        buildReportRequest(),
        "report",
      );

      return {
        passed: clarificationAnalysis.action.type === "clarification"
          && clarificationResponse.apiCallCount === 0
          && defaultAnalysis.action.type === "consulting",
        details: [
          `clarificationAction=${clarificationAnalysis.action.type}`,
          `clarificationApiCalls=${clarificationResponse.apiCallCount}`,
          `defaultAction=${defaultAnalysis.action.type}`,
        ],
      };
    }),

    await runAsyncCase("case-7-streaming-partial-text", async () => {
      const controller = new VNextReportController({
        gateway: createMockResponseGateway(),
      });

      let sawStreaming = false;
      const unsubscribe = controller.subscribe((state) => {
        if (
          state.phase === "streaming"
          && state.streamingText
          && state.streamingText.length > 0
        ) {
          sawStreaming = true;
        }
      });

      await controller.startReport(SAMPLE_BIRTH_PROFILE);
      unsubscribe();

      const state = controller.getState();

      return {
        passed: sawStreaming
          && state.phase === "completed"
          && state.response !== null
          && state.response.text.trim().length > 0,
        details: [
          `sawStreaming=${sawStreaming}`,
          `phase=${state.phase}`,
          `textLength=${state.response?.text.length ?? 0}`,
        ],
      };
    }),

    await runAsyncCase("case-8-completed-report-display", async () => {
      const controller = new VNextReportController({
        gateway: createMockResponseGateway(),
      });

      await controller.startReport(SAMPLE_BIRTH_PROFILE);
      const state = controller.getState();

      return {
        passed: state.phase === "completed"
          && state.sections.length > 0
          && state.activeSection !== null
          && state.response !== null
          && state.response.text.trim().length >= 20,
        details: [
          `sections=${state.sections.join(",")}`,
          `activeSection=${String(state.activeSection)}`,
        ],
      };
    }),

    await runAsyncCase("case-9-question-mode-regression", async () => {
      const questionController = new VNextConsultingController({
        gateway: createMockResponseGateway(),
      });

      await questionController.submitQuestion({
        sajuInput: {
          name: "김천운",
          birthDate: "1984-03-15",
          birthTime: "14:30",
          gender: "male",
          calendarType: "solar",
          referenceDate: "2026-10-01",
          luckStartMethod: "minuteBased",
        },
        humanLifeContextInput: {},
        question: "10월 금전운은?",
      });

      const state = questionController.getState();

      return {
        passed: state.phase === "completed"
          && state.turns.length === 1
          && state.turns[0]?.actionType === "consulting",
        details: [
          `phase=${state.phase}`,
          `turnCount=${state.turns.length}`,
        ],
      };
    }),

    runSyncCase("case-10-legacy-v3-unchanged", () => {
      const legacyEnabled = isVNextModeEnabled({
        hash: "#v3",
        search: "",
      });
      const vNextEnabled = isVNextModeEnabled({
        hash: "#v3?vnext=1",
        search: "",
      });
      const reportPipeline = runPromptPipelineCase(
        VNEXT_REPORT_DEFAULT_QUESTION,
        { answerMode: "report" },
      );

      return {
        passed: legacyEnabled === false
          && vNextEnabled === true
          && reportPipeline.context?.answerMode === "report",
        details: [
          `legacy=${legacyEnabled}`,
          `vnext=${vNextEnabled}`,
          `reportContext=${reportPipeline.context?.answerMode ?? "null"}`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep6A5ReportResult(
  result: VNextStep6A5ReportVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
