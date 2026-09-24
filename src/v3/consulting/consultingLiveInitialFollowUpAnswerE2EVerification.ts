import {
  CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
  CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,
  createInitialFollowUpAnswerE2ERequest,
  verifyConsultingInitialFollowUpAnswerE2E,
  type ConsultingInitialFollowUpAnswerE2EVerificationResult,
} from "./consultingInitialFollowUpAnswerE2EVerification.js";
import {
  requestConsultingSessionAnswer,
} from "./consultingSessionAnswerRequester.js";
import {
  buildConsultingSessionTurn,
  prepareConsultingSessionTurn,
} from "./consultingSessionTurnBuilder.js";
import {
  inspectConsultingLiveAnswer,
  type ConsultingLiveAnswerQualityCaseResult,
} from "./explanation/consultingLiveAnswerQualityVerification.js";
import {
  buildConsultingLiveAnswerSemanticGateEvaluationPrompt,
  inspectConsultingLiveAnswerSemanticGateJson,
  type ConsultingLiveAnswerSemanticGateCaseResult,
  type ConsultingLiveAnswerSemanticGateInspectResult,
} from "./explanation/consultingLiveAnswerSemanticGateVerification.js";
import {
  requestInitialConsultingAnswer,
} from "./initialConsultingAnswerRequester.js";
import {
  buildInitialConsultingExecution,
} from "./initialConsultingExecutionBuilder.js";
import {
  buildInitialConsultingSession,
} from "./initialConsultingSessionBuilder.js";
import {
  buildConsultingOpenAIRequest,
  type ConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter.js";

export const CONSULTING_LIVE_INITIAL_FOLLOW_UP_E2E_OPENAI_CALL_COUNT =
  4;

const LIVE_SESSION_ID =
  "session-live-initial-follow-up-e2e-001";

const LIVE_INITIAL_TURN_ID =
  "turn-live-initial-follow-up-e2e-001";

const LIVE_FOLLOW_UP_TURN_ID =
  "turn-live-initial-follow-up-e2e-002";

const LIVE_CREATED_AT =
  "2026-08-21T01:00:00+09:00";

const LIVE_FOLLOW_UP_PREPARED_AT =
  "2026-08-21T01:10:00+09:00";

const LIVE_FOLLOW_UP_CREATED_AT =
  "2026-08-21T01:11:00+09:00";

const LIVE_E2E_LIMITATIONS = [
  "이 E2E는 production Builder/Requester/Session 경로를 검증하지만 HTTP 인증, Supabase repository, questionSemanticInterpreter의 실제 OpenAI 호출은 포함하지 않는다.",
  "Semantic Gate는 동일 계열 모델 평가이며 인간 ground truth가 아니다.",
  "의미 검증 결과는 생산 차단기가 아니라 수동 검토 자료이다.",
] as const;

export type ConsultingLiveInitialFollowUpAnswerE2EStageResult = {
  liveInspection:
    ConsultingLiveAnswerQualityCaseResult;

  semanticGate:
    ConsultingLiveAnswerSemanticGateCaseResult;
};

export type ConsultingLiveInitialFollowUpAnswerE2EVerificationResult = {
  nonApiPassed:
    boolean;

  liveAttempted:
    boolean;

  expectedOpenAiCallCount:
    typeof CONSULTING_LIVE_INITIAL_FOLLOW_UP_E2E_OPENAI_CALL_COUNT;

  openaiCallCount:
    number;

  initial:
    ConsultingLiveInitialFollowUpAnswerE2EStageResult | null;

  followUp:
    ConsultingLiveInitialFollowUpAnswerE2EStageResult | null;

  sessionTurnCount:
    number | null;

  nonApiResult:
    ConsultingInitialFollowUpAnswerE2EVerificationResult;

  passed:
    boolean;

  limitations:
    readonly string[];
};

function describeFailedChecks(
  checks: Record<
    string,
    boolean
  >,
): string {
  return Object.entries(
    checks,
  )
    .filter(
      ([, value]) =>
        value === false,
    )
    .map(
      ([key]) =>
        key,
    )
    .join(
      ", ",
    );
}

function toSemanticGateCaseResult(
  input: {
    name: string;

    originalQuestion: string;

    verdict: string;

    finalDecision: string;
  },
  inspected:
    ConsultingLiveAnswerSemanticGateInspectResult,
): ConsultingLiveAnswerSemanticGateCaseResult {
  return {
    name:
      input.name,

    originalQuestion:
      input.originalQuestion,

    verdict:
      input.verdict,

    finalDecision:
      input.finalDecision,

    verdictAlignment:
      inspected.evaluation
        ?.verdictAlignment
      ?? null,

    targetAlignment:
      inspected.evaluation
        ?.targetAlignment
      ?? null,

    intentAlignment:
      inspected.evaluation
        ?.intentAlignment
      ?? null,

    topicAlignment:
      inspected.evaluation
        ?.topicAlignment
      ?? null,

    groundingStatus:
      inspected.evaluation
        ?.groundingStatus
      ?? null,

    materialUnsupportedClaims:
      inspected.evaluation
        ?.materialUnsupportedClaims
      ?? [],

    requiredContentCoverage:
      inspected.evaluation
        ?.requiredContentCoverage
      ?? null,

    materialOmissions:
      inspected.evaluation
        ?.materialOmissions
      ?? [],

    confidence:
      inspected.evaluation
        ?.confidence
      ?? null,

    rationale:
      inspected.evaluation
        ?.rationale
      ?? "",

    passed:
      inspected.passed,
  };
}

/**
 * 최초 상담 → 세션 생성 → 후속 상담 Live E2E.
 *
 * 기본 회귀·build에서는 실행하지 않는 수동 Execution 전용이다.
 * 비-API E2E가 실패하면 OpenAI를 호출하지 않는다.
 *
 * API 호출:
 * - 최초 답변 생성 1회
 * - 최초 답변 Semantic Gate 평가 1회
 * - 후속 답변 생성 1회
 * - 후속 답변 Semantic Gate 평가 1회
 * - 합계 4회, 순차 실행, 재시도·병렬 없음
 */
export async function verifyConsultingLiveInitialFollowUpAnswerE2E():
  Promise<
    ConsultingLiveInitialFollowUpAnswerE2EVerificationResult
  > {
  const nonApiResult =
    await verifyConsultingInitialFollowUpAnswerE2E();

  if (
    !nonApiResult.passed
  ) {
    return {
      nonApiPassed:
        false,

      liveAttempted:
        false,

      expectedOpenAiCallCount:
        CONSULTING_LIVE_INITIAL_FOLLOW_UP_E2E_OPENAI_CALL_COUNT,

      openaiCallCount:
        0,

      initial:
        null,

      followUp:
        null,

      sessionTurnCount:
        null,

      nonApiResult,

      passed:
        false,

      limitations:
        LIVE_E2E_LIMITATIONS,
    };
  }

  const request =
    createInitialFollowUpAnswerE2ERequest();

  const execution =
    buildInitialConsultingExecution(
      request,
    );

  const {
    requestConsultingAnswer,
  } = await import(
    "./openai/consultingOpenAIClient.js"
  );

  let openaiCallCount =
    0;

  const requestAnswerOnce = async (
    openAIRequest:
      ConsultingOpenAIRequest,
  ): Promise<string> => {
    openaiCallCount +=
      1;

    return requestConsultingAnswer(
      openAIRequest,
    );
  };

  const initialAssistantAnswer =
    await requestInitialConsultingAnswer(
      execution,
      requestAnswerOnce,
    );

  const initialInspection =
    inspectConsultingLiveAnswer({
      name:
        "live-initial-business-start",

      originalQuestion:
        request.question,

      verdict:
        execution
          .turnResult
          .decisionResult
          .verdict,

      finalDecision:
        execution
          .turnResult
          .explanationPayload
          .finalDecision,

      expectedSubjectTerms:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,

      answer:
        initialAssistantAnswer,
    });

  const initialSemanticGatePrompt =
    buildConsultingLiveAnswerSemanticGateEvaluationPrompt({
      originalQuestion:
        request.question,

      verdict:
        execution
          .turnResult
          .decisionResult
          .verdict,

      finalDecision:
        execution
          .turnResult
          .explanationPayload
          .finalDecision,

      decisionTarget:
        execution
          .turnResult
          .decisionResult
          .decisionTarget,

      intent:
        execution
          .turnResult
          .decisionResult
          .intent,

      topic:
        execution
          .turnResult
          .decisionResult
          .topic,

      sourceSystemPrompt:
        execution
          .turnResult
          .prompt
          .systemPrompt,

      sourceUserPrompt:
        execution
          .turnResult
          .prompt
          .userPrompt,

      assistantAnswer:
        initialAssistantAnswer,
    });

  const initialSemanticGateRaw =
    await requestAnswerOnce(
      buildConsultingOpenAIRequest(
        initialSemanticGatePrompt,
      ),
    );

  const initialSemanticGate =
    toSemanticGateCaseResult(
      {
        name:
          "live-initial-business-start",

        originalQuestion:
          request.question,

        verdict:
          execution
            .turnResult
            .decisionResult
            .verdict,

        finalDecision:
          execution
            .turnResult
            .explanationPayload
            .finalDecision,
      },
      inspectConsultingLiveAnswerSemanticGateJson(
        initialSemanticGateRaw,
      ),
    );

  const initialSession =
    buildInitialConsultingSession({
      sessionId:
        LIVE_SESSION_ID,

      initialTurnId:
        LIVE_INITIAL_TURN_ID,

      createdAt:
        LIVE_CREATED_AT,

      request,

      execution,

      assistantAnswer:
        initialAssistantAnswer,
    });

  const followUpPreparation =
    prepareConsultingSessionTurn({
      session:
        initialSession,

      kind:
        "followUp",

      question:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

      preparedAt:
        LIVE_FOLLOW_UP_PREPARED_AT,
    });

  const followUpAssistantAnswer =
    await requestConsultingSessionAnswer(
      followUpPreparation,
      requestAnswerOnce,
    );

  const followUpInspection =
    inspectConsultingLiveAnswer({
      name:
        "live-follow-up-business-start",

      originalQuestion:
        followUpPreparation
          .turnResult
          .questionReaderResult
          .originalQuestion,

      verdict:
        followUpPreparation
          .turnResult
          .decisionResult
          .verdict,

      finalDecision:
        followUpPreparation
          .turnResult
          .explanationPayload
          .finalDecision,

      expectedSubjectTerms:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,

      answer:
        followUpAssistantAnswer,
    });

  const followUpSemanticGatePrompt =
    buildConsultingLiveAnswerSemanticGateEvaluationPrompt({
      originalQuestion:
        followUpPreparation
          .turnResult
          .questionReaderResult
          .originalQuestion,

      verdict:
        followUpPreparation
          .turnResult
          .decisionResult
          .verdict,

      finalDecision:
        followUpPreparation
          .turnResult
          .explanationPayload
          .finalDecision,

      decisionTarget:
        followUpPreparation
          .turnResult
          .decisionResult
          .decisionTarget,

      intent:
        followUpPreparation
          .turnResult
          .decisionResult
          .intent,

      topic:
        followUpPreparation
          .turnResult
          .decisionResult
          .topic,

      sourceSystemPrompt:
        followUpPreparation
          .turnResult
          .prompt
          .systemPrompt,

      sourceUserPrompt:
        followUpPreparation
          .turnResult
          .prompt
          .userPrompt,

      assistantAnswer:
        followUpAssistantAnswer,
    });

  const followUpSemanticGateRaw =
    await requestAnswerOnce(
      buildConsultingOpenAIRequest(
        followUpSemanticGatePrompt,
      ),
    );

  const followUpSemanticGate =
    toSemanticGateCaseResult(
      {
        name:
          "live-follow-up-business-start",

        originalQuestion:
          followUpPreparation
            .turnResult
            .questionReaderResult
            .originalQuestion,

        verdict:
          followUpPreparation
            .turnResult
            .decisionResult
            .verdict,

        finalDecision:
          followUpPreparation
            .turnResult
            .explanationPayload
            .finalDecision,
      },
      inspectConsultingLiveAnswerSemanticGateJson(
        followUpSemanticGateRaw,
      ),
    );

  const followUpSession =
    buildConsultingSessionTurn({
      session:
        initialSession,

      preparation:
        followUpPreparation,

      turnId:
        LIVE_FOLLOW_UP_TURN_ID,

      createdAt:
        LIVE_FOLLOW_UP_CREATED_AT,

      assistantAnswer:
        followUpAssistantAnswer,
    });

  const passed =
    openaiCallCount
      === CONSULTING_LIVE_INITIAL_FOLLOW_UP_E2E_OPENAI_CALL_COUNT
    && initialInspection.passed
    && initialSemanticGate.passed
    && followUpInspection.passed
    && followUpSemanticGate.passed
    && followUpSession.turns.length
      === 2
    && followUpSession
      .turns[0]
      .assistantAnswer
    === initialAssistantAnswer
    && followUpSession
      .turns[1]
      .assistantAnswer
    === followUpAssistantAnswer;

  return {
    nonApiPassed:
      true,

    liveAttempted:
      true,

    expectedOpenAiCallCount:
      CONSULTING_LIVE_INITIAL_FOLLOW_UP_E2E_OPENAI_CALL_COUNT,

    openaiCallCount,

    initial: {
      liveInspection:
        initialInspection,

      semanticGate:
        initialSemanticGate,
    },

    followUp: {
      liveInspection:
        followUpInspection,

      semanticGate:
        followUpSemanticGate,
    },

    sessionTurnCount:
      followUpSession
        .turns
        .length,

    nonApiResult,

    passed,

    limitations:
      LIVE_E2E_LIMITATIONS,
  };
}

export function describeConsultingLiveInitialFollowUpAnswerE2EFailure(
  result:
    ConsultingLiveInitialFollowUpAnswerE2EVerificationResult,
): string {
  if (
    !result.nonApiPassed
  ) {
    return (
      "Non-API initial follow-up E2E failed, so OpenAI was not called. "
      + describeFailedChecks(
        result.nonApiResult.checks,
      )
    );
  }

  return [
    `openaiCallCount=${result.openaiCallCount}`,
    result.initial
      ?.liveInspection
      .passed
      === false
      ? "initial live inspection failed"
      : "",
    result.initial
      ?.semanticGate
      .passed
      === false
      ? "initial semantic gate failed"
      : "",
    result.followUp
      ?.liveInspection
      .passed
      === false
      ? "follow-up live inspection failed"
      : "",
    result.followUp
      ?.semanticGate
      .passed
      === false
      ? "follow-up semantic gate failed"
      : "",
  ]
    .filter(
      Boolean,
    )
    .join(
      "; ",
    );
}
