import {
    verifyHealthReader,
  } from "./healthReaderVerification";
  
  const result =
    verifyHealthReader();
  
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