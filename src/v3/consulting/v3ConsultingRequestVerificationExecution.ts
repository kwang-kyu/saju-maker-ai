import {
    verifyV3ConsultingRequest,
  } from "./v3ConsultingRequestVerification";

  const result =
    verifyV3ConsultingRequest();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "천운문 v3 상담 요청 계약 검증에 실패했습니다.",
    );
  }