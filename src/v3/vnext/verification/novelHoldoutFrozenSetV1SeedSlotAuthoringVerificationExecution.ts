import {
  serializeNovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationResult,
  verifyNovelHoldoutFrozenSetV1SeedSlotAuthoring,
} from "./novelHoldoutFrozenSetV1SeedSlotAuthoringVerification.js";

const result = verifyNovelHoldoutFrozenSetV1SeedSlotAuthoring();

console.log(
  serializeNovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    "Frozen Set v1 Seed Slot Authoring verification failed.",
  );
}
