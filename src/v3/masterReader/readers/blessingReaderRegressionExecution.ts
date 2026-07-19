import {
    verifyBlessingReaderRegression,
  } from "./blessingReaderRegression";
  
  const result =
    verifyBlessingReaderRegression();
  
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