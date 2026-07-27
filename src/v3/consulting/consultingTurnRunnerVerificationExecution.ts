import {
    verifyConsultingTurnRunner,
  } from "./consultingTurnRunnerVerification";
  
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