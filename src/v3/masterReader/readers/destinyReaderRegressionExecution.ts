import {
    verifyDestinyReaderRegression,
  } from "./destinyReaderRegression";
  
  const result =
    verifyDestinyReaderRegression();
  
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