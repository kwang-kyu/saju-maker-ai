import {
  verifyQuestionSpecificMaterialSelector,
} from "./questionSpecificMaterialSelectorVerification.js";

const result =
  verifyQuestionSpecificMaterialSelector();

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
