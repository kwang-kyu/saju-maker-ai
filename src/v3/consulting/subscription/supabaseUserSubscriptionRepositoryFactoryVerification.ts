import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  InvalidSupabaseServerEnvironmentError,
} from "../supabaseConsultingSessionRepositoryFactory.js";
import type {
  SupabaseServerEnvironment,
} from "../supabaseConsultingSessionRepositoryFactory.js";
import {
  parseConsultingSessionOwnerId,
} from "../consultingSessionOwnerId.js";

import {
  createSupabaseUserSubscriptionRepository,
} from "./supabaseUserSubscriptionRepositoryFactory.js";
import type {
  SupabaseUserSubscriptionRepositoryDependencies,
} from "./supabaseUserSubscriptionRepositoryFactory.js";
import {
  SupabaseUserSubscriptionRepository,
  V3_USER_SUBSCRIPTIONS_TABLE,
} from "./supabaseUserSubscriptionRepository.js";
import type {
  UserSubscription,
} from "./subscriptionTypes.js";

export type SupabaseUserSubscriptionRepositoryFactoryVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const EXPECTED_TABLE =
  "v3_user_subscriptions";

const EXPECTED_COLUMNS = [
  "user_id",
  "plan",
  "status",
  "free_usage_count",
  "started_at",
  "current_period_start",
  "current_period_end",
  "canceled_at",
] as const;

const VERIFICATION_OWNER_ID =
  "11111111-1111-4111-8111-111111111111";

const VERIFICATION_SUBSCRIPTION:
  UserSubscription = {
    userId:
      VERIFICATION_OWNER_ID,

    plan:
      "free",

    status:
      "free",

    freeUsageCount:
      0,

    startedAt:
      null,

    currentPeriodStart:
      null,

    currentPeriodEnd:
      null,

    canceledAt:
      null,
  };

function captureError(
  action:
    () => unknown,
): unknown {
  try {
    action();

    return null;
  } catch (
    error
  ) {
    return error;
  }
}

type RecordedCall = {
  selectColumns:
    string | null;

  insertPayload:
    Record<
      string,
      unknown
    > | null;

  updatePayload:
    Record<
      string,
      unknown
    > | null;

  eqColumn:
    string | null;

  eqValue:
    unknown;
};

function createRecordingClient(
  recorded:
    RecordedCall,
): SupabaseClient {
  const resolvedResult = {
    data:
      null,

    error:
      null,
  };

  const chain = {
    select(
      columns:
        string,
    ) {
      recorded.selectColumns =
        columns;

      return chain;
    },

    insert(
      payload:
        Record<
          string,
          unknown
        >,
    ) {
      recorded.insertPayload =
        payload;

      return chain;
    },

    update(
      payload:
        Record<
          string,
          unknown
        >,
    ) {
      recorded.updatePayload =
        payload;

      return chain;
    },

    eq(
      column:
        string,
      value:
        unknown,
    ) {
      recorded.eqColumn =
        column;

      recorded.eqValue =
        value;

      return chain;
    },

    maybeSingle() {
      return Promise.resolve(
        resolvedResult,
      );
    },

    then(
      onFulfilled:
        ((
          value:
            typeof resolvedResult,
        ) => unknown) | null | undefined,
      onRejected:
        ((
          reason:
            unknown,
        ) => unknown) | null | undefined,
    ) {
      return Promise
        .resolve(
          resolvedResult,
        )
        .then(
          onFulfilled,
          onRejected,
        );
    },
  };

  return {
    from(
      table:
        string,
    ) {
      if (
        table
        !== EXPECTED_TABLE
      ) {
        throw new Error(
          `Unexpected table: ${table}`,
        );
      }

      return chain;
    },
  } as unknown as SupabaseClient;
}

function extractColumns(
  selectColumns:
    string | null,
): string[] {
  if (
    selectColumns
    === null
  ) {
    return [];
  }

  return selectColumns
    .split(
      ",",
    )
    .map(
      (
        column,
      ) =>
        column
          .trim(),
    )
    .filter(
      (
        column,
      ) =>
        column.length
        > 0,
    );
}

function hasExactColumns(
  payload:
    Record<
      string,
      unknown
    > | null,
): boolean {
  if (
    payload
    === null
  ) {
    return false;
  }

  const keys =
    Object
      .keys(
        payload,
      )
      .sort();

  const expected =
    [
      ...EXPECTED_COLUMNS,
    ]
      .sort();

  return (
    keys.length
    === expected.length
    && keys
      .every(
        (
          key,
          index,
        ) =>
          key
          === expected[index],
      )
  );
}

