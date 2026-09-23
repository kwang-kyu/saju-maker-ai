/**
 * Cross-state conversation matrix verification.
 *
 * Production path: runVNextConversationPipeline + createMockResponseGateway.
 * CASE-3 additionally uses VNextConsultingController + throwing gateway so
 * hard error hits the real Controller phase="error" path (not simulateError).
 *
 * This file owns CASE definitions, a shared sequential turn runner, and
 * CASE-3 / CASE-4 / CASE-5 / CASE-6 / CASE-7 verification.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  runVNextConversationPipeline,
  type VNextConversationPipelineResult,
} from "../conversation/conversationPipeline.js";
import type {
  ConversationSession,
} from "../conversation/conversationSession.js";
import {
  createMockResponseGateway,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseGenerationOptions,
  ResponseGenerationResult,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponseStreamListener,
} from "../gpt/responseStreamingTypes.js";
import {
  VNextConsultingController,
} from "../ui/vNextConsultingController.js";

export type CrossStateCaseId =
  | "CASE-3"
  | "CASE-4"
  | "CASE-5"
  | "CASE-6"
  | "CASE-7";

export type CrossStateAssertionResult = {
  id: string;
  description: string;
  passed: boolean;
  detail: string;
};

export type CrossStateCaseResult = {
  id: CrossStateCaseId;
  title: string;
  passed: boolean;
  assertions: CrossStateAssertionResult[];
  details: string[];
};

export type ConversationCrossStateMatrixVerificationResult = {
  passed: boolean;
  cases: CrossStateCaseResult[];
};

type CrossStateTurnDefinition = {
  question: string;
};

type CrossStateCaseDefinition = {
  id: CrossStateCaseId;
  title: string;
  description: string;
  /**
   * When false, the case is reserved for future matrix expansion and is skipped.
   */
  enabled: boolean;
  turns: CrossStateTurnDefinition[];
};

/**
 * Matrix skeleton for CASE-3..7.
 * CASE-3..7 are all enabled in this step.
 */
