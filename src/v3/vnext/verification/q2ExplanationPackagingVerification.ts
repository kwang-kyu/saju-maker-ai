/**
 * Q2 Explanation Packaging regression — 11 representative questions.
 *
 * Asserts production packaging SoT:
 *   ScenarioRouter → AnswerBlueprint → ResponseContext → ResponsePrompt
 *
 * Does not connect ExplanationPlan to GPT Input.
 * Does not reclassify DecisionResult intent.
 */

import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import type {
  DecisionResult,
} from "../../consulting/decision/decisionTypes.js";
import {
  findScenarioRuleById,
} from "../routing/scenarioRouter.js";
import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import type {
  ConsultingScenarioType,
} from "../types/consultingScenario.js";
import type {
  ScenarioAnswerBlock,
} from "../types/answerBlueprint.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";

export type Q2PackagingExpectation = {
  id: string;
  questionText: string;
  expectedRuleId: string;
  expectedScenarioType: ConsultingScenarioType;
  expectedMeaningIntent: string;
  expectedDecisionIntent: string;
  expectedDecisionTarget: string;
  expectedActionNature: string;
  expectedConclusionNature: string;
  requiredDomains: readonly string[];
  requiredBlocks: readonly ScenarioAnswerBlock[];
  forbiddenBlocks?: readonly ScenarioAnswerBlock[];
  /** Domains that must not appear (lifeDirection career aptitude guard). */
  forbiddenDomains?: readonly string[];
};

export type Q2PackagingCaseResult = {
  id: string;
  questionText: string;
  passed: boolean;
  details: string[];
  decisionIntent: string | null;
  meaningIntent: string | null;
  scenarioType: string | null;
  matchedRuleId: string | null;
  requiredDomains: string[];
  blocks: string[];
  duplicateEvidenceKeys: string[];
  engineDecisionLocked: boolean | null;
  gptMayRejudgeAbsent: boolean;
  promptHasEngineLock: boolean;
  promptHasRejudgeOpening: boolean;
};

export type Q2ExplanationPackagingVerificationResult = {
  passed: boolean;
  cases: Q2PackagingCaseResult[];
  duplicateEvidenceTotal: number;
};

const RULE_CANDIDATES = [
  "aptitude-recommendation",
  "action-decision-money",
  "action-decision-career",
  "action-decision-business",
  "action-decision-generic",
  "action-decision-open-life-direction",
  "general-money-flow",
  "general-life-prediction-flow",
  "possibility-check",
  "general-fallback",
  "timing-assessment",
  "specific-event",
  "interpretation",
  "domain-aware-period-flow",
  "general-business-flow",
] as const;

