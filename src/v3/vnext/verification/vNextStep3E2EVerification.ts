import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import {
  runVNextOrchestrator,
} from "../orchestration/vNextOrchestrator.js";
import type {
  AnalysisRequest,
  AnalysisResult,
} from "../types/index.js";
import type {
  AnswerBlueprint,
  ScenarioAnswerBlueprint,
} from "../types/answerBlueprint.js";
import type {
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  SajuCurrentSeunFact,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";

function isScenarioAnswerBlueprint(
  blueprint: AnswerBlueprint,
): blueprint is ScenarioAnswerBlueprint {
  return blueprint.mode === "question"
    && "scenarioType" in blueprint
    && "blocks" in blueprint;
}

function getBlueprintScenarioType(
  result: AnalysisResult,
): string | null {
  if (result.answerBlueprint?.status !== "ready") {
    return null;
  }

  const blueprint = result.answerBlueprint.value;

  return isScenarioAnswerBlueprint(blueprint)
    ? blueprint.scenarioType
    : blueprint.mode === "report"
      ? blueprint.scenarioType
      : null;
}

export type VNextStep3E2ECase = {
  id: string;
  questionText: string;
  passed: boolean;
  analysisResult: AnalysisResult;
  details: string[];
};

export type VNextStep3E2EVerificationResult = {
  passed: boolean;
  cases: VNextStep3E2ECase[];
};

function includesAll<T extends string>(
  actual: readonly T[],
  expected: readonly T[],
): boolean {
  return expected.every((item) => actual.includes(item));
}

function buildMockTargetPeriodLuckFlow(): SajuTargetPeriodLuckFlowFact {
  const targetSeun: SajuCurrentSeunFact = {
    year: 2026,
    age: 42,
    ganZhi: "丙午",
    heavenlyStem: "丙",
    earthlyBranch: "午",
    tenGod: "편관",
    element: "fire",
  };

  const wolunSegment: SajuWolunSegmentFact = {
    targetYear: 2026,
    targetMonth: 10,
    ganZhi: "丁酉",
    heavenlyStem: "丁",
    earthlyBranch: "酉",
    tenGod: "편재",
    element: "metal",
    startDate: "2026-10-08",
    endDate: "2026-11-07",
    jieQiBoundary: {
      name: "寒露",
      date: "2026-10-08",
    },
  };

  return {
    targetStartDate: "2026-10-01",
    targetEndDate: "2026-10-31",
    currentDaeun: null,
    targetSeun,
    yearSegments: [],
    wolunSegments: [wolunSegment],
    targetIlun: null,
    limitations: [],
  };
}

function runE2ECase(
  id: string,
  questionText: string,
  validate: (result: AnalysisResult) => {
    passed: boolean;
    details: string[];
  },
  options?: {
    includeLuckFlow?: boolean;
  },
): VNextStep3E2ECase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });

  const decisionResult = runDecisionEngine(regressionInput);

  const analysisRequest: AnalysisRequest = {
    sources: ["saju"],
    humanInput: {},
    question: regressionInput.question.originalQuestion,
    answerMode: "question",
    targetPeriod: options?.includeLuckFlow
      ? {
          start: "2026-10-01",
          end: "2026-10-31",
          granularity: "month",
          label: "2026-10",
        }
      : undefined,
  };

  const analysisResult = runVNextOrchestrator({
    analysisRequest,
    humanDestinyContext: regressionInput.humanContext,
    targetPeriodLuckFlow: options?.includeLuckFlow
      ? buildMockTargetPeriodLuckFlow()
      : undefined,
    questionReaderResult: regressionInput.question,
    decisionResult,
    targetPeriod: options?.includeLuckFlow
      ? {
          start: "2026-10-01",
          end: "2026-10-31",
          granularity: "month",
          label: "2026-10",
        }
      : null,
  });

  const validation = validate(analysisResult);

  return {
    id,
    questionText,
    passed: validation.passed,
    analysisResult,
    details: validation.details,
  };
}

