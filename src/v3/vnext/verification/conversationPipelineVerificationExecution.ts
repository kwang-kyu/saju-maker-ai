import {
  serializeConversationPipelineVerificationResult,
  verifyConversationPipeline,
} from "./conversationPipelineVerification.js";

const result = await verifyConversationPipeline();

console.log(serializeConversationPipelineVerificationResult(result));

if (!result.passed) {
  throw new Error("vNext Conversation Pipeline verification failed.");
}