export const Q2_PACKAGING_CASES: readonly Q2PackagingExpectation[] = [
  {
    id: "q2-1-money-manage",
    questionText: "돈을 어떻게 관리해야 하나요?",
    expectedRuleId: "action-decision-money",
    expectedScenarioType: "actionDecision",
    expectedMeaningIntent: "method",
    expectedDecisionIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedActionNature: "manageMoney",
    expectedConclusionNature: "decision",
    requiredDomains: ["money", "capacity", "risk"],
    requiredBlocks: ["directAnswer", "risk", "nextAction"],
  },
  {
    id: "q2-2-money-earn",
    questionText: "돈을 어떻게 벌어야 하나요?",
    expectedRuleId: "action-decision-money",
    expectedScenarioType: "actionDecision",
    expectedMeaningIntent: "method",
    expectedDecisionIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedActionNature: "manageMoney",
    expectedConclusionNature: "decision",
    requiredDomains: ["money", "capacity", "risk"],
    requiredBlocks: ["directAnswer", "risk", "nextAction"],
  },
  {
    id: "q2-3-money-possibility",
    questionText: "돈이 들어올 가능성이 있나요?",
    expectedRuleId: "possibility-check",
    expectedScenarioType: "possibilityCheck",
    // DecisionResult speech-act may be permission; packaging shape is possibility.
    expectedMeaningIntent: "possibility",
    expectedDecisionIntent: "permission",
    expectedDecisionTarget: "manageMoney",
    expectedActionNature: "manageMoney",
    expectedConclusionNature: "decision",
    requiredDomains: ["capacity", "risk"],
    requiredBlocks: [
      "directAnswer",
      "possibility",
      "supportingEvidence",
      "limitingFactors",
    ],
    forbiddenBlocks: ["periodOverview", "moneyOrDomainEffect"],
  },
  {
    id: "q2-4-money-prediction",
    questionText: "앞으로 돈이 들어올까요?",
    expectedRuleId: "general-money-flow",
    expectedScenarioType: "generalFlow",
    expectedMeaningIntent: "prediction",
    expectedDecisionIntent: "prediction",
    expectedDecisionTarget: "none",
    expectedActionNature: "none",
    expectedConclusionNature: "prediction",
    requiredDomains: ["money", "capacity", "risk"],
    requiredBlocks: ["periodOverview", "moneyOrDomainEffect"],
    forbiddenBlocks: ["possibility", "supportingEvidence"],
  },
  {
    id: "q2-5-investment-risk",
    questionText: "지금 투자는 위험한가요?",
    expectedRuleId: "action-decision-money",
    expectedScenarioType: "actionDecision",
    expectedMeaningIntent: "risk",
    expectedDecisionIntent: "risk",
    expectedDecisionTarget: "invest",
    expectedActionNature: "invest",
    expectedConclusionNature: "decision",
    requiredDomains: ["money", "capacity", "risk"],
    requiredBlocks: ["directAnswer", "risk"],
  },
  {
    id: "q2-6-life-direction-selection",
    questionText: "앞으로 어떤 방향으로 가야 할까요?",
    expectedRuleId: "action-decision-open-life-direction",
    expectedScenarioType: "actionDecision",
    expectedMeaningIntent: "selection",
    expectedDecisionIntent: "selection",
    expectedDecisionTarget: "confirmDirection",
    expectedActionNature: "confirmDirection",
    expectedConclusionNature: "decision",
    requiredDomains: ["personality", "capacity", "risk"],
    requiredBlocks: ["directAnswer", "risk", "nextAction"],
    forbiddenBlocks: ["ability", "suitableRole", "workingEnvironment"],
    forbiddenDomains: ["career", "ability"],
  },
  {
    id: "q2-7-life-direction-evaluation",
    questionText: "제 인생의 방향을 어떻게 잡아야 할까요?",
    expectedRuleId: "action-decision-open-life-direction",
    expectedScenarioType: "actionDecision",
    // DecisionResult speech-act may be evaluation; packaging shape is open-life-direction.
    expectedMeaningIntent: "possibility",
    expectedDecisionIntent: "evaluation",
    expectedDecisionTarget: "confirmDirection",
    expectedActionNature: "confirmDirection",
    expectedConclusionNature: "decision",
    requiredDomains: ["personality", "capacity", "risk"],
    requiredBlocks: ["directAnswer", "risk", "nextAction"],
    forbiddenBlocks: ["ability", "suitableRole", "workingEnvironment"],
    forbiddenDomains: ["career", "ability"],
  },
  {
    id: "q2-8-bare-next-action",
    questionText: "앞으로 무엇을 해야 할까요?",
    expectedRuleId: "general-fallback",
    expectedScenarioType: "generalFlow",
    expectedMeaningIntent: "possibility",
    expectedDecisionIntent: "evaluation",
    expectedDecisionTarget: "none",
    expectedActionNature: "none",
    expectedConclusionNature: "decision",
    requiredDomains: ["personality", "capacity"],
    requiredBlocks: ["periodOverview"],
    forbiddenBlocks: ["possibility", "supportingEvidence"],
    forbiddenDomains: ["career", "ability"],
  },
  {
    id: "q2-9-life-flow",
    questionText: "앞으로 제 삶이 어떻게 흘러갈까요?",
    expectedRuleId: "general-life-prediction-flow",
    expectedScenarioType: "generalFlow",
    expectedMeaningIntent: "prediction",
    expectedDecisionIntent: "prediction",
    expectedDecisionTarget: "none",
    expectedActionNature: "none",
    expectedConclusionNature: "prediction",
    requiredDomains: ["personality", "capacity", "risk"],
    requiredBlocks: ["periodOverview"],
    forbiddenBlocks: ["possibility", "suitableRole"],
  },
  {
    id: "q2-10-job-aptitude",
    questionText: "어떤 일을 하는 게 좋을까요?",
    expectedRuleId: "aptitude-recommendation",
    expectedScenarioType: "aptitudeRecommendation",
    expectedMeaningIntent: "selection",
    expectedDecisionIntent: "selection",
    expectedDecisionTarget: "none",
    expectedActionNature: "none",
    expectedConclusionNature: "recommendation",
    requiredDomains: ["career", "ability", "capacity"],
    requiredBlocks: [
      "directAnswer",
      "ability",
      "suitableRole",
      "workingEnvironment",
    ],
  },
  {
    id: "q2-11-business-field",
    questionText: "어떤 업종이 저에게 잘 맞을까요?",
    expectedRuleId: "aptitude-recommendation",
    expectedScenarioType: "aptitudeRecommendation",
    expectedMeaningIntent: "selection",
    expectedDecisionIntent: "selection",
    expectedDecisionTarget: "none",
    expectedActionNature: "none",
    expectedConclusionNature: "recommendation",
    requiredDomains: ["career", "ability", "capacity"],
    requiredBlocks: [
      "directAnswer",
      "ability",
      "suitableRole",
      "workingEnvironment",
    ],
  },
] as const;

