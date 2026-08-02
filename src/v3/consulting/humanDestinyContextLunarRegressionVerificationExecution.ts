import {
  verifyHumanDestinyContextLunarRegression,
} from "./humanDestinyContextLunarRegressionVerification";

const cases = [
  {
    id:
      "existingLunarContext",

    result:
      verifyHumanDestinyContextLunarRegression(),
  },
  {
    id:
      "distributedWeakLunarContext",

    result:
      verifyHumanDestinyContextLunarRegression({
        name:
          "분산형 음력 검증",

        birthDate:
          "1962-04-10",

        birthTime:
          "16:30",

        gender:
          "male",

        calendarType:
          "lunar",

        referenceDate:
          "2026-08-02",

        luckStartMethod:
          "minuteBased",
      }),
  },
];

const result = {
  cases,

  passed:
    cases.every(
      (verificationCase) =>
        verificationCase
          .result
          .passed,
    ),
};

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (!result.passed) {
  throw new Error(
    "음력 원국의 Human Destiny Context 회귀 검증에 실패했습니다.",
  );
}