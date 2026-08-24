import {
    verifyCompatibilityVerdictBuilder,
  } from "./compatibilityVerdictBuilderVerification.js";

  const result =
    verifyCompatibilityVerdictBuilder();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Compatibility verdict 효과 검증에 실패했습니다.",
    );
  }
