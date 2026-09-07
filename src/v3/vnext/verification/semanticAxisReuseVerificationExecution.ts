import {
  serializeSemanticAxisReuseVerificationResult,
  verifySemanticAxisReuse,
} from "./semanticAxisReuseVerification.js";

const result = await verifySemanticAxisReuse();

console.log(serializeSemanticAxisReuseVerificationResult(result));

if (!result.passed) {
  throw new Error("Semantic Axis Reuse verification failed.");
}
