import type {
    SupabaseClient,
  } from "@supabase/supabase-js";
  
  import type {
    ConsultingSessionOwnerId,
  } from "../consultingSessionOwnerId.js";
  
  import type {
    UserSubscriptionRepository,
  } from "./userSubscriptionRepository.js";
  
  import type {
    UserSubscription,
    SubscriptionPlan,
    SubscriptionStatus,
  } from "./subscriptionTypes.js";
  
  export const V3_USER_SUBSCRIPTIONS_TABLE =
    "v3_user_subscriptions";
  
  type SupabaseSubscriptionRow = {
    user_id:
      string;
  
    plan:
      string;
  
    status:
      string;
  
    free_usage_count:
      number;
  
    started_at:
      string | null;
  
    current_period_start:
      string | null;
  
    current_period_end:
      string | null;
  
    canceled_at:
      string | null;
  };
  
  function isSubscriptionPlan(
    value:
      string,
  ): value is SubscriptionPlan {
    return (
      value === "free"
      || value === "premium"
    );
  }
  
  function isSubscriptionStatus(
    value:
      string,
  ): value is SubscriptionStatus {
    return (
      value === "free"
      || value === "trialExhausted"
      || value === "active"
      || value === "paymentFailed"
      || value === "canceled"
      || value === "expired"
    );
  }
  
  function parseUserSubscription(
    row:
      SupabaseSubscriptionRow,
  ): UserSubscription {
    if (
      !isSubscriptionPlan(
        row.plan,
      )
    ) {
      throw new Error(
        "Invalid subscription plan.",
      );
    }
  
    if (
      !isSubscriptionStatus(
        row.status,
      )
    ) {
      throw new Error(
        "Invalid subscription status.",
      );
    }
  
    return {
      userId:
        row.user_id,
  
      plan:
        row.plan,
  
      freeUsageCount:
        row.free_usage_count,
  
      status:
        row.status,
  
      startedAt:
        row.started_at,
  
      currentPeriodStart:
        row.current_period_start,
  
      currentPeriodEnd:
        row.current_period_end,
  
      canceledAt:
        row.canceled_at,
    };
  }
  
  function buildSubscriptionRow(
    subscription:
      UserSubscription,
  ) {
    return {
      user_id:
        subscription.userId,
  
      plan:
        subscription.plan,
  
      status:
        subscription.status,
  
      free_usage_count:
        subscription.freeUsageCount,
  
      started_at:
        subscription.startedAt,
  
      current_period_start:
        subscription.currentPeriodStart,
  
      current_period_end:
        subscription.currentPeriodEnd,
  
      canceled_at:
        subscription.canceledAt,
    };
  }
  
  export class SupabaseUserSubscriptionRepository
    implements UserSubscriptionRepository {
    readonly client:
      SupabaseClient;
  
    constructor(
      client:
        SupabaseClient,
    ) {
      this.client =
        client;
    }
  
    async findByUserId(
      userId:
        ConsultingSessionOwnerId,
    ): Promise<UserSubscription | null> {
      const {
        data,
        error,
      } = await this
        .client
        .from(
          V3_USER_SUBSCRIPTIONS_TABLE,
        )
        .select(
          `
            user_id,
            plan,
            status,
            free_usage_count,
            started_at,
            current_period_start,
            current_period_end,
            canceled_at
          `,
        )
        .eq(
          "user_id",
          userId.value,
        )
        .maybeSingle();
  
      if (
        error
        !== null
      ) {
        throw error;
      }
  
      if (
        data
        === null
      ) {
        return null;
      }
  
      return parseUserSubscription(
        data as SupabaseSubscriptionRow,
      );
    }
  
    async create(
      subscription:
        UserSubscription,
    ): Promise<void> {
      const {
        error,
      } = await this
        .client
        .from(
          V3_USER_SUBSCRIPTIONS_TABLE,
        )
        .insert(
          buildSubscriptionRow(
            subscription,
          ),
        );
  
      if (
        error
        !== null
      ) {
        throw error;
      }
    }
  
    async update(
      subscription:
        UserSubscription,
    ): Promise<void> {
      const {
        error,
      } = await this
        .client
        .from(
          V3_USER_SUBSCRIPTIONS_TABLE,
        )
        .update(
          buildSubscriptionRow(
            subscription,
          ),
        )
        .eq(
          "user_id",
          subscription.userId,
        );
  
      if (
        error
        !== null
      ) {
        throw error;
      }
    }
  }