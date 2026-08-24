import {
    verifyConsultingRequestIntegration,
  } from "./consultingRequestIntegrationVerification.js";
  
  const result =
    verifyConsultingRequestIntegration();
  
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