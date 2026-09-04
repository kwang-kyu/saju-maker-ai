/**
 * vNext STEP 6-2 Birth Input Verification.
 */

import {
  isV3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  isVNextModeEnabled,
} from "../ui/vNextConsultingUIAdapter.js";
import {
  adaptBirthTimeBranchToEngineHour,
  getBirthTimeBranchEngineHourMap,
} from "../entry/birthTimeAdapter.js";
import {
  adaptBirthProfileToSajuInput,
  buildVNextConsultingRequestFromBirthProfile,
} from "../entry/vNextBirthInputAdapter.js";
import {
  buildVNextRequestFromBirthContext,
  createVNextBirthContext,
} from "../entry/vNextBirthContext.js";
import {
  VNextEntryController,
} from "../entry/vNextEntryController.js";
import {
  VNEXT_ENTRY_CLASSES,
  VNEXT_ENTRY_COPY,
} from "../entry/vNextEntryContent.js";
import {
  findBirthTimeBranchOption,
  VNEXT_BIRTH_TIME_BRANCH_OPTIONS,
  type VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  INITIAL_VNEXT_ENTRY_STATE,
  isVNextEntryScreenPhase,
  resolvePhaseAfterBirthInput,
  resolvePhaseAfterModeSelection,
} from "../entry/vNextEntryState.js";
import {
  simulateVNextConversationFlow,
} from "../ui/vNextConsultingController.js";
import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";

