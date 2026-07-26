import {
    verifyHumanLifePhaseEvidenceBuilder,
  } from "./humanLifePhaseEvidenceBuilderVerification";

  const result =
    verifyHumanLifePhaseEvidenceBuilder();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    process.exitCode = 1;
  }
