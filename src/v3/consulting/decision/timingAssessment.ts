import type { QuestionContext } from "../question/questionContext";
import type { QuestionTimingType } from "../question/questionReader";

export type TimingEvidenceLevel =
  | "notRequired"
  | "available";

export type TimingAssessmentScope =
  | "none"
  | "timingEvaluation";

export type TimingAssessment = {
  analysisRequired: boolean;

  timingType: QuestionTimingType;

  evidenceLevel: TimingEvidenceLevel;

  assessmentScope: TimingAssessmentScope;
};

export function assessTiming(
  questionContext: QuestionContext,
): TimingAssessment {
  const analysisRequired =
    questionContext.requirements
      .timingAnalysisRequired;

  return {
    analysisRequired,

    timingType:
      questionContext.timingType,

    evidenceLevel:
      analysisRequired
        ? "available"
        : "notRequired",

    assessmentScope:
      analysisRequired
        ? "timingEvaluation"
        : "none",
  };
}