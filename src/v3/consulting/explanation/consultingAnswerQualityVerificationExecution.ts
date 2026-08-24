import {
    verifyConsultingAnswerQuality,
  } from "./consultingAnswerQualityVerification.js";

  const result =
    verifyConsultingAnswerQuality();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    process.exitCode = 1;
  }