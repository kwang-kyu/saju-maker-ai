import {
  verifyConsultingInitialFollowUpAnswerE2E,
} from "./consultingInitialFollowUpAnswerE2EVerification";

/**
 * 최초 상담 → 세션 생성 → 후속 상담의
 * 비-API 생산 Builder/Requester E2E 검증.
 *
 * OpenAI, HTTP, Supabase를 호출하지 않는다.
 */
async function executeVerification():
  Promise<void> {
  const result =
    await verifyConsultingInitialFollowUpAnswerE2E();

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
      "Consulting initial follow-up answer E2E verification failed.",
    );
  }
}

void executeVerification();
