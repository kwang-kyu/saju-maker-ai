import {
  verifyConclusionNatureE2E,
} from "./conclusionNatureE2EVerification.js";

const result =
  verifyConclusionNatureE2E();

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
