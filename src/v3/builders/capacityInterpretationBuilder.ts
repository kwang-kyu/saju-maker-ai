import type {
    CapacityArea,
    CapacityInterpretation,
    CapacityLevel,
  } from "../masterReader/types/capacity.js";
  import type {
    CapacityAreaSelection,
  } from "../masterReader/readers/capacitySelector.js";
  
  type CapacityAreaDefinition = {
    corePattern: Record<CapacityLevel, string>;
  
    manageableScope: Record<CapacityLevel, string>;
  
    strengthExpression: Record<CapacityLevel, string>;
  
    limitationPattern: Record<CapacityLevel, string>;
  
    defaultOverloadConditions: string[];
  
    defaultSuitableConditions: string[];
  };
  
  const CAPACITY_AREA_DEFINITIONS: Record<
    CapacityArea,
    CapacityAreaDefinition
  > = {
    responsibility: {
      corePattern: {
        limited:
          "책임을 맡는 힘보다 누적된 요구와 부담의 영향을 더 크게 받는 구조이다.",
  
        moderate:
          "책임 범위와 유지 조건이 명확할 때 맡은 역할을 안정적으로 감당하는 구조이다.",
  
        strong:
          "여러 책임을 동시에 조율하고 장기간 유지할 수 있는 내부 기반이 강한 구조이다.",
      },
  
      manageableScope: {
        limited:
          "역할과 책임의 경계가 분명하고, 한 번에 하나의 핵심 과제를 맡는 범위가 적절하다.",
  
        moderate:
          "우선순위가 정리된 복수의 책임과 일정 수준의 관리 역할까지 감당할 수 있다.",
  
        strong:
          "여러 역할과 장기 책임을 통합적으로 관리하는 범위까지 감당할 수 있다.",
      },
  
      strengthExpression: {
        limited:
          "책임이 작고 구체적일수록 집중력과 성실성이 안정적으로 드러난다.",
  
        moderate:
          "역할과 기준이 명확할 때 책임감과 관리 능력이 꾸준히 발휘된다.",
  
        strong:
          "복합적인 역할과 장기 과제에서도 중심을 유지하며 책임을 지속하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "책임이 겹치거나 타인의 요구까지 함께 떠맡으면 빠르게 과부하될 수 있다.",
  
        moderate:
          "역할 범위가 계속 확대되거나 책임의 종료 시점이 불분명하면 피로가 누적될 수 있다.",
  
        strong:
          "감당할 수 있다는 이유로 책임을 과도하게 집중시키면 회복 시기를 놓칠 수 있다.",
      },
  
      defaultOverloadConditions: [
        "역할과 책임이 동시에 여러 방향으로 확대되는 경우",
        "책임의 범위와 종료 기준이 불분명한 경우",
        "타인의 몫까지 지속해서 대신 부담하는 경우",
      ],
  
      defaultSuitableConditions: [
        "책임 범위와 우선순위가 명확한 환경",
        "역할별 권한과 책임이 함께 주어지는 환경",
        "일정한 회복 시간과 업무 조정이 가능한 환경",
      ],
    },
  
    money: {
      corePattern: {
        limited:
          "금전과 자원의 규모가 커질수록 관리 부담과 변동 압력을 크게 받는 구조이다.",
  
        moderate:
          "현금흐름과 책임 범위가 명확할 때 금전과 자원을 안정적으로 관리하는 구조이다.",
  
        strong:
          "복수의 자원 흐름과 큰 금액의 책임을 구조적으로 관리할 수 있는 기반이 강한 구조이다.",
      },
  
      manageableScope: {
        limited:
          "손실 범위가 제한되고 현금흐름을 직접 확인할 수 있는 규모가 적절하다.",
  
        moderate:
          "수입과 지출 구조가 정리된 자금과 일정 수준의 복수 자원을 관리할 수 있다.",
  
        strong:
          "여러 자금 흐름과 장기적인 자원 배분을 함께 관리하는 범위까지 감당할 수 있다.",
      },
  
      strengthExpression: {
        limited:
          "금액과 책임이 단순할수록 지출 통제와 자원 보존 능력이 안정적으로 드러난다.",
  
        moderate:
          "수입·지출 기준과 관리 체계가 있을 때 금전 감각과 자원 운영 능력이 발휘된다.",
  
        strong:
          "복합적인 현금흐름에서도 자원의 우선순위와 배분 기준을 유지하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "금액이 커지거나 변동성이 높아지면 판단 부담과 손실 압박이 빠르게 증가할 수 있다.",
  
        moderate:
          "현금흐름이 불투명하거나 여러 사람의 자금이 섞이면 관리력이 흔들릴 수 있다.",
  
        strong:
          "관리 가능 범위를 과신하여 자금 규모와 책임을 동시에 확대하면 누수가 커질 수 있다.",
      },
  
      defaultOverloadConditions: [
        "현금흐름을 즉시 확인할 수 없는 경우",
        "여러 사람의 자금과 책임이 혼합되는 경우",
        "손실 한도 없이 자금 규모가 확대되는 경우",
      ],
  
      defaultSuitableConditions: [
        "수입과 지출의 흐름이 투명한 구조",
        "자금별 책임과 사용 목적이 구분된 구조",
        "손실 한도와 관리 기준이 사전에 정해진 환경",
      ],
    },
  
    organization: {
      corePattern: {
        limited:
          "조직의 역할과 이해관계가 복잡해질수록 조율 부담을 크게 받는 구조이다.",
  
        moderate:
          "권한과 역할 체계가 명확할 때 조직 안에서 안정적으로 기능하는 구조이다.",
  
        strong:
          "여러 역할과 조직 관계를 통합적으로 조정하고 유지할 수 있는 기반이 강한 구조이다.",
      },
  
      manageableScope: {
        limited:
          "소규모 조직이나 역할 구분이 단순한 체계가 적절하다.",
  
        moderate:
          "업무 체계와 보고 관계가 정리된 중간 규모의 조직 역할까지 감당할 수 있다.",
  
        strong:
          "복수의 역할과 부서를 조율하는 조직 운영 범위까지 감당할 수 있다.",
      },
  
      strengthExpression: {
        limited:
          "규칙과 역할이 단순할수록 맡은 기능을 정확하게 수행하는 힘이 드러난다.",
  
        moderate:
          "업무 기준과 권한이 정리되어 있을 때 관리와 조율 능력이 안정적으로 발휘된다.",
  
        strong:
          "복잡한 역할 관계에서도 질서와 우선순위를 세우는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "권한 없이 책임만 커지거나 역할 충돌이 발생하면 조직 피로가 빠르게 누적될 수 있다.",
  
        moderate:
          "보고 체계와 의사결정 권한이 불명확하면 조율 능력이 소모될 수 있다.",
  
        strong:
          "조직 전체의 문제를 혼자 통제하려 하면 역할 집중과 피로가 커질 수 있다.",
      },
  
      defaultOverloadConditions: [
        "책임과 권한이 일치하지 않는 경우",
        "보고 체계와 의사결정 기준이 불명확한 경우",
        "역할 충돌을 개인이 반복해서 중재해야 하는 경우",
      ],
  
      defaultSuitableConditions: [
        "역할과 권한이 명확하게 구분된 조직",
        "의사결정과 보고 체계가 정리된 환경",
        "조율 책임이 적절하게 분산되는 구조",
      ],
    },
  
    relationship: {
      corePattern: {
        limited:
          "관계의 요구와 감정 부담이 커질수록 자기 기준과 에너지가 쉽게 소모되는 구조이다.",
  
        moderate:
          "관계의 경계와 역할이 명확할 때 안정적으로 관계를 유지하는 구조이다.",
  
        strong:
          "다양한 사람의 요구와 감정을 조율하면서 관계를 지속할 수 있는 기반이 강한 구조이다.",
      },
  
      manageableScope: {
        limited:
          "관계의 수와 역할이 제한되고 의사소통 기준이 명확한 범위가 적절하다.",
  
        moderate:
          "상호 책임이 분명한 복수의 관계와 협력 구조까지 감당할 수 있다.",
  
        strong:
          "다양한 이해관계와 감정 요구가 존재하는 관계망까지 조율할 수 있다.",
      },
  
      strengthExpression: {
        limited:
          "관계가 단순하고 신뢰 기준이 명확할수록 배려와 성실성이 안정적으로 드러난다.",
  
        moderate:
          "상호 역할과 소통 방식이 정리되어 있을 때 협력과 관계 유지 능력이 발휘된다.",
  
        strong:
          "복잡한 관계에서도 각자의 입장을 이해하고 연결하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "상대의 요구를 장기간 수용하거나 관계 경계가 무너지면 피로와 단절이 나타날 수 있다.",
  
        moderate:
          "상호 책임이 불균형하거나 감정 노동이 누적되면 관계 유지력이 약해질 수 있다.",
  
        strong:
          "관계를 유지하기 위해 모든 갈등을 직접 떠맡으면 자기 소진이 커질 수 있다.",
      },
  
      defaultOverloadConditions: [
        "상대의 요구를 일방적으로 수용하는 경우",
        "관계의 책임과 경계가 불분명한 경우",
        "감정 조율 역할을 장기간 혼자 담당하는 경우",
      ],
  
      defaultSuitableConditions: [
        "상호 역할과 책임이 분명한 관계",
        "의견과 감정을 직접 표현할 수 있는 환경",
        "관계의 경계와 회복 시간이 보장되는 구조",
      ],
    },
  
    risk: {
      corePattern: {
        limited:
          "변동과 손실이 커질수록 회복 자원과 대응력이 빠르게 소모되는 구조이다.",
  
        moderate:
          "손실 범위와 대응 기준이 정해져 있을 때 일정 수준의 위험을 감당하는 구조이다.",
  
        strong:
          "변동과 손실이 발생해도 중심을 유지하고 회복할 수 있는 내부 기반이 강한 구조이다.",
      },
  
      manageableScope: {
        limited:
          "손실 범위가 작고 즉시 중단하거나 조정할 수 있는 위험 수준이 적절하다.",
  
        moderate:
          "위험 한도와 대응 절차가 정해진 변동 범위까지 감당할 수 있다.",
  
        strong:
          "복수의 변동 요인과 일정 규모의 손실 가능성을 함께 관리하는 범위까지 감당할 수 있다.",
      },
  
      strengthExpression: {
        limited:
          "위험이 제한되고 대응 방법이 명확할수록 신중함과 방어력이 안정적으로 드러난다.",
  
        moderate:
          "손실 한도와 대응 기준이 있을 때 변화 적응력과 회복력이 발휘된다.",
  
        strong:
          "예상하지 못한 변화에서도 판단 기준과 회복 방향을 유지하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "손실 한도가 없거나 변동이 연속되면 판단력과 회복력이 빠르게 약해질 수 있다.",
  
        moderate:
          "위험 요인이 동시에 겹치거나 대응 시간이 부족하면 회복이 지연될 수 있다.",
  
        strong:
          "회복 가능성을 과신하여 위험을 반복해서 확대하면 내부 자원이 고갈될 수 있다.",
      },
  
      defaultOverloadConditions: [
        "손실 한도와 중단 기준이 없는 경우",
        "여러 위험 요인이 동시에 발생하는 경우",
        "회복 전에 새로운 위험을 반복해서 부담하는 경우",
      ],
  
      defaultSuitableConditions: [
        "손실 범위와 대응 기준이 정해진 환경",
        "위험을 단계적으로 확인할 수 있는 구조",
        "회복과 재정비 시간을 확보할 수 있는 조건",
      ],
    },
  
    time: {
      corePattern: {
        limited:
          "시간이 길어질수록 집중력과 유지 자원이 빠르게 소모되는 구조이다.",
  
        moderate:
          "일정과 회복 주기가 조절될 때 중장기 과제를 안정적으로 유지하는 구조이다.",
  
        strong:
          "장기간 같은 방향을 유지하며 성과와 기반을 축적할 수 있는 지속력이 강한 구조이다.",
      },
  
      manageableScope: {
        limited:
          "기간이 짧고 종료 시점이 명확한 과제 범위가 적절하다.",
  
        moderate:
          "중간 점검과 회복 구간이 포함된 중장기 일정까지 감당할 수 있다.",
  
        strong:
          "장기적인 축적과 반복 관리가 필요한 시간 범위까지 감당할 수 있다.",
      },
  
      strengthExpression: {
        limited:
          "기간과 목표가 명확할수록 집중력과 실행 유지력이 안정적으로 드러난다.",
  
        moderate:
          "점검 주기와 회복 시간이 있을 때 꾸준함과 지속성이 발휘된다.",
  
        strong:
          "단기 성과가 없어도 방향을 유지하며 장기적으로 축적하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "종료 기준 없이 과제가 길어지면 집중력과 생활 리듬이 빠르게 무너질 수 있다.",
  
        moderate:
          "일정이 연속되거나 회복 구간이 사라지면 장기 유지력이 약해질 수 있다.",
  
        strong:
          "지속력이 있다는 이유로 휴식 없이 장기 과제를 이어가면 소진이 늦게 크게 나타날 수 있다.",
      },
  
      defaultOverloadConditions: [
        "종료 시점 없이 일정이 계속 연장되는 경우",
        "회복 구간 없이 장기 과제가 반복되는 경우",
        "여러 장기 과제를 동시에 유지해야 하는 경우",
      ],
  
      defaultSuitableConditions: [
        "중간 점검과 종료 기준이 명확한 일정",
        "집중과 회복 주기가 반복되는 환경",
        "장기 목표를 단계별로 나눌 수 있는 구조",
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
  
      if (!normalized || seen.has(normalized)) {
        continue;
      }
  
      seen.add(normalized);
      result.push(normalized);
    }
  
    return result;
  }
  
  function collectOverloadConditions(
    selection: CapacityAreaSelection,
    definition: CapacityAreaDefinition,
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
      ...definition.defaultOverloadConditions,
    ]);
  }
  
  function collectSuitableConditions(
    selection: CapacityAreaSelection,
    definition: CapacityAreaDefinition,
  ): string[] {
    const supportingConditions =
      selection.supportingMatches.flatMap(
        (match) => match.evidence.conditions,
      );
  
    return uniqueTexts([
      ...supportingConditions,
      ...definition.defaultSuitableConditions,
    ]);
  }
  
  export function buildCapacityInterpretation(
    selection: CapacityAreaSelection,
  ): CapacityInterpretation | null {
    if (
      selection.status === "insufficient"
      || selection.level === null
    ) {
      return null;
    }
  
    const definition =
      CAPACITY_AREA_DEFINITIONS[selection.area];
  
    const level = selection.level;
  
    return {
      corePattern:
        definition.corePattern[level],
  
      manageableScope:
        definition.manageableScope[level],
  
      strengthExpression:
        definition.strengthExpression[level],
  
      limitationPattern:
        definition.limitationPattern[level],
  
      overloadConditions:
        collectOverloadConditions(
          selection,
          definition,
        ),
  
      suitableConditions:
        collectSuitableConditions(
          selection,
          definition,
        ),
    };
  }