import {
  serializeVNextStep6A1EntryResult,
  verifyVNextStep6A1Entry,
} from "./vNextStep6A1EntryVerification.js";

const result = verifyVNextStep6A1Entry();

console.log(serializeVNextStep6A1EntryResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 6-1 Entry verification failed.");
}
