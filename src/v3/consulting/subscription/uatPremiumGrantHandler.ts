/**
 * Server-only UAT Premium Grant/Revoke request handler.
 *
 * Manages existing v3_user_subscriptions entitlement rows for UAT.
 * No payment / checkout / webhook path.
 * Must never be imported into client bundle paths.
 */

import type {
  ConsultingSessionAuthorizationHeader,
} from "../consultingSessionOwnerResolver.js";
import {
  InvalidConsultingSessionOwnerIdError,
  parseConsultingSessionOwnerId,
} from "../consultingSessionOwnerId.js";
import type {
  ConsultingSessionOwnerId,
} from "../consultingSessionOwnerId.js";
import type {
  SupabaseServerEnvironment,
} from "../supabaseConsultingSessionRepositoryFactory.js";
import {
  assertVNextConsultingAuthenticated,
} from "../../vnext/gpt/assertVNextConsultingAuthenticated.js";
import type {
  AssertVNextConsultingAuthenticatedResult,
} from "../../vnext/gpt/assertVNextConsultingAuthenticated.js";
import {
  createSupabaseUserSubscriptionRepository,
} from "./supabaseUserSubscriptionRepositoryFactory.js";
import type {
  UserSubscriptionRepository,
} from "./userSubscriptionRepository.js";
import type {
  UserSubscription,
} from "./subscriptionTypes.js";
import {
  isUatPremiumGrantAdminAllowlisted,
} from "./uatPremiumGrantAdminAllowlist.js";
import type {
  UatPremiumGrantAdminEnvironment,
} from "./uatPremiumGrantAdminAllowlist.js";

export type UatPremiumGrantAction =
  | "grant"
  | "revoke";

export type UatPremiumGrantRequestBody = {
  action?:
    unknown;

  userId?:
    unknown;
};

export type UatPremiumGrantHttpRequest = {
  method?:
    string;

  authorizationHeader?:
    ConsultingSessionAuthorizationHeader;

  body?:
    UatPremiumGrantRequestBody;

  environment?:
    SupabaseServerEnvironment
    & UatPremiumGrantAdminEnvironment;
};

export type UatPremiumGrantSuccessBody = {
  ok:
    true;

  action:
    UatPremiumGrantAction;

  userId:
    string;

  plan:
    UserSubscription["plan"];

  status:
    UserSubscription["status"];
};

export type UatPremiumGrantErrorCode =
  | "Method not allowed"
  | "authenticationRequired"
  | "adminRequired"
  | "invalidUserId"
  | "invalidAction"
  | "subscriptionNotFound"
  | "subscriptionUpdateFailed";

export type UatPremiumGrantHttpResponse =
  | {
      status:
        200;

      body:
        UatPremiumGrantSuccessBody;
    }
  | {
      status:
        400 | 401 | 403 | 404 | 405 | 500;

      body: {
        error:
          UatPremiumGrantErrorCode;
      };
    };

export type UatPremiumGrantDependencies = {
  assertAuthenticated(
    input: {
      authorizationHeader:
        ConsultingSessionAuthorizationHeader;

      environment?:
        SupabaseServerEnvironment;
    },
  ): Promise<AssertVNextConsultingAuthenticatedResult>;

  createRepository(
    environment:
      SupabaseServerEnvironment | undefined,
  ): UserSubscriptionRepository;

  now():
    string;
};

const DEFAULT_DEPENDENCIES:
  UatPremiumGrantDependencies = {
    assertAuthenticated(
      input,
    ) {
      return assertVNextConsultingAuthenticated(
        input,
      );
    },

    createRepository(
      environment,
    ) {
      return createSupabaseUserSubscriptionRepository({
        environment,
      });
    },

    now() {
      return new Date()
        .toISOString();
    },
  };

function isGrantAction(
  value:
    unknown,
): value is UatPremiumGrantAction {
  return (
    value
    === "grant"
    || value
    === "revoke"
  );
}

