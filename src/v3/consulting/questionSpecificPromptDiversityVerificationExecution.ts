import {
    verifyQuestionSpecificPromptDiversity,
  } from "./questionSpecificPromptDiversityVerification.js";

  const result =
    verifyQuestionSpecificPromptDiversity();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (
    !result.passed
  ) {
    process.exitCode =
      1;
  }
