import type {
    CompatibilityAssessment,
  } from "./compatibilityAssessment.js";
  import {
    applyCompatibilityVerdictEffect,
  } from "./compatibilityVerdictBuilder.js";

  export type CompatibilityVerdictBuilderVerificationResult = {
    notRequiredPreservesVerdict:
      boolean;

    missingCounterpartStopsVerdict:
      boolean;

    missingBirthDataStopsVerdict:
      boolean;

    missingFullAssessmentStopsVerdict:
      boolean;

    mixedFullCompatibilityPreservesVerdict:
      boolean;

    cautionFullCompatibilityResolvesInsufficientToWait:
      boolean;

    supportiveZodiacRecommends:
      boolean;

    conflictedZodiacDoesNotRecommend:
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

      fullCompatibilityAssessment:
        null,

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
          requestedAnalysisScope:
          "general",
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
          requestedAnalysisScope:
          "general",
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
          requestedAnalysisScope:
          "general",
      });

    const sufficientEvidenceWithoutAssessmentVerdict =
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
          requestedAnalysisScope:
          "general",
      });

    const mixedFullCompatibilityAssessment = {
      available:
        true,

      precision:
        "dateOnly" as const,

      calculationBasis:
        "crossPillarComparison" as const,

      analysisScope:
        "fullCompatibility" as const,

      counterpartSource: {
        birthDate:
          "1967-04-10",

        birthTime:
          null,

        calendarType:
          "solar" as const,

        gender:
          "male" as const,
      },

      comparedSelfPillars:
        [],

      comparedCounterpartPillars:
        [],

      selfDayMaster:
        "甲" as const,

      counterpartDayMaster:
        "丁" as const,

      dayMasterElementRelation:
        "selfGeneratesCounterpart" as const,

      selfElementDistribution:
        null,

      counterpartElementDistribution:
        null,

      complementaryElements:
        [],

      sharedDominantElements:
        [],

      overConcentrationSignals:
        [],

      interactionFacts:
        [],

      interactionCounts: {
        combination:
          0,

        clash:
          0,

        punishment:
          0,

        break:
          0,

        harm:
          0,
      },

      supportiveSignals:
        [],

      cautionSignals:
        [],

      supportScore:
        1,

      cautionScore:
        0,

      overallLevel:
        "mixed" as const,

      limitations:
        [],
    };

    const fullCompatibilitySufficientInput = {
      analysisRequired:
        true,

      counterpartExists:
        true,

      counterpartRelation:
        "businessPartner" as const,

      identityProvided:
        true,

      birthDataProvided:
        true,

      evidenceLevel:
        "sufficient" as const,

      analysisScope:
        "fullCompatibility" as const,

      counterpartReadingRequired:
        true,

      additionalCounterpartDataRequired:
        false,
    };

    const mixedFullCompatibilityVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "conditionallyRecommended",

        assessment:
          buildAssessment({
            ...fullCompatibilitySufficientInput,

            fullCompatibilityAssessment:
              mixedFullCompatibilityAssessment,
          }),
          requestedAnalysisScope:
          "general",
      });

    const cautionFullCompatibilityFromInsufficientVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "insufficientEvidence",

        assessment:
          buildAssessment({
            ...fullCompatibilitySufficientInput,

            fullCompatibilityAssessment: {
              ...mixedFullCompatibilityAssessment,

              overallLevel:
                "caution",
            },
          }),

        requestedAnalysisScope:
          "general",
      });

    const cautionMissingFullAssessmentVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "insufficientEvidence",

        assessment:
          buildAssessment({
            ...fullCompatibilitySufficientInput,
          }),

        requestedAnalysisScope:
          "general",
      });

    const cautionUnavailableFullAssessmentVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "insufficientEvidence",

        assessment:
          buildAssessment({
            ...fullCompatibilitySufficientInput,

            fullCompatibilityAssessment: {
              ...mixedFullCompatibilityAssessment,

              available:
                false,

              overallLevel:
                "caution",
            },
          }),

        requestedAnalysisScope:
          "general",
      });

      const supportiveZodiacVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "notRecommended",

        assessment:
          buildAssessment({
            analysisRequired:
              true,

            counterpartExists:
              true,

            zodiacProvided:
              true,

            zodiacAssessment: {
              available:
                true,

              selfBranch:
                "午",

              counterpartBranch:
                "未",

              selfZodiac:
                "말띠",

              counterpartZodiac:
                "양띠",

              relation:
                "sixHarmony",

              level:
                "supportive",

              calculationBasis:
                "yearBranchPair",

              analysisScope:
                "zodiacOnly",
            },

            evidenceLevel:
              "partial",

            analysisScope:
              "zodiacCompatibility",

            additionalCounterpartDataRequired:
              false,
          }),

        requestedAnalysisScope:
          "zodiac",
      });

    const conflictedZodiacVerdict =
      applyCompatibilityVerdictEffect({
        verdict:
          "recommended",

        assessment:
          buildAssessment({
            analysisRequired:
              true,

            counterpartExists:
              true,

            zodiacProvided:
              true,

            zodiacAssessment: {
              available:
                true,

              selfBranch:
                "午",

              counterpartBranch:
                "子",

              selfZodiac:
                "말띠",

              counterpartZodiac:
                "쥐띠",

              relation:
                "clash",

              level:
                "conflicted",

              calculationBasis:
                "yearBranchPair",

              analysisScope:
                "zodiacOnly",
            },

            evidenceLevel:
              "partial",

            analysisScope:
              "zodiacCompatibility",

            additionalCounterpartDataRequired:
              false,
          }),

        requestedAnalysisScope:
          "zodiac",
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

    const missingFullAssessmentStopsVerdict =
      sufficientEvidenceWithoutAssessmentVerdict
        === "insufficientEvidence"
      && cautionMissingFullAssessmentVerdict
        === "insufficientEvidence"
      && cautionUnavailableFullAssessmentVerdict
        === "insufficientEvidence";

    const mixedFullCompatibilityPreservesVerdict =
      mixedFullCompatibilityVerdict
        === "conditionallyRecommended";

    const cautionFullCompatibilityResolvesInsufficientToWait =
      cautionFullCompatibilityFromInsufficientVerdict
        === "wait";

        const supportiveZodiacRecommends =
        supportiveZodiacVerdict
        === "recommended";

      const conflictedZodiacDoesNotRecommend =
        conflictedZodiacVerdict
        === "notRecommended";

    return {
      notRequiredPreservesVerdict,

      missingCounterpartStopsVerdict,

      missingBirthDataStopsVerdict,

      missingFullAssessmentStopsVerdict,

      mixedFullCompatibilityPreservesVerdict,

      cautionFullCompatibilityResolvesInsufficientToWait,

      supportiveZodiacRecommends,

      conflictedZodiacDoesNotRecommend,

      passed:
        notRequiredPreservesVerdict
        && missingCounterpartStopsVerdict
        && missingBirthDataStopsVerdict
        && missingFullAssessmentStopsVerdict
        && mixedFullCompatibilityPreservesVerdict
        && cautionFullCompatibilityResolvesInsufficientToWait
        && supportiveZodiacRecommends
        && conflictedZodiacDoesNotRecommend,
    };
  }