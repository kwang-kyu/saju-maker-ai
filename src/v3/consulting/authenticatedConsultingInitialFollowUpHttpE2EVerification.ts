import {
  createAuthenticatedInitialConsultingSession,
} from "./authenticatedInitialConsultingSessionService";
import type {
  AuthenticatedInitialConsultingSessionServiceDependencies,
} from "./authenticatedInitialConsultingSessionService";
import {
  handleAuthenticatedInitialConsultingSessionHttpRequest,
} from "./authenticatedInitialConsultingSessionHttpHandler";
import {
  buildAuthenticatedConsultingSessionTurnCommand,
} from "./authenticatedConsultingSessionTurnCommandBuilder";
import type {
  AuthenticatedConsultingSessionTurnCommandBuilderDependencies,
} from "./authenticatedConsultingSessionTurnCommandBuilder";
import {
  executeAuthenticatedConsultingSessionTurnRequest,
} from "./authenticatedConsultingSessionTurnService";
import {
  executeAuthenticatedPersistedConsultingSessionTurn,
} from "./authenticatedPersistedConsultingSessionTurnService";
import type {
  AuthenticatedPersistedConsultingSessionTurnDependencies,
  ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
} from "./authenticatedPersistedConsultingSessionTurnService";
import {
  handleAuthenticatedConsultingSessionTurnHttpRequest,
} from "./authenticatedConsultingSessionTurnHttpHandler";
import {
  CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT,
  CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT,
  CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID,
  CONSULTING_INITIAL_FOLLOW_UP_E2E_INITIAL_TURN_ID,
  CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
  CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
  createInitialFollowUpAnswerE2ERequest,
} from "./consultingInitialFollowUpAnswerE2EVerification";
import type {
  ConsultingAnswerRequestFunction,
} from "./consultingSessionAnswerRequester";
import {
  requestConsultingSessionAnswer,
} from "./consultingSessionAnswerRequester";
import {
  buildConsultingSessionOpenAIRequest,
} from "./consultingSessionOpenAIRequestBuilder";
import type {
  ConsultingSession,
} from "./consultingSession";
import type {
  ConsultingSessionOwnerId,
} from "./consultingSessionOwnerId";
import {
  parseConsultingSessionBearerToken,
  resolveConsultingSessionOwner,
} from "./consultingSessionOwnerResolver";
import type {
  ConsultingSessionAuthorizationHeader,
  ConsultingSessionOwnerResolver,
} from "./consultingSessionOwnerResolver";
import type {
  ConsultingSessionRepository,
  CreateConsultingSessionResult,
  UpdateConsultingSessionInput,
  UpdateConsultingSessionResult,
} from "./consultingSessionRepository";
import {
  prepareConsultingSessionTurn,
} from "./consultingSessionTurnBuilder";
import {
  executePersistedConsultingSessionTurn,
} from "./persistedConsultingSessionTurnService";
import type {
  ExecutePersistedConsultingSessionTurnInput,
} from "./persistedConsultingSessionTurnService";
import {
  requestInitialConsultingAnswer,
} from "./initialConsultingAnswerRequester";
import {
  buildInitialConsultingExecution,
} from "./initialConsultingExecutionBuilder";
import type {
  InitialConsultingExecutionResult,
} from "./initialConsultingExecutionBuilder";
import {
  buildInitialConsultingSession,
} from "./initialConsultingSessionBuilder";
import {
  buildConsultingOpenAIRequest,
  type ConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter";
import {
  readQuestion,
} from "./question/questionReader";
import type {
  QuestionReaderResult,
} from "./question/questionReader";

export const AUTHENTICATED_HTTP_E2E_OWNER_A =
  "owner-a";

export const AUTHENTICATED_HTTP_E2E_OWNER_B =
  "owner-b";

export const AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_A =
  "token-owner-a";

export const AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_B =
  "token-owner-b";

const AUTHORIZATION_OWNER_A =
  `Bearer ${AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_A}`;

const AUTHORIZATION_OWNER_B =
  `Bearer ${AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_B}`;

const HISTORY_REGION_TITLE =
  "이전 상담 이력 — 문맥 일관성 참고 전용";

const CURRENT_DECISION_REGION_TITLE =
  "현재 엔진 판정 — 이번 답변의 유일한 판단 기준";

const INITIAL_MOCK_ASSISTANT_ANSWER =
  "현재 엔진 판정에 따라 사업 시작 조건을 설명합니다. 인증 HTTP 최초 상담 mock 답변입니다.";

const FOLLOW_UP_MOCK_ASSISTANT_ANSWER =
  "현재 엔진 판정에 따라 사업 시작의 조건과 위험을 설명합니다. 인증 HTTP 후속 상담 mock 답변입니다.";

const CONFLICT_UNSAVED_ASSISTANT_ANSWER =
  "충돌 검증용 답변이며 저장소에 남으면 안 됩니다.";

const CONFLICT_FOLLOW_UP_TURN_ID =
  "turn-initial-follow-up-e2e-conflict-003";

const CONFLICT_FOLLOW_UP_TIMESTAMP =
  "2026-08-21T00:20:00+09:00";

const E2E_LIMITATIONS = [
  "이 E2E는 인증 HTTP 핸들러와 소유자 범위 in-memory repository를 검증하지만 실제 Supabase와 OpenAI 네트워크, 배포 API는 호출하지 않는다.",
] as const;

export type StoredConsultingSessionRecord = {
  ownerId:
    string;

  session:
    ConsultingSession;
};

export type AuthenticatedConsultingInitialFollowUpHttpE2EVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  repository: {
    createCallCount:
      number;

    findByIdCallCount:
      number;

    updateCallCount:
      number;

    expectedUpdatedAt:
      string | null;

    storedOwnerId:
      string | null;

    storedTurnKinds:
      string[];
  };

  http: {
    initialStatus:
      number;

    followUpStatus:
      number;

    missingAuthorizationStatus:
      number;

    foreignOwnerStatus:
      number;

    staleConflictStatus:
      number;

    initialError:
      string | null;

    followUpError:
      string | null;

    missingAuthorizationError:
      string | null;

    foreignOwnerError:
      string | null;

    staleConflictError:
      string | null;
  };

  events: {
    initial:
      string[];

    followUp:
      string[];

    foreignOwner:
      string[];

    staleConflict:
      string[];

    missingAuthorization:
      string[];
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

export class OwnerAwareConsultingSessionStorage {
  readonly records =
    new Map<
      string,
      StoredConsultingSessionRecord
    >();

  forceConflictOnNextUpdate =
    false;

  createCallCount =
    0;

  findByIdCallCount =
    0;

  updateCallCount =
    0;

  expectedUpdatedAtValues:
    string[] =
      [];

  lastFindByIdResult:
    ConsultingSession | null =
      null;

  lastUpdateResult:
    UpdateConsultingSessionResult | null =
      null;

  peek(
    sessionId:
      string,
  ):
    StoredConsultingSessionRecord | undefined {
    return this.records.get(
      sessionId,
    );
  }
}

export class OwnerScopedConsultingSessionRepository
  implements ConsultingSessionRepository {
  private readonly storage:
    OwnerAwareConsultingSessionStorage;

  private readonly ownerId:
    string;

  private readonly onEvent:
    (
      event:
        string,
    ) => void;

  constructor(
    storage:
      OwnerAwareConsultingSessionStorage,
    ownerId:
      string,
    onEvent:
      (
        event:
          string,
      ) => void,
  ) {
    this.storage =
      storage;

    this.ownerId =
      ownerId;

    this.onEvent =
      onEvent;
  }

  async findById(
    sessionId:
      string,
  ): Promise<
    ConsultingSession | null
  > {
    this.storage
      .findByIdCallCount +=
        1;

    this.onEvent(
      "find",
    );

    const record =
      this.storage
        .records
        .get(
          sessionId,
        );

    if (
      record
        === undefined
      || record.ownerId
        !== this.ownerId
    ) {
      this.storage
        .lastFindByIdResult =
          null;

      return null;
    }

    this.storage
      .lastFindByIdResult =
        record.session;

    return record.session;
  }

  async create(
    session:
      ConsultingSession,
  ): Promise<
    CreateConsultingSessionResult
  > {
    this.storage
      .createCallCount +=
        1;

    this.onEvent(
      "create",
    );

    const existing =
      this.storage
        .records
        .get(
          session.id,
        );

    if (
      existing
      !== undefined
    ) {
      return {
        status:
          "alreadyExists",

        existingUpdatedAt:
          existing
            .session
            .updatedAt,
      };
    }

    this.storage
      .records
      .set(
        session.id,
        {
          ownerId:
            this.ownerId,

          session,
        },
      );

    return {
      status:
        "created",
    };
  }

  async update(
    input:
      UpdateConsultingSessionInput,
  ): Promise<
    UpdateConsultingSessionResult
  > {
    this.storage
      .updateCallCount +=
        1;

    this.storage
      .expectedUpdatedAtValues
      .push(
        input.expectedUpdatedAt,
      );

    this.onEvent(
      "update",
    );

    const record =
      this.storage
        .records
        .get(
          input
            .session
            .id,
        );

    if (
      record
        === undefined
      || record.ownerId
        !== this.ownerId
    ) {
      const notFoundResult:
        UpdateConsultingSessionResult = {
          status:
            "notFound",
        };

      this.storage
        .lastUpdateResult =
          notFoundResult;

      return notFoundResult;
    }

    if (
      this.storage
        .forceConflictOnNextUpdate
    ) {
      this.storage
        .forceConflictOnNextUpdate =
          false;

      const forcedConflict:
        UpdateConsultingSessionResult = {
          status:
            "conflict",

          currentUpdatedAt:
            record
              .session
              .updatedAt,
        };

      this.storage
        .lastUpdateResult =
          forcedConflict;

      return forcedConflict;
    }

    if (
      record
        .session
        .updatedAt
      !== input
        .expectedUpdatedAt
    ) {
      const staleConflict:
        UpdateConsultingSessionResult = {
          status:
            "conflict",

          currentUpdatedAt:
            record
              .session
              .updatedAt,
        };

      this.storage
        .lastUpdateResult =
          staleConflict;

      return staleConflict;
    }

    record.session =
      input.session;

    const updatedResult:
      UpdateConsultingSessionResult = {
        status:
          "updated",
      };

    this.storage
      .lastUpdateResult =
        updatedResult;

    return updatedResult;
  }
}

function asOwnerId(
  value:
    string,
): ConsultingSessionOwnerId {
  return {
    value,
  } as ConsultingSessionOwnerId;
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

function cloneJson<
  Value,
>(
  value:
    Value,
): Value {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Value;
}

function equalsNumber(
  actual:
    number,
  expected:
    number,
): boolean {
  return actual
    === expected;
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

function wouldUseProductionAnswerClient(
  requestAnswer:
    ConsultingAnswerRequestFunction | undefined,
): boolean {
  return requestAnswer
    === undefined;
}

function httpErrorCode(
  response: {
    status:
      number;

    body:
      unknown;
  },
): string | null {
  if (
    typeof response.body
      !== "object"
    || response.body
      === null
    || !(
      "error"
      in response.body
    )
    || typeof response.body.error
      !== "string"
  ) {
    return null;
  }

  return response.body.error;
}

/**
 * 인증 HTTP 최초 상담 → 후속 상담의
 * 생산 핸들러/서비스/Builder/Requester 경로를
 * owner-aware in-memory repository와 mock OpenAI로 검증한다.
 *
 * 실제 Supabase, OpenAI, 배포 API는 호출하지 않는다.
 */
export async function verifyAuthenticatedConsultingInitialFollowUpHttpE2E():
  Promise<
    AuthenticatedConsultingInitialFollowUpHttpE2EVerificationResult
  > {
  const request =
    createInitialFollowUpAnswerE2ERequest();

  const sourceLockedExecution =
    buildInitialConsultingExecution(
      request,
    );

  const sourceLockedQuestionReaderResult =
    sourceLockedExecution
      .turnResult
      .questionReaderResult;

  const storage =
    new OwnerAwareConsultingSessionStorage();

  let events:
    string[] =
      [];

  const ownerResolver:
    ConsultingSessionOwnerResolver = {
      async resolveOwnerId(
        accessToken:
          string,
      ) {
        if (
          accessToken
          === AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_A
        ) {
          return asOwnerId(
            AUTHENTICATED_HTTP_E2E_OWNER_A,
          );
        }

        if (
          accessToken
          === AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_B
        ) {
          return asOwnerId(
            AUTHENTICATED_HTTP_E2E_OWNER_B,
          );
        }

        throw new Error(
          `Unexpected consulting session access token: ${accessToken}`,
        );
      },
    };

  const supabaseClientCallCount =
    0;

  const openAIClientCallCount =
    0;

  const questionSemanticInterpreterCallCount =
    0;

  let initialInterpretQuestionCallCount =
    0;

  const interpretedInitialQuestions:
    string[] =
      [];

  let followUpInterpretQuestionCallCount =
    0;

  const interpretedFollowUpQuestions:
    string[] =
      [];

  let lastFollowUpQuestionInterpretation:
    QuestionReaderResult | undefined;

  let capturedInitialExecution:
    InitialConsultingExecutionResult | undefined;

  const capturedInitialRequests:
    ConsultingOpenAIRequest[] =
      [];

  const capturedFollowUpRequests:
    ConsultingOpenAIRequest[] =
      [];

  let initialAnswerCallCount =
    0;

  let followUpAnswerCallCount =
    0;

  let followUpExecuteTurnCallCount =
    0;

  let followUpRequestAnswerWasInjected =
    false;

  let followUpWouldHaveUsedProductionClient =
    false;

  let usedBuildInitialConsultingExecution =
    false;

  let usedRequestInitialConsultingAnswer =
    false;

  let usedBuildInitialConsultingSession =
    false;

  let usedBuildAuthenticatedConsultingSessionTurnCommand =
    false;

  let usedExecuteAuthenticatedPersistedConsultingSessionTurn =
    false;

  let usedExecutePersistedConsultingSessionTurn =
    false;

  const lastFollowUpCommandCapture: {
    current:
      ExecuteAuthenticatedPersistedConsultingSessionTurnInput | null;
  } = {
    current:
      null,
  };

  let followUpTurnIdToUse =
    CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID;

  let followUpTimestampToUse =
    CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT;

  let followUpMockAssistantAnswer =
    FOLLOW_UP_MOCK_ASSISTANT_ANSWER;

  async function createRepository(
    input: {
      authorizationHeader:
        ConsultingSessionAuthorizationHeader;

      environment?:
        unknown;
    },
  ): Promise<
    ConsultingSessionRepository
  > {
    events.push(
      "authorization",
    );

    const accessToken =
      parseConsultingSessionBearerToken(
        input.authorizationHeader,
      );

    const owner =
      await resolveConsultingSessionOwner({
        authorizationHeader:
          input.authorizationHeader,

        resolver:
          ownerResolver,
      });

    if (
      (
        accessToken
        === AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_A
        && owner.value
          !== AUTHENTICATED_HTTP_E2E_OWNER_A
      )
      || (
        accessToken
        === AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_B
        && owner.value
          !== AUTHENTICATED_HTTP_E2E_OWNER_B
      )
    ) {
      throw new Error(
        "Verification owner resolver must map token-owner-a to owner-a and token-owner-b to owner-b.",
      );
    }

    return new OwnerScopedConsultingSessionRepository(
      storage,
      owner.value,
      (
        event,
      ) => {
        events.push(
          event,
        );
      },
    );
  }

  const initialServiceDependencies:
    AuthenticatedInitialConsultingSessionServiceDependencies = {
      createRepository,

      createSessionId() {
        return CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID;
      },

      createTurnId() {
        return CONSULTING_INITIAL_FOLLOW_UP_E2E_INITIAL_TURN_ID;
      },

      now() {
        return CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT;
      },

      async interpretQuestion(
        question,
      ) {
        initialInterpretQuestionCallCount +=
          1;

        interpretedInitialQuestions.push(
          question,
        );

        events.push(
          "interpretation",
        );

        return sourceLockedQuestionReaderResult;
      },

      buildExecution(
        sourceRequest,
        questionInterpretation,
      ) {
        usedBuildInitialConsultingExecution =
          true;

        events.push(
          "execution",
        );

        capturedInitialExecution =
          buildInitialConsultingExecution(
            sourceRequest,
            questionInterpretation,
          );

        return capturedInitialExecution;
      },

      async requestAnswer(
        execution,
      ) {
        usedRequestInitialConsultingAnswer =
          true;

        events.push(
          "answer",
        );

        initialAnswerCallCount +=
          1;

        return requestInitialConsultingAnswer(
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
      },

      buildSession(
        input,
      ) {
        usedBuildInitialConsultingSession =
          true;

        return buildInitialConsultingSession(
          input,
        );
      },
    };

  const followUpCommandBuilderDependencies:
    AuthenticatedConsultingSessionTurnCommandBuilderDependencies = {
      createTurnId() {
        return followUpTurnIdToUse;
      },

      now() {
        return followUpTimestampToUse;
      },
    };

  const persistedDependencies:
    AuthenticatedPersistedConsultingSessionTurnDependencies = {
      createRepository,

      async interpretQuestion(
        question,
      ) {
        followUpInterpretQuestionCallCount +=
          1;

        interpretedFollowUpQuestions.push(
          question,
        );

        events.push(
          "interpretation",
        );

        const storedRecord =
          storage.peek(
            CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
          );

        if (
          storedRecord
          === undefined
        ) {
          throw new Error(
            "Follow-up interpretation requires a stored consulting session.",
          );
        }

        lastFollowUpQuestionInterpretation =
          readQuestion(
            storedRecord
              .session
              .humanContext,
            question,
          );

        return lastFollowUpQuestionInterpretation;
      },

      async executeTurn(
        input:
          ExecutePersistedConsultingSessionTurnInput,
      ) {
        followUpExecuteTurnCallCount +=
          1;

        followUpWouldHaveUsedProductionClient =
          wouldUseProductionAnswerClient(
            input.requestAnswer,
          );

        const injectedRequestAnswer:
          ConsultingAnswerRequestFunction =
            async (
              openAIRequest,
            ) => {
              events.push(
                "answer",
              );

              followUpAnswerCallCount +=
                1;

              capturedFollowUpRequests.push(
                openAIRequest,
              );

              return followUpMockAssistantAnswer;
            };

        followUpRequestAnswerWasInjected =
          true;

        usedExecutePersistedConsultingSessionTurn =
          true;

        return executePersistedConsultingSessionTurn({
          ...input,

          requestAnswer:
            injectedRequestAnswer,
        });
      },
    };

  const initialHttpResponse =
    await handleAuthenticatedInitialConsultingSessionHttpRequest(
      {
        method:
          "POST",

        authorizationHeader:
          AUTHORIZATION_OWNER_A,

        body:
          request,
      },
      {
        executeInitialSession(
          input,
        ) {
          return createAuthenticatedInitialConsultingSession(
            input,
            initialServiceDependencies,
          );
        },
      },
    );

  const initialEvents =
    [
      ...events,
    ];

  const initialRecord =
    storage.peek(
      CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
    );

  const initialSessionSnapshot =
    initialRecord
      ? cloneJson(
          initialRecord.session,
        )
      : null;

  const initialTurnSnapshot =
    initialSessionSnapshot
      ?.turns[0]
    ?? null;

  const createCallCountAfterInitial =
    storage.createCallCount;

  const initialInterpretCountAfterInitial =
    initialInterpretQuestionCallCount;

  const initialAnswerCountAfterInitial =
    initialAnswerCallCount;

  events =
    [];

  const followUpRequestBody = {
    sessionId:
      CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,

    kind:
      "followUp" as const,

    question:
      CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
  };

  const followUpHttpResponse =
    await handleAuthenticatedConsultingSessionTurnHttpRequest(
      {
        method:
          "POST",

        authorizationHeader:
          AUTHORIZATION_OWNER_A,

        body:
          followUpRequestBody,
      },
      {
        executeTurnRequest(
          input,
        ) {
          return executeAuthenticatedConsultingSessionTurnRequest(
            input,
            {
              buildCommand(
                buildInput,
                builderDependencies,
              ) {
                usedBuildAuthenticatedConsultingSessionTurnCommand =
                  true;

                events.push(
                  "buildCommand",
                );

                const command =
                  buildAuthenticatedConsultingSessionTurnCommand(
                    buildInput,
                    builderDependencies,
                  );

                lastFollowUpCommandCapture.current =
                  command;

                return command;
              },

              executeTurn(
                command,
              ) {
                usedExecuteAuthenticatedPersistedConsultingSessionTurn =
                  true;

                return executeAuthenticatedPersistedConsultingSessionTurn(
                  command,
                  persistedDependencies,
                );
              },
            },
            followUpCommandBuilderDependencies,
          );
        },
      },
    );

  const followUpEvents =
    [
      ...events,
    ];

  const followUpRecord =
    storage.peek(
      CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
    );

  if (
    followUpRecord
    === undefined
    || initialSessionSnapshot
    === null
  ) {
    throw new Error(
      "Authenticated HTTP E2E requires the initial session to be stored before follow-up checks.",
    );
  }

  const followUpSessionSnapshot =
    cloneJson(
      followUpRecord.session,
    );

  const successfulFollowUpCommand =
    lastFollowUpCommandCapture.current;

  const successfulFollowUpInterpretation =
    lastFollowUpQuestionInterpretation;

  const findByIdCallCountAfterFollowUp =
    storage.findByIdCallCount;

  const updateCallCountAfterFollowUp =
    storage.updateCallCount;

  const expectedUpdatedAtAfterFollowUp =
    storage
      .expectedUpdatedAtValues[0]
    ?? null;

  const followUpInterpretCountAfterSuccess =
    followUpInterpretQuestionCallCount;

  const followUpAnswerCountAfterSuccess =
    followUpAnswerCallCount;

  const capturedFollowUpRequestCountAfterSuccess =
    capturedFollowUpRequests
      .length;

  const capturedFollowUpRequest =
    capturedFollowUpRequests[0];

  const reconstructedFollowUpPreparation =
    initialSessionSnapshot
    && successfulFollowUpInterpretation
      ? prepareConsultingSessionTurn({
          session:
            initialSessionSnapshot,

          kind:
            "followUp",

          question:
            CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

          preparedAt:
            CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT,

          questionInterpretation:
            successfulFollowUpInterpretation,
        })
      : null;

  const expectedFollowUpOpenAIRequest =
    reconstructedFollowUpPreparation
      ? buildConsultingSessionOpenAIRequest(
          reconstructedFollowUpPreparation,
        )
      : null;

  const replayedFollowUpRequests:
    ConsultingOpenAIRequest[] =
      [];

  if (
    reconstructedFollowUpPreparation
  ) {
    await requestConsultingSessionAnswer(
      reconstructedFollowUpPreparation,
      async (
        openAIRequest,
      ) => {
        replayedFollowUpRequests.push(
          openAIRequest,
        );

        return FOLLOW_UP_MOCK_ASSISTANT_ANSWER;
      },
    );
  }

  const expectedInitialOpenAIRequest =
    capturedInitialExecution
      ? buildConsultingOpenAIRequest(
          capturedInitialExecution
            .turnResult
            .prompt,
        )
      : null;

  const followUpPromptRegions =
    splitSessionUserPrompt(
      capturedFollowUpRequest
        ?.userPrompt
      ?? "",
    );

  const ownerARepository =
    await createRepository({
      authorizationHeader:
        AUTHORIZATION_OWNER_A,
    });

  const ownerBRepository =
    await createRepository({
      authorizationHeader:
        AUTHORIZATION_OWNER_B,
    });

  events =
    [];

  const ownerADirectFind =
    await ownerARepository
      .findById(
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
      );

  const ownerBDirectFind =
    await ownerBRepository
      .findById(
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
      );

  const ownerBDirectUpdate =
    await ownerBRepository
      .update({
        session:
          followUpSessionSnapshot,

        expectedUpdatedAt:
          expectedUpdatedAtAfterFollowUp
          ?? CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT,
      });

  const staleExpectedUpdatedAtUpdate =
    await ownerARepository
      .update({
        session:
          followUpSessionSnapshot,

        expectedUpdatedAt:
          "1999-01-01T00:00:00+09:00",
      });

  const sessionAfterDirectIsolationChecks =
    storage.peek(
      CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
    );

  events =
    [];

  const followUpAnswerCountBeforeForeignOwner =
    followUpAnswerCallCount;

  const updateCallCountBeforeForeignOwner =
    storage.updateCallCount;

  const foreignOwnerHttpResponse =
    await handleAuthenticatedConsultingSessionTurnHttpRequest(
      {
        method:
          "POST",

        authorizationHeader:
          AUTHORIZATION_OWNER_B,

        body:
          followUpRequestBody,
      },
      {
        executeTurnRequest(
          input,
        ) {
          return executeAuthenticatedConsultingSessionTurnRequest(
            input,
            {
              buildCommand(
                buildInput,
                builderDependencies,
              ) {
                events.push(
                  "buildCommand",
                );

                return buildAuthenticatedConsultingSessionTurnCommand(
                  buildInput,
                  builderDependencies,
                );
              },

              executeTurn(
                command,
              ) {
                return executeAuthenticatedPersistedConsultingSessionTurn(
                  command,
                  persistedDependencies,
                );
              },
            },
            followUpCommandBuilderDependencies,
          );
        },
      },
    );

  const foreignOwnerEvents =
    [
      ...events,
    ];

  const followUpAnswerCountAfterForeignOwner =
    followUpAnswerCallCount;

  const updateCallCountAfterForeignOwner =
    storage.updateCallCount;

  const sessionAfterForeignOwner =
    storage.peek(
      CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
    );

  followUpTurnIdToUse =
    CONFLICT_FOLLOW_UP_TURN_ID;

  followUpTimestampToUse =
    CONFLICT_FOLLOW_UP_TIMESTAMP;

  followUpMockAssistantAnswer =
    CONFLICT_UNSAVED_ASSISTANT_ANSWER;

  storage.forceConflictOnNextUpdate =
    true;

  events =
    [];

  const staleConflictHttpResponse =
    await handleAuthenticatedConsultingSessionTurnHttpRequest(
      {
        method:
          "POST",

        authorizationHeader:
          AUTHORIZATION_OWNER_A,

        body:
          followUpRequestBody,
      },
      {
        executeTurnRequest(
          input,
        ) {
          return executeAuthenticatedConsultingSessionTurnRequest(
            input,
            {
              buildCommand(
                buildInput,
                builderDependencies,
              ) {
                events.push(
                  "buildCommand",
                );

                return buildAuthenticatedConsultingSessionTurnCommand(
                  buildInput,
                  builderDependencies,
                );
              },

              executeTurn(
                command,
              ) {
                return executeAuthenticatedPersistedConsultingSessionTurn(
                  command,
                  persistedDependencies,
                );
              },
            },
            followUpCommandBuilderDependencies,
          );
        },
      },
    );

  const staleConflictEvents =
    [
      ...events,
    ];

  const sessionAfterStaleConflict =
    storage.peek(
      CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
    );

  const lastUpdateResultAfterConflict =
    storage.lastUpdateResult;

  events =
    [];

  const missingAuthorizationHttpResponse =
    await handleAuthenticatedInitialConsultingSessionHttpRequest(
      {
        method:
          "POST",

        authorizationHeader:
          undefined,

        body:
          request,
      },
      {
        executeInitialSession(
          input,
        ) {
          return createAuthenticatedInitialConsultingSession(
            input,
            initialServiceDependencies,
          );
        },
      },
    );

  const missingAuthorizationEvents =
    [
      ...events,
    ];

  const initialInterpretCountAfterMissingAuth =
    initialInterpretQuestionCallCount;

  const initialAnswerCountAfterMissingAuth =
    initialAnswerCallCount;

  const createCallCountAfterMissingAuth =
    storage.createCallCount;

  const initialSuccessBody =
    initialHttpResponse.status
    === 201
      ? initialHttpResponse.body
      : null;

  const followUpSuccessBody =
    followUpHttpResponse.status
    === 200
      ? followUpHttpResponse.body
      : null;

  const storedTurnKinds =
    followUpRecord
      ?.session
      .turns
      .map(
        (
          turn,
        ) =>
          turn.kind,
      )
    ?? [];

  const initialChecks = {
    initialHttpStatusIs201:
      initialHttpResponse.status
      === 201,

    initialHttpSessionIdMatchesFixedId:
      initialSuccessBody
        ?.sessionId
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,

    initialHttpTurnIdMatchesFixedId:
      initialSuccessBody
        ?.initialTurnId
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_INITIAL_TURN_ID,

    initialHttpSequenceIsOne:
      initialSuccessBody
        ?.initialTurnSequence
      === 1,

    initialHttpQuestionMatchesSafeBusinessQuestion:
      initialSuccessBody
        ?.question
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

    initialHttpAnswerMatchesMock:
      initialSuccessBody
        ?.assistantAnswer
      === INITIAL_MOCK_ASSISTANT_ANSWER,

    initialHttpTimestampMatchesFixedCreatedAt:
      initialSuccessBody
        ?.createdAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT
      && initialSuccessBody
        ?.updatedAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT,

    initialPendingClarificationIsNull:
      initialSuccessBody
        ?.pendingClarification
      === null
      && initialRecord
        ?.session
        .pendingClarification
      === null,

    repositoryCreateIsCalledExactlyOnce:
      createCallCountAfterInitial
      === 1,

    storedInitialTurnsLengthIsOne:
      initialSessionSnapshot
        .turns
        .length
      === 1
      && initialSessionSnapshot
        .turns[0]
        .kind
      === "initial",

    storedOwnerIsOwnerA:
      initialRecord
        ?.ownerId
      === AUTHENTICATED_HTTP_E2E_OWNER_A,

    initialInterpretationIsCalledExactlyOnce:
      initialInterpretCountAfterInitial
      === 1
      && interpretedInitialQuestions[0]
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

    initialAnswerMockIsCalledExactlyOnce:
      initialAnswerCountAfterInitial
      === 1
      && capturedInitialRequests
        .length
      === 1,

    initialOpenAIRequestContainsCurrentQuestionAndFinalDecision:
      capturedInitialRequests[0]
      !== undefined
      && capturedInitialExecution
      !== undefined
      && promptContainsValue(
        capturedInitialRequests[0]
          .userPrompt,
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      )
      && promptContainsValue(
        capturedInitialRequests[0]
          .userPrompt,
        capturedInitialExecution
          .turnResult
          .explanationPayload
          .finalDecision,
      ),

    initialOpenAIRequestMatchesProductionAdapter:
      capturedInitialRequests[0]
      !== undefined
      && expectedInitialOpenAIRequest
      !== null
      && sameJson(
        capturedInitialRequests[0],
        expectedInitialOpenAIRequest,
      ),

    initialEventOrderIsAuthInterpretationExecutionAnswerCreate:
      sameJson(
        initialEvents,
        [
          "authorization",
          "interpretation",
          "execution",
          "answer",
          "create",
        ],
      ),
  };

  const followUpChecks = {
    followUpHttpStatusIs200:
      followUpHttpResponse.status
      === 200,

    followUpHttpSessionIdMatchesInitial:
      followUpSuccessBody
        ?.sessionId
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,

    followUpHttpTurnIdMatchesFixedId:
      followUpSuccessBody
        ?.turn
        .id
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID,

    followUpHttpSequenceIsTwo:
      followUpSuccessBody
        ?.turn
        .sequence
      === 2,

    followUpHttpKindIsFollowUp:
      followUpSuccessBody
        ?.turn
        .kind
      === "followUp",

    followUpHttpQuestionMatchesSafeBusinessQuestion:
      followUpSuccessBody
        ?.turn
        .question
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

    followUpHttpAnswerMatchesMock:
      followUpSuccessBody
        ?.turn
        .assistantAnswer
      === FOLLOW_UP_MOCK_ASSISTANT_ANSWER,

    followUpHttpTimestampMatchesFixedCreatedAt:
      followUpSuccessBody
        ?.turn
        .createdAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT
      && followUpSuccessBody
        ?.updatedAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT,

    repositoryFindByIdIsCalledAtLeastOnce:
      findByIdCallCountAfterFollowUp
      >= 1,

    repositoryUpdateIsCalledExactlyOnce:
      updateCallCountAfterFollowUp
      === 1,

    expectedUpdatedAtMatchesInitialStoredSession:
      expectedUpdatedAtAfterFollowUp
      === initialSessionSnapshot
        ?.updatedAt
      && expectedUpdatedAtAfterFollowUp
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT,

    storedTurnsLengthIsTwo:
      followUpRecord
        ?.session
        .turns
        .length
      === 2,

    storedTurnKindsAreInitialThenFollowUp:
      followUpRecord
        ?.session
        .turns[0]
        ?.kind
      === "initial"
      && followUpRecord
        ?.session
        .turns[1]
        ?.kind
      === "followUp",

    existingInitialTurnIsUnchanged:
      initialTurnSnapshot
      !== null
      && followUpRecord
      !== undefined
      && sameJson(
        followUpRecord
          .session
          .turns[0],
        initialTurnSnapshot,
      ),

    previousAssistantAnswerExistsInFollowUpHistoryRegion:
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
      === false,

    previousAssistantAnswerIsAbsentFromFollowUpTurnResult:
      reconstructedFollowUpPreparation
      !== null
      && JSON.stringify(
        reconstructedFollowUpPreparation
          .turnResult,
      )
        .includes(
          INITIAL_MOCK_ASSISTANT_ANSWER,
        )
      === false,

    followUpInterpretationUsesStoredHumanContextExactlyOnce:
      followUpInterpretCountAfterSuccess
      === 1
      && interpretedFollowUpQuestions[0]
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

    followUpAnswerMockIsCalledExactlyOnce:
      followUpAnswerCountAfterSuccess
      === 1
      && capturedFollowUpRequestCountAfterSuccess
      === 1,

    followUpOpenAIRequestMatchesProductionSessionAdapter:
      capturedFollowUpRequest
      !== undefined
      && expectedFollowUpOpenAIRequest
      !== null
      && sameJson(
        capturedFollowUpRequest,
        expectedFollowUpOpenAIRequest,
      )
      && replayedFollowUpRequests[0]
      !== undefined
      && sameJson(
        capturedFollowUpRequest,
        replayedFollowUpRequests[0],
      ),

    commandUsesFixedServerTurnIdAndTimestamps:
      successfulFollowUpCommand
        ?.turnId
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID
      && successfulFollowUpCommand
        ?.preparationInput
        .preparedAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT
      && successfulFollowUpCommand
        ?.createdAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT,

    followUpRequestBodyOmitsUnauthorizedServerFields:
      Object.keys(
        followUpRequestBody,
      )
        .every(
          (
            key,
          ) =>
            key
            === "sessionId"
            || key
            === "kind"
            || key
            === "question",
        )
      && !(
        "turnId"
        in followUpRequestBody
      )
      && !(
        "createdAt"
        in followUpRequestBody
      )
      && !(
        "preparedAt"
        in followUpRequestBody
      ),

    followUpEventOrderIsBuildCommandAuthInterpretationFindAnswerUpdate:
      sameJson(
        followUpEvents,
        [
          "buildCommand",
          "authorization",
          "interpretation",
          "find",
          "answer",
          "update",
        ],
      ),

    ownerACanReadStoredSession:
      ownerADirectFind
      !== null
      && ownerADirectFind.id
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID,
  };

  const errorChecks = {
    ownerScopedRepositoryHidesForeignSession:
      ownerBDirectFind
      === null
      && ownerADirectFind
      !== null,

    foreignOwnerUpdateReturnsNotFound:
      ownerBDirectUpdate.status
      === "notFound",

    foreignOwnerReturns404WithoutAnswerGeneration:
      foreignOwnerHttpResponse.status
      === 404
      && httpErrorCode(
        foreignOwnerHttpResponse,
      )
      === "sessionNotFound"
      && followUpAnswerCountAfterForeignOwner
      === followUpAnswerCountBeforeForeignOwner
      && updateCallCountAfterForeignOwner
      === updateCallCountBeforeForeignOwner
      && sameJson(
        sessionAfterForeignOwner
          ?.session
          .turns,
        followUpSessionSnapshot
          ?.turns,
      ),

    staleExpectedUpdatedAtConflictsWithoutMutation:
      staleExpectedUpdatedAtUpdate.status
      === "conflict"
      && sameJson(
        sessionAfterDirectIsolationChecks
          ?.session
          .turns,
        followUpSessionSnapshot
          ?.turns,
      ),

    staleRepositoryUpdateReturns409:
      staleConflictHttpResponse.status
      === 409
      && httpErrorCode(
        staleConflictHttpResponse,
      )
      === "sessionConflict"
      && lastUpdateResultAfterConflict
        ?.status
      === "conflict"
      && sameJson(
        staleConflictEvents,
        [
          "buildCommand",
          "authorization",
          "interpretation",
          "find",
          "answer",
          "update",
        ],
      )
      && followUpAnswerCallCount
      === followUpAnswerCountAfterForeignOwner + 1
      && sessionAfterStaleConflict
        ?.session
        .turns
        .length
      === 2
      && sessionAfterStaleConflict
        .session
        .turns[1]
        ?.assistantAnswer
      === FOLLOW_UP_MOCK_ASSISTANT_ANSWER
      && JSON.stringify(
        sessionAfterStaleConflict
          .session,
      )
        .includes(
          CONFLICT_UNSAVED_ASSISTANT_ANSWER,
        )
      === false,

    missingAuthorizationReturns401WithoutSideEffects:
      missingAuthorizationHttpResponse.status
      === 401
      && httpErrorCode(
        missingAuthorizationHttpResponse,
      )
      === "authenticationRequired"
      && sameJson(
        missingAuthorizationEvents,
        [
          "authorization",
        ],
      )
      && initialInterpretCountAfterMissingAuth
      === initialInterpretCountAfterInitial
      && initialAnswerCountAfterMissingAuth
      === initialAnswerCountAfterInitial
      && createCallCountAfterMissingAuth
      === createCallCountAfterInitial,
  };

  const coreChecks = {
    initialAndFollowUpShareOneRepositoryRecord:
      storage.records.size
      === 1
      && followUpRecord
        ?.ownerId
      === AUTHENTICATED_HTTP_E2E_OWNER_A
      && followUpRecord
        ?.session
        .id
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID
      && initialRecord
        ?.session
        .id
      === followUpRecord
        ?.session
        .id,

    initialHttpCreatesExactlyOneTurn:
      initialSessionSnapshot
        .turns
        .length
      === 1
      && initialSuccessBody
        ?.initialTurnSequence
      === 1,

    followUpHttpPersistsSecondTurn:
      followUpRecord
        ?.session
        .turns
        .length
      === 2
      && followUpSuccessBody
        ?.turn
        .sequence
      === 2,

    repositoryCreateAndUpdateAreBothUsed:
      createCallCountAfterInitial
      === 1
      && updateCallCountAfterFollowUp
      === 1,

    expectedUpdatedAtComesFromStoredSession:
      expectedUpdatedAtAfterFollowUp
      === initialSessionSnapshot
        ?.updatedAt,

    authenticationRunsBeforeInterpretationAndAnswer:
      initialEvents.indexOf(
        "authorization",
      )
      >= 0
      && initialEvents.indexOf(
        "authorization",
      )
      < initialEvents.indexOf(
        "interpretation",
      )
      && initialEvents.indexOf(
        "interpretation",
      )
      < initialEvents.indexOf(
        "answer",
      )
      && followUpEvents.indexOf(
        "authorization",
      )
      >= 0
      && followUpEvents.indexOf(
        "buildCommand",
      )
      < followUpEvents.indexOf(
        "authorization",
      )
      && followUpEvents.indexOf(
        "authorization",
      )
      < followUpEvents.indexOf(
        "interpretation",
      )
      && followUpEvents.indexOf(
        "authorization",
      )
      < followUpEvents.indexOf(
        "answer",
      )
      && missingAuthorizationEvents.includes(
        "interpretation",
      )
      === false
      && missingAuthorizationEvents.includes(
        "answer",
      )
      === false,

    actualProductionBuildersAndRequestersAreUsed:
      usedBuildInitialConsultingExecution
      && usedRequestInitialConsultingAnswer
      && usedBuildInitialConsultingSession
      && usedBuildAuthenticatedConsultingSessionTurnCommand
      && usedExecuteAuthenticatedPersistedConsultingSessionTurn
      && usedExecutePersistedConsultingSessionTurn
      && followUpRequestAnswerWasInjected
      && followUpWouldHaveUsedProductionClient
      && capturedInitialRequests
        .length
      === 1
      && capturedFollowUpRequestCountAfterSuccess
      === 1,

    noSupabaseOrOpenAIClientIsCalled:
      supabaseClientCallCount
      === 0
      && openAIClientCallCount
      === 0
      && questionSemanticInterpreterCallCount
      === 0,

    fixedServerIdsAndTimestampsReachHttpResponses:
      initialSuccessBody
        ?.sessionId
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_SESSION_ID
      && initialSuccessBody
        ?.initialTurnId
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_INITIAL_TURN_ID
      && initialSuccessBody
        ?.createdAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_CREATED_AT
      && followUpSuccessBody
        ?.turn
        .id
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_TURN_ID
      && followUpSuccessBody
        ?.turn
        .createdAt
      === CONSULTING_INITIAL_FOLLOW_UP_E2E_FOLLOW_UP_CREATED_AT,
  };

  const negativeControls = {
    initialHttpStatusWouldFailIfComparedTo200:
      equalsNumber(
        initialHttpResponse.status,
        201,
      )
      && equalsNumber(
        initialHttpResponse.status,
        200,
      )
      === false,

    createCountOfTwoWouldFailExactCreateCheck:
      equalsNumber(
        createCallCountAfterInitial,
        1,
      )
      && equalsNumber(
        createCallCountAfterInitial,
        2,
      )
      === false,

    visibleForeignSessionWouldFailOwnerIsolation:
      ownerBDirectFind
      === null
      && (
        ownerBDirectFind
        !== null
      )
      === false
      && sameJson(
        ownerBDirectFind,
        ownerADirectFind,
      )
      === false,

    mutatedInitialTurnWouldFailUnchangedCheck:
      initialTurnSnapshot
      !== null
      && followUpRecord
      !== undefined
      && sameJson(
        {
          ...followUpRecord
            .session
            .turns[0],

          assistantAnswer:
            "변형된 최초 답변",
        },
        initialTurnSnapshot,
      )
      === false,

    previousAnswerInCurrentDecisionWouldFailIndependence:
      followUpPromptRegions
        .currentDecisionPortion
        .includes(
          INITIAL_MOCK_ASSISTANT_ANSWER,
        )
      === false
      && promptContainsValue(
        followUpPromptRegions
          .currentDecisionPortion
        + INITIAL_MOCK_ASSISTANT_ANSWER,
        INITIAL_MOCK_ASSISTANT_ANSWER,
      ),

    missingQuestionWouldFailOpenAIRequestCheck:
      capturedInitialRequests[0]
      !== undefined
      && promptContainsValue(
        capturedInitialRequests[0]
          .userPrompt
          .split(
            CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
          )
          .join(
            "",
          ),
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      )
      === false,

    unsavedConflictAnswerWouldFailIfPersisted:
      JSON.stringify(
        sessionAfterStaleConflict
          ?.session,
      )
        .includes(
          CONFLICT_UNSAVED_ASSISTANT_ANSWER,
        )
      === false
      && promptContainsValue(
        CONFLICT_UNSAVED_ASSISTANT_ANSWER,
        CONFLICT_UNSAVED_ASSISTANT_ANSWER,
      ),

    productionClientPathIsDetectedWhenRequestAnswerMissing:
      wouldUseProductionAnswerClient(
        undefined,
      )
      && wouldUseProductionAnswerClient(
        async () =>
          FOLLOW_UP_MOCK_ASSISTANT_ANSWER,
      )
      === false,
  };

  const checks = {
    ...initialChecks,

    ...followUpChecks,

    ...errorChecks,

    ...coreChecks,

    ...negativeControls,
  };

  return {
    checks,

    repository: {
      createCallCount:
        createCallCountAfterInitial,

      findByIdCallCount:
        findByIdCallCountAfterFollowUp,

      updateCallCount:
        updateCallCountAfterFollowUp,

      expectedUpdatedAt:
        expectedUpdatedAtAfterFollowUp,

      storedOwnerId:
        followUpRecord
          ?.ownerId
        ?? null,

      storedTurnKinds,
    },

    http: {
      initialStatus:
        initialHttpResponse.status,

      followUpStatus:
        followUpHttpResponse.status,

      missingAuthorizationStatus:
        missingAuthorizationHttpResponse.status,

      foreignOwnerStatus:
        foreignOwnerHttpResponse.status,

      staleConflictStatus:
        staleConflictHttpResponse.status,

      initialError:
        httpErrorCode(
          initialHttpResponse,
        ),

      followUpError:
        httpErrorCode(
          followUpHttpResponse,
        ),

      missingAuthorizationError:
        httpErrorCode(
          missingAuthorizationHttpResponse,
        ),

      foreignOwnerError:
        httpErrorCode(
          foreignOwnerHttpResponse,
        ),

      staleConflictError:
        httpErrorCode(
          staleConflictHttpResponse,
        ),
    },

    events: {
      initial:
        initialEvents,

      followUp:
        followUpEvents,

      foreignOwner:
        foreignOwnerEvents,

      staleConflict:
        staleConflictEvents,

      missingAuthorization:
        missingAuthorizationEvents,
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