function includesAll(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return expected.every((item) => actual.includes(item));
}

function excludesAll(
  actual: readonly string[],
  forbidden: readonly string[],
): boolean {
  return forbidden.every((item) => !actual.includes(item));
}

function resolveMatchedRuleId(
  meaning: QuestionMeaning,
  scenarioType: ConsultingScenarioType,
): string | null {
  for (const id of RULE_CANDIDATES) {
    const rule = findScenarioRuleById(id);
    if (
      rule
      && rule.matches(meaning)
      && rule.scenarioType === scenarioType
    ) {
      return id;
    }
  }

  return null;
}

function collectDuplicateEvidenceKeys(
  blocks: readonly { id: string; relevantEvidence: readonly { key: string }[] }[],
): string[] {
  const ownersByKey = new Map<string, string[]>();

  for (const block of blocks) {
    for (const evidence of block.relevantEvidence) {
      const owners = ownersByKey.get(evidence.key) ?? [];
      owners.push(block.id);
      ownersByKey.set(evidence.key, owners);
    }
  }

  return [...ownersByKey.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([key, owners]) => `${key}@${owners.join("|")}`);
}

function assertOwnerSeparation(
  blocks: readonly { id: string; relevantEvidence: readonly { key: string }[] }[],
): string[] {
  const violations: string[] = [];
  const byId = new Map(
    blocks.map((block) => [block.id, new Set(
      block.relevantEvidence.map((item) => item.key),
    )]),
  );

  const direct = byId.get("directAnswer");
  const supporting = byId.get("supportingEvidence");
  const possibility = byId.get("possibility");

  if (direct && supporting) {
    for (const key of direct) {
      if (supporting.has(key)) {
        violations.push(
          `assessment-evidence-reinject:${key}@directAnswer|supportingEvidence`,
        );
      }
    }
  }

  if (possibility && supporting) {
    for (const key of possibility) {
      if (supporting.has(key)) {
        violations.push(
          `possibility-supporting-overlap:${key}`,
        );
      }
    }
  }

  return violations;
}

