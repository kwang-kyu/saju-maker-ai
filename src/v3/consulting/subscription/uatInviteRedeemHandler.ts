/**
 * Server-only UAT invite-code self-redeem handler.
 *
 * Grants Premium on the authenticated ownerId only.
 * Never accepts a request-body target user as a grant target.
 * No payment / checkout / webhook path.
 * Must never be imported into client bundle paths.
 */

import type {
  ConsultingSessionAuthorizationHeader,
} from "../consultingSessionOwnerResolver.js";
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
  isValidUatInviteCode,
} from "./uatInviteCodeAllowlist.js";
import type {
  UatInviteCodeEnvironment,
} from "./uatInviteCodeAllowlist.js";

export type UatInviteRedeemRequestBody = {
  code?:
    unknown;
};

export type UatInviteRedeemHttpRequest = {
  method?:
    string;

  authorizationHeader?:
    ConsultingSessionAuthorizationHeader;

  body?:
    UatInviteRedeemRequestBody;

  environment?:
    SupabaseServerEnvironment
    & UatInviteCodeEnvironment;
};

export type UatInviteRedeemSuccessBody = {
  ok:
    true;

  userId:
    string;

  plan:
    "premium";

  status:
    "active";
};

export type UatInviteRedeemErrorCode =
  | "authenticationRequired"
  | "invalidInviteCode"
  | "subscriptionUpdateFailed"
  | "methodNotAllowed";

export type UatInviteRedeemHttpResponse =
  | {
      status:
        200;

      body:
        UatInviteRedeemSuccessBody;
    }
  | {
      status:
        401 | 403 | 405 | 500;

      body: {
        ok:
          false;

        error:
          UatInviteRedeemErrorCode;
      };
    };

export type UatInviteRedeemDependencies = {
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
  UatInviteRedeemDependencies = {
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

function buildGrantSubscription(
  ownerId:
    ConsultingSessionOwnerId,
  existing:
    UserSubscription | null,
  now:
    string,
): UserSubscription {
  return {
    userId:
      ownerId.value,

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

/**
 * Handles authenticated UAT invite-code self-redeem.
 * Grants Premium only to the Bearer-authenticated ownerId.
 */
export async function handleUatInviteRedeemRequest(
  request:
    UatInviteRedeemHttpRequest,
  dependencies:
    UatInviteRedeemDependencies =
      DEFAULT_DEPENDENCIES,
): Promise<UatInviteRedeemHttpResponse> {
  if (
    request.method
    !== "POST"
  ) {
    return {
      status:
        405,

      body: {
        ok:
          false,

        error:
          "methodNotAllowed",
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
        ok:
          false,

        error:
          authResult.error,
      },
    };
  }

  if (
    !isValidUatInviteCode(
      request.body
        ?.code,
      request.environment,
    )
  ) {
    return {
      status:
        403,

      body: {
        ok:
          false,

        error:
          "invalidInviteCode",
      },
    };
  }

  const ownerId =
    authResult.ownerId;

  try {
    const repository =
      dependencies
        .createRepository(
          request.environment,
        );

    const existing =
      await repository
        .findByUserId(
          ownerId,
        );

    const now =
      dependencies
        .now();

    const subscription =
      buildGrantSubscription(
        ownerId,
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

        userId:
          subscription.userId,

        plan:
          "premium",

        status:
          "active",
      },
    };
  } catch {
    return {
      status:
        500,

      body: {
        ok:
          false,

        error:
          "subscriptionUpdateFailed",
      },
    };
  }
}
