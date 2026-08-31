import {
  serializeResponseGatewayVerificationResult,
  verifyResponseGateway,
} from "./responseGatewayVerification.js";

const result = await verifyResponseGateway();

console.log(serializeResponseGatewayVerificationResult(result));

if (!result.passed) {
  throw new Error("Response gateway verification failed.");
}
