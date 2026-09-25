/**
 * vNext consulting server entitlement helper.
 *
 * Runs after authentication. Looks up UserSubscription by ownerId
 * and applies evaluateConsultingSubscriptionAccess.
 * Endpoints must reject before OpenAI/Mock gateway when not entitled.
 */

import type {
  ConsultingSessionOwnerId,
} from "../../consulting/consultingSessionOwnerId.js";
import type {
  SupabaseServerEnvironment,
} from "../../consulting/supabaseConsultingSessionRepositoryFactory.js";
import {
  createSupabaseUserSubscriptionRepository,
} from "../../consulting/subscription/supabaseUserSubscriptionRepositoryFactory.js";
import type {
  UserSubscriptionRepository,
} from "../../consulting/subscription/userSubscriptionRepository.js";
import {
  evaluateConsultingSubscriptionAccess,
} from "../../consulting/subscription/consultingSubscriptionAccess.js";
import type {
  SubscriptionAccessState,
} from "../../consulting/subscription/subscriptionTypes.js";

export type AssertVNextConsultingEntitledInput = {
  ownerId:
    ConsultingSessionOwnerId;

  environment?:
    SupabaseServerEnvironment;
};

export type VNextConsultingEntitledSuccess = {
  ok:
    true;

  accessState:
    "allowed";
};

export type VNextConsultingEntitledDeniedError =
  | "subscriptionRequired"
  | "paymentRequired"
  | "inactive";

export type VNextConsultingEntitledFailure =
  | {
      ok:
        false;

      status:
        403;

      error:
        VNextConsultingEntitledDeniedError;
    }
  | {
      ok:
        false;

      status:
        503;

      error:
        "subscriptionUnavailable";
    };

export type AssertVNextConsultingEntitledResult =
  | VNextConsultingEntitledSuccess
  | VNextConsultingEntitledFailure;

export type AssertVNextConsultingEntitledDependencies = {
  createRepository(
    environment:
      SupabaseServerEnvironment | undefined,
  ): UserSubscriptionRepository;
};

const DEFAULT_DEPENDENCIES:
  AssertVNextConsultingEntitledDependencies = {
    createRepository(
      environment:
        SupabaseServerEnvironment | undefined,
    ) {
      return createSupabaseUserSubscriptionRepository({
        environment,
      });
    },
  };

function toDeniedError(
  accessState:
    SubscriptionAccessState,
): VNextConsultingEntitledDeniedError {
  if (
    accessState
    === "paymentRequired"
  ) {
    return "paymentRequired";
  }

  if (
    accessState
    === "inactive"
  ) {
    return "inactive";
  }

  return "subscriptionRequired";
}

/**
 * Asserts that the authenticated consulting owner is entitled
 * to start Consulting (premium + active).
 *
 * Fail-closed: missing row → 403; lookup failure → 503
 * without exposing DB/internal details.
 */
export async function assertVNextConsultingEntitled(
  input:
    AssertVNextConsultingEntitledInput,
  dependencies:
    AssertVNextConsultingEntitledDependencies =
      DEFAULT_DEPENDENCIES,
): Promise<AssertVNextConsultingEntitledResult> {
  try {
    const repository =
      dependencies
        .createRepository(
          input.environment,
        );

    const subscription =
      await repository
        .findByUserId(
          input.ownerId,
        );

    const decision =
      evaluateConsultingSubscriptionAccess(
        subscription,
      );

    if (
      decision.canStartConsultation
      && decision.accessState
      === "allowed"
    ) {
      return {
        ok:
          true,

        accessState:
          "allowed",
      };
    }

    return {
      ok:
        false,

      status:
        403,

      error:
        toDeniedError(
          decision.accessState,
        ),
    };
  } catch {
    return {
      ok:
        false,

      status:
        503,

      error:
        "subscriptionUnavailable",
    };
  }
}
