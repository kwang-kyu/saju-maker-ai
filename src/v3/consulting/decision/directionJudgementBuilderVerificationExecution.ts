import {
    verifyDirectionJudgementBuilder,
  } from "./directionJudgementBuilderVerification.js";

  const result =
    verifyDirectionJudgementBuilder();

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
