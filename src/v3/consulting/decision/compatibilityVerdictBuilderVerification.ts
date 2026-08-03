import type {
    CompatibilityAssessment,
  } from "./compatibilityAssessment";
  import {
    applyCompatibilityVerdictEffect,
  } from "./compatibilityVerdictBuilder";

  export type CompatibilityVerdictBuilderVerificationResult = {
    notRequiredPreservesVerdict:
      boolean;

    missingCounterpartStopsVerdict:
      boolean;

    missingBirthDataStopsVerdict:
      boolean;

    sufficientEvidencePreservesVerdict:
      boolean;

    passed:
      boolean;
  };

  function buildAssessment(
    input:
      Partial<CompatibilityAssessment>,
  ): CompatibilityAssessment {
    return {
      analysisRequired:
        false,

      counterpartExists:
        false,

      counterpartRelation:
        "unknown",

      identityProvided:
        false,

      birthDataProvided:
        false,
        counterpartSaju:
        null,

      zodiacProvided:
        false,

      zodiacAssessment:
        null,

      evidenceLevel:
        "notRequired",

      analysisScope:
        "none",

      counterpartReadingRequired:
        false,

      additionalCounterpartDataRequired:
        false,

      ...input,
    };
  }

  export function verifyCompatibilityVerdictBuilder():
    CompatibilityVerdictBuilderVerificationResult {
    const notRequiredVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "recommended",

        assessment:
          buildAssessment({}),
      });

    const missingCounterpartVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "conditionallyRecommended",

        assessment:
          buildAssessment({
            analysisRequired:
              true,

            evidenceLevel:
              "insufficient",

            analysisScope:
              "selfPatternOnly",

            counterpartReadingRequired:
              true,

            additionalCounterpartDataRequired:
              true,
          }),
      });

    const missingBirthDataVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "recommended",

        assessment:
          buildAssessment({
            analysisRequired:
              true,

            counterpartExists:
              true,

            counterpartRelation:
              "businessPartner",

            identityProvided:
              true,

            evidenceLevel:
              "partial",

            analysisScope:
              "counterpartIdentity",

            counterpartReadingRequired:
              true,

            additionalCounterpartDataRequired:
              true,
          }),
      });

    const sufficientEvidenceVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "conditionallyRecommended",

        assessment:
          buildAssessment({
            analysisRequired:
              true,

            counterpartExists:
              true,

            counterpartRelation:
              "businessPartner",

            identityProvided:
              true,

            birthDataProvided:
              true,

            evidenceLevel:
              "sufficient",

            analysisScope:
              "fullCompatibility",

            counterpartReadingRequired:
              true,

            additionalCounterpartDataRequired:
              false,
          }),
      });

    const notRequiredPreservesVerdict =
      notRequiredVerdict
        === "recommended";

    const missingCounterpartStopsVerdict =
      missingCounterpartVerdict
        === "insufficientEvidence";

    const missingBirthDataStopsVerdict =
      missingBirthDataVerdict
        === "insufficientEvidence";

    const sufficientEvidencePreservesVerdict =
      sufficientEvidenceVerdict
        === "conditionallyRecommended";

    return {
      notRequiredPreservesVerdict,

      missingCounterpartStopsVerdict,

      missingBirthDataStopsVerdict,

      sufficientEvidencePreservesVerdict,

      passed:
        notRequiredPreservesVerdict
        && missingCounterpartStopsVerdict
        && missingBirthDataStopsVerdict
        && sufficientEvidencePreservesVerdict,
    };
  }
