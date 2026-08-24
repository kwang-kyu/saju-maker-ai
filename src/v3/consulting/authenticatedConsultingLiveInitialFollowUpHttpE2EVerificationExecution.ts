import {
  describeAuthenticatedConsultingLiveInitialFollowUpHttpE2EFailure,
  verifyAuthenticatedConsultingLiveInitialFollowUpHttpE2E,
} from "./authenticatedConsultingLiveInitialFollowUpHttpE2EVerification.js";

function isExplicitManualExecution():
  boolean {
  return process.argv.some(
    (
      argument,
    ) =>
      argument
        .replaceAll(
          "\\",
          "/",
        )
        .includes(
          "authenticatedConsultingLiveInitialFollowUpHttpE2EVerificationExecution",
        ),
  );
}

function toStageOutput(
  stage: {
    interpretation: {
      originalQuestion:
        string;

      topic:
        string;

      intent:
        string;

      motive:
        string;

      decisionTarget:
        string;

      analysisMode:
        string;

      asksWhat:
        string;

      decisionQuestion:
        string;

      confidence:
        number;
    };

    verdict:
      string;

    liveInspection: {
      passed:
        boolean;

      checks:
        Record<
          string,
          boolean
        >;
    };

    semanticGate: {
      passed:
        boolean;

      verdictAlignment:
        string | null;

      groundingStatus:
        string | null;

      requiredContentCoverage:
        string | null;

      materialUnsupportedClaims: {
        claim:
          string;

        reason:
          string;
      }[];

      materialOmissions: {
        requiredPoint:
          string;

        reason:
          string;
      }[];

      confidence:
        string | null;

      rationale:
        string;
    };
  } | null,
) {
  if (
    stage
    === null
  ) {
    return null;
  }

  return {
    interpretation:
      stage.interpretation,

    verdict:
      stage.verdict,

    liveInspectionPassed:
      stage
        .liveInspection
        .passed,

    liveInspectionChecks:
      stage
        .liveInspection
        .checks,

    semanticGatePassed:
      stage
        .semanticGate
        .passed,

    verdictAlignment:
      stage
        .semanticGate
        .verdictAlignment,

    groundingStatus:
      stage
        .semanticGate
        .groundingStatus,

    requiredContentCoverage:
      stage
        .semanticGate
        .requiredContentCoverage,

    materialUnsupportedClaims:
      stage
        .semanticGate
        .materialUnsupportedClaims,

    materialOmissions:
      stage
        .semanticGate
        .materialOmissions,

    confidence:
      stage
        .semanticGate
        .confidence,

    rationale:
      stage
        .semanticGate
        .rationale,
  };
}

/**
 * 인증 HTTP 최초 상담 → 후속 상담 Live E2E.
 *
 * 기본 회귀·build에서 실행하지 않는 수동 실행 전용이다.
 * 비-API 차단기가 통과한 뒤에만 OpenAI를 순차 6회 호출한다.
 * import만으로는 API를 호출하지 않는다.
 * API 키 값이나 전체 Prompt/grounding JSON은 출력하지 않는다.
 */
async function executeVerification():
  Promise<void> {
  try {
    const result =
      await verifyAuthenticatedConsultingLiveInitialFollowUpHttpE2E();

    console.log(
      JSON.stringify(
        {
          nonApiPassed:
            result.nonApiPassed,

          liveAttempted:
            result.liveAttempted,

          expectedOpenAiCallCount:
            result.expectedOpenAiCallCount,

          openAiCallCount:
            result.openAiCallCount,

          counters:
            result.counters,

          events:
            result.events,

          sessionId:
            result.sessionId,

          ownerId:
            result.ownerId,

          sessionTurnCount:
            result.sessionTurnCount,

          sessionTurnKinds:
            result.sessionTurnKinds,

          initial:
            toStageOutput(
              result.initial,
            ),

          followUp:
            toStageOutput(
              result.followUp,
            ),

          repository:
            result.repository,

          negativeChecks:
            result.negativeChecks,

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
        describeAuthenticatedConsultingLiveInitialFollowUpHttpE2EFailure(
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

if (
  isExplicitManualExecution()
) {
  void executeVerification();
}
