import {
  describeConsultingLiveInitialFollowUpAnswerE2EFailure,
  verifyConsultingLiveInitialFollowUpAnswerE2E,
} from "./consultingLiveInitialFollowUpAnswerE2EVerification";

/**
 * 최초 상담 → 세션 생성 → 후속 상담 Live E2E.
 *
 * 기본 회귀·build에서 실행하지 않는 수동 실행 전용이다.
 * 비-API E2E가 통과한 뒤에만 OpenAI를 순차 4회 호출한다.
 * API 키 값이나 전체 Prompt/grounding JSON은 출력하지 않는다.
 */
async function executeVerification():
  Promise<void> {
  try {
    const result =
      await verifyConsultingLiveInitialFollowUpAnswerE2E();

    console.log(
      JSON.stringify(
        {
          nonApiPassed:
            result.nonApiPassed,

          liveAttempted:
            result.liveAttempted,

          expectedOpenAiCallCount:
            result.expectedOpenAiCallCount,

          openaiCallCount:
            result.openaiCallCount,

          sessionTurnCount:
            result.sessionTurnCount,

          initial:
            result.initial
              ? {
                  liveInspectionPassed:
                    result.initial
                      .liveInspection
                      .passed,

                  liveInspectionChecks:
                    result.initial
                      .liveInspection
                      .checks,

                  semanticGatePassed:
                    result.initial
                      .semanticGate
                      .passed,

                  verdictAlignment:
                    result.initial
                      .semanticGate
                      .verdictAlignment,

                  groundingStatus:
                    result.initial
                      .semanticGate
                      .groundingStatus,

                  requiredContentCoverage:
                    result.initial
                      .semanticGate
                      .requiredContentCoverage,

                  confidence:
                    result.initial
                      .semanticGate
                      .confidence,

                  rationale:
                    result.initial
                      .semanticGate
                      .rationale,
                }
              : null,

          followUp:
            result.followUp
              ? {
                  liveInspectionPassed:
                    result.followUp
                      .liveInspection
                      .passed,

                  liveInspectionChecks:
                    result.followUp
                      .liveInspection
                      .checks,

                  semanticGatePassed:
                    result.followUp
                      .semanticGate
                      .passed,

                  verdictAlignment:
                    result.followUp
                      .semanticGate
                      .verdictAlignment,

                  groundingStatus:
                    result.followUp
                      .semanticGate
                      .groundingStatus,

                  requiredContentCoverage:
                    result.followUp
                      .semanticGate
                      .requiredContentCoverage,

                  confidence:
                    result.followUp
                      .semanticGate
                      .confidence,

                  rationale:
                    result.followUp
                      .semanticGate
                      .rationale,
                }
              : null,

          passed:
            result.passed,

          limitations:
            result.limitations,
        },
        null,
        2,
      ),
    );

    if (
      !result.passed
    ) {
      process.exitCode = 1;

      console.error(
        describeConsultingLiveInitialFollowUpAnswerE2EFailure(
          result,
        ),
      );
    }
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : String(
            error,
          );

    console.error(
      message,
    );

    process.exitCode = 1;
  }
}

void executeVerification();
