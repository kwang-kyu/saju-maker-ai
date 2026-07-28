import {
    verifyAuthenticatedSupabaseConsultingSessionRepositoryFactory,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactoryVerification";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyAuthenticatedSupabaseConsultingSessionRepositoryFactory();

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
        "Authenticated Supabase consulting session repository factory verification failed.",
      );
    }
  }

  void executeVerification();
