import { analyzeContextAlignment } from "./contextAlignment";
import { buildDecisionBrain } from "./decisionBrain";
import type {
  ActionReadiness,
  DecisionCondition,
  DecisionConfidence,
  DecisionEngineInput,
  DecisionEvidence,
  DecisionResult,
  DecisionRisk,
  DecisionVerdict,
} from "./decisionTypes";
import { buildVerdict } from "./verdictBuilder";
import { buildVerdictContext } from "./verdictContextBuilder";
import { buildDirectionJudgement } from "./directionJudgementBuilder";
import {
  assessLifeContext,
  type LifeContextAssessment,
} from "./lifeContextAssessment";

function resolveConfidence(
  questionConfidence: number,
  alignment: DecisionResult["contextAlignment"],
): DecisionConfidence {
  if (
    questionConfidence >= 0.85 &&
    alignment !== "unknown"
  ) {
    return "high";
  }

  if (
    questionConfidence >= 0.6 ||
    alignment !== "unknown"
  ) {
    return "medium";
  }

  return "low";
}

function resolveActionReadiness(
  alignment: DecisionResult["contextAlignment"],
  urgency: DecisionEngineInput["question"]["urgency"],
): ActionReadiness {
  if (alignment === "stronglyConflicted") {
    return "stopRequired";
  }

  if (alignment === "conflicted") {
    return "delayRequired";
  }

  if (alignment === "stronglyAligned") {
    if (urgency === "immediate") {
      return "readyWithConditions";
    }

    return "ready";
  }

  if (alignment === "aligned") {
    return "readyWithConditions";
  }

  if (alignment === "partiallyAligned") {
    return "preparationRequired";
  }

  return "unknown";
}

function buildEvidence(
  input: DecisionEngineInput,
): DecisionEvidence[] {
  const brain = buildDecisionBrain(
    input.humanContext,
    input.question,
  );

  return [
    {
      source: "humanIdentity",
      key: "identity",
      description: brain.snapshot.identity,
      weight: 5,
    },
    {
      source: "lifePhase",
      key: "currentPhase",
      description: brain.snapshot.currentPhase,
      weight: 5,
    },
    {
      source: "lifeDriver",
      key: "lifeDriver",
      description: brain.snapshot.lifeDriver,
      weight: 4,
    },
    {
      source: "survivalStyle",
      key: "survivalStyle",
      description: brain.snapshot.survivalStyle,
      weight: 3,
    },
    ...input.humanContext.identity.profile.repeatedPattern.primary.evidence.map(
      (item, index): DecisionEvidence => ({
        source: "repeatedPattern",
        key: `repeatedPattern-primary-${index + 1}`,
        description: item.description,
        weight: item.weight,
      }),
    ),
    
    ...(
      input.humanContext.identity.profile.repeatedPattern.secondary
        ?.evidence ?? []
    ).map(
      (item, index): DecisionEvidence => ({
        source: "repeatedPattern",
        key: `repeatedPattern-secondary-${index + 1}`,
        description: item.description,
        weight: item.weight,
      }),
    ),
    {
      source: "questionIntent",
      key: "questionIntent",
      description: [
        input.question.asksWhat,
        input.question.asksWhy,
        input.question.decisionQuestion,
      ]
        .filter(Boolean)
        .join(" "),
      weight: 3,
    },
  ];
}