function runCase(
  expectation: Q2PackagingExpectation,
): Q2PackagingCaseResult {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: expectation.questionText,
  });
  const decisionResult: DecisionResult = runDecisionEngine(regressionInput);
  const { analysisResult, action, context } = runPromptPipelineCase(
    expectation.questionText,
  );

  const meaning = analysisResult.questionMeaning?.status === "ready"
    ? analysisResult.questionMeaning.value
    : null;
  const scenario = analysisResult.consultingScenario?.status === "ready"
    ? analysisResult.consultingScenario.value
    : null;
  const blueprint = analysisResult.answerBlueprint?.status === "ready"
    ? analysisResult.answerBlueprint.value
    : null;
  const blocks = blueprint && "blocks" in blueprint
    ? [...blueprint.blocks]
    : [];

  const matchedRuleId = meaning && scenario
    ? resolveMatchedRuleId(meaning, scenario.type)
    : null;

  const prompt = action.type === "consulting"
    ? buildResponsePromptFromAction(action)
    : null;
  const promptText = prompt
    ? `${prompt.systemInstruction}\n${prompt.userPrompt}`
    : "";

  const packagingBlocks = context?.blocks ?? [];
  const duplicateEvidenceKeys = collectDuplicateEvidenceKeys(packagingBlocks);
  const ownerViolations = assertOwnerSeparation(packagingBlocks);

  const details: string[] = [];
  const checks: boolean[] = [];

  const pushCheck = (ok: boolean, detail: string) => {
    checks.push(ok);
    if (!ok) {
      details.push(detail);
    }
  };

  pushCheck(meaning !== null, "meaning missing");
  pushCheck(scenario !== null, "scenario missing");
  pushCheck(context !== null, "responseContext missing");
  pushCheck(prompt !== null, "responsePrompt missing");

  if (meaning && scenario) {
    pushCheck(
      meaning.intent === expectation.expectedMeaningIntent,
      `meaning.intent=${meaning.intent}`,
    );
    pushCheck(
      meaning.actionNature === expectation.expectedActionNature,
      `meaning.actionNature=${meaning.actionNature}`,
    );
    pushCheck(
      meaning.conclusionNature === expectation.expectedConclusionNature,
      `meaning.conclusionNature=${meaning.conclusionNature}`,
    );
    pushCheck(
      scenario.type === expectation.expectedScenarioType,
      `scenarioType=${scenario.type}`,
    );
    pushCheck(
      matchedRuleId === expectation.expectedRuleId,
      `matchedRuleId=${matchedRuleId}`,
    );
    pushCheck(
      includesAll(scenario.requiredDomains, expectation.requiredDomains)
      && scenario.requiredDomains.length === expectation.requiredDomains.length,
      `requiredDomains=${scenario.requiredDomains.join(",")}`,
    );
    pushCheck(
      includesAll(blocks, expectation.requiredBlocks),
      `blocks=${blocks.join(",")}`,
    );

    if (expectation.forbiddenBlocks) {
      pushCheck(
        excludesAll(blocks, expectation.forbiddenBlocks),
        `forbiddenBlocks leaked in ${blocks.join(",")}`,
      );
    }

    if (expectation.forbiddenDomains) {
      pushCheck(
        excludesAll(scenario.requiredDomains, expectation.forbiddenDomains),
        `forbiddenDomains leaked in ${scenario.requiredDomains.join(",")}`,
      );
    }
  }

  pushCheck(
    decisionResult.intent === expectation.expectedDecisionIntent,
    `decision.intent=${decisionResult.intent}`,
  );
  pushCheck(
    decisionResult.decisionTarget === expectation.expectedDecisionTarget,
    `decision.decisionTarget=${decisionResult.decisionTarget}`,
  );
  pushCheck(
    decisionResult.conclusionNature === expectation.expectedConclusionNature,
    `decision.conclusionNature=${decisionResult.conclusionNature}`,
  );

  pushCheck(
    duplicateEvidenceKeys.length === 0,
    `duplicateEvidence=${duplicateEvidenceKeys.join(";")}`,
  );
  pushCheck(
    ownerViolations.length === 0,
    `ownerViolations=${ownerViolations.join(";")}`,
  );

  const engineDecisionLocked = context?.engineDecisionLocked ?? null;
  pushCheck(
    engineDecisionLocked === true,
    `engineDecisionLocked=${String(engineDecisionLocked)}`,
  );

  const promptHasEngineLock = promptText.includes("Engine Decision Lock");
  const promptHasRejudgeOpening = promptText.includes(
    "먼저 질문에 대한 직접적인 판단을 제시한다",
  );
  const promptHasExplanationOnly = promptText.includes("explanationOnly");

  pushCheck(promptHasEngineLock, "prompt missing Engine Decision Lock");
  pushCheck(promptHasExplanationOnly, "prompt missing explanationOnly");
  pushCheck(!promptHasRejudgeOpening, "prompt has rejudge opening");

  // gptMayRejudge is legacy ExplanationPlan field; production must not ask GPT to rejudge.
  const gptMayRejudgeAbsent = !promptText.includes("gptMayRejudge");
  pushCheck(gptMayRejudgeAbsent, "prompt references gptMayRejudge");

  return {
    id: expectation.id,
    questionText: expectation.questionText,
    passed: checks.every(Boolean),
    details,
    decisionIntent: decisionResult.intent,
    meaningIntent: meaning?.intent ?? null,
    scenarioType: scenario?.type ?? null,
    matchedRuleId,
    requiredDomains: scenario ? [...scenario.requiredDomains] : [],
    blocks,
    duplicateEvidenceKeys: [
      ...duplicateEvidenceKeys,
      ...ownerViolations,
    ],
    engineDecisionLocked,
    gptMayRejudgeAbsent,
    promptHasEngineLock,
    promptHasRejudgeOpening,
  };
}

export function verifyQ2ExplanationPackaging(
): Q2ExplanationPackagingVerificationResult {
  const cases = Q2_PACKAGING_CASES.map(runCase);
  const duplicateEvidenceTotal = cases.reduce(
    (sum, item) => sum + item.duplicateEvidenceKeys.length,
    0,
  );

  return {
    passed: cases.every((item) => item.passed),
    cases,
    duplicateEvidenceTotal,
  };
}
