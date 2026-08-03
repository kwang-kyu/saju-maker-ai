import {
    verifyQuestionSpecificPromptDiversity,
  } from "./questionSpecificPromptDiversityVerification";

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
