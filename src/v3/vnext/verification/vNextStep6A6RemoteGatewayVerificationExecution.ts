import {
  serializeVNextStep6A6RemoteGatewayResult,
  verifyVNextStep6A6RemoteGateway,
} from "./vNextStep6A6RemoteGatewayVerification.js";

const result = await verifyVNextStep6A6RemoteGateway();

console.log(serializeVNextStep6A6RemoteGatewayResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 6-6 Remote Gateway verification failed.");
}
