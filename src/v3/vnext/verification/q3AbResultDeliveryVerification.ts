/**
 * Q3 A/B Result Delivery regression — exclusive_alt winner packaging.
 *
 * Asserts winner projection is preserved across:
 *   DecisionResult → Scenario → AnswerBlueprint → Evidence
 *   → ResponseContext → GPT Input (ResponsePrompt)
 *
 * Reuses actionCandidateComparisonVerification.QUESTIONS A1/A2/A3.
 * Does not add semantic axes, DecisionResult fields, or GPT/Engine changes.
 */

import {
  QUESTIONS,
} from "../../consulting/decision/actionCandidateComparisonVerification.js";
import {
  extractActionCandidateArms,
} from "../../consulting/decision/actionCandidateComparison.js";
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

export type Q3AbDeliveryExpectation = {
  id: "A1" | "A2" | "A3";
  questionText: string;
  expectedWinner: string;
  expectedArmSubset: readonly string[];
  expectedRuleId: string;
  requiredDomains: readonly string[];
  requiredBlocks: readonly ScenarioAnswerBlock[];
};

export type Q3AbDeliveryCaseResult = {
  id: string;
  questionText: string;
  passed: boolean;
  details: string[];
  readerDecisionTarget: string | null;
  exclusiveAltParticipants: string[] | null;
  arms: string[] | null;
  winner: string | null;
  verdict: string | null;
  coreDecision: string | null;
  recommendedDirection: string | null;
  finalDecisionSentence: string | null;
  meaningActionNature: string | null;
  scenarioType: string | null;
  matchedRuleId: string | null;
  requiredDomains: string[];
  blocks: string[];
  evidenceCount: number;
  duplicateEvidenceKeys: string[];
  engineDecisionLocked: boolean | null;
  promptHasWinnerResult: boolean;
  promptHasEngineLock: boolean;
  promptHasRejudgeOpening: boolean;
  gptMayRejudgeAbsent: boolean;
};

export type Q3AbResultDeliveryVerificationResult = {
  passed: boolean;
  cases: Q3AbDeliveryCaseResult[];
  duplicateEvidenceTotal: number;
};

