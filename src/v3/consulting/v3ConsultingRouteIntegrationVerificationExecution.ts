import {
    verifyV3ConsultingRouteIntegration,
  } from "./v3ConsultingRouteIntegrationVerification.js";

  const result =
    await verifyV3ConsultingRouteIntegration();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "천운문 v3 상담 Route 통합 검증에 실패했습니다.",
    );
  }
