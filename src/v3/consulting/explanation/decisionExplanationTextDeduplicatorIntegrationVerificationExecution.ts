import {
    verifyDecisionExplanationTextDeduplicatorIntegration,
  } from "./decisionExplanationTextDeduplicatorIntegrationVerification";

  const result =
    verifyDecisionExplanationTextDeduplicatorIntegration();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Decision Explanation 텍스트 중복 제거기 통합 검증에 실패했습니다.",
    );
  }