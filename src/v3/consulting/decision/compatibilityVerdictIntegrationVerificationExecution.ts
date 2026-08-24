import {
    verifyCompatibilityVerdictIntegration,
  } from "./compatibilityVerdictIntegrationVerification.js";

  const result =
    verifyCompatibilityVerdictIntegration();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Compatibility verdict Decision Engine 통합검증에 실패했습니다.",
    );
  }
