import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  createSupabaseConsultingSessionServerClient,
} from "../supabaseConsultingSessionRepositoryFactory.js";
import type {
  SupabaseServerEnvironment,
} from "../supabaseConsultingSessionRepositoryFactory.js";

import {
  SupabaseUserSubscriptionRepository,
} from "./supabaseUserSubscriptionRepository.js";
import type {
  UserSubscriptionRepository,
} from "./userSubscriptionRepository.js";

export type CreateSupabaseUserSubscriptionRepositoryInput = {
  environment?:
    SupabaseServerEnvironment;
};

export type SupabaseUserSubscriptionRepositoryDependencies = {
  createServerClient(
    environment:
      SupabaseServerEnvironment | undefined,
  ): SupabaseClient;
};

const DEFAULT_DEPENDENCIES:
  SupabaseUserSubscriptionRepositoryDependencies = {
    createServerClient(
      environment:
        SupabaseServerEnvironment | undefined,
    ) {
      return createSupabaseConsultingSessionServerClient(
        environment,
      );
    },
  };

/**
 * 서버 전용 Supabase user subscription Repository를 만든다.
 *
 * createSupabaseConsultingSessionServerClient와 동일한
 * SUPABASE_URL / SUPABASE_SECRET_KEY 계약을 재사용한다.
 * VITE_SUPABASE_* 환경변수는 의도적으로 읽지 않는다.
 */
export function createSupabaseUserSubscriptionRepository(
  input:
    CreateSupabaseUserSubscriptionRepositoryInput = {},
  dependencies:
    SupabaseUserSubscriptionRepositoryDependencies =
      DEFAULT_DEPENDENCIES,
): UserSubscriptionRepository {
  const client =
    dependencies
      .createServerClient(
        input.environment,
      );

  return new SupabaseUserSubscriptionRepository(
    client,
  );
}
