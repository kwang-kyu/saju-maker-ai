import {
    verifyBlessingReader,
  } from "./blessingReaderVerification";
  
  const result =
    verifyBlessingReader();
  
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