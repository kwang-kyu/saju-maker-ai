import type {
    ConsultingTurnKind,
  } from "./consultingSession.js";
  import {
    isV3HumanLifeContextRequest,
  } from "./v3ConsultingRequest.js";
  import type {
    V3HumanLifeContextRequest,
  } from "./v3ConsultingRequest.js";

  export type AuthenticatedConsultingSessionTurnKind =
    Exclude<
      ConsultingTurnKind,
      "initial"
    >;

  export type AuthenticatedConsultingSessionTurnRequest = {
    sessionId:
      string;

    kind:
      AuthenticatedConsultingSessionTurnKind;

    question:
      string;

    lifeContextUpdate?:
      V3HumanLifeContextRequest;
  };

  const AUTHENTICATED_TURN_REQUEST_KEYS:
  ReadonlySet<string> =
    new Set([
      "sessionId",
      "kind",
      "question",
      "lifeContextUpdate",
    ]);

  export class InvalidAuthenticatedConsultingSessionTurnRequestError
    extends Error {
    constructor() {
      super(
        "Authenticated consulting session turn request is invalid.",
      );

      this.name =
        "InvalidAuthenticatedConsultingSessionTurnRequestError";
    }
  }

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

  function hasOnlyAllowedKeys(
    value:
      Record<string, unknown>,
  ): boolean {
    return Object
      .keys(
        value,
      )
      .every(
        (key) =>
          AUTHENTICATED_TURN_REQUEST_KEYS
            .has(
              key,
            ),
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

  function isAuthenticatedTurnKind(
    value:
      unknown,
  ): value is AuthenticatedConsultingSessionTurnKind {
    return (
      value
      === "followUp"
      || value
      === "clarification"
    );
  }

  export function isAuthenticatedConsultingSessionTurnRequest(
    value:
      unknown,
  ): value is AuthenticatedConsultingSessionTurnRequest {
    if (
      !isObjectRecord(
        value,
      )
      || !hasOnlyAllowedKeys(
        value,
      )
    ) {
      return false;
    }

    return (
      isNonEmptyString(
        value.sessionId,
      )
      && isAuthenticatedTurnKind(
        value.kind,
      )
      && isNonEmptyString(
        value.question,
      )
      && (
        value.lifeContextUpdate
        === undefined
        || isV3HumanLifeContextRequest(
          value.lifeContextUpdate,
        )
      )
    );
  }

  export function parseAuthenticatedConsultingSessionTurnRequest(
    value:
      unknown,
  ): AuthenticatedConsultingSessionTurnRequest {
    if (
      !isAuthenticatedConsultingSessionTurnRequest(
        value,
      )
    ) {
      throw new InvalidAuthenticatedConsultingSessionTurnRequestError();
    }

    const normalizedRequest:
      AuthenticatedConsultingSessionTurnRequest = {
        sessionId:
          value
            .sessionId
            .trim(),

        kind:
          value.kind,

        question:
          value
            .question
            .trim(),
    };

    if (
      value.lifeContextUpdate
      !== undefined
    ) {
      normalizedRequest.lifeContextUpdate =
        value.lifeContextUpdate;
    }

    return normalizedRequest;
  }
