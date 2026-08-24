import type {
    DecisionEngineInput,
    DecisionResult,
    DecisionRisk,
  } from "./decisionTypes.js";
  import type { LifeContextAssessment } from "./lifeContextAssessment.js";
  import type {
    DecisionRealityAssessment,
  } from "./decisionRealityAssessment.js";
  import type {
    CompatibilityAssessment,
  } from "./compatibilityAssessment.js";
  import type {
    ReaderDecisionAssessment,
  } from "./readerDecisionAssessment.js";
  import {
    buildReaderDecisionRisks,
  } from "./readerDecisionRiskBuilder.js";
  import type {
    QuestionRealitySignal,
  } from "../question/questionContext.js";

  export function buildCompatibilityRisks(
    assessment: CompatibilityAssessment,
  ): DecisionRisk[] {
    if (!assessment.analysisRequired) {
      return [];
    }
  
    if (!assessment.counterpartExists) {
      return [
        {
          key: "compatibilityCounterpartMissing",
          description:
            "궁합 판단이 필요한 질문이지만 판단 대상이 되는 상대방이 구체적으로 확인되지 않아 관계 결합과 충돌을 충분히 검토할 수 없다.",
          severity: "high",
          source: "questionIntent",
        },
      ];
    }
  
    return [];
  }

  type DecisionRiskLifeAssessment =
  LifeContextAssessment & {
    questionConstraints?:
      DecisionRealityAssessment[
        "questionConstraints"
      ];
  };

