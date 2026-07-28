import {
    verifySupabaseConsultingSessionPersistenceGateway,
  } from "./supabaseConsultingSessionPersistenceGatewayVerification";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifySupabaseConsultingSessionPersistenceGateway();

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
        "Supabase consulting session persistence gateway verification failed.",
      );
    }
  }

  void executeVerification();
