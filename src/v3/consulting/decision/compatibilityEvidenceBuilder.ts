import type {

  CompatibilityAssessment,

} from "./compatibilityAssessment.js";

import type {

  FullCompatibilityAssessment,

  FullCompatibilityOverallLevel,

} from "./fullCompatibilityAssessment.js";

import type {

  DecisionEvidence,

} from "./decisionTypes.js";

import type {

  ZodiacCompatibilityLevel,

} from "./zodiacCompatibilityAssessment.js";

import type {

  QuestionAnalysisScope,

} from "../question/questionReader.js";



function resolveZodiacEvidenceWeight(

  level:

    ZodiacCompatibilityLevel,

): number {

  switch (

    level

  ) {

    case "supportive":

    case "conflicted":

      return 4;



    case "similar":

    case "caution":

      return 3;



    case "neutral":

      return 2;



    case "unknown":

      return 1;

  }

}



function resolveFullCompatibilityEvidenceWeight(

  assessment:

    FullCompatibilityAssessment,

): number {

  switch (

    assessment.overallLevel

  ) {

    case "supportive":

    case "caution":

      return 5;



    case "mixed":

      return 4;



    default:

      return 4;

  }

}



function buildZodiacCompatibilityEvidence(

  assessment:

    CompatibilityAssessment,

  requestedAnalysisScope?:

    QuestionAnalysisScope,

): DecisionEvidence[] {

  const zodiacAssessment =

    assessment

      .zodiacAssessment;



  if (

    !assessment.analysisRequired

    || assessment.analysisScope

      !== "zodiacCompatibility"

    || zodiacAssessment

      === null

    || !zodiacAssessment.available

  ) {

    return [];

  }



  const baseWeight =

    resolveZodiacEvidenceWeight(

      zodiacAssessment

        .level,

    );

  // analysisScope === "zodiac"일 때만 compatibility zodiac evidence가
  // Explanation importance 필터(weight >= 4)에서 탈락하지 않도록 한다.
  // 전역 weight 임계값은 변경하지 않는다.
  const weight =

    requestedAnalysisScope
    === "zodiac"
    && zodiacAssessment.level
    !== "unknown"
      ? Math.max(
          4,
          baseWeight,
        )
      : baseWeight;



  return [

    {

      source:

        "compatibility",



      key:

        `zodiacCompatibility-${zodiacAssessment.relation}`,



      description:

        JSON.stringify({

          calculationBasis:

            zodiacAssessment

              .calculationBasis,



          analysisScope:

            zodiacAssessment

              .analysisScope,



          selfBranch:

            zodiacAssessment

              .selfBranch,



          selfZodiac:

            zodiacAssessment

              .selfZodiac,



          counterpartBranch:

            zodiacAssessment

              .counterpartBranch,



          counterpartZodiac:

            zodiacAssessment

              .counterpartZodiac,



          relation:

            zodiacAssessment

              .relation,



          level:

            zodiacAssessment

              .level,

          ...(
            zodiacAssessment.candidates
            && zodiacAssessment.candidates.length > 0
              ? {
                  candidates:
                    zodiacAssessment.candidates,
                }
              : {}
          ),

        }),



      weight,

    },

  ];

}



function serializeFullCompatibilityAssessment(

  assessment:

    FullCompatibilityAssessment,

): Record<string, unknown> {

  return {

    calculationBasis:

      assessment

        .calculationBasis,



    analysisScope:

      assessment

        .analysisScope,



    precision:

      assessment

        .precision,



    counterpartSource:

      assessment

        .counterpartSource,



    comparedSelfPillars:

      assessment

        .comparedSelfPillars,



    comparedCounterpartPillars:

      assessment

        .comparedCounterpartPillars,



    selfDayMaster:

      assessment

        .selfDayMaster,



    counterpartDayMaster:

      assessment

        .counterpartDayMaster,



    dayMasterElementRelation:

      assessment

        .dayMasterElementRelation,



    selfElementDistribution:

      assessment

        .selfElementDistribution,



    counterpartElementDistribution:

      assessment

        .counterpartElementDistribution,



    complementaryElements:

      assessment

        .complementaryElements,



    sharedDominantElements:

      assessment

        .sharedDominantElements,



    overConcentrationSignals:

      assessment

        .overConcentrationSignals,



    interactionFacts:

      assessment

        .interactionFacts,



    interactionCounts:

      assessment

        .interactionCounts,



    supportiveSignals:

      assessment

        .supportiveSignals,



    cautionSignals:

      assessment

        .cautionSignals,



    supportScore:

      assessment

        .supportScore,



    cautionScore:

      assessment

        .cautionScore,



    overallLevel:

      assessment

        .overallLevel,



    limitations:

      assessment

        .limitations,

  };

}



function buildFullCompatibilityEvidence(

  assessment:

    CompatibilityAssessment,

): DecisionEvidence[] {

  const fullCompatibilityAssessment =

    assessment

      .fullCompatibilityAssessment;



  if (

    !assessment.analysisRequired

    || assessment.analysisScope

      !== "fullCompatibility"

    || !assessment.birthDataProvided

    || !fullCompatibilityAssessment

      ?.available

  ) {

    return [];

  }



  return [

    {

      source:

        "compatibility",



      key:

        "fullCompatibility-crossPillarComparison",



      description:

        JSON.stringify(

          serializeFullCompatibilityAssessment(

            fullCompatibilityAssessment,

          ),

        ),



      weight:

        resolveFullCompatibilityEvidenceWeight(

          fullCompatibilityAssessment,

        ),

    },

  ];

}



/**

 * 계산된 궁합 관계를 해석 문장이 아닌 구조화된 사실값으로 전달한다.

 *

 * 최종 자연어 설명은 이 값과 원국·현재 국면·관계 현실을

 * 함께 받은 Explanation GPT가 작성한다.

 */

export function buildCompatibilityEvidence(

  assessment:

    CompatibilityAssessment,

  requestedAnalysisScope?:

    QuestionAnalysisScope,

): DecisionEvidence[] {

  return [

    ...buildZodiacCompatibilityEvidence(

      assessment,

      requestedAnalysisScope,

    ),

    ...buildFullCompatibilityEvidence(

      assessment,

    ),

  ];

}



export function extractFullCompatibilityOverallLevelFromEvidence(

  evidence:

    DecisionEvidence[],

): FullCompatibilityOverallLevel | null {

  for (

    const item

    of evidence

  ) {

    if (

      item.source

      !== "compatibility"

      || item.key

      !== "fullCompatibility-crossPillarComparison"

    ) {

      continue;

    }



    try {

      const payload =

        JSON.parse(

          item.description,

        ) as {

          overallLevel?:

            FullCompatibilityOverallLevel | null;

        };



      return (

        payload.overallLevel

        ?? null

      );

    } catch {

      return null;

    }

  }



  return null;
}
