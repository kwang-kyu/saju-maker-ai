import {
  serializeVNextStep6A2BirthInputResult,
  verifyVNextStep6A2BirthInput,
} from "./vNextStep6A2BirthInputVerification.js";

const result = await verifyVNextStep6A2BirthInput();

console.log(serializeVNextStep6A2BirthInputResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 6-2 Birth Input verification failed.");
}
