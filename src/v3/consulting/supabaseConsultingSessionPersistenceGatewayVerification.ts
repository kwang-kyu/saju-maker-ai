import {
    createClient,
  } from "@supabase/supabase-js";

  import type {
    ConsultingSessionPersistenceRow,
  } from "./consultingSessionPersistenceGateway";
  import {
    SupabaseConsultingSessionPersistenceError,
    SupabaseConsultingSessionPersistenceGateway,
    V3_CONSULTING_SESSIONS_TABLE,
  } from "./supabaseConsultingSessionPersistenceGateway";

  export type SupabaseConsultingSessionPersistenceGatewayVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  type QueuedResponse = {
    status:
      number;

    body:
      unknown;
  };

  type CapturedRequest = {
    url:
      string;

    method:
      string;

    body:
      unknown;
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

  function createVerificationGateway(
    responses:
      QueuedResponse[],
    requests:
      CapturedRequest[],
  ): SupabaseConsultingSessionPersistenceGateway {
    let responseIndex =
      0;

    const verificationFetch =
      async (
        input:
          RequestInfo | URL,
        init?:
          RequestInit,
      ): Promise<Response> => {
        const response =
          responses[
            responseIndex
          ];

        responseIndex +=
          1;

        if (
          response
          === undefined
        ) {
          throw new Error(
            "No queued verification response remains.",
          );
        }

        const url =
          input
          instanceof Request
            ? input.url
            : input.toString();

        const method =
          init?.method
          ?? (
            input
            instanceof Request
              ? input.method
              : "GET"
          );

        const bodyText =
          typeof init?.body
          === "string"
            ? init.body
            : null;

        requests.push({
          url,

          method,

          body:
            bodyText
            === null
              ? null
              : JSON.parse(
                  bodyText,
                ),
        });

        return new Response(
          JSON.stringify(
            response.body,
          ),
          {
            status:
              response.status,

            headers: {
              "Content-Type":
                "application/json",
            },
          },
        );
      };

    const client =
      createClient(
        "https://verification.supabase.co",
        "verification-publishable-key",
        {
          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,
          },

          global: {
            fetch:
              verificationFetch,
          },
        },
      );

    return new SupabaseConsultingSessionPersistenceGateway({
      client,

      now:
        () =>
          "2026-07-28T12:00:00.000Z",
    });
  }

  function buildRow(
    updatedAt:
      string =
        "2026-07-28T11:59:00+09:00",
  ): ConsultingSessionPersistenceRow {
    const id =
      "session-supabase-gateway-001";

    return {
      id,

      schemaVersion:
        1,

      updatedAt,

      payload: {
        schemaVersion:
          1,

        sessionId:
          id,

        updatedAt,

        session: {
          id,
        },
      },
    };
  }

  async function captureRejectedError(
    action:
      () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await action();

      return null;
    } catch (
      error
    ) {
      return error;
    }
  }

  export async function verifySupabaseConsultingSessionPersistenceGateway():
    Promise<SupabaseConsultingSessionPersistenceGatewayVerificationResult> {
    const row =
      buildRow();

    const databaseRow = {
      id:
        row.id,

      schema_version:
        row.schemaVersion,

      updated_at:
        row.updatedAt,

      payload:
        row.payload,
    };

    const findRequests:
      CapturedRequest[] =
        [];

    const foundRow =
      await createVerificationGateway(
        [
          {
            status:
              200,

            body:
              databaseRow,
          },
        ],
        findRequests,
      )
        .findById(
          row.id,
        );

    const missingRow =
      await createVerificationGateway(
        [
          {
            status:
              200,

            body:
              null,
          },
        ],
        [],
      )
        .findById(
          "missing-session",
        );

    const insertRequests:
      CapturedRequest[] =
        [];

    const insertResult =
      await createVerificationGateway(
        [
          {
            status:
              201,

            body:
              null,
          },
        ],
        insertRequests,
      )
        .insert(
          row,
        );

    const duplicateRequests:
      CapturedRequest[] =
        [];

    const duplicateResult =
      await createVerificationGateway(
        [
          {
            status:
              409,

            body: {
              code:
                "23505",

              message:
                "duplicate key",
            },
          },
          {
            status:
              200,

            body: {
              updated_at:
                row.updatedAt,
            },
          },
        ],
        duplicateRequests,
      )
        .insert(
          row,
        );

    const nextRow =
      buildRow(
        "2026-07-28T12:01:00+09:00",
      );

    const updateRequests:
      CapturedRequest[] =
        [];

    const updateResult =
      await createVerificationGateway(
        [
          {
            status:
              200,

            body: {
              updated_at:
                nextRow.updatedAt,
            },
          },
        ],
        updateRequests,
      )
        .updateIfCurrent({
          row:
            nextRow,

          expectedUpdatedAt:
            row.updatedAt,
        });

    const notFoundRequests:
      CapturedRequest[] =
        [];

    const notFoundResult =
      await createVerificationGateway(
        [
          {
            status:
              200,

            body:
              null,
          },
          {
            status:
              200,

            body:
              null,
          },
        ],
        notFoundRequests,
      )
        .updateIfCurrent({
          row:
            nextRow,

          expectedUpdatedAt:
            row.updatedAt,
        });

    const conflictRequests:
      CapturedRequest[] =
        [];

    const conflictUpdatedAt =
      "2026-07-28T12:02:00+09:00";

    const conflictResult =
      await createVerificationGateway(
        [
          {
            status:
              200,

            body:
              null,
          },
          {
            status:
              200,

            body: {
              updated_at:
                conflictUpdatedAt,
            },
          },
        ],
        conflictRequests,
      )
        .updateIfCurrent({
          row:
            nextRow,

          expectedUpdatedAt:
            row.updatedAt,
        });

    const databaseError =
      await captureRejectedError(
        () =>
          createVerificationGateway(
            [
              {
                status:
                  500,

                body: {
                  code:
                    "XX000",

                  message:
                    "database failure",
                },
              },
            ],
            [],
          )
            .findById(
              row.id,
            ),
      );

    const invalidRowError =
      await captureRejectedError(
        () =>
          createVerificationGateway(
            [
              {
                status:
                  200,

                body: {
                  ...databaseRow,

                  schema_version:
                    0,
                },
              },
            ],
            [],
          )
            .findById(
              row.id,
            ),
      );

    const insertRequest =
      insertRequests[0];

    const rawInsertBody =
      insertRequest?.body;

    const insertBody =
      Array.isArray(
        rawInsertBody,
      )
        ? rawInsertBody[0]
        : rawInsertBody;

    const updateRequest =
      updateRequests[0];

    const updateBody =
      updateRequest?.body;

    const checks = {
      tableNameIsStable:
        V3_CONSULTING_SESSIONS_TABLE
        === "v3_consulting_sessions",

      findUsesGet:
        findRequests[0]
          ?.method
        === "GET",

      findTargetsCorrectTable:
        findRequests[0]
          ?.url
          .includes(
            "/rest/v1/v3_consulting_sessions",
          )
        === true,

      findFiltersSessionId:
        findRequests[0]
          ?.url
          .includes(
            `id=eq.${row.id}`,
          )
        === true,

      selectedRowIsMapped:
        foundRow !== null
        && JSON.stringify(
          foundRow,
        )
        === JSON.stringify(
          row,
        ),

      missingRowReturnsNull:
        missingRow
        === null,

      insertUsesPost:
        insertRequest
          ?.method
        === "POST",

      insertResultIsMapped:
        insertResult
          .status
        === "inserted",

      insertColumnsArePreserved:
        isObjectRecord(
          insertBody,
        )
        && insertBody.id
        === row.id
        && insertBody.schema_version
        === row.schemaVersion
        && insertBody.updated_at
        === row.updatedAt
        && insertBody.persisted_at
        === "2026-07-28T12:00:00.000Z",

      duplicatePerformsLookup:
        duplicateRequests
          .length
        === 2,

      duplicateResultIsMapped:
        duplicateResult
          .status
        === "alreadyExists"
        && duplicateResult
          .existingUpdatedAt
        === row.updatedAt,

      updateUsesPatch:
        updateRequest
          ?.method
        === "PATCH",

      updateUsesOptimisticCondition:
        updateRequest
          ?.url
          .includes(
            "updated_at=eq.",
          )
        === true,

      updateBodyPreservesNewSession:
        isObjectRecord(
          updateBody,
        )
        && updateBody.id
        === nextRow.id
        && updateBody.updated_at
        === nextRow.updatedAt,

      updateResultIsMapped:
        updateResult
          .status
        === "updated",

      notFoundPerformsCurrentLookup:
        notFoundRequests
          .length
        === 2,

      notFoundResultIsMapped:
        notFoundResult
          .status
        === "notFound",

      conflictPerformsCurrentLookup:
        conflictRequests
          .length
        === 2,

      conflictResultIsMapped:
        conflictResult
          .status
        === "conflict"
        && conflictResult
          .currentUpdatedAt
        === conflictUpdatedAt,

      databaseFailureUsesTypedError:
        databaseError
        instanceof SupabaseConsultingSessionPersistenceError,

      invalidRowUsesTypedError:
        invalidRowError
        instanceof SupabaseConsultingSessionPersistenceError,
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
