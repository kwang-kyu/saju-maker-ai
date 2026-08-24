import type {
    ConsultingSession,
  } from "./consultingSession.js";
  import type {
    ConsultingSessionPersistenceGateway,
    ConsultingSessionPersistenceRow,
  } from "./consultingSessionPersistenceGateway.js";
  import {
    CONSULTING_SESSION_SCHEMA_VERSION,
    InvalidConsultingSessionPersistenceRecordError,
    deserializeConsultingSession,
    serializeConsultingSession,
  } from "./consultingSessionPersistenceRecord.js";
  import type {
    ConsultingSessionRepository,
    CreateConsultingSessionResult,
    UpdateConsultingSessionInput,
    UpdateConsultingSessionResult,
  } from "./consultingSessionRepository.js";

  function buildPersistenceRow(
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
        record,
    };
  }

  function restoreSessionFromRow(
    row:
      ConsultingSessionPersistenceRow,
  ): ConsultingSession {
    const session =
      deserializeConsultingSession(
        row.payload,
      );

    if (
      row.id
      !== session.id
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Persistence row id does not match restored session.id.",
      );
    }

    if (
      row.updatedAt
      !== session.updatedAt
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Persistence row updatedAt does not match restored session.updatedAt.",
      );
    }

    if (
      row.schemaVersion
      !== CONSULTING_SESSION_SCHEMA_VERSION
    ) {
      throw new InvalidConsultingSessionPersistenceRecordError(
        "Persistence row schemaVersion is unsupported.",
      );
    }

    return session;
  }

  /**
   * Persistence Gateway를 천운문 세션 Repository 계약으로 변환한다.
   *
   * DB에서 읽은 payload는 반드시 런타임 검증을 통과해야 하며,
   * DB 열과 payload 내부 식별정보가 다르면 손상 데이터로 거부한다.
   */
  export class GatewayConsultingSessionRepository
  implements ConsultingSessionRepository {
    readonly gateway:
      ConsultingSessionPersistenceGateway;

    constructor(
      gateway:
        ConsultingSessionPersistenceGateway,
    ) {
      this.gateway =
        gateway;
    }

    async findById(
      sessionId:
        string,
    ): Promise<ConsultingSession | null> {
      const row =
        await this
          .gateway
          .findById(
            sessionId,
          );

      if (
        row
        === null
      ) {
        return null;
      }

      return restoreSessionFromRow(
        row,
      );
    }

    async create(
      session:
        ConsultingSession,
    ): Promise<CreateConsultingSessionResult> {
      const result =
        await this
          .gateway
          .insert(
            buildPersistenceRow(
              session,
            ),
          );

      if (
        result.status
        === "alreadyExists"
      ) {
        return {
          status:
            "alreadyExists",

          existingUpdatedAt:
            result
              .existingUpdatedAt,
        };
      }

      return {
        status:
          "created",
      };
    }

    async update(
      input:
        UpdateConsultingSessionInput,
    ): Promise<UpdateConsultingSessionResult> {
      const result =
        await this
          .gateway
          .updateIfCurrent({
            row:
              buildPersistenceRow(
                input.session,
              ),

            expectedUpdatedAt:
              input
                .expectedUpdatedAt,
          });

      if (
        result.status
        === "notFound"
      ) {
        return {
          status:
            "notFound",
        };
      }

      if (
        result.status
        === "conflict"
      ) {
        return {
          status:
            "conflict",

          currentUpdatedAt:
            result
              .currentUpdatedAt,
        };
      }

      return {
        status:
          "updated",
      };
    }
  }
