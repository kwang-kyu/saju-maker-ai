import {
    verifyHumanDestinyContextLunarRegression,
  } from "./humanDestinyContextLunarRegressionVerification";

  const result =
    verifyHumanDestinyContextLunarRegression();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "실제 음력 원국의 Human Destiny Context 회귀 검증에 실패했습니다.",
    );
  }