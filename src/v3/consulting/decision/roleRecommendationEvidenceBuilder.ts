import type {
  RoleRecommendationAssessment,
  RoleRecommendationCandidate,
} from "./roleRecommendationAssessment.js";
import type {
  DecisionEvidence,
} from "./decisionTypes.js";

function buildCandidateEvidence(
  candidate:
    RoleRecommendationCandidate,
  weight:
    number,
): DecisionEvidence[] {
  return [
    {
      source:
        "roleRecommendation",

      key:
        `${candidate.key}-title`,

      description:
        `추천 배역: ${candidate.title} (${candidate.archetype})`,

      weight,
    },
    {
      source:
        "roleRecommendation",

      key:
        `${candidate.key}-character`,

      description:
        candidate.characterDescription,

      weight:
        weight - 1,
    },
    {
      source:
        "roleRecommendation",

      key:
        `${candidate.key}-why`,

      description:
        candidate.whyItFits,

      weight:
        weight - 1,
    },
    {
      source:
        "roleRecommendation",

      key:
        `${candidate.key}-performance`,

      description:
        [
          candidate.performanceStyle,
          candidate.strongScenes,
        ].join(" "),

      weight:
        weight - 2,
    },
    {
      source:
        "roleRecommendation",

      key:
        `${candidate.key}-tension`,

      description:
        candidate.dramaticTension,

      weight:
        weight - 2,
    },
  ];
}

export function buildRoleRecommendationEvidence(
  assessment:
    RoleRecommendationAssessment,
): DecisionEvidence[] {
  if (
    !assessment.available
  ) {
    return [
      {
        source:
          "roleRecommendation",

        key:
          "roleRecommendation-unavailable",

        description:
          assessment
            .limitations[0]
          ?? "배역 추천을 계산할 수 없다.",

        weight:
          1,
      },
    ];
  }

  const [
    primary,
    secondary,
    tertiary,
  ] = assessment.candidates;

  return [
    {
      source:
        "roleRecommendation",

      key:
        "roleRecommendation-summary",

      description:
        [
          `대표 배역: ${assessment.primaryRole.title}`,
          `추가 배역: ${secondary.title}, ${tertiary.title}`,
          assessment
            .performanceStrengths
            .length
            > 0
            ? `표현 강점: ${assessment.performanceStrengths.join(", ")}`
            : "",
          assessment
            .avoidedRolePatterns
            .length
            > 0
            ? `피해야 할 유형: ${assessment.avoidedRolePatterns.join(", ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" "),

      weight:
        5,
    },

    ...buildCandidateEvidence(
      primary,
      5,
    ),

    ...buildCandidateEvidence(
      secondary,
      4,
    ),

    ...buildCandidateEvidence(
      tertiary,
      4,
    ),

    ...assessment
      .limitations
      .map(
        (
          limitation,
          index,
        ): DecisionEvidence => ({
          source:
            "roleRecommendation",

          key:
            `roleRecommendation-limitation-${index + 1}`,

          description:
            limitation,

          weight:
            2,
        }),
      ),
  ];
}

export function extractRoleRecommendationAssessmentFromEvidence(
  evidence:
    DecisionEvidence[],
): boolean {
  return evidence.some(
    (item) =>
      item.source
      === "roleRecommendation",
  );
}
