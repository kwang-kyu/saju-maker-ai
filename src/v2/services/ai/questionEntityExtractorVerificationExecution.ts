import {
    verifyQuestionEntityExtractor,
  } from "./questionEntityExtractorVerification";
  
  const result =
    verifyQuestionEntityExtractor();
  
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