export const CROSS_STATE_CASE_DEFINITIONS: readonly CrossStateCaseDefinition[] = [
  {
    id: "CASE-3",
    title: "clarification 중 error/retry",
    description:
      "clarification 중 hard error → retry가 clarification session 상태를 보존하는지 검증한다.",
    enabled: true,
    turns: [
      { question: "상대방과 궁합은 어떤가요?" },
      { question: "1988년 5월 10일" },
      { question: "양력" },
      { question: "여성" },
    ],
  },
  {
    id: "CASE-4",
    title: "follow-up → clarification",
    description:
      "continuation follow-up 이후 newQuestion이 clarification으로 진입하는지 검증한다.",
    enabled: true,
    turns: [
      { question: "10월 금전운은?" },
      { question: "조금 더 자세히 말해줘" },
      { question: "상대방과 궁합은 어떤가요?" },
    ],
  },
  {
    id: "CASE-5",
    title: "clarification 완료 직후 scenario refinement",
    description:
      "궁합 clarification 완료 직후 scenarioRefinement로 교차 전이하는지 검증한다.",
    enabled: true,
    turns: [
      { question: "상대방과 궁합은 어떤가요?" },
      { question: "1988년 5월 10일" },
      { question: "양력" },
      { question: "여성" },
      { question: "그럼 조건을 다르게 하면?" },
    ],
  },
  {
    id: "CASE-6",
    title: "time refinement → clarification",
    description:
      "timeRefinement 이후 newQuestion이 clarification으로 교차 전이하는지 검증한다.",
    enabled: true,
    turns: [
      { question: "10월 금전운은?" },
      { question: "그러면 10월 중순은?" },
      { question: "상대방과 궁합은 어떤가요?" },
    ],
  },
  {
    id: "CASE-7",
    title: "topic switch → continuous follow-up",
    description:
      "money → career topic switch 이후 continuation이 Q2 career context를 기준으로 이어지는지 검증한다.",
    enabled: true,
    turns: [
      { question: "10월 금전운은?" },
      { question: "그러면 이직은 어때?" },
      { question: "조금 더 자세히 말해줘" },
    ],
  },
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

function assertion(
  id: string,
  description: string,
  passed: boolean,
  detail: string,
): CrossStateAssertionResult {
  return {
    id,
    description,
    passed,
    detail,
  };
}

function pendingIncludesBirthDate(
  pendingMissingContextKeys: readonly string[],
): boolean {
  // Minimal cross-state check only — do not re-assert the full birth-data key set.
  return pendingMissingContextKeys.some((key) =>
    /birthDate/i.test(key),
  );
}

function isCompatibilityFamilyDomain(
  domain: string | null | undefined,
): boolean {
  return domain === "compatibility"
    || domain === "relationship"
    || domain === "marriage";
}

function isNormalConsultingResponseSource(
  source: string | null | undefined,
): boolean {
  return source === "gpt"
    || source === "direct"
    || source === "fallback";
}

function pendingIncludesGender(
  pendingMissingContextKeys: readonly string[],
): boolean {
  return pendingMissingContextKeys.some((key) =>
    /gender/i.test(key),
  );
}

type Case3SwitchableGateway = ResponseGateway & {
  getCallRecord: () => ReturnType<
    ReturnType<typeof createMockResponseGateway>["getCallRecord"]
  >;
  setThrowing: (throwing: boolean) => void;
};

/**
 * Hard-error injection for CASE-3.
 * Throws (does not simulateError) so Controller catch → phase="error".
 * Keeps getCallRecord so pipeline treats this as Mock (no Interpreter).
 */
function createCase3SwitchableGateway(): Case3SwitchableGateway {
  const underlying = createMockResponseGateway();
  let throwing = false;

  return {
    setThrowing(nextThrowing: boolean): void {
      throwing = nextThrowing;
    },
    getCallRecord: () => underlying.getCallRecord(),
    async generate(
      prompt: ResponsePrompt,
      options?: ResponseGenerationOptions,
    ): Promise<ResponseGenerationResult> {
      if (throwing) {
        throw new Error("CASE-3 hard gateway error");
      }

      return underlying.generate(prompt, options);
    },
    async generateStream(
      prompt: ResponsePrompt,
      options: ResponseGenerationOptions | undefined,
      listener: ResponseStreamListener,
    ): Promise<ResponseGenerationResult> {
      if (throwing) {
        throw new Error("CASE-3 hard gateway error");
      }

      return underlying.generateStream!(prompt, options, listener);
    },
  };
}

/**
 * Runs turns sequentially on one session. Never parallelize turns.
 */
async function runSequentialTurns(
  turns: readonly CrossStateTurnDefinition[],
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<VNextConversationPipelineResult[]> {
  const results: VNextConversationPipelineResult[] = [];
  let session: ConversationSession | undefined;

  for (const turn of turns) {
    const result = await runVNextConversationPipeline({
      session,
      question: turn.question,
      input: {
        request: buildVerificationRequest(turn.question),
        gateway,
      },
    });

    results.push(result);
    session = result.session;
  }

  return results;
}

async function runAndVerifyCase3(): Promise<CrossStateCaseResult> {
  const q1Question = "상대방과 궁합은 어떤가요?";
  const q2Question = "1988년 5월 10일";
  const q3Question = "양력";
  const q4Question = "여성";

  // A1–A3: same production pipeline path as other matrix cases.
  const pipelineGateway = createMockResponseGateway();
  const pipelineResults = await runSequentialTurns(
    [
      { question: q1Question },
      { question: q2Question },
      { question: q3Question },
    ],
    pipelineGateway,
  );
  const pipelineQ1 = pipelineResults[0];
  const pipelineQ2 = pipelineResults[1];
  const pipelineQ3 = pipelineResults[2];
  const pipelineQ3Pending =
    pipelineQ3?.session.contextMetadata.pendingMissingContextKeys ?? [];

  // Hard error → retry must go through Controller (phase="error"), not simulateError.
  const gateway = createCase3SwitchableGateway();
  const controller = new VNextConsultingController({ gateway });

  await controller.submitQuestion(buildVerificationRequest(q1Question));
  await controller.submitFollowUpQuestion(
    q2Question,
    buildVerificationRequest(q2Question),
  );
  await controller.submitFollowUpQuestion(
    q3Question,
    buildVerificationRequest(q3Question),
  );

  const afterQ3State = controller.getState();
  const afterQ3Session = controller.getConversationSession();
  const afterQ3Pending =
    afterQ3Session?.contextMetadata.pendingMissingContextKeys ?? [];
  const afterQ3SessionId = afterQ3Session?.sessionId ?? null;
  const afterQ3SessionTurnCount = afterQ3Session?.turns.length ?? 0;
  const afterQ3UiTurnCount = afterQ3State.turns.length;
  const afterQ3Awaiting =
    afterQ3Session?.contextMetadata.awaitingClarification === true;
  const afterQ3Facts = afterQ3Session?.contextMetadata.counterpartFacts;

  gateway.setThrowing(true);
  await controller.submitFollowUpQuestion(
    q4Question,
    buildVerificationRequest(q4Question),
  );

  const afterErrorState = controller.getState();
  const afterErrorSession = controller.getConversationSession();
  const afterErrorPending =
    afterErrorSession?.contextMetadata.pendingMissingContextKeys ?? [];
  const failedQ4SessionCount = (
    afterErrorSession?.turns ?? []
  ).filter((turn) => turn.question === q4Question).length;
  const failedQ4UiCount = afterErrorState.turns.filter(
    (turn) => turn.question === q4Question,
  ).length;

  gateway.setThrowing(false);
  await controller.submitFollowUpQuestion(
    q4Question,
    buildVerificationRequest(q4Question),
  );

  const afterRetryState = controller.getState();
  const afterRetrySession = controller.getConversationSession();
  const afterRetryPending =
    afterRetrySession?.contextMetadata.pendingMissingContextKeys ?? [];
  const afterRetryFacts =
    afterRetrySession?.contextMetadata.counterpartFacts;
  const q4SuccessSessionTurns = (
    afterRetrySession?.turns ?? []
  ).filter((turn) => turn.question === q4Question);
  const q4SuccessUiTurns = afterRetryState.turns.filter(
    (turn) => turn.question === q4Question,
  );
  const lastSessionTurn = afterRetrySession?.turns[
    (afterRetrySession.turns.length ?? 0) - 1
  ];
  const lastUiTurn = afterRetryState.turns[
    afterRetryState.turns.length - 1
  ];
  const retryResponseSource =
    lastUiTurn?.response?.source
    ?? lastSessionTurn?.response?.source
    ?? null;

  const sessionPreservedAtQ3 =
    afterErrorSession !== null
    && afterQ3Session !== null
    && afterErrorSession.sessionId === afterQ3SessionId
    && afterErrorSession.turns.length === afterQ3SessionTurnCount
    && afterErrorState.turns.length === afterQ3UiTurnCount
    && failedQ4SessionCount === 0
    && failedQ4UiCount === 0;

  const counterpartFactsRetained =
    afterRetryFacts?.birthDate != null
    && afterRetryFacts.calendarType != null
    && afterRetryFacts.gender != null
    && (
      afterQ3Facts?.birthDate == null
      || afterRetryFacts.birthDate === afterQ3Facts.birthDate
    )
    && (
      afterQ3Facts?.calendarType == null
      || afterRetryFacts.calendarType === afterQ3Facts.calendarType
    );

  const assertions: CrossStateAssertionResult[] = [
    assertion(
      "A1",
      "Q1 → initial",
      pipelineQ1?.followUpType === "initial",
      `followUpType=${pipelineQ1?.followUpType ?? "none"}`,
    ),
    assertion(
      "A2",
      "Q2/Q3 → clarificationAnswer",
      pipelineQ2?.followUpType === "clarificationAnswer"
        && pipelineQ3?.followUpType === "clarificationAnswer",
      `q2=${pipelineQ2?.followUpType ?? "none"}; q3=${pipelineQ3?.followUpType ?? "none"}`,
    ),
    assertion(
      "A3",
      "Q3 종료 상태가 clarification pending",
      afterQ3Awaiting === true
        && pendingIncludesGender(afterQ3Pending)
        && pipelineQ3?.session.contextMetadata.awaitingClarification === true
        && pendingIncludesGender(pipelineQ3Pending),
      `awaitingClarification=${afterQ3Awaiting}; pending=${afterQ3Pending.join(",") || "none"}`,
    ),
    assertion(
      "A4",
      "Q4 첫 실행 → hard error",
      afterErrorState.phase === "error"
        && typeof afterErrorState.errorMessage === "string"
        && afterErrorState.errorMessage.length > 0,
      `phase=${afterErrorState.phase}; errorMessage=${afterErrorState.errorMessage ?? "none"}`,
    ),
    assertion(
      "A5",
      "error phase 확인",
      afterErrorState.phase === "error",
      `phase=${afterErrorState.phase}`,
    ),
    assertion(
      "A6",
      "Q4 실패 turn 미append",
      failedQ4SessionCount === 0 && failedQ4UiCount === 0,
      `sessionQ4Count=${failedQ4SessionCount}; uiQ4Count=${failedQ4UiCount}; sessionTurns=${afterErrorSession?.turns.length ?? 0}; uiTurns=${afterErrorState.turns.length}`,
    ),
    assertion(
      "A7",
      "Q3 session state 보존",
      sessionPreservedAtQ3 === true,
      `sessionId=${afterErrorSession?.sessionId ?? "none"}; sessionTurns=${afterErrorSession?.turns.length ?? 0}; uiTurns=${afterErrorState.turns.length}; q3SessionTurns=${afterQ3SessionTurnCount}`,
    ),
    assertion(
      "A8",
      "awaitingClarification 보존",
      afterErrorSession?.contextMetadata.awaitingClarification === true
        && afterErrorState.awaitingClarification === true,
      `sessionAwaiting=${afterErrorSession?.contextMetadata.awaitingClarification ?? false}; stateAwaiting=${afterErrorState.awaitingClarification}`,
    ),
    assertion(
      "A9",
      "pending gender 보존",
      pendingIncludesGender(afterErrorPending),
      `pendingMissingContextKeys=${afterErrorPending.join(",") || "none"}`,
    ),
    assertion(
      "A10",
      "errorMessage 존재",
      typeof afterErrorState.errorMessage === "string"
        && afterErrorState.errorMessage.length > 0,
      `errorMessage=${afterErrorState.errorMessage ?? "none"}`,
    ),
    assertion(
      "A11",
      "Q4 retry → completed",
      afterRetryState.phase === "completed",
      `phase=${afterRetryState.phase}`,
    ),
    assertion(
      "A12",
      "awaitingClarification → false",
      afterRetrySession?.contextMetadata.awaitingClarification === false
        && afterRetryState.awaitingClarification === false,
      `sessionAwaiting=${afterRetrySession?.contextMetadata.awaitingClarification ?? false}; stateAwaiting=${afterRetryState.awaitingClarification}`,
    ),
    assertion(
      "A13",
      "pending → []",
      afterRetryPending.length === 0,
      `pendingMissingContextKeys=${afterRetryPending.join(",") || "none"}`,
    ),
    assertion(
      "A14",
      "counterpartFacts 유지",
      counterpartFactsRetained === true,
      `birthDate=${afterRetryFacts?.birthDate ?? "none"}; calendarType=${afterRetryFacts?.calendarType ?? "none"}; gender=${afterRetryFacts?.gender ?? "none"}`,
    ),
    assertion(
      "A15",
      "Q4 성공 turn 정상 append",
      afterRetrySession?.turns.length === 4
        && afterRetryState.turns.length === 4
        && q4SuccessSessionTurns.length === 1
        && q4SuccessUiTurns.length === 1
        && lastSessionTurn?.question === q4Question
        && isNormalConsultingResponseSource(retryResponseSource),
      `sessionTurns=${afterRetrySession?.turns.length ?? 0}; uiTurns=${afterRetryState.turns.length}; responseSource=${retryResponseSource ?? "none"}`,
    ),
    assertion(
      "A16",
      "실패 Q4 중복 append 없음",
      q4SuccessSessionTurns.length === 1
        && q4SuccessUiTurns.length === 1
        && afterRetrySession?.turns.length === 4
        && afterRetryState.turns.length === 4,
      `sessionQ4Count=${q4SuccessSessionTurns.length}; uiQ4Count=${q4SuccessUiTurns.length}; sessionTurns=${afterRetrySession?.turns.length ?? 0}`,
    ),
  ];

  return {
    id: "CASE-3",
    title: "clarification 중 error/retry",
    passed: assertions.every((item) => item.passed),
    assertions,
    details: [
      `q1FollowUpType=${pipelineQ1?.followUpType ?? "none"}`,
      `q2FollowUpType=${pipelineQ2?.followUpType ?? "none"}`,
      `q3FollowUpType=${pipelineQ3?.followUpType ?? "none"}`,
      `afterQ3Awaiting=${afterQ3Awaiting}`,
      `afterQ3Pending=${afterQ3Pending.join(",") || "none"}`,
      `afterErrorPhase=${afterErrorState.phase}`,
      `afterErrorAwaiting=${afterErrorSession?.contextMetadata.awaitingClarification ?? false}`,
      `afterErrorPending=${afterErrorPending.join(",") || "none"}`,
      `afterErrorSessionTurns=${afterErrorSession?.turns.length ?? 0}`,
      `afterErrorUiTurns=${afterErrorState.turns.length}`,
      `errorMessage=${afterErrorState.errorMessage ?? "none"}`,
      `afterRetryPhase=${afterRetryState.phase}`,
      `afterRetryAwaiting=${afterRetrySession?.contextMetadata.awaitingClarification ?? false}`,
      `afterRetryPending=${afterRetryPending.join(",") || "none"}`,
      `afterRetrySessionTurns=${afterRetrySession?.turns.length ?? 0}`,
      `afterRetryUiTurns=${afterRetryState.turns.length}`,
      `retryResponseSource=${retryResponseSource ?? "none"}`,
      `retryBirthDate=${afterRetryFacts?.birthDate ?? "none"}`,
      `retryCalendarType=${afterRetryFacts?.calendarType ?? "none"}`,
      `retryGender=${afterRetryFacts?.gender ?? "none"}`,
      `sessionId=${afterRetrySession?.sessionId ?? "none"}`,
    ],
  };
}

function verifyCase4(
  results: readonly VNextConversationPipelineResult[],
): CrossStateCaseResult {
  const q1 = results[0];
  const q2 = results[1];
  const q3 = results[2];

  const pending = q3?.session.contextMetadata.pendingMissingContextKeys ?? [];
  const sessionIdStable =
    q1 !== undefined
    && q2 !== undefined
    && q3 !== undefined
    && q1.session.sessionId === q2.session.sessionId
    && q2.session.sessionId === q3.session.sessionId;

  // Prefer reusePlan contract when present; otherwise observe executed reuse flags.
  const reuseAssessmentBlocked =
    q3 !== undefined
    && q3.executionMetadata.reused.assessment === false
    && (
      q3.reusePlan === null
      || q3.reusePlan.reuseAssessment === false
    );

  const assertions: CrossStateAssertionResult[] = [
    assertion(
      "A1",
      "Q1 → initial",
      q1?.followUpType === "initial",
      `followUpType=${q1?.followUpType ?? "none"}`,
    ),
    assertion(
      "A2",
      "Q2 → continuation",
      q2?.followUpType === "continuation",
      `followUpType=${q2?.followUpType ?? "none"}`,
    ),
    assertion(
      "A3",
      "Q3 → newQuestion",
      q3?.followUpType === "newQuestion",
      `followUpType=${q3?.followUpType ?? "none"}`,
    ),
    assertion(
      "A4",
      "Q3 response.source === clarification",
      q3?.response.source === "clarification",
      `responseSource=${q3?.response.source ?? "none"}`,
    ),
    assertion(
      "A5",
      "Q3 awaitingClarification === true",
      q3?.session.contextMetadata.awaitingClarification === true,
      `awaitingClarification=${q3?.session.contextMetadata.awaitingClarification ?? false}`,
    ),
    assertion(
      "A6",
      "Q3 pendingMissingContextKeys includes birthDate",
      pendingIncludesBirthDate(pending),
      `pendingMissingContextKeys=${pending.join(",") || "none"}`,
    ),
    assertion(
      "A7",
      "Q3 originalQuestion === 상대방과 궁합은 어떤가요?",
      q3?.session.contextMetadata.originalQuestion
        === "상대방과 궁합은 어떤가요?",
      `originalQuestion=${q3?.session.contextMetadata.originalQuestion ?? "none"}`,
    ),
    assertion(
      "A8",
      "session.turns.length === 3",
      q3?.session.turns.length === 3,
      `turns=${q3?.session.turns.length ?? 0}`,
    ),
    assertion(
      "A9",
      "동일 CASE에서 sessionId 유지",
      sessionIdStable,
      `sessionIds=${[
        q1?.session.sessionId ?? "none",
        q2?.session.sessionId ?? "none",
        q3?.session.sessionId ?? "none",
      ].join(" | ")}`,
    ),
    assertion(
      "A10",
      "Q3에서 이전 money assessment 재사용 금지",
      reuseAssessmentBlocked === true,
      `reusePlan.reuseAssessment=${q3?.reusePlan?.reuseAssessment ?? "null"}; reused.assessment=${q3?.executionMetadata.reused.assessment ?? false}`,
    ),
  ];

  return {
    id: "CASE-4",
    title: "follow-up → clarification",
    passed: assertions.every((item) => item.passed),
    assertions,
    details: [
      `q1FollowUpType=${q1?.followUpType ?? "none"}`,
      `q2FollowUpType=${q2?.followUpType ?? "none"}`,
      `q3FollowUpType=${q3?.followUpType ?? "none"}`,
      `q3ResponseSource=${q3?.response.source ?? "none"}`,
      `q3AwaitingClarification=${q3?.session.contextMetadata.awaitingClarification ?? false}`,
      `q3Pending=${pending.join(",") || "none"}`,
      `q3OriginalQuestion=${q3?.session.contextMetadata.originalQuestion ?? "none"}`,
      `turns=${q3?.session.turns.length ?? 0}`,
      `sessionId=${q3?.session.sessionId ?? "none"}`,
      `reusePlanReuseAssessment=${q3?.reusePlan?.reuseAssessment ?? "null"}`,
      `reusedAssessment=${q3?.executionMetadata.reused.assessment ?? false}`,
    ],
  };
}

function verifyCase5(
  results: readonly VNextConversationPipelineResult[],
): CrossStateCaseResult {
  const q1 = results[0];
  const q2 = results[1];
  const q3 = results[2];
  const q4 = results[3];
  const q5 = results[4];

  const q4Pending = q4?.session.contextMetadata.pendingMissingContextKeys ?? [];
  const q4Domain = q4?.turn.questionMeaning?.domain ?? null;
  // Q5 literal re-read may be "general"; compatibility context lives on session/prior turn.
  const q5OriginalQuestion =
    q5?.session.contextMetadata.originalQuestion ?? null;
  const q5CounterpartBirthDate =
    q5?.session.contextMetadata.counterpartFacts?.birthDate ?? null;

  const sessionIdStable =
    q1 !== undefined
    && q2 !== undefined
    && q3 !== undefined
    && q4 !== undefined
    && q5 !== undefined
    && q1.session.sessionId === q2.session.sessionId
    && q2.session.sessionId === q3.session.sessionId
    && q3.session.sessionId === q4.session.sessionId
    && q4.session.sessionId === q5.session.sessionId;

  const clarificationAnswers =
    q2?.followUpType === "clarificationAnswer"
    && q3?.followUpType === "clarificationAnswer"
    && q4?.followUpType === "clarificationAnswer";

  // Clarification complete = consulting response + no pending keys (not birth-key detail).
  const q4ClarificationComplete =
    q4 !== undefined
    && q4.session.contextMetadata.awaitingClarification === false
    && q4Pending.length === 0
    && isNormalConsultingResponseSource(q4.response.source);

  // Prefer reusePlan contract when present; otherwise observe executed reuse flags.
  const humanStateReuseContract =
    q5 !== undefined
    && q5.executionMetadata.reused.humanState === true
    && (
      q5.reusePlan === null
      || q5.reusePlan.reuseHumanState === true
    );

  const assessmentReuseBlocked =
    q5 !== undefined
    && q5.executionMetadata.reused.assessment === false
    && (
      q5.reusePlan === null
      || q5.reusePlan.reuseAssessment === false
    );

  const assessmentRefreshExecuted =
    q5 !== undefined
    && q5.executionMetadata.executedStages.includes("assessment:executed")
    && (
      q5.reusePlan === null
      || q5.reusePlan.requiresAssessmentRefresh === true
    );

  const requiresNewQuestionAnalysis =
    q5 !== undefined
    && q5.reusePlan !== null
    && q5.reusePlan.requiresNewQuestionAnalysis === true;

  // Same decision frame (scenarioRefinement) under the completed compatibility clarification.
  const scenarioRefinementOnCompatibility =
    q5?.followUpType === "scenarioRefinement"
    && q5OriginalQuestion === "상대방과 궁합은 어떤가요?"
    && isCompatibilityFamilyDomain(q4Domain)
    && q5CounterpartBirthDate !== null;

  const assertions: CrossStateAssertionResult[] = [
    assertion(
      "A1",
      "Q1 → initial",
      q1?.followUpType === "initial",
      `followUpType=${q1?.followUpType ?? "none"}`,
    ),
    assertion(
      "A2",
      "Q2~Q4 → clarificationAnswer",
      clarificationAnswers === true,
      `q2=${q2?.followUpType ?? "none"}; q3=${q3?.followUpType ?? "none"}; q4=${q4?.followUpType ?? "none"}`,
    ),
    assertion(
      "A3",
      "Q4 → clarification 완료",
      q4ClarificationComplete === true,
      `awaitingClarification=${q4?.session.contextMetadata.awaitingClarification ?? false}; pending=${q4Pending.join(",") || "none"}; responseSource=${q4?.response.source ?? "none"}`,
    ),
    assertion(
      "A4",
      "Q4 awaitingClarification === false",
      q4?.session.contextMetadata.awaitingClarification === false,
      `awaitingClarification=${q4?.session.contextMetadata.awaitingClarification ?? false}`,
    ),
    assertion(
      "A5",
      "Q5 → scenarioRefinement (compatibility context 유지)",
      scenarioRefinementOnCompatibility === true,
      `followUpType=${q5?.followUpType ?? "none"}; originalQuestion=${q5OriginalQuestion ?? "none"}; q4Domain=${q4Domain ?? "none"}; counterpartBirthDate=${q5CounterpartBirthDate ?? "none"}`,
    ),
    assertion(
      "A6",
      "Q5 awaitingClarification === false",
      q5?.session.contextMetadata.awaitingClarification === false,
      `awaitingClarification=${q5?.session.contextMetadata.awaitingClarification ?? false}`,
    ),
    assertion(
      "A7",
      "Q5 humanState reuse === true",
      humanStateReuseContract === true,
      `reusePlan.reuseHumanState=${q5?.reusePlan?.reuseHumanState ?? "null"}; reused.humanState=${q5?.executionMetadata.reused.humanState ?? false}`,
    ),
    assertion(
      "A8",
      "Q5 assessment reuse === false",
      assessmentReuseBlocked === true,
      `reusePlan.reuseAssessment=${q5?.reusePlan?.reuseAssessment ?? "null"}; reused.assessment=${q5?.executionMetadata.reused.assessment ?? false}`,
    ),
    assertion(
      "A9",
      "Q5 assessment refresh/execution === true",
      assessmentRefreshExecuted === true,
      `requiresAssessmentRefresh=${q5?.reusePlan?.requiresAssessmentRefresh ?? "null"}; executedStages=${q5?.executionMetadata.executedStages.join(",") ?? "none"}`,
    ),
    assertion(
      "A10",
      "Q5 requiresNewQuestionAnalysis === true",
      requiresNewQuestionAnalysis === true,
      `requiresNewQuestionAnalysis=${q5?.reusePlan?.requiresNewQuestionAnalysis ?? "null"}`,
    ),
    assertion(
      "A11",
      "session.turns.length === 5",
      q5?.session.turns.length === 5,
      `turns=${q5?.session.turns.length ?? 0}`,
    ),
    assertion(
      "A12",
      "동일 CASE에서 sessionId 유지",
      sessionIdStable,
      `sessionIds=${[
        q1?.session.sessionId ?? "none",
        q2?.session.sessionId ?? "none",
        q3?.session.sessionId ?? "none",
        q4?.session.sessionId ?? "none",
        q5?.session.sessionId ?? "none",
      ].join(" | ")}`,
    ),
  ];

  return {
    id: "CASE-5",
    title: "clarification 완료 직후 scenario refinement",
    passed: assertions.every((item) => item.passed),
    assertions,
    details: [
      `q1FollowUpType=${q1?.followUpType ?? "none"}`,
      `q2FollowUpType=${q2?.followUpType ?? "none"}`,
      `q3FollowUpType=${q3?.followUpType ?? "none"}`,
      `q4FollowUpType=${q4?.followUpType ?? "none"}`,
      `q5FollowUpType=${q5?.followUpType ?? "none"}`,
      `q4ResponseSource=${q4?.response.source ?? "none"}`,
      `q4AwaitingClarification=${q4?.session.contextMetadata.awaitingClarification ?? false}`,
      `q4Pending=${q4Pending.join(",") || "none"}`,
      `q5AwaitingClarification=${q5?.session.contextMetadata.awaitingClarification ?? false}`,
      `q5OriginalQuestion=${q5OriginalQuestion ?? "none"}`,
      `q4Domain=${q4Domain ?? "none"}`,
      `q5CounterpartBirthDate=${q5CounterpartBirthDate ?? "none"}`,
      `turns=${q5?.session.turns.length ?? 0}`,
      `sessionId=${q5?.session.sessionId ?? "none"}`,
      `reusePlanReuseHumanState=${q5?.reusePlan?.reuseHumanState ?? "null"}`,
      `reusedHumanState=${q5?.executionMetadata.reused.humanState ?? false}`,
      `reusePlanReuseAssessment=${q5?.reusePlan?.reuseAssessment ?? "null"}`,
      `reusedAssessment=${q5?.executionMetadata.reused.assessment ?? false}`,
      `requiresAssessmentRefresh=${q5?.reusePlan?.requiresAssessmentRefresh ?? "null"}`,
      `requiresNewQuestionAnalysis=${q5?.reusePlan?.requiresNewQuestionAnalysis ?? "null"}`,
      `executedStages=${q5?.executionMetadata.executedStages.join(",") ?? "none"}`,
    ],
  };
}

function verifyCase6(
  results: readonly VNextConversationPipelineResult[],
): CrossStateCaseResult {
  const q1 = results[0];
  const q2 = results[1];
  const q3 = results[2];

  const pending = q3?.session.contextMetadata.pendingMissingContextKeys ?? [];
  const q3Domain = q3?.turn.questionMeaning?.domain ?? null;
  const sessionIdStable =
    q1 !== undefined
    && q2 !== undefined
    && q3 !== undefined
    && q1.session.sessionId === q2.session.sessionId
    && q2.session.sessionId === q3.session.sessionId;

  // Prefer reusePlan contract when present; otherwise observe executed reuse flags.
  const reuseAssessmentBlocked =
    q3 !== undefined
    && q3.executionMetadata.reused.assessment === false
    && (
      q3.reusePlan === null
      || q3.reusePlan.reuseAssessment === false
    );

  const assertions: CrossStateAssertionResult[] = [
    assertion(
      "A1",
      "Q1 → initial",
      q1?.followUpType === "initial",
      `followUpType=${q1?.followUpType ?? "none"}`,
    ),
    assertion(
      "A2",
      "Q2 → timeRefinement",
      q2?.followUpType === "timeRefinement",
      `followUpType=${q2?.followUpType ?? "none"}`,
    ),
    assertion(
      "A3",
      "Q3 → newQuestion",
      q3?.followUpType === "newQuestion",
      `followUpType=${q3?.followUpType ?? "none"}`,
    ),
    assertion(
      "A4",
      "Q3 response.source === clarification",
      q3?.response.source === "clarification",
      `responseSource=${q3?.response.source ?? "none"}`,
    ),
    assertion(
      "A5",
      "Q3 awaitingClarification === true",
      q3?.session.contextMetadata.awaitingClarification === true,
      `awaitingClarification=${q3?.session.contextMetadata.awaitingClarification ?? false}`,
    ),
    assertion(
      "A6",
      "Q3 pendingMissingContextKeys includes counterpartBirthDate",
      pending.includes("counterpartBirthDate"),
      `pendingMissingContextKeys=${pending.join(",") || "none"}`,
    ),
    assertion(
      "A7",
      "Q3에서 이전 money assessment 재사용 금지",
      reuseAssessmentBlocked === true,
      `reusePlan.reuseAssessment=${q3?.reusePlan?.reuseAssessment ?? "null"}; reused.assessment=${q3?.executionMetadata.reused.assessment ?? false}`,
    ),
    assertion(
      "A8",
      "Q3 domain이 compatibility 계열로 전환",
      isCompatibilityFamilyDomain(q3Domain),
      `domain=${q3Domain ?? "none"}`,
    ),
    assertion(
      "A9",
      "session.turns.length === 3",
      q3?.session.turns.length === 3,
      `turns=${q3?.session.turns.length ?? 0}`,
    ),
    assertion(
      "A10",
      "동일 CASE에서 sessionId 유지",
      sessionIdStable,
      `sessionIds=${[
        q1?.session.sessionId ?? "none",
        q2?.session.sessionId ?? "none",
        q3?.session.sessionId ?? "none",
      ].join(" | ")}`,
    ),
  ];

  return {
    id: "CASE-6",
    title: "time refinement → clarification",
    passed: assertions.every((item) => item.passed),
    assertions,
    details: [
      `q1FollowUpType=${q1?.followUpType ?? "none"}`,
      `q2FollowUpType=${q2?.followUpType ?? "none"}`,
      `q3FollowUpType=${q3?.followUpType ?? "none"}`,
      `q3ResponseSource=${q3?.response.source ?? "none"}`,
      `q3AwaitingClarification=${q3?.session.contextMetadata.awaitingClarification ?? false}`,
      `q3Pending=${pending.join(",") || "none"}`,
      `q3Domain=${q3Domain ?? "none"}`,
      `turns=${q3?.session.turns.length ?? 0}`,
      `sessionId=${q3?.session.sessionId ?? "none"}`,
      `reusePlanReuseAssessment=${q3?.reusePlan?.reuseAssessment ?? "null"}`,
      `reusedAssessment=${q3?.executionMetadata.reused.assessment ?? false}`,
    ],
  };
}

function verifyCase7(
  results: readonly VNextConversationPipelineResult[],
): CrossStateCaseResult {
  const q1 = results[0];
  const q2 = results[1];
  const q3 = results[2];

  const q1TurnId = q1?.turn.turnId ?? null;
  const q2TurnId = q2?.turn.turnId ?? null;
  const q2Domain = q2?.turn.questionMeaning?.domain ?? null;
  const q3Domain =
    q3?.turn.questionMeaning?.domain
    ?? q3?.session.analysisCache.questionMeaning?.value.domain
    ?? q3?.session.analysisCache.questionMeaning?.reuseMetadata.questionDomain
    ?? null;
  // Q2-end snapshot — production rewrites sourceTurnId on every turn commit.
  const q2AssessmentSourceTurnId =
    q2?.session.analysisCache.assessment?.sourceTurnId ?? null;
  const q1AssessmentSourceTurnId =
    q1?.session.analysisCache.assessment?.sourceTurnId ?? null;

  const sessionIdStable =
    q1 !== undefined
    && q2 !== undefined
    && q3 !== undefined
    && q1.session.sessionId === q2.session.sessionId
    && q2.session.sessionId === q3.session.sessionId;

  // Continuation after topic switch must stay on Q2 career topic — not Q1 money.
  const continuationOnQ2Career =
    q2Domain === "career"
    && q3Domain === "career";

  // Prefer reusePlan contract when present; otherwise observe executed reuse flags.
  // Prove Q2 ownership via Q2-end sourceTurnId (post-Q3 cache id is always current turn).
  const reusesQ2Assessment =
    q3 !== undefined
    && q3.executionMetadata.reused.assessment === true
    && (
      q3.reusePlan === null
      || q3.reusePlan.reuseAssessment === true
    )
    && q2TurnId !== null
    && q2AssessmentSourceTurnId === q2TurnId;

  // Topic switch at Q2 must refresh assessment so Q1 money is not the reused base.
  const doesNotReuseQ1MoneyAssessment =
    q2 !== undefined
    && q2.executionMetadata.reused.assessment === false
    && (
      q2.reusePlan === null
      || q2.reusePlan.reuseAssessment === false
    )
    && q1AssessmentSourceTurnId !== null
    && q2AssessmentSourceTurnId !== null
    && q2AssessmentSourceTurnId !== q1AssessmentSourceTurnId;

  const humanStateReuseContract =
    q3 !== undefined
    && q3.executionMetadata.reused.humanState === true
    && (
      q3.reusePlan === null
      || q3.reusePlan.reuseHumanState === true
    );

  const assertions: CrossStateAssertionResult[] = [
    assertion(
      "A1",
      "Q1 → initial",
      q1?.followUpType === "initial",
      `followUpType=${q1?.followUpType ?? "none"}`,
    ),
    assertion(
      "A2",
      "Q2 → newQuestion",
      q2?.followUpType === "newQuestion",
      `followUpType=${q2?.followUpType ?? "none"}`,
    ),
    assertion(
      "A3",
      "Q3 → continuation",
      q3?.followUpType === "continuation",
      `followUpType=${q3?.followUpType ?? "none"}`,
    ),
    assertion(
      "A4",
      "Q3 continuation이 Q2 career topic 기준",
      continuationOnQ2Career === true,
      `q2Domain=${q2Domain ?? "none"}; q3Domain=${q3Domain ?? "none"}`,
    ),
    assertion(
      "A5",
      "Q3에서 Q2 assessment 재사용",
      reusesQ2Assessment === true,
      `reusePlan.reuseAssessment=${q3?.reusePlan?.reuseAssessment ?? "null"}; reused.assessment=${q3?.executionMetadata.reused.assessment ?? false}; q2AssessmentSourceTurnId=${q2AssessmentSourceTurnId ?? "none"}; q2TurnId=${q2TurnId ?? "none"}`,
    ),
    assertion(
      "A6",
      "Q3에서 Q1 money assessment 재사용 금지",
      doesNotReuseQ1MoneyAssessment === true,
      `q2ReusedAssessment=${q2?.executionMetadata.reused.assessment ?? false}; q1AssessmentSourceTurnId=${q1AssessmentSourceTurnId ?? "none"}; q2AssessmentSourceTurnId=${q2AssessmentSourceTurnId ?? "none"}`,
    ),
    assertion(
      "A7",
      "humanState reuse 계약",
      humanStateReuseContract === true,
      `reusePlan.reuseHumanState=${q3?.reusePlan?.reuseHumanState ?? "null"}; reused.humanState=${q3?.executionMetadata.reused.humanState ?? false}`,
    ),
    assertion(
      "A8",
      "session.turns.length === 3",
      q3?.session.turns.length === 3,
      `turns=${q3?.session.turns.length ?? 0}`,
    ),
    assertion(
      "A9",
      "동일 CASE에서 sessionId 유지",
      sessionIdStable,
      `sessionIds=${[
        q1?.session.sessionId ?? "none",
        q2?.session.sessionId ?? "none",
        q3?.session.sessionId ?? "none",
      ].join(" | ")}`,
    ),
    assertion(
      "A10",
      "Q3 response.source가 정상 consulting source",
      isNormalConsultingResponseSource(q3?.response.source),
      `responseSource=${q3?.response.source ?? "none"}`,
    ),
  ];

  return {
    id: "CASE-7",
    title: "topic switch → continuous follow-up",
    passed: assertions.every((item) => item.passed),
    assertions,
    details: [
      `q1FollowUpType=${q1?.followUpType ?? "none"}`,
      `q2FollowUpType=${q2?.followUpType ?? "none"}`,
      `q3FollowUpType=${q3?.followUpType ?? "none"}`,
      `q2Domain=${q2Domain ?? "none"}`,
      `q3Domain=${q3Domain ?? "none"}`,
      `q3ResponseSource=${q3?.response.source ?? "none"}`,
      `q1AssessmentSourceTurnId=${q1AssessmentSourceTurnId ?? "none"}`,
      `q2AssessmentSourceTurnId=${q2AssessmentSourceTurnId ?? "none"}`,
      `q1TurnId=${q1TurnId ?? "none"}`,
      `q2TurnId=${q2TurnId ?? "none"}`,
      `turns=${q3?.session.turns.length ?? 0}`,
      `sessionId=${q3?.session.sessionId ?? "none"}`,
      `reusePlanReuseAssessment=${q3?.reusePlan?.reuseAssessment ?? "null"}`,
      `reusedAssessment=${q3?.executionMetadata.reused.assessment ?? false}`,
      `q2ReusedAssessment=${q2?.executionMetadata.reused.assessment ?? false}`,
      `reusePlanReuseHumanState=${q3?.reusePlan?.reuseHumanState ?? "null"}`,
      `reusedHumanState=${q3?.executionMetadata.reused.humanState ?? false}`,
    ],
  };
}

async function runEnabledCase(
  definition: CrossStateCaseDefinition,
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<CrossStateCaseResult> {
  if (definition.id === "CASE-3") {
    return runAndVerifyCase3();
  }

  if (
    definition.id !== "CASE-4"
    && definition.id !== "CASE-5"
    && definition.id !== "CASE-6"
    && definition.id !== "CASE-7"
  ) {
    return {
      id: definition.id,
      title: definition.title,
      passed: false,
      assertions: [
        assertion(
          "UNSUPPORTED",
          "Case not implemented in this step",
          false,
          `enabled=${definition.enabled}`,
        ),
      ],
      details: ["not-implemented"],
    };
  }

  const results = await runSequentialTurns(definition.turns, gateway);
  if (definition.id === "CASE-4") {
    return verifyCase4(results);
  }
  if (definition.id === "CASE-5") {
    return verifyCase5(results);
  }
  if (definition.id === "CASE-6") {
    return verifyCase6(results);
  }
  return verifyCase7(results);
}

export async function verifyConversationCrossStateMatrix(): Promise<
  ConversationCrossStateMatrixVerificationResult
> {
  const gateway = createMockResponseGateway();
  const enabledCases = CROSS_STATE_CASE_DEFINITIONS.filter(
    (definition) => definition.enabled,
  );

  const cases: CrossStateCaseResult[] = [];

  // Cases also run sequentially so shared gateway state stays deterministic.
  for (const definition of enabledCases) {
    cases.push(await runEnabledCase(definition, gateway));
  }

  return {
    passed: cases.length > 0 && cases.every((item) => item.passed),
    cases,
  };
}

export function serializeConversationCrossStateMatrixVerificationResult(
  result: ConversationCrossStateMatrixVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
