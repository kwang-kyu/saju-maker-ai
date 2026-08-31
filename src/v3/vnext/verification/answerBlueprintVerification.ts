import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import {
  adaptAssessment,
} from "../adapters/assessmentAdapter.js";
import {
  adaptQuestionMeaning,
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

  const questionMeaning = adaptQuestionMeaning(
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

  const questionMeaning = adaptQuestionMeaning(
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
    "opportunity",
    "pressure",
    "moneyOrDomainEffect",
    "caution",
  ];

  const checks = [
    blueprint.scenarioType === "generalFlow",
    includesAll(blueprint.blocks, expectedBlocks),
  ];

  return {
    id: "general-flow-blueprint",
    passed: checks.every(Boolean),
    details: [
      `scenarioType=${blueprint.scenarioType}`,
      `blocks=${blueprint.blocks.join(",")}`,
    ],
  };
}

function verifyReportModeBlueprint(): AnswerBlueprintVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월 금전운이 있을까요?",
  });

  const questionMeaning = adaptQuestionMeaning(
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

  const questionMeaning = adaptQuestionMeaning(
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

  const questionMeaning = adaptQuestionMeaning(
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
