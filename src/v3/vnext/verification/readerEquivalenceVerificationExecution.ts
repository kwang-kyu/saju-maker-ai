import {
  serializeReaderEquivalenceVerificationResult,
  verifyReaderEquivalence,
} from "./readerEquivalenceVerification.js";

const result = verifyReaderEquivalence();

console.log(serializeReaderEquivalenceVerificationResult(result));

if (!result.passed) {
  throw new Error("F0 Reader Equivalence verification failed.");
}
