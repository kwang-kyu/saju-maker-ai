import {
    verifyWealthMoneyRealEstateE2E,
  } from "./wealthMoneyRealEstateE2EVerification";

  const result =
    verifyWealthMoneyRealEstateE2E();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Money·RealEstate 통합 E2E 검증에 실패했습니다.",
    );
  }
