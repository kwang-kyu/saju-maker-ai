import {
  verifyQuestionReader,
} from "./questionReaderVerification.js";

const result =
  verifyQuestionReader();

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
  throw new Error(
    "questionReader verification failed.",
  );
}
