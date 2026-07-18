import {
    verifyCareerReaderRegression,
  } from "./careerReaderRegression";
  
  const result =
    verifyCareerReaderRegression();
  
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