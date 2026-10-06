import {
  verifyStepUQ3CompatibilityConvergence,
} from "./stepUQ3CompatibilityConvergenceVerification.js";

const result = verifyStepUQ3CompatibilityConvergence();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (!result.passed) {
  throw new Error(
    "STEP UQ-3 compatibility convergence verification failed.",
  );
}
