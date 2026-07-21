import type {
    ActionReadiness,
    DecisionCondition,
    DecisionEngineInput,
  } from "./decisionTypes";
  import type { LifeContextAssessment } from "./lifeContextAssessment";
  import type {
    DecisionRealityAssessment,
  } from "./decisionRealityAssessment";
  import type {
    CompatibilityAssessment,
  } from "./compatibilityAssessment";
  import type {
    TimingAssessment,
  } from "./timingAssessment";
  import type {
    ReaderDecisionAssessment,
  } from "./readerDecisionAssessment";
  import {
    buildReaderDecisionConditions,
  } from "./readerDecisionConditionBuilder";
  
  /**
   * Decision Condition Builder
   *
   * Action Readiness, Life Context, Repeated Pattern을 읽어
   * Decision Engine이 사용할 실행 조건을 구성한다.
   *
   * 이 Builder는 Verdict를 생성하거나 변경하지 않는다.
   */
  
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

  function buildCompatibilityConditions(
    assessment: CompatibilityAssessment,
  ): DecisionCondition[] {
    if (!assessment.analysisRequired) {
      return [];
    }
  
    const conditions: DecisionCondition[] = [];
  
    if (!assessment.counterpartExists) {
      conditions.push({
        key: "identifyCompatibilityCounterpart",
        description:
          "궁합 판단의 대상이 되는 상대방과 관계를 먼저 구체적으로 확인해야 한다.",
        required: true,
        satisfied: false,
      });
  
      return conditions;
    }
  
    if (
      assessment.additionalCounterpartDataRequired
    ) {
      conditions.push({
        key: "provideCounterpartBirthData",
        description:
          "특정 상대방과의 궁합을 완전하게 판단하려면 상대방의 생년월일과 출생시간 정보가 필요하다.",
        required: true,
        satisfied: false,
      });
    }
  
    return conditions;
  }
  
  function buildTimingConditions(
    assessment: TimingAssessment,
  ): DecisionCondition[] {
    if (!assessment.analysisRequired) {
      return [];
    }
  
    switch (assessment.timingType) {
      case "executionTiming":
        return [
          {
            key: "verifyImmediateExecutionReadiness",
            description:
              "지금 바로 실행하려는 질문이므로 자금, 역할, 일정과 실제 실행 준비가 갖춰졌는지 먼저 확인해야 한다.",
            required: true,
            satisfied: false,
          },
        ];
  
      case "waitingTiming":
        return [
          {
            key: "defineWaitingCondition",
            description:
              "단순히 기다리는 것이 아니라 무엇이 충족될 때까지 기다릴 것인지 기준과 재검토 시점을 정해야 한다.",
            required: true,
            satisfied: false,
          },
        ];
  
      case "bestTiming":
        return [
          {
            key: "identifyActionTimingWindow",
            description:
              "실행에 유리한 시기를 판단할 수 있도록 현재 준비 상태와 실제 행동 예정 기간을 구체적으로 확인해야 한다.",
            required: true,
            satisfied: false,
          },
        ];
  
      case "unknown":
        return [
          {
            key: "clarifyTimingIntent",
            description:
              "지금 실행할 것인지, 기다릴 것인지, 가장 적합한 시기를 찾는 것인지 질문의 시기 목적을 명확히 해야 한다.",
            required: true,
            satisfied: false,
          },
        ];
    }
  }

  type DecisionConditionLifeAssessment =
  LifeContextAssessment & {
    questionConstraints?:
      DecisionRealityAssessment[
        "questionConstraints"
      ];
  };

function buildFinancialPressureConditionDescription(
  assessment:
    DecisionConditionLifeAssessment,
): string {
  const signals =
    new Set(
      assessment.questionConstraints
        ?.map(
          (constraint) =>
            constraint.signal,
        )
      ?? [],
    );

  const hasDebtBurden =
    signals.has(
      "debtBurden",
    );

  const hasLivingCostPressure =
    signals.has(
      "livingCostPressure",
    );

  if (
    hasDebtBurden
    && hasLivingCostPressure
  ) {
    return "생활비와 대출 상환 재원을 투자금과 분리하고, 기존 생활비와 상환 의무를 훼손하지 않는 범위로 투자금과 손실 한도를 먼저 확정해야 한다.";
  }

  if (hasDebtBurden) {
    return "대출 상환 재원을 투자금과 분리하고, 상환 의무를 유지할 수 있는 범위로 투자금과 손실 한도를 먼저 확정해야 한다.";
  }

  if (hasLivingCostPressure) {
    return "필수 생활비를 투자금과 분리하고, 기존 생활 기반을 해치지 않는 범위로 투자금과 손실 한도를 먼저 확정해야 한다.";
  }

  return "현재 수입과 필수 지출을 보호할 수 있도록 실행 자금, 생활비와 감당 가능한 손실 한도를 먼저 분리해야 한다.";
}

function buildLifeContextConditions(
  assessment:
    DecisionConditionLifeAssessment,
): DecisionCondition[] {
    const conditions: DecisionCondition[] = [];
  
    if (assessment.financialPressure === "high") {
      conditions.push({
        key: "protectExistingCashFlow",
        description:
        buildFinancialPressureConditionDescription(
          assessment,
        ),
        required: true,
        satisfied: false,
      });
    }
  
    if (assessment.familyResponsibility === "high") {
      conditions.push({
        key: "protectFamilyResponsibility",
        description:
          "가족 부양과 생활 책임이 흔들리지 않도록 실행 규모와 월별 부담 한도를 먼저 확정해야 한다.",
        required: true,
        satisfied: false,
      });
    }
  
    if (assessment.transitionDifficulty === "high") {
      conditions.push({
        key: "useGradualTransition",
        description:
          "기존 직업이나 수입 기반을 즉시 포기하지 말고 병행 검증과 단계적 전환 계획을 마련해야 한다.",
        required: true,
        satisfied: false,
      });
    }
  
    if (assessment.expansionRisk === "high") {
      conditions.push({
        key: "limitExpansionScale",
        description:
          "신규 고정비와 추가 책임을 확대하기 전에 현재 운영 능력과 현금흐름의 지속 가능성을 검증해야 한다.",
        required: true,
        satisfied: false,
      });
    }
  
    if (assessment.executionConstraint === "high") {
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
  
  function buildReadinessConditions(
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
  
  export type DecisionConditionBuilderInput = {
    decisionInput: DecisionEngineInput;
    readiness: ActionReadiness;
    alignmentReason: string;
    lifeAssessment: LifeContextAssessment;
    compatibilityAssessment: CompatibilityAssessment;
    timingAssessment: TimingAssessment;
  };
  
  export function buildDecisionConditions(
    input: DecisionConditionBuilderInput,
  ): DecisionCondition[] {
    return [
      ...buildReadinessConditions(
        input.readiness,
        input.alignmentReason,
      ),
      ...buildLifeContextConditions(
        input.lifeAssessment,
      ),
      ...buildTimingConditions(
        input.timingAssessment,
      ),
      ...buildCompatibilityConditions(
        input.compatibilityAssessment,
      ),
      ...buildRepeatedPatternConditions(
        input.decisionInput,
      ),
    ];
  }

  export type ReaderAwareDecisionConditionBuilderInput =
  DecisionConditionBuilderInput & {
    readerAssessment:
      ReaderDecisionAssessment;
  };

export function buildReaderAwareDecisionConditions(
  input:
    ReaderAwareDecisionConditionBuilderInput,
): DecisionCondition[] {
  return [
    ...buildDecisionConditions(
      input,
    ),

    ...buildReaderDecisionConditions(
      input.readerAssessment,
    ),
  ];
}