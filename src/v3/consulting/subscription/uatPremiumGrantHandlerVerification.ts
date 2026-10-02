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
} from "../consultingSessionOwnerId.js";
import {
  evaluateConsultingSubscriptionAccess,
} from "./consultingSubscriptionAccess.js";
import type {
  UserSubscription,
} from "./subscriptionTypes.js";
import type {
  UserSubscriptionRepository,
} from "./userSubscriptionRepository.js";
import {
  handleUatPremiumGrantRequest,
} from "./uatPremiumGrantHandler.js";
import type {
  UatPremiumGrantDependencies,
} from "./uatPremiumGrantHandler.js";

export type UatPremiumGrantHandlerVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const ADMIN_ID =
  parseConsultingSessionOwnerId(
    "11111111-1111-4111-8111-111111111111",
  );

const TARGET_ID =
  parseConsultingSessionOwnerId(
    "22222222-2222-4222-8222-222222222222",
  );

const OTHER_ADMIN_ID =
  parseConsultingSessionOwnerId(
    "33333333-3333-4333-8333-333333333333",
  );

const FIXED_NOW =
  "2026-10-02T04:00:00.000Z";

type RepositoryState = {
  rows:
    Map<
      string,
      UserSubscription
    >;

  createCalls:
    UserSubscription[];

  updateCalls:
    UserSubscription[];
};

function createRepositoryState(
  initial:
    UserSubscription | null =
      null,
): RepositoryState {
  const rows =
    new Map<
      string,
      UserSubscription
    >();

  if (
    initial
    !== null
  ) {
    rows.set(
      initial.userId,
      initial,
    );
  }

  return {
    rows,
    createCalls:
      [],
    updateCalls:
      [],
  };
}

function createRepository(
  state:
    RepositoryState,
  options: {
    findThrows?:
      boolean;

    writeThrows?:
      boolean;
  } = {},
): UserSubscriptionRepository {
  return {
    async findByUserId(
      userId,
    ) {
      if (
        options.findThrows
        === true
      ) {
        throw new Error(
          "lookup failed",
        );
      }

      return state.rows.get(
        userId.value,
      )
        ?? null;
    },

    async create(
      subscription,
    ) {
      if (
        options.writeThrows
        === true
      ) {
        throw new Error(
          "create failed",
        );
      }

      state.createCalls.push(
        subscription,
      );
      state.rows.set(
        subscription.userId,
        subscription,
      );
    },

    async update(
      subscription,
    ) {
      if (
        options.writeThrows
        === true
      ) {
        throw new Error(
          "update failed",
        );
      }

      state.updateCalls.push(
        subscription,
      );
      state.rows.set(
        subscription.userId,
        subscription,
      );
    },
  };
}

function createDependencies(
  state:
    RepositoryState,
  options: {
    authenticatedOwnerId?:
      typeof ADMIN_ID;

    authFails?:
      boolean;

    findThrows?:
      boolean;

    writeThrows?:
      boolean;
  } = {},
): UatPremiumGrantDependencies {
  return {
    async assertAuthenticated() {
      if (
        options.authFails
        === true
      ) {
        return {
          ok:
            false,

          status:
            401,

          error:
            "authenticationRequired",
        };
      }

      return {
        ok:
          true,

        ownerId:
          options.authenticatedOwnerId
          ?? ADMIN_ID,
      };
    },

    createRepository() {
      return createRepository(
        state,
        {
          findThrows:
            options.findThrows,

          writeThrows:
            options.writeThrows,
        },
      );
    },

    now() {
      return FIXED_NOW;
    },
  };
}

function freeRow(
  userId:
    string,
): UserSubscription {
  return {
    userId,
    plan:
      "free",
    status:
      "free",
    freeUsageCount:
      2,
    startedAt:
      "2026-01-01T00:00:00.000Z",
    currentPeriodStart:
      "2026-01-01T00:00:00.000Z",
    currentPeriodEnd:
      null,
    canceledAt:
      null,
  };
}

function premiumActiveRow(
  userId:
    string,
): UserSubscription {
  return {
    userId,
    plan:
      "premium",
    status:
      "active",
    freeUsageCount:
      0,
    startedAt:
      FIXED_NOW,
    currentPeriodStart:
      FIXED_NOW,
    currentPeriodEnd:
      null,
    canceledAt:
      null,
  };
}

function readSource(
  relativePath:
    string,
): string {
  const moduleDirectory =
    dirname(
      fileURLToPath(
        import.meta.url,
      ),
    );

  return readFileSync(
    resolve(
      moduleDirectory,
      relativePath,
    ),
    "utf8",
  );
}

