import {
    verifyCareerReader,
  } from "./careerReaderVerification";
  
  const result =
    verifyCareerReader();
  
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