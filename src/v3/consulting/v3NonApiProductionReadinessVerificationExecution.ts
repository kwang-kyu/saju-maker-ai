import {
  toSafeVerificationError,
  verifyV3NonApiProductionReadiness,
} from "./v3NonApiProductionReadinessVerification.js";

/**
 * 천운문 v3 핵심 비-API Production Readiness 종합 검증.
 *
 * mock/contract 기반 검증만 순차 실행하며
 * 실제 OpenAI, Supabase, 배포 HTTP를 호출하지 않는다.
 * 외부 API 환경변수를 요구하지 않는다.
 */
async function executeVerification():
  Promise<void> {
  try {
    const result =
      await verifyV3NonApiProductionReadiness();

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
      process.exitCode = 1;
    }
  } catch (
    error
  ) {
    console.log(
      JSON.stringify(
        {
          passed:
            false,

          error:
            toSafeVerificationError(
              error,
            ),
        },
        null,
        2,
      ),
    );

    process.exitCode = 1;
  }
}

void executeVerification();
