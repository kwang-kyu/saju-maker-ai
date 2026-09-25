import type {
  SubscriptionAccessState,
  UserSubscription,
} from "./subscriptionTypes.js";

/**
 * Consulting entitlement decision derived from existing
 * SubscriptionAccessState — no new access-state union.
 *
 * 1차 정책:
 * - plan=premium + status=active → allowed
 * - row missing / 그 외 → denied (auto-premium 금지)
 * - free_usage_count / trial 로직은 사용하지 않음
 */
export type ConsultingSubscriptionAccessDecision = {
  accessState:
    SubscriptionAccessState;

  canStartConsultation:
    boolean;
};

export function evaluateConsultingSubscriptionAccess(
  subscription:
    UserSubscription | null,
): ConsultingSubscriptionAccessDecision {
  if (
    subscription
    === null
  ) {
    return {
      accessState:
        "subscriptionRequired",

      canStartConsultation:
        false,
    };
  }

  if (
    subscription.plan
    === "premium"
    && subscription.status
    === "active"
  ) {
    return {
      accessState:
        "allowed",

      canStartConsultation:
        true,
    };
  }

  if (
    subscription.status
    === "paymentFailed"
  ) {
    return {
      accessState:
        "paymentRequired",

      canStartConsultation:
        false,
    };
  }

  if (
    subscription.status
    === "canceled"
    || subscription.status
    === "expired"
  ) {
    return {
      accessState:
        "inactive",

      canStartConsultation:
        false,
    };
  }

  return {
    accessState:
      "subscriptionRequired",

    canStartConsultation:
      false,
  };
}
