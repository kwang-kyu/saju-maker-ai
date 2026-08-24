import {
  verifyAuthenticatedConsultingInitialFollowUpHttpE2E,
} from "./authenticatedConsultingInitialFollowUpHttpE2EVerification.js";

/**
 * 인증 HTTP 최초 상담 → 후속 상담의
 * 비-API E2E 검증.
 *
 * OpenAI, Supabase, 배포 API를 호출하지 않는다.
 */
async function executeVerification():
  Promise<void> {
  const result =
    await verifyAuthenticatedConsultingInitialFollowUpHttpE2E();

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
      "Authenticated consulting initial follow-up HTTP E2E verification failed.",
    );
  }
}

void executeVerification();
