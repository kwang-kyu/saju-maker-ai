export type SubscriptionPlan =
  | "free"
  | "premium";

export type SubscriptionStatus =
  | "free"
  | "trialExhausted"
  | "active"
  | "paymentFailed"
  | "canceled"
  | "expired";

export type SubscriptionAccessState =
  | "allowed"
  | "trialAvailable"
  | "subscriptionRequired"
  | "paymentRequired"
  | "inactive";

export type UserSubscription = {
  userId:
    string;

  plan:
    SubscriptionPlan;

  status:
    SubscriptionStatus;

  startedAt:
    string | null;

  currentPeriodStart:
    string | null;

  currentPeriodEnd:
    string | null;

  canceledAt:
    string | null;
};
