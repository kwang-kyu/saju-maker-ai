import {

  buildCompatibilityEvidence,

} from "./compatibilityEvidenceBuilder.js";

import {

  assessCompatibility,

} from "./compatibilityAssessment.js";

import {

  buildCounterpartSajuCalculation,

} from "./counterpartSajuCalculationBuilder.js";

import {

  buildSajuFactsPipeline,

} from "../../builders/sajuFactsPipelineBuilder.js";

import {

  buildDecisionEngineRegressionInput,

} from "./regression/decisionEngineRegressionFixture.js";

import {

  assessFullCompatibility,

} from "./fullCompatibilityAssessment.js";



export type CompatibilityEvidenceBuilderVerificationResult = {

  checks:

    Record<

      string,

      boolean

    >;



  passed:

    boolean;

};



function buildSelfSajuFacts() {

  return buildSajuFactsPipeline({

    name:

      "self",



    birthDate:

      "1984-05-20",



    birthTime:

      "10:00",



    gender:

      "male",



    calendarType:

      "solar",



    referenceDate:

      "2026-08-15",



    luckStartMethod:

      "minuteBased",

  }).facts;

}



export function verifyCompatibilityEvidenceBuilder():

  CompatibilityEvidenceBuilderVerificationResult {

  const regressionInput =

    buildDecisionEngineRegressionInput();



  const selfSajuFacts =

    buildSelfSajuFacts();



  const counterpartSaju =

    buildCounterpartSajuCalculation({

      birthDate:

        "1967-04-10",



      calendarType:

        "solar",



      gender:

        "male",

    });



  const fullCompatibilityAssessment =

    assessCompatibility(

      {

        ...regressionInput

          .questionContext,



        counterpart: {

          exists:

            true,



          relation:

            "businessPartner",



          identityProvided:

            true,



          birthDataProvided:

            true,



          zodiacProvided:

            false,

        },



        requirements: {

          ...regressionInput

            .questionContext

            .requirements,



          compatibilityAnalysisRequired:

            true,



          counterpartReadingRequired:

            true,

        },

      },

      "甲午",

      counterpartSaju,

      selfSajuFacts,

    );



  const zodiacCompatibilityAssessment =

    assessCompatibility(

      {

        ...regressionInput

          .questionContext,



        counterpart: {

          exists:

            true,



          relation:

            "lover",



          identityProvided:

            false,



          birthDataProvided:

            false,



          zodiacProvided:

            true,

        },



        requirements: {

          ...regressionInput

            .questionContext

            .requirements,



          compatibilityAnalysisRequired:

            true,



          counterpartReadingRequired:

            true,

        },

      },

      "甲午",

    );



  const fullCompatibilityEvidence =

    buildCompatibilityEvidence(

      fullCompatibilityAssessment,

    );



  const zodiacCompatibilityEvidence =

    buildCompatibilityEvidence(

      {

        ...zodiacCompatibilityAssessment,



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



        analysisScope:

          "zodiacCompatibility",



        fullCompatibilityAssessment:

          null,

      },

    );



  const dateOnlyPillarAssessment =

    assessFullCompatibility({

      selfSajuFacts,



      counterpartSaju,

    });



  const checks = {

    zodiacScopeProducesEvidence:

      zodiacCompatibilityEvidence.length

      === 1

      && zodiacCompatibilityEvidence[0]

        ?.key

        .startsWith(

          "zodiacCompatibility-",

        ),



    fullScopeProducesEvidence:

      fullCompatibilityEvidence.length

      === 1

      && fullCompatibilityEvidence[0]

        ?.key

      === "fullCompatibility-crossPillarComparison",



    fullScopeUsesStructuredPayload:

      fullCompatibilityEvidence[0]

        ?.description

        .includes(

          "crossPillarComparison",

        )

      && fullCompatibilityEvidence[0]

        ?.description

        .includes(

          "supportiveSignals",

        )

      && fullCompatibilityEvidence[0]

        ?.description

        .includes(

          "overallLevel",

        ),



    dateOnlyExcludesTimePillar:

      dateOnlyPillarAssessment

        .precision

      === "dateOnly"

      && dateOnlyPillarAssessment

        .comparedCounterpartPillars

        .every(

          (pillar) =>

            pillar.position

            !== "time",

        ),



    missingSelfSajuFactsProducesNoFullEvidence:

      buildCompatibilityEvidence(

        assessCompatibility(

          {

            ...regressionInput

              .questionContext,



            counterpart: {

              exists:

                true,



              relation:

                "businessPartner",



              identityProvided:

                true,



              birthDataProvided:

                true,



              zodiacProvided:

                false,

            },



            requirements: {

              ...regressionInput

                .questionContext

                .requirements,



              compatibilityAnalysisRequired:

                true,



              counterpartReadingRequired:

                true,

            },

          },

          "甲午",

          counterpartSaju,

        ),

      ).length

      === 0,

  };



  return {

    checks,



    passed:

      Object

        .values(

          checks,

        )

        .every(

          Boolean,

        ),

  };

}
