import {
  verifyConsultingLiveAnswerSemanticGateContract,
} from "./consultingLiveAnswerSemanticGateVerification.js";

/**
 * Live 상담문 semanticGate JSON 계약·negative control 검증.
 *
 * API를 호출하지 않으며 기본 회귀·build에서 실행하지 않는다.
 */
const result =
  verifyConsultingLiveAnswerSemanticGateContract();

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
