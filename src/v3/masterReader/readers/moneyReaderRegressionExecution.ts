import {
    verifyMoneyReaderRegression,
  } from "./moneyReaderRegression";
  
  const result =
    verifyMoneyReaderRegression();
  
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