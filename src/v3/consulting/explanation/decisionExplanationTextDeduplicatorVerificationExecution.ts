import {
    verifyDecisionExplanationTextDeduplicator,
  } from "./decisionExplanationTextDeduplicatorVerification.js";

  const result =
    verifyDecisionExplanationTextDeduplicator();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Decision Explanation 텍스트 중복 제거기 독립 검증에 실패했습니다.",
    );
  }