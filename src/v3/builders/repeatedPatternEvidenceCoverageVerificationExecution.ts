import {
    verifyRepeatedPatternEvidenceCoverage,
  } from "./repeatedPatternEvidenceCoverageVerification";

  const verification =
    verifyRepeatedPatternEvidenceCoverage();

  console.log(
    JSON.stringify(
      verification,
      null,
      2,
    ),
  );

  if (!verification.passed) {
    throw new Error(
      "Repeated Pattern evidence coverage verification failed.",
    );
  }