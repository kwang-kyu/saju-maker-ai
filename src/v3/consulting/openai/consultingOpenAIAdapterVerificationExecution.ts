import {
    verifyConsultingOpenAIAdapter,
  } from "./consultingOpenAIAdapterVerification.js";
  
  const result =
    verifyConsultingOpenAIAdapter();
  
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