export async function verifyUatPremiumGrantHandler():
  Promise<UatPremiumGrantHandlerVerificationResult> {
  const grantCreateState =
    createRepositoryState(
      null,
    );

  const grantCreate =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "grant",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        grantCreateState,
      ),
    );

  const grantUpdateState =
    createRepositoryState(
      freeRow(
        TARGET_ID.value,
      ),
    );

  const grantUpdate =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "grant",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        grantUpdateState,
      ),
    );

  const revokeState =
    createRepositoryState(
      premiumActiveRow(
        TARGET_ID.value,
      ),
    );

  const revokeExisting =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "revoke",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        revokeState,
      ),
    );

  const revokeMissingState =
    createRepositoryState(
      null,
    );

  const revokeMissing =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "revoke",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        revokeMissingState,
      ),
    );

  const adminAllowedState =
    createRepositoryState(
      null,
    );

  const adminAllowed =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "grant",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        adminAllowedState,
      ),
    );

  const adminDeniedState =
    createRepositoryState(
      null,
    );

  const adminDenied =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "grant",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        adminDeniedState,
        {
          authenticatedOwnerId:
            OTHER_ADMIN_ID,
        },
      ),
    );

  const methodDenied =
    await handleUatPremiumGrantRequest(
      {
        method:
          "GET",
        body: {
          action:
            "grant",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        createRepositoryState(),
      ),
    );

  const authDenied =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "grant",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        createRepositoryState(),
        {
          authFails:
            true,
        },
      ),
    );

  const invalidUserId =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "grant",
          userId:
            "not-a-uuid",
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        createRepositoryState(),
      ),
    );

  const invalidAction =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "upgrade",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        createRepositoryState(),
      ),
    );

  const writeFailure =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",
        body: {
          action:
            "grant",
          userId:
            TARGET_ID.value,
        },
        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      createDependencies(
        createRepositoryState(),
        {
          writeThrows:
            true,
        },
      ),
    );

  const premiumActiveAccess =
    evaluateConsultingSubscriptionAccess(
      premiumActiveRow(
        TARGET_ID.value,
      ),
    );

  const freeAccess =
    evaluateConsultingSubscriptionAccess(
      freeRow(
        TARGET_ID.value,
      ),
    );

  const trialExhaustedAccess =
    evaluateConsultingSubscriptionAccess({
      ...freeRow(
        TARGET_ID.value,
      ),
      status:
        "trialExhausted",
    });

  const paymentFailedAccess =
    evaluateConsultingSubscriptionAccess({
      ...premiumActiveRow(
        TARGET_ID.value,
      ),
      status:
        "paymentFailed",
    });

  const canceledAccess =
    evaluateConsultingSubscriptionAccess({
      ...premiumActiveRow(
        TARGET_ID.value,
      ),
      status:
        "canceled",
      canceledAt:
        FIXED_NOW,
    });

  const expiredAccess =
    evaluateConsultingSubscriptionAccess({
      ...premiumActiveRow(
        TARGET_ID.value,
      ),
      status:
        "expired",
    });

  const handlerSource =
    readSource(
      "./uatPremiumGrantHandler.ts",
    );

  const allowlistSource =
    readSource(
      "./uatPremiumGrantAdminAllowlist.ts",
    );

  const apiSource =
    readSource(
      "../../../../api/v3/admin/uat-premium-grant.ts",
    );

  const generateSource =
    readSource(
      "../../../../api/v3/vnext/consulting-generate.ts",
    );

  const streamSource =
    readSource(
      "../../../../api/v3/vnext/consulting-stream.ts",
    );

  const shellSource =
    readSource(
      "../../vnext/ui/VNextConsultingShell.tsx",
    );

  const checks:
    Record<
      string,
      boolean
    > = {
      grantCreatesWhenMissing:
        grantCreate.status
        === 200
        && grantCreate.body.ok
        === true
        && grantCreate.body.action
        === "grant"
        && grantCreate.body.plan
        === "premium"
        && grantCreate.body.status
        === "active"
        && grantCreateState.createCalls.length
        === 1
        && grantCreateState.updateCalls.length
        === 0
        && grantCreateState.createCalls[0]
          ?.freeUsageCount
        === 0
        && grantCreateState.createCalls[0]
          ?.startedAt
        === FIXED_NOW
        && grantCreateState.createCalls[0]
          ?.currentPeriodStart
        === FIXED_NOW
        && grantCreateState.createCalls[0]
          ?.currentPeriodEnd
        === null
        && grantCreateState.createCalls[0]
          ?.canceledAt
        === null,

      grantUpdatesExistingToPremiumActive:
        grantUpdate.status
        === 200
        && grantUpdate.body.ok
        === true
        && grantUpdate.body.plan
        === "premium"
        && grantUpdate.body.status
        === "active"
        && grantUpdateState.createCalls.length
        === 0
        && grantUpdateState.updateCalls.length
        === 1
        && grantUpdateState.updateCalls[0]
          ?.freeUsageCount
        === 2
        && grantUpdateState.updateCalls[0]
          ?.canceledAt
        === null,

      revokeCancelsExisting:
        revokeExisting.status
        === 200
        && revokeExisting.body.ok
        === true
        && revokeExisting.body.action
        === "revoke"
        && revokeExisting.body.plan
        === "premium"
        && revokeExisting.body.status
        === "canceled"
        && revokeState.createCalls.length
        === 0
        && revokeState.updateCalls.length
        === 1
        && revokeState.updateCalls[0]
          ?.canceledAt
        === FIXED_NOW,

      revokeMissingDoesNotCreate:
        revokeMissing.status
        === 404
        && revokeMissing.body.error
        === "subscriptionNotFound"
        && revokeMissingState.createCalls.length
        === 0
        && revokeMissingState.updateCalls.length
        === 0
        && revokeMissingState.rows.size
        === 0,

      allowlistedAdminAccepted:
        adminAllowed.status
        === 200
        && adminAllowed.body.ok
        === true,

      nonAllowlistedAdminForbidden:
        adminDenied.status
        === 403
        && adminDenied.body.error
        === "adminRequired"
        && adminDeniedState.createCalls.length
        === 0,

      methodNotAllowed405:
        methodDenied.status
        === 405
        && methodDenied.body.error
        === "Method not allowed",

      authenticationFailure401:
        authDenied.status
        === 401
        && authDenied.body.error
        === "authenticationRequired",

      invalidTargetUuid400:
        invalidUserId.status
        === 400
        && invalidUserId.body.error
        === "invalidUserId",

      invalidAction400:
        invalidAction.status
        === 400
        && invalidAction.body.error
        === "invalidAction",

      repositoryFailure500Safe:
        writeFailure.status
        === 500
        && writeFailure.body.error
        === "subscriptionUpdateFailed"
        && !("message" in writeFailure.body),

      entitlementPremiumActiveAllowed:
        premiumActiveAccess.canStartConsultation
        === true
        && premiumActiveAccess.accessState
        === "allowed",

      entitlementFreeDenied:
        freeAccess.canStartConsultation
        === false
        && freeAccess.accessState
        === "subscriptionRequired",

      entitlementTrialExhaustedDenied:
        trialExhaustedAccess.canStartConsultation
        === false
        && trialExhaustedAccess.accessState
        === "subscriptionRequired",

      entitlementPaymentFailedDenied:
        paymentFailedAccess.canStartConsultation
        === false
        && paymentFailedAccess.accessState
        === "paymentRequired",

      entitlementCanceledDenied:
        canceledAccess.canStartConsultation
        === false
        && canceledAccess.accessState
        === "inactive",

      entitlementExpiredDenied:
        expiredAccess.canStartConsultation
        === false
        && expiredAccess.accessState
        === "inactive",

      doesNotReusePreviewAllowlist:
        !allowlistSource.includes(
          "V3_PREVIEW_CONSULTING_TEST_OWNER_IDS",
        )
        && !allowlistSource.includes(
          "previewConsultingEntitlementAllowlist",
        )
        && !handlerSource.includes(
          "V3_PREVIEW_CONSULTING_TEST_OWNER_IDS",
        )
        && !handlerSource.includes(
          "previewConsultingEntitlementAllowlist",
        )
        && allowlistSource.includes(
          "V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS",
        ),

      doesNotBypassConsultingGenerateOrStream:
        !generateSource.includes(
          "uatPremiumGrant",
        )
        && !generateSource.includes(
          "V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS",
        )
        && !streamSource.includes(
          "uatPremiumGrant",
        )
        && !streamSource.includes(
          "V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS",
        ),

      apiWiresServerHandlerOnly:
        apiSource.includes(
          "handleUatPremiumGrantRequest",
        )
        && apiSource.includes(
          "process.env",
        )
        && !apiSource.includes(
          "SUPABASE_SERVICE_ROLE_KEY",
        )
        && !apiSource.includes(
          "service_role",
        ),

      clientShellDoesNotImportUatGrant:
        !shellSource.includes(
          "uatPremiumGrant",
        )
        && !shellSource.includes(
          "V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS",
        ),

      handlerDoesNotExposeServiceRole:
        !handlerSource.includes(
          "SUPABASE_SERVICE_ROLE_KEY",
        )
        && !handlerSource.includes(
          "service_role",
        ),
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
