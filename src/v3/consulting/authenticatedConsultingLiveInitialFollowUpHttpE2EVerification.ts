import {
  AUTHENTICATED_HTTP_E2E_OWNER_A,
  AUTHENTICATED_HTTP_E2E_OWNER_B,
  AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_A,
  AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_B,
  OwnerAwareConsultingSessionStorage,
  OwnerScopedConsultingSessionRepository,
  verifyAuthenticatedConsultingInitialFollowUpHttpE2E,
} from "./authenticatedConsultingInitialFollowUpHttpE2EVerification.js";
import {
  createAuthenticatedInitialConsultingSession,
} from "./authenticatedInitialConsultingSessionService.js";
import type {
  AuthenticatedInitialConsultingSessionServiceDependencies,
} from "./authenticatedInitialConsultingSessionService.js";
import {
  handleAuthenticatedInitialConsultingSessionHttpRequest,
} from "./authenticatedInitialConsultingSessionHttpHandler.js";
import {
  buildAuthenticatedConsultingSessionTurnCommand,
} from "./authenticatedConsultingSessionTurnCommandBuilder.js";
import type {
  AuthenticatedConsultingSessionTurnCommandBuilderDependencies,
} from "./authenticatedConsultingSessionTurnCommandBuilder.js";
import {
  executeAuthenticatedConsultingSessionTurnRequest,
} from "./authenticatedConsultingSessionTurnService.js";
import {
  executeAuthenticatedPersistedConsultingSessionTurn,
} from "./authenticatedPersistedConsultingSessionTurnService.js";
import type {
  AuthenticatedPersistedConsultingSessionTurnDependencies,
  ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
} from "./authenticatedPersistedConsultingSessionTurnService.js";
import {
  handleAuthenticatedConsultingSessionTurnHttpRequest,
} from "./authenticatedConsultingSessionTurnHttpHandler.js";
import {
  CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
  CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,
  createInitialFollowUpAnswerE2ERequest,
  verifyConsultingInitialFollowUpAnswerE2E,
} from "./consultingInitialFollowUpAnswerE2EVerification.js";
import type {
  ConsultingSession,
} from "./consultingSession.js";
import type {
  ConsultingSessionOwnerId,
} from "./consultingSessionOwnerId.js";
import {
  parseConsultingSessionBearerToken,
  resolveConsultingSessionOwner,
} from "./consultingSessionOwnerResolver.js";
import type {
  ConsultingSessionAuthorizationHeader,
  ConsultingSessionOwnerResolver,
} from "./consultingSessionOwnerResolver.js";
import type {
  ConsultingSessionRepository,
} from "./consultingSessionRepository.js";
import {
  prepareConsultingSessionTurn,
} from "./consultingSessionTurnBuilder.js";
import {
  executePersistedConsultingSessionTurn,
} from "./persistedConsultingSessionTurnService.js";
import type {
  ExecutePersistedConsultingSessionTurnInput,
} from "./persistedConsultingSessionTurnService.js";
import {
  requestInitialConsultingAnswer,
} from "./initialConsultingAnswerRequester.js";
import {
  buildInitialConsultingExecution,
} from "./initialConsultingExecutionBuilder.js";
import type {
  InitialConsultingExecutionResult,
} from "./initialConsultingExecutionBuilder.js";
import {
  buildInitialConsultingSession,
} from "./initialConsultingSessionBuilder.js";
import {
  buildConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter.js";
import type {
  ConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter.js";
import {
  interpretQuestionSemantics,
} from "./question/questionSemanticInterpreter.js";
import type {
  QuestionReaderResult,
} from "./question/questionReader.js";
import {
  inspectConsultingLiveAnswer,
} from "./explanation/consultingLiveAnswerQualityVerification.js";
import type {
  ConsultingLiveAnswerQualityCaseResult,
} from "./explanation/consultingLiveAnswerQualityVerification.js";
import {
  buildConsultingLiveAnswerSemanticGateEvaluationPrompt,
  computeConsultingLiveAnswerSemanticGatePassed,
  inspectConsultingLiveAnswerSemanticGateJson,
  verifyConsultingLiveAnswerSemanticGateContract,
} from "./explanation/consultingLiveAnswerSemanticGateVerification.js";
import type {
  ConsultingLiveAnswerSemanticGateCaseResult,
  ConsultingLiveAnswerSemanticGateEvaluation,
  ConsultingLiveAnswerSemanticGateInspectResult,
} from "./explanation/consultingLiveAnswerSemanticGateVerification.js";

export const AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_OPENAI_CALL_COUNT =
  6;

export const AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_EVENTS = [
  "initialInterpretation",
  "initialAnswer",
  "initialSemanticGate",
  "followUpInterpretation",
  "followUpAnswer",
  "followUpSemanticGate",
] as const;

const AUTHORIZATION_OWNER_A =
  `Bearer ${AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_A}`;

const AUTHORIZATION_OWNER_B =
  `Bearer ${AUTHENTICATED_HTTP_E2E_TOKEN_OWNER_B}`;

const LIVE_SESSION_ID =
  "session-live-authenticated-http-initial-follow-up-e2e-001";

const LIVE_INITIAL_TURN_ID =
  "turn-live-authenticated-http-initial-follow-up-e2e-001";

const LIVE_FOLLOW_UP_TURN_ID =
  "turn-live-authenticated-http-initial-follow-up-e2e-002";

const LIVE_CREATED_AT =
  "2026-08-21T02:00:00+09:00";

const LIVE_FOLLOW_UP_CREATED_AT =
  "2026-08-21T02:11:00+09:00";

const CONTRACT_SESSION_ID =
  "session-live-authenticated-http-contract-001";

const LIVE_E2E_LIMITATIONS = [
  "이 E2E는 인증 HTTP 핸들러와 소유자 범위 in-memory repository를 검증하지만 실제 Supabase와 배포 HTTP API는 호출하지 않는다.",
  "질문 의미 해석은 실제 interpretQuestionSemantics를 사용하며, 현재 구현은 요청당 OpenAI responses.create를 1회 호출하고 재시도가 없다. 이 검증은 SDK responses.create를 monkey patch하지 않고 논리적 OpenAI 요청 함수 경계에서만 호출 횟수를 기록한다.",
  "Semantic Gate는 동일 계열 모델 평가이며 인간 ground truth가 아니다.",
  "의미 검증 결과는 생산 차단기가 아니라 수동 검토 자료이다.",
] as const;

export type AuthenticatedConsultingLiveInterpretationSummary = {
  originalQuestion:
    string;

  topic:
    string;

  intent:
    string;

  motive:
    string;

  decisionTarget:
    string;

  analysisMode:
    string;

  asksWhat:
    string;

  decisionQuestion:
    string;

  confidence:
    number;
};

export type AuthenticatedConsultingLiveHttpE2EStageResult = {
  interpretation:
    AuthenticatedConsultingLiveInterpretationSummary;

  verdict:
    string;

  liveInspection:
    ConsultingLiveAnswerQualityCaseResult;

  semanticGate:
    ConsultingLiveAnswerSemanticGateCaseResult;
};

export type AuthenticatedConsultingLiveHttpE2EOpenAiCounters = {
  initialInterpretationCallCount:
    number;

  initialAnswerCallCount:
    number;

  initialSemanticGateCallCount:
    number;

  followUpInterpretationCallCount:
    number;

  followUpAnswerCallCount:
    number;

  followUpSemanticGateCallCount:
    number;

  totalOpenAICallCount:
    number;
};

export type AuthenticatedConsultingLiveInitialFollowUpHttpE2EContractResult = {
  negativeChecks:
    Record<
      string,
      boolean
    >;

  repository: {
    ownerAFound:
      boolean;

    ownerBFound:
      boolean;
  };

  passed:
    boolean;
};

export type AuthenticatedConsultingLiveInitialFollowUpHttpE2ENonApiResult = {
  authenticatedHttpE2EPassed:
    boolean;

  initialFollowUpAnswerE2EPassed:
    boolean;

  semanticGateContractPassed:
    boolean;

  contract:
    AuthenticatedConsultingLiveInitialFollowUpHttpE2EContractResult;

  passed:
    boolean;
};

export type AuthenticatedConsultingLiveInitialFollowUpHttpE2EVerificationResult = {
  nonApiPassed:
    boolean;

  liveAttempted:
    boolean;

  expectedOpenAiCallCount:
    typeof AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_OPENAI_CALL_COUNT;

  openAiCallCount:
    number;

  counters:
    AuthenticatedConsultingLiveHttpE2EOpenAiCounters;

  events:
    string[];

  sessionId:
    string | null;

  ownerId:
    string | null;

  sessionTurnCount:
    number | null;

  sessionTurnKinds:
    string[];

  initial:
    AuthenticatedConsultingLiveHttpE2EStageResult | null;

  followUp:
    AuthenticatedConsultingLiveHttpE2EStageResult | null;

  repository: {
    createCallCount:
      number;

    findByIdCallCount:
      number;

    updateCallCount:
      number;

    expectedUpdatedAt:
      string | null;
  };

  negativeChecks:
    Record<
      string,
      boolean
    >;

  nonApi:
    AuthenticatedConsultingLiveInitialFollowUpHttpE2ENonApiResult;

  passed:
    boolean;

  limitations:
    readonly string[];
};

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

function isExpectedOpenAiCallCount(
  count:
    number,
): boolean {
  return count
    === AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_OPENAI_CALL_COUNT;
}

function openAiCallOrderMatches(
  events:
    readonly string[],
): boolean {
  return sameJson(
    events,
    [
      ...AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_EVENTS,
    ],
  );
}

function interpretationsAreIndependent(
  initialInterpretation:
    object,
  followUpInterpretation:
    object,
): boolean {
  return initialInterpretation
    !== followUpInterpretation;
}

function followUpInterpretationMatchesQuestion(
  interpretation: {
    originalQuestion:
      string;
  },
  question:
    string,
): boolean {
  return interpretation.originalQuestion
    === question;
}

function sessionTurnKindsAreInitialAndFollowUp(
  kinds:
    readonly string[],
): boolean {
  return kinds.length
    === 2
    && kinds[0]
      === "initial"
    && kinds[1]
      === "followUp";
}

function foreignOwnerMissesSession(
  found:
    ConsultingSession | null,
): boolean {
  return found
    === null;
}

function expectedUpdatedAtMatchesStored(
  expectedUpdatedAt:
    string,
  storedUpdatedAt:
    string,
): boolean {
  return expectedUpdatedAt
    === storedUpdatedAt;
}

function totalOpenAICallCountFromStages(
  counters:
    Omit<
      AuthenticatedConsultingLiveHttpE2EOpenAiCounters,
      "totalOpenAICallCount"
    >,
): number {
  return counters.initialInterpretationCallCount
    + counters.initialAnswerCallCount
    + counters.initialSemanticGateCallCount
    + counters.followUpInterpretationCallCount
    + counters.followUpAnswerCallCount
    + counters.followUpSemanticGateCallCount;
}

function summarizeQuestionInterpretation(
  interpretation:
    QuestionReaderResult,
): AuthenticatedConsultingLiveInterpretationSummary {
  return {
    originalQuestion:
      interpretation.originalQuestion,

    topic:
      interpretation.topic,

    intent:
      interpretation.intent,

    motive:
      interpretation.motive,

    decisionTarget:
      interpretation.decisionTarget,

    analysisMode:
      interpretation.analysisMode,

    asksWhat:
      interpretation.asksWhat,

    decisionQuestion:
      interpretation.decisionQuestion,

    confidence:
      interpretation.confidence,
  };
}

function toSemanticGateCaseResult(
  input: {
    name:
      string;

    originalQuestion:
      string;

    verdict:
      string;

    finalDecision:
      string;
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

function buildValidSemanticGateEvaluation(
  overrides:
    Partial<
      ConsultingLiveAnswerSemanticGateEvaluation
    > = {},
): ConsultingLiveAnswerSemanticGateEvaluation {
  return {
    verdictAlignment:
      "preserved",

    targetAlignment:
      "preserved",

    intentAlignment:
      "preserved",

    topicAlignment:
      "preserved",

    groundingStatus:
      "grounded",

    materialUnsupportedClaims:
      [],

    requiredContentCoverage:
      "complete",

    materialOmissions:
      [],

    confidence:
      "high",

    rationale:
      "제공된 Prompt 자료와 상담문의 결론이 직접적으로 일치한다.",

    ...overrides,
  };
}

function createOwnerResolver():
  ConsultingSessionOwnerResolver {
  return {
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
}

function createSharedRepositoryFactory(
  storage:
    OwnerAwareConsultingSessionStorage,
  ownerResolver:
    ConsultingSessionOwnerResolver,
  onEvent:
    (
      event:
        string,
    ) => void
    = () => undefined,
): (
  input: {
    authorizationHeader:
      ConsultingSessionAuthorizationHeader;

    environment?:
      unknown;
  },
) => Promise<
  ConsultingSessionRepository
> {
  return async (
    input,
  ) => {
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
      onEvent,
    );
  };
}

function emptyCounters():
  AuthenticatedConsultingLiveHttpE2EOpenAiCounters {
  return {
    initialInterpretationCallCount:
      0,

    initialAnswerCallCount:
      0,

    initialSemanticGateCallCount:
      0,

    followUpInterpretationCallCount:
      0,

    followUpAnswerCallCount:
      0,

    followUpSemanticGateCallCount:
      0,

    totalOpenAICallCount:
      0,
  };
}

function withTotal(
  counters:
    Omit<
      AuthenticatedConsultingLiveHttpE2EOpenAiCounters,
      "totalOpenAICallCount"
    >,
): AuthenticatedConsultingLiveHttpE2EOpenAiCounters {
  return {
    ...counters,

    totalOpenAICallCount:
      totalOpenAICallCountFromStages(
        counters,
      ),
  };
}

/**
 * API를 호출하지 않는 계약·negative control.
 *
 * 잘못된 입력을 실제 검사 함수에 넣어 실패하는 것을 확인한다.
 */
export async function verifyAuthenticatedConsultingLiveInitialFollowUpHttpE2EContract():
  Promise<
    AuthenticatedConsultingLiveInitialFollowUpHttpE2EContractResult
  > {
  const reusedInterpretation = {
    originalQuestion:
      CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
  };

  const independentFollowUpInterpretation = {
    originalQuestion:
      CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
  };

  const missingFinalDecisionInspection =
    inspectConsultingLiveAnswer({
      name:
        "negative-missing-final-decision",

      originalQuestion:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

      verdict:
        "conditionallyRecommended",

      finalDecision:
        "현재는 조건을 갖춘 뒤에 시작하는 편이 맞습니다.",

      expectedSubjectTerms:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,

      answer:
        "사업 시작 여부를 설명합니다.",
    });

  const materialUnsupportedEvaluation =
    buildValidSemanticGateEvaluation({
      groundingStatus:
        "materialUnsupported",

      materialUnsupportedClaims: [
        {
          claim:
            "원문에 없는 사주 사실을 단정한다.",

          reason:
            "Prompt 자료에 해당 근거가 없다.",
        },
      ],

      rationale:
        "상담문이 Prompt에 없는 사실을 추가했다.",
    });

  const materialUnsupportedInspected =
    inspectConsultingLiveAnswerSemanticGateJson(
      JSON.stringify(
        materialUnsupportedEvaluation,
      ),
    );

  const storage =
    new OwnerAwareConsultingSessionStorage();

  const ownerARepository =
    new OwnerScopedConsultingSessionRepository(
      storage,
      AUTHENTICATED_HTTP_E2E_OWNER_A,
      () => undefined,
    );

  const ownerBRepository =
    new OwnerScopedConsultingSessionRepository(
      storage,
      AUTHENTICATED_HTTP_E2E_OWNER_B,
      () => undefined,
    );

  const contractSession = {
    id:
      CONTRACT_SESSION_ID,

    updatedAt:
      LIVE_CREATED_AT,

    turns: [
      {
        kind:
          "initial",
      },
    ],
  } as unknown as ConsultingSession;

  await ownerARepository.create(
    contractSession,
  );

  const ownerAFound =
    await ownerARepository.findById(
      CONTRACT_SESSION_ID,
    );

  const ownerBFound =
    await ownerBRepository.findById(
      CONTRACT_SESSION_ID,
    );

  const negativeChecks = {
    callCountFiveWouldFail:
      isExpectedOpenAiCallCount(
        5,
      )
      === false,

    callCountSevenWouldFail:
      isExpectedOpenAiCallCount(
        7,
      )
      === false,

    expectedCallCountSixWouldPass:
      isExpectedOpenAiCallCount(
        AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_OPENAI_CALL_COUNT,
      ),

    reorderedEventsWouldFail:
      openAiCallOrderMatches(
        [
          "initialAnswer",
          "initialInterpretation",
          "initialSemanticGate",
          "followUpInterpretation",
          "followUpAnswer",
          "followUpSemanticGate",
        ],
      )
      === false,

    expectedEventOrderWouldPass:
      openAiCallOrderMatches(
        AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_EVENTS,
      ),

    reusedInterpretationObjectWouldFail:
      interpretationsAreIndependent(
        reusedInterpretation,
        reusedInterpretation,
      )
      === false,

    independentInterpretationObjectsWouldPass:
      interpretationsAreIndependent(
        reusedInterpretation,
        independentFollowUpInterpretation,
      ),

    mismatchedFollowUpQuestionWouldFail:
      followUpInterpretationMatchesQuestion(
        {
          originalQuestion:
            "다른 후속 질문 원문",
        },
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      )
      === false,

    matchingFollowUpQuestionWouldPass:
      followUpInterpretationMatchesQuestion(
        {
          originalQuestion:
            CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
        },
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      ),

    missingFinalDecisionWouldFail:
      missingFinalDecisionInspection
        .checks
        .engineFinalDecisionAppearsExactlyOnce
      === false,

    materialUnsupportedWouldFail:
      computeConsultingLiveAnswerSemanticGatePassed(
        materialUnsupportedEvaluation,
      )
      === false
      && materialUnsupportedInspected.passed
      === false,

    missingFollowUpTurnWouldFail:
      sessionTurnKindsAreInitialAndFollowUp(
        [
          "initial",
        ],
      )
      === false,

    initialAndFollowUpTurnsWouldPass:
      sessionTurnKindsAreInitialAndFollowUp(
        [
          "initial",
          "followUp",
        ],
      ),

    foreignOwnerLookupWouldFail:
      foreignOwnerMissesSession(
        ownerBFound,
      )
      && foreignOwnerMissesSession(
        ownerAFound,
      )
      === false,

    staleExpectedUpdatedAtWouldFail:
      expectedUpdatedAtMatchesStored(
        "1999-01-01T00:00:00+09:00",
        LIVE_CREATED_AT,
      )
      === false,

    matchingExpectedUpdatedAtWouldPass:
      expectedUpdatedAtMatchesStored(
        LIVE_CREATED_AT,
        LIVE_CREATED_AT,
      ),
  };

  return {
    negativeChecks,

    repository: {
      ownerAFound:
        ownerAFound
        !== null,

      ownerBFound:
        ownerBFound
        !== null,
    },

    passed:
      Object.values(
        negativeChecks,
      )
        .every(
          Boolean,
        )
      && ownerAFound
        !== null
      && ownerBFound
        === null,
  };
}

/**
 * Live OpenAI 호출 전에 실행하는 비-API 차단기.
 */
export async function verifyAuthenticatedConsultingLiveInitialFollowUpHttpE2ENonApi():
  Promise<
    AuthenticatedConsultingLiveInitialFollowUpHttpE2ENonApiResult
  > {
  const contract =
    await verifyAuthenticatedConsultingLiveInitialFollowUpHttpE2EContract();

  const authenticatedHttpE2E =
    await verifyAuthenticatedConsultingInitialFollowUpHttpE2E();

  const initialFollowUpAnswerE2E =
    await verifyConsultingInitialFollowUpAnswerE2E();

  const semanticGateContract =
    verifyConsultingLiveAnswerSemanticGateContract();

  return {
    authenticatedHttpE2EPassed:
      authenticatedHttpE2E.passed,

    initialFollowUpAnswerE2EPassed:
      initialFollowUpAnswerE2E.passed,

    semanticGateContractPassed:
      semanticGateContract.passed,

    contract,

    passed:
      contract.passed
      && authenticatedHttpE2E.passed
      && initialFollowUpAnswerE2E.passed
      && semanticGateContract.passed,
  };
}

function buildLiveResult(
  input: {
    nonApi:
      AuthenticatedConsultingLiveInitialFollowUpHttpE2ENonApiResult;

    liveAttempted:
      boolean;

    counters:
      Omit<
        AuthenticatedConsultingLiveHttpE2EOpenAiCounters,
        "totalOpenAICallCount"
      >;

    events:
      string[];

    sessionId:
      string | null;

    ownerId:
      string | null;

    sessionTurnCount:
      number | null;

    sessionTurnKinds:
      string[];

    initial:
      AuthenticatedConsultingLiveHttpE2EStageResult | null;

    followUp:
      AuthenticatedConsultingLiveHttpE2EStageResult | null;

    repository: {
      createCallCount:
        number;

      findByIdCallCount:
        number;

      updateCallCount:
        number;

      expectedUpdatedAt:
        string | null;
    };

    liveNegativeChecks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  },
): AuthenticatedConsultingLiveInitialFollowUpHttpE2EVerificationResult {
  const counters =
    withTotal(
      input.counters,
    );

  return {
    nonApiPassed:
      input.nonApi.passed,

    liveAttempted:
      input.liveAttempted,

    expectedOpenAiCallCount:
      AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_OPENAI_CALL_COUNT,

    openAiCallCount:
      counters.totalOpenAICallCount,

    counters,

    events:
      input.events,

    sessionId:
      input.sessionId,

    ownerId:
      input.ownerId,

    sessionTurnCount:
      input.sessionTurnCount,

    sessionTurnKinds:
      input.sessionTurnKinds,

    initial:
      input.initial,

    followUp:
      input.followUp,

    repository:
      input.repository,

    negativeChecks: {
      ...input.nonApi.contract.negativeChecks,

      ...input.liveNegativeChecks,
    },

    nonApi:
      input.nonApi,

    passed:
      input.passed,

    limitations:
      LIVE_E2E_LIMITATIONS,
  };
}

/**
 * 인증 HTTP 최초 상담 → 후속 상담 Live E2E.
 *
 * 실제 interpretQuestionSemantics와 상담 답변/Semantic Gate
 * OpenAI 요청을 하나의 인증 HTTP 세션으로 순차 6회 검증한다.
 *
 * 기본 회귀·build에서는 실행하지 않는 수동 Execution 전용이다.
 * 비-API 차단기가 실패하면 OpenAI를 호출하지 않는다.
 *
 * API 호출:
 * - 최초 질문 의미 해석 1회
 * - 최초 상담 답변 생성 1회
 * - 최초 답변 Semantic Gate 평가 1회
 * - 후속 질문 의미 해석 1회
 * - 후속 상담 답변 생성 1회
 * - 후속 답변 Semantic Gate 평가 1회
 * - 합계 6회, 순차 실행, 재시도·병렬 없음
 */
export async function verifyAuthenticatedConsultingLiveInitialFollowUpHttpE2E():
  Promise<
    AuthenticatedConsultingLiveInitialFollowUpHttpE2EVerificationResult
  > {
  const nonApi =
    await verifyAuthenticatedConsultingLiveInitialFollowUpHttpE2ENonApi();

  const emptyRepository = {
    createCallCount:
      0,

    findByIdCallCount:
      0,

    updateCallCount:
      0,

    expectedUpdatedAt:
      null as string | null,
  };

  if (
    !nonApi.passed
  ) {
    return buildLiveResult({
      nonApi,

      liveAttempted:
        false,

      counters:
        emptyCounters(),

      events:
        [],

      sessionId:
        null,

      ownerId:
        null,

      sessionTurnCount:
        null,

      sessionTurnKinds:
        [],

      initial:
        null,

      followUp:
        null,

      repository:
        emptyRepository,

      liveNegativeChecks:
        {},

      passed:
        false,
    });
  }

  const {
    requestConsultingAnswer,
  } = await import(
    "./openai/consultingOpenAIClient.js"
  );

  const request =
    createInitialFollowUpAnswerE2ERequest();

  const storage =
    new OwnerAwareConsultingSessionStorage();

  const ownerResolver =
    createOwnerResolver();

  const createRepository =
    createSharedRepositoryFactory(
      storage,
      ownerResolver,
    );

  const events:
    string[] =
      [];

  let initialInterpretationCallCount =
    0;

  let initialAnswerCallCount =
    0;

  let initialSemanticGateCallCount =
    0;

  let followUpInterpretationCallCount =
    0;

  let followUpAnswerCallCount =
    0;

  let followUpSemanticGateCallCount =
    0;

  let capturedInitialInterpretation:
    QuestionReaderResult | undefined;

  let capturedFollowUpInterpretation:
    QuestionReaderResult | undefined;

  let capturedInitialExecution:
    InitialConsultingExecutionResult | undefined;

  let capturedInitialOpenAIRequest:
    ConsultingOpenAIRequest | undefined;

  let capturedFollowUpOpenAIRequest:
    ConsultingOpenAIRequest | undefined;

  const currentCounters = () =>
    ({
      initialInterpretationCallCount,

      initialAnswerCallCount,

      initialSemanticGateCallCount,

      followUpInterpretationCallCount,

      followUpAnswerCallCount,

      followUpSemanticGateCallCount,
    });

  const abortLive = (
    extra: {
      sessionId?:
        string | null;

      ownerId?:
        string | null;

      sessionTurnCount?:
        number | null;

      sessionTurnKinds?:
        string[];

      initial?:
        AuthenticatedConsultingLiveHttpE2EStageResult | null;

      followUp?:
        AuthenticatedConsultingLiveHttpE2EStageResult | null;

      expectedUpdatedAt?:
        string | null;

      liveNegativeChecks?:
        Record<
          string,
          boolean
        >;
    } = {},
  ) =>
    buildLiveResult({
      nonApi,

      liveAttempted:
        true,

      counters:
        currentCounters(),

      events:
        [
          ...events,
        ],

      sessionId:
        extra.sessionId
        ?? LIVE_SESSION_ID,

      ownerId:
        extra.ownerId
        ?? AUTHENTICATED_HTTP_E2E_OWNER_A,

      sessionTurnCount:
        extra.sessionTurnCount
        ?? null,

      sessionTurnKinds:
        extra.sessionTurnKinds
        ?? [],

      initial:
        extra.initial
        ?? null,

      followUp:
        extra.followUp
        ?? null,

      repository: {
        createCallCount:
          storage.createCallCount,

        findByIdCallCount:
          storage.findByIdCallCount,

        updateCallCount:
          storage.updateCallCount,

        expectedUpdatedAt:
          extra.expectedUpdatedAt
          ?? storage
            .expectedUpdatedAtValues[0]
          ?? null,
      },

      liveNegativeChecks:
        extra.liveNegativeChecks
        ?? {},

      passed:
        false,
    });

  const initialServiceDependencies:
    AuthenticatedInitialConsultingSessionServiceDependencies = {
      createRepository,

      createSessionId() {
        return LIVE_SESSION_ID;
      },

      createTurnId() {
        return LIVE_INITIAL_TURN_ID;
      },

      now() {
        return LIVE_CREATED_AT;
      },

      async interpretQuestion(
        question,
      ) {
        initialInterpretationCallCount +=
          1;

        events.push(
          "initialInterpretation",
        );

        capturedInitialInterpretation =
          await interpretQuestionSemantics(
            question,
          );

        return capturedInitialInterpretation;
      },

      buildExecution(
        sourceRequest,
        questionInterpretation,
      ) {
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
        capturedInitialExecution =
          execution;

        initialAnswerCallCount +=
          1;

        events.push(
          "initialAnswer",
        );

        return requestInitialConsultingAnswer(
          execution,
          async (
            openAIRequest,
          ) => {
            capturedInitialOpenAIRequest =
              openAIRequest;

            return requestConsultingAnswer(
              openAIRequest,
            );
          },
        );
      },

      buildSession(
        input,
      ) {
        return buildInitialConsultingSession(
          input,
        );
      },
    };

  const followUpCommandBuilderDependencies:
    AuthenticatedConsultingSessionTurnCommandBuilderDependencies = {
      createTurnId() {
        return LIVE_FOLLOW_UP_TURN_ID;
      },

      now() {
        return LIVE_FOLLOW_UP_CREATED_AT;
      },
    };

  const persistedDependencies:
    AuthenticatedPersistedConsultingSessionTurnDependencies = {
      createRepository,

      async interpretQuestion(
        question,
      ) {
        followUpInterpretationCallCount +=
          1;

        events.push(
          "followUpInterpretation",
        );

        capturedFollowUpInterpretation =
          await interpretQuestionSemantics(
            question,
          );

        return capturedFollowUpInterpretation;
      },

      async executeTurn(
        input:
          ExecutePersistedConsultingSessionTurnInput,
      ) {
        return executePersistedConsultingSessionTurn({
          ...input,

          requestAnswer:
            async (
              openAIRequest,
            ) => {
              followUpAnswerCallCount +=
                1;

              events.push(
                "followUpAnswer",
              );

              capturedFollowUpOpenAIRequest =
                openAIRequest;

              return requestConsultingAnswer(
                openAIRequest,
              );
            },
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

  const initialRecord =
    storage.peek(
      LIVE_SESSION_ID,
    );

  if (
    initialHttpResponse.status
      !== 201
    || initialRecord
      === undefined
    || capturedInitialInterpretation
      === undefined
    || capturedInitialExecution
      === undefined
    || capturedInitialOpenAIRequest
      === undefined
    || initialAnswerCallCount
      !== 1
    || capturedInitialExecution
      .turnResult
      .decisionResult
      .verdict
      === "insufficientEvidence"
    || initialRecord
      .session
      .pendingClarification
      !== null
  ) {
    return abortLive({
      sessionId:
        initialRecord
          ?.session
          .id
        ?? null,

      ownerId:
        initialRecord
          ?.ownerId
        ?? AUTHENTICATED_HTTP_E2E_OWNER_A,

      sessionTurnCount:
        initialRecord
          ?.session
          .turns
          .length
        ?? null,

      sessionTurnKinds:
        initialRecord
          ?.session
          .turns
          .map(
            (
              turn,
            ) =>
              turn.kind,
          )
        ?? [],
    });
  }

  const initialSessionSnapshot =
    cloneJson(
      initialRecord.session,
    );

  const initialAssistantAnswer =
    initialRecord
      .session
      .turns[0]
      .assistantAnswer;

  const initialInspection =
    inspectConsultingLiveAnswer({
      name:
        "live-authenticated-http-initial-business-start",

      originalQuestion:
        capturedInitialInterpretation.originalQuestion,

      verdict:
        capturedInitialExecution
          .turnResult
          .decisionResult
          .verdict,

      finalDecision:
        capturedInitialExecution
          .turnResult
          .explanationPayload
          .finalDecision,

      expectedSubjectTerms:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,

      answer:
        initialAssistantAnswer,
    });

  if (
    !initialInspection.passed
  ) {
    return abortLive({
      sessionTurnCount:
        initialRecord
          .session
          .turns
          .length,

      sessionTurnKinds:
        initialRecord
          .session
          .turns
          .map(
            (
              turn,
            ) =>
              turn.kind,
          ),

      ownerId:
        initialRecord.ownerId,
    });
  }

  initialSemanticGateCallCount +=
    1;

  events.push(
    "initialSemanticGate",
  );

  const initialSemanticGateRaw =
    await requestConsultingAnswer(
      buildConsultingOpenAIRequest(
        buildConsultingLiveAnswerSemanticGateEvaluationPrompt({
          originalQuestion:
            capturedInitialInterpretation.originalQuestion,

          verdict:
            capturedInitialExecution
              .turnResult
              .decisionResult
              .verdict,

          finalDecision:
            capturedInitialExecution
              .turnResult
              .explanationPayload
              .finalDecision,

          decisionTarget:
            capturedInitialExecution
              .turnResult
              .decisionResult
              .decisionTarget,

          intent:
            capturedInitialExecution
              .turnResult
              .decisionResult
              .intent,

          topic:
            capturedInitialExecution
              .turnResult
              .decisionResult
              .topic,

          sourceSystemPrompt:
            capturedInitialOpenAIRequest.systemPrompt,

          sourceUserPrompt:
            capturedInitialOpenAIRequest.userPrompt,

          assistantAnswer:
            initialAssistantAnswer,
        }),
      ),
    );

  const initialSemanticGate =
    toSemanticGateCaseResult(
      {
        name:
          "live-authenticated-http-initial-business-start",

        originalQuestion:
          capturedInitialInterpretation.originalQuestion,

        verdict:
          capturedInitialExecution
            .turnResult
            .decisionResult
            .verdict,

        finalDecision:
          capturedInitialExecution
            .turnResult
            .explanationPayload
            .finalDecision,
      },
      inspectConsultingLiveAnswerSemanticGateJson(
        initialSemanticGateRaw,
      ),
    );

  const initialStage: AuthenticatedConsultingLiveHttpE2EStageResult = {
    interpretation:
      summarizeQuestionInterpretation(
        capturedInitialInterpretation,
      ),

    verdict:
      capturedInitialExecution
        .turnResult
        .decisionResult
        .verdict,

    liveInspection:
      initialInspection,

    semanticGate:
      initialSemanticGate,
  };

  if (
    !initialSemanticGate.passed
  ) {
    return abortLive({
      sessionTurnCount:
        initialRecord
          .session
          .turns
          .length,

      sessionTurnKinds:
        initialRecord
          .session
          .turns
          .map(
            (
              turn,
            ) =>
              turn.kind,
          ),

      ownerId:
        initialRecord.ownerId,

      initial:
        initialStage,
    });
  }

  const followUpHttpResponse =
    await handleAuthenticatedConsultingSessionTurnHttpRequest(
      {
        method:
          "POST",

        authorizationHeader:
          AUTHORIZATION_OWNER_A,

        body: {
          sessionId:
            LIVE_SESSION_ID,

          kind:
            "followUp",

          question:
            CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
        },
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
                return buildAuthenticatedConsultingSessionTurnCommand(
                  buildInput,
                  builderDependencies,
                );
              },

              executeTurn(
                command:
                  ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
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

  const followUpRecord =
    storage.peek(
      LIVE_SESSION_ID,
    );

  const expectedUpdatedAt =
    storage
      .expectedUpdatedAtValues[0]
    ?? null;

  if (
    followUpHttpResponse.status
      !== 200
    || followUpRecord
      === undefined
    || capturedFollowUpInterpretation
      === undefined
    || capturedFollowUpOpenAIRequest
      === undefined
    || followUpAnswerCallCount
      !== 1
    || followUpRecord
      .session
      .pendingClarification
      !== null
  ) {
    return abortLive({
      sessionTurnCount:
        followUpRecord
          ?.session
          .turns
          .length
        ?? initialRecord
          .session
          .turns
          .length,

      sessionTurnKinds:
        followUpRecord
          ?.session
          .turns
          .map(
            (
              turn,
            ) =>
              turn.kind,
          )
        ?? initialRecord
          .session
          .turns
          .map(
            (
              turn,
            ) =>
              turn.kind,
          ),

      ownerId:
        followUpRecord
          ?.ownerId
        ?? initialRecord.ownerId,

      expectedUpdatedAt,

      initial:
        initialStage,
    });
  }

  const followUpPreparation =
    prepareConsultingSessionTurn({
      session:
        initialSessionSnapshot,

      kind:
        "followUp",

      question:
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,

      preparedAt:
        LIVE_FOLLOW_UP_CREATED_AT,

      questionInterpretation:
        capturedFollowUpInterpretation,
    });

  if (
    followUpPreparation
      .turnResult
      .decisionResult
      .verdict
      === "insufficientEvidence"
  ) {
    return abortLive({
      sessionTurnCount:
        followUpRecord
          .session
          .turns
          .length,

      sessionTurnKinds:
        followUpRecord
          .session
          .turns
          .map(
            (
              turn,
            ) =>
              turn.kind,
          ),

      ownerId:
        followUpRecord.ownerId,

      expectedUpdatedAt,

      initial:
        initialStage,
    });
  }

  const followUpAssistantAnswer =
    followUpRecord
      .session
      .turns[
        followUpRecord
          .session
          .turns
          .length - 1
      ]
      .assistantAnswer;

  const followUpInspection =
    inspectConsultingLiveAnswer({
      name:
        "live-authenticated-http-follow-up-business-start",

      originalQuestion:
        capturedFollowUpInterpretation.originalQuestion,

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

  if (
    !followUpInspection.passed
  ) {
    return abortLive({
      sessionTurnCount:
        followUpRecord
          .session
          .turns
          .length,

      sessionTurnKinds:
        followUpRecord
          .session
          .turns
          .map(
            (
              turn,
            ) =>
              turn.kind,
          ),

      ownerId:
        followUpRecord.ownerId,

      expectedUpdatedAt,

      initial:
        initialStage,
    });
  }

  followUpSemanticGateCallCount +=
    1;

  events.push(
    "followUpSemanticGate",
  );

  const followUpSemanticGateRaw =
    await requestConsultingAnswer(
      buildConsultingOpenAIRequest(
        buildConsultingLiveAnswerSemanticGateEvaluationPrompt({
          originalQuestion:
            capturedFollowUpInterpretation.originalQuestion,

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
            capturedFollowUpOpenAIRequest.systemPrompt,

          sourceUserPrompt:
            capturedFollowUpOpenAIRequest.userPrompt,

          assistantAnswer:
            followUpAssistantAnswer,
        }),
      ),
    );

  const followUpSemanticGate =
    toSemanticGateCaseResult(
      {
        name:
          "live-authenticated-http-follow-up-business-start",

        originalQuestion:
          capturedFollowUpInterpretation.originalQuestion,

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

  const followUpStage: AuthenticatedConsultingLiveHttpE2EStageResult = {
    interpretation:
      summarizeQuestionInterpretation(
        capturedFollowUpInterpretation,
      ),

    verdict:
      followUpPreparation
        .turnResult
        .decisionResult
        .verdict,

    liveInspection:
      followUpInspection,

    semanticGate:
      followUpSemanticGate,
  };

  const createCallCountAfterSuccess =
    storage.createCallCount;

  const findByIdCallCountAfterSuccess =
    storage.findByIdCallCount;

  const updateCallCountAfterSuccess =
    storage.updateCallCount;

  const ownerBRepository =
    await createRepository({
      authorizationHeader:
        AUTHORIZATION_OWNER_B,
    });

  const ownerBFind =
    await ownerBRepository.findById(
      LIVE_SESSION_ID,
    );

  const storedTurnKinds =
    followUpRecord
      .session
      .turns
      .map(
        (
          turn,
        ) =>
          turn.kind,
      );

  const counters =
    currentCounters();

  const liveNegativeChecks = {
    actualCallCountFiveWouldFail:
      isExpectedOpenAiCallCount(
        5,
      )
      === false
      && isExpectedOpenAiCallCount(
        counters.initialInterpretationCallCount
          + counters.initialAnswerCallCount
          + counters.initialSemanticGateCallCount
          + counters.followUpInterpretationCallCount
          + counters.followUpAnswerCallCount
          + counters.followUpSemanticGateCallCount,
      ),

    actualCallCountSevenWouldFail:
      isExpectedOpenAiCallCount(
        7,
      )
      === false,

    actualReorderedEventsWouldFail:
      openAiCallOrderMatches(
        [
          events[1]
          ?? "initialAnswer",
          events[0]
          ?? "initialInterpretation",
          ...events.slice(
            2,
          ),
        ],
      )
      === false
      && openAiCallOrderMatches(
        events,
      ),

    actualReusedInterpretationObjectWouldFail:
      interpretationsAreIndependent(
        capturedInitialInterpretation,
        capturedInitialInterpretation,
      )
      === false
      && interpretationsAreIndependent(
        capturedInitialInterpretation,
        capturedFollowUpInterpretation,
      ),

    actualMismatchedFollowUpQuestionWouldFail:
      followUpInterpretationMatchesQuestion(
        {
          originalQuestion:
            `${capturedFollowUpInterpretation.originalQuestion}-mismatch`,
        },
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      )
      === false
      && followUpInterpretationMatchesQuestion(
        capturedFollowUpInterpretation,
        CONSULTING_INITIAL_FOLLOW_UP_E2E_QUESTION,
      ),

    actualMissingFinalDecisionWouldFail:
      inspectConsultingLiveAnswer({
        name:
          "negative-live-missing-final-decision",

        originalQuestion:
          capturedInitialInterpretation.originalQuestion,

        verdict:
          capturedInitialExecution
            .turnResult
            .decisionResult
            .verdict,

        finalDecision:
          capturedInitialExecution
            .turnResult
            .explanationPayload
            .finalDecision,

        expectedSubjectTerms:
          CONSULTING_INITIAL_FOLLOW_UP_E2E_SUBJECT_TERMS,

        answer:
          initialAssistantAnswer
            .split(
              capturedInitialExecution
                .turnResult
                .explanationPayload
                .finalDecision,
            )
            .join(
              "",
            ),
      })
        .checks
        .engineFinalDecisionAppearsExactlyOnce
      === false
      && initialInspection
        .checks
        .engineFinalDecisionAppearsExactlyOnce
      && followUpInspection
        .checks
        .engineFinalDecisionAppearsExactlyOnce,

    actualMaterialUnsupportedWouldFail:
      computeConsultingLiveAnswerSemanticGatePassed(
        buildValidSemanticGateEvaluation({
          groundingStatus:
            "materialUnsupported",

          materialUnsupportedClaims: [
            {
              claim:
                "없는 주장",

              reason:
                "자료에 없다.",
            },
          ],
        }),
      )
      === false
      && initialSemanticGate.groundingStatus
        !== "materialUnsupported"
      && followUpSemanticGate.groundingStatus
        !== "materialUnsupported",

    actualMissingFollowUpTurnWouldFail:
      sessionTurnKindsAreInitialAndFollowUp(
        storedTurnKinds.slice(
          0,
          1,
        ),
      )
      === false
      && sessionTurnKindsAreInitialAndFollowUp(
        storedTurnKinds,
      ),

    actualForeignOwnerLookupWouldFail:
      foreignOwnerMissesSession(
        followUpRecord.session,
      )
      === false
      && foreignOwnerMissesSession(
        ownerBFind,
      ),

    actualStaleExpectedUpdatedAtWouldFail:
      expectedUpdatedAtMatchesStored(
        "1999-01-01T00:00:00+09:00",
        initialSessionSnapshot.updatedAt,
      )
      === false
      && expectedUpdatedAt
        !== null
      && expectedUpdatedAtMatchesStored(
        expectedUpdatedAt,
        initialSessionSnapshot.updatedAt,
      ),
  };

  const passed =
    initialInterpretationCallCount
      === 1
    && initialAnswerCallCount
      === 1
    && initialSemanticGateCallCount
      === 1
    && followUpInterpretationCallCount
      === 1
    && followUpAnswerCallCount
      === 1
    && followUpSemanticGateCallCount
      === 1
    && totalOpenAICallCountFromStages(
      counters,
    )
      === AUTHENTICATED_CONSULTING_LIVE_INITIAL_FOLLOW_UP_HTTP_E2E_OPENAI_CALL_COUNT
    && openAiCallOrderMatches(
      events,
    )
    && initialInspection.passed
    && initialSemanticGate.passed
    && followUpInspection.passed
    && followUpSemanticGate.passed
    && sessionTurnKindsAreInitialAndFollowUp(
      storedTurnKinds,
    )
    && followUpRecord.ownerId
      === AUTHENTICATED_HTTP_E2E_OWNER_A
    && expectedUpdatedAt
      === initialSessionSnapshot.updatedAt
    && createCallCountAfterSuccess
      === 1
    && updateCallCountAfterSuccess
      === 1
    && findByIdCallCountAfterSuccess
      >= 1
    && ownerBFind
      === null
    && Object.values(
      liveNegativeChecks,
    )
      .every(
        Boolean,
      )
    && Object.values(
      nonApi.contract.negativeChecks,
    )
      .every(
        Boolean,
      );

  return buildLiveResult({
    nonApi,

    liveAttempted:
      true,

    counters,

    events:
      [
        ...events,
      ],

    sessionId:
      LIVE_SESSION_ID,

    ownerId:
      followUpRecord.ownerId,

    sessionTurnCount:
      followUpRecord
        .session
        .turns
        .length,

    sessionTurnKinds:
      storedTurnKinds,

    initial:
      initialStage,

    followUp:
      followUpStage,

    repository: {
      createCallCount:
        createCallCountAfterSuccess,

      findByIdCallCount:
        findByIdCallCountAfterSuccess,

      updateCallCount:
        updateCallCountAfterSuccess,

      expectedUpdatedAt,
    },

    liveNegativeChecks,

    passed,
  });
}

export function describeAuthenticatedConsultingLiveInitialFollowUpHttpE2EFailure(
  result:
    AuthenticatedConsultingLiveInitialFollowUpHttpE2EVerificationResult,
): string {
  if (
    !result.nonApiPassed
  ) {
    const failedNonApi = [
      result.nonApi.authenticatedHttpE2EPassed
        ? ""
        : "authenticated HTTP E2E",
      result.nonApi.initialFollowUpAnswerE2EPassed
        ? ""
        : "initial follow-up answer E2E",
      result.nonApi.semanticGateContractPassed
        ? ""
        : "semantic gate contract",
      result.nonApi.contract.passed
        ? ""
        : "live HTTP E2E contract",
    ]
      .filter(
        Boolean,
      )
      .join(
        ", ",
      );

    return (
      "Non-API blockers failed, so OpenAI was not called. "
      + failedNonApi
    );
  }

  const failedNegativeChecks =
    Object.entries(
      result.negativeChecks,
    )
      .filter(
        ([, value]) =>
          value
          === false,
      )
      .map(
        ([key]) =>
          key,
      )
      .join(
        ", ",
      );

  return [
    `openAiCallCount=${result.openAiCallCount}`,
    `events=${result.events.join(" -> ")}`,
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
    failedNegativeChecks.length > 0
      ? `negativeChecks failed: ${failedNegativeChecks}`
      : "",
  ]
    .filter(
      Boolean,
    )
    .join(
      "; ",
    );
}
