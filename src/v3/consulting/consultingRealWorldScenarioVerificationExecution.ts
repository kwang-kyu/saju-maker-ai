import {
    verifyConsultingRealWorldScenarios,
  } from "./consultingRealWorldScenarioVerification";

  const result =
    verifyConsultingRealWorldScenarios();

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
