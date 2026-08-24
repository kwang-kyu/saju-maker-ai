import {
    verifySupabaseConsultingSessionOwnerResolver,
  } from "./supabaseConsultingSessionOwnerResolverVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifySupabaseConsultingSessionOwnerResolver();

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
        "Supabase consulting session owner resolver verification failed.",
      );
    }
  }

  void executeVerification();
