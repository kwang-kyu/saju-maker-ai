import {
  verifyQuestionSpecificFinalAnswerLive,
} from "./questionSpecificFinalAnswerLiveVerification.js";

/**
 * 질문별 최종 GPT 답변 의미 유지 Live Verification.
 *
 * 기본 회귀·build에서 실행하지 않는 수동 실행 전용이다.
 * API 키 값이나 전체 Prompt/grounding JSON은 출력하지 않는다.
 *
 * 한계:
 * - meaningAnchorTokens·subject material 문자열 보존 여부를 점검한다.
 * - GPT가 Evidence 밖의 의미를 새로 만들었는지 완전히 증명하지는 못한다.
 * - 동일 signature 질문의 답변 차별성은 정규화 문자열 비교로만 확인한다.
 */
async function executeVerification():
  Promise<void> {
  try {
    const result =
      await verifyQuestionSpecificFinalAnswerLive();

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