function buildRepeatedPatternConditions(
  input: DecisionEngineInput,
): DecisionCondition[] {
  const repeatedPattern =
    input.humanContext.identity.profile.repeatedPattern;

    const patterns = [
      repeatedPattern.primary.pattern,
      ...(repeatedPattern.secondary
        ? [repeatedPattern.secondary.pattern]
        : []),
    ];

  const conditions: DecisionCondition[] = [];

  for (const pattern of patterns) {
    switch (pattern) {
      case "earlySuccessCollapse":
        conditions.push({
          key: "verifyBeforeExpansion",
          description:
            "초기 성과만 보고 규모를 확대하지 말고 유지 가능성과 반복 수익을 먼저 검증해야 한다.",
          required: true,
          satisfied: false,
        });
        break;

      case "slowGrowthStable":
        conditions.push({
          key: "useGradualGrowth",
          description:
            "작게 시작해 경험과 수익을 축적하는 점진적 실행 방식을 유지해야 한다.",
          required: true,
          satisfied: false,
        });
        break;

      case "relationshipLoss":
        conditions.push({
          key: "defineRelationshipBoundaries",
          description:
            "역할, 권한, 책임과 금전 관계를 감정과 분리하여 명확히 정해야 한다.",
          required: true,
          satisfied: false,
        });
        break;

      case "wealthLeak":
        conditions.push({
          key: "protectCashFlow",
          description:
            "실행 전에 고정비, 현금흐름과 감당 가능한 손실 한도를 확정해야 한다.",
          required: true,
          satisfied: false,
        });
        break;

      case "restartCycle":
        conditions.push({
          key: "confirmContinuationPlan",
          description:
            "새로운 시작뿐 아니라 일정 기간 유지할 운영 계획과 중단 기준을 함께 세워야 한다.",
          required: true,
          satisfied: false,
        });
        break;

      case "responsibilityOverload":
        conditions.push({
          key: "divideResponsibility",
          description:
            "책임과 실무를 혼자 떠안지 않도록 역할 분담과 휴식 기준을 마련해야 한다.",
          required: true,
          satisfied: false,
        });
        break;

      case "lateBloom":
        conditions.push({
          key: "allowLongTermAccumulation",
          description:
            "빠른 결과를 강요하지 말고 경험과 전문성이 축적될 시간을 확보해야 한다.",
          required: true,
          satisfied: false,
        });
        break;

      case "opportunityMiss":
        conditions.push({
          key: "setDecisionDeadline",
          description:
            "검토 후에도 결정을 계속 미루지 않도록 판단 기한과 실행 기준을 정해야 한다.",
          required: true,
          satisfied: false,
        });
        break;
    }
  }

  return conditions;
}

function buildLifeContextConditions(
  assessment: LifeContextAssessment,
): DecisionCondition[] {
  const conditions: DecisionCondition[] = [];

  if (
    assessment.financialPressure === "high"
  ) {
    conditions.push({
      key: "protectExistingCashFlow",
      description:
        "현재 수입과 필수 지출을 보호할 수 있도록 실행 자금, 생활비와 감당 가능한 손실 한도를 먼저 분리해야 한다.",
      required: true,
      satisfied: false,
    });
  }

  if (
    assessment.familyResponsibility === "high"
  ) {
    conditions.push({
      key: "protectFamilyResponsibility",
      description:
        "가족 부양과 생활 책임이 흔들리지 않도록 실행 규모와 월별 부담 한도를 먼저 확정해야 한다.",
      required: true,
      satisfied: false,
    });
  }

  if (
    assessment.transitionDifficulty === "high"
  ) {
    conditions.push({
      key: "useGradualTransition",
      description:
        "기존 직업이나 수입 기반을 즉시 포기하지 말고 병행 검증과 단계적 전환 계획을 마련해야 한다.",
      required: true,
      satisfied: false,
    });
  }

  if (
    assessment.expansionRisk === "high"
  ) {
    conditions.push({
      key: "limitExpansionScale",
      description:
        "신규 고정비와 추가 책임을 확대하기 전에 현재 운영 능력과 현금흐름의 지속 가능성을 검증해야 한다.",
      required: true,
      satisfied: false,
    });
  }

  if (
    assessment.executionConstraint === "high"
  ) {
    conditions.push({
      key: "secureExecutionCapacity",
      description:
        "현재 책임과 일정 안에서 실제로 감당할 수 있는 시간, 인력과 실행 범위를 먼저 확보해야 한다.",
      required: true,
      satisfied: false,
    });
  }

  return conditions;
}

