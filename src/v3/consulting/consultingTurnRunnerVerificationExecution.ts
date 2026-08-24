import {
    verifyConsultingTurnRunner,
  } from "./consultingTurnRunnerVerification.js";
  
  const verification =
    verifyConsultingTurnRunner();
  
  console.log(
    JSON.stringify(
      {
        checks:
          verification.checks,
  
        passed:
          verification.passed,
      },
      null,
      2,
    ),
  );