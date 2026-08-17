import type {
  DecisionEvidence,
} from "./decisionTypes";
import type {
  LifeFlowInterpretationAssessment,
} from "./lifeFlowInterpretationAssessment";

export function buildLifeFlowInterpretationEvidence(
  assessment:
    LifeFlowInterpretationAssessment,
): DecisionEvidence[] {
  if (
    !assessment.available
    || !assessment.target
  ) {
    return [];
  }

  const evidence:
    DecisionEvidence[] = [
    {
      source:
        "lifePhase",

      key:
        "lifeFlowTarget",

      description:
        assessment
          .target
          .evidence
          .join(" "),

      weight:
        5,
    },
    {
      source:
        "lifePhase",

      key:
        "overallTheme",

      description:
        assessment.overallTheme,

      weight:
        5,
    },
    {
      source:
        "lifePhase",

      key:
        "phaseInterpretation",

      description:
        assessment.phaseInterpretation,

      weight:
        4,
    },
  ];

  for (
    const signal
    of assessment.supportiveSignals
  ) {
    evidence.push({
      source:
        "blessing",

      key:
        `support-${evidence.length}`,

      description:
        signal,

      weight:
        4,
    });
  }

  for (
    const signal
    of assessment.tensionSignals
  ) {
    evidence.push({
      source:
        "capacity",

      key:
        `tension-${evidence.length}`,

      description:
        signal,

      weight:
        3,
    });
  }

  for (
    const segment
    of assessment.periodSegments
  ) {
    evidence.push({
      source:
        "lifePhase",

      key:
        segment.key,

      description:
        segment.theme,

      weight:
        4,
    });
  }

  for (
    const limitation
    of assessment.limitations
  ) {
    evidence.push({
      source:
        "destiny",

      key:
        `limitation-${evidence.length}`,

      description:
        limitation,

      weight:
        2,
    });
  }

  return evidence;
}
