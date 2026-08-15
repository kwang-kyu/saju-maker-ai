import {
  readFileSync,
} from "node:fs";
import {
  dirname,
  join,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";
import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture";
import {
  runDecisionEngine,
} from "./decisionEngine";
import {
  assessRoleRecommendation,
  rankRoleRecommendationSeeds,
} from "./roleRecommendationAssessment";
import {
  buildQuestionContext,
} from "../question/questionContextBuilder";
import {
  readQuestion,
} from "../question/questionReader";
import type {
  LifeDriverType,
} from "../../masterReader/types/lifeDriver";
import type {
  RepeatedPatternType,
} from "../../masterReader/types/repeatedPattern";
import type {
  SurvivalStyleType,
} from "../../masterReader/types/survivalStyle";
import type {
  CareerResult,
} from "../../masterReader/types/career";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext";

const ROLE_QUESTION =
  "내가 연극을 하면 어떤 역할이 어울릴까요?";

const ACTOR_START_QUESTION =
  "배우를 시작해도 될까요?";

const ABSENCE_BASED_AVOIDED_PATTERNS =
  [
    "감정만으로 관계를 풀어내는 순수 로맨스형 조력자",
    "규칙과 책임 없이 즉흥만 반복하는 코믹형 인물",
    "초반 한 번의 성공만으로 모든 갈등이 풀리는 단순 승리형 주인공",
    "근거 없이 모든 장면을 지휘하는 만능 리더",
  ];

const LIFE_DRIVER_TYPES:
  readonly LifeDriverType[] =
  [
    "achievement",
    "wealth",
    "knowledge",
    "creation",
    "leadership",
    "relationship",
    "freedom",
    "stability",
  ];

const SURVIVAL_STYLE_TYPES:
  readonly SurvivalStyleType[] =
  [
    "push",
    "analysis",
    "relationship",
    "independent",
    "stability",
    "opportunity",
    "learning",
    "endurance",
  ];

const REPEATED_PATTERN_TYPES:
  readonly RepeatedPatternType[] =
  [
    "earlySuccessCollapse",
    "slowGrowthStable",
    "relationshipLoss",
    "wealthLeak",
    "restartCycle",
    "responsibilityOverload",
    "lateBloom",
    "opportunityMiss",
    "distributedAdaptation",
  ];

function cloneHumanContextWithProfile(
  base:
    HumanDestinyContext,
  profilePatch:
    Partial<
      HumanDestinyContext["identity"]["profile"]
    >,
): HumanDestinyContext {
  return {
    ...base,

    identity: {
      ...base.identity,

      profile: {
        ...base.identity.profile,
        ...profilePatch,
      },
    },
  };
}

function nullifyCareerSignals(
  career:
    CareerResult,
): CareerResult {
  const nullifyJudgement = <
    T extends CareerResult[keyof CareerResult],
  >(
    judgement:
      T,
  ): T => {
    if (
      typeof judgement
      !== "object"
      || judgement
      === null
      || !(
        "level" in judgement
      )
    ) {
      return judgement;
    }

    return {
      ...judgement,

      level:
        null,

      interpretation:
        null,
    };
  };

  return {
    roleOrientation:
      nullifyJudgement(
        career.roleOrientation,
      ),

    workStyle:
      nullifyJudgement(
        career.workStyle,
      ),

    expertiseGrowth:
      nullifyJudgement(
        career.expertiseGrowth,
      ),

    organizationFit:
      nullifyJudgement(
        career.organizationFit,
      ),

    independenceFit:
      nullifyJudgement(
        career.independenceFit,
      ),

    leadershipFit:
      nullifyJudgement(
        career.leadershipFit,
      ),

    performanceConversion:
      nullifyJudgement(
        career.performanceConversion,
      ),

    careerContinuity:
      nullifyJudgement(
        career.careerContinuity,
      ),

    interpretation:
      null,
  };
}

function buildProfileCombinationContext(
  base:
    HumanDestinyContext,
  driver:
    LifeDriverType,
  style:
    SurvivalStyleType,
  pattern:
    RepeatedPatternType,
): HumanDestinyContext {
  return cloneHumanContextWithProfile(
    base,
    {
      lifeDriver: {
        ...base
          .identity
          .profile
          .lifeDriver,

        primary: {
          ...base
            .identity
            .profile
            .lifeDriver
            .primary,

          driver,

          confidence:
            "medium",
        },

        secondary:
          null,

        suppressed:
          [],

        conflicting:
          [],
      },

      survivalStyle: {
        ...base
          .identity
          .profile
          .survivalStyle,

        primary: {
          ...base
            .identity
            .profile
            .survivalStyle
            .primary,

          style,

          confidence:
            "medium",
        },

        secondary:
          null,

        conflicting:
          [],
      },

      repeatedPattern: {
        ...base
          .identity
          .profile
          .repeatedPattern,

        primary: {
          ...base
            .identity
            .profile
            .repeatedPattern
            .primary,

          pattern,

          confidence:
            "medium",
        },

        secondary:
          null,

        conflicting:
          [],
      },
    },
  );
}

export type RoleRecommendationAssessmentVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export function verifyRoleRecommendationAssessment():
  RoleRecommendationAssessmentVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText:
        ROLE_QUESTION,
    });

  const question =
    readQuestion(
      regressionInput
        .humanContext,
      ROLE_QUESTION,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...regressionInput,
      question,
      questionContext,
    });

  const assessment =
    assessRoleRecommendation(
      regressionInput
        .humanContext,
    );

  const candidateTitles =
    assessment
      .candidates
      .map(
        (candidate) =>
          candidate.title,
      );

  const uniqueCandidateTitles =
    new Set(
      candidateTitles,
    );

  const allCandidatesHaveEvidence =
    assessment
      .candidates
      .every(
        (candidate) =>
          candidate
            .evidenceKeys
            .length
          >= 3,
      );

  const roleEvidenceInDecision =
    decisionResult
      .evidence
      .filter(
        (item) =>
          item.source
          === "roleRecommendation",
      );

  const forbiddenCoreDecisionPatterns =
    [
      /당장\s*정하지\s*말/,
      /준비한\s*뒤/,
      /조건을\s*갖춘\s*뒤/,
      /보류/,
      /여러\s*선택지\s*중\s*무엇을\s*선택/,
    ];

  const coreDecisionIsDirectRoleAnswer =
    decisionResult
      .coreDecision
      .includes(
        assessment
          .primaryRole
          .title,
      )
    && forbiddenCoreDecisionPatterns.every(
      (pattern) =>
        !pattern.test(
          decisionResult
            .coreDecision,
        ),
    );

  const finalDecisionIsDirectRoleAnswer =
    decisionResult
      .finalDecisionSentence
      .includes(
        assessment
          .primaryRole
          .title,
      )
    && forbiddenCoreDecisionPatterns.every(
      (pattern) =>
        !pattern.test(
          decisionResult
            .finalDecisionSentence,
        ),
    );

  const achievementPushStableAssessment =
    assessRoleRecommendation(
      regressionInput
        .humanContext,
    );

  const knowledgeAnalysisContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        lifeDriver: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .lifeDriver,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .lifeDriver
              .primary,

            driver:
              "knowledge",
          },
        },

        survivalStyle: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .survivalStyle,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
            .survivalStyle
            .primary,

            style:
              "analysis",
          },
        },

        repeatedPattern: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .repeatedPattern,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .repeatedPattern
              .primary,

            pattern:
              "lateBloom",
          },
        },
      },
    );

  const alternateAssessment =
    assessRoleRecommendation(
      knowledgeAnalysisContext,
    );

  const profileCombinationChangesCandidates =
    achievementPushStableAssessment
      .primaryRole
      .title
    !== alternateAssessment
      .primaryRole
      .title
    || achievementPushStableAssessment
      .candidates[1]
      .title
    !== alternateAssessment
      .candidates[1]
      .title;

  const actorStartQuestion =
    readQuestion(
      regressionInput
        .humanContext,
      ACTOR_START_QUESTION,
    );

  const assessmentSource =
    readFileSync(
      join(
        dirname(
          fileURLToPath(
            import.meta.url,
          ),
        ),
        "roleRecommendationAssessment.ts",
      ),
      "utf8",
    );

  const noHashBasedSelection =
    !assessmentSource.includes(
      "charCodeAt",
    )
    && !assessmentSource.includes(
      "Math.random",
    )
    && !assessmentSource.includes(
      "pickAlternativeSeed",
    )
    && !assessmentSource.includes(
      "ALTERNATIVE_ROLE_SEEDS",
    )
    && !/\bmodulo\b/.test(
      assessmentSource,
    )
    && !assessmentSource.includes(
      "LOW_CONFIDENCE_DRIVER_ONLY_CAP",
    );

  const candidateKeys =
    assessment
      .candidates
      .map(
        (candidate) =>
          candidate.key,
      );

  const uniqueCandidateKeys =
    new Set(
      candidateKeys,
    );

  const allCandidatesHavePositiveWhyItFits =
    assessment
      .candidates
      .every(
        (candidate) =>
          candidate
            .whyItFits
            .trim()
            .length
          > 0,
      );

  const candidateWhyItFitsAreDistinct =
    new Set(
      assessment
        .candidates
        .map(
          (candidate) =>
            candidate.whyItFits,
        ),
    ).size
    === 3;

  const candidateEvidenceKeysAreDistinct =
    new Set(
      assessment
        .candidates
        .map(
          (candidate) =>
            candidate
              .evidenceKeys
              .join("|"),
        ),
    ).size
    === 3;

  const evidenceKeysMatchPositiveContributions =
    assessment
      .candidates
      .every(
        (candidate) =>
          candidate
            .evidenceKeys
            .length
          >= 2
          && candidate
            .evidenceKeys
            .every(
              (key) =>
                key.startsWith(
                  "lifeDriver-",
                )
                || key.startsWith(
                  "survivalStyle-",
                )
                || key.startsWith(
                  "repeatedPattern-",
                )
                || key.startsWith(
                  "career-",
                ),
            ),
      );

  const lowConfidenceDriverOnlyContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        lifeDriver: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .lifeDriver,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .lifeDriver
              .primary,

            driver:
              "freedom",

            confidence:
              "low",

            evidence:
              [],

            counterEvidence:
              [],
          },

          secondary:
            null,

          suppressed:
            [],

          conflicting:
            [],
        },

        survivalStyle: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .survivalStyle,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
            .survivalStyle
            .primary,

            style:
              "learning",

            confidence:
              "low",

            evidence:
              [],

            counterEvidence:
              [],
          },

          secondary:
            null,

          conflicting:
            [],
        },

        repeatedPattern: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .repeatedPattern,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .repeatedPattern
              .primary,

            pattern:
              "opportunityMiss",

            confidence:
              "low",

            evidence:
              [],

            counterEvidence:
              [],
          },

          secondary:
            null,

          conflicting:
            [],
        },
      },
    );

  const lowConfidenceDriverAssessment =
    assessRoleRecommendation(
      lowConfidenceDriverOnlyContext,
    );

  const lowConfidenceDriverDoesNotSolelyDecidePrimary =
    lowConfidenceDriverAssessment
      .limitations
      .some(
        (limitation) =>
          limitation.includes(
            "lifeDriver",
          )
          && limitation.includes(
            "낮",
          ),
      )
    || lowConfidenceDriverAssessment
      .primaryRole
      .key
      !== "rule-breaker-primary";

  const secondaryStylePatternContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        survivalStyle: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .survivalStyle,

          secondary: {
            style:
              "analysis",

            confidence:
              "high",

            evidence:
              [
                {
                  source:
                    "structure",

                  description:
                    "보조 대응으로 분석형 판단이 확인된다.",

                  weight:
                    2,
                },
              ],

            counterEvidence:
              [],

            exceptionConditions:
              [],
          },
        },

        repeatedPattern: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .repeatedPattern,

          secondary: {
            pattern:
              "lateBloom",

            confidence:
              "high",

            evidence:
              [
                {
                  source:
                    "rooting",

                  description:
                    "보조 서사로 늦은 개화형 성장이 확인된다.",

                  weight:
                    2,
                },
              ],

            counterEvidence:
              [],

            exceptionConditions:
              [],
          },
        },
      },
    );

  const withoutSecondaryAssessment =
    assessRoleRecommendation(
      regressionInput
        .humanContext,
    );

  const withSecondaryAssessment =
    assessRoleRecommendation(
      secondaryStylePatternContext,
    );

  const secondaryStylePatternAffectsTertiary =
    withoutSecondaryAssessment
      .candidates[2]
      .key
    !== withSecondaryAssessment
      .candidates[2]
      .key
    || withoutSecondaryAssessment
      .candidates[2]
      .evidenceKeys
      .join("|")
    !== withSecondaryAssessment
      .candidates[2]
      .evidenceKeys
      .join("|");

  const conflictingDriverContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        lifeDriver: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .lifeDriver,

          conflicting:
            [
              {
                ...regressionInput
                  .humanContext
                  .identity
                  .profile
                  .lifeDriver
                  .primary,

                driver:
                  "freedom",

                interpretation:
                  {
                    mode:
                      "자유 추구형",

                    operatingStyle:
                      "규칙보다 자율을 우선한다.",

                    strengthExpression:
                      "압박이 커질수록 독립 선택이 강해진다.",

                    riskPattern:
                      "책임 구조와 충돌할 수 있다.",

                    suitableConditions:
                      [],
                  },
              },
            ],
        },
      },
    );

  const conflictingAssessment =
    assessRoleRecommendation(
      conflictingDriverContext,
    );

  const conflictingSignalsAreReflected =
    conflictingAssessment
      .limitations
      .some(
        (limitation) =>
          limitation.includes(
            "상충",
          ),
      )
    && conflictingAssessment
      .candidates
      .some(
        (candidate) =>
          candidate
            .dramaticTension
            .length
          > 0,
      );

  const lowConfidenceDriverNativeBonusOnlyContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        lifeDriver: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .lifeDriver,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .lifeDriver
              .primary,

            driver:
              "achievement",

            confidence:
              "low",

            evidence:
              [],

            counterEvidence:
              [],
          },

          secondary:
            null,

          suppressed:
            [],

          conflicting:
            [],
        },

        survivalStyle: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .survivalStyle,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .survivalStyle
              .primary,

            style:
              "independent",

            confidence:
              "low",

            evidence:
              [],

            counterEvidence:
              [],
          },

          secondary:
            null,

          conflicting:
            [],
        },

        repeatedPattern: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .repeatedPattern,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .repeatedPattern
              .primary,

            pattern:
              "relationshipLoss",

            confidence:
              "low",

            evidence:
              [],

            counterEvidence:
              [],
          },

          secondary:
            null,

          conflicting:
            [],
        },

        career:
          nullifyCareerSignals(
            regressionInput
              .humanContext
              .identity
              .profile
              .career,
          ),
      },
    );

  const lowConfidenceDriverNativeBonusOnlyRanked =
    rankRoleRecommendationSeeds(
      lowConfidenceDriverNativeBonusOnlyContext,
    );

  const lowConfidenceDriverNativeBonusDoesNotPassAlone =
    !lowConfidenceDriverNativeBonusOnlyRanked
      .some(
        (
          scored,
        ) =>
          scored
            .seed
            .key
          === "driven-leader",
      );

  const lifeDriverAxisCountsAsSingleEvidenceAxis =
    assessmentSource.includes(
      "classifyEvidenceAxis",
    )
    && assessmentSource.includes(
      "countPositiveEvidenceAxes",
    )
    && assessmentSource.includes(
      "lifeDriver-native-",
    )
    && assessmentSource.includes(
      "positiveEvidenceAxisCount",
    );

  const lowConfidenceDriverWithStylePatternSupportContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        lifeDriver: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .lifeDriver,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .lifeDriver
              .primary,

            driver:
              "achievement",

            confidence:
              "low",

            evidence:
              [],

            counterEvidence:
              [],
          },

          secondary:
            null,

          suppressed:
            [],

          conflicting:
            [],
        },

        survivalStyle: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .survivalStyle,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .survivalStyle
              .primary,

            style:
              "push",

            confidence:
              "high",
          },

          secondary:
            null,

          conflicting:
            [],
        },

        repeatedPattern: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .repeatedPattern,

          primary: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .repeatedPattern
              .primary,

            pattern:
              "slowGrowthStable",

            confidence:
              "high",
          },

          secondary:
            null,

          conflicting:
            [],
        },

        career:
          nullifyCareerSignals(
            regressionInput
              .humanContext
              .identity
              .profile
              .career,
          ),
      },
    );

  const lowConfidenceDriverWithStylePatternSupportRanked =
    rankRoleRecommendationSeeds(
      lowConfidenceDriverWithStylePatternSupportContext,
    );

  const lowConfidenceDriverRequiresNonDriverAxis =
    lowConfidenceDriverWithStylePatternSupportRanked
      .some(
        (
          scored,
        ) =>
          scored
            .seed
            .key
          === "driven-leader"
          && scored
            .contributions
            .some(
              (
                contribution,
              ) =>
                contribution.points
                > 0
                && (
                  contribution
                    .evidenceKey
                    .startsWith(
                      "survivalStyle-",
                    )
                  || contribution
                    .evidenceKey
                    .startsWith(
                      "repeatedPattern-",
                    )
                  || contribution
                    .evidenceKey
                    .startsWith(
                      "career-",
                    )
                ),
            ),
      );

  const defaultAvoidedPatternsAssessment =
    assessRoleRecommendation(
      cloneHumanContextWithProfile(
        regressionInput
          .humanContext,
        {
          lifeDriver: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .lifeDriver,

            conflicting:
              [],
          },

          survivalStyle: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .survivalStyle,

            conflicting:
              [],
          },

          repeatedPattern: {
            ...regressionInput
              .humanContext
              .identity
              .profile
              .repeatedPattern,

            conflicting:
              [],
          },
        },
      ),
    );

  const noAbsenceBasedAvoidedRolePatterns =
    ABSENCE_BASED_AVOIDED_PATTERNS.every(
      (pattern) =>
        !defaultAvoidedPatternsAssessment
          .avoidedRolePatterns
          .includes(
            pattern,
          ),
    );

  const explicitCaution =
    "과도한 자기 확신";

  const explicitCautionContext: HumanDestinyContext =
    {
      ...regressionInput
        .humanContext,

      identity: {
        ...regressionInput
          .humanContext
          .identity,

        humanSummary: {
          ...regressionInput
            .humanContext
            .identity
            .humanSummary,

          cautions:
            [
              explicitCaution,
            ],
        },
      },
    };

  const explicitCautionAssessment =
    assessRoleRecommendation(
      explicitCautionContext,
    );

  const explicitCautionCreatesAvoidedPattern =
    explicitCautionAssessment
      .avoidedRolePatterns
      .some(
        (pattern) =>
          pattern.includes(
            explicitCaution,
          ),
      );

  const conflictingAvoidanceAssessment =
    assessRoleRecommendation(
      conflictingDriverContext,
    );

  const conflictingSignalsCreateAvoidanceOrTension =
    conflictingAssessment
      .limitations
      .some(
        (limitation) =>
          limitation.includes(
            "상충",
          ),
      )
    && (
      conflictingAvoidanceAssessment
        .avoidedRolePatterns
        .length
      > 0
      || conflictingAssessment
        .candidates
        .some(
          (candidate) =>
            candidate
              .dramaticTension
              .length
            > 0,
        )
    );

  const achievementPushStableThreeDistinctCandidates =
    new Set(
      achievementPushStableAssessment
        .candidates
        .map(
          (candidate) =>
            candidate.key,
        ),
    ).size
    === 3;

  const knowledgeAnalysisLateBloomThreeDistinctCandidates =
    new Set(
      alternateAssessment
        .candidates
        .map(
          (candidate) =>
            candidate.key,
        ),
    ).size
    === 3;

  let wideEnumCombinationsProduceThreeCandidates =
    true;

  for (
    const driver of LIFE_DRIVER_TYPES
  ) {
    for (
      const style of SURVIVAL_STYLE_TYPES
    ) {
      for (
        const pattern of REPEATED_PATTERN_TYPES
      ) {
        try {
          const combinationRanked =
            rankRoleRecommendationSeeds(
              buildProfileCombinationContext(
                regressionInput
                  .humanContext,
                driver,
                style,
                pattern,
              ),
            );

          if (
            combinationRanked
              .length
            < 3
            || new Set(
              combinationRanked
                .map(
                  (
                    scored,
                  ) =>
                    scored
                      .seed
                      .key,
                ),
            ).size
            < 3
          ) {
            wideEnumCombinationsProduceThreeCandidates =
              false;
            break;
          }
        } catch {
          wideEnumCombinationsProduceThreeCandidates =
            false;
          break;
        }
      }

      if (
        !wideEnumCombinationsProduceThreeCandidates
      ) {
        break;
      }
    }

    if (
      !wideEnumCombinationsProduceThreeCandidates
    ) {
      break;
    }
  }

  const achievementPushStableIsMeaningfullyExplained =
    achievementPushStableAssessment
      .primaryRole
      .whyItFits
      .length
    > 0
    && achievementPushStableAssessment
      .primaryRole
      .evidenceKeys
      .some(
        (key) =>
          key.includes(
            "achievement",
          ),
      )
    && achievementPushStableAssessment
      .primaryRole
      .evidenceKeys
      .some(
        (key) =>
          key.includes(
            "push",
          ),
      )
    && achievementPushStableAssessment
      .primaryRole
      .evidenceKeys
      .some(
        (key) =>
          key.includes(
            "slowGrowthStable",
          ),
      );

  const knowledgeAnalysisLateBloomChangesRanking =
    achievementPushStableAssessment
      .primaryRole
      .title
    !== alternateAssessment
      .primaryRole
      .title
    && achievementPushStableAssessment
      .candidates
      .map(
        (candidate) =>
          candidate.key,
      )
      .join("|")
    !== alternateAssessment
      .candidates
      .map(
        (candidate) =>
          candidate.key,
      )
      .join("|");

  const deterministicAssessmentFirst =
    assessRoleRecommendation(
      regressionInput
        .humanContext,
    );

  const deterministicAssessmentSecond =
    assessRoleRecommendation(
      regressionInput
        .humanContext,
    );

  const sameInputProducesSameOutput =
    deterministicAssessmentFirst
      .candidates
      .map(
        (candidate) =>
          `${candidate.key}:${candidate.whyItFits}:${candidate.evidenceKeys.join(",")}`,
      )
      .join("||")
    === deterministicAssessmentSecond
      .candidates
      .map(
        (candidate) =>
          `${candidate.key}:${candidate.whyItFits}:${candidate.evidenceKeys.join(",")}`,
      )
      .join("||");

  const checks = {
    questionIsInterpretation:
      question
        .analysisMode
      === "interpretation",

    decisionTargetIsNone:
      question
        .decisionTarget
      === "none",

    motiveIsSelfUnderstanding:
      question
        .motive
      === "selfUnderstanding",

    notGenericSelectionDecisionQuestion:
      !question
        .decisionQuestion
        .includes(
          "여러 선택지 중",
        ),

    roleRecommendationRequired:
      questionContext
        .requirements
        .roleRecommendationAnalysisRequired,

    assessmentAvailable:
      assessment.available,

    exactlyThreeDistinctCandidates:
      assessment
        .candidates
        .length
      === 3
      && uniqueCandidateTitles
        .size
      === 3,

    allCandidatesHaveEvidence,

    achievementPushStableHasConcretePrimaryRole:
      achievementPushStableAssessment
        .primaryRole
        .title
        .length
      > 0
      && achievementPushStableAssessment
        .primaryRole
        .characterDescription
        .length
      > 0,

    differentProfileChangesCandidates:
      profileCombinationChangesCandidates,

    decisionHasRoleEvidence:
      roleEvidenceInDecision
        .length
      >= 3,

    decisionHasNoExecutionConditions:
      decisionResult
        .conditions
        .length
      === 0,

    decisionHasNoGenericExecutionRisks:
      decisionResult
        .risks
        .length
      === 0,

    verdictIsRecommendedNotInsufficient:
      decisionResult
        .verdict
      === "recommended",

    coreDecisionAnswersPrimaryRole:
      coreDecisionIsDirectRoleAnswer,

    finalDecisionAnswersPrimaryRole:
      finalDecisionIsDirectRoleAnswer,

    currentPhaseDidNotForceWait:
      decisionResult
        .verdict
      !== "wait",

    actorStartQuestionStaysDecisionPath:
      actorStartQuestion
        .decisionTarget
      !== "none"
      || actorStartQuestion
        .analysisMode
      === "decision",

    sourceLocked:
      assessment
        .sourceLocked
      === true,

    noHashBasedSelection,

    exactlyThreeDistinctCandidateKeys:
      uniqueCandidateKeys
        .size
      === 3,

    allCandidatesHavePositiveWhyItFits,

    candidateWhyItFitsAreDistinct,

    candidateEvidenceKeysAreDistinct,

    evidenceKeysMatchPositiveContributions,

    lowConfidenceDriverDoesNotSolelyDecidePrimary,

    secondaryStylePatternAffectsTertiary,

    conflictingSignalsAreReflected,

    achievementPushStableIsMeaningfullyExplained,

    knowledgeAnalysisLateBloomChangesRanking,

    sameInputProducesSameOutput,

    lowConfidenceDriverNativeBonusDoesNotPassAlone,

    lifeDriverAxisCountsAsSingleEvidenceAxis,

    lowConfidenceDriverRequiresNonDriverAxis,

    noAbsenceBasedAvoidedRolePatterns,

    explicitCautionCreatesAvoidedPattern,

    conflictingSignalsCreateAvoidanceOrTension,

    achievementPushStableThreeDistinctCandidates,

    knowledgeAnalysisLateBloomThreeDistinctCandidates,

    wideEnumCombinationsProduceThreeCandidates,
  };

  return {
    checks,

    passed:
      Object
        .values(
          checks,
        )
        .every(Boolean),
  };
}
