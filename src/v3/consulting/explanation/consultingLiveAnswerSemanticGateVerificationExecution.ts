import {
  verifyConsultingLiveAnswerSemanticGate,
} from "./consultingLiveAnswerSemanticGateVerification";

/**
 * 실제 GPT 상담문 Live semanticGate Verification.
 *
 * 기본 회귀·build에서 실행하지 않는 수동 실행 전용이다.
 * 기존 Live Quality Verification이 통과한 뒤에만
 * 의미 평가 API를 순차 호출한다.
 * API 키 값이나 전체 Prompt/grounding JSON은 출력하지 않는다.
 */
async function executeVerification():
  Promise<void> {
  try {
    const result =
      await verifyConsultingLiveAnswerSemanticGate();

    console.log(
      JSON.stringify(
        result,
        null,
        2,
      ),
    );

    if (!result.passed) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      message,
    );

    process.exitCode = 1;
  }
}

void executeVerification();
