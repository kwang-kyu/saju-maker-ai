import {
    verifyWealthRealityExplanationDelivery,
  } from "./wealthRealityExplanationDeliveryVerification";
  
  const result =
    verifyWealthRealityExplanationDelivery();
  
  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );
  
  if (!result.passed) {
    throw new Error(
      "재테크 Reality Explanation 전달 검증에 실패했습니다.",
    );
  }