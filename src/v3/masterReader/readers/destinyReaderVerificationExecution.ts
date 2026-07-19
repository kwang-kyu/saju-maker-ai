import {
    verifyDestinyReader,
  } from "./destinyReaderVerification";
  
  const result =
    verifyDestinyReader();
  
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