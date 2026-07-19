import {
    verifyRelationshipReader,
  } from "./relationshipReaderVerification";
  
  const result =
    verifyRelationshipReader();
  
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