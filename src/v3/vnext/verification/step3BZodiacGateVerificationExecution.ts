import {
  verifyStep3BZodiacGate,
} from "./step3BZodiacGateVerification.js";

const result = verifyStep3BZodiacGate();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (!result.passed) {
  throw new Error("STEP 3-B zodiac gate verification failed.");
}
