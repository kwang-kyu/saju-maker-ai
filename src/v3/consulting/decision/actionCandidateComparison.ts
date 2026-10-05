import type {
  ActionReadiness,
  ContextAlignment,
  DecisionConfidence,
  DecisionEngineInput,
  DecisionVerdict,
} from "./decisionTypes.js";
import type {
  DecisionRealityAssessment,
} from "./decisionRealityAssessment.js";
import type {
  TimingAssessment,
} from "./timingAssessment.js";
import {
  analyzeContextAlignment,
} from "./contextAlignment.js";
import {
  buildCoreDecision,
} from "./coreDecisionBuilder.js";
import {
  resolveActionReadiness,
  resolveConfidence,
} from "./decisionResolver.js";
import {
  buildVerdictContext,
} from "./verdictContextBuilder.js";
import {
  buildVerdict,
} from "./verdictBuilder.js";
import {
  buildDecisionQuestion,
  type DecisionTarget,
  type QuestionActionParticipantProvenance,
  type QuestionActionRelation,
  type QuestionReaderResult,
  type QuestionTopic,
} from "../question/questionReader.js";

/**
 * ACTION exclusive_alt 후보 arm.
 * 새 semantic meaning을 만들지 않고 Reader evidence만 패키징한다.
 */
export type CandidateArm = {
  decisionTarget: DecisionTarget;
  topic: QuestionTopic;
  provenance: QuestionActionParticipantProvenance | null;
  sourceRelation: QuestionActionRelation;
};

export type CandidateArmEvaluation = {
  arm: CandidateArm;
  alignment: ContextAlignment;
  alignmentReason: string;
  actionReadiness: ActionReadiness;
  confidence: DecisionConfidence;
  verdict: DecisionVerdict;
};

export type ActionCandidateComparisonResult = {
  arms: CandidateArm[];
  evaluations: CandidateArmEvaluation[];
  winner: CandidateArmEvaluation;
};

/**
 * choose / meta selection target은 실제 선택 후보에서 제외한다.
 * wait는 invest↔wait처럼 실제 action 후보일 수 있으므로 제외하지 않는다.
 */
const META_SELECTION_DECISION_TARGETS: ReadonlySet<DecisionTarget> = new Set([
  "choose",
  "confirmDirection",
  "none",
]);

const COMPARABLE_VERDICT_RANK: Readonly<
  Partial<Record<DecisionVerdict, number>>
> = {
  recommended: 4,
  conditionallyRecommended: 3,
  wait: 2,
  notRecommended: 1,
};

const ALIGNMENT_PRECEDENCE_RANK: Readonly<
  Record<ContextAlignment, number>
> = {
  stronglyAligned: 6,
  aligned: 5,
  partiallyAligned: 4,
  unknown: 3,
  conflicted: 2,
  stronglyConflicted: 1,
};

function isMetaSelectionDecisionTarget(
  decisionTarget: DecisionTarget,
): boolean {
  return META_SELECTION_DECISION_TARGETS.has(
    decisionTarget,
  );
}

function isComparableVerdict(
  verdict: DecisionVerdict,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    COMPARABLE_VERDICT_RANK,
    verdict,
  );
}

function resolveArmTopic(
  questionTopic: QuestionTopic,
  decisionTarget: DecisionTarget,
): QuestionTopic {
  if (
    decisionTarget === "changeJob"
    || decisionTarget === "leaveJob"
  ) {
    return "job";
  }

  return questionTopic;
}

/**
 * exclusive_alt participants에서 실제 ACTION 후보 arm만 추출한다.
 * 후보가 2개 미만이면 null → 기존 single decision path 유지.
 */
export function extractActionCandidateArms(
  question: QuestionReaderResult,
): CandidateArm[] | null {
  const relations =
    question
      .readerMatchDiagnostics
      ?.actionRelations;

  if (
    !relations
    || relations.length === 0
  ) {
    return null;
  }

  const exclusive = relations.find(
    (relation) =>
      relation.kind === "exclusive_alt"
      && relation.participants.length >= 2,
  );

  if (!exclusive) {
    return null;
  }

  const seen = new Set<DecisionTarget>();
  const arms: CandidateArm[] = [];

  for (const decisionTarget of exclusive.participants) {
    if (
      isMetaSelectionDecisionTarget(
        decisionTarget,
      )
    ) {
      continue;
    }

    if (seen.has(decisionTarget)) {
      continue;
    }

    seen.add(decisionTarget);

    const provenance =
      exclusive
        .participantProvenance
        ?.find(
          (entry) =>
            entry.value === decisionTarget,
        )
      ?? null;

    arms.push({
      decisionTarget,
      topic: resolveArmTopic(
        question.topic,
        decisionTarget,
      ),
      provenance,
      sourceRelation: exclusive,
    });
  }

  if (arms.length < 2) {
    return null;
  }

  return arms;
}

function buildArmQuestion(
  question: QuestionReaderResult,
  arm: CandidateArm,
): QuestionReaderResult {
  return {
    ...question,
    decisionTarget: arm.decisionTarget,
    topic: arm.topic,
    decisionQuestion: buildDecisionQuestion(
      arm.decisionTarget,
      arm.topic,
    ),
  };
}

