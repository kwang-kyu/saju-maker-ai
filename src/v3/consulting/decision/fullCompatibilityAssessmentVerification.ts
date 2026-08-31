import {
  buildCompatibilityEvidence,
} from "./compatibilityEvidenceBuilder.js";
import {
  assessCompatibility,
} from "./compatibilityAssessment.js";
import {
  applyCompatibilityVerdictEffect,
} from "./compatibilityVerdictBuilder.js";
import {
  buildCounterpartSajuCalculation,
} from "./counterpartSajuCalculationBuilder.js";
import {
  buildSajuFactsPipeline,
} from "../../builders/sajuFactsPipelineBuilder.js";
import {
  assessFullCompatibility,
  calculateElementDistributionFromPillars,
  resolveDayMasterElementRelation,
  resolveFullCompatibilityOverallLevel,
  resolveStemElement,
} from "./fullCompatibilityAssessment.js";
import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture.js";
import {
  buildConsultingPrompt,
} from "../explanation/consultingPromptBuilder.js";
import {
  buildDecisionExplanationPayload,
} from "../explanation/decisionExplanationPayload.js";
import {
  buildDecisionExplanationPlan,
} from "../explanation/decisionExplanationPlan.js";
import {
  readDecisionResult,
} from "../explanation/decisionResultReader.js";
import {
  buildDecisionEvidence,
} from "./evidenceBuilder.js";
import {
  buildDecisionBrain,
} from "./decisionBrain.js";
import {
  assessDecisionReality,
} from "./decisionRealityAssessment.js";
import type {
  SajuFiveElement,
  SajuPillarFact,
} from "../../types/sajuFacts.js";
import {
  calculateCrossPersonSajuInteractions,
} from "../../calculators/sajuInteractionCalculator.js";