function buildQuestionRealityRisks(
  assessment:
    DecisionRiskLifeAssessment,
): DecisionRisk[] {
  const signals =
    new Set(
      assessment.questionConstraints
        ?.map(
          (constraint) =>
            constraint.signal,
        )
      ?? [],
    );

  const wealthSignals:
    readonly QuestionRealitySignal[] = [
      "essentialFundsExposure",
      "liquidityConstraint",
      "assetConcentration",
    ];

  const wealthSignalCount =
    wealthSignals.filter(
      (signal) =>
        signals.has(signal),
    ).length;

  const severity:
    DecisionRisk["severity"] =
    wealthSignalCount >= 2
      ? "high"
      : "medium";

  const risks:
    DecisionRisk[] = [];

  if (
    signals.has(
      "essentialFundsExposure",
    )
  ) {
    risks.push({
      key:
        "essentialFundsLossExposure",
      description:
        "필수 생활자금·비상자금·노후자금이 투자 손실에 노출되면 손실 충격이 생활 기반에 직접 전이될 수 있다.",
      severity,
      source:
        "lifeContext",
    });
  }

  if (
    signals.has(
      "liquidityConstraint",
    )
  ) {
    risks.push({
      key:
        "liquidityLockup",
      description:
        "환매·매도가 지연되면 필요한 시점에 자금을 회수하지 못해 긴급 지출 대응이 어려워질 수 있다.",
      severity,
      source:
        "lifeContext",
    });
  }

  if (
    signals.has(
      "assetConcentration",
    )
  ) {
    risks.push({
      key:
        "concentratedAssetLoss",
      description:
        "단일 종목·단일 자산의 하락이 전체 자산 손실로 확대되면 분산되지 않은 손실 충격이 커질 수 있다.",
      severity,
      source:
        "lifeContext",
    });
  }

  return risks;
}
function buildFinancialPressureRiskDescription(
  assessment:
    DecisionRiskLifeAssessment,
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
    return "생활비와 대출 상환 부담이 함께 있는 상태에서 여유자금까지 투자하면, 손실이나 자금 회수 지연이 발생할 때 상환 일정과 기존 생활 기반이 동시에 흔들릴 수 있다.";
  }

  if (hasDebtBurden) {
    return "대출 상환 부담이 있는 상태에서 추가 자금을 투자하면, 손실이나 자금 회수 지연이 발생할 때 상환 일정과 기존 자금 기반이 함께 흔들릴 수 있다.";
  }

  if (hasLivingCostPressure) {
    return "생활비 부담이 있는 상태에서 추가 자금을 투자하면, 손실이나 자금 회수 지연이 발생할 때 기존 생활 기반을 유지하기 어려워질 수 있다.";
  }

  return "현재 재정 책임이 큰 상태이므로 예상보다 수익 발생이 늦어질 경우 기존 생활 기반과 현금흐름이 함께 흔들릴 수 있다.";
}
function buildTransitionDifficultyRiskDescription(
  assessment:
    DecisionRiskLifeAssessment,
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

  const hasIncomeInstability =
    signals.has(
      "incomeInstability",
    );

  const hasFamilyResponsibility =
    signals.has(
      "familyResponsibility",
    );

  const hasCurrentWorkResponsibility =
    signals.has(
      "currentWorkResponsibility",
    );

  const hasTimeConstraint =
    signals.has(
      "timeConstraint",
    );

  const hasTransitionDifficulty =
    signals.has(
      "transitionDifficulty",
    );

  if (
    hasIncomeInstability
    && hasFamilyResponsibility
    && hasCurrentWorkResponsibility
    && hasTimeConstraint
    && hasTransitionDifficulty
  ) {
    return "현재 직장 책임과 인수인계를 마치지 않은 채 이직을 서두르면, 준비 시간이 부족한 상태에서 수입 공백과 업무 과부하가 겹쳐 가족 생활 기반까지 흔들릴 수 있다.";
  }

  if (
    hasIncomeInstability
    && hasFamilyResponsibility
  ) {
    return "수입이 불안정한 상태에서 현재 직장을 먼저 그만두면, 전환 기간의 수입 공백이 가족 부양 재원과 생활 안정성을 동시에 압박할 수 있다.";
  }

  if (
    hasCurrentWorkResponsibility
    && hasTimeConstraint
  ) {
    return "현재 직장 업무와 이직 준비를 제한된 시간 안에 동시에 추진하면, 업무 과부하와 준비 부족이 겹쳐 기존 업무와 새로운 선택 모두 중단될 수 있다.";
  }

  if (hasTransitionDifficulty) {
    return "인수인계와 현재 업무 정리가 끝나기 전에 이직을 서두르면, 업무 공백과 미정리 책임이 남아 새로운 직장 적응까지 흔들릴 수 있다.";
  }

  return "기존 직업이나 수입 기반을 한 번에 정리하면 새로운 선택이 자리 잡기 전에 회복하기 어려운 공백이 생길 수 있다.";
}
export function buildLifeContextRisks(
  assessment:
    DecisionRiskLifeAssessment,
): DecisionRisk[] {
    const risks: DecisionRisk[] = [];
    const signals =
    new Set(
      assessment.questionConstraints
        ?.map(
          (constraint) =>
            constraint.signal,
        )
      ?? [],
    );

  const hasEssentialFundsExposure =
    signals.has(
      "essentialFundsExposure",
    );

  const hasLiquidityConstraint =
    signals.has(
      "liquidityConstraint",
    );

  const hasAssetConcentration =
    signals.has(
      "assetConcentration",
    );

  const hasExistingFinancialReality =
    signals.has(
      "debtBurden",
    )
    || signals.has(
      "livingCostPressure",
    )
    || signals.has(
      "incomeInstability",
    )
    || signals.has(
      "fixedCostPressure",
    )
    || signals.has(
      "lossConcern",
    );

  const wealthRisksCoverFinancialPressure =
    hasEssentialFundsExposure
    && hasLiquidityConstraint
    && hasAssetConcentration
    && !hasExistingFinancialReality;

  const wealthRisksCoverExpansionRisk =
    hasEssentialFundsExposure
    && hasAssetConcentration
    && !hasExistingFinancialReality;
  
    if (
      assessment.financialPressure === "high"
      && !wealthRisksCoverFinancialPressure
    ) {
      risks.push({
        key: "lifeContextFinancialPressure",
        description:
        buildFinancialPressureRiskDescription(
          assessment,
        ),
         severity: "high",
        source: "lifeContext",
      });
    }
  
    if (assessment.familyResponsibility === "high") {
      risks.push({
        key: "lifeContextFamilyResponsibility",
        description:
          "가족 부양 책임이 큰 상태에서 새로운 선택의 부담까지 동시에 떠안으면 생활 안정성과 관계가 함께 압박받을 수 있다.",
        severity: "high",
        source: "lifeContext",
      });
    }
  
    if (assessment.transitionDifficulty === "high") {
      risks.push({
        key: "lifeContextTransitionDifficulty",
        description:
          buildTransitionDifficultyRiskDescription(
            assessment,
          ),
        severity: "high",
        source: "lifeContext",
      });
    }
  
    if (
      assessment.expansionRisk === "high"
      && !wealthRisksCoverExpansionRisk
    ) {
      risks.push({
        key: "lifeContextExpansionRisk",
        description:
          "현재 책임 위에 사업, 투자 또는 고정비를 추가하면 관리 범위를 넘어서는 동시 확장 위험이 커진다.",
        severity: "high",
        source: "lifeContext",
      });
    }
  
    if (assessment.executionConstraint === "high") {
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

  export function buildRepeatedPatternRisks(
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

  export function buildRisks(
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
          alignment === "stronglyConflicted"
            ? "high"
            : "medium",
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

  export type DecisionRiskBuilderInput = {
    decisionInput:
      DecisionEngineInput;
  
    alignment:
      DecisionResult["contextAlignment"];
  
    urgency:
      DecisionEngineInput["question"]["urgency"];
  
    lifeAssessment:
      LifeContextAssessment;
  
    compatibilityAssessment:
      CompatibilityAssessment;
  };
  
  export function buildDecisionRisks(
    params:
      DecisionRiskBuilderInput,
  ): DecisionRisk[] {
    const {
      decisionInput,
      alignment,
      urgency,
      lifeAssessment,
      compatibilityAssessment,
    } = params;
  
    return [
      ...buildRisks(
        alignment,
        urgency,
      ),

      ...buildQuestionRealityRisks(
        lifeAssessment,
      ),

      ...buildLifeContextRisks(
        lifeAssessment,
      ),
  
      ...buildCompatibilityRisks(
        compatibilityAssessment,
      ),
  
      ...buildRepeatedPatternRisks(
        decisionInput,
      ),
    ];
  }
  
  export type ReaderAwareDecisionRiskBuilderInput =
    DecisionRiskBuilderInput & {
      readerAssessment:
        ReaderDecisionAssessment;
    };
  
  export function buildReaderAwareDecisionRisks(
    input:
      ReaderAwareDecisionRiskBuilderInput,
  ): DecisionRisk[] {
    return [
      ...buildDecisionRisks(
        input,
      ),
  
      ...buildReaderDecisionRisks(
        input.readerAssessment,
      ),
    ];
  }