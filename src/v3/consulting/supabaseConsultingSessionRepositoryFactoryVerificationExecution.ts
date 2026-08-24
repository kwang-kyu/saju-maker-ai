import {
    verifySupabaseConsultingSessionRepositoryFactory,
  } from "./supabaseConsultingSessionRepositoryFactoryVerification.js";

  const result =
    verifySupabaseConsultingSessionRepositoryFactory();

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
      "Supabase consulting session repository factory verification failed.",
    );
  }
