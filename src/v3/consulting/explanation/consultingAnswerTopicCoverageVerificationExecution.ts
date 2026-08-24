import {
  verifyConsultingAnswerTopicCoverage,
} from "./consultingAnswerTopicCoverageVerification.js";

/**
 * 천운문 v3 비-API 상담 질문 주제 커버리지 검증.
 *
 * Question Reader → Question Context → Decision Engine →
 * Decision Result Reader → Explanation Plan →
 * Explanation Payload → Consulting Prompt 경로만 실행한다.
 * 실제 GPT 답변을 생성하지 않으며
 * OpenAI, Supabase, 배포 HTTP를 호출하지 않는다.
 * 외부 환경변수를 요구하지 않는다.
 */
function toSafeError(
  error: unknown,
): {
  name: string;

  message: string;
} {
  if (
    error instanceof Error
  ) {
    return {
      name:
        error.name.length > 0
          ? error.name
          : "Error",

      message:
        error.message,
    };
  }

  return {
    name:
      "Error",

    message:
      "Unknown verification error",
  };
}

function executeVerification():
  void {
  try {
    const result =
      verifyConsultingAnswerTopicCoverage();

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
            toSafeError(
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

executeVerification();
