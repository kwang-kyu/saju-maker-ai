import {
  serializeStrongAnchorEquivalenceVerificationResult,
  verifyStrongAnchorEquivalence,
} from "./strongAnchorEquivalenceVerification.js";

const result = verifyStrongAnchorEquivalence();

console.log(serializeStrongAnchorEquivalenceVerificationResult(result));

if (!result.passed) {
  throw new Error("P10-4 Strong Anchor equivalence verification failed.");
}