function buildConditions(
  readiness: ActionReadiness,
  alignmentReason: string,
): DecisionCondition[] {
  if (readiness === "ready") {
    return [];
  }

  if (readiness === "readyWithConditions") {
    return [
      {
        key: "confirmExecutionConditions",
        description:
          "실행 전 자금, 역할, 일정과 감당 가능한 손실 범위를 명확히 해야 한다.",
        required: true,
        satisfied: false,
      },
    ];
  }

  if (readiness === "preparationRequired") {
    return [
      {
        key: "completePreparation",
        description:
          "현재 국면에 맞는 준비와 검증을 먼저 완료해야 한다.",
        required: true,
        satisfied: false,
      },
    ];
  }

  if (readiness === "delayRequired") {
    return [
      {
        key: "resolveContextConflict",
        description: alignmentReason,
        required: true,
        satisfied: false,
      },
    ];
  }

  if (readiness === "stopRequired") {
    return [
      {
        key: "stopCurrentDirection",
        description:
          "현재 국면과 강하게 충돌하는 행동은 중단해야 한다.",
        required: true,
        satisfied: false,
      },
    ];
  }

  return [
    {
      key: "clarifyDecisionTarget",
      description:
        "실제로 결정하려는 행동과 시기를 더 분명하게 해야 한다.",
      required: true,
      satisfied: false,
    },
  ];
}

function buildRepeatedPatternRisks(
  input: DecisionEngineInput,
): DecisionRisk[] {
  const repeatedPattern =
    input.humanContext.identity.profile.repeatedPattern;

  const severity: DecisionRisk["severity"] =
    repeatedPattern.primary.confidence === "high"
      ? "high"
      : repeatedPattern.primary.confidence === "medium"
        ? "medium"
        : "low";

  return repeatedPattern.risks.map(
    (description, index): DecisionRisk => ({
      key: `repeatedPattern-${index + 1}`,
      description,
      severity,
      source: "repeatedPattern",
    }),
  );
}

