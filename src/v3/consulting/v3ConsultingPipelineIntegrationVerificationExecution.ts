import {
    verifyV3ConsultingPipelineIntegration,
  } from "./v3ConsultingPipelineIntegrationVerification.js";

  const result =
    await verifyV3ConsultingPipelineIntegration();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "천운문 v3 원천 입력 상담 파이프라인 통합 검증에 실패했습니다.",
    );
  }
