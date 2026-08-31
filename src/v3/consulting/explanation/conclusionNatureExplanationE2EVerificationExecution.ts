import {
  verifyConclusionNatureExplanationE2E,
} from "./conclusionNatureExplanationE2EVerification.js";

const result =
  verifyConclusionNatureExplanationE2E();

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
