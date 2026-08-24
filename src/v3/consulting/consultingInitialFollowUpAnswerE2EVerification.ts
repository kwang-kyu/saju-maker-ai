import {
  buildConsultingClarification,
} from "./consultingClarificationBuilder.js";
import {
  requestConsultingSessionAnswer,
} from "./consultingSessionAnswerRequester.js";
import {
  buildConsultingSessionOpenAIRequest,
} from "./consultingSessionOpenAIRequestBuilder.js";
import {
  buildConsultingSessionTurn,
  prepareConsultingSessionTurn,
  type ConsultingSessionTurnPreparation,
} from "./consultingSessionTurnBuilder.js";
import {
  hasExpectedSubjectTerms,
} from "./explanation/consultingAnswerQualityVerification.js";
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
  createSourceRequest,
} from "./initialConsultingSessionBuilderVerification.js";
import {
  buildConsultingOpenAIRequest,
  type ConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter.js";
import type {
  V3ConsultingRequest,
} from "./v3ConsultingRequest.js";

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION =
  "지금 새로운 사업을 시작해도 될까요?";

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS = [
  "사업",
  "시작",
] as const;

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID =
  "session-initial-follow-up-e2e-001";

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_INITIAL_TURN_ID =
  "turn-initial-follow-up-e2e-001";

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID =
  "turn-initial-follow-up-e2e-002";

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT =
  "2026-08-21T00:00:00+09:00";

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_PREPARED_AT =
  "2026-08-21T00:10:00+09:00";

export const CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT =
  "2026-08-21T00:11:00+09:00";

const HISTORY_REGION_TITLE =
  "이전 상담 이력 — 문맥 일관성 참고 전용";

const CURRENT_DECISION_REGION_TITLE =
  "현재 엔진 판정 — 이번 답변의 유일한 판단 기준";

const INITIAL_MOCK_ASSISTANT_ANSWER =
  "현재 엔진 판정에 따라 사업 시작 조건을 설명합니다. 최초 상담 전용 mock 답변입니다.";

const FOLLOW_UP_MOCK_ASSISTANT_ANSWER =
  "현재 엔진 판정에 따라 사업 시작의 조건과 위험을 설명합니다. 후속 상담 전용 mock 답변입니다.";

const HISTORY_INDEPENDENCE_ANSWER_A =
  "세션 A 전용 이전 답변입니다. 사업을 즉시 전면 확장하라고 단정한 문장입니다.";

const HISTORY_INDEPENDENCE_ANSWER_B =
  "세션 B 전용 이전 답변입니다. 자금을 전액 투입하라고 반대로 말한 문장입니다.";

const E2E_LIMITATIONS = [
  "이 E2E는 production Builder/Requester/Session 경로를 검증하지만 HTTP 인증, Supabase repository, questionSemanticInterpreter의 실제 OpenAI 호출은 포함하지 않는다.",
] as const;

export type ConsultingInitialFollowUpAnswerE2EVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  initial: {
    verdict:
      string;

    originalQuestion:
      string;

    finalDecision:
      string;

    requestCallCount:
      number;
  };

  followUp: {
    kind:
      string;

    verdict:
      string;

    originalQuestion:
      string;

    finalDecision:
      string;

    requestCallCount:
      number;
  };

  historyIndependence: {
    decisionResultIdentical:
      boolean;

    explanationPlanIdentical:
      boolean;

    explanationPayloadIdentical:
      boolean;

    groundingContextIdentical:
      boolean;

    conversationHistoryDiffersOnlyByPreviousAnswer:
      boolean;

    userPromptHistoryPortionDiffers:
      boolean;

    userPromptCurrentDecisionPortionIdentical:
      boolean;
  };

  mockCallCounts: {
    initialRequest:
      number;

    followUpRequest:
      number;
  };

  negativeControls:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;

  limitations:
    readonly string[];
};

export function createInitialFollowUpAnswerE2ERequest():
  V3ConsultingRequest {
  return {
    ...createSourceRequest(),

    question:
      CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
  };
}

async function actionRejects(
  action:
    () => Promise<unknown>,
): Promise<boolean> {
  try {
    await action();

    return false;
  } catch {
    return true;
  }
}

function sameJson(
  left:
    unknown,
  right:
    unknown,
): boolean {
  return JSON.stringify(
    left,
  )
    === JSON.stringify(
      right,
    );
}

