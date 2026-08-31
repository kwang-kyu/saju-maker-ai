/**
 * vNext Architecture — 데이터 흐름과 설계 원칙.
 *
 * 천운문 통합 분석 플랫폼 vNext는 기존 v3 엔진 위에
 * Facade / Orchestration 레이어로 동작한다.
 */

/**
 * vNext 파이프라인 단계.
 *
 * INPUT
 *   → HUMAN STATE      (Master Reader → HumanStateAdapter)
 *   → TIME STATE       (Luck Flow 계산 → TimeStateAdapter)
 *   → CHANGE SIGNAL    (변화 신호 추출 — 판단 없음)
 *   → QUESTION MEANING (Question Reader → QuestionMeaningAdapter)
 *   → CONSULTING SCENARIO (라우팅 — 필요 분석 결정)
 *   → ASSESSMENT       (Decision Engine → AssessmentAdapter)
 *   → ANSWER BLUEPRINT (설명 범위 결정 — GPT 이전)
 *   → RESPONSE CONTEXT (Blueprint 기준 최소 데이터 선택 — GPT 직전)
 *   → RESPONSE ACTION (clarification / direct / consulting)
 *   → QUESTION / REPORT (GPT 설명)
 */
export const VNEXT_PIPELINE_STAGES = [
  "input",
  "humanState",
  "timeState",
  "changeSignal",
  "questionMeaning",
  "consultingScenario",
  "assessment",
  "answerBlueprint",
  "responseContext",
  "responseAction",
  "output",
] as const;

export type VNextPipelineStage = (typeof VNEXT_PIPELINE_STAGES)[number];

/** Question / Report 출력 형태 */
export const VNEXT_OUTPUT_MODES = [
  "question",
  "report",
] as const;

export type VNextOutputMode = (typeof VNEXT_OUTPUT_MODES)[number];

/**
 * vNext 설계 원칙.
 *
 * 1. Engine judges, GPT explains.
 * 2. Change Signal does not decide.
 * 3. Scenario selects required analysis.
 * 4. Only required engines run.
 * 5. Question and Report share analysis assets.
 * 6. API is used only when deterministic output is insufficient.
 * 7. Existing v3 engines remain source engines.
 * 8. vNext is a facade/orchestration layer first.
 */
export const VNEXT_ARCHITECTURE_PRINCIPLES = {
  engineJudgesGptExplains:
    "Engine judges, GPT explains.",
  changeSignalDoesNotDecide:
    "Change Signal does not decide.",
  scenarioSelectsRequiredAnalysis:
    "Scenario selects required analysis.",
  onlyRequiredEnginesRun:
    "Only required engines run.",
  questionAndReportShareAssets:
    "Question and Report share analysis assets.",
  apiWhenDeterministicInsufficient:
    "API is used only when deterministic output is insufficient.",
  existingV3EnginesRemainSource:
    "Existing v3 engines remain source engines.",
  vNextIsFacadeFirst:
    "vNext is a facade/orchestration layer first.",
} as const;

export type VNextArchitecturePrinciple =
  keyof typeof VNEXT_ARCHITECTURE_PRINCIPLES;

/**
 * 파이프라인 단계 간 데이터 흐름 매핑.
 *
 * 각 단계는 이전 단계의 결과를 입력으로 받을 수 있으나,
 * Consulting Scenario 이후에만 Assessment가 실행된다.
 */
export const VNEXT_DATA_FLOW = {
  input: {
    produces: ["humanState", "timeState", "questionMeaning"],
    consumes: [],
  },
  humanState: {
    produces: ["changeSignal"],
    consumes: ["input"],
  },
  timeState: {
    produces: ["changeSignal"],
    consumes: ["input"],
  },
  changeSignal: {
    produces: [],
    consumes: ["humanState", "timeState"],
  },
  questionMeaning: {
    produces: ["consultingScenario"],
    consumes: ["input"],
  },
  consultingScenario: {
    produces: ["assessment"],
    consumes: ["questionMeaning", "changeSignal"],
  },
  assessment: {
    produces: ["answerBlueprint"],
    consumes: ["consultingScenario", "humanState", "timeState", "changeSignal"],
  },
  answerBlueprint: {
    produces: ["responseContext"],
    consumes: ["assessment", "humanState", "timeState", "changeSignal"],
  },
  responseContext: {
    produces: ["responseAction"],
    consumes: ["answerBlueprint", "assessment", "humanState", "timeState", "changeSignal"],
  },
  responseAction: {
    produces: ["output"],
    consumes: ["responseContext", "questionMeaning", "consultingScenario"],
  },
  output: {
    produces: [],
    consumes: ["responseAction"],
  },
} as const satisfies Record<
  VNextPipelineStage,
  {
    produces: readonly string[];
    consumes: readonly string[];
  }
>;
