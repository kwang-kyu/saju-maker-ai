import type {
    DecisionVerdict,
  } from "./decisionTypes";
  
  import type {
    VerdictContext,
  } from "./verdictContextBuilder";

  import type {
    QuestionRealitySignal,
  } from "../question/questionContext";
  
  export type DirectionJudgement = {
    recommendedDirection: string;
    prohibitedDirection: string;
  };
  
  export type DirectionJudgementBuilderInput = {
    verdict: DecisionVerdict;
    context: VerdictContext;
  };

  function buildWealthRecommendedOpening(
    verdict: DecisionVerdict,
  ): string {
    switch (verdict) {
      case "recommended":
        return "현재 선택은 실행하되";

      case "conditionallyRecommended":
        return "현재 선택은 조건을 갖춘 뒤 제한적으로 진행하며";
      case "wait":
        return "현재는 실행을 유보하고 재검토할 때";
      case "notRecommended":
        return "현재 선택은 진행하지 않고 다른 대안을 검토할 때";
      case "insufficientEvidence":
        return "현재 정보로 실행을 확정하지 말고 추가 확인 과정에서";
    }
  }
  function buildWealthRealityDirection(
    verdict: DecisionVerdict,
    assessment:
      VerdictContext["lifeAssessment"],
  ): DirectionJudgement | null {
    const signals =
      new Set(
        assessment.questionConstraints
          .map(
            (constraint) =>
              constraint.signal,
          ),
      );
    const wealthSignals:
      readonly QuestionRealitySignal[] = [
        "essentialFundsExposure",
        "liquidityConstraint",
        "assetConcentration",
      ];
    const hasWealthReality =
      wealthSignals.some(
        (signal) =>
          signals.has(signal),
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
    if (
      !hasWealthReality
      || hasExistingFinancialReality
    ) {
      return null;
    }
    const recommendedParts:
      string[] = [];
    const prohibitedParts:
      string[] = [];
    if (
      signals.has(
        "essentialFundsExposure",
      )
    ) {
      recommendedParts.push(
        "필수자금 보호 범위 안에서만 대안을 검토한다",
      );
      prohibitedParts.push(
        "필수자금 직접 투입은 하지 않는다",
      );
    }
    if (
      signals.has(
        "liquidityConstraint",
      )
    ) {
      recommendedParts.push(
        "환금성 우선 범위에서 회수 가능한 선택부터 검토한다",
      );
      prohibitedParts.push(
        "회수 경로가 불분명한 상품·자산에는 자금을 넣지 않는다",
      );
    }
    if (
      signals.has(
        "assetConcentration",
      )
    ) {
      recommendedParts.push(
        "자산별 분산 범위로 나누어 작은 단위부터 검토한다",
      );
      prohibitedParts.push(
        "단일 종목·단일 자산 집중 방식으로 진행하지 않는다",
      );
    }
    return {
      recommendedDirection: [
        buildWealthRecommendedOpening(
          verdict,
        ),
        ...recommendedParts,
      ].join(", "),
      prohibitedDirection:
        prohibitedParts.join(", "),
    };
  }
  
  function buildExpansionRiskDirection(
    verdict: DecisionVerdict,
  ): DirectionJudgement {
    switch (verdict) {
      case "recommended":
        return {
          recommendedDirection:
            "현재 선택은 실행하되, 규모를 제한하고 작은 단위에서 검증한 뒤 단계적으로 확장한다.",
          prohibitedDirection:
            "초기 검증 없이 대출·고정비·인력·운영 규모를 한꺼번에 확대하지 않는다.",
        };
  
      case "conditionallyRecommended":
        return {
          recommendedDirection:
            "확장 위험을 통제할 수 있는 기준을 먼저 마련하고, 손실 범위가 제한된 방식으로 시작한다.",
          prohibitedDirection:
            "필수 조건을 갖추지 않은 상태에서 자금과 운영 규모를 먼저 늘리지 않는다.",
        };
  
      case "wait":
        return {
          recommendedDirection:
            "현재 부담을 줄이고 확장 위험이 낮아질 때까지 기존 기반을 유지하며 준비한다.",
          prohibitedDirection:
            "조급함을 이유로 새로운 고정비나 장기적인 재정 부담을 추가하지 않는다.",
        };
  
      case "notRecommended":
        return {
          recommendedDirection:
            "현재 선택의 규모를 축소하거나 기존 기반을 지키는 다른 방향으로 전환한다.",
          prohibitedDirection:
            "현재 감당 범위를 넘는 투자와 확장을 억지로 추진하지 않는다.",
        };
  
      case "insufficientEvidence":
        return {
          recommendedDirection:
            "필요 자금과 손실 가능 범위를 구체화한 뒤 감당 가능한 규모를 다시 판단한다.",
          prohibitedDirection:
            "확장 위험을 확인하지 않은 상태에서 계약이나 자금 집행을 확정하지 않는다.",
        };
    }
  }
  
  function buildFinancialPressureDirection(
    verdict: DecisionVerdict,
  ): DirectionJudgement {
    switch (verdict) {
      case "recommended":
        return {
          recommendedDirection:
            "현재 수입 기반을 유지하면서 추가 지출을 제한하고 현금흐름이 끊기지 않는 방식으로 실행한다.",
          prohibitedDirection:
            "생활자금과 실행자금을 구분하지 않은 채 보유 자금을 한 번에 투입하지 않는다.",
        };
  
      case "conditionallyRecommended":
        return {
          recommendedDirection:
            "생활비와 비상자금을 먼저 확보하고, 남는 범위 안에서 제한적으로 진행한다.",
          prohibitedDirection:
            "재정 안전장치 없이 대출이나 고정비를 먼저 발생시키지 않는다.",
        };
  
      case "wait":
        return {
          recommendedDirection:
            "재정 압박을 먼저 낮추고 안정적인 현금흐름을 확보한 뒤 실행 여부를 다시 판단한다.",
          prohibitedDirection:
            "현재 재정 부담을 새로운 투자나 차입으로 해결하려 하지 않는다.",
        };
  
      case "notRecommended":
        return {
          recommendedDirection:
            "현재는 자금 보전과 지출 구조 정리를 우선하고 새로운 선택은 축소하거나 중단한다.",
          prohibitedDirection:
            "손실을 만회하려는 목적으로 추가 자금을 투입하지 않는다.",
        };
  
      case "insufficientEvidence":
        return {
          recommendedDirection:
            "현재 수입·고정비·부채·가용자금을 먼저 확인한 뒤 실행 가능 범위를 정한다.",
          prohibitedDirection:
            "실제 현금흐름을 확인하지 않은 상태에서 비용이 발생하는 결정을 확정하지 않는다.",
        };
    }
  }
  
  function buildTransitionDifficultyDirection(
    verdict: DecisionVerdict,
  ): DirectionJudgement {
    switch (verdict) {
      case "recommended":
        return {
          recommendedDirection:
            "기존 역할과 수입 기반을 유지하면서 새로운 방향으로 단계적으로 전환한다.",
          prohibitedDirection:
            "기존 기반을 먼저 끊고 새로운 선택에 전부 의존하는 방식으로 전환하지 않는다.",
        };
  
      case "conditionallyRecommended":
        return {
          recommendedDirection:
            "전환 기간과 대체 수입원을 먼저 확보한 뒤 두 단계 이상으로 나누어 이동한다.",
          prohibitedDirection:
            "준비 기간 없이 직업·사업·생활 기반을 동시에 변경하지 않는다.",
        };
  
      case "wait":
        return {
          recommendedDirection:
            "현재 기반을 유지하며 전환에 필요한 자금·시간·역할 정리를 먼저 완료한다.",
          prohibitedDirection:
            "불안이나 피로를 벗어나기 위해 기존 기반을 충동적으로 포기하지 않는다.",
        };
  
      case "notRecommended":
        return {
          recommendedDirection:
            "전면적인 전환 대신 현재 구조 안에서 조정할 수 있는 대안을 먼저 찾는다.",
          prohibitedDirection:
            "현실적인 이행 경로가 없는 상태에서 전면 전환을 추진하지 않는다.",
        };
  
      case "insufficientEvidence":
        return {
          recommendedDirection:
            "기존 역할을 종료할 시점과 새로운 기반이 작동할 시점을 구체화한 뒤 판단한다.",
          prohibitedDirection:
            "전환 공백에 대한 대비 없이 현재 기반을 먼저 정리하지 않는다.",
        };
    }
  }
  
  function buildExecutionConstraintDirection(
    verdict: DecisionVerdict,
  ): DirectionJudgement {
    switch (verdict) {
      case "recommended":
        return {
          recommendedDirection:
            "현재 사용할 수 있는 시간과 역할 범위 안에서 핵심 과제부터 작게 실행한다.",
          prohibitedDirection:
            "여러 과제를 동시에 시작하거나 모든 책임을 혼자 맡지 않는다.",
        };
  
      case "conditionallyRecommended":
        return {
          recommendedDirection:
            "실행 범위와 책임자를 먼저 정하고 감당 가능한 일정으로 제한하여 진행한다.",
          prohibitedDirection:
            "시간과 역할을 확보하지 않은 상태에서 실행 항목을 계속 늘리지 않는다.",
        };
  
      case "wait":
        return {
          recommendedDirection:
            "현재 책임을 정리하고 실제 실행 시간을 확보한 뒤 다시 시작한다.",
          prohibitedDirection:
            "실행 여력이 없는 상태에서 의지만으로 일정을 밀어붙이지 않는다.",
        };
  
      case "notRecommended":
        return {
          recommendedDirection:
            "새로운 실행보다 현재 책임과 진행 중인 일을 먼저 정리한다.",
          prohibitedDirection:
            "감당할 수 없는 역할을 추가로 떠안지 않는다.",
        };
  
      case "insufficientEvidence":
        return {
          recommendedDirection:
            "실제로 투입할 수 있는 시간과 담당 역할을 먼저 확정한 뒤 판단한다.",
          prohibitedDirection:
            "실행 주체와 일정이 불분명한 상태에서 결정을 확정하지 않는다.",
        };
    }
  }
  
  function buildFamilyResponsibilityDirection(
    verdict: DecisionVerdict,
  ): DirectionJudgement {
    switch (verdict) {
      case "recommended":
        return {
          recommendedDirection:
            "가족 책임과 생활 유지 조건을 보호하면서 실행 범위와 일정을 조정한다.",
          prohibitedDirection:
            "가족의 생활 안정과 돌봄 책임을 훼손하는 방식으로 추진하지 않는다.",
        };
  
      case "conditionallyRecommended":
        return {
          recommendedDirection:
            "가족과 역할·비용·시간 부담을 먼저 조정한 뒤 제한된 범위에서 진행한다.",
          prohibitedDirection:
            "가족 책임에 대한 합의 없이 장기간의 소득 공백이나 생활 변화를 만들지 않는다.",
        };
  
      case "wait":
        return {
          recommendedDirection:
            "가족 부담을 나누고 생활 유지 기준을 확보할 때까지 준비를 우선한다.",
          prohibitedDirection:
            "현재 책임을 방치하거나 가족에게 부담을 일방적으로 이전하지 않는다.",
        };
  
      case "notRecommended":
        return {
          recommendedDirection:
            "현재는 가족과 생활 기반을 지키는 선택을 우선하고 새로운 방향은 축소한다.",
          prohibitedDirection:
            "가족 책임과 직접 충돌하는 선택을 억지로 추진하지 않는다.",
        };
  
      case "insufficientEvidence":
        return {
          recommendedDirection:
            "가족이 부담하게 될 시간·비용·역할 변화를 먼저 확인한 뒤 판단한다.",
          prohibitedDirection:
            "가족에게 미칠 영향을 확인하지 않은 상태에서 결정을 확정하지 않는다.",
        };
    }
  }
  
  function buildVerdictDirection(
    verdict: DecisionVerdict,
  ): DirectionJudgement {
    switch (verdict) {
      case "recommended":
        return {
          recommendedDirection:
            "현재 국면의 흐름을 활용해 실행하되, 반복되는 실패 패턴을 막을 기준을 세워 진행한다.",
          prohibitedDirection:
            "근거 없이 규모를 확대하거나 준비되지 않은 상태에서 속도를 높이지 않는다.",
        };
  
      case "conditionallyRecommended":
        return {
          recommendedDirection:
            "필수 조건과 위험 관리 기준을 먼저 갖춘 뒤 제한적으로 진행한다.",
          prohibitedDirection:
            "필수 조건을 충족하지 않은 채 바로 실행하지 않는다.",
        };
  
      case "wait":
        return {
          recommendedDirection:
            "현재 충돌 요소를 정리하고 준비가 완료될 때까지 판단을 유보한다.",
          prohibitedDirection:
            "불안과 조급함만으로 결정을 밀어붙이지 않는다.",
        };
  
      case "notRecommended":
        return {
          recommendedDirection:
            "현재 선택을 중단하고 사람의 본질과 현재 국면에 맞는 다른 방향을 찾는다.",
          prohibitedDirection:
            "현재 사람의 구조와 국면에 충돌하는 선택을 억지로 추진하지 않는다.",
        };
  
      case "insufficientEvidence":
        return {
          recommendedDirection:
            "결정 대상과 시기 및 실행 조건을 구체화한 뒤 다시 판단한다.",
          prohibitedDirection:
            "판단 근거가 부족한 상태에서 확정적인 결정을 내리지 않는다.",
        };
    }
  }
  
  export function buildDirectionJudgement(
    input: DirectionJudgementBuilderInput,
  ): DirectionJudgement {
    const {
      verdict,
      context,
    } = input;
  
    const {
      lifeAssessment,
    } = context;

    const wealthRealityDirection =
      buildWealthRealityDirection(
        verdict,
        lifeAssessment,
      );

    if (
      wealthRealityDirection
      !== null
    ) {
      return wealthRealityDirection;
    }

    if (lifeAssessment.expansionRisk === "high") {
      return buildExpansionRiskDirection(verdict);
    }
  
    if (lifeAssessment.financialPressure === "high") {
      return buildFinancialPressureDirection(verdict);
    }
  
    if (lifeAssessment.transitionDifficulty === "high") {
      return buildTransitionDifficultyDirection(verdict);
    }
  
    if (lifeAssessment.executionConstraint === "high") {
      return buildExecutionConstraintDirection(verdict);
    }
  
    if (lifeAssessment.familyResponsibility === "high") {
      return buildFamilyResponsibilityDirection(verdict);
    }
  
    return buildVerdictDirection(verdict);
  }