function promptContainsValue(
  promptText:
    string,
  value:
    string,
): boolean {
  return promptText.includes(
    value,
  );
}

function splitSessionUserPrompt(
  userPrompt:
    string,
): {
  historyPortion:
    string;

  currentDecisionPortion:
    string;

  historyIndex:
    number;

  currentDecisionIndex:
    number;
} {
  const historyIndex =
    userPrompt.indexOf(
      HISTORY_REGION_TITLE,
    );

  const currentDecisionIndex =
    userPrompt.indexOf(
      CURRENT_DECISION_REGION_TITLE,
    );

  if (
    historyIndex < 0
    || currentDecisionIndex
      <= historyIndex
  ) {
    return {
      historyPortion:
        "",

      currentDecisionPortion:
        "",

      historyIndex,

      currentDecisionIndex,
    };
  }

  return {
    historyPortion:
      userPrompt.slice(
        historyIndex,
        currentDecisionIndex,
      ),

    currentDecisionPortion:
      userPrompt.slice(
        currentDecisionIndex,
      ),

    historyIndex,

    currentDecisionIndex,
  };
}

function turnResultOmitsPreviousAssistantAnswer(
  turnResult:
    ConsultingSessionTurnPreparation["turnResult"],
  previousAssistantAnswer:
    string,
): boolean {
  return JSON.stringify(
    turnResult,
  )
    .includes(
      previousAssistantAnswer,
    )
    === false;
}

function conversationHistoryWithoutAnswer(
  preparation:
    ConsultingSessionTurnPreparation,
) {
  return preparation
    .conversationHistory
    .map(
      (entry) => ({
        turnId:
          entry.turnId,

        sequence:
          entry.sequence,

        question:
          entry.question,
      }),
    );
}

/**
 * 최초 상담 → 세션 생성 → 후속 상담의
 * 생산 Builder/Requester 경로를 mock OpenAI로 검증한다.
 *
 * HTTP, Supabase, questionSemanticInterpreter 네트워크는
 * 포함하지 않는다.
 */
