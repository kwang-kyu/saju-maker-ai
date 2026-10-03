import {
  verifyStep3BZodiacPair,
} from "./step3BZodiacPairVerification.js";

const result = verifyStep3BZodiacPair();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (!result.passed) {
  throw new Error("STEP 3-B zodiac pair verification failed.");
}