export function verifyVNextStep3E2E(): VNextStep3E2EVerificationResult {
  const cases: VNextStep3E2ECase[] = [
    runE2ECase(
      "case-1-career-aptitude",
      "나에게 맞는 직업은 무엇인가요?",
      (result) => {
        const scenario = result.consultingScenario?.status === "ready"
          ? result.consultingScenario.value
          : null;

        const checks = [
          result.questionMeaning?.status === "ready",
          scenario?.type === "aptitudeRecommendation",
          result.changeSignals?.status === "skipped",
          result.answerBlueprint?.status === "ready",
          getBlueprintScenarioType(result) === "aptitudeRecommendation",
        ];

        return {
          passed: checks.every(Boolean),
          details: [
            `scenario=${scenario?.type ?? "none"}`,
            `changeSignals=${result.changeSignals?.status ?? "none"}`,
            `answerBlueprint=${result.answerBlueprint?.status ?? "none"}`,
          ],
        };
      },
    ),
    runE2ECase(
      "case-2-october-money-flow",
      "10월 금전운이 있을까요?",
      (result) => {
        const scenario = result.consultingScenario?.status === "ready"
          ? result.consultingScenario.value
          : null;

        const signals = result.changeSignals?.status === "ready"
          ? result.changeSignals.value
          : [];

        const expectedSignals: ChangeSignalType[] = [
          "opportunity",
          "inflow",
          "expense",
          "pressure",
          "risk",
        ];

        const extractedTypes = signals.map((signal) => signal.type);

        const checks = [
          scenario?.type === "generalFlow",
          result.timeState?.status === "ready",
          result.changeSignals?.status === "ready",
          includesAll(extractedTypes, expectedSignals),
          signals.some(
            (signal) => signal.timeSegment.granularity === "month",
          ),
          result.answerBlueprint?.status === "ready",
        ];

        return {
          passed: checks.every(Boolean),
          details: [
            `scenario=${scenario?.type ?? "none"}`,
            `changeSignals=${result.changeSignals?.status ?? "none"}`,
            `extractedTypes=${extractedTypes.join(",")}`,
            `timeState=${result.timeState?.status ?? "none"}`,
          ],
        };
      },
      { includeLuckFlow: true },
    ),
    runE2ECase(
      "case-3-october-store-opening",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      (result) => {
        const scenario = result.consultingScenario?.status === "ready"
          ? result.consultingScenario.value
          : null;

        const signals = result.changeSignals?.status === "ready"
          ? result.changeSignals.value
          : [];

        const expectedSignals: ChangeSignalType[] = [
          "opportunity",
          "pressure",
          "responsibility",
          "expansion",
          "risk",
        ];

        const extractedTypes = signals.map((signal) => signal.type);

        const checks = [
          scenario?.type === "actionDecision",
          result.changeSignals?.status === "ready",
          includesAll(extractedTypes, expectedSignals),
          result.assessment?.status === "ready",
          result.answerBlueprint?.status === "ready",
          getBlueprintScenarioType(result) === "actionDecision",
        ];

        return {
          passed: checks.every(Boolean),
          details: [
            `scenario=${scenario?.type ?? "none"}`,
            `extractedTypes=${extractedTypes.join(",")}`,
            `assessment=${result.assessment?.status ?? "none"}`,
          ],
        };
      },
      { includeLuckFlow: true },
    ),
    runE2ECase(
      "case-4-compatibility",
      "1967년 4월 2일 음력 여성과 궁합은 어떨까요?",
      (result) => {
        const scenario = result.consultingScenario?.status === "ready"
          ? result.consultingScenario.value
          : null;

        const checks = [
          scenario?.type === "relationshipAssessment",
          result.answerBlueprint?.status === "ready",
          getBlueprintScenarioType(result) === "relationshipAssessment",
          scenario?.requiredSignals.includes("relationshipChange"),
          scenario?.requiredSignals.includes("conflict"),
          scenario?.requiredSignals.includes("stability"),
        ];

        return {
          passed: checks.every(Boolean),
          details: [
            `scenario=${scenario?.type ?? "none"}`,
            `requiredSignals=${scenario?.requiredSignals.join(",") ?? "none"}`,
            `changeSignals=${result.changeSignals?.status ?? "none"}`,
            `missingContext=${scenario?.missingContext.map((item) => item.key).join(",") || "none"}`,
          ],
        };
      },
    ),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep3E2EResult(
  result: VNextStep3E2EVerificationResult,
): string {
  return JSON.stringify(
    {
      passed: result.passed,
      cases: result.cases.map((item) => ({
        id: item.id,
        questionText: item.questionText,
        passed: item.passed,
        details: item.details,
        analysisResult: item.analysisResult,
      })),
    },
    null,
    2,
  );
}
