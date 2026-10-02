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
  handleUatInviteRedeemRequest,
} from "./uatInviteRedeemHandler.js";
import type {
  UatInviteRedeemDependencies,
  UatInviteRedeemRequestBody,
} from "./uatInviteRedeemHandler.js";
import {
  handleUatPremiumGrantRequest,
} from "./uatPremiumGrantHandler.js";
import type {
  UatPremiumGrantDependencies,
} from "./uatPremiumGrantHandler.js";

export type UatInviteRedeemHandlerVerificationResult = {
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

const OTHER_ID =
  parseConsultingSessionOwnerId(
    "22222222-2222-4222-8222-222222222222",
  );

const ADMIN_ID =
  parseConsultingSessionOwnerId(
    "33333333-3333-4333-8333-333333333333",
  );

const VALID_CODE =
  "uat-friends-invite-2026";

const FIXED_NOW =
  "2026-10-02T10:00:00.000Z";

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
      typeof OWNER_ID;

    authFails?:
      boolean;

    findThrows?:
      boolean;

    writeThrows?:
      boolean;
  } = {},
): UatInviteRedeemDependencies {
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
          ?? OWNER_ID,
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
      "active",
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
  const baseDir =
    dirname(
      fileURLToPath(
        import.meta.url,
      ),
    );

  return readFileSync(
    resolve(
      baseDir,
      relativePath,
    ),
    "utf8",
  );
}

function bodyWithCode(
  code:
    unknown,
  extra: Record<string, unknown> = {},
): UatInviteRedeemRequestBody & Record<string, unknown> {
  return {
    code,
    ...extra,
  };
}

