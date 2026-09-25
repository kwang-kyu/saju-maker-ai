import {
  evaluateConsultingSubscriptionAccess,
} from "./consultingSubscriptionAccess.js";
import type {
  UserSubscription,
} from "./subscriptionTypes.js";

export type ConsultingSubscriptionAccessVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const BASE_SUBSCRIPTION:
  Omit<
    UserSubscription,
    "plan" | "status"
  > = {
    userId:
      "11111111-1111-4111-8111-111111111111",

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

function subscription(
  plan:
    UserSubscription["plan"],
  status:
    UserSubscription["status"],
): UserSubscription {
  return {
    ...BASE_SUBSCRIPTION,
    plan,
    status,
  };
}

export function verifyConsultingSubscriptionAccess():
  ConsultingSubscriptionAccessVerificationResult {
  const premiumActive =
    evaluateConsultingSubscriptionAccess(
      subscription(
        "premium",
        "active",
      ),
    );

  const free =
    evaluateConsultingSubscriptionAccess(
      subscription(
        "free",
        "free",
      ),
    );

  const trialExhausted =
    evaluateConsultingSubscriptionAccess(
      subscription(
        "free",
        "trialExhausted",
      ),
    );

  const paymentFailed =
    evaluateConsultingSubscriptionAccess(
      subscription(
        "premium",
        "paymentFailed",
      ),
    );

  const canceled =
    evaluateConsultingSubscriptionAccess(
      subscription(
        "premium",
        "canceled",
      ),
    );

  const expired =
    evaluateConsultingSubscriptionAccess(
      subscription(
        "premium",
        "expired",
      ),
    );

  const rowMissing =
    evaluateConsultingSubscriptionAccess(
      null,
    );

  const premiumInactive =
    evaluateConsultingSubscriptionAccess(
      subscription(
        "premium",
        "free",
      ),
    );

  const checks:
    Record<
      string,
      boolean
    > = {
      premiumActiveAllowed:
        premiumActive.accessState
        === "allowed"
        && premiumActive.canStartConsultation
        === true,

      freeDenied:
        free.accessState
        === "subscriptionRequired"
        && free.canStartConsultation
        === false,

      trialExhaustedDenied:
        trialExhausted.accessState
        === "subscriptionRequired"
        && trialExhausted.canStartConsultation
        === false,

      paymentFailedDenied:
        paymentFailed.accessState
        === "paymentRequired"
        && paymentFailed.canStartConsultation
        === false,

      canceledDenied:
        canceled.accessState
        === "inactive"
        && canceled.canStartConsultation
        === false,

      expiredDenied:
        expired.accessState
        === "inactive"
        && expired.canStartConsultation
        === false,

      rowMissingDenied:
        rowMissing.accessState
        === "subscriptionRequired"
        && rowMissing.canStartConsultation
        === false,

      premiumNonActiveDenied:
        premiumInactive.accessState
        === "subscriptionRequired"
        && premiumInactive.canStartConsultation
        === false,

      doesNotAutoPremiumOnMissingRow:
        rowMissing.accessState
        !== "allowed",
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
