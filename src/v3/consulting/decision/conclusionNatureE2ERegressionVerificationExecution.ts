import {
  verifyConclusionNatureE2ERegression,
} from "./conclusionNatureE2ERegressionVerification.js";

const result =
  verifyConclusionNatureE2ERegression();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (
  !result.passed
) {
  process.exitCode = 1;
}