function evaluateCandidateArm(params: {
  input: DecisionEngineInput;
  arm: CandidateArm;
  lifeAssessment: DecisionRealityAssessment;
  timingAssessment: TimingAssessment;
}): CandidateArmEvaluation {
  const {
    input,
    arm,
    lifeAssessment,
    timingAssessment,
  } = params;

  const armQuestion = buildArmQuestion(
    input.question,
    arm,
  );

  const armInput: DecisionEngineInput = {
    ...input,
    question: armQuestion,
  };

  const alignmentResult =
    analyzeContextAlignment(
      input.humanContext,
      armQuestion,
    );

  const actionReadiness =
    resolveActionReadiness(
      alignmentResult.alignment,
      input.question.urgency,
      lifeAssessment,
    );

  const confidence = resolveConfidence(
    input.question.confidence,
    alignmentResult.alignment,
  );

  const verdictContext = buildVerdictContext({
    decisionInput: armInput,
    alignment: alignmentResult.alignment,
    readiness: actionReadiness,
    confidence,
    lifeAssessment,
    timingAssessment,
  });

  const verdict = buildVerdict(
    verdictContext,
  );

  return {
    arm,
    alignment: alignmentResult.alignment,
    alignmentReason: alignmentResult.reason,
    actionReadiness,
    confidence,
    verdict,
  };
}

function compareArmEvaluations(
  evaluations: CandidateArmEvaluation[],
): CandidateArmEvaluation | null {
  if (
    evaluations.some(
      (evaluation) =>
        !isComparableVerdict(
          evaluation.verdict,
        ),
    )
  ) {
    // insufficientEvidence / interpreted: 기존 A/B ranking 계약 없음
    return null;
  }

  const rankOf = (
    evaluation: CandidateArmEvaluation,
  ): {
    verdictRank: number;
    alignmentRank: number;
  } => ({
    verdictRank:
      COMPARABLE_VERDICT_RANK[evaluation.verdict] ?? 0,
    alignmentRank:
      ALIGNMENT_PRECEDENCE_RANK[evaluation.alignment],
  });

  const isBetter = (
    left: CandidateArmEvaluation,
    right: CandidateArmEvaluation,
  ): boolean => {
    const leftRank = rankOf(left);
    const rightRank = rankOf(right);

    if (leftRank.verdictRank !== rightRank.verdictRank) {
      return leftRank.verdictRank > rightRank.verdictRank;
    }

    return leftRank.alignmentRank > rightRank.alignmentRank;
  };

  const isEqual = (
    left: CandidateArmEvaluation,
    right: CandidateArmEvaluation,
  ): boolean => {
    const leftRank = rankOf(left);
    const rightRank = rankOf(right);

    return (
      leftRank.verdictRank === rightRank.verdictRank
      && leftRank.alignmentRank === rightRank.alignmentRank
    );
  };

  let best = evaluations[0];

  for (let index = 1; index < evaluations.length; index += 1) {
    const candidate = evaluations[index];

    if (isBetter(candidate, best)) {
      best = candidate;
    }
  }

  const tiedCount = evaluations.filter(
    (evaluation) =>
      isEqual(evaluation, best),
  ).length;

  // verdict + alignment 동점: 새 tie-breaker를 만들지 않고 non-comparison fallback
  if (tiedCount !== 1) {
    return null;
  }

  return best;
}

/**
 * ACTION exclusive_alt 후보를 arm별 기존 경로로 평가·비교한다.
 * 전체 runDecisionEngine 재호출 없음.
 * 비교 불가 시 null → 기존 single path.
 */
export function resolveActionCandidateComparison(params: {
  input: DecisionEngineInput;
  lifeAssessment: DecisionRealityAssessment;
  timingAssessment: TimingAssessment;
}): ActionCandidateComparisonResult | null {
  const {
    input,
    lifeAssessment,
    timingAssessment,
  } = params;

  const arms = extractActionCandidateArms(
    input.question,
  );

  if (!arms) {
    return null;
  }

  const evaluations = arms.map(
    (arm) =>
      evaluateCandidateArm({
        input,
        arm,
        lifeAssessment,
        timingAssessment,
      }),
  );

  const winner = compareArmEvaluations(
    evaluations,
  );

  if (!winner) {
    return null;
  }

  return {
    arms,
    evaluations,
    winner,
  };
}

/**
 * 우세 후보 DecisionTarget 의미를 coreDecision에 명시한다.
 * selection generic wait 문구로 후보를 덮지 않기 위해
 * decisionQuestion(후보 DT) + legacy coreDecision 경로를 사용한다.
 */
export function buildActionCandidateWinnerCoreDecision(
  winner: CandidateArmEvaluation,
): string {
  return buildCoreDecision(
    winner.verdict,
    buildDecisionQuestion(
      winner.arm.decisionTarget,
      winner.arm.topic,
    ),
  );
}

/**
 * recommendedDirection이 우세 후보를 식별할 수 있게
 * 기존 DecisionTarget decisionQuestion 의미를 앞에 붙인다.
 */
export function annotateDirectionWithWinnerArm(
  winner: CandidateArmEvaluation,
  recommendedDirection: string,
  prohibitedDirection: string,
): {
  recommendedDirection: string;
  prohibitedDirection: string;
} {
  const winnerLabel = buildDecisionQuestion(
    winner.arm.decisionTarget,
    winner.arm.topic,
  );

  return {
    recommendedDirection:
      `${winnerLabel} 후보가 우세하다. ${recommendedDirection}`,
    prohibitedDirection,
  };
}

export function buildWinnerAwareQuestion(
  question: QuestionReaderResult,
  winner: CandidateArmEvaluation,
): QuestionReaderResult {
  return buildArmQuestion(
    question,
    winner.arm,
  );
}