function buildLifeContextRisks(
  assessment: LifeContextAssessment,
): DecisionRisk[] {
  const risks: DecisionRisk[] = [];

  if (
    assessment.financialPressure === "high"
  ) {
    risks.push({
      key: "lifeContextFinancialPressure",
      description:
        "현재 재정 책임이 큰 상태이므로 예상보다 수익 발생이 늦어질 경우 기존 생활 기반과 현금흐름이 함께 흔들릴 수 있다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.familyResponsibility === "high"
  ) {
    risks.push({
      key: "lifeContextFamilyResponsibility",
      description:
        "가족 부양 책임이 큰 상태에서 새로운 선택의 부담까지 동시에 떠안으면 생활 안정성과 관계가 함께 압박받을 수 있다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.transitionDifficulty === "high"
  ) {
    risks.push({
      key: "lifeContextTransitionDifficulty",
      description:
        "기존 직업이나 수입 기반을 한 번에 정리하면 새로운 선택이 자리 잡기 전에 회복하기 어려운 공백이 생길 수 있다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.expansionRisk === "high"
  ) {
    risks.push({
      key: "lifeContextExpansionRisk",
      description:
        "현재 책임 위에 사업, 투자 또는 고정비를 추가하면 관리 범위를 넘어서는 동시 확장 위험이 커진다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  if (
    assessment.executionConstraint === "high"
  ) {
    risks.push({
      key: "lifeContextExecutionConstraint",
      description:
        "실행 가능한 시간과 자원이 부족한 상태에서 결정을 추진하면 준비 부족과 책임 과부하로 중단될 가능성이 높다.",
      severity: "high",
      source: "lifeContext",
    });
  }

  return risks;
}
function buildRisks(
  alignment: DecisionResult["contextAlignment"],
  urgency: DecisionEngineInput["question"]["urgency"],
): DecisionRisk[] {
  const risks: DecisionRisk[] = [];

  if (
    alignment === "conflicted" ||
    alignment === "stronglyConflicted"
  ) {
    risks.push({
      key: "phaseConflict",
      description:
        "현재 인생 국면과 질문 속 행동 방향이 충돌한다.",
      severity:
        alignment === "stronglyConflicted" ? "high" : "medium",
      source: "lifePhase",
    });
  }

  if (urgency === "immediate") {
    risks.push({
      key: "urgentDecision",
      description:
        "결정을 서두르면 현재 사람의 반복 패턴이 다시 나타날 수 있다.",
      severity: "medium",
      source: "repeatedPattern",
    });
  }

  return risks;
}

function buildCoreDecision(
  verdict: DecisionVerdict,
  decisionQuestion: string,
): string {
  const verdictText: Record<DecisionVerdict, string> = {
    recommended: "진행하는 것이 맞다.",
    conditionallyRecommended:
      "조건을 갖춘 뒤 진행하는 것이 맞다.",
    wait: "지금은 바로 결정하지 말고 기다리는 것이 맞다.",
    notRecommended: "현재는 진행하지 않는 것이 맞다.",
    insufficientEvidence:
      "현재 정보만으로는 결정을 확정할 수 없다.",
  };

  return `${decisionQuestion}: ${verdictText[verdict]}`;
}

/**
 * Decision Engine
 *
 * Human Destiny Context를 먼저 읽고,
 * Question Reader 결과를 마지막에 결합해
 * 엔진이 최종 DecisionResult를 생성한다.
 *
 * GPT는 이 결과를 변경하거나 새로 판단하지 않는다.
 */
export function runDecisionEngine(
  input: DecisionEngineInput,
): DecisionResult {
  const brain = buildDecisionBrain(
    input.humanContext,
    input.question,
  );

  const alignmentResult = analyzeContextAlignment(
    input.humanContext,
    input.question,
  );

  const confidence = resolveConfidence(
    input.question.confidence,
    alignmentResult.alignment,
  );

  const actionReadiness = resolveActionReadiness(
    alignmentResult.alignment,
    input.question.urgency,
  );

  const lifeAssessment =
  assessLifeContext(
    input.lifeContext,
  );

  const verdictContext = buildVerdictContext({
    decisionInput: input,
    alignment: alignmentResult.alignment,
    readiness: actionReadiness,
    confidence,
    lifeAssessment,
  });
  
  const verdict = buildVerdict(verdictContext);

  const directionJudgement = buildDirectionJudgement({
    verdict,
    context: verdictContext,
  });

  const evidence = buildEvidence(input);
  const conditions = [
    ...buildConditions(
      actionReadiness,
      alignmentResult.reason,
    ),
    ...buildLifeContextConditions(
      lifeAssessment,
    ),
    ...buildRepeatedPatternConditions(input),
  ];
  const risks = [
    ...buildRisks(
      alignmentResult.alignment,
      input.question.urgency,
    ),
    ...buildLifeContextRisks(
      lifeAssessment,
    ),
    ...buildRepeatedPatternRisks(input),
  ];

  const conflictExists =
    alignmentResult.alignment === "conflicted" ||
    alignmentResult.alignment === "stronglyConflicted";

  const coreDecision = buildCoreDecision(
    verdict,
    input.question.decisionQuestion,
  );

  return {
    verdict,
    confidence,

    contextAlignment: alignmentResult.alignment,
    actionReadiness,

    decisionTarget: input.question.decisionTarget,
    topic: input.question.topic,
    intent: input.question.intent,

    coreDecision,
    decisionReason: alignmentResult.reason,

    evidence,
    conditions,
    risks,

    conflict: {
      exists: conflictExists,
      description: conflictExists
        ? alignmentResult.reason
        : "현재 사람의 국면과 질문 속 선택 사이에 직접적인 충돌은 확인되지 않았다.",
      humanContextSide: brain.snapshot.currentPhase,
      questionSide: input.question.decisionQuestion,
    },

    recommendedDirection:
      directionJudgement.recommendedDirection,

    prohibitedDirection:
      directionJudgement.prohibitedDirection,

    finalDecisionSentence: [
      coreDecision,
      directionJudgement.recommendedDirection,
    ].join(" "),

    humanContextUsed: true,
    questionContextUsed: true,
  };
}