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

function buildRecommendedDirection(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "현재 국면의 흐름을 활용해 실행하되, 사람의 반복 패턴이 재현되지 않도록 기준을 세워 진행한다.";

    case "conditionallyRecommended":
      return "필수 조건과 위험 관리 기준을 먼저 갖춘 뒤 제한적으로 진행한다.";

    case "wait":
      return "현재 충돌 요소를 정리하고 국면이 바뀌거나 준비가 완료될 때까지 판단을 유보한다.";

    case "notRecommended":
      return "현재 선택을 중단하고 사람의 본질과 현재 국면에 맞는 다른 방향을 찾는다.";

    case "insufficientEvidence":
      return "결정 대상과 시기를 구체화한 뒤 다시 판단한다.";
  }
}

function buildRepeatedPatternProhibition(
  input: DecisionEngineInput,
): string {
  const pattern =
    input.humanContext.identity.profile.repeatedPattern.primary
      .pattern;

  switch (pattern) {
    case "earlySuccessCollapse":
      return "초기 성과만 믿고 검증 없이 규모와 고정비를 확대하지 않는다.";

    case "slowGrowthStable":
      return "빠른 성과를 만들기 위해 본래의 점진적 성장 방식을 무리하게 바꾸지 않는다.";

    case "relationshipLoss":
      return "감정과 신뢰만으로 동업, 금전 거래 또는 권한 공유를 결정하지 않는다.";

    case "wealthLeak":
      return "현금흐름과 손실 한도를 확인하지 않은 투자와 확장을 추진하지 않는다.";

    case "restartCycle":
      return "현재 문제를 정리하지 않은 채 직업이나 환경만 반복해서 바꾸지 않는다.";

    case "responsibilityOverload":
      return "모든 책임과 실무를 혼자 떠안는 방식으로 실행하지 않는다.";

    case "lateBloom":
      return "초기 결과가 느리다는 이유로 축적 중인 방향을 성급하게 포기하지 않는다.";

    case "opportunityMiss":
      return "완벽한 확신만 기다리며 실행 시기를 계속 미루지 않는다.";
  }
}

function buildProhibitedDirection(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "근거 없이 규모를 확대하거나 준비되지 않은 상태에서 속도를 높이지 않는다.";

    case "conditionallyRecommended":
      return "필수 조건을 충족하지 않은 채 바로 실행하지 않는다.";

    case "wait":
      return "불안과 조급함만으로 결정을 밀어붙이지 않는다.";

    case "notRecommended":
      return "현재 국면과 충돌하는 선택을 억지로 추진하지 않는다.";

    case "insufficientEvidence":
      return "판단 근거가 부족한 상태에서 확정적인 결정을 내리지 않는다.";
  }
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

  const verdictContext = buildVerdictContext({
    decisionInput: input,
    alignment: alignmentResult.alignment,
    readiness: actionReadiness,
    confidence,
  });
  
  const verdict = buildVerdict(verdictContext);

  const evidence = buildEvidence(input);
  const conditions = [
    ...buildConditions(
      actionReadiness,
      alignmentResult.reason,
    ),
    ...buildRepeatedPatternConditions(input),
  ];
  const risks = [
    ...buildRisks(
      alignmentResult.alignment,
      input.question.urgency,
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

  const recommendedDirection =
    buildRecommendedDirection(verdict);

    const prohibitedDirection = [
      buildProhibitedDirection(verdict),
      buildRepeatedPatternProhibition(input),
    ].join(" ");

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

    recommendedDirection,
    prohibitedDirection,

    finalDecisionSentence: [
      coreDecision,
      recommendedDirection,
    ].join(" "),

    humanContextUsed: true,
    questionContextUsed: true,
  };
}