function parseTargetUserId(
  value:
    unknown,
): ConsultingSessionOwnerId | null {
  if (
    typeof value
    !== "string"
  ) {
    return null;
  }

  try {
    return parseConsultingSessionOwnerId(
      value,
    );
  } catch (
    error
  ) {
    if (
      error
      instanceof InvalidConsultingSessionOwnerIdError
    ) {
      return null;
    }

    throw error;
  }
}

function buildGrantSubscription(
  targetUserId:
    ConsultingSessionOwnerId,
  existing:
    UserSubscription | null,
  now:
    string,
): UserSubscription {
  return {
    userId:
      targetUserId.value,

    plan:
      "premium",

    status:
      "active",

    freeUsageCount:
      existing
        ?.freeUsageCount
      ?? 0,

    startedAt:
      now,

    currentPeriodStart:
      now,

    currentPeriodEnd:
      null,

    canceledAt:
      null,
  };
}

function buildRevokeSubscription(
  existing:
    UserSubscription,
  now:
    string,
): UserSubscription {
  return {
    ...existing,

    status:
      "canceled",

    canceledAt:
      now,
  };
}

/**
 * Handles authenticated admin UAT premium grant/revoke.
 */
export async function handleUatPremiumGrantRequest(
  request:
    UatPremiumGrantHttpRequest,
  dependencies:
    UatPremiumGrantDependencies =
      DEFAULT_DEPENDENCIES,
): Promise<UatPremiumGrantHttpResponse> {
  if (
    request.method
    !== "POST"
  ) {
    return {
      status:
        405,

      body: {
        error:
          "Method not allowed",
      },
    };
  }

  const authResult =
    await dependencies
      .assertAuthenticated({
        authorizationHeader:
          request.authorizationHeader,

        environment:
          request.environment,
      });

  if (
    !authResult.ok
  ) {
    return {
      status:
        authResult.status,

      body: {
        error:
          authResult.error,
      },
    };
  }

  if (
    !isUatPremiumGrantAdminAllowlisted(
      authResult.ownerId,
      request.environment,
    )
  ) {
    return {
      status:
        403,

      body: {
        error:
          "adminRequired",
      },
    };
  }

  const action =
    request.body
      ?.action;

  if (
    !isGrantAction(
      action,
    )
  ) {
    return {
      status:
        400,

      body: {
        error:
          "invalidAction",
      },
    };
  }

  const targetUserId =
    parseTargetUserId(
      request.body
        ?.userId,
    );

  if (
    targetUserId
    === null
  ) {
    return {
      status:
        400,

      body: {
        error:
          "invalidUserId",
      },
    };
  }

  try {
    const repository =
      dependencies
        .createRepository(
          request.environment,
        );

    const existing =
      await repository
        .findByUserId(
          targetUserId,
        );

    const now =
      dependencies
        .now();

    if (
      action
      === "grant"
    ) {
      const subscription =
        buildGrantSubscription(
          targetUserId,
          existing,
          now,
        );

      if (
        existing
        === null
      ) {
        await repository
          .create(
            subscription,
          );
      } else {
        await repository
          .update(
            subscription,
          );
      }

      return {
        status:
          200,

        body: {
          ok:
            true,

          action:
            "grant",

          userId:
            subscription.userId,

          plan:
            subscription.plan,

          status:
            subscription.status,
        },
      };
    }

    if (
      existing
      === null
    ) {
      return {
        status:
          404,

        body: {
          error:
            "subscriptionNotFound",
        },
      };
    }

    const revoked =
      buildRevokeSubscription(
        existing,
        now,
      );

    await repository
      .update(
        revoked,
      );

    return {
      status:
        200,

      body: {
        ok:
          true,

        action:
          "revoke",

        userId:
          revoked.userId,

        plan:
          revoked.plan,

        status:
          revoked.status,
      },
    };
  } catch {
    return {
      status:
        500,

      body: {
        error:
          "subscriptionUpdateFailed",
      },
    };
  }
}