export async function verifySupabaseUserSubscriptionRepositoryFactory():
  Promise<SupabaseUserSubscriptionRepositoryFactoryVerificationResult> {
  const missingUrlError =
    captureError(
      () =>
        createSupabaseUserSubscriptionRepository({
          environment: {
            SUPABASE_SECRET_KEY:
              "verification-server-secret",
          },
        }),
    );

  const missingSecretError =
    captureError(
      () =>
        createSupabaseUserSubscriptionRepository({
          environment: {
            SUPABASE_URL:
              "https://verification.supabase.co",
          },
        }),
    );

  const publishableKeyError =
    captureError(
      () =>
        createSupabaseUserSubscriptionRepository({
          environment: {
            SUPABASE_URL:
              "https://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "sb_publishable_verification",
          },
        }),
    );

  const deliveredEnvironments:
    (
      | SupabaseServerEnvironment
      | undefined
    )[] = [];

  const recorded:
    RecordedCall = {
      selectColumns:
        null,

      insertPayload:
        null,

      updatePayload:
        null,

      eqColumn:
        null,

      eqValue:
        null,
    };

  const recordingClient =
    createRecordingClient(
      recorded,
    );

  const dependencies:
    SupabaseUserSubscriptionRepositoryDependencies = {
      createServerClient(
        environment:
          SupabaseServerEnvironment | undefined,
      ) {
        deliveredEnvironments
          .push(
            environment,
          );

        return recordingClient;
      },
    };

  const environment:
    SupabaseServerEnvironment = {
      SUPABASE_URL:
        "https://verification.supabase.co",

      SUPABASE_SECRET_KEY:
        "verification-server-secret",
    };

  const repository =
    createSupabaseUserSubscriptionRepository(
      {
        environment,
      },
      dependencies,
    );

  const ownerId =
    parseConsultingSessionOwnerId(
      VERIFICATION_OWNER_ID,
    );

  const findResult =
    await repository
      .findByUserId(
        ownerId,
      );

  await repository
    .create(
      VERIFICATION_SUBSCRIPTION,
    );

  const updateRecorded:
    RecordedCall = {
      selectColumns:
        null,

      insertPayload:
        null,

      updatePayload:
        null,

      eqColumn:
        null,

      eqValue:
        null,
    };

  const updateClient =
    createRecordingClient(
      updateRecorded,
    );

  const updateRepository =
    new SupabaseUserSubscriptionRepository(
      updateClient,
    );

  await updateRepository
    .update(
      VERIFICATION_SUBSCRIPTION,
    );

  const selectColumns =
    extractColumns(
      recorded.selectColumns,
    );

  const checks = {
    missingUrlIsRejected:
      missingUrlError
      instanceof InvalidSupabaseServerEnvironmentError
      && missingUrlError
        .field
      === "SUPABASE_URL",

    missingSecretIsRejected:
      missingSecretError
      instanceof InvalidSupabaseServerEnvironmentError
      && missingSecretError
        .field
      === "SUPABASE_SECRET_KEY",

    publishableKeyIsRejected:
      publishableKeyError
      instanceof InvalidSupabaseServerEnvironmentError,

    factoryReturnsSupabaseRepository:
      repository
      instanceof SupabaseUserSubscriptionRepository,

    environmentIsDeliveredToServerClient:
      deliveredEnvironments.length
      === 1
      && deliveredEnvironments[0]
      === environment,

    tableNameMatchesMigration:
      V3_USER_SUBSCRIPTIONS_TABLE
      === EXPECTED_TABLE,

    findByUserIdSelectsExactEightColumns:
      selectColumns.length
      === EXPECTED_COLUMNS.length
      && EXPECTED_COLUMNS
        .every(
          (
            column,
          ) =>
            selectColumns
              .includes(
                column,
              ),
        ),

    findByUserIdFiltersByUserIdValue:
      recorded.eqColumn
      === "user_id"
      && recorded.eqValue
      === ownerId.value,

    findByUserIdReturnsNullWhenMissing:
      findResult
      === null,

    createInsertsExactEightColumns:
      hasExactColumns(
        recorded.insertPayload,
      ),

    updateWritesExactEightColumns:
      hasExactColumns(
        updateRecorded.updatePayload,
      ),

    updateFiltersByUserId:
      updateRecorded.eqColumn
      === "user_id"
      && updateRecorded.eqValue
      === VERIFICATION_OWNER_ID,
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