export type FullCompatibilityAssessmentVerificationResult = {
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

function buildFullCompatibilityQuestionContext() {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  return {
    ...regressionInput
      .questionContext,

    counterpart: {
      exists:
        true,

      relation:
        "businessPartner" as const,

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
  };
}

export function verifyFullCompatibilityAssessment():
  FullCompatibilityAssessmentVerificationResult {
  const selfSajuFacts =
    buildSelfSajuFacts();

  const dateOnlyCounterpartSaju =
    buildCounterpartSajuCalculation({
      birthDate:
        "1967-04-10",

      calendarType:
        "solar",

      gender:
        "male",
    });

  const fullCounterpartSaju =
    buildCounterpartSajuCalculation({
      birthDate:
        "1967-04-10",

      birthTime:
        "14:30",

      calendarType:
        "solar",

      gender:
        "male",
    });

  const dateOnlyAssessment =
    assessFullCompatibility({
      selfSajuFacts,
      counterpartSaju:
        dateOnlyCounterpartSaju,
    });

  const fullAssessment =
    assessFullCompatibility({
      selfSajuFacts,
      counterpartSaju:
        fullCounterpartSaju,
    });

  const compatibilityAssessment =
    assessCompatibility(
      buildFullCompatibilityQuestionContext(),
      "甲午",
      dateOnlyCounterpartSaju,
      selfSajuFacts,
    );

  const compatibilityEvidence =
    buildCompatibilityEvidence(
      compatibilityAssessment,
    );

  const regressionInput =
    buildDecisionEngineRegressionInput();

  const brain =
    buildDecisionBrain(
      regressionInput.humanContext,
      regressionInput.question,
    );

  const lifeAssessment =
    assessDecisionReality(
      regressionInput.lifeContext,
      regressionInput
        .questionContext
        .reality,
    );

  const decisionEvidence =
    buildDecisionEvidence(
      {
        ...regressionInput,
        selfSajuFacts,
        counterpartSaju:
          dateOnlyCounterpartSaju,
      },
      brain,
      lifeAssessment,
      compatibilityAssessment,
    );

  const otherCounterpartSaju =
    buildCounterpartSajuCalculation({
      birthDate:
        "1975-11-03",

      calendarType:
        "solar",

      gender:
        "female",
    });

  const otherAssessment =
    assessFullCompatibility({
      selfSajuFacts,
      counterpartSaju:
        otherCounterpartSaju,
    });

  const supportiveVerdict =
    applyCompatibilityVerdictEffect({
      verdict:
        "conditionallyRecommended",

      assessment: {
        ...compatibilityAssessment,
        fullCompatibilityAssessment: {
          ...dateOnlyAssessment,
          overallLevel:
            "supportive",
        },
      },

      requestedAnalysisScope:
        "general",
    });

  const cautionVerdict =
    applyCompatibilityVerdictEffect({
      verdict:
        "recommended",

      assessment: {
        ...compatibilityAssessment,
        fullCompatibilityAssessment: {
          ...dateOnlyAssessment,
          overallLevel:
            "caution",
        },
      },

      requestedAnalysisScope:
        "general",
    });

  const mixedVerdict =
    applyCompatibilityVerdictEffect({
      verdict:
        "wait",

      assessment: {
        ...compatibilityAssessment,
        fullCompatibilityAssessment: {
          ...dateOnlyAssessment,
          overallLevel:
            "mixed",
        },
      },

      requestedAnalysisScope:
        "general",
    });

  const missingAssessmentVerdict =
    applyCompatibilityVerdictEffect({
      verdict:
        "recommended",

      assessment: {
        ...compatibilityAssessment,
        fullCompatibilityAssessment:
          null,
      },

      requestedAnalysisScope:
        "general",
    });

  const explanationPayload =
    buildDecisionExplanationPayload(
      buildDecisionExplanationPlan(
        readDecisionResult({
          ...regressionInput,
          verdict:
            "conditionallyRecommended",
          confidence:
            "medium",
          contextAlignment:
            "aligned",
          actionReadiness:
            "readyWithConditions",
          decisionTarget:
            regressionInput
              .question
              .decisionTarget,
          topic:
            regressionInput
              .question
              .topic,
          intent:
            regressionInput
              .question
              .intent,
          conclusionNature:
            regressionInput
              .question
              .conclusionNature,
          coreDecision:
            "궁합을 확인한다.",
          decisionReason:
            "상대방 정보가 확인되었다.",
          evidence:
            decisionEvidence,
          conditions:
            [],
          risks:
            [],
          conflict: {
            exists:
              false,
            description:
              "",
            humanContextSide:
              "",
            questionSide:
              "",
          },
          recommendedDirection:
            "역할을 먼저 확인한다.",
          prohibitedDirection:
            "확인 없이 확정하지 않는다.",
          finalDecisionSentence:
            "조건부로 진행한다.",
          humanContextUsed:
            true,
          questionContextUsed:
            true,
        }),
        "이 사람과 동업 궁합이 맞나요?",
      ),
    );

  const prompt =
    buildConsultingPrompt(
      explanationPayload,
    );

  const selfDistribution =
    calculateElementDistributionFromPillars(
      selfSajuFacts.pillars,
    );

  const counterpartDistribution =
    calculateElementDistributionFromPillars(
      dateOnlyAssessment
        .comparedCounterpartPillars,
    );

  const dayMasterRelationCases: [
    SajuFiveElement,
    SajuFiveElement,
    ReturnType<
      typeof resolveDayMasterElementRelation
    >,
  ][] = [
    ["wood", "wood", "same"],
    ["wood", "fire", "selfGeneratesCounterpart"],
    ["fire", "wood", "counterpartGeneratesSelf"],
    ["wood", "earth", "selfControlsCounterpart"],
    ["earth", "wood", "counterpartControlsSelf"],
  ];

  const dayMasterRelationsDeterministic =
    dayMasterRelationCases.every(
      ([
        selfElement,
        counterpartElement,
        expected,
      ]) =>
        resolveDayMasterElementRelation(
          selfElement,
          counterpartElement,
        )
        === expected,
    );

  const fullCompatibilityEvidence =
    compatibilityEvidence.find(
      (item) =>
        item.key
        === "fullCompatibility-crossPillarComparison",
    );

  const parsedEvidence =
    fullCompatibilityEvidence
      ? JSON.parse(
          fullCompatibilityEvidence.description,
        ) as {
          supportiveSignals?:
            unknown[];

          cautionSignals?:
            unknown[];

          counterpartSource?:
            unknown;

          limitations?:
            string[];
        }
      : null;

  const crossPersonOwnerLabelSample =
    calculateCrossPersonSajuInteractions(
      [
        {
          position:
            "day",

          ganZhi:
            "갑자",

          heavenlyStem:
            "갑",

          earthlyBranch:
            "자",
        } satisfies SajuPillarFact,
      ],
      [
        {
          position:
            "day",

          ganZhi:
            "경오",

          heavenlyStem:
            "경",

          earthlyBranch:
            "오",
        } satisfies SajuPillarFact,
      ],
    );

  const checks = {
    selfUsesSajuFactsPillars:
      dateOnlyAssessment
        .comparedSelfPillars
      === selfSajuFacts.pillars,

    dateOnlyUsesThreeCounterpartPillars:
      dateOnlyAssessment
        .comparedCounterpartPillars
        .length
      === 3,

    dateOnlyExcludesFakeTimePillar:
      !dateOnlyAssessment
        .comparedCounterpartPillars
        .some(
          (pillar) =>
            pillar.position
            === "time",
        ),

    fullIncludesActualTimePillar:
      fullAssessment
        .comparedCounterpartPillars
        .some(
          (pillar) =>
            pillar.position
            === "time",
        ),

    crossPersonTargetsUseOwnerLabels:
      crossPersonOwnerLabelSample.length
      > 0
      && crossPersonOwnerLabelSample.every(
        (fact) =>
          fact.targets.some(
            (target) =>
              target.includes(
                "본인",
              ),
          )
          && fact.targets.some(
            (target) =>
              target.includes(
                "상대방",
              ),
          ),
      ),

    dayMasterRelationsDeterministic,

    elementDistributionUsesComparedPillarsOnly:
      selfDistribution.totalCharacters
      === selfSajuFacts.pillars
        .length
      * 2
      && counterpartDistribution.totalCharacters
      === 6,

    interactionCountsIncludeFiveTypes:
      dateOnlyAssessment
        .interactionCounts
        .combination
      >= 0
      && "break"
        in dateOnlyAssessment
          .interactionCounts,

    scoresAndOverallLevelAreFixed:
      dateOnlyAssessment
        .overallLevel
      === resolveFullCompatibilityOverallLevel(
        dateOnlyAssessment
          .supportScore,
        dateOnlyAssessment
          .cautionScore,
      ),

    assessmentAttachedToCompatibilityAssessment:
      compatibilityAssessment
        .fullCompatibilityAssessment
        ?.available
      === true,

    evidenceIncludesFullAssessment:
      Boolean(
        fullCompatibilityEvidence,
      )
      && parsedEvidence
        ?.counterpartSource
      !== undefined,

    decisionEvidenceIncludesFullCompatibility:
      decisionEvidence.some(
        (item) =>
          item.key
          === "fullCompatibility-crossPillarComparison",
      ),

    supportiveVerdictShiftsPositively:
      supportiveVerdict
      === "recommended",

    cautionVerdictLimitsWithoutHardStop:
      cautionVerdict
      === "conditionallyRecommended",

    mixedVerdictPreservesBase:
      mixedVerdict
      === "wait",

    missingAssessmentIsInsufficient:
      missingAssessmentVerdict
      === "insufficientEvidence",

    promptIncludesCompatibilityRules:
      prompt.systemPrompt.includes(
        "full compatibility evidence",
      )
      && prompt.systemPrompt.includes(
        "supportiveSignals",
      )
      && prompt.systemPrompt.includes(
        "limitations",
      ),

    promptEvidenceIncludesSignalsAndLimitations:
      explanationPayload
        .explanationOrder
        .some(
          (section) =>
            section.content.includes(
              "supportiveSignals",
            )
            && section.content.includes(
              "cautionSignals",
            )
            && section.content.includes(
              "limitations",
            ),
        ),

    differentCounterpartsProduceDifferentEvidence:
      otherAssessment
        .comparedCounterpartPillars[0]
        ?.ganZhi
      !== dateOnlyAssessment
        .comparedCounterpartPillars[0]
        ?.ganZhi
      && (
        otherAssessment
          .supportScore
        !== dateOnlyAssessment
          .supportScore
        || otherAssessment
          .cautionScore
        !== dateOnlyAssessment
          .cautionScore
        || otherAssessment
          .dayMasterElementRelation
        !== dateOnlyAssessment
          .dayMasterElementRelation
      ),

    dayMasterUsesStemElements:
      resolveStemElement(
        selfSajuFacts.dayMaster,
      )
      !== null
      && resolveStemElement(
        dateOnlyCounterpartSaju
          .calculated
          .dayMaster,
      )
      !== null,
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
