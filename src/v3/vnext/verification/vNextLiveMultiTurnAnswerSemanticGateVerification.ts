/**
 * Multi-turn Live Answer Semantic Gate — vNext production conversation path.
 *
 * probe → createConversationSession → runVNextConversationPipeline (×2)
 * → turn.responseAction.context ground truth
 * → OpenAI Response Gateway answer (non-streaming)
 * → existing consultingLiveAnswerSemanticGate evaluator
 *
 * 수동 실행 전용. 기본 build/regression에 포함하지 않는다.
 * Mock gateway / simulateVNextConversationFlow / runPromptPipelineCase 사용 금지.
 * DecisionEngine에 질문을 다시 넣어 ground truth를 새로 만들지 않는다.
 */

import {
  buildConsultingOpenAIRequest,
} from "../../consulting/openai/consultingOpenAIAdapter.js";
import {
  buildConsultingLiveAnswerSemanticGateEvaluationPrompt,
  inspectConsultingLiveAnswerSemanticGateJson,
  verifyConsultingLiveAnswerSemanticGateContract,
  type SemanticGateAxisAlignment,
  type SemanticGateConfidence,
  type SemanticGateGroundingStatus,
  type SemanticGateMaterialOmission,
  type SemanticGateRequiredContentCoverage,
  type SemanticGateUnsupportedClaim,
  type SemanticGateVerdictAlignment,
} from "../../consulting/explanation/consultingLiveAnswerSemanticGateVerification.js";
import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  createConversationSession,
  runVNextConversationPipeline,
  type ConversationReusedFlags,
  type VNextConversationPipelineResult,
} from "../conversation/conversationPipeline.js";
import type {
  ConversationSession,
} from "../conversation/conversationSession.js";
import type {
  FollowUpQuestionType,
} from "../conversation/followUpQuestionResolver.js";
import {
  createOpenAIResponseGateway,
  isOpenAIResponseGatewayAvailable,
} from "../gpt/responseGatewayAdapter.js";
import {
  generateNaturalConsultingResponse,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import type {
  ResponseAction,
  ResponseContext,
} from "../response/responseContext.js";
import type {
  Assessment,
} from "../types/assessment.js";
import {
  VNEXT_LIVE_MULTI_TURN_ANSWER_SEMANTIC_GATE_PROBES,
  type VNextLiveMultiTurnAnswerSemanticGateProbe,
  type VNextLiveMultiTurnAnswerSemanticGateProbeId,
} from "./vNextLiveMultiTurnAnswerSemanticGateProbes.js";

export type VNextLiveMultiTurnPipelineMode =
  | "cacheOnly"
  | "partial"
  | "full"
  | "unknown";

export type VNextLiveMultiTurnSemanticGateInvariantId =
  | "I-MT-1"
  | "I-MT-2"
  | "I-MT-3"
  | "I-MT-4"
  | "I-MT-5"
  | "I-MT-6";

/**
 * Assessment.possibility ↔ Semantic Gate evaluator verdict 필드 대응 기록.
 * 새 verdict taxonomy를 만들지 않는다. Assessment.possibility 원문을 전달한다.
 */
export const MULTI_TURN_VERDICT_MAPPING_NOTE =
  "Semantic Gate evaluator verdict 필드는 본래 DecisionVerdict 계열을 "
  + "가정한다. multi-turn ground truth는 turn Assessment.possibility "
  + "(favorable|conditionallyFavorable|neutral|unfavorable|insufficient) "
  + "원문을 그대로 전달하며, 별도 taxonomy 재매핑을 하지 않는다.";

export type VNextLiveMultiTurnResponseContextSnapshot = {
  originalQuestion: string | null;
  scenario: string | null;
  lockedDecisionStatement: string | null;
  recommendedDirection: string | null;
  prohibitedDirection: string | null;
  engineDecisionLocked: boolean | null;
  askedObject: string | null;
  intent: string | null;
  actionNature: string | null;
  conclusionNature: string | null;
  analysisMode: string | null;
  timingType: string | null;
  assessmentPossibility: string | null;
  conditions: string[];
  risks: string[];
  timePeriodKey: string | null;
};

export type VNextLiveMultiTurnSemanticEvaluation = {
  parseSucceeded: boolean;
  parseFailureReason: string | null;
  targetAlignment: SemanticGateAxisAlignment | null;
  intentAlignment: SemanticGateAxisAlignment | null;
  topicAlignment: SemanticGateAxisAlignment | null;
  verdictAlignment: SemanticGateVerdictAlignment | null;
  groundingStatus: SemanticGateGroundingStatus | null;
  requiredContentCoverage: SemanticGateRequiredContentCoverage | null;
  materialUnsupportedClaims: SemanticGateUnsupportedClaim[];
  materialOmissions: SemanticGateMaterialOmission[];
  confidence: SemanticGateConfidence | null;
  rationale: string;
  passed: boolean;
};

export type VNextLiveMultiTurnTurnObservation = {
  question: string;
  followUpType: FollowUpQuestionType | "initial";
  pipelineMode: VNextLiveMultiTurnPipelineMode;
  reuse: ConversationReusedFlags;
  responseActionType: string | null;
  responseContext: VNextLiveMultiTurnResponseContextSnapshot | null;
  answerSource: string;
  apiCallCount: number;
  assistantAnswerPreview: string | null;
  semanticEvaluation: VNextLiveMultiTurnSemanticEvaluation | null;
  skippedSemanticGateReason: string | null;
};

export type VNextLiveMultiTurnContinuationInvariant = {
  lockedDecisionStatementPreserved: boolean;
  recommendedDirectionPreserved: boolean;
  prohibitedDirectionPreserved: boolean;
  risksPreserved: boolean;
  conditionsPreserved: boolean;
  assessmentReused: boolean;
  passed: boolean;
  details: string[];
};

export type VNextLiveMultiTurnProbeCaseResult = {
  probeId: VNextLiveMultiTurnAnswerSemanticGateProbeId;
  kind: VNextLiveMultiTurnAnswerSemanticGateProbe["kind"];
  expectedFollowUpType: FollowUpQuestionType;
  observedFollowUpType: FollowUpQuestionType | "initial" | null;
  classificationInstability: boolean;
  initial: VNextLiveMultiTurnTurnObservation | null;
  followUp: VNextLiveMultiTurnTurnObservation | null;
  followUpType: FollowUpQuestionType | "initial" | null;
  pipelineMode: VNextLiveMultiTurnPipelineMode | null;
  reuse: ConversationReusedFlags | null;
  answerSource: string;
  apiCallCount: number;
  parseSucceeded: boolean;
  parseFailureReason: string | null;
  requiredContentCoverage: SemanticGateRequiredContentCoverage | null;
  confidence: SemanticGateConfidence | null;
  targetAlignment: SemanticGateAxisAlignment | null;
  intentAlignment: SemanticGateAxisAlignment | null;
  topicAlignment: SemanticGateAxisAlignment | null;
  verdictAlignment: SemanticGateVerdictAlignment | null;
  groundingStatus: SemanticGateGroundingStatus | null;
  materialUnsupportedClaims: SemanticGateUnsupportedClaim[];
  materialOmissions: SemanticGateMaterialOmission[];
  rationale: string;
  continuationInvariant: VNextLiveMultiTurnContinuationInvariant | null;
  newQuestionAxesDifferFromInitial: boolean | null;
  timeRefinementPeriodChanged: boolean | null;
  diagnostic: string[];
  passed: boolean;
};

export type VNextLiveMultiTurnAnswerSemanticGateVerificationResult = {
  contractPassed: boolean;
  gatewayAvailable: boolean;
  probes: VNextLiveMultiTurnProbeCaseResult[];
  invariants: Record<
    VNextLiveMultiTurnSemanticGateInvariantId,
    "PASS" | "FAIL" | "SKIP"
  >;
  passed: boolean;
  verdictMappingNote: string;
  limitations: readonly string[];
};

const LIMITATIONS = [
  "동일 계열 모델의 자기평가 편향 가능성이 있다.",
  "모델 평가는 인간 전문가의 ground truth가 아니다.",
  "의미 검증 결과는 생산 차단기가 아니라 수동 검토 자료이다.",
  "각 probe는 initial→follow-up 순차 1회, retry/parallel 없음.",
  "clarification 턴은 GPT semantic gate 대상에서 제외한다.",
  MULTI_TURN_VERDICT_MAPPING_NOTE,
] as const;

function buildVerificationRequest(
  question: string,
): V3ConsultingRequest {
  return {
    sajuInput: {
      name: "김천운",
      birthDate: "1984-03-15",
      birthTime: "14:30",
      gender: "male",
      calendarType: "solar",
      referenceDate: "2026-10-01",
      luckStartMethod: "minuteBased",
    },
    humanLifeContextInput: {
      maritalStatus: "married",
      hasChildren: true,
      occupationStatus: "employed",
      hasActiveBusiness: false,
      financialResponsibility: "high",
    },
    question,
  };
}

function resolvePipelineMode(
  executedStages: readonly string[],
): VNextLiveMultiTurnPipelineMode {
  if (executedStages.includes("pipeline:cacheOnly")) {
    return "cacheOnly";
  }

  if (executedStages.includes("pipeline:partial")) {
    return "partial";
  }

  if (executedStages.includes("pipeline:full")) {
    return "full";
  }

  return "unknown";
}

function readAssessmentFromSession(
  session: ConversationSession,
): Assessment | null {
  return session.analysisCache.assessment?.value ?? null;
}

function readTimePeriodKey(
  session: ConversationSession,
): string | null {
  return session.analysisCache.timeState?.reuseMetadata.timePeriodKey
    ?? null;
}

function snapshotResponseContext(
  context: ResponseContext | null | undefined,
  assessment: Assessment | null,
  timePeriodKey: string | null,
): VNextLiveMultiTurnResponseContextSnapshot | null {
  if (!context) {
    return null;
  }

  const axes = context.questionMeaningAxes;
  const materialConditions = context.questionSpecificMaterials
    ?.conditions.primary
    .map((item) => item.description)
    ?? [];
  const materialRisks = context.questionSpecificMaterials
    ?.risks.primary
    .map((item) => item.description)
    ?? [];

  return {
    originalQuestion: context.originalQuestion || null,
    scenario: context.scenario ?? null,
    lockedDecisionStatement: context.lockedDecisionStatement ?? null,
    recommendedDirection: context.recommendedDirection ?? null,
    prohibitedDirection: context.prohibitedDirection ?? null,
    engineDecisionLocked: context.engineDecisionLocked ?? null,
    askedObject: axes?.askedObject ?? null,
    intent: axes?.intent ?? null,
    actionNature: axes?.actionNature ?? null,
    conclusionNature: axes?.conclusionNature ?? null,
    analysisMode: axes?.analysisMode ?? null,
    timingType: axes?.timingType ?? null,
    assessmentPossibility: assessment?.possibility ?? null,
    conditions: assessment
      ? assessment.conditions.map((item) => item.description)
      : materialConditions,
    risks: assessment
      ? assessment.risks.map((item) => item.description)
      : materialRisks,
    timePeriodKey,
  };
}

function previewAnswer(
  text: string | null | undefined,
): string | null {
  if (!text) {
    return null;
  }

  const trimmed = text.trim();

  if (trimmed.length <= 240) {
    return trimmed;
  }

  return `${trimmed.slice(0, 240)}…`;
}

function sameText(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  return (left ?? "").trim() === (right ?? "").trim();
}

function sameStringList(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
}

/**
 * pipeline이 consulting answer를 이미 만들었으면 재호출하지 않는다.
 * 없을 때만 generateNaturalConsultingResponse로 live answer를 확보한다.
 */
async function ensureLiveConsultingAnswer(input: {
  action: ResponseAction;
  existing: NaturalConsultingResponse;
  gateway: ResponseGateway;
}): Promise<NaturalConsultingResponse> {
  if (input.action.type !== "consulting") {
    return input.existing;
  }

  if (
    input.existing.source === "gpt"
    && input.existing.text.trim().length > 0
  ) {
    return input.existing;
  }

  const prompt = buildResponsePromptFromAction(input.action);

  if (!prompt) {
    return input.existing;
  }

  return generateNaturalConsultingResponse({
    action: input.action,
    prompt,
    gateway: input.gateway,
  });
}

async function evaluateAgainstResponseContext(input: {
  originalQuestion: string;
  context: ResponseContext;
  assessment: Assessment | null;
  assistantAnswer: string;
}): Promise<VNextLiveMultiTurnSemanticEvaluation> {
  const axes = input.context.questionMeaningAxes;
  const prompt = buildResponsePromptFromAction({
    type: "consulting",
    reason: "multi-turn-semantic-gate",
    context: input.context,
  });

  if (!prompt) {
    return {
      parseSucceeded: false,
      parseFailureReason: "missing-field",
      targetAlignment: null,
      intentAlignment: null,
      topicAlignment: null,
      verdictAlignment: null,
      groundingStatus: null,
      requiredContentCoverage: null,
      materialUnsupportedClaims: [],
      materialOmissions: [],
      confidence: null,
      rationale: "ResponsePrompt unavailable from ResponseContext",
      passed: false,
    };
  }

  const evaluationPrompt =
    buildConsultingLiveAnswerSemanticGateEvaluationPrompt({
      originalQuestion: input.originalQuestion,
      // Assessment.possibility 원문 — 새 taxonomy 재매핑 없음.
      verdict: input.assessment?.possibility
        ?? "insufficient",
      finalDecision: input.context.lockedDecisionStatement ?? "",
      decisionTarget: axes?.actionNature ?? "",
      intent: axes?.intent ?? "",
      topic: axes?.askedObject ?? "",
      sourceSystemPrompt: prompt.systemInstruction,
      sourceUserPrompt: prompt.userPrompt,
      assistantAnswer: input.assistantAnswer,
    });

  const {
    requestConsultingAnswer,
  } = await import(
    "../../consulting/openai/consultingOpenAIClient.js"
  );

  const rawEvaluation = await requestConsultingAnswer(
    buildConsultingOpenAIRequest(evaluationPrompt),
  );

  const inspected = inspectConsultingLiveAnswerSemanticGateJson(
    rawEvaluation,
  );

  return {
    parseSucceeded: inspected.parseSucceeded,
    parseFailureReason: inspected.parseFailureReason,
    targetAlignment: inspected.evaluation?.targetAlignment ?? null,
    intentAlignment: inspected.evaluation?.intentAlignment ?? null,
    topicAlignment: inspected.evaluation?.topicAlignment ?? null,
    verdictAlignment: inspected.evaluation?.verdictAlignment ?? null,
    groundingStatus: inspected.evaluation?.groundingStatus ?? null,
    requiredContentCoverage:
      inspected.evaluation?.requiredContentCoverage ?? null,
    materialUnsupportedClaims:
      inspected.evaluation?.materialUnsupportedClaims ?? [],
    materialOmissions: inspected.evaluation?.materialOmissions ?? [],
    confidence: inspected.evaluation?.confidence ?? null,
    rationale: inspected.evaluation?.rationale ?? "",
    passed: inspected.passed,
  };
}

async function observePipelineTurn(input: {
  result: VNextConversationPipelineResult;
  gateway: ResponseGateway;
  /**
   * clarification 턴은 GPT semantic gate를 돌리지 않는다.
   * classification instability 시에도 semantic 평가를 강제하지 않는다.
   */
  runSemanticGate: boolean;
  skipSemanticGateReason: string | null;
}): Promise<VNextLiveMultiTurnTurnObservation> {
  const { result, gateway } = input;
  const action = result.turn.responseAction;
  let response = result.response;

  if (action) {
    response = await ensureLiveConsultingAnswer({
      action,
      existing: response,
      gateway,
    });
  }

  const assessment = readAssessmentFromSession(result.session);
  const timePeriodKey = readTimePeriodKey(result.session);
  const context = action?.context ?? null;
  const snapshot = snapshotResponseContext(
    context,
    assessment,
    timePeriodKey,
  );

  let semanticEvaluation: VNextLiveMultiTurnSemanticEvaluation | null = null;
  let skippedSemanticGateReason = input.skipSemanticGateReason;

  if (
    input.runSemanticGate
    && action?.type === "consulting"
    && context
    && response.source === "gpt"
    && response.text.trim().length > 0
  ) {
    semanticEvaluation = await evaluateAgainstResponseContext({
      originalQuestion: result.turn.question,
      context,
      assessment,
      assistantAnswer: response.text,
    });
    skippedSemanticGateReason = null;
  } else if (input.runSemanticGate && !skippedSemanticGateReason) {
    skippedSemanticGateReason =
      action?.type !== "consulting"
        ? `non-consulting action (${action?.type ?? "null"})`
        : response.source !== "gpt"
          ? `answer source=${response.source}`
          : "missing ResponseContext or empty answer";
  }

  return {
    question: result.turn.question,
    followUpType: result.followUpType,
    pipelineMode: resolvePipelineMode(
      result.executionMetadata.executedStages,
    ),
    reuse: result.executionMetadata.reused,
    responseActionType: action?.type ?? null,
    responseContext: snapshot,
    answerSource: response.source,
    apiCallCount: response.apiCallCount,
    assistantAnswerPreview: previewAnswer(response.text),
    semanticEvaluation,
    skippedSemanticGateReason,
  };
}

function buildContinuationInvariant(
  initial: VNextLiveMultiTurnTurnObservation,
  followUp: VNextLiveMultiTurnTurnObservation,
): VNextLiveMultiTurnContinuationInvariant {
  const left = initial.responseContext;
  const right = followUp.responseContext;
  const details: string[] = [];

  if (!left || !right) {
    return {
      lockedDecisionStatementPreserved: false,
      recommendedDirectionPreserved: false,
      prohibitedDirectionPreserved: false,
      risksPreserved: false,
      conditionsPreserved: false,
      assessmentReused: followUp.reuse.assessment,
      passed: false,
      details: ["missing ResponseContext snapshot for continuation compare"],
    };
  }

  const lockedDecisionStatementPreserved = sameText(
    left.lockedDecisionStatement,
    right.lockedDecisionStatement,
  );
  const recommendedDirectionPreserved = sameText(
    left.recommendedDirection,
    right.recommendedDirection,
  );
  const prohibitedDirectionPreserved = sameText(
    left.prohibitedDirection,
    right.prohibitedDirection,
  );
  const risksPreserved = sameStringList(left.risks, right.risks);
  const conditionsPreserved = sameStringList(
    left.conditions,
    right.conditions,
  );
  const assessmentReused = followUp.reuse.assessment;

  if (!lockedDecisionStatementPreserved) {
    details.push("lockedDecisionStatement changed");
  }

  if (!recommendedDirectionPreserved) {
    details.push("recommendedDirection changed");
  }

  if (!prohibitedDirectionPreserved) {
    details.push("prohibitedDirection changed");
  }

  if (!risksPreserved) {
    details.push("risks changed");
  }

  if (!conditionsPreserved) {
    details.push("conditions changed");
  }

  if (!assessmentReused) {
    details.push("assessment reuse flag false");
  }

  // 구조 보존 + follow-up semantic gate(초기 판정 의미 유지)를 함께 본다.
  const semanticOk = followUp.semanticEvaluation?.passed === true;
  const structureOk =
    lockedDecisionStatementPreserved
    && recommendedDirectionPreserved
    && prohibitedDirectionPreserved
    && risksPreserved
    && conditionsPreserved
    && assessmentReused;

  if (!semanticOk) {
    details.push("follow-up semantic evaluation did not pass");
  }

  return {
    lockedDecisionStatementPreserved,
    recommendedDirectionPreserved,
    prohibitedDirectionPreserved,
    risksPreserved,
    conditionsPreserved,
    assessmentReused,
    passed: structureOk && semanticOk,
    details,
  };
}

function axesDifferForNewQuestion(
  initial: VNextLiveMultiTurnResponseContextSnapshot | null,
  followUp: VNextLiveMultiTurnResponseContextSnapshot | null,
): boolean | null {
  if (!initial || !followUp) {
    return null;
  }

  return initial.askedObject !== followUp.askedObject
    || initial.intent !== followUp.intent
    || initial.actionNature !== followUp.actionNature
    || initial.lockedDecisionStatement !== followUp.lockedDecisionStatement;
}

/**
 * Observation only. Same-month timeRefinement may keep timePeriodKey
 * (e.g. "2026-10" for "10월" → "10월 중순"). Do not treat sameness as FAIL.
 * Cross-month period-key changes belong to conversationPipelineVerification.
 */
function timePeriodChanged(
  initial: VNextLiveMultiTurnResponseContextSnapshot | null,
  followUp: VNextLiveMultiTurnResponseContextSnapshot | null,
): boolean | null {
  if (!initial || !followUp) {
    return null;
  }

  if (
    initial.timePeriodKey === null
    && followUp.timePeriodKey === null
  ) {
    return initial.timingType !== followUp.timingType
      || initial.lockedDecisionStatement !== followUp.lockedDecisionStatement;
  }

  return initial.timePeriodKey !== followUp.timePeriodKey;
}

/**
 * timeRefinement contract aligned with conversationReuseResolver /
 * conversationPipelineVerification case-3:
 * partial path, humanState reuse, assessment/timeState refresh.
 * Does not require timePeriodKey change.
 */
function timeRefinementPathContractOk(
  followUp: VNextLiveMultiTurnTurnObservation,
): boolean {
  return followUp.followUpType === "timeRefinement"
    && followUp.pipelineMode === "partial"
    && followUp.reuse.humanState === true
    && followUp.reuse.assessment === false
    && followUp.reuse.timeState === false;
}

function emptyEvaluationFields(): Pick<
  VNextLiveMultiTurnProbeCaseResult,
  | "parseSucceeded"
  | "parseFailureReason"
  | "requiredContentCoverage"
  | "confidence"
  | "targetAlignment"
  | "intentAlignment"
  | "topicAlignment"
  | "verdictAlignment"
  | "groundingStatus"
  | "materialUnsupportedClaims"
  | "materialOmissions"
  | "rationale"
  | "answerSource"
  | "apiCallCount"
> {
  return {
    parseSucceeded: false,
    parseFailureReason: null,
    requiredContentCoverage: null,
    confidence: null,
    targetAlignment: null,
    intentAlignment: null,
    topicAlignment: null,
    verdictAlignment: null,
    groundingStatus: null,
    materialUnsupportedClaims: [],
    materialOmissions: [],
    rationale: "",
    answerSource: "none",
    apiCallCount: 0,
  };
}

function pickPrimaryEvaluation(
  observation: VNextLiveMultiTurnTurnObservation | null,
): Pick<
  VNextLiveMultiTurnProbeCaseResult,
  | "parseSucceeded"
  | "parseFailureReason"
  | "requiredContentCoverage"
  | "confidence"
  | "targetAlignment"
  | "intentAlignment"
  | "topicAlignment"
  | "verdictAlignment"
  | "groundingStatus"
  | "materialUnsupportedClaims"
  | "materialOmissions"
  | "rationale"
  | "answerSource"
  | "apiCallCount"
> {
  if (!observation) {
    return emptyEvaluationFields();
  }

  const evaluation = observation.semanticEvaluation;

  if (!evaluation) {
    return {
      ...emptyEvaluationFields(),
      answerSource: observation.answerSource,
      apiCallCount: observation.apiCallCount,
      rationale: observation.skippedSemanticGateReason ?? "",
      parseFailureReason: observation.skippedSemanticGateReason
        ? "skipped"
        : null,
    };
  }

  return {
    parseSucceeded: evaluation.parseSucceeded,
    parseFailureReason: evaluation.parseFailureReason,
    requiredContentCoverage: evaluation.requiredContentCoverage,
    confidence: evaluation.confidence,
    targetAlignment: evaluation.targetAlignment,
    intentAlignment: evaluation.intentAlignment,
    topicAlignment: evaluation.topicAlignment,
    verdictAlignment: evaluation.verdictAlignment,
    groundingStatus: evaluation.groundingStatus,
    materialUnsupportedClaims: evaluation.materialUnsupportedClaims,
    materialOmissions: evaluation.materialOmissions,
    rationale: evaluation.rationale,
    answerSource: observation.answerSource,
    apiCallCount: observation.apiCallCount,
  };
}

async function runMultiTurnProbe(
  probe: VNextLiveMultiTurnAnswerSemanticGateProbe,
  gateway: ResponseGateway,
): Promise<VNextLiveMultiTurnProbeCaseResult> {
  const diagnostic: string[] = [];
  let session = createConversationSession();

  const initialResult = await runVNextConversationPipeline({
    session,
    question: probe.initialQuestion,
    input: {
      request: buildVerificationRequest(probe.initialQuestion),
      gateway,
    },
  });
  session = initialResult.session;

  const initialIsClarification =
    probe.kind === "clarificationAnswer"
    && (
      initialResult.turn.responseAction?.type === "clarification"
      || initialResult.response.source === "clarification"
    );

  const initialObservation = await observePipelineTurn({
    result: initialResult,
    gateway,
    // clarification 요청 턴은 GPT semantic gate 대상이 아니다.
    runSemanticGate:
      probe.kind !== "clarificationAnswer"
      && initialResult.turn.responseAction?.type === "consulting",
    skipSemanticGateReason: initialIsClarification
      ? "clarification turn — GPT semantic gate skipped"
      : probe.kind === "clarificationAnswer"
        ? "P3 initial: semantic gate reserved for post-merge consulting turn"
        : null,
  });

  const followUpResult = await runVNextConversationPipeline({
    session,
    question: probe.followUpQuestion,
    input: {
      request: buildVerificationRequest(probe.followUpQuestion),
      gateway,
    },
  });

  const classificationInstability =
    followUpResult.followUpType !== probe.expectedFollowUpType;

  if (classificationInstability) {
    diagnostic.push(
      `classificationInstability: expected=${probe.expectedFollowUpType} `
      + `observed=${followUpResult.followUpType}`,
    );
  }

  const followUpIsClarificationOnly =
    probe.kind === "clarificationAnswer"
    && (
      followUpResult.turn.responseAction?.type === "clarification"
      || followUpResult.response.source === "clarification"
    );

  const shouldEvaluateFollowUp =
    !classificationInstability
    && followUpResult.turn.responseAction?.type === "consulting"
    && !followUpIsClarificationOnly;

  const followUpObservation = await observePipelineTurn({
    result: followUpResult,
    gateway,
    runSemanticGate: shouldEvaluateFollowUp,
    skipSemanticGateReason: classificationInstability
      && probe.allowClassificationInstability
      ? "classification instability — semantic failure로 오판하지 않음"
      : followUpIsClarificationOnly
        ? "clarification-only follow-up — GPT semantic gate skipped"
        : followUpResult.turn.responseAction?.type !== "consulting"
          ? `follow-up action=${followUpResult.turn.responseAction?.type ?? "null"}`
          : null,
  });

  const primaryObservation =
    shouldEvaluateFollowUp
      ? followUpObservation
      : classificationInstability
        && probe.allowClassificationInstability
        ? followUpObservation
        : followUpObservation.semanticEvaluation
          ? followUpObservation
          : initialObservation.semanticEvaluation
            ? initialObservation
            : followUpObservation;

  const evaluationFields = pickPrimaryEvaluation(primaryObservation);

  const continuationInvariant = probe.kind === "continuation"
    ? buildContinuationInvariant(initialObservation, followUpObservation)
    : null;

  const newQuestionAxesDifferFromInitial = probe.kind === "newQuestion"
    ? axesDifferForNewQuestion(
      initialObservation.responseContext,
      followUpObservation.responseContext,
    )
    : null;

  const timeRefinementPeriodChanged = probe.kind === "timeRefinement"
    ? timePeriodChanged(
      initialObservation.responseContext,
      followUpObservation.responseContext,
    )
    : null;

  let passed = false;

  if (
    classificationInstability
    && probe.allowClassificationInstability
  ) {
    // P3 등: 구조 기록만 하고 semantic failure로 취급하지 않는다.
    passed = true;
    diagnostic.push(
      "classification instability recorded; probe not marked semantic FAIL",
    );
  } else if (probe.kind === "continuation") {
    passed =
      followUpObservation.followUpType === "continuation"
      && continuationInvariant?.passed === true
      && evaluationFields.parseSucceeded
      && evaluationFields.groundingStatus === "grounded"
      && evaluationFields.materialUnsupportedClaims.length === 0;
  } else if (probe.kind === "newQuestion") {
    passed =
      followUpObservation.followUpType === "newQuestion"
      && newQuestionAxesDifferFromInitial === true
      && evaluationFields.parseSucceeded
      && followUpObservation.semanticEvaluation?.passed === true
      && evaluationFields.targetAlignment === "preserved"
      && evaluationFields.intentAlignment === "preserved"
      && evaluationFields.topicAlignment === "preserved"
      && evaluationFields.groundingStatus === "grounded";
  } else if (probe.kind === "timeRefinement") {
    // Same-month refinement may keep timePeriodKey; do not require change.
    passed =
      timeRefinementPathContractOk(followUpObservation)
      && evaluationFields.parseSucceeded
      && followUpObservation.semanticEvaluation?.passed === true;
  } else if (probe.kind === "clarificationAnswer") {
    const postMergeConsulting =
      followUpObservation.responseActionType === "consulting"
      && followUpObservation.semanticEvaluation !== null;

    passed = postMergeConsulting
      ? followUpObservation.semanticEvaluation?.passed === true
      : followUpObservation.followUpType === "clarificationAnswer"
        && followUpObservation.answerSource !== "gpt";
  }

  if (
    evaluationFields.parseSucceeded === false
    && !classificationInstability
    && shouldEvaluateFollowUp
  ) {
    diagnostic.push(
      `parseFailure=${evaluationFields.parseFailureReason ?? "unknown"}`,
    );
  }

  return {
    probeId: probe.id,
    kind: probe.kind,
    expectedFollowUpType: probe.expectedFollowUpType,
    observedFollowUpType: followUpObservation.followUpType,
    classificationInstability,
    initial: initialObservation,
    followUp: followUpObservation,
    followUpType: followUpObservation.followUpType,
    pipelineMode: followUpObservation.pipelineMode,
    reuse: followUpObservation.reuse,
    ...evaluationFields,
    // pickPrimaryEvaluation의 passed는 semantic evaluation의 passed다.
    // probe.passed는 아래 invariant 규칙을 따른다.
    continuationInvariant,
    newQuestionAxesDifferFromInitial,
    timeRefinementPeriodChanged,
    diagnostic,
    passed,
  };
}

function computeInvariants(
  probes: readonly VNextLiveMultiTurnProbeCaseResult[],
): Record<
  VNextLiveMultiTurnSemanticGateInvariantId,
  "PASS" | "FAIL" | "SKIP"
> {
  const byId = (id: VNextLiveMultiTurnAnswerSemanticGateProbeId) =>
    probes.find((item) => item.probeId === id) ?? null;

  const p1 = byId("P1");
  const p2 = byId("P2");
  const p3 = byId("P3");
  const p4 = byId("P4");

  const i1 = !p1
    ? "SKIP"
    : p1.continuationInvariant?.passed === true
      && p1.passed
      ? "PASS"
      : "FAIL";

  const i2 = !p2
    ? "SKIP"
    : p2.followUpType === "newQuestion"
      && p2.newQuestionAxesDifferFromInitial === true
      && p2.targetAlignment === "preserved"
      && p2.intentAlignment === "preserved"
      && p2.topicAlignment === "preserved"
      && p2.passed
      ? "PASS"
      : "FAIL";

  // classification instability ≠ semantic failure
  const i3 = !p3
    ? "SKIP"
    : p3.classificationInstability
      ? "PASS"
      : p3.passed
        ? "PASS"
        : "FAIL";

  // I-MT-4: same-month timeRefinement may keep timePeriodKey.
  // Require followUpType/partial/humanState reuse + new analysis path
  // (assessment/timeState not reused) + probe semantic PASS.
  const i4 = !p4
    ? "SKIP"
    : p4.followUpType === "timeRefinement"
      && p4.pipelineMode === "partial"
      && p4.reuse?.humanState === true
      && p4.reuse?.assessment === false
      && p4.reuse?.timeState === false
      && p4.passed
      ? "PASS"
      : "FAIL";

  const evaluable = probes.filter(
    (item) =>
      !item.classificationInstability
      && item.followUp?.semanticEvaluation !== null,
  );

  const i5 = evaluable.length === 0
    ? "SKIP"
    : evaluable.every((item) => item.parseSucceeded)
      ? "PASS"
      : "FAIL";

  const i6 = evaluable.length === 0
    ? "SKIP"
    : evaluable.every(
      (item) =>
        item.groundingStatus === "grounded"
        && item.materialUnsupportedClaims.length === 0,
    )
      ? "PASS"
      : "FAIL";

  return {
    "I-MT-1": i1,
    "I-MT-2": i2,
    "I-MT-3": i3,
    "I-MT-4": i4,
    "I-MT-5": i5,
    "I-MT-6": i6,
  };
}

/**
 * Multi-turn 4 probes를 순차 실행한다.
 * retry / parallel 없음.
 */
export async function verifyVNextLiveMultiTurnAnswerSemanticGate():
  Promise<VNextLiveMultiTurnAnswerSemanticGateVerificationResult>
{
  const contract = verifyConsultingLiveAnswerSemanticGateContract();

  if (!contract.passed) {
    const failed = Object.entries(contract.checks)
      .filter(([, value]) => value === false)
      .map(([key]) => key)
      .join(", ");

    throw new Error(
      "Semantic gate contract verification failed, so OpenAI was not called. "
      + failed,
    );
  }

  if (!isOpenAIResponseGatewayAvailable()) {
    throw new Error(
      "OPENAI_API_KEY is not set. "
      + "Inject .env.local into the shell before running "
      + "Multi-turn Live Answer Semantic Gate.",
    );
  }

  const gateway = createOpenAIResponseGateway();
  const probes: VNextLiveMultiTurnProbeCaseResult[] = [];

  for (
    const probe of VNEXT_LIVE_MULTI_TURN_ANSWER_SEMANTIC_GATE_PROBES
  ) {
    probes.push(await runMultiTurnProbe(probe, gateway));
  }

  const invariants = computeInvariants(probes);
  const invariantValues = Object.values(invariants);

  return {
    contractPassed: true,
    gatewayAvailable: true,
    probes,
    invariants,
    passed:
      probes.every((item) => item.passed)
      && invariantValues.every(
        (value) => value === "PASS" || value === "SKIP",
      )
      && invariantValues.some((value) => value === "PASS"),
    verdictMappingNote: MULTI_TURN_VERDICT_MAPPING_NOTE,
    limitations: LIMITATIONS,
  };
}

export function serializeVNextLiveMultiTurnAnswerSemanticGateResult(
  result: VNextLiveMultiTurnAnswerSemanticGateVerificationResult,
): string {
  const probeRows = result.probes.map((item) => ({
    probeId: item.probeId,
    kind: item.kind,
    expectedFollowUpType: item.expectedFollowUpType,
    observedFollowUpType: item.observedFollowUpType,
    classificationInstability: item.classificationInstability,
    initial: item.initial
      ? {
          question: item.initial.question,
          followUpType: item.initial.followUpType,
          pipelineMode: item.initial.pipelineMode,
          reuse: item.initial.reuse,
          responseActionType: item.initial.responseActionType,
          responseContext: item.initial.responseContext,
          answerSource: item.initial.answerSource,
          apiCallCount: item.initial.apiCallCount,
          assistantAnswerPreview: item.initial.assistantAnswerPreview,
          skippedSemanticGateReason:
            item.initial.skippedSemanticGateReason,
          semanticEvaluation: item.initial.semanticEvaluation
            ? {
                parseSucceeded:
                  item.initial.semanticEvaluation.parseSucceeded,
                passed: item.initial.semanticEvaluation.passed,
                targetAlignment:
                  item.initial.semanticEvaluation.targetAlignment,
                intentAlignment:
                  item.initial.semanticEvaluation.intentAlignment,
                topicAlignment:
                  item.initial.semanticEvaluation.topicAlignment,
                verdictAlignment:
                  item.initial.semanticEvaluation.verdictAlignment,
                groundingStatus:
                  item.initial.semanticEvaluation.groundingStatus,
                requiredContentCoverage:
                  item.initial.semanticEvaluation
                    .requiredContentCoverage,
                confidence: item.initial.semanticEvaluation.confidence,
              }
            : null,
        }
      : null,
    followUp: item.followUp
      ? {
          question: item.followUp.question,
          followUpType: item.followUp.followUpType,
          pipelineMode: item.followUp.pipelineMode,
          reuse: item.followUp.reuse,
          responseActionType: item.followUp.responseActionType,
          responseContext: item.followUp.responseContext,
          answerSource: item.followUp.answerSource,
          apiCallCount: item.followUp.apiCallCount,
          assistantAnswerPreview: item.followUp.assistantAnswerPreview,
          skippedSemanticGateReason:
            item.followUp.skippedSemanticGateReason,
          semanticEvaluation: item.followUp.semanticEvaluation,
        }
      : null,
    followUpType: item.followUpType,
    pipelineMode: item.pipelineMode,
    reuse: item.reuse,
    answerSource: item.answerSource,
    apiCallCount: item.apiCallCount,
    parseSucceeded: item.parseSucceeded,
    parseFailureReason: item.parseFailureReason,
    requiredContentCoverage: item.requiredContentCoverage,
    confidence: item.confidence,
    targetAlignment: item.targetAlignment,
    intentAlignment: item.intentAlignment,
    topicAlignment: item.topicAlignment,
    verdictAlignment: item.verdictAlignment,
    groundingStatus: item.groundingStatus,
    materialUnsupportedClaims: item.materialUnsupportedClaims,
    materialOmissions: item.materialOmissions,
    rationale: item.rationale,
    continuationInvariant: item.continuationInvariant,
    newQuestionAxesDifferFromInitial:
      item.newQuestionAxesDifferFromInitial,
    timeRefinementPeriodChanged: item.timeRefinementPeriodChanged,
    diagnostic: item.diagnostic,
    passed: item.passed,
  }));

  return JSON.stringify(
    {
      passed: result.passed,
      contractPassed: result.contractPassed,
      gatewayAvailable: result.gatewayAvailable,
      probes: probeRows,
      invariants: result.invariants,
      verdictMappingNote: result.verdictMappingNote,
      limitations: result.limitations,
    },
    null,
    2,
  );
}
