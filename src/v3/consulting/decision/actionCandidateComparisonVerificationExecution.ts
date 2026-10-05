import {
  verifyActionCandidateComparison,
} from "./actionCandidateComparisonVerification.js";

const result = verifyActionCandidateComparison();

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
