begin;

create table if not exists public.v3_user_subscriptions (
  user_id uuid primary key,
  plan text not null default 'free',
  status text not null default 'free',
  free_usage_count integer not null default 0,
  started_at timestamptz null,
  current_period_start timestamptz null,
  current_period_end timestamptz null,
  canceled_at timestamptz null,

  constraint v3_user_subscriptions_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade,

  constraint v3_user_subscriptions_plan_allowed
    check (
      plan in (
        'free',
        'premium'
      )
    ),

  constraint v3_user_subscriptions_status_allowed
    check (
      status in (
        'free',
        'trialExhausted',
        'active',
        'paymentFailed',
        'canceled',
        'expired'
      )
    ),

  constraint v3_user_subscriptions_free_usage_count_non_negative
    check (
      free_usage_count >= 0
    )
);

comment on table public.v3_user_subscriptions is
  '천운문 v3 Consulting entitlement용 사용자 구독 상태. SubscriptionAccessState 계약의 영속 저장소.';

comment on column public.v3_user_subscriptions.user_id is
  'Supabase Auth 사용자 ID. 사용자당 구독 행은 하나다.';

comment on column public.v3_user_subscriptions.plan is
  'SubscriptionPlan: free | premium';

comment on column public.v3_user_subscriptions.status is
  'SubscriptionStatus: free | trialExhausted | active | paymentFailed | canceled | expired';

comment on column public.v3_user_subscriptions.free_usage_count is
  'UserSubscription.freeUsageCount. 1차 출시 runtime에서는 사용하지 않으며 계약 보존용이다.';

comment on column public.v3_user_subscriptions.started_at is
  'UserSubscription.startedAt';

comment on column public.v3_user_subscriptions.current_period_start is
  'UserSubscription.currentPeriodStart';

comment on column public.v3_user_subscriptions.current_period_end is
  'UserSubscription.currentPeriodEnd';

comment on column public.v3_user_subscriptions.canceled_at is
  'UserSubscription.canceledAt';

alter table public.v3_user_subscriptions
  enable row level security;

revoke all
  on table public.v3_user_subscriptions
  from anon, authenticated;

grant select, insert, update
  on table public.v3_user_subscriptions
  to service_role;

commit;
