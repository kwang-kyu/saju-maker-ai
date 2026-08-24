import {
    verifyOtherPersonSajuBuilder,
  } from "./otherPersonSajuBuilderVerification";
  
  const result =
    verifyOtherPersonSajuBuilder();
  
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