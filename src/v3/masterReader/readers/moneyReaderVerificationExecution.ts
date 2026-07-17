import {
    verifyMoneyReader,
  } from "./moneyReaderVerification";
  
  const result =
    verifyMoneyReader();
  
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