import {
  readFileSync,
} from "node:fs";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  parseConsultingSessionOwnerId,
} from "../../consulting/consultingSessionOwnerId.js";
import type {
  UserSubscription,
} from "../../consulting/subscription/subscriptionTypes.js";
import type {
  UserSubscriptionRepository,
} from "../../consulting/subscription/userSubscriptionRepository.js";
import {
  assertVNextConsultingAuthenticated,
} from "./assertVNextConsultingAuthenticated.js";
import {
  assertVNextConsultingEntitled,
} from "./assertVNextConsultingEntitled.js";

export type AssertVNextConsultingEntitledVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const OWNER_ID =
  parseConsultingSessionOwnerId(
    "11111111-1111-4111-8111-111111111111",
  );

const BASE_SUBSCRIPTION:
  Omit<
    UserSubscription,
    "plan" | "status"
  > = {
    userId:
      OWNER_ID.value,

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

function createRepositoryStub(
  findResult:
    UserSubscription | null | "throw",
): UserSubscriptionRepository {
  return {
    async findByUserId() {
      if (
        findResult
        === "throw"
      ) {
        throw new Error(
          "lookup failed",
        );
      }

      return findResult;
    },

    async create() {},

    async update() {},
  };
}

function readApiSource(
  relativePath:
    string,
): string {
  const here =
    dirname(
      fileURLToPath(
        import.meta.url,
      ),
    );

  return readFileSync(
    resolve(
      here,
      relativePath,
    ),
    "utf8",
  );
}

export async function verifyAssertVNextConsultingEntitled():
  Promise<
    AssertVNextConsultingEntitledVerificationResult
  > {
  const premiumAllowed =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return createRepositoryStub({
            ...BASE_SUBSCRIPTION,
            plan:
              "premium",
            status:
              "active",
          });
        },
      },
    );

  const freeDenied =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return createRepositoryStub({
            ...BASE_SUBSCRIPTION,
            plan:
              "free",
            status:
              "free",
          });
        },
      },
    );

  const paymentFailedDenied =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return createRepositoryStub({
            ...BASE_SUBSCRIPTION,
            plan:
              "premium",
            status:
              "paymentFailed",
          });
        },
      },
    );

  const canceledDenied =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return createRepositoryStub({
            ...BASE_SUBSCRIPTION,
            plan:
              "premium",
            status:
              "canceled",
          });
        },
      },
    );

  const expiredDenied =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return createRepositoryStub({
            ...BASE_SUBSCRIPTION,
            plan:
              "premium",
            status:
              "expired",
          });
        },
      },
    );

  const rowMissingDenied =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return createRepositoryStub(
            null,
          );
        },
      },
    );

  const lookupFailed =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return createRepositoryStub(
            "throw",
          );
        },
      },
    );

  let findByUserIdCalledWith:
    string | null =
      null;

  const lookupPath =
    await assertVNextConsultingEntitled(
      {
        ownerId:
          OWNER_ID,
      },
      {
        createRepository() {
          return {
            async findByUserId(
              userId,
            ) {
              findByUserIdCalledWith =
                userId.value;

              return {
                ...BASE_SUBSCRIPTION,
                plan:
                  "premium",
                status:
                  "active",
              };
            },

            async create() {},

            async update() {},
          };
        },
      },
    );

  const unauthorized =
    await assertVNextConsultingAuthenticated({
      authorizationHeader:
        undefined,
      environment: {
        SUPABASE_URL:
          "https://example.supabase.co",
        SUPABASE_SECRET_KEY:
          "verification-secret-key",
      },
    });

  const generateSource =
    readApiSource(
      "../../../../api/v3/vnext/consulting-generate.ts",
    );

  const streamSource =
    readApiSource(
      "../../../../api/v3/vnext/consulting-stream.ts",
    );

  const authIndexGenerate =
    generateSource.indexOf(
      "assertVNextConsultingAuthenticated",
    );

  const entitlementIndexGenerate =
    generateSource.indexOf(
      "assertVNextConsultingEntitled",
    );

  const authIndexStream =
    streamSource.indexOf(
      "assertVNextConsultingAuthenticated",
    );

  const entitlementIndexStream =
    streamSource.indexOf(
      "assertVNextConsultingEntitled",
    );

  const checks:
    Record<
      string,
      boolean
    > = {
      premiumActiveAllowed:
        premiumAllowed.ok
        === true
        && premiumAllowed.accessState
        === "allowed",

      freeDenied403:
        freeDenied.ok
        === false
        && freeDenied.status
        === 403
        && freeDenied.error
        === "subscriptionRequired",

      paymentFailedDenied403:
        paymentFailedDenied.ok
        === false
        && paymentFailedDenied.status
        === 403
        && paymentFailedDenied.error
        === "paymentRequired",

      canceledDenied403:
        canceledDenied.ok
        === false
        && canceledDenied.status
        === 403
        && canceledDenied.error
        === "inactive",

      expiredDenied403:
        expiredDenied.ok
        === false
        && expiredDenied.status
        === 403
        && expiredDenied.error
        === "inactive",

      rowMissingDenied403:
        rowMissingDenied.ok
        === false
        && rowMissingDenied.status
        === 403
        && rowMissingDenied.error
        === "subscriptionRequired",

      lookupFailure503:
        lookupFailed.ok
        === false
        && lookupFailed.status
        === 503
        && lookupFailed.error
        === "subscriptionUnavailable",

      subscriptionLookupUsesOwnerId:
        lookupPath.ok
        === true
        && findByUserIdCalledWith
        === OWNER_ID.value,

      unauthorizedStill401:
        unauthorized.ok
        === false
        && unauthorized.status
        === 401
        && unauthorized.error
        === "authenticationRequired",

      generateWiresEntitlementAfterAuth:
        authIndexGenerate
        >= 0
        && entitlementIndexGenerate
        > authIndexGenerate
        && generateSource.includes(
          "entitlementResult",
        )
        && !generateSource.includes(
          "evaluateFreeUsage",
        ),

      streamWiresEntitlementAfterAuth:
        authIndexStream
        >= 0
        && entitlementIndexStream
        > authIndexStream
        && streamSource.includes(
          "entitlementResult",
        )
        && !streamSource.includes(
          "evaluateFreeUsage",
        ),

      doesNotExposeInternalDbDetails:
        lookupFailed.ok
        === false
        && lookupFailed.error
        === "subscriptionUnavailable"
        && !("message" in lookupFailed),
    };

  return {
    checks,

    passed:
      Object
        .values(
          checks,
        )
        .every(
          (
            value,
          ) =>
            value
            === true,
        ),
  };
}
