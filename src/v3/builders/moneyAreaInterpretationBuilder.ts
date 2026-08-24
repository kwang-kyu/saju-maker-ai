import type {
    MoneyArea,
    MoneyAreaInterpretation,
    MoneyLevel,
  } from "../masterReader/types/money.js";
  import type {
    MoneyAreaSelection,
  } from "../masterReader/readers/moneySelector.js";
  
  type MoneyAreaDefinition = {
    corePattern: Record<MoneyLevel, string>;
  
    strengthExpression: Record<MoneyLevel, string>;
  
    limitationPattern: Record<MoneyLevel, string>;
  
    defaultSuitableConditions: string[];
  
    defaultCautionConditions: string[];
  };
  
  const MONEY_AREA_DEFINITIONS: Record<
    MoneyArea,
    MoneyAreaDefinition
  > = {
    generation: {
      corePattern: {
        limited:
          "수입 기회를 실제 재물로 완성하는 과정에서 외부 부담과 자원 소모의 영향을 크게 받는 구조이다.",
  
        moderate:
          "자신의 역할과 수익 경로가 명확할 때 활동과 성과를 안정적인 수입으로 연결하는 구조이다.",
  
        strong:
          "생산·성과·기회를 여러 수입 경로로 연결할 수 있는 재물 생성 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "수입 경로가 단순하고 투입해야 할 책임이 제한될수록 재물 생성력이 안정적으로 드러난다.",
  
        moderate:
          "역할과 보상 기준이 분명할 때 활동 결과를 꾸준히 수입으로 연결하는 힘이 발휘된다.",
  
        strong:
          "새로운 기회와 성과를 발견하고 이를 실제 수익 구조로 전환하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "여러 수입 기회를 동시에 좇거나 선투입 부담이 커지면 성과가 수입으로 완성되기 전에 자원이 소진될 수 있다.",
  
        moderate:
          "수익 기준이 불명확하거나 역할이 계속 확대되면 활동량에 비해 실제 남는 수입이 줄어들 수 있다.",
  
        strong:
          "기회를 만드는 힘을 과신하여 수익성이 검증되지 않은 영역까지 확장하면 투입 비용이 빠르게 증가할 수 있다.",
      },
  
      defaultSuitableConditions: [
        "역할과 보상 기준이 명확한 수입 구조",
        "성과를 실제 수익으로 연결하는 과정이 확인 가능한 환경",
        "투입 비용과 기대 수입을 구분하여 관리하는 조건",
      ],
  
      defaultCautionConditions: [
        "수익 검증 없이 여러 기회를 동시에 추진하는 경우",
        "활동량은 증가하지만 보상 기준이 불명확한 경우",
        "수입이 발생하기 전에 고정비와 선투입 비용이 확대되는 경우",
      ],
    },
  
    repeatability: {
      corePattern: {
        limited:
          "한 번의 성과를 같은 수준의 수입으로 반복하는 과정에서 환경 변화와 힘의 소모를 크게 받는 구조이다.",
  
        moderate:
          "일정한 방식과 운영 조건이 갖춰질 때 수입을 반복적으로 유지하는 구조이다.",
  
        strong:
          "일회성 성과를 반복 가능한 수익 체계로 전환하고 장기간 유지하는 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "수익 방식이 단순하고 반복 주기가 짧을수록 성과를 다시 만들어내는 힘이 안정적으로 드러난다.",
  
        moderate:
          "업무 방식과 고객·수요 흐름이 정리되어 있을 때 수입의 반복성이 발휘된다.",
  
        strong:
          "성과를 표준화하고 같은 수익 구조를 여러 차례 재현하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "환경이나 수요가 달라지면 기존 성과 방식을 그대로 반복하기 어려울 수 있다.",
  
        moderate:
          "운영 기준이 자주 바뀌거나 회복 없이 성과를 반복하면 수입 유지력이 약해질 수 있다.",
  
        strong:
          "기존 수익 방식의 반복 가능성을 과신하면 시장과 환경 변화에 대한 대응이 늦어질 수 있다.",
      },
  
      defaultSuitableConditions: [
        "성과 과정을 반복 가능한 단계로 정리할 수 있는 구조",
        "수입의 발생 주기와 유지 비용을 확인할 수 있는 환경",
        "성과 이후 점검과 재정비가 가능한 조건",
      ],
  
      defaultCautionConditions: [
        "한 번의 성공을 장기 수익으로 단정하는 경우",
        "수요 변화 없이 같은 수익이 계속될 것으로 가정하는 경우",
        "회복과 점검 없이 성과 활동을 반복하는 경우",
      ],
    },
  
    retention: {
      corePattern: {
        limited:
          "수입이 발생해도 외부 책임과 비용의 영향을 크게 받아 재물을 보유하는 힘이 약해질 수 있는 구조이다.",
  
        moderate:
          "지출 기준과 보유 목적이 명확할 때 들어온 재물을 안정적으로 지키는 구조이다.",
  
        strong:
          "수입과 지출을 통제하며 재물을 장기간 보유하고 축적하는 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "비용 구조가 단순하고 지출 한도가 분명할수록 재물을 지키는 힘이 안정적으로 드러난다.",
  
        moderate:
          "생활비·사업비·투자금을 구분할 때 수입을 보유하고 축적하는 힘이 발휘된다.",
  
        strong:
          "수입이 늘어나도 지출과 확장 속도를 통제하며 재물 기반을 유지하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "타인의 책임과 예상하지 못한 비용이 겹치면 수입이 빠르게 외부로 빠져나갈 수 있다.",
  
        moderate:
          "지출 목적이 섞이거나 수입 증가에 맞춰 비용도 함께 늘어나면 축적 속도가 둔화될 수 있다.",
  
        strong:
          "보유 능력을 과신하여 책임과 지출 범위를 계속 확대하면 누수 규모도 함께 커질 수 있다.",
      },
  
      defaultSuitableConditions: [
        "생활비·사업비·투자금이 구분된 자금 구조",
        "지출 한도와 보유 목표가 정해진 환경",
        "수입 증가보다 비용 확대를 늦게 조정하는 조건",
      ],
  
      defaultCautionConditions: [
        "타인의 금전 책임을 반복해서 대신 부담하는 경우",
        "수입과 지출 목적이 하나의 계정에 혼합되는 경우",
        "수입 증가와 동시에 고정비와 생활 수준을 확대하는 경우",
      ],
    },
  
    assetConversion: {
      corePattern: {
        limited:
          "발생한 수입을 장기 보유 자산으로 고정하는 과정에서 소비와 단기 자금 수요의 영향을 크게 받는 구조이다.",
  
        moderate:
          "보유 기간과 자산화 기준이 명확할 때 반복 수입을 축적 자산으로 전환하는 구조이다.",
  
        strong:
          "현금과 반복 수익을 장기 자산으로 전환하고 유지하는 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "전환 대상과 금액이 단순하고 중도 사용 가능성이 낮을수록 자산화 능력이 안정적으로 드러난다.",
  
        moderate:
          "현금 보유분과 장기 자산 전환분을 구분할 때 축적 능력이 발휘된다.",
  
        strong:
          "반복 수입을 소비로 소진하지 않고 장기 보유 자산으로 이동시키는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "단기 자금 수요가 반복되면 자산을 만들기 전에 현금이 소진되거나 이미 만든 자산을 처분할 수 있다.",
  
        moderate:
          "유동성과 자산화 비율을 구분하지 않으면 필요한 현금이 부족해져 장기 자산을 중도 정리할 수 있다.",
  
        strong:
          "자산 확대 속도를 과신하여 현금 여유 없이 장기 자산에 집중하면 유동성 부담이 커질 수 있다.",
      },
  
      defaultSuitableConditions: [
        "비상자금과 장기 자산 전환 자금이 구분된 구조",
        "자산의 보유 목적과 기간이 명확한 환경",
        "반복 수익의 일정 비율을 단계적으로 자산화하는 조건",
      ],
  
      defaultCautionConditions: [
        "생활자금과 자산 전환 자금을 함께 사용하는 경우",
        "현금 여유 없이 장기 자산 비중을 확대하는 경우",
        "보유 목적과 기간 없이 수익만 보고 자산을 선택하는 경우",
      ],
    },
  
    cashflowManagement: {
      corePattern: {
        limited:
          "수입과 지출 흐름이 복잡해질수록 자금의 우선순위와 유동성 관리가 흔들릴 수 있는 구조이다.",
  
        moderate:
          "자금별 목적과 이동 기준이 명확할 때 여러 현금흐름을 안정적으로 관리하는 구조이다.",
  
        strong:
          "복수의 수입과 지출 흐름을 구분하고 통합적으로 관리하는 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "수입원과 지출 항목이 단순할수록 현금의 흐름을 정확히 파악하는 힘이 안정적으로 드러난다.",
  
        moderate:
          "자금별 계정과 사용 기준이 정리되어 있을 때 현금흐름 관리력이 발휘된다.",
  
        strong:
          "여러 자금 흐름에서도 우선순위와 유동성 기준을 유지하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "수입원이 불규칙하거나 여러 비용이 동시에 발생하면 필요한 현금 규모를 놓칠 수 있다.",
  
        moderate:
          "개인 자금과 사업 자금 또는 여러 사람의 자금이 섞이면 관리 정확도가 떨어질 수 있다.",
  
        strong:
          "복잡한 자금 흐름을 감당할 수 있다는 이유로 관리 범위를 계속 확대하면 작은 누수를 늦게 발견할 수 있다.",
      },
  
      defaultSuitableConditions: [
        "수입원과 지출 목적별 계정이 구분된 구조",
        "정기적으로 유동성과 고정비를 점검하는 환경",
        "자금 이동의 기준과 기록이 유지되는 조건",
      ],
  
      defaultCautionConditions: [
        "개인 자금과 사업 자금이 혼합되는 경우",
        "여러 사람의 자금을 하나의 기준 없이 관리하는 경우",
        "수입 규모만 확인하고 지급 시기와 고정비를 놓치는 경우",
      ],
    },
  
    debtHandling: {
      corePattern: {
        limited:
          "부채와 고정비가 늘어날수록 선택 범위와 회복 자원이 빠르게 줄어드는 구조이다.",
  
        moderate:
          "상환 규모와 종료 기준이 명확할 때 일정 범위의 부채 부담을 관리하는 구조이다.",
  
        strong:
          "지속적인 상환 압력과 고정비를 구조적으로 관리할 수 있는 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "상환 기간이 짧고 부채 규모가 제한될수록 의무를 안정적으로 관리하는 힘이 드러난다.",
  
        moderate:
          "상환 재원과 고정비 한도가 정해져 있을 때 부채 관리력이 발휘된다.",
  
        strong:
          "장기적인 상환 의무 속에서도 현금흐름과 자원 배분 기준을 유지하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "수입이 흔들리거나 추가 고정비가 발생하면 상환 부담이 생활과 활동 기반을 직접 압박할 수 있다.",
  
        moderate:
          "상환 재원이 불명확하거나 여러 부채가 동시에 겹치면 관리 여력이 빠르게 줄어들 수 있다.",
  
        strong:
          "부채 감당력을 과신하여 여러 의무를 동시에 확대하면 회복 가능한 범위를 넘어설 수 있다.",
      },
  
      defaultSuitableConditions: [
        "상환 재원과 종료 시점이 명확한 부채 구조",
        "수입 감소를 반영한 상환 여유가 확보된 환경",
        "부채와 고정비의 총한도가 정해진 조건",
      ],
  
      defaultCautionConditions: [
        "상환 재원이 아직 발생하지 않은 기대 수입에 의존하는 경우",
        "여러 부채와 고정비가 동시에 증가하는 경우",
        "기존 부채가 정리되기 전에 새로운 의무를 추가하는 경우",
      ],
    },
  
    volatilityResponse: {
      corePattern: {
        limited:
          "수익과 자산 가치의 변동이 커질수록 판단 기준과 자원 배분이 쉽게 흔들릴 수 있는 구조이다.",
  
        moderate:
          "손실 한도와 대응 기준이 정해져 있을 때 일정 수준의 변동성을 견디는 구조이다.",
  
        strong:
          "수익 변동과 시장 충격 속에서도 판단과 자원 배분 기준을 유지하는 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "변동 범위가 제한되고 즉시 조정할 수 있을 때 신중한 대응력이 안정적으로 드러난다.",
  
        moderate:
          "사전 대응 기준과 손실 한도가 있을 때 변동성 관리 능력이 발휘된다.",
  
        strong:
          "예상하지 못한 변동 속에서도 감정적 반응을 줄이고 기존 기준을 유지하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "가격과 수익이 빠르게 움직이면 불안과 압박으로 인해 기준 없는 정리나 추가 투입이 나타날 수 있다.",
  
        moderate:
          "여러 변동 요인이 동시에 발생하거나 대응 시간이 부족하면 판단이 흔들릴 수 있다.",
  
        strong:
          "변동성을 견딜 수 있다는 이유로 손실 한도 없이 위험 규모를 확대하면 충격도 함께 커질 수 있다.",
      },
  
      defaultSuitableConditions: [
        "손실 한도와 중단 기준이 사전에 정해진 환경",
        "변동 자산과 안정 자금이 구분된 구조",
        "감정과 무관하게 점검 기준을 적용할 수 있는 조건",
      ],
  
      defaultCautionConditions: [
        "손실 한도 없이 변동 자산의 규모를 확대하는 경우",
        "가격 변화에 따라 계획 없이 추가 투입하거나 정리하는 경우",
        "여러 변동 위험이 동시에 한 자금에 집중되는 경우",
      ],
    },
  
    lossRecovery: {
      corePattern: {
        limited:
          "재정적 손실이 발생하면 수입과 생활 기반을 원래 수준으로 회복하는 데 긴 시간이 필요한 구조이다.",
  
        moderate:
          "손실 범위를 통제하고 재건 순서를 정할 때 재물 기반을 단계적으로 복구하는 구조이다.",
  
        strong:
          "손실 이후에도 남은 자원을 재구성하여 수입과 자산 기반을 다시 세우는 힘이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "손실 규모가 제한되고 즉시 정리할 수 있을 때 남은 자원을 지키는 힘이 안정적으로 드러난다.",
  
        moderate:
          "손실 원인을 구분하고 재건 순서를 세울 때 회복력이 발휘된다.",
  
        strong:
          "손실 이후에도 판단 방향을 유지하며 새로운 수입과 축적 구조를 만드는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "손실을 만회하기 위해 새로운 위험을 급하게 부담하면 남은 기반까지 함께 약해질 수 있다.",
  
        moderate:
          "손실 원인을 정리하기 전에 기존 규모를 회복하려 하면 재건 기간이 길어질 수 있다.",
  
        strong:
          "과거의 회복 경험을 과신하여 반복적으로 큰 손실을 감수하면 내부 자원이 누적 소모될 수 있다.",
      },
  
      defaultSuitableConditions: [
        "손실 원인과 남은 자원을 먼저 분리하여 확인하는 환경",
        "생활 기반을 보존한 뒤 단계적으로 재건하는 구조",
        "회복 전 새로운 위험의 규모를 제한하는 조건",
      ],
  
      defaultCautionConditions: [
        "손실을 단기간에 만회하려고 위험을 확대하는 경우",
        "손실 원인을 정리하지 않고 같은 방식을 반복하는 경우",
        "생활 자금과 회복 자금을 동시에 위험에 노출하는 경우",
      ],
    },
  };
  
  function normalizeText(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function uniqueTexts(
    values: string[],
  ): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
  
    for (const value of values) {
      const normalized = normalizeText(value);
  
      if (
        !normalized
        || seen.has(normalized)
      ) {
        continue;
      }
  
      seen.add(normalized);
      result.push(normalized);
    }
  
    return result;
  }
  
  function collectSuitableConditions(
    selection: MoneyAreaSelection,
    definition: MoneyAreaDefinition,
  ): string[] {
    const evidenceConditions =
      selection.supportingMatches.flatMap(
        (match) => match.evidence.conditions,
      );
  
    return uniqueTexts([
      ...evidenceConditions,
      ...definition.defaultSuitableConditions,
    ]);
  }
  
  function collectCautionConditions(
    selection: MoneyAreaSelection,
    definition: MoneyAreaDefinition,
  ): string[] {
    const evidenceConditions =
      selection.limitingMatches.flatMap(
        (match) => [
          ...match.evidence.conditions,
          ...match.evidence.exceptions,
        ],
      );
  
    return uniqueTexts([
      ...evidenceConditions,
      ...definition.defaultCautionConditions,
    ]);
  }
  
  export function buildMoneyAreaInterpretation(
    selection: MoneyAreaSelection,
  ): MoneyAreaInterpretation | null {
    if (
      selection.status === "insufficient"
      || selection.level === null
    ) {
      return null;
    }
  
    const definition =
      MONEY_AREA_DEFINITIONS[selection.area];
  
    const level = selection.level;
  
    return {
      corePattern:
        definition.corePattern[level],
  
      strengthExpression:
        definition.strengthExpression[level],
  
      limitationPattern:
        definition.limitationPattern[level],
  
      suitableConditions:
        collectSuitableConditions(
          selection,
          definition,
        ),
  
      cautionConditions:
        collectCautionConditions(
          selection,
          definition,
        ),
    };
  }