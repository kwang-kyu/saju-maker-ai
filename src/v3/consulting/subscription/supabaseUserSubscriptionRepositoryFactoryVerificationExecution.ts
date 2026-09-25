import {
  verifySupabaseUserSubscriptionRepositoryFactory,
} from "./supabaseUserSubscriptionRepositoryFactoryVerification.js";

const result =
  await verifySupabaseUserSubscriptionRepositoryFactory();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (
  !result.passed
) {
  throw new Error(
    "Supabase user subscription repository factory verification failed.",
  );
}
