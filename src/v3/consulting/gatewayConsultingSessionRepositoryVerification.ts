import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import {
    GatewayConsultingSessionRepository,
  } from "./gatewayConsultingSessionRepository";
  import type {
    ConsultingSession,
  } from "./consultingSession";
  import type {
    ConsultingSessionPersistenceGateway,
    ConsultingSessionPersistenceRow,
    InsertConsultingSessionPersistenceRowResult,
    UpdateConsultingSessionPersistenceRowInput,
    UpdateConsultingSessionPersistenceRowResult,
  } from "./consultingSessionPersistenceGateway";
  import {
    InvalidConsultingSessionPersistenceRecordError,
    serializeConsultingSession,
  } from "./consultingSessionPersistenceRecord";

  export type GatewayConsultingSessionRepositoryVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  class VerificationPersistenceGateway
  implements ConsultingSessionPersistenceGateway {
    row:
      ConsultingSessionPersistenceRow | null =
        null;

    insertResult:
      InsertConsultingSessionPersistenceRowResult = {
        status:
          "inserted",
      };

    updateResult:
      UpdateConsultingSessionPersistenceRowResult = {
        status:
          "updated",
      };

    findByIdCallCount =
      0;

    insertCallCount =
      0;

    updateCallCount =
      0;

    lastFindById:
      string | null =
        null;

    lastInsertedRow:
      ConsultingSessionPersistenceRow | null =
        null;

    lastUpdateInput:
      UpdateConsultingSessionPersistenceRowInput | null =
        null;

    async findById(
      sessionId:
        string,
    ): Promise<ConsultingSessionPersistenceRow | null> {
      this.findByIdCallCount +=
        1;

      this.lastFindById =
        sessionId;

      return this.row;
    }

    async insert(
      row:
        ConsultingSessionPersistenceRow,
    ): Promise<InsertConsultingSessionPersistenceRowResult> {
      this.insertCallCount +=
        1;

      this.lastInsertedRow =
        row;

      return this.insertResult;
    }

    async updateIfCurrent(
      input:
        UpdateConsultingSessionPersistenceRowInput,
    ): Promise<UpdateConsultingSessionPersistenceRowResult> {
      this.updateCallCount +=
        1;

      this.lastUpdateInput =
        input;

      return this.updateResult;
    }
  }

  function createInitialSession(
    sessionId:
      string,
  ): ConsultingSession {
    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    return buildInitialConsultingSession({
      sessionId,

      initialTurnId:
        `${sessionId}-turn-001`,

      createdAt:
        "2026-07-28T11:00:00+09:00",

      request:
        sourceRequest,

      execution:
        initialExecution,

      assistantAnswer:
        "현재 정보만으로 판단을 확정할 수 없습니다. 실제 자금과 결정기한을 먼저 확인해야 합니다.",
    });
  }

  function buildRow(
    session:
      ConsultingSession,
  ): ConsultingSessionPersistenceRow {
    const record =
      serializeConsultingSession(
        session,
      );

    return {
      id:
        record.sessionId,

      schemaVersion:
        record.schemaVersion,

      updatedAt:
        record.updatedAt,

      payload:
        JSON.parse(
          JSON.stringify(
            record,
          ),
        ),
    };
  }

  async function actionRejectsWithInvalidRecordError(
    action:
      () => Promise<unknown>,
  ): Promise<boolean> {
    try {
      await action();

      return false;
    } catch (
      error
    ) {
      return error
        instanceof InvalidConsultingSessionPersistenceRecordError;
    }
  }

  export async function verifyGatewayConsultingSessionRepository():
    Promise<GatewayConsultingSessionRepositoryVerificationResult> {
    const session =
      createInitialSession(
        "session-gateway-repository-001",
      );

    const validRow =
      buildRow(
        session,
      );

    const findGateway =
      new VerificationPersistenceGateway();

    findGateway.row =
      validRow;

    const findRepository =
      new GatewayConsultingSessionRepository(
        findGateway,
      );

    const restoredSession =
      await findRepository
        .findById(
          session.id,
        );

    const missingGateway =
      new VerificationPersistenceGateway();

    const missingRepository =
      new GatewayConsultingSessionRepository(
        missingGateway,
      );

    const missingSession =
      await missingRepository
        .findById(
          "missing-session",
        );

    const createGateway =
      new VerificationPersistenceGateway();

    const createRepository =
      new GatewayConsultingSessionRepository(
        createGateway,
      );

    const createResult =
      await createRepository
        .create(
          session,
        );

    const insertedRow =
      createGateway
        .lastInsertedRow;

    const duplicateGateway =
      new VerificationPersistenceGateway();

    duplicateGateway
      .insertResult = {
        status:
          "alreadyExists",

        existingUpdatedAt:
          session.updatedAt,
      };

    const duplicateRepository =
      new GatewayConsultingSessionRepository(
        duplicateGateway,
      );

    const duplicateResult =
      await duplicateRepository
        .create(
          session,
        );

    const updateGateway =
      new VerificationPersistenceGateway();

    const updateRepository =
      new GatewayConsultingSessionRepository(
        updateGateway,
      );

    const expectedUpdatedAt =
      "2026-07-28T10:59:00+09:00";

    const updateResult =
      await updateRepository
        .update({
          session,

          expectedUpdatedAt,
        });

    const capturedUpdate =
      updateGateway
        .lastUpdateInput;

    const conflictGateway =
      new VerificationPersistenceGateway();

    const conflictCurrentUpdatedAt =
      "2026-07-28T11:01:00+09:00";

    conflictGateway
      .updateResult = {
        status:
          "conflict",

        currentUpdatedAt:
          conflictCurrentUpdatedAt,
      };

    const conflictRepository =
      new GatewayConsultingSessionRepository(
        conflictGateway,
      );

    const conflictResult =
      await conflictRepository
        .update({
          session,

          expectedUpdatedAt,
        });

    const notFoundGateway =
      new VerificationPersistenceGateway();

    notFoundGateway
      .updateResult = {
        status:
          "notFound",
      };

    const notFoundRepository =
      new GatewayConsultingSessionRepository(
        notFoundGateway,
      );

    const notFoundResult =
      await notFoundRepository
        .update({
          session,

          expectedUpdatedAt,
        });

    const mismatchedIdGateway =
      new VerificationPersistenceGateway();

    mismatchedIdGateway.row = {
      ...validRow,

      id:
        "different-row-id",
    };

    const mismatchedIdRejected =
      await actionRejectsWithInvalidRecordError(
        () =>
          new GatewayConsultingSessionRepository(
            mismatchedIdGateway,
          )
            .findById(
              session.id,
            ),
      );

    const mismatchedUpdatedAtGateway =
      new VerificationPersistenceGateway();

    mismatchedUpdatedAtGateway.row = {
      ...validRow,

      updatedAt:
        "2026-07-28T11:02:00+09:00",
    };

    const mismatchedUpdatedAtRejected =
      await actionRejectsWithInvalidRecordError(
        () =>
          new GatewayConsultingSessionRepository(
            mismatchedUpdatedAtGateway,
          )
            .findById(
              session.id,
            ),
      );

    const unsupportedVersionGateway =
      new VerificationPersistenceGateway();

    unsupportedVersionGateway.row = {
      ...validRow,

      schemaVersion:
        2,
    };

    const unsupportedVersionRejected =
      await actionRejectsWithInvalidRecordError(
        () =>
          new GatewayConsultingSessionRepository(
            unsupportedVersionGateway,
          )
            .findById(
              session.id,
            ),
      );

    const invalidPayloadGateway =
      new VerificationPersistenceGateway();

    invalidPayloadGateway.row = {
      ...validRow,

      payload: {
        invalid:
          true,
      },
    };

    const invalidPayloadRejected =
      await actionRejectsWithInvalidRecordError(
        () =>
          new GatewayConsultingSessionRepository(
            invalidPayloadGateway,
          )
            .findById(
              session.id,
            ),
      );

    const checks = {
      findUsesRequestedSessionId:
        findGateway
          .lastFindById
        === session.id,

      findCallsGatewayOnce:
        findGateway
          .findByIdCallCount
        === 1,

      validRowRestoresSession:
        restoredSession
        !== null
        && JSON.stringify(
          restoredSession,
        )
        === JSON.stringify(
          session,
        ),

      missingRowReturnsNull:
        missingSession
        === null,

      createCallsInsertOnce:
        createGateway
          .insertCallCount
        === 1,

      createMapsInsertedResult:
        createResult
          .status
        === "created",

      insertedRowPreservesIdentity:
        insertedRow !== null
        && insertedRow.id
        === session.id
        && insertedRow.updatedAt
        === session.updatedAt,

      insertedRowPreservesSchemaVersion:
        insertedRow !== null
        && insertedRow
          .schemaVersion
        === 1,

      insertedPayloadCanRestoreSession:
        insertedRow !== null
        && JSON.stringify(
          insertedRow.payload,
        )
        === JSON.stringify(
          serializeConsultingSession(
            session,
          ),
        ),

      duplicateCreateIsMapped:
        duplicateResult
          .status
        === "alreadyExists"
        && duplicateResult
          .existingUpdatedAt
        === session.updatedAt,

      updateCallsGatewayOnce:
        updateGateway
          .updateCallCount
        === 1,

      updatePreservesExpectedUpdatedAt:
        capturedUpdate !== null
        && capturedUpdate
          .expectedUpdatedAt
        === expectedUpdatedAt,

      updatePreservesSessionRow:
        capturedUpdate !== null
        && capturedUpdate
          .row
          .id
        === session.id
        && capturedUpdate
          .row
          .updatedAt
        === session.updatedAt,

      updatedResultIsMapped:
        updateResult
          .status
        === "updated",

      conflictResultIsMapped:
        conflictResult
          .status
        === "conflict"
        && conflictResult
          .currentUpdatedAt
        === conflictCurrentUpdatedAt,

      notFoundResultIsMapped:
        notFoundResult
          .status
        === "notFound",

      mismatchedRowIdIsRejected:
        mismatchedIdRejected,

      mismatchedRowUpdatedAtIsRejected:
        mismatchedUpdatedAtRejected,

      unsupportedRowVersionIsRejected:
        unsupportedVersionRejected,

      invalidPayloadIsRejected:
        invalidPayloadRejected,
    };

    return {
      checks,

      passed:
        Object
          .values(
            checks,
          )
          .every(
            Boolean,
          ),
    };
  }
