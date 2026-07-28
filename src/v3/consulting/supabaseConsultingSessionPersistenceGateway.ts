import type {
    SupabaseClient,
  } from "@supabase/supabase-js";

  import type {
    ConsultingSessionPersistenceGateway,
    ConsultingSessionPersistenceRow,
    InsertConsultingSessionPersistenceRowResult,
    UpdateConsultingSessionPersistenceRowInput,
    UpdateConsultingSessionPersistenceRowResult,
  } from "./consultingSessionPersistenceGateway";

  export const V3_CONSULTING_SESSIONS_TABLE =
    "v3_consulting_sessions";

  type SupabaseErrorLike = {
    code?:
      string;

    message?:
      string;
  };

  export class SupabaseConsultingSessionPersistenceError
    extends Error {
    readonly operation:
      string;

    readonly code:
      string | null;

    constructor(
      input: {
        operation:
          string;

        error:
          SupabaseErrorLike;
      },
    ) {
      super(
        `Supabase consulting session persistence failed during ${input.operation}.`,
      );

      this.name =
        "SupabaseConsultingSessionPersistenceError";

      this.operation =
        input.operation;

      this.code =
        typeof input.error.code
        === "string"
          ? input.error.code
          : null;
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

  function requireNonEmptyString(
    value:
      unknown,
    fieldName:
      string,
  ): string {
    if (
      typeof value
      !== "string"
      || value
        .trim()
        .length
      === 0
    ) {
      throw new SupabaseConsultingSessionPersistenceError({
        operation:
          `validate ${fieldName}`,

        error: {
          code:
            "INVALID_ROW",
        },
      });
    }

    return value;
  }

  function requirePositiveInteger(
    value:
      unknown,
    fieldName:
      string,
  ): number {
    if (
      typeof value
      !== "number"
      || !Number.isInteger(
        value,
      )
      || value
      <= 0
    ) {
      throw new SupabaseConsultingSessionPersistenceError({
        operation:
          `validate ${fieldName}`,

        error: {
          code:
            "INVALID_ROW",
        },
      });
    }

    return value;
  }

  function parsePersistenceRow(
    value:
      unknown,
  ): ConsultingSessionPersistenceRow {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      throw new SupabaseConsultingSessionPersistenceError({
        operation:
          "validate selected row",

        error: {
          code:
            "INVALID_ROW",
        },
      });
    }

    return {
      id:
        requireNonEmptyString(
          value.id,
          "id",
        ),

      schemaVersion:
        requirePositiveInteger(
          value.schema_version,
          "schema_version",
        ),

      updatedAt:
        requireNonEmptyString(
          value.updated_at,
          "updated_at",
        ),

      payload:
        value.payload,
    };
  }

  function parseCurrentUpdatedAt(
    value:
      unknown,
  ): string {
    if (
      !isObjectRecord(
        value,
      )
    ) {
      throw new SupabaseConsultingSessionPersistenceError({
        operation:
          "validate current updated_at row",

        error: {
          code:
            "INVALID_ROW",
        },
      });
    }

    return requireNonEmptyString(
      value.updated_at,
      "updated_at",
    );
  }

  function buildSupabaseRow(
    row:
      ConsultingSessionPersistenceRow,
    persistedAt:
      string,
  ) {
    return {
      id:
        row.id,

      schema_version:
        row.schemaVersion,

      updated_at:
        row.updatedAt,

      payload:
        row.payload,

      persisted_at:
        persistedAt,
    };
  }

  export class SupabaseConsultingSessionPersistenceGateway
  implements ConsultingSessionPersistenceGateway {
    readonly client:
      SupabaseClient;

    readonly now:
      () => string;

    constructor(
      input: {
        client:
          SupabaseClient;

        now?:
          () => string;
      },
    ) {
      this.client =
        input.client;

      this.now =
        input.now
        ?? (() =>
          new Date()
            .toISOString());
    }

    private async findCurrentUpdatedAt(
      sessionId:
        string,
    ): Promise<string | null> {
      const {
        data,
        error,
      } = await this
        .client
        .from(
          V3_CONSULTING_SESSIONS_TABLE,
        )
        .select(
          "updated_at",
        )
        .eq(
          "id",
          sessionId,
        )
        .maybeSingle();

      if (
        error
        !== null
      ) {
        throw new SupabaseConsultingSessionPersistenceError({
          operation:
            "select current updated_at",

          error,
        });
      }

      if (
        data
        === null
      ) {
        return null;
      }

      return parseCurrentUpdatedAt(
        data,
      );
    }

    async findById(
      sessionId:
        string,
    ): Promise<ConsultingSessionPersistenceRow | null> {
      const {
        data,
        error,
      } = await this
        .client
        .from(
          V3_CONSULTING_SESSIONS_TABLE,
        )
        .select(
          "id, schema_version, updated_at, payload",
        )
        .eq(
          "id",
          sessionId,
        )
        .maybeSingle();

      if (
        error
        !== null
      ) {
        throw new SupabaseConsultingSessionPersistenceError({
          operation:
            "find session by id",

          error,
        });
      }

      if (
        data
        === null
      ) {
        return null;
      }

      return parsePersistenceRow(
        data,
      );
    }

    async insert(
      row:
        ConsultingSessionPersistenceRow,
    ): Promise<InsertConsultingSessionPersistenceRowResult> {
      const {
        error,
      } = await this
        .client
        .from(
          V3_CONSULTING_SESSIONS_TABLE,
        )
        .insert(
          buildSupabaseRow(
            row,
            this.now(),
          ),
        );

      if (
        error
        === null
      ) {
        return {
          status:
            "inserted",
        };
      }

      if (
        error.code
        !== "23505"
      ) {
        throw new SupabaseConsultingSessionPersistenceError({
          operation:
            "insert session",

          error,
        });
      }

      const existingUpdatedAt =
        await this.findCurrentUpdatedAt(
          row.id,
        );

      if (
        existingUpdatedAt
        === null
      ) {
        throw new SupabaseConsultingSessionPersistenceError({
          operation:
            "resolve duplicate session",

          error: {
            code:
              "DUPLICATE_WITHOUT_ROW",
          },
        });
      }

      return {
        status:
          "alreadyExists",

        existingUpdatedAt,
      };
    }

    async updateIfCurrent(
      input:
        UpdateConsultingSessionPersistenceRowInput,
    ): Promise<UpdateConsultingSessionPersistenceRowResult> {
      const {
        data,
        error,
      } = await this
        .client
        .from(
          V3_CONSULTING_SESSIONS_TABLE,
        )
        .update(
          buildSupabaseRow(
            input.row,
            this.now(),
          ),
        )
        .eq(
          "id",
          input.row.id,
        )
        .eq(
          "updated_at",
          input.expectedUpdatedAt,
        )
        .select(
          "updated_at",
        )
        .maybeSingle();

      if (
        error
        !== null
      ) {
        throw new SupabaseConsultingSessionPersistenceError({
          operation:
            "update current session",

          error,
        });
      }

      if (
        data
        !== null
      ) {
        return {
          status:
            "updated",
        };
      }

      const currentUpdatedAt =
        await this.findCurrentUpdatedAt(
          input.row.id,
        );

      if (
        currentUpdatedAt
        === null
      ) {
        return {
          status:
            "notFound",
        };
      }

      return {
        status:
          "conflict",

        currentUpdatedAt,
      };
    }
  }