const RULE_CANDIDATES = [
  "action-decision-money",
  "action-decision-career",
  "action-decision-business",
  "action-decision-generic",
  "action-decision-open-life-direction",
  "action-decision-relationship",
  "aptitude-recommendation",
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

/** A1/A2/A3 from actionCandidateComparisonVerification.QUESTIONS. */
export const Q3_AB_DELIVERY_CASES: readonly Q3AbDeliveryExpectation[] = [
  {
    id: "A1",
    questionText: QUESTIONS.A1,
    expectedWinner: "changeJob",
    expectedArmSubset: ["continue", "changeJob"],
    expectedRuleId: "action-decision-career",
    requiredDomains: ["career", "ability", "capacity", "risk"],
    requiredBlocks: [
      "directAnswer",
      "currentDirection",
      "conditions",
      "risk",
      "nextAction",
    ],
  },
  {
    id: "A2",
    questionText: QUESTIONS.A2,
    expectedWinner: "continue",
    expectedArmSubset: ["continue", "stop"],
    expectedRuleId: "action-decision-career",
    requiredDomains: ["career", "ability", "capacity", "risk"],
    requiredBlocks: [
      "directAnswer",
      "currentDirection",
      "conditions",
      "risk",
      "nextAction",
    ],
  },
  {
    id: "A3",
    questionText: QUESTIONS.A3,
    expectedWinner: "invest",
    expectedArmSubset: ["invest", "wait"],
    expectedRuleId: "action-decision-business",
    requiredDomains: ["career", "money", "capacity", "risk"],
    requiredBlocks: [
      "directAnswer",
      "currentDirection",
      "conditions",
      "risk",
      "nextAction",
    ],
  },
] as const;

function includesAll(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return expected.every((item) => actual.includes(item));
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

function runCase(
  expectation: Q3AbDeliveryExpectation,
): Q3AbDeliveryCaseResult {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: expectation.questionText,
  });
  const question = regressionInput.question;
  const exclusiveAlt =
    question.readerMatchDiagnostics?.actionRelations?.find(
      (relation) => relation.kind === "exclusive_alt",
    )
    ?? null;
  const arms =
    extractActionCandidateArms(question)?.map(
      (arm) => arm.decisionTarget,
    )
    ?? null;

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
  const blueprintScenarioType =
    blueprint && "scenarioType" in blueprint
      ? blueprint.scenarioType
      : null;

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
  const evidenceCount = packagingBlocks.reduce(
    (sum, block) => sum + block.relevantEvidence.length,
    0,
  );
  const directAnswerEvidenceCount =
    packagingBlocks.find((block) => block.id === "directAnswer")
      ?.relevantEvidence.length
    ?? 0;

  const details: string[] = [];
  const checks: boolean[] = [];

  const pushCheck = (ok: boolean, detail: string) => {
    checks.push(ok);
    if (!ok) {
      details.push(detail);
    }
  };

  // 1. QuestionReader — exclusive_alt / arms / decisionTarget
  pushCheck(
    Array.isArray(exclusiveAlt?.participants)
    && exclusiveAlt.participants.length >= 2,
    `exclusive_alt missing participants=${
      exclusiveAlt?.participants?.join(",") ?? "none"
    }`,
  );
  pushCheck(
    Array.isArray(arms) && arms.length >= 2,
    `arms missing arms=${arms?.join(",") ?? "none"}`,
  );
  pushCheck(
    includesAll(arms ?? [], expectation.expectedArmSubset),
    `arms=${arms?.join(",") ?? "none"}`,
  );
  pushCheck(
    typeof question.decisionTarget === "string"
    && question.decisionTarget.length > 0,
    `reader.decisionTarget=${question.decisionTarget}`,
  );
  // A2: meaning axes choose + locked winner continue may coexist — not a failure.

  // 2. DecisionEngine — winner / verdict / core / recommended / final
  pushCheck(
    decisionResult.decisionTarget === expectation.expectedWinner,
    `winner=${decisionResult.decisionTarget}`,
  );
  pushCheck(
    typeof decisionResult.verdict === "string"
    && decisionResult.verdict.length > 0,
    `verdict=${decisionResult.verdict}`,
  );
  pushCheck(
    decisionResult.coreDecision.length > 0,
    "coreDecision empty",
  );
  pushCheck(
    decisionResult.recommendedDirection.length > 0
    && decisionResult.recommendedDirection.includes("후보가 우세하다"),
    `recommendedDirection=${decisionResult.recommendedDirection}`,
  );
  pushCheck(
    decisionResult.finalDecisionSentence.length > 0,
    "finalDecisionSentence empty",
  );

  // 3. ScenarioRouter — actionDecision + domain
  pushCheck(scenario !== null, "scenario missing");
  pushCheck(meaning !== null, "meaning missing");
  if (scenario && meaning) {
    pushCheck(
      scenario.type === "actionDecision",
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
  }

  // 4. AnswerBlueprint — actionDecision packaging blocks
  pushCheck(
    blueprintScenarioType === "actionDecision",
    `blueprint.scenarioType=${blueprintScenarioType}`,
  );
  pushCheck(
    includesAll(blocks, expectation.requiredBlocks),
    `blocks=${blocks.join(",")}`,
  );
  pushCheck(
    blocks.includes("directAnswer"),
    "actionDecision directAnswer block missing",
  );

  // 5. ResponseEvidenceSelector
  pushCheck(context !== null, "responseContext missing");
  pushCheck(
    evidenceCount > 0,
    `evidenceCount=${evidenceCount}`,
  );
  pushCheck(
    directAnswerEvidenceCount > 0,
    `directAnswerEvidenceCount=${directAnswerEvidenceCount}`,
  );
  pushCheck(
    duplicateEvidenceKeys.length === 0,
    `duplicateEvidence=${duplicateEvidenceKeys.join(";")}`,
  );

  // 6. ResponseContext — locked decision + recommendedDirection + lock
  const lockedDecisionStatement = context?.lockedDecisionStatement ?? null;
  const contextRecommendedDirection = context?.recommendedDirection ?? null;
  const engineDecisionLocked = context?.engineDecisionLocked ?? null;

  pushCheck(
    typeof lockedDecisionStatement === "string"
    && lockedDecisionStatement.length > 0
    && (
      lockedDecisionStatement.includes(decisionResult.coreDecision)
      || lockedDecisionStatement === decisionResult.finalDecisionSentence
    ),
    `lockedDecisionStatement missing or drifted`,
  );
  pushCheck(
    contextRecommendedDirection === decisionResult.recommendedDirection,
    `context.recommendedDirection drifted`,
  );
  pushCheck(
    engineDecisionLocked === true,
    `engineDecisionLocked=${String(engineDecisionLocked)}`,
  );

  // 7. GPT Input (ResponsePrompt)
  pushCheck(prompt !== null, "responsePrompt missing");

  const promptHasLocked =
    typeof lockedDecisionStatement === "string"
    && lockedDecisionStatement.length > 0
    && promptText.includes(lockedDecisionStatement);
  const promptHasFinal =
    promptText.includes(decisionResult.finalDecisionSentence);
  const promptHasCore = promptText.includes(decisionResult.coreDecision);
  const promptHasWinnerResult = promptHasLocked || promptHasFinal || promptHasCore;

  pushCheck(
    promptHasWinnerResult,
    "prompt missing winner locked/final/core decision",
  );
  pushCheck(
    promptText.includes(decisionResult.recommendedDirection),
    "prompt missing recommendedDirection",
  );

  const promptHasEngineLock = promptText.includes("Engine Decision Lock");
  const promptHasExplanationOnly = promptText.includes("explanationOnly");
  const promptHasRejudgeOpening = promptText.includes(
    "먼저 질문에 대한 직접적인 판단을 제시한다",
  );
  const promptHasChooseAgain =
    promptText.includes("새로 선택하라")
    || promptText.includes("다시 선택하라")
    || promptText.includes("후보를 새로 고르");

  pushCheck(promptHasEngineLock, "prompt missing Engine Decision Lock");
  pushCheck(promptHasExplanationOnly, "prompt missing explanationOnly");
  pushCheck(engineDecisionLocked === true, "prompt lock contract requires engineDecisionLocked");
  pushCheck(!promptHasRejudgeOpening, "prompt has rejudge opening");
  pushCheck(!promptHasChooseAgain, "prompt asks GPT to re-choose");

  // gptMayRejudge is legacy; production must not ask GPT to rejudge.
  const gptMayRejudgeAbsent = !promptText.includes("gptMayRejudge");
  pushCheck(gptMayRejudgeAbsent, "prompt references gptMayRejudge");

  return {
    id: expectation.id,
    questionText: expectation.questionText,
    passed: checks.every(Boolean),
    details,
    readerDecisionTarget: question.decisionTarget,
    exclusiveAltParticipants: exclusiveAlt?.participants
      ? [...exclusiveAlt.participants]
      : null,
    arms: arms ? [...arms] : null,
    winner: decisionResult.decisionTarget,
    verdict: decisionResult.verdict,
    coreDecision: decisionResult.coreDecision,
    recommendedDirection: decisionResult.recommendedDirection,
    finalDecisionSentence: decisionResult.finalDecisionSentence,
    meaningActionNature: meaning?.actionNature ?? null,
    scenarioType: scenario?.type ?? null,
    matchedRuleId,
    requiredDomains: scenario ? [...scenario.requiredDomains] : [],
    blocks,
    evidenceCount,
    duplicateEvidenceKeys,
    engineDecisionLocked,
    promptHasWinnerResult,
    promptHasEngineLock,
    promptHasRejudgeOpening,
    gptMayRejudgeAbsent,
  };
}

export function verifyQ3AbResultDelivery(
): Q3AbResultDeliveryVerificationResult {
  const cases = Q3_AB_DELIVERY_CASES.map(runCase);
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
