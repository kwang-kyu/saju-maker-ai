import type {
    DecisionEngineInput,
    DecisionResult,
    DecisionRisk,
  } from "./decisionTypes";
  import type { LifeContextAssessment } from "./lifeContextAssessment";
  export function buildLifeContextRisks(
    assessment: LifeContextAssessment,
  ): DecisionRisk[] {
    const risks: DecisionRisk[] = [];
  
    if (assessment.financialPressure === "high") {
      risks.push({
        key: "lifeContextFinancialPressure",
        description:
          "현재 재정 책임이 큰 상태이므로 예상보다 수익 발생이 늦어질 경우 기존 생활 기반과 현금흐름이 함께 흔들릴 수 있다.",
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
          "기존 직업이나 수입 기반을 한 번에 정리하면 새로운 선택이 자리 잡기 전에 회복하기 어려운 공백이 생길 수 있다.",
        severity: "high",
        source: "lifeContext",
      });
    }
  
    if (assessment.expansionRisk === "high") {
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

  export function buildDecisionRisks(params: {
    decisionInput: DecisionEngineInput;
    alignment: DecisionResult["contextAlignment"];
    urgency: DecisionEngineInput["question"]["urgency"];
    lifeAssessment: LifeContextAssessment;
  }): DecisionRisk[] {
    const {
      decisionInput,
      alignment,
      urgency,
      lifeAssessment,
    } = params;
  
    return [
      ...buildRisks(
        alignment,
        urgency,
      ),
      ...buildLifeContextRisks(
        lifeAssessment,
      ),
      ...buildRepeatedPatternRisks(
        decisionInput,
      ),
    ];
  }