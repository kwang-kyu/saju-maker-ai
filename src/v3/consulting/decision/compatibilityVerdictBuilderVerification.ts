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

    missingFullAssessmentStopsVerdict:
      boolean;

    mixedFullCompatibilityPreservesVerdict:
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

    const mixedFullCompatibilityVerdict =
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

            fullCompatibilityAssessment: {
              available:
                true,

              precision:
                "dateOnly",

              calculationBasis:
                "crossPillarComparison",

              analysisScope:
                "fullCompatibility",

              counterpartSource: {
                birthDate:
                  "1967-04-10",

                birthTime:
                  null,

                calendarType:
                  "solar",

                gender:
                  "male",
              },

              comparedSelfPillars:
                [],

              comparedCounterpartPillars:
                [],

              selfDayMaster:
                "甲",

              counterpartDayMaster:
                "丁",

              dayMasterElementRelation:
                "selfGeneratesCounterpart",

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
                "mixed",

              limitations:
                [],
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
        === "insufficientEvidence";

    const mixedFullCompatibilityPreservesVerdict =
      mixedFullCompatibilityVerdict
        === "conditionallyRecommended";

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

      supportiveZodiacRecommends,

      conflictedZodiacDoesNotRecommend,

      passed:
        notRequiredPreservesVerdict
        && missingCounterpartStopsVerdict
        && missingBirthDataStopsVerdict
        && missingFullAssessmentStopsVerdict
        && mixedFullCompatibilityPreservesVerdict
        && supportiveZodiacRecommends
        && conflictedZodiacDoesNotRecommend,
    };
  }