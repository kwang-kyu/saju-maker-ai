import {
  verifyVNextAdapterExecution,
  verifyVNextAdapters,
} from "./vNextAdapterVerification.js";

const scenarioResult = verifyVNextAdapters();
const executionResult = verifyVNextAdapterExecution();

console.log(
  JSON.stringify(
    {
      scenarioVerification: scenarioResult,
      executionVerification: executionResult,
    },
    null,
    2,
  ),
);

const allPassed =
  scenarioResult.passed
  && Object.values(executionResult).every(Boolean);

if (!allPassed) {
  throw new Error("vNext adapter verification failed.");
}
