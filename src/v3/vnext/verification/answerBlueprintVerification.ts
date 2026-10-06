import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import {
  resolveLifeFlowTarget,
} from "../../consulting/question/lifeFlowTargetResolver.js";
import {
  adaptAssessment,
} from "../adapters/assessmentAdapter.js";
import {
  adaptQuestionMeaning,
  type QuestionMeaningAdapterInput,
} from "../adapters/questionMeaningAdapter.js";
import {
  buildAnswerBlueprint,
} from "../blueprint/answerBlueprintBuilder.js";
import {
  routeScenario,
} from "../routing/scenarioRouter.js";
import type {
  AnswerBlueprint,
  ReportAnswerBlueprint,
  ScenarioAnswerBlueprint,
} from "../types/answerBlueprint.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";

const VERIFICATION_REFERENCE_DATE = "2026-09-30";

/**
 * Production pipeline과 동일하게 lifeFlowTarget을 실어
 * QuestionMeaning.time.period를 연결한다.
 */
function adaptQuestionMeaningForBlueprintVerification(
  question: QuestionMeaningAdapterInput,
): QuestionMeaning {
  let lifeFlowTarget = null;

  try {
    lifeFlowTarget = resolveLifeFlowTarget(
      question.normalizedQuestion,
      VERIFICATION_REFERENCE_DATE,
    );
  } catch {
    lifeFlowTarget = null;
  }

  return adaptQuestionMeaning({
    ...question,
    ...(lifeFlowTarget ? { lifeFlowTarget } : {}),
  });
}

export type AnswerBlueprintVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type AnswerBlueprintVerificationResult = {
  passed: boolean;
  cases: AnswerBlueprintVerificationCase[];
};

function includesAll<T extends string>(
  actual: readonly T[],
  expected: readonly T[],
): boolean {
  return expected.every((item) => actual.includes(item));
}

function isScenarioAnswerBlueprint(
  blueprint: AnswerBlueprint,
): blueprint is ScenarioAnswerBlueprint {
  return blueprint.mode === "question"
    && "scenarioType" in blueprint
    && "blocks" in blueprint;
}

function isReportAnswerBlueprint(
  blueprint: AnswerBlueprint,
): blueprint is ReportAnswerBlueprint {
  return blueprint.mode === "report";
}

function verifyAptitudeBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "나에게 맞는 직업은 무엇인가요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "aptitude-recommendation-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const expectedBlocks = [
    "directAnswer",
    "ability",
    "suitableRole",
    "workingEnvironment",
    "caution",
    "nextAction",
  ];

  const checks = [
    blueprint.mode === "question",
    blueprint.scenarioType === "aptitudeRecommendation",
    includesAll(blueprint.blocks, expectedBlocks),
    blueprint.blocks.every((block) =>
      !/(조건을 갖춘|진행하는 것이 좋습니다)/.test(block),
    ),
  ];

  return {
    id: "aptitude-recommendation-blueprint",
    passed: checks.every(Boolean),
    details: [
      `mode=${blueprint.mode}`,
      `scenarioType=${blueprint.scenarioType}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyGeneralFlowBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월 금전운이 있을까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const assessment = adaptAssessment(
    runDecisionEngine(regressionInput),
  );

  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
    assessment,
    changeSignals: [],
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "general-flow-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const expectedBlocks = [
    "periodOverview",
    "earlyPeriod",
    "middlePeriod",
    "latePeriod",
    "opportunity",
    "pressure",
    "moneyOrDomainEffect",
    "caution",
  ];

  const checks = [
    blueprint.scenarioType === "generalFlow",
    blueprint.flowTimeStructure === "month",
    includesAll(blueprint.blocks, expectedBlocks),
    blueprint.blocks.includes("earlyPeriod"),
    blueprint.blocks.includes("middlePeriod"),
    blueprint.blocks.includes("latePeriod"),
  ];

  return {
    id: "general-flow-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `flowTimeStructure=${blueprint.flowTimeStructure ?? "none"}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyGeneralFlowDayBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "오늘의 운세는 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "general-flow-day-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const checks = [
    blueprint.scenarioType === "generalFlow",
    blueprint.flowTimeStructure === "day",
    blueprint.blocks.includes("periodOverview"),
    !blueprint.blocks.includes("earlyPeriod"),
    !blueprint.blocks.includes("middlePeriod"),
    !blueprint.blocks.includes("latePeriod"),
  ];

  return {
    id: "general-flow-day-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `flowTimeStructure=${blueprint.flowTimeStructure ?? "none"}`,
      `period=${questionMeaning.time.period?.granularity ?? "none"}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyGeneralFlowYearBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "올해 총운을 봐주세요",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "general-flow-year-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const checks = [
    blueprint.scenarioType === "generalFlow",
    blueprint.flowTimeStructure === "year",
    blueprint.blocks.includes("periodOverview"),
    !blueprint.blocks.includes("earlyPeriod"),
    !blueprint.blocks.includes("middlePeriod"),
    !blueprint.blocks.includes("latePeriod"),
  ];

  return {
    id: "general-flow-year-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `flowTimeStructure=${blueprint.flowTimeStructure ?? "none"}`,
      `period=${questionMeaning.time.period?.granularity ?? "none"}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyGeneralFlowOverviewBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "사업운이 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "general-flow-overview-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const checks = [
    blueprint.scenarioType === "generalFlow",
    questionMeaning.intent === "prediction",
    questionMeaning.actionNature === "none",
    blueprint.flowTimeStructure === "overview",
    blueprint.blocks.includes("periodOverview"),
    !blueprint.blocks.includes("earlyPeriod"),
    !blueprint.blocks.includes("middlePeriod"),
    !blueprint.blocks.includes("latePeriod"),
  ];

  return {
    id: "general-flow-overview-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `intent=${questionMeaning.intent}`,
      `actionNature=${questionMeaning.actionNature}`,
      `flowTimeStructure=${blueprint.flowTimeStructure ?? "none"}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyActionDecisionBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "사업을 시작하려고 하는데 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "action-decision-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const expectedBlocks = [
    "directAnswer",
    "currentDirection",
    "conditions",
    "risk",
    "scale",
    "timing",
    "nextAction",
  ];

  const checks = [
    blueprint.scenarioType === "actionDecision",
    blueprint.flowTimeStructure === undefined,
    includesAll(blueprint.blocks, expectedBlocks),
  ];

  return {
    id: "action-decision-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `actionNature=${questionMeaning.actionNature}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

/**
 * Open lifeDirection confirmDirection keeps actionDecision,
 * but omits scale/timing only for this semantic shape.
 */
function verifyOpenLifeDirectionBlueprintCase(
  id: string,
  questionText: string,
  expectedIntent: string,
  expectedAnalysisMode: string,
): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id,
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const expectedBlocks = [
    "directAnswer",
    "currentDirection",
    "conditions",
    "risk",
    "nextAction",
  ];

  const checks = [
    questionMeaning.askedObject === "lifeDirection",
    questionMeaning.intent === expectedIntent,
    questionMeaning.analysisMode === expectedAnalysisMode,
    questionMeaning.actionNature === "confirmDirection",
    blueprint.scenarioType === "actionDecision",
    blueprint.flowTimeStructure === undefined,
    includesAll(blueprint.blocks, expectedBlocks),
    !blueprint.blocks.includes("scale"),
    !blueprint.blocks.includes("timing"),
    blueprint.blocks.length === expectedBlocks.length,
  ];

  return {
    id,
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `askedObject=${questionMeaning.askedObject}`,
      `intent=${questionMeaning.intent}`,
      `analysisMode=${questionMeaning.analysisMode}`,
      `actionNature=${questionMeaning.actionNature}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyOpenLifeDirectionActionDecisionBlueprint(
): AnswerBlueprintVerificationCase {
  return verifyOpenLifeDirectionBlueprintCase(
    "open-life-direction-action-decision-blueprint",
    "어떤 방향으로 가야 할까요?",
    "selection",
    "selection",
  );
}

function verifyOpenLifeDirectionEvaluationMannerBlueprint(
): AnswerBlueprintVerificationCase {
  return verifyOpenLifeDirectionBlueprintCase(
    "open-life-direction-evaluation-manner-blueprint",
    "앞으로 어떻게 살아야 할까요?",
    "possibility",
    "decision",
  );
}

function verifyBusinessGeneralFlowMonthBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월에 사업운이 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "business-general-flow-month-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const checks = [
    blueprint.scenarioType === "generalFlow",
    questionMeaning.actionNature === "none",
    questionMeaning.time.period?.granularity === "month",
    blueprint.flowTimeStructure === "month",
    includesAll(blueprint.blocks, [
      "periodOverview",
      "earlyPeriod",
      "middlePeriod",
      "latePeriod",
    ]),
  ];

  return {
    id: "business-general-flow-month-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `actionNature=${questionMeaning.actionNature}`,
      `flowTimeStructure=${blueprint.flowTimeStructure ?? "none"}`,
      `period=${questionMeaning.time.period?.granularity ?? "none"}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyBusinessStoreOpeningActionDecisionBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월에 가게를 오픈하려고 하는데 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "business-store-opening-action-decision-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const expectedBlocks = [
    "directAnswer",
    "currentDirection",
    "conditions",
    "risk",
    "scale",
    "timing",
    "nextAction",
  ];

  const checks = [
    blueprint.scenarioType === "actionDecision",
    questionMeaning.actionNature === "start",
    questionMeaning.domain === "business",
    questionMeaning.time.period?.granularity === "month",
    questionMeaning.time.period?.month === 10,
    scenario.requiredTimeGranularity.includes("month"),
    blueprint.flowTimeStructure === undefined,
    includesAll(blueprint.blocks, expectedBlocks),
  ];

  return {
    id: "business-store-opening-action-decision-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `actionNature=${questionMeaning.actionNature}`,
      `period=${questionMeaning.time.period?.granularity ?? "none"}:${questionMeaning.time.period?.month ?? "none"}`,
      `requiredTimeGranularity=${scenario.requiredTimeGranularity.join(",")}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyReportModeBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월 금전운이 있을까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const blueprint = buildAnswerBlueprint({
    answerMode: "report",
    scenario,
    questionMeaning,
  });

  if (!isReportAnswerBlueprint(blueprint)) {
    return {
      id: "report-mode-blueprint",
      passed: false,
      details: ["blueprint is not a report answer blueprint"],
    };
  }

  const checks = [
    blueprint.scenarioType === "generalFlow",
    blueprint.sections.includes("humanState"),
    blueprint.sections.includes("timeState"),
    blueprint.sections.includes("changeSignals"),
    blueprint.sections.includes("assessment"),
    blueprint.sections.includes("conclusion"),
  ];

  return {
    id: "report-mode-blueprint",
    passed: checks.every(Boolean),
    details: [
      `mode=${blueprint.mode}`,
      `sections=${blueprint.sections.join(",")}`,
    ],
  };
}

function verifyRelationshipMissingContext(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "1967년 4월 2일 음력 여성과 궁합은 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  if (!isScenarioAnswerBlueprint(blueprint)) {
    return {
      id: "relationship-missing-context-blueprint",
      passed: false,
      details: ["blueprint is not a scenario answer blueprint"],
    };
  }

  const checks = [
    blueprint.scenarioType === "relationshipAssessment",
    blueprint.blocks.includes("directAnswer"),
    blueprint.blocks.includes("caution"),
    scenario.missingContext.length >= 0,
  ];

  return {
    id: "relationship-missing-context-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `blocks=${blueprint.blocks.join(",")}`,
      `missingContext=${scenario.missingContext.map((item) => item.key).join(",") || "none"}`,
    ],
  };
}

export function verifyAnswerBlueprints(): AnswerBlueprintVerificationResult {
  const cases = [
    verifyAptitudeBlueprint(),
    verifyGeneralFlowBlueprint(),
    verifyGeneralFlowDayBlueprint(),
    verifyGeneralFlowYearBlueprint(),
    verifyGeneralFlowOverviewBlueprint(),
    verifyActionDecisionBlueprint(),
    verifyOpenLifeDirectionActionDecisionBlueprint(),
    verifyOpenLifeDirectionEvaluationMannerBlueprint(),
    verifyBusinessGeneralFlowMonthBlueprint(),
    verifyBusinessStoreOpeningActionDecisionBlueprint(),
    verifyReportModeBlueprint(),
    verifyRelationshipMissingContext(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function verifyAnswerBlueprintDoesNotJudge(): boolean {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월에 가게를 오픈하려고 하는데 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaningForBlueprintVerification(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const blueprint = buildAnswerBlueprint({
    answerMode: "question",
    scenario,
    questionMeaning,
  });

  const serialized = JSON.stringify(blueprint);

  return !/(성공|실패|반드시|확실)/.test(serialized);
}
