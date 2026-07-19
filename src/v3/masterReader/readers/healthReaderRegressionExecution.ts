import {
    verifyHealthReaderRegression,
  } from "./healthReaderRegression";
  
  const result =
    verifyHealthReaderRegression();
  
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