export async function verifyUatInviteRedeemHandler():
  Promise<UatInviteRedeemHandlerVerificationResult> {
  const createState =
    createRepositoryState();

  const createResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "POST",

        authorizationHeader:
          "Bearer owner-token",

        body:
          bodyWithCode(
            VALID_CODE,
          ),

        environment: {
          V3_UAT_INVITE_CODE:
            VALID_CODE,
        },
      },
      createDependencies(
        createState,
      ),
    );

  const updateState =
    createRepositoryState(
      freeRow(
        OWNER_ID.value,
      ),
    );

  const updateResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "POST",

        authorizationHeader:
          "Bearer owner-token",

        body:
          bodyWithCode(
            VALID_CODE,
          ),

        environment: {
          V3_UAT_INVITE_CODE:
            VALID_CODE,
        },
      },
      createDependencies(
        updateState,
      ),
    );

  const invalidState =
    createRepositoryState();

  const invalidResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "POST",

        authorizationHeader:
          "Bearer owner-token",

        body:
          bodyWithCode(
            "wrong-code",
          ),

        environment: {
          V3_UAT_INVITE_CODE:
            VALID_CODE,
        },
      },
      createDependencies(
        invalidState,
      ),
    );

  const unauthState =
    createRepositoryState();

  const unauthResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "POST",

        authorizationHeader:
          undefined,

        body:
          bodyWithCode(
            VALID_CODE,
          ),

        environment: {
          V3_UAT_INVITE_CODE:
            VALID_CODE,
        },
      },
      createDependencies(
        unauthState,
        {
          authFails:
            true,
        },
      ),
    );

  const bodyUserIdState =
    createRepositoryState();

  const bodyUserIdResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "POST",

        authorizationHeader:
          "Bearer owner-token",

        body:
          bodyWithCode(
            VALID_CODE,
            {
              userId:
                OTHER_ID.value,
            },
          ),

        environment: {
          V3_UAT_INVITE_CODE:
            VALID_CODE,
        },
      },
      createDependencies(
        bodyUserIdState,
      ),
    );

  const methodState =
    createRepositoryState();

  const methodResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "GET",

        authorizationHeader:
          "Bearer owner-token",

        body:
          bodyWithCode(
            VALID_CODE,
          ),

        environment: {
          V3_UAT_INVITE_CODE:
            VALID_CODE,
        },
      },
      createDependencies(
        methodState,
      ),
    );

  const writeFailState =
    createRepositoryState();

  const writeFailResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "POST",

        authorizationHeader:
          "Bearer owner-token",

        body:
          bodyWithCode(
            VALID_CODE,
          ),

        environment: {
          V3_UAT_INVITE_CODE:
            VALID_CODE,
        },
      },
      createDependencies(
        writeFailState,
        {
          writeThrows:
            true,
        },
      ),
    );

  const missingEnvState =
    createRepositoryState();

  const missingEnvResult =
    await handleUatInviteRedeemRequest(
      {
        method:
          "POST",

        authorizationHeader:
          "Bearer owner-token",

        body:
          bodyWithCode(
            VALID_CODE,
          ),

        environment: {},
      },
      createDependencies(
        missingEnvState,
      ),
    );

  const premiumActiveAccess =
    evaluateConsultingSubscriptionAccess(
      premiumActiveRow(
        OWNER_ID.value,
      ),
    );

  const freeAccess =
    evaluateConsultingSubscriptionAccess(
      freeRow(
        OWNER_ID.value,
      ),
    );

  const trialExhaustedAccess =
    evaluateConsultingSubscriptionAccess({
      ...freeRow(
        OWNER_ID.value,
      ),
      status:
        "trialExhausted",
    });

  const paymentFailedAccess =
    evaluateConsultingSubscriptionAccess({
      ...premiumActiveRow(
        OWNER_ID.value,
      ),
      status:
        "paymentFailed",
    });

  const canceledAccess =
    evaluateConsultingSubscriptionAccess({
      ...premiumActiveRow(
        OWNER_ID.value,
      ),
      status:
        "canceled",
      canceledAt:
        FIXED_NOW,
    });

  const expiredAccess =
    evaluateConsultingSubscriptionAccess({
      ...premiumActiveRow(
        OWNER_ID.value,
      ),
      status:
        "expired",
    });

  const adminGrantState =
    createRepositoryState();

  const adminGrantDependencies:
    UatPremiumGrantDependencies = {
      async assertAuthenticated() {
        return {
          ok:
            true,

          ownerId:
            ADMIN_ID,
        };
      },

      createRepository() {
        return createRepository(
          adminGrantState,
        );
      },

      now() {
        return FIXED_NOW;
      },
    };

  const adminGrantResult =
    await handleUatPremiumGrantRequest(
      {
        method:
          "POST",

        authorizationHeader:
          "Bearer admin-token",

        body: {
          action:
            "grant",

          userId:
            OTHER_ID.value,
        },

        environment: {
          V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
            ADMIN_ID.value,
        },
      },
      adminGrantDependencies,
    );

  const handlerSource =
    readSource(
      "./uatInviteRedeemHandler.ts",
    );

  const allowlistSource =
    readSource(
      "./uatInviteCodeAllowlist.ts",
    );

  const apiSource =
    readSource(
      "../../../../api/v3/uat/redeem-invite.ts",
    );

  const adminApiSource =
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

  const entitledSource =
    readSource(
      "../../vnext/gpt/assertVNextConsultingEntitled.ts",
    );

  const accessSource =
    readSource(
      "./consultingSubscriptionAccess.ts",
    );

  const shellSource =
    readSource(
      "../../vnext/ui/VNextConsultingShell.tsx",
    );

  const conversationSource =
    readSource(
      "../../vnext/ui/VNextConversationArea.tsx",
    );

  const panelSource =
    readSource(
      "../../vnext/ui/VNextUatInviteRedeemPanel.tsx",
    );

  const clientSource =
    readSource(
      "../../vnext/ui/vNextUatInviteRedeemClient.ts",
    );

  const createBody =
    createResult.status
    === 200
    && createResult.body.ok
    === true
      ? createResult.body
      : null;

  const updateBody =
    updateResult.status
    === 200
    && updateResult.body.ok
    === true
      ? updateResult.body
      : null;

  const bodyUserIdBody =
    bodyUserIdResult.status
    === 200
    && bodyUserIdResult.body.ok
    === true
      ? bodyUserIdResult.body
      : null;

  const checks:
    Record<
      string,
      boolean
    > = {
      validCodeCreatesPremium:
        createResult.status
        === 200
        && createBody
          !== null
        && createBody.userId
        === OWNER_ID.value
        && createBody.plan
        === "premium"
        && createBody.status
        === "active"
        && createState.createCalls.length
        === 1
        && createState.updateCalls.length
        === 0
        && createState.createCalls[0]
          ?.userId
        === OWNER_ID.value
        && createState.createCalls[0]
          ?.plan
        === "premium"
        && createState.createCalls[0]
          ?.status
        === "active"
        && createState.createCalls[0]
          ?.canceledAt
        === null
        && !("accessToken" in (createBody as object))
        && !("code" in (createBody as object)),

      validCodeUpdatesExisting:
        updateResult.status
        === 200
        && updateBody
          !== null
        && updateBody.userId
        === OWNER_ID.value
        && updateBody.plan
        === "premium"
        && updateBody.status
        === "active"
        && updateState.createCalls.length
        === 0
        && updateState.updateCalls.length
        === 1
        && updateState.updateCalls[0]
          ?.userId
        === OWNER_ID.value
        && updateState.updateCalls[0]
          ?.freeUsageCount
        === 2
        && updateState.updateCalls[0]
          ?.canceledAt
        === null,

      invalidCodeForbidden:
        invalidResult.status
        === 403
        && invalidResult.body.ok
        === false
        && invalidResult.body.error
        === "invalidInviteCode"
        && invalidState.createCalls.length
        === 0
        && invalidState.updateCalls.length
        === 0,

      unauthenticated401:
        unauthResult.status
        === 401
        && unauthResult.body.ok
        === false
        && unauthResult.body.error
        === "authenticationRequired"
        && unauthState.createCalls.length
        === 0,

      currentOwnerIdOnly:
        bodyUserIdResult.status
        === 200
        && bodyUserIdBody
          !== null
        && bodyUserIdBody.userId
        === OWNER_ID.value
        && bodyUserIdState.createCalls[0]
          ?.userId
        === OWNER_ID.value
        && !bodyUserIdState.rows.has(
          OTHER_ID.value,
        ),

      noBodyUserIdGrantPath:
        !handlerSource.includes(
          "body?.userId",
        )
        && !handlerSource.includes(
          "body.userId",
        )
        && !handlerSource.includes(
          "parseTargetUserId",
        )
        && !handlerSource.includes(
          "invalidUserId",
        ),

      methodNotAllowed405:
        methodResult.status
        === 405
        && methodResult.body.ok
        === false
        && methodResult.body.error
        === "methodNotAllowed"
        && methodState.createCalls.length
        === 0,

      subscriptionUpdateFailed500:
        writeFailResult.status
        === 500
        && writeFailResult.body.ok
        === false
        && writeFailResult.body.error
        === "subscriptionUpdateFailed"
        && !("message" in writeFailResult.body),

      missingInviteEnvForbidden:
        missingEnvResult.status
        === 403
        && missingEnvResult.body.error
        === "invalidInviteCode"
        && missingEnvState.createCalls.length
        === 0,

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

      adminGrantRegressionStillWorks:
        adminGrantResult.status
        === 200
        && adminGrantResult.body.ok
        === true
        && adminGrantResult.body.action
        === "grant"
        && adminGrantResult.body.userId
        === OTHER_ID.value
        && adminApiSource.includes(
          "handleUatPremiumGrantRequest",
        ),

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
          "V3_UAT_INVITE_CODE",
        )
        && !allowlistSource.includes(
          "V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS",
        ),

      doesNotBypassConsultingGenerateOrStream:
        !generateSource.includes(
          "uatInviteRedeem",
        )
        && !generateSource.includes(
          "V3_UAT_INVITE_CODE",
        )
        && !streamSource.includes(
          "uatInviteRedeem",
        )
        && !streamSource.includes(
          "V3_UAT_INVITE_CODE",
        ),

      doesNotModifyEntitlementJudgment:
        !entitledSource.includes(
          "V3_UAT_INVITE_CODE",
        )
        && !entitledSource.includes(
          "uatInvite",
        )
        && !accessSource.includes(
          "V3_UAT_INVITE_CODE",
        )
        && !accessSource.includes(
          "uatInvite",
        ),

      apiWiresServerHandlerOnly:
        apiSource.includes(
          "handleUatInviteRedeemRequest",
        )
        && apiSource.includes(
          "process.env",
        )
        && !apiSource.includes(
          "SUPABASE_SERVICE_ROLE_KEY",
        )
        && !apiSource.includes(
          "SUPABASE_SECRET_KEY",
        )
        && !apiSource.includes(
          "service_role",
        ),

      handlerDoesNotExposeSecrets:
        !handlerSource.includes(
          "SUPABASE_SERVICE_ROLE_KEY",
        )
        && !handlerSource.includes(
          "service_role",
        )
        && !handlerSource.includes(
          "console.log",
        ),

      clientDoesNotEmbedInviteCode:
        !panelSource.includes(
          "V3_UAT_INVITE_CODE",
        )
        && !clientSource.includes(
          "V3_UAT_INVITE_CODE",
        )
        && !shellSource.includes(
          "V3_UAT_INVITE_CODE",
        )
        && !conversationSource.includes(
          "V3_UAT_INVITE_CODE",
        )
        && !panelSource.includes(
          "uatInviteCodeAllowlist",
        )
        && !clientSource.includes(
          "uatInviteCodeAllowlist",
        )
        && !panelSource.includes(
          "uatInviteRedeemHandler",
        )
        && !clientSource.includes(
          "VITE_V3_UAT_INVITE_CODE",
        ),

      uiWiresInviteRedeem:
        conversationSource.includes(
          "VNextUatInviteRedeemPanel",
        )
        && shellSource.includes(
          "accessToken",
        )
        && panelSource.includes(
          "지인 테스트용 초대코드가 있으신가요?",
        )
        && panelSource.includes(
          "테스트 권한 활성화",
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
