/**
 * vNext STEP 6-1 Entry Flow Verification.
 */

import {
  isVNextModeEnabled,
} from "../ui/vNextConsultingUIAdapter.js";
import {
  VNextEntryController,
} from "../entry/vNextEntryController.js";
import {
  VNEXT_ENTRY_CLASSES,
  VNEXT_ENTRY_COPY,
  VNEXT_ENTRY_MODE_CARDS,
  VNEXT_ENTRY_TOPIC_TAGS,
} from "../entry/vNextEntryContent.js";
import {
  INITIAL_VNEXT_ENTRY_STATE,
  isVNextEntryScreenPhase,
  resolvePhaseAfterBirthInput,
  resolvePhaseAfterModeSelection,
} from "../entry/vNextEntryState.js";

export type VNextStep6A1EntryCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep6A1EntryVerificationResult = {
  passed: boolean;
  cases: VNextStep6A1EntryCase[];
};

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextStep6A1EntryCase {
  const result = run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export function verifyVNextStep6A1Entry(): VNextStep6A1EntryVerificationResult {
  const cases: VNextStep6A1EntryCase[] = [
    runSyncCase("case-1-entry-initializes-landing", () => {
      const controller = new VNextEntryController();
      const state = controller.getState();

      return {
        passed: state.phase === "landing"
          && state.selectedMode === null
          && INITIAL_VNEXT_ENTRY_STATE.phase === "landing",
        details: [
          `phase=${state.phase}`,
          `selectedMode=${String(state.selectedMode)}`,
        ],
      };
    }),

    runSyncCase("case-2-start-consulting-mode-selection", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      const state = controller.getState();

      return {
        passed: state.phase === "modeSelection"
          && state.selectedMode === null,
        details: [
          `phase=${state.phase}`,
        ],
      };
    }),

    runSyncCase("case-3-select-mode-question", () => {
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

    runSyncCase("case-4-select-mode-report", () => {
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

    runSyncCase("case-5-go-back-to-landing", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("question");
      controller.goBack();
      const afterBirthBack = controller.getState();
      controller.goBack();
      const state = controller.getState();

      return {
        passed: afterBirthBack.phase === "modeSelection"
          && afterBirthBack.selectedMode === "question"
          && state.phase === "landing"
          && state.selectedMode === null,
        details: [
          `afterBirthBackPhase=${afterBirthBack.phase}`,
          `phase=${state.phase}`,
          `selectedMode=${String(state.selectedMode)}`,
        ],
      };
    }),

    runSyncCase("case-6-legacy-v3-does-not-enable-entry", () => {
      const legacyEnabled = isVNextModeEnabled({
        hash: "#v3",
        search: "",
      });
      const legacyWithOtherParam = isVNextModeEnabled({
        hash: "#v3?debug=1",
        search: "",
      });
      const vNextEnabled = isVNextModeEnabled({
        hash: "#v3?vnext=1",
        search: "",
      });

      return {
        passed: legacyEnabled === false
          && legacyWithOtherParam === false
          && vNextEnabled === true,
        details: [
          `legacy=#v3 → ${legacyEnabled}`,
          `legacyWithDebug → ${legacyWithOtherParam}`,
          `vnext=#v3?vnext=1 → ${vNextEnabled}`,
        ],
      };
    }),

    runSyncCase("case-7-landing-ui-content-contract", () => {
      return {
        passed: VNEXT_ENTRY_COPY.brand === "천운문"
          && VNEXT_ENTRY_COPY.startButton === "상담 시작하기"
          && VNEXT_ENTRY_COPY.landingLeadLine1.includes("지금 당신에게")
          && VNEXT_ENTRY_CLASSES.landingScreen === "vnext-entry-screen--landing"
          && VNEXT_ENTRY_TOPIC_TAGS.length === 8,
        details: [
          `brand=${VNEXT_ENTRY_COPY.brand}`,
          `topics=${VNEXT_ENTRY_TOPIC_TAGS.join(",")}`,
        ],
      };
    }),

    runSyncCase("case-8-mode-selection-ui-content-contract", () => {
      return {
        passed: VNEXT_ENTRY_COPY.questionModeTitle === "질문 상담"
          && VNEXT_ENTRY_COPY.reportModeTitle === "분석 리포트"
          && VNEXT_ENTRY_COPY.goBackButton === "이전으로"
          && VNEXT_ENTRY_MODE_CARDS.length === 2
          && VNEXT_ENTRY_CLASSES.modeCardSelected.includes("selected"),
        details: [
          `modes=${VNEXT_ENTRY_MODE_CARDS.map((item) => item.mode).join(",")}`,
        ],
      };
    }),

    runSyncCase("case-9-entry-screen-phase-gating", () => {
      return {
        passed: isVNextEntryScreenPhase("landing") === true
          && isVNextEntryScreenPhase("modeSelection") === true
          && isVNextEntryScreenPhase("birthInput") === true
          && isVNextEntryScreenPhase("consulting") === false
          && isVNextEntryScreenPhase("report") === false,
        details: [
          "landing+modeSelection+birthInput render entry screens",
        ],
      };
    }),

    runSyncCase("case-10-phase-advance-after-mode-and-birth-input", () => {
      const controller = new VNextEntryController();

      controller.startConsulting();
      controller.selectMode("question");
      const questionBirthState = controller.getState();

      controller.completeBirthInput({
        gender: "male",
        year: 1984,
        month: 3,
        day: 15,
        birthTimeBranch: "sin",
        calendarType: "solar",
      });
      const questionConsultingState = controller.getState();

      controller.reset();
      controller.startConsulting();
      controller.selectMode("report");
      controller.completeBirthInput({
        gender: "female",
        year: 1990,
        month: 5,
        day: 10,
        birthTimeBranch: "yu",
        calendarType: "solar",
      });
      const reportState = controller.getState();

      return {
        passed: questionBirthState.phase === "birthInput"
          && questionBirthState.selectedMode === "question"
          && questionConsultingState.phase === "consulting"
          && reportState.phase === "report"
          && reportState.selectedMode === "report"
          && resolvePhaseAfterModeSelection("question") === "birthInput"
          && resolvePhaseAfterBirthInput("question") === "consulting"
          && resolvePhaseAfterBirthInput("report") === "report",
        details: [
          `questionBirthPhase=${questionBirthState.phase}`,
          `questionConsultingPhase=${questionConsultingState.phase}`,
          `reportPhase=${reportState.phase}`,
        ],
      };
    }),

    runSyncCase("case-11-consulting-back-to-mode-selection", () => {
      const controller = new VNextEntryController();
      const profile = {
        displayName: "테스트",
        gender: "male" as const,
        year: 1984,
        month: 3,
        day: 15,
        birthTimeBranch: "sin" as const,
        calendarType: "solar" as const,
      };

      controller.startConsulting();
      controller.selectMode("question");
      controller.completeBirthInput(profile);
      const before = controller.getState();

      controller.goBack();
      const after = controller.getState();

      return {
        passed: before.phase === "consulting"
          && after.phase === "modeSelection"
          && after.selectedMode === "question"
          && after.birthProfile === before.birthProfile
          && after.birthProfile?.displayName === "테스트",
        details: [
          `beforePhase=${before.phase}`,
          `afterPhase=${after.phase}`,
          `selectedMode=${String(after.selectedMode)}`,
          `birthPreserved=${after.birthProfile === before.birthProfile}`,
        ],
      };
    }),

    runSyncCase("case-12-consulting-edit-birth-info", () => {
      const controller = new VNextEntryController();
      const profile = {
        displayName: "테스트",
        gender: "female" as const,
        year: 1990,
        month: 5,
        day: 10,
        birthTimeBranch: "yu" as const,
        calendarType: "lunar" as const,
      };

      controller.startConsulting();
      controller.selectMode("question");
      controller.completeBirthInput(profile);
      const before = controller.getState();

      controller.editBirthInfo();
      const afterEdit = controller.getState();

      controller.completeBirthInput({
        ...profile,
        year: 1991,
      });
      const afterResubmit = controller.getState();

      return {
        passed: before.phase === "consulting"
          && afterEdit.phase === "birthInput"
          && afterEdit.selectedMode === "question"
          && afterEdit.birthProfile === before.birthProfile
          && afterResubmit.phase === "consulting"
          && afterResubmit.birthProfile?.year === 1991
          && afterResubmit.birthProfile?.displayName === "테스트",
        details: [
          `afterEditPhase=${afterEdit.phase}`,
          `birthPreserved=${afterEdit.birthProfile === before.birthProfile}`,
          `afterResubmitPhase=${afterResubmit.phase}`,
          `year=${String(afterResubmit.birthProfile?.year)}`,
        ],
      };
    }),

    runSyncCase("case-13-report-to-consulting-then-back", () => {
      const controller = new VNextEntryController();
      const profile = {
        displayName: "리포트",
        gender: "male" as const,
        year: 1980,
        month: 1,
        day: 1,
        birthTimeBranch: "ja" as const,
        calendarType: "solar" as const,
      };

      controller.startConsulting();
      controller.selectMode("report");
      controller.completeBirthInput(profile);
      controller.continueToConsulting();
      const consulting = controller.getState();

      controller.goBack();
      const afterBack = controller.getState();

      return {
        passed: consulting.phase === "consulting"
          && consulting.selectedMode === "question"
          && consulting.birthProfile?.displayName === "리포트"
          && afterBack.phase === "modeSelection"
          && afterBack.selectedMode === "question"
          && afterBack.birthProfile?.displayName === "리포트",
        details: [
          `consultingPhase=${consulting.phase}`,
          `consultingMode=${String(consulting.selectedMode)}`,
          `afterBackPhase=${afterBack.phase}`,
          `birthName=${String(afterBack.birthProfile?.displayName)}`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep6A1EntryResult(
  result: VNextStep6A1EntryVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
