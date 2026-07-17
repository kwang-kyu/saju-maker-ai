import {
    verifyMasterProfileExplanation,
  } from "./masterProfileExplanationVerification";
  
  const result =
    verifyMasterProfileExplanation();
  
  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );
  
  if (!result.passed) {
    throw new Error(
      "Master profile explanation verification failed.",
    );
  }