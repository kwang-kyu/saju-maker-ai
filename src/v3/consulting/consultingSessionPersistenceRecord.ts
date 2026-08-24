import type {
    ConsultingClarificationRequest,
    ConsultingConfirmedFact,
    ConsultingLifeContextRevision,
    ConsultingSession,
    ConsultingTurn,
  } from "./consultingSession.js";

  export const CONSULTING_SESSION_SCHEMA_VERSION =
    1 as const;

  export type ConsultingSessionPersistenceRecord = {
    schemaVersion:
      typeof CONSULTING_SESSION_SCHEMA_VERSION;

    sessionId:
      string;

    updatedAt:
      string;

    session:
      ConsultingSession;
  };

  export class InvalidConsultingSessionPersistenceRecordError
    extends Error {
    constructor(
      message:
        string,
    ) {
      super(
        message,
      );

      this.name =
        "InvalidConsultingSessionPersistenceRecordError";
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
      Number.isInteger(
        value,
      )
      && typeof value
      === "number"
      && value
      > 0
    );
  }

  function isStructuredObject(
    value:
      unknown,
  ): value is Record<string, unknown> {
    return (
      isObjectRecord(
        value,
      )
      && Object
        .keys(
          value,
        )
        .length
      > 0
    );
  }

  function isConsultingLifeContextRevision(
    value:
      unknown,
  ): value is ConsultingLifeContextRevision {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      return false;
    }

    return (
      isPositiveInteger(
        value.revision,
      )
      && isStructuredObject(
        value.sourceInput,
      )
      && isStructuredObject(
        value.lifeContext,
      )
      && isNonEmptyString(
        value.updatedAt,
      )
    );
  }

  function isConsultingTurn(
    value:
      unknown,
  ): value is ConsultingTurn {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      return false;
    }

    const kindIsValid =
      value.kind
      === "initial"
      || value.kind
      === "followUp"
      || value.kind
      === "clarification";

    return (
      isNonEmptyString(
        value.id,
      )
      && isPositiveInteger(
        value.sequence,
      )
      && kindIsValid
      && isNonEmptyString(
        value.question,
      )
      && isPositiveInteger(
        value.lifeContextRevision,
      )
      && isStructuredObject(
        value.questionReaderResult,
      )
      && isStructuredObject(
        value.questionContext,
      )
      && isStructuredObject(
        value.decisionResult,
      )
      && isNonEmptyString(
        value.assistantAnswer,
      )
      && isNonEmptyString(
        value.createdAt,
      )
    );
  }

  function isConsultingConfirmedField(
    value:
      unknown,
  ): boolean {
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
        value.value,
      )
      && Array.isArray(
        value.evidence,
      )
      && value.evidence.every(
        isNonEmptyString,
      )
    );
  }

  function isConsultingConfirmedFact(
    value:
      unknown,
  ): value is ConsultingConfirmedFact {
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
      && Array.isArray(
        value.fields,
      )
      && value.fields.every(
        isConsultingConfirmedField,
      )
      && isNonEmptyString(
        value.decisionTurnId,
      )
      && isNonEmptyString(
        value.sourceTurnId,
      )
      && isNonEmptyString(
        value.confirmedAt,
      )
    );
  }

  function isConsultingClarificationItem(
    value:
      unknown,
  ): boolean {
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

  function isConsultingClarificationRequest(
    value:
      unknown,
  ): value is ConsultingClarificationRequest {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      return false;
    }

    return (
      isNonEmptyString(
        value.decisionTurnId,
      )
      && Array.isArray(
        value.items,
      )
      && value.items.length
      > 0
      && value.items.every(
        isConsultingClarificationItem,
      )
    );
  }

  function hasStrictlyIncreasingRevisions(
    revisions:
      readonly ConsultingLifeContextRevision[],
  ): boolean {
    return revisions.every(
      (
        revision,
        index,
      ) =>
        revision.revision
        === index
        + 1,
    );
  }

  function hasContinuousTurnSequence(
    turns:
      readonly ConsultingTurn[],
  ): boolean {
    return turns.every(
      (
        turn,
        index,
      ) =>
        turn.sequence
        === index
        + 1,
    );
  }

  function hasUniqueTurnIds(
    turns:
      readonly ConsultingTurn[],
  ): boolean {
    const turnIds =
      new Set(
        turns.map(
          (turn) =>
            turn.id,
        ),
      );

    return turnIds.size
      === turns.length;
  }

  function allTurnsUseExistingLifeContextRevision(
    turns:
      readonly ConsultingTurn[],
    revisions:
      readonly ConsultingLifeContextRevision[],
  ): boolean {
    const revisionNumbers =
      new Set(
        revisions.map(
          (revision) =>
            revision.revision,
        ),
      );

    return turns.every(
      (turn) =>
        revisionNumbers.has(
          turn.lifeContextRevision,
        ),
    );
  }

  function allConfirmedFactsUseExistingTurn(
    facts:
      readonly ConsultingConfirmedFact[],
    turns:
      readonly ConsultingTurn[],
  ): boolean {
    const turnIds =
      new Set(
        turns.map(
          (turn) =>
            turn.id,
        ),
      );

      return facts.every(
        (fact) =>
          turnIds.has(
            fact.decisionTurnId,
          )
          && turnIds.has(
            fact.sourceTurnId,
          ),
      );
  }

  function pendingClarificationUsesExistingTurn(
    pendingClarification:
      ConsultingClarificationRequest | null,
    turns:
      readonly ConsultingTurn[],
  ): boolean {
    if (
      pendingClarification
      === null
    ) {
      return true;
    }

    return turns.some(
      (turn) =>
        turn.id
        === pendingClarification
          .decisionTurnId,
    );
  }

  export function isConsultingSession(
    value:
      unknown,
  ): value is ConsultingSession {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      return false;
    }

    const statusIsValid =
      value.status
      === "active"
      || value.status
      === "awaitingClarification"
      || value.status
      === "closed";

    if (
      !isNonEmptyString(
        value.id,
      )
      || !statusIsValid
      || !isNonEmptyString(
        value.createdAt,
      )
      || !isNonEmptyString(
        value.updatedAt,
      )
      || !isStructuredObject(
        value.sajuInput,
      )
      || !isStructuredObject(
        value.sajuFacts,
      )
      || !isStructuredObject(
        value.readerEvidence,
      )
      || !isStructuredObject(
        value.humanContext,
      )
      || !Array.isArray(
        value.lifeContextHistory,
      )
      || value
        .lifeContextHistory
        .length
      === 0
      || !value
        .lifeContextHistory
        .every(
          isConsultingLifeContextRevision,
        )
      || !Array.isArray(
        value.turns,
      )
      || value
        .turns
        .length
      === 0
      || !value
        .turns
        .every(
          isConsultingTurn,
        )
      || !Array.isArray(
        value.confirmedFacts,
      )
      || !value
        .confirmedFacts
        .every(
          isConsultingConfirmedFact,
        )
    ) {
      return false;
    }

    const pendingClarificationValue =
    value.pendingClarification;

  let pendingClarification:
    ConsultingClarificationRequest | null;

  if (
    pendingClarificationValue
    === null
  ) {
    pendingClarification =
      null;
  } else if (
    isConsultingClarificationRequest(
      pendingClarificationValue,
    )
  ) {
    pendingClarification =
      pendingClarificationValue;
  } else {
    return false;
  }

    const revisions =
      value.lifeContextHistory;

    const turns =
      value.turns;

    const confirmedFacts =
      value.confirmedFacts;

    return (
      turns[0].kind
      === "initial"
      && hasStrictlyIncreasingRevisions(
        revisions,
      )
      && hasContinuousTurnSequence(
        turns,
      )
      && hasUniqueTurnIds(
        turns,
      )
      && allTurnsUseExistingLifeContextRevision(
        turns,
        revisions,
      )
      && allConfirmedFactsUseExistingTurn(
        confirmedFacts,
        turns,
      )
      && pendingClarificationUsesExistingTurn(
        pendingClarification,
        turns,
      )
    );
  }

  export function serializeConsultingSession(
    session:
      ConsultingSession,
  ): ConsultingSessionPersistenceRecord {
    if (
      !isConsultingSession(
        session,
      )
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Consulting session cannot be serialized because its structure is invalid.",
      );
    }

    return {
      schemaVersion:
        CONSULTING_SESSION_SCHEMA_VERSION,

      sessionId:
        session.id,

      updatedAt:
        session.updatedAt,

      session,
    };
  }

  export function deserializeConsultingSession(
    value:
      unknown,
  ): ConsultingSession {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Consulting session persistence record must be an object.",
      );
    }

    if (
      value.schemaVersion
      !== CONSULTING_SESSION_SCHEMA_VERSION
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Unsupported consulting session persistence schema version.",
      );
    }

    if (
      !isNonEmptyString(
        value.sessionId,
      )
      || !isNonEmptyString(
        value.updatedAt,
      )
      || !isConsultingSession(
        value.session,
      )
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Consulting session persistence record is invalid.",
      );
    }

    if (
      value.sessionId
      !== value
        .session
        .id
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Persistence record sessionId does not match session.id.",
      );
    }

    if (
      value.updatedAt
      !== value
        .session
        .updatedAt
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Persistence record updatedAt does not match session.updatedAt.",
      );
    }

    return value.session;
  }
