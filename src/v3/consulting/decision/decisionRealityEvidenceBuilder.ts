import type {
    QuestionRealityConstraint,
  } from "../question/questionContext.js";
  import type {
    DecisionRealityAssessment,
  } from "./decisionRealityAssessment.js";
  import type {
    DecisionEvidence,
  } from "./decisionTypes.js";
  function buildRealityEvidenceKey(
    constraint: QuestionRealityConstraint,
  ): string {
    return [
      "reality",
      constraint.area,
      constraint.signal,
    ].join("-");
  }
  function normalizeExplicitEvidence(
    evidence: string[],
  ): string[] {
    return [
      ...new Set(
        evidence
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }
  function buildRealityEvidenceDescription(
    constraint: QuestionRealityConstraint,
  ): string {
    const explicitEvidence =
      normalizeExplicitEvidence(
        constraint.evidence,
      );
    if (explicitEvidence.length === 0) {
      return constraint.description;
    }
    return [
      constraint.description,
      `질문에서 확인된 표현: ${explicitEvidence.join(", ")}`,
    ].join(" ");
  }
  /**
   * 질문에 직접 명시된 현실 제약을
   * Decision Evidence로 변환한다.
   *
   * 이 Builder는 새로운 현실 판단이나 Verdict를 만들지 않는다.
   * Decision Reality Assessment가 보존한 명시적 제약만 근거로 변환한다.
   */
  export function buildDecisionRealityEvidence(
    assessment: DecisionRealityAssessment,
  ): DecisionEvidence[] {
    if (!assessment.questionRealityUsed) {
      return [];
    }
    const evidence: DecisionEvidence[] = [];
    const usedKeys = new Set<string>();
    for (
      const constraint
      of assessment.questionConstraints
    ) {
      const key =
        buildRealityEvidenceKey(
          constraint,
        );
      if (usedKeys.has(key)) {
        continue;
      }
      usedKeys.add(key);
      evidence.push({
        source: "currentContext",
        key,
        description:
          buildRealityEvidenceDescription(
            constraint,
          ),
        weight: 5,
      });
    }
    return evidence;
  }