export async function verifyConsultingInitialFollowUpAnswerE2E():
  Promise<
    ConsultingInitialFollowUpAnswerE2EVerificationResult
  > {
  const request =
    createInitialFollowUpAnswerE2ERequest();

  const execution =
    buildInitialConsultingExecution(
      request,
    );

  const expectedInitialOpenAIRequest =
    buildConsultingOpenAIRequest(
      execution
        .turnResult
        .prompt,
    );

  const initialClarification =
    buildConsultingClarification({
      decisionTurnId:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_INITIAL_TURN_ID,

      lifeContext:
        execution.lifeContext,

      questionContext:
        execution
          .turnResult
          .questionContext,

      decisionResult:
        execution
          .turnResult
          .decisionResult,
    });

  const capturedInitialRequests:
    ConsultingOpenAIRequest[] =
      [];

  const initialAssistantAnswer =
    await requestInitialConsultingAnswer(
      execution,
      async (
        openAIRequest,
      ) => {
        capturedInitialRequests.push(
          openAIRequest,
        );

        return INITIAL_MOCK_ASSISTANT_ANSWER;
      },
    );

  const initialSession =
    buildInitialConsultingSession({
      sessionId:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,

      initialTurnId:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_INITIAL_TURN_ID,

      createdAt:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT,

      request,

      execution,

      assistantAnswer:
        initialAssistantAnswer,
    });

  let emptyInitialAnswerCallCount =
    0;

  const emptyInitialAnswerIsRejected =
    await actionRejects(
      () =>
        requestInitialConsultingAnswer(
          execution,
          async () => {
            emptyInitialAnswerCallCount +=
              1;

            return "   ";
          },
        ),
    );

  const followUpPreparation =
    prepareConsultingSessionTurn({
      session:
        initialSession,

      kind:
        "followUp",

      question:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

      preparedAt:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_PREPARED_AT,
    });

  const followUpClarification =
    buildConsultingClarification({
      decisionTurnId:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID,

      lifeContext:
        followUpPreparation
          .effectiveLifeContext,

      questionContext:
        followUpPreparation
          .turnResult
          .questionContext,

      decisionResult:
        followUpPreparation
          .turnResult
          .decisionResult,
    });

  const expectedFollowUpOpenAIRequest =
    buildConsultingSessionOpenAIRequest(
      followUpPreparation,
    );

  const capturedFollowUpRequests:
    ConsultingOpenAIRequest[] =
      [];

  const followUpAssistantAnswer =
    await requestConsultingSessionAnswer(
      followUpPreparation,
      async (
        openAIRequest,
      ) => {
        capturedFollowUpRequests.push(
          openAIRequest,
        );

        return FOLLOW_UP_MOCK_ASSISTANT_ANSWER;
      },
    );

  const followUpSession =
    buildConsultingSessionTurn({
      session:
        initialSession,

      preparation:
        followUpPreparation,

      turnId:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID,

      createdAt:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT,

      assistantAnswer:
        followUpAssistantAnswer,
    });

  let emptyFollowUpAnswerCallCount =
    0;

  const emptyFollowUpAnswerIsRejected =
    await actionRejects(
      () =>
        requestConsultingSessionAnswer(
          followUpPreparation,
          async () => {
            emptyFollowUpAnswerCallCount +=
              1;

            return "   ";
          },
        ),
    );

  const deliveredInitialRequest =
    capturedInitialRequests[0];

  const deliveredFollowUpRequest =
    capturedFollowUpRequests[0];

  const followUpPromptRegions =
    splitSessionUserPrompt(
      deliveredFollowUpRequest
        ?.userPrompt
      ?? "",
    );

  const initialPrompt =
    execution
      .turnResult
      .prompt;

  const followUpCurrentPrompt =
    followUpPreparation
      .turnResult
      .prompt;

  const initialFinalDecision =
    execution
      .turnResult
      .explanationPayload
      .finalDecision;

  const followUpFinalDecision =
    followUpPreparation
      .turnResult
      .explanationPayload
      .finalDecision;

  const promptMissingCurrentQuestionFails =
    promptContainsValue(
      initialPrompt
        .userPrompt
        .split(
          request.question,
        )
        .join(
          "",
        ),
      request.question,
    )
    === false;

  const promptMissingCurrentFinalDecisionFails =
    promptContainsValue(
      initialPrompt
        .userPrompt
        .replace(
          initialFinalDecision,
          "",
        ),
      initialFinalDecision,
    )
    === false;

  const historyAnswerInTurnResultFailsIndependence =
    turnResultOmitsPreviousAssistantAnswer(
      followUpPreparation
        .turnResult,
      INITIAL_MOCK_ASSISTANT_ANSWER,
    )
    === true
    && turnResultOmitsPreviousAssistantAnswer(
      {
        ...followUpPreparation
          .turnResult,

        prompt: {
          ...followUpPreparation
            .turnResult
            .prompt,

          userPrompt:
            followUpPreparation
              .turnResult
              .prompt
              .userPrompt
            + INITIAL_MOCK_ASSISTANT_ANSWER,
        },
      },
      INITIAL_MOCK_ASSISTANT_ANSWER,
    )
    === false;

  const historySessionA =
    buildInitialConsultingSession({
      sessionId:
        "session-initial-follow-up-e2e-history-a",

      initialTurnId:
        "turn-initial-follow-up-e2e-history-001",

      createdAt:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT,

      request,

      execution,

      assistantAnswer:
        HISTORY_INDEPENDENCE_ANSWER_A,
    });

  const historySessionB =
    buildInitialConsultingSession({
      sessionId:
        "session-initial-follow-up-e2e-history-b",

      initialTurnId:
        "turn-initial-follow-up-e2e-history-001",

      createdAt:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT,

      request,

      execution,

      assistantAnswer:
        HISTORY_INDEPENDENCE_ANSWER_B,
    });

  const historyPreparationA =
    prepareConsultingSessionTurn({
      session:
        historySessionA,

      kind:
        "followUp",

      question:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

      preparedAt:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_PREPARED_AT,
    });

  const historyPreparationB =
    prepareConsultingSessionTurn({
      session:
        historySessionB,

      kind:
        "followUp",

      question:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

      preparedAt:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_PREPARED_AT,
    });

  const historyRequestA =
    buildConsultingSessionOpenAIRequest(
      historyPreparationA,
    );

  const historyRequestB =
    buildConsultingSessionOpenAIRequest(
      historyPreparationB,
    );

  const historyPromptA =
    splitSessionUserPrompt(
      historyRequestA
        .userPrompt,
    );

  const historyPromptB =
    splitSessionUserPrompt(
      historyRequestB
        .userPrompt,
    );

  const decisionResultIdentical =
    sameJson(
      historyPreparationA
        .turnResult
        .decisionResult,
      historyPreparationB
        .turnResult
        .decisionResult,
    );

  const explanationPlanIdentical =
    sameJson(
      historyPreparationA
        .turnResult
        .explanationPlan,
      historyPreparationB
        .turnResult
        .explanationPlan,
    );

  const explanationPayloadIdentical =
    sameJson(
      historyPreparationA
        .turnResult
        .explanationPayload,
      historyPreparationB
        .turnResult
        .explanationPayload,
    );

  const groundingContextIdentical =
    sameJson(
      historyPreparationA
        .turnResult
        .groundingContext,
      historyPreparationB
        .turnResult
        .groundingContext,
    );

  const conversationHistoryDiffersOnlyByPreviousAnswer =
    historyPreparationA
      .conversationHistory
      .length
    === 1
    && historyPreparationB
      .conversationHistory
      .length
    === 1
    && historyPreparationA
      .conversationHistory[0]
      .assistantAnswer
    === HISTORY_INDEPENDENCE_ANSWER_A
    && historyPreparationB
      .conversationHistory[0]
      .assistantAnswer
    === HISTORY_INDEPENDENCE_ANSWER_B
    && sameJson(
      conversationHistoryWithoutAnswer(
        historyPreparationA,
      ),
      conversationHistoryWithoutAnswer(
        historyPreparationB,
      ),
    );

  const userPromptHistoryPortionDiffers =
    historyPromptA
      .historyPortion
      .length
    > 0
    && historyPromptB
      .historyPortion
      .length
    > 0
    && historyPromptA
      .historyPortion
    !== historyPromptB
      .historyPortion
    && historyPromptA
      .historyPortion
      .includes(
        HISTORY_INDEPENDENCE_ANSWER_A,
      )
    && historyPromptB
      .historyPortion
      .includes(
        HISTORY_INDEPENDENCE_ANSWER_B,
      )
    && historyPromptA
      .historyPortion
      .includes(
        HISTORY_INDEPENDENCE_ANSWER_B,
      )
    === false
    && historyPromptB
      .historyPortion
      .includes(
        HISTORY_INDEPENDENCE_ANSWER_A,
      )
    === false;

  const userPromptCurrentDecisionPortionIdentical =
    historyPromptA
      .currentDecisionPortion
      .length
    > 0
    && historyPromptA
      .currentDecisionPortion
    === historyPromptB
      .currentDecisionPortion
    && historyPromptA
      .currentDecisionPortion
      .includes(
        HISTORY_INDEPENDENCE_ANSWER_A,
      )
    === false
    && historyPromptA
      .currentDecisionPortion
      .includes(
        HISTORY_INDEPENDENCE_ANSWER_B,
      )
    === false;

  const previousAnswerDoesNotChangeDecisionFields =
    historyPreparationA
      .turnResult
      .decisionResult
      .verdict
    === historyPreparationB
      .turnResult
      .decisionResult
      .verdict
    && sameJson(
      historyPreparationA
        .turnResult
        .decisionResult
        .evidence,
      historyPreparationB
        .turnResult
        .decisionResult
        .evidence,
    )
    && sameJson(
      historyPreparationA
        .turnResult
        .decisionResult
        .conditions,
      historyPreparationB
        .turnResult
        .decisionResult
        .conditions,
    )
    && sameJson(
      historyPreparationA
        .turnResult
        .decisionResult
        .risks,
      historyPreparationB
        .turnResult
        .decisionResult
        .risks,
    );

  const initialChecks = {
    initialExecutionUsesProductionBuilder:
      execution
        .turnResult
        .questionReaderResult
        .originalQuestion
      === request.question,

    initialVerdictIsNotInsufficientEvidence:
      execution
        .turnResult
        .decisionResult
        .verdict
      !== "insufficientEvidence",

    initialClarificationIsNotCreated:
      initialClarification
      === null
      && initialSession
        .pendingClarification
      === null,

    initialRequestIsCalledExactlyOnce:
      capturedInitialRequests
        .length
      === 1,

    initialOpenAIRequestMatchesAdapterPrompt:
      deliveredInitialRequest
      !== undefined
      && sameJson(
        deliveredInitialRequest,
        expectedInitialOpenAIRequest,
      ),

    initialOriginalQuestionIsPreservedInPrompt:
      promptContainsValue(
        initialPrompt
          .userPrompt,
        request.question,
      ),

    initialSubjectIsPreservedInPrompt:
      hasExpectedSubjectTerms(
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,
        initialPrompt
          .userPrompt,
      ),

    initialFinalDecisionIsPreservedInPrompt:
      promptContainsValue(
        initialPrompt
          .userPrompt,
        initialFinalDecision,
      ),

    initialMockAnswerIsPreservedOnSessionTurn:
      initialSession
        .turns[0]
        .assistantAnswer
      === INITIAL_MOCK_ASSISTANT_ANSWER
      && initialAssistantAnswer
      === INITIAL_MOCK_ASSISTANT_ANSWER,

    sajuFactsArePreservedWithoutRecalculation:
      initialSession.sajuFacts
      === execution
        .humanDestinyPipeline
        .sajuFactsPipeline,

    readerEvidenceIsPreservedWithoutRecalculation:
      initialSession.readerEvidence
      === execution
        .humanDestinyPipeline
        .evidenceBundle,

    humanContextIsPreservedWithoutRecalculation:
      initialSession.humanContext
      === execution
        .humanDestinyPipeline
        .humanContext,

    lifeContextIsPreservedWithoutRecalculation:
      initialSession
        .lifeContextHistory[0]
        .lifeContext
      === execution.lifeContext,
  };

  const followUpChecks = {
    followUpUsesProductionPrepare:
      followUpPreparation
        .sessionId
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,

    followUpKindIsFollowUp:
      followUpPreparation.kind
      === "followUp"
      && followUpSession
        .turns[1]
        ?.kind
      === "followUp",

    followUpUsesSafeBusinessQuestion:
      followUpPreparation.question
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

    followUpVerdictIsNotInsufficientEvidence:
      followUpPreparation
        .turnResult
        .decisionResult
        .verdict
      !== "insufficientEvidence",

    followUpClarificationIsNotCreated:
      followUpClarification
      === null
      && followUpSession
        .pendingClarification
      === null,

    followUpRequestIsCalledExactlyOnce:
      capturedFollowUpRequests
        .length
      === 1,

    followUpCurrentQuestionIsPreservedInOpenAIRequest:
      deliveredFollowUpRequest
      !== undefined
      && promptContainsValue(
        deliveredFollowUpRequest
          .userPrompt,
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      )
      && promptContainsValue(
        followUpCurrentPrompt
          .userPrompt,
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      ),

    followUpCurrentFinalDecisionIsPreservedInOpenAIRequest:
      deliveredFollowUpRequest
      !== undefined
      && promptContainsValue(
        deliveredFollowUpRequest
          .userPrompt,
        followUpFinalDecision,
      ),

    followUpOpenAIRequestMatchesSessionAdapter:
      deliveredFollowUpRequest
      !== undefined
      && sameJson(
        deliveredFollowUpRequest,
        expectedFollowUpOpenAIRequest,
      ),

    previousAssistantAnswerExistsOnlyInHistoryRegion:
      followUpPromptRegions
        .historyIndex
      >= 0
      && followUpPromptRegions
        .currentDecisionIndex
      > followUpPromptRegions
        .historyIndex
      && followUpPromptRegions
        .historyPortion
        .includes(
          INITIAL_MOCK_ASSISTANT_ANSWER,
        )
      && followUpPromptRegions
        .currentDecisionPortion
        .includes(
          INITIAL_MOCK_ASSISTANT_ANSWER,
        )
      === false
      && (
        deliveredFollowUpRequest
          ?.systemPrompt
          .includes(
            INITIAL_MOCK_ASSISTANT_ANSWER,
          )
        ?? true
      )
      === false,

    currentEngineDecisionRuleIsPreserved:
      deliveredFollowUpRequest
      !== undefined
      && deliveredFollowUpRequest
        .userPrompt
        .includes(
          CURRENT_DECISION_REGION_TITLE,
        )
      && deliveredFollowUpRequest
        .systemPrompt
        .includes(
          "현재 엔진의 verdict, 조건, 위험, 권장 방향, 금지 방향을 변경하지 않는다.",
        ),

    previousAssistantAnswerIsAbsentFromTurnResult:
      turnResultOmitsPreviousAssistantAnswer(
        followUpPreparation
          .turnResult,
        INITIAL_MOCK_ASSISTANT_ANSWER,
      ),

    followUpTurnSequenceAndAnswersArePreserved:
      followUpSession
        .turns
        .length
      === 2
      && followUpSession
        .turns[0]
        .sequence
      === 1
      && followUpSession
        .turns[0]
        .kind
      === "initial"
      && followUpSession
        .turns[0]
        .assistantAnswer
      === INITIAL_MOCK_ASSISTANT_ANSWER
      && followUpSession
        .turns[1]
        .sequence
      === 2
      && followUpSession
        .turns[1]
        .kind
      === "followUp"
      && followUpSession
        .turns[1]
        .assistantAnswer
      === FOLLOW_UP_MOCK_ASSISTANT_ANSWER,
  };

  const historyIndependenceChecks = {
    historyIndependenceDecisionResultIdentical:
      decisionResultIdentical,

    historyIndependenceExplanationPlanIdentical:
      explanationPlanIdentical,

    historyIndependenceExplanationPayloadIdentical:
      explanationPayloadIdentical,

    historyIndependenceGroundingContextIdentical:
      groundingContextIdentical,

    historyIndependenceConversationHistoryDiffersOnlyByPreviousAnswer:
      conversationHistoryDiffersOnlyByPreviousAnswer,

    historyIndependenceUserPromptHistoryPortionDiffers:
      userPromptHistoryPortionDiffers,

    historyIndependenceUserPromptCurrentDecisionPortionIdentical:
      userPromptCurrentDecisionPortionIdentical,

    previousGptAnswerDoesNotChangeVerdictEvidenceConditionsRisks:
      previousAnswerDoesNotChangeDecisionFields,
  };

  const negativeControls = {
    emptyInitialMockAnswerIsRejected:
      emptyInitialAnswerIsRejected,

    emptyInitialMockAnswerCallsRequesterOnce:
      emptyInitialAnswerCallCount
      === 1,

    emptyFollowUpMockAnswerIsRejected:
      emptyFollowUpAnswerIsRejected,

    emptyFollowUpMockAnswerCallsRequesterOnce:
      emptyFollowUpAnswerCallCount
      === 1,

    missingCurrentQuestionFailsPromptComparison:
      promptMissingCurrentQuestionFails,

    missingCurrentFinalDecisionFailsPromptComparison:
      promptMissingCurrentFinalDecisionFails,

    previousAssistantAnswerInTurnResultFailsHistoryIndependence:
      historyAnswerInTurnResultFailsIndependence,

    initialMockCallCountMustBeExactlyOne:
      capturedInitialRequests
        .length
      === 1,

    followUpMockCallCountMustBeExactlyOne:
      capturedFollowUpRequests
        .length
      === 1,
  };

  const checks = {
    ...initialChecks,

    ...followUpChecks,

    ...historyIndependenceChecks,

    ...negativeControls,
  };

  return {
    checks,

    initial: {
      verdict:
        execution
          .turnResult
          .decisionResult
          .verdict,

      originalQuestion:
        request.question,

      finalDecision:
        initialFinalDecision,

      requestCallCount:
        capturedInitialRequests
          .length,
    },

    followUp: {
      kind:
        followUpPreparation.kind,

      verdict:
        followUpPreparation
          .turnResult
          .decisionResult
          .verdict,

      originalQuestion:
        followUpPreparation
          .turnResult
          .questionReaderResult
          .originalQuestion,

      finalDecision:
        followUpFinalDecision,

      requestCallCount:
        capturedFollowUpRequests
          .length,
    },

    historyIndependence: {
      decisionResultIdentical,

      explanationPlanIdentical,

      explanationPayloadIdentical,

      groundingContextIdentical,

      conversationHistoryDiffersOnlyByPreviousAnswer,

      userPromptHistoryPortionDiffers,

      userPromptCurrentDecisionPortionIdentical,
    },

    mockCallCounts: {
      initialRequest:
        capturedInitialRequests
          .length,

      followUpRequest:
        capturedFollowUpRequests
          .length,
    },

    negativeControls,

    passed:
      Object.values(
        checks,
      )
        .every(
          Boolean,
        ),

    limitations:
      E2E_LIMITATIONS,
  };
}
