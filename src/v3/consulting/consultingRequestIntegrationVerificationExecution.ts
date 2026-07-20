import {
    verifyConsultingRequestIntegration,
  } from "./consultingRequestIntegrationVerification";
  
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