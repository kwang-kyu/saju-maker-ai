import type {
    AuthenticatedConsultingSessionTurnRequest,
  } from "../consulting/authenticatedConsultingSessionTurnRequest";
  import type {
    ConsultingClarificationItem,
    ConsultingSessionStatus,
    ConsultingTurnKind,
  } from "../consulting/consultingSession";
  import type {
    V3ConsultingRequest,
  } from "../consulting/v3ConsultingRequest";

  export type V3ConsultingPendingClarification = {
    decisionTurnId:
      string;

    items: [
      ConsultingClarificationItem,
      ...ConsultingClarificationItem[],
    ];
  };

  export type V3InitialConsultingSessionResponse = {
    sessionId:
      string;

    status:
      ConsultingSessionStatus;

    createdAt:
      string;

    updatedAt:
      string;

    initialTurnId:
      string;

    initialTurnSequence:
      number;

    question:
      string;

    assistantAnswer:
      string;

    pendingClarification:
      V3ConsultingPendingClarification | null;
  };

  export type V3ConsultingSessionTurnResponse = {
    sessionId:
      string;

    status:
      ConsultingSessionStatus;

    updatedAt:
      string;

    turn: {
      id:
        string;

      sequence:
        number;

      kind:
        ConsultingTurnKind;

      question:
        string;

      assistantAnswer:
        string;

      createdAt:
        string;
    };

    pendingClarification:
      V3ConsultingPendingClarification | null;
  };

  export type CreateV3InitialConsultingSessionInput = {
    accessToken:
      string;

    request:
      V3ConsultingRequest;
  };

  export type RequestV3ConsultingSessionTurnInput = {
    accessToken:
      string;

    request:
      AuthenticatedConsultingSessionTurnRequest;
  };

  export type V3ConsultingSessionApiErrorCode =
    | "invalidAccessToken"
    | "invalidRequest"
    | "authenticationRequired"
    | "sessionNotFound"
    | "sessionConflict"
    | "sessionAlreadyExists"
    | "methodNotAllowed"
    | "internalError"
    | "invalidResponse"
    | "networkFailure";

  export class V3ConsultingSessionApiError
    extends Error {
    readonly code:
      V3ConsultingSessionApiErrorCode;

    readonly status:
      number | null;

    constructor(
      input: {
        code:
          V3ConsultingSessionApiErrorCode;

        status?:
          number;

        message:
          string;
      },
    ) {
      super(
        input.message,
      );

      this.name =
        "V3ConsultingSessionApiError";

      this.code =
        input.code;

      this.status =
        input.status
        ?? null;
    }
  }

  type V3ConsultingSessionFetch = (
    input:
      RequestInfo | URL,
    init?:
      RequestInit,
  ) => Promise<Response>;

  function fetchV3ConsultingSessionFromBrowser(
    input:
      RequestInfo | URL,
    init?:
      RequestInit,
  ): Promise<Response> {
    return globalThis.fetch(
      input,
      init,
    );
  }

  type ErrorResponseBody = {
    error:
      string;
  };

  function isObjectRecord(
    value:
      unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value
      === "object"
      && value
      !== null
      && !Array.isArray(
        value,
      )
    );
  }

  function isNonEmptyString(
    value:
      unknown,
  ): value is string {
    return (
      typeof value
      === "string"
      && value
        .trim()
        .length
      > 0
    );
  }

  function isPositiveInteger(
    value:
      unknown,
  ): value is number {
    return (
      typeof value
      === "number"
      && Number.isInteger(
        value,
      )
      && value
      > 0
    );
  }

  function isConsultingSessionStatus(
    value:
      unknown,
  ): value is ConsultingSessionStatus {
    return (
      value
      === "active"
      || value
      === "awaitingClarification"
      || value
      === "closed"
    );
  }

  function isConsultingTurnKind(
    value:
      unknown,
  ): value is ConsultingTurnKind {
    return (
      value
      === "initial"
      || value
      === "followUp"
      || value
      === "clarification"
    );
  }

  function isClarificationItem(
    value:
      unknown,
  ): value is ConsultingClarificationItem {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      return false;
    }

    return (
      isNonEmptyString(
        value.key,
      )
      && isNonEmptyString(
        value.description,
      )
      && isNonEmptyString(
        value.question,
      )
    );
  }

  function parsePendingClarification(
    value:
      unknown,
  ): V3ConsultingPendingClarification | null {
    if (
      value
      === null
    ) {
      return null;
    }

    if (
      !isObjectRecord(
        value,
      )
      || !isNonEmptyString(
        value.decisionTurnId,
      )
      || !Array.isArray(
        value.items,
      )
      || value.items.length
      === 0
      || !value.items.every(
        isClarificationItem,
      )
    ) {
      throw new V3ConsultingSessionApiError({
        code:
          "invalidResponse",

        message:
          "상담 확인 질문 응답 형식이 올바르지 않습니다.",
      });
    }

    return {
      decisionTurnId:
        value.decisionTurnId,

      items: [
        value.items[0],
        ...value.items.slice(
          1,
        ),
      ],
    };
  }

  function requireAccessToken(
    value:
      string,
  ): string {
    const accessToken =
      value.trim();

    if (
      accessToken.length
      === 0
    ) {
      throw new V3ConsultingSessionApiError({
        code:
          "invalidAccessToken",

        message:
          "로그인이 필요합니다.",
      });
    }

    return accessToken;
  }

  function parseInitialSessionResponse(
    value:
      unknown,
  ): V3InitialConsultingSessionResponse {
    if (
      !isObjectRecord(
        value,
      )
      || !isNonEmptyString(
        value.sessionId,
      )
      || !isConsultingSessionStatus(
        value.status,
      )
      || !isNonEmptyString(
        value.createdAt,
      )
      || !isNonEmptyString(
        value.updatedAt,
      )
      || !isNonEmptyString(
        value.initialTurnId,
      )
      || !isPositiveInteger(
        value.initialTurnSequence,
      )
      || !isNonEmptyString(
        value.question,
      )
      || !isNonEmptyString(
        value.assistantAnswer,
      )
    ) {
      throw new V3ConsultingSessionApiError({
        code:
          "invalidResponse",

        message:
          "최초 상담 세션 응답 형식이 올바르지 않습니다.",
      });
    }

    return {
      sessionId:
        value.sessionId,

      status:
        value.status,

      createdAt:
        value.createdAt,

      updatedAt:
        value.updatedAt,

      initialTurnId:
        value.initialTurnId,

      initialTurnSequence:
        value.initialTurnSequence,

      question:
        value.question,

      assistantAnswer:
        value.assistantAnswer,

      pendingClarification:
        parsePendingClarification(
          value.pendingClarification,
        ),
    };
  }

  function parseSessionTurnResponse(
    value:
      unknown,
  ): V3ConsultingSessionTurnResponse {
    if (
      !isObjectRecord(
        value,
      )
      || !isNonEmptyString(
        value.sessionId,
      )
      || !isConsultingSessionStatus(
        value.status,
      )
      || !isNonEmptyString(
        value.updatedAt,
      )
      || !isObjectRecord(
        value.turn,
      )
      || !isNonEmptyString(
        value.turn.id,
      )
      || !isPositiveInteger(
        value.turn.sequence,
      )
      || !isConsultingTurnKind(
        value.turn.kind,
      )
      || !isNonEmptyString(
        value.turn.question,
      )
      || !isNonEmptyString(
        value.turn.assistantAnswer,
      )
      || !isNonEmptyString(
        value.turn.createdAt,
      )
    ) {
      throw new V3ConsultingSessionApiError({
        code:
          "invalidResponse",

        message:
          "후속 상담 응답 형식이 올바르지 않습니다.",
      });
    }

    return {
      sessionId:
        value.sessionId,

      status:
        value.status,

      updatedAt:
        value.updatedAt,

      turn: {
        id:
          value.turn.id,

        sequence:
          value.turn.sequence,

        kind:
          value.turn.kind,

        question:
          value.turn.question,

        assistantAnswer:
          value.turn.assistantAnswer,

        createdAt:
          value.turn.createdAt,
      },

      pendingClarification:
        parsePendingClarification(
          value.pendingClarification,
        ),
    };
  }

  function isErrorResponseBody(
    value:
      unknown,
  ): value is ErrorResponseBody {
    return (
      isObjectRecord(
        value,
      )
      && typeof value.error
      === "string"
    );
  }

  function mapServerErrorCode(
    value:
      string,
  ): V3ConsultingSessionApiErrorCode {
    switch (
      value
    ) {
      case "invalidRequest":
      case "authenticationRequired":
      case "sessionNotFound":
      case "sessionConflict":
      case "sessionAlreadyExists":
      case "methodNotAllowed":
      case "internalError":
        return value;

      default:
        return "invalidResponse";
    }
  }

  function buildServerErrorMessage(
    code:
      V3ConsultingSessionApiErrorCode,
  ): string {
    switch (
      code
    ) {
      case "authenticationRequired":
        return "로그인이 필요하거나 로그인 정보가 만료되었습니다.";

      case "invalidRequest":
        return "상담 요청 정보를 다시 확인해주세요.";

      case "sessionNotFound":
        return "상담 세션을 찾을 수 없습니다.";

      case "sessionConflict":
        return "다른 상담 요청이 먼저 반영되었습니다. 다시 시도해주세요.";

      case "sessionAlreadyExists":
        return "같은 상담 세션이 이미 생성되어 있습니다.";

      case "methodNotAllowed":
        return "지원하지 않는 상담 요청 방식입니다.";

      case "internalError":
        return "상담 서버에서 오류가 발생했습니다.";

      case "invalidAccessToken":
        return "로그인이 필요합니다.";

      case "networkFailure":
        return "상담 서버에 연결할 수 없습니다.";

      case "invalidResponse":
        return "상담 서버의 응답 형식이 올바르지 않습니다.";
    }
  }

  async function requestJson(
    input: {
      path:
        string;

      accessToken:
        string;

      body:
        unknown;

      fetch:
        V3ConsultingSessionFetch;
    },
  ): Promise<unknown> {
    const accessToken =
      requireAccessToken(
        input.accessToken,
      );

    let response:
      Response;

    try {
      response =
        await input.fetch(
          input.path,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify(
                input.body,
              ),
          },
        );
    } catch {
      throw new V3ConsultingSessionApiError({
        code:
          "networkFailure",

        message:
          buildServerErrorMessage(
            "networkFailure",
          ),
      });
    }

    let responseBody:
      unknown;

    try {
      responseBody =
        await response.json();
    } catch {
      throw new V3ConsultingSessionApiError({
        code:
          "invalidResponse",

        status:
          response.status,

        message:
          buildServerErrorMessage(
            "invalidResponse",
          ),
      });
    }

    if (
      !response.ok
    ) {
      const code =
        isErrorResponseBody(
          responseBody,
        )
          ? mapServerErrorCode(
              responseBody.error,
            )
          : "invalidResponse";

      throw new V3ConsultingSessionApiError({
        code,

        status:
          response.status,

        message:
          buildServerErrorMessage(
            code,
          ),
      });
    }

    return responseBody;
  }

  export async function createV3InitialConsultingSession(
    input:
      CreateV3InitialConsultingSessionInput,
    requestFetch:
      V3ConsultingSessionFetch =
      fetchV3ConsultingSessionFromBrowser,
  ): Promise<V3InitialConsultingSessionResponse> {
    const responseBody =
      await requestJson({
        path:
          "/api/v3/consulting/session",

        accessToken:
          input.accessToken,

        body:
          input.request,

        fetch:
          requestFetch,
      });

    return parseInitialSessionResponse(
      responseBody,
    );
  }

  export async function requestV3ConsultingSessionTurn(
    input:
      RequestV3ConsultingSessionTurnInput,
    requestFetch:
      V3ConsultingSessionFetch =
      fetchV3ConsultingSessionFromBrowser,
  ): Promise<V3ConsultingSessionTurnResponse> {
    const responseBody =
      await requestJson({
        path:
          "/api/v3/consulting/session-turn",

        accessToken:
          input.accessToken,

        body:
          input.request,

        fetch:
          requestFetch,
      });

    return parseSessionTurnResponse(
      responseBody,
    );
  }