export type VNextStep6A2BirthInputCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep6A2BirthInputVerificationResult = {
  passed: boolean;
  cases: VNextStep6A2BirthInputCase[];
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

const SAMPLE_LUNAR_BIRTH_PROFILE: VNextBirthProfile = {
  ...SAMPLE_BIRTH_PROFILE,
  calendarType: "lunar",
};

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextStep6A2BirthInputCase {
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
): Promise<VNextStep6A2BirthInputCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export async function verifyVNextStep6A2BirthInput(): Promise<VNextStep6A2BirthInputVerificationResult> {
  const cases: VNextStep6A2BirthInputCase[] = [
    runSyncCase("case-1-entry-landing-start-mode-selection", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      const state = controller.getState();

      return {
        passed: state.phase === "modeSelection"
          && state.selectedMode === null
          && INITIAL_VNEXT_ENTRY_STATE.phase === "landing",
        details: [
          `phase=${state.phase}`,
        ],
      };
    }),

    runSyncCase("case-2-select-question-mode-birth-input", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("question");
      const state = controller.getState();

      return {
        passed: state.selectedMode === "question"
          && state.phase === "birthInput",
        details: [
          `selectedMode=${String(state.selectedMode)}`,
          `phase=${state.phase}`,
        ],
      };
    }),

    runSyncCase("case-3-select-report-mode-birth-input", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("report");
      const state = controller.getState();

      return {
        passed: state.selectedMode === "report"
          && state.phase === "birthInput",
        details: [
          `selectedMode=${String(state.selectedMode)}`,
          `phase=${state.phase}`,
        ],
      };
    }),

    runSyncCase("case-4-birth-time-ui-contract-yu-label", () => {
      const option = findBirthTimeBranchOption("yu");

      return {
        passed: option.value === "yu"
          && option.label === "유시"
          && option.buttonLabel === "유시 (17:00~18:59)"
          && VNEXT_BIRTH_TIME_BRANCH_OPTIONS.some(
            (item) => item.label === "유시" && item.value === "yu",
          ),
        details: [
          `value=${option.value}`,
          `label=${option.label}`,
          `buttonLabel=${String(option.buttonLabel)}`,
        ],
      };
    }),

    runSyncCase("case-5-birth-time-adapter-engine-contract", () => {
      const hourMap = getBirthTimeBranchEngineHourMap();
      const yuHour = adaptBirthTimeBranchToEngineHour("yu");
      const unknownHour = adaptBirthTimeBranchToEngineHour("unknown");
      const sajuInput = adaptBirthProfileToSajuInput(
        SAMPLE_BIRTH_PROFILE,
        "2026-09-01",
      );

      return {
        passed: yuHour === "17:00"
          && unknownHour === "12:00"
          && hourMap.ja === "23:00"
          && sajuInput.birthTime === "17:00"
          && sajuInput.birthDate === "1990-05-10"
          && sajuInput.gender === "female"
          && sajuInput.calendarType === "solar"
          && sajuInput.luckStartMethod === "minuteBased",
        details: [
          `yuHour=${yuHour}`,
          `unknownHour=${unknownHour}`,
          `birthDate=${sajuInput.birthDate}`,
        ],
      };
    }),

    runSyncCase("case-6-birth-input-complete-question-consulting", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("question");
      controller.completeBirthInput(SAMPLE_BIRTH_PROFILE);
      const state = controller.getState();

      return {
        passed: state.phase === "consulting"
          && state.selectedMode === "question"
          && state.birthProfile?.birthTimeBranch === "yu",
        details: [
          `phase=${state.phase}`,
          `birthTimeBranch=${String(state.birthProfile?.birthTimeBranch)}`,
        ],
      };
    }),

    runSyncCase("case-7-birth-input-complete-report-phase", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("report");
      controller.completeBirthInput(SAMPLE_BIRTH_PROFILE);
      const state = controller.getState();

      return {
        passed: state.phase === "report"
          && state.selectedMode === "report"
          && resolvePhaseAfterBirthInput("report") === "report",
        details: [
          `phase=${state.phase}`,
        ],
      };
    }),

    runSyncCase("case-8-birth-profile-included-in-question-request", () => {
      const request = buildVNextConsultingRequestFromBirthProfile(
        SAMPLE_BIRTH_PROFILE,
        "올해 이직해도 될까요?",
        "2026-09-01",
      );

      return {
        passed: isV3ConsultingRequest(request)
          && request.sajuInput.name === "천운"
          && request.sajuInput.birthDate === "1990-05-10"
          && request.sajuInput.birthTime === "17:00"
          && request.question === "올해 이직해도 될까요?",
        details: [
          `birthDate=${request.sajuInput.birthDate}`,
          `birthTime=${request.sajuInput.birthTime}`,
        ],
      };
    }),

    await runAsyncCase("case-9-follow-up-reuses-birth-profile-without-reinput", async () => {
      const birthContext = createVNextBirthContext(SAMPLE_BIRTH_PROFILE);
      const firstRequest = buildVNextRequestFromBirthContext(
        birthContext,
        "첫 질문입니다.",
        "2026-09-01",
      );
      const followUpRequest = buildVNextRequestFromBirthContext(
        birthContext,
        "추가 질문입니다.",
        "2026-09-01",
      );

      const { followUpResult } = await simulateVNextConversationFlow(
        firstRequest,
        followUpRequest.question,
        createMockResponseGateway(),
      );

      const birthMatches = firstRequest.sajuInput.birthDate
        === followUpRequest.sajuInput.birthDate
        && firstRequest.sajuInput.birthTime
          === followUpRequest.sajuInput.birthTime
        && firstRequest.sajuInput.gender
          === followUpRequest.sajuInput.gender;

      return {
        passed: birthMatches
          && followUpResult.session.turns.length >= 2,
        details: [
          `turns=${followUpResult.session.turns.length}`,
          `birthDate=${followUpRequest.sajuInput.birthDate}`,
        ],
      };
    }),

    runSyncCase("case-10-legacy-v3-does-not-enable-vnext-entry", () => {
      const legacyEnabled = isVNextModeEnabled({
        hash: "#v3",
        search: "",
      });
      const vNextEnabled = isVNextModeEnabled({
        hash: "#v3?vnext=1",
        search: "",
      });
      const entryScreenPhases = [
        isVNextEntryScreenPhase("landing"),
        isVNextEntryScreenPhase("modeSelection"),
        isVNextEntryScreenPhase("birthInput"),
        isVNextEntryScreenPhase("consulting"),
        isVNextEntryScreenPhase("report"),
      ];

      return {
        passed: legacyEnabled === false
          && vNextEnabled === true
          && entryScreenPhases.join(",") === "true,true,true,false,false"
          && resolvePhaseAfterModeSelection("question") === "birthInput"
          && VNEXT_ENTRY_COPY.birthInputTitle === "기본 정보를 알려주세요"
          && VNEXT_ENTRY_CLASSES.birthInputScreen
            === "vnext-entry-screen--birth-input",
        details: [
          `legacyEnabled=${legacyEnabled}`,
          `entryScreenPhases=${entryScreenPhases.join(",")}`,
        ],
      };
    }),

    runSyncCase("case-11-report-request-uses-report-answer-mode", () => {
      const request = buildVNextRequestFromBirthContext(
        createVNextBirthContext(SAMPLE_BIRTH_PROFILE),
        "현재 흐름을 정리해 주세요.",
        "2026-09-01",
        { answerMode: "report" },
      );

      return {
        passed: request.answerMode === "report"
          && isV3ConsultingRequest({
            sajuInput: request.sajuInput,
            humanLifeContextInput: request.humanLifeContextInput,
            question: request.question,
          })
          && request.sajuInput.birthTime === "17:00",
        details: [
          `answerMode=${request.answerMode}`,
        ],
      };
    }),

    runSyncCase("case-12-birth-input-calendar-copy-contract", () => {
      return {
        passed: VNEXT_ENTRY_COPY.birthInputCalendarLabel === "양력 / 음력"
          && VNEXT_ENTRY_COPY.birthInputCalendarSolar === "양력"
          && VNEXT_ENTRY_COPY.birthInputCalendarLunar === "음력",
        details: [
          `label=${VNEXT_ENTRY_COPY.birthInputCalendarLabel}`,
          `solar=${VNEXT_ENTRY_COPY.birthInputCalendarSolar}`,
          `lunar=${VNEXT_ENTRY_COPY.birthInputCalendarLunar}`,
        ],
      };
    }),

    runSyncCase("case-13-lunar-calendar-type-passes-through-adapter", () => {
      const sajuInput = adaptBirthProfileToSajuInput(
        SAMPLE_LUNAR_BIRTH_PROFILE,
        "2026-09-01",
      );

      return {
        passed: sajuInput.calendarType === "lunar"
          && sajuInput.birthDate === "1990-05-10"
          && sajuInput.birthTime === "17:00"
          && sajuInput.gender === "female",
        details: [
          `calendarType=${sajuInput.calendarType}`,
          `birthDate=${sajuInput.birthDate}`,
          `birthTime=${sajuInput.birthTime}`,
          `gender=${sajuInput.gender}`,
        ],
      };
    }),

    runSyncCase("case-14-solar-calendar-type-maintains-existing-behavior", () => {
      const sajuInput = adaptBirthProfileToSajuInput(
        SAMPLE_BIRTH_PROFILE,
        "2026-09-01",
      );
      const request = buildVNextConsultingRequestFromBirthProfile(
        SAMPLE_BIRTH_PROFILE,
        "올해 이직해도 될까요?",
        "2026-09-01",
      );

      return {
        passed: sajuInput.calendarType === "solar"
          && request.sajuInput.calendarType === "solar"
          && request.sajuInput.birthDate === "1990-05-10"
          && request.sajuInput.birthTime === "17:00"
          && request.sajuInput.gender === "female",
        details: [
          `calendarType=${sajuInput.calendarType}`,
          `birthDate=${request.sajuInput.birthDate}`,
        ],
      };
    }),

    runSyncCase("case-15-lunar-selection-preserves-other-birth-profile-fields", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("question");
      controller.completeBirthInput(SAMPLE_LUNAR_BIRTH_PROFILE);
      const state = controller.getState();
      const request = buildVNextConsultingRequestFromBirthProfile(
        SAMPLE_LUNAR_BIRTH_PROFILE,
        "올해 이직해도 될까요?",
        "2026-09-01",
      );

      return {
        passed: state.birthProfile?.calendarType === "lunar"
          && state.birthProfile?.year === 1990
          && state.birthProfile?.month === 5
          && state.birthProfile?.day === 10
          && state.birthProfile?.birthTimeBranch === "yu"
          && state.birthProfile?.gender === "female"
          && request.sajuInput.calendarType === "lunar"
          && request.sajuInput.birthDate === "1990-05-10"
          && request.sajuInput.birthTime === "17:00"
          && request.sajuInput.gender === "female",
        details: [
          `calendarType=${String(state.birthProfile?.calendarType)}`,
          `birthDate=${request.sajuInput.birthDate}`,
          `birthTime=${request.sajuInput.birthTime}`,
          `gender=${request.sajuInput.gender}`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep6A2BirthInputResult(
  result: VNextStep6A2BirthInputVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
