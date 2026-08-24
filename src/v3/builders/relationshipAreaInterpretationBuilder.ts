import type {
    RelationshipArea,
    RelationshipAreaInterpretation,
    RelationshipLevel,
  } from "../masterReader/types/relationship.js";
  import type {
    RelationshipAreaSelection,
  } from "../masterReader/readers/relationshipSelector.js";
  
  type RelationshipAreaDefinition = {
    corePattern: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  };
  
  const RELATIONSHIP_AREA_DEFINITIONS:
    Record<
      RelationshipArea,
      Record<
        RelationshipLevel,
        RelationshipAreaDefinition
      >
    > = {
      connectionExpansion: {
        limited: {
          corePattern:
            "관계의 폭을 넓히기보다 익숙하고 제한된 연결 안에서 안정감을 찾는 구조이다.",
  
          strengthExpression:
            "불필요한 관계를 줄이고 신뢰할 수 있는 소수에게 집중할 수 있다.",
  
          limitationPattern:
            "새로운 사람과 환경에 접근할 때 관계 형성의 속도와 범위가 제한될 수 있다.",
  
          suitableConditions: [
            "소수의 신뢰 관계",
            "역할이 분명한 만남",
            "반복적으로 접촉하는 환경",
          ],
  
          cautionConditions: [
            "짧은 시간에 인맥을 넓혀야 하는 상황",
            "낯선 사람에게 즉시 자신을 열어야 하는 환경",
            "관계 수를 성과로 평가하는 구조",
          ],
        },
  
        moderate: {
          corePattern:
            "필요와 목적이 분명할 때 관계를 넓히며 상황에 따라 연결 범위를 조절하는 구조이다.",
  
          strengthExpression:
            "관계의 필요성과 신뢰 수준을 확인하면서 연결을 단계적으로 확대할 수 있다.",
  
          limitationPattern:
            "관계 목적이 불분명하거나 접촉이 과도하면 교류의 지속성이 낮아질 수 있다.",
  
          suitableConditions: [
            "공통 목표가 있는 관계",
            "단계적으로 신뢰를 확인하는 만남",
            "관계 범위를 선택할 수 있는 환경",
          ],
  
          cautionConditions: [
            "목적 없는 과도한 교류",
            "관계 유지 비용이 지나치게 큰 환경",
            "친밀감과 인맥을 혼동하는 상황",
          ],
        },
  
        strong: {
          corePattern:
            "다양한 사람과 빠르게 연결되고 관계를 통해 정보와 기회를 확장하는 구조이다.",
  
          strengthExpression:
            "서로 다른 배경과 역할을 가진 사람을 연결하여 관계 흐름을 만들 수 있다.",
  
          limitationPattern:
            "관계를 넓히는 속도가 깊이와 책임 범위를 앞서면 피로와 관계 누수가 생길 수 있다.",
  
          suitableConditions: [
            "다양한 사람과 교류하는 환경",
            "정보와 기회를 연결하는 역할",
            "네트워크를 활용하는 협력 구조",
          ],
  
          cautionConditions: [
            "모든 관계를 가까운 관계로 만드는 행동",
            "관계별 책임 범위를 구분하지 않는 상황",
            "인맥 확장을 신뢰 형성으로 착각하는 경우",
          ],
        },
      },
  
      intimacyMaintenance: {
        limited: {
          corePattern:
            "가까운 관계의 감정과 책임이 커질수록 거리를 확보해야 안정되는 구조이다.",
  
          strengthExpression:
            "과도한 친밀감에 휩쓸리지 않고 독립성을 유지할 수 있다.",
  
          limitationPattern:
            "상대의 감정과 요구가 누적되면 관계를 유지하기보다 이탈하거나 단절할 수 있다.",
  
          suitableConditions: [
            "개인 시간이 보장되는 관계",
            "책임과 기대가 명확한 관계",
            "친밀감의 속도를 조절할 수 있는 환경",
          ],
  
          cautionConditions: [
            "감정 확인을 지속적으로 요구받는 관계",
            "경계 없는 밀착 관계",
            "관계 유지 책임이 한쪽에 집중되는 상황",
          ],
        },
  
        moderate: {
          corePattern:
            "적절한 거리와 역할 기준이 있을 때 가까운 관계를 안정적으로 유지하는 구조이다.",
  
          strengthExpression:
            "상대와의 친밀감과 자기 생활의 균형을 조절할 수 있다.",
  
          limitationPattern:
            "관계 기준이 불분명하거나 부담이 집중되면 친밀감의 지속성이 흔들릴 수 있다.",
  
          suitableConditions: [
            "서로의 생활을 존중하는 관계",
            "감정과 책임을 나누는 구조",
            "갈등 후 정리 시간이 보장되는 관계",
          ],
  
          cautionConditions: [
            "책임 분담이 불분명한 관계",
            "상대의 요구가 반복적으로 확대되는 상황",
            "거리 조절을 거절로 해석하는 관계",
          ],
        },
  
        strong: {
          corePattern:
            "가까운 사람의 감정과 책임을 오래 감당하며 관계의 깊이를 축적하는 구조이다.",
  
          strengthExpression:
            "관계에 어려움이 생겨도 쉽게 이탈하지 않고 친밀감과 신뢰를 유지할 수 있다.",
  
          limitationPattern:
            "관계 유지력이 강한 만큼 상대의 문제와 책임까지 오래 떠안을 수 있다.",
  
          suitableConditions: [
            "장기적인 신뢰 관계",
            "상호 책임이 분명한 관계",
            "감정과 생활을 함께 조율하는 관계",
          ],
  
          cautionConditions: [
            "관계 유지를 위해 자기 필요를 계속 포기하는 행동",
            "상대 문제를 대신 해결하는 관계",
            "끝내야 할 관계까지 의무로 유지하는 상황",
          ],
        },
      },
  
      emotionalExchange: {
        limited: {
          corePattern:
            "감정을 직접 주고받기보다 행동과 거리 조절을 통해 관계를 관리하는 구조이다.",
  
          strengthExpression:
            "감정에 즉시 휩쓸리지 않고 상황을 현실적으로 정리할 수 있다.",
  
          limitationPattern:
            "감정 표현과 수용이 부족하면 상대가 거리감이나 무관심으로 받아들일 수 있다.",
  
          suitableConditions: [
            "표현 방식을 구체적으로 합의한 관계",
            "행동으로 신뢰를 확인하는 관계",
            "감정 정리 시간이 보장되는 환경",
          ],
  
          cautionConditions: [
            "감정 표현을 강요하는 상황",
            "침묵만으로 갈등을 해결하려는 행동",
            "상대 감정을 비합리적인 것으로 단정하는 태도",
          ],
        },
  
        moderate: {
          corePattern:
            "상황과 신뢰 수준에 따라 감정을 표현하고 상대 반응을 선택적으로 수용하는 구조이다.",
  
          strengthExpression:
            "감정과 현실 문제를 구분하면서 필요한 수준의 정서 교류를 유지할 수 있다.",
  
          limitationPattern:
            "갈등이 커지거나 표현 방식이 다르면 감정 전달이 늦어질 수 있다.",
  
          suitableConditions: [
            "차분하게 감정을 설명할 수 있는 관계",
            "표현 차이를 인정하는 환경",
            "감정과 해결 과정을 분리하는 대화",
          ],
  
          cautionConditions: [
            "즉각적인 감정 답변을 요구하는 상황",
            "상대의 표현 방식을 자기 기준으로만 판단하는 태도",
            "감정 문제를 장기간 미루는 행동",
          ],
        },
  
        strong: {
          corePattern:
            "감정과 생각을 적극적으로 표현하고 상대의 반응을 받아 관계 흐름을 만드는 구조이다.",
  
          strengthExpression:
            "감정 언어와 반응을 통해 친밀감과 공감대를 빠르게 형성할 수 있다.",
  
          limitationPattern:
            "감정 교류가 과해지면 상대의 감정에 동화되거나 반응을 지나치게 요구할 수 있다.",
  
          suitableConditions: [
            "정서적 소통이 중요한 관계",
            "표현과 피드백이 자유로운 환경",
            "상호 공감이 필요한 협력 관계",
          ],
  
          cautionConditions: [
            "감정 반응을 관계의 전부로 판단하는 행동",
            "상대에게 동일한 표현 강도를 요구하는 상황",
            "감정과 사실을 구분하지 못하는 갈등",
          ],
        },
      },
  
      boundaryMaintenance: {
        limited: {
          corePattern:
            "관계 안에서 자기 책임과 상대 책임의 경계가 쉽게 흐려질 수 있는 구조이다.",
  
          strengthExpression:
            "상대의 필요와 감정을 민감하게 알아차리고 도움을 제공할 수 있다.",
  
          limitationPattern:
            "거절과 책임 분리가 어려워 타인의 문제와 감정까지 떠안을 수 있다.",
  
          suitableConditions: [
            "역할과 책임이 명시된 관계",
            "도움의 범위를 합의하는 구조",
            "거절을 존중하는 환경",
          ],
  
          cautionConditions: [
            "상대 문제를 대신 해결하는 행동",
            "죄책감으로 관계를 유지하는 상황",
            "책임과 비용이 한쪽에 집중되는 관계",
          ],
        },
  
        moderate: {
          corePattern:
            "관계의 성격과 신뢰 수준에 따라 경계를 조절하며 책임 범위를 선택하는 구조이다.",
  
          strengthExpression:
            "필요할 때 협력하면서도 일정 수준의 자기 기준을 유지할 수 있다.",
  
          limitationPattern:
            "가까운 관계나 위기 상황에서는 평소의 경계가 약해질 수 있다.",
  
          suitableConditions: [
            "책임 범위를 대화로 조정하는 관계",
            "상호 거절이 가능한 환경",
            "역할 변경을 합의하는 구조",
          ],
  
          cautionConditions: [
            "친밀감을 이유로 책임을 확대하는 상황",
            "위기 때 모든 문제를 대신 떠안는 행동",
            "암묵적 기대가 많은 관계",
          ],
        },
  
        strong: {
          corePattern:
            "가까운 관계에서도 자기 기준과 책임 범위를 분명하게 유지하는 구조이다.",
  
          strengthExpression:
            "상대의 요구에 휩쓸리지 않고 역할과 감정의 경계를 명확히 세울 수 있다.",
  
          limitationPattern:
            "경계가 지나치게 단단하면 상대가 통제나 거리감으로 느낄 수 있다.",
  
          suitableConditions: [
            "독립성을 존중하는 관계",
            "역할과 책임이 분명한 협력",
            "직접적인 의사 표현이 가능한 환경",
          ],
  
          cautionConditions: [
            "모든 감정 문제를 개인 책임으로만 돌리는 태도",
            "관계 조정을 간섭으로 해석하는 행동",
            "유연성 없이 기준만 적용하는 상황",
          ],
        },
      },
  
      conflictAdjustment: {
        limited: {
          corePattern:
            "갈등 압력이 커지면 조정보다 회피·대립·단절 중 하나로 기울기 쉬운 구조이다.",
  
          strengthExpression:
            "불필요한 갈등에 오래 머물지 않고 관계를 빠르게 정리할 수 있다.",
  
          limitationPattern:
            "충돌 원인을 충분히 조정하기 전에 관계가 멀어지거나 대립이 반복될 수 있다.",
  
          suitableConditions: [
            "갈등 규칙이 명확한 관계",
            "중재자가 있는 협력 구조",
            "정리 시간을 확보할 수 있는 환경",
          ],
  
          cautionConditions: [
            "감정이 높은 상태에서 결론을 내리는 행동",
            "갈등을 장기간 방치하는 상황",
            "승패로 관계 문제를 해결하려는 태도",
          ],
        },
  
        moderate: {
          corePattern:
            "갈등의 강도와 관계 중요도에 따라 대화와 거리 조절을 선택하는 구조이다.",
  
          strengthExpression:
            "해결 가능한 문제와 거리를 둬야 할 문제를 구분할 수 있다.",
  
          limitationPattern:
            "역할과 감정이 얽히면 조정 기준이 흔들리거나 결론이 늦어질 수 있다.",
  
          suitableConditions: [
            "쟁점을 구체적으로 나누는 대화",
            "감정 정리 후 다시 논의하는 구조",
            "서로 양보 범위를 제시하는 관계",
          ],
  
          cautionConditions: [
            "문제를 한꺼번에 해결하려는 행동",
            "과거 갈등을 반복해서 소환하는 상황",
            "합의 기준 없이 사과만 요구하는 관계",
          ],
        },
  
        strong: {
          corePattern:
            "충돌 상황에서도 쟁점과 책임을 구분하며 관계를 다시 조정하는 구조이다.",
  
          strengthExpression:
            "상대 입장과 자기 기준을 함께 확인하여 합의 가능한 지점을 만들 수 있다.",
  
          limitationPattern:
            "조정 역할을 반복해서 맡으면 타인의 갈등까지 책임지는 부담이 커질 수 있다.",
  
          suitableConditions: [
            "협상과 조율이 필요한 관계",
            "역할과 이해관계가 복잡한 협력",
            "합의 기준을 문서화할 수 있는 환경",
          ],
  
          cautionConditions: [
            "모든 갈등의 중재자가 되는 상황",
            "합의를 위해 자기 기준을 과도하게 낮추는 행동",
            "상대의 반복 위반까지 조정으로 해결하려는 태도",
          ],
        },
      },
  
      trustRecovery: {
        limited: {
          corePattern:
            "신뢰가 깨지면 관계를 다시 열기보다 거리와 단절을 통해 자신을 보호하는 구조이다.",
  
          strengthExpression:
            "반복적으로 신뢰를 훼손하는 관계를 빠르게 정리할 수 있다.",
  
          limitationPattern:
            "회복 가능한 관계에서도 불신이 오래 남아 재연결이 어려울 수 있다.",
  
          suitableConditions: [
            "책임 인정이 명확한 관계",
            "행동 변화를 확인할 수 있는 구조",
            "회복 여부를 천천히 결정할 수 있는 환경",
          ],
  
          cautionConditions: [
            "말만으로 즉시 신뢰를 회복하려는 상황",
            "상처를 정리하지 않고 관계를 재개하는 행동",
            "모든 실수를 배신으로 해석하는 태도",
          ],
        },
  
        moderate: {
          corePattern:
            "신뢰 훼손의 원인과 상대의 행동 변화를 확인한 뒤 관계 회복 여부를 결정하는 구조이다.",
  
          strengthExpression:
            "무조건 용서하거나 즉시 단절하지 않고 회복 가능성을 현실적으로 판단할 수 있다.",
  
          limitationPattern:
            "상대의 책임 인정과 변화가 불분명하면 불신 상태가 오래 지속될 수 있다.",
  
          suitableConditions: [
            "잘못과 책임을 구체적으로 확인하는 대화",
            "행동 변화의 기간을 두는 관계",
            "회복 조건을 합의하는 구조",
          ],
  
          cautionConditions: [
            "관계 회복을 감정에만 의존하는 상황",
            "같은 문제가 반복되는 관계",
            "회복 조건을 말하지 않고 시험하는 행동",
          ],
        },
  
        strong: {
          corePattern:
            "신뢰가 흔들려도 원인을 이해하고 관계 규칙을 재구성하여 다시 연결할 수 있는 구조이다.",
  
          strengthExpression:
            "갈등과 실수 이후에도 관계의 맥락을 살피며 회복의 통로를 만들 수 있다.",
  
          limitationPattern:
            "회복력이 강한 만큼 반복적으로 신뢰를 훼손하는 상대에게 기회를 과도하게 줄 수 있다.",
  
          suitableConditions: [
            "책임 인정과 행동 변화가 있는 관계",
            "관계 규칙을 다시 합의할 수 있는 환경",
            "장기적인 신뢰 회복이 필요한 관계",
          ],
  
          cautionConditions: [
            "반복 위반을 이해로만 넘기는 행동",
            "상대 변화 없이 자기만 노력하는 상황",
            "관계 유지를 위해 손상을 축소하는 태도",
          ],
        },
      },
  
      partnershipCooperation: {
        limited: {
          corePattern:
            "동업과 협력에서 역할·주도권·이익 기준이 얽히면 독립적으로 움직이는 편이 안정적인 구조이다.",
  
          strengthExpression:
            "자기 책임과 성과가 분명한 독립 역할에서 판단과 실행을 빠르게 유지할 수 있다.",
  
          limitationPattern:
            "공동 의사결정과 이익 배분 과정에서 주도권 충돌과 책임 전가가 생길 수 있다.",
  
          suitableConditions: [
            "역할과 수익이 분리된 협력",
            "독립된 책임 영역",
            "계약과 의사결정권이 명확한 구조",
          ],
  
          cautionConditions: [
            "친분만으로 시작하는 동업",
            "공동 책임 범위가 불분명한 협업",
            "이익 배분 기준을 나중에 정하는 상황",
          ],
        },
  
        moderate: {
          corePattern:
            "역할과 의사결정 기준이 명확할 때 협력하며 필요에 따라 독립성을 유지하는 구조이다.",
  
          strengthExpression:
            "공동 목표와 자기 책임을 구분하여 조건부 협력을 이어갈 수 있다.",
  
          limitationPattern:
            "성과 기준과 책임 범위가 흐려지면 협력 의지가 빠르게 약해질 수 있다.",
  
          suitableConditions: [
            "역할 분담이 문서화된 협력",
            "정기적인 성과 점검",
            "의사결정 절차가 있는 동업",
          ],
  
          cautionConditions: [
            "책임자가 불분명한 공동 업무",
            "감정과 사업 판단이 섞이는 상황",
            "한쪽의 희생으로 유지되는 협력",
          ],
        },
  
        strong: {
          corePattern:
            "서로 다른 역할과 자원을 연결하여 공동 목표와 성과를 만드는 구조이다.",
  
          strengthExpression:
            "역할·책임·자원을 조율하며 협력 관계를 실제 성과로 연결할 수 있다.",
  
          limitationPattern:
            "협력 범위가 넓어지면 타인의 책임과 이해관계까지 과도하게 조정할 수 있다.",
  
          suitableConditions: [
            "전문 역할이 분리된 동업",
            "공동 목표와 배분 기준이 명확한 협력",
            "상호 보완적인 파트너십",
          ],
  
          cautionConditions: [
            "협력을 이유로 책임을 대신 떠안는 행동",
            "성과보다 관계 유지를 우선하는 상황",
            "계약 없이 신뢰만으로 운영하는 동업",
          ],
        },
      },
  
      spouseBonding: {
        limited: {
          corePattern:
            "배우자 관계의 친밀감과 생활 책임이 커질수록 개인 공간과 역할 분리가 필요한 구조이다.",
  
          strengthExpression:
            "관계에 종속되지 않고 자기 생활과 기준을 유지할 수 있다.",
  
          limitationPattern:
            "감정·생활·책임이 과도하게 결합되면 거리감과 충돌이 반복될 수 있다.",
  
          suitableConditions: [
            "개인 영역을 존중하는 배우자 관계",
            "생활 책임이 명확히 나뉜 구조",
            "감정 확인을 강요하지 않는 관계",
          ],
  
          cautionConditions: [
            "모든 생활을 공유해야 하는 관계",
            "배우자 문제를 한쪽이 전담하는 상황",
            "독립성을 애정 부족으로 해석하는 관계",
          ],
        },
  
        moderate: {
          corePattern:
            "친밀감과 개인 생활의 균형이 맞을 때 배우자 관계를 안정적으로 유지하는 구조이다.",
  
          strengthExpression:
            "생활 책임과 정서적 교류를 상황에 맞게 조절할 수 있다.",
  
          limitationPattern:
            "역할 기대와 감정 표현 방식이 다르면 관계 만족도가 흔들릴 수 있다.",
  
          suitableConditions: [
            "생활 역할을 대화로 조정하는 관계",
            "서로의 독립성을 인정하는 구조",
            "갈등 후 재조정이 가능한 관계",
          ],
  
          cautionConditions: [
            "배우자 역할을 고정적으로 강요하는 상황",
            "감정과 생활 문제를 동시에 해결하려는 행동",
            "암묵적인 희생을 기대하는 관계",
          ],
        },
  
        strong: {
          corePattern:
            "배우자와 친밀감·생활 책임·장기 목표를 함께 유지하며 동반자 관계를 만드는 구조이다.",
  
          strengthExpression:
            "정서적 유대와 현실 책임을 연결하여 장기적인 배우자 관계를 안정시킬 수 있다.",
  
          limitationPattern:
            "관계 유지 책임을 강하게 느껴 배우자의 문제와 부담까지 오래 떠안을 수 있다.",
  
          suitableConditions: [
            "생활과 목표를 함께 조율하는 관계",
            "상호 책임과 신뢰가 분명한 배우자 관계",
            "장기 계획을 공유하는 동반자 구조",
          ],
  
          cautionConditions: [
            "관계 유지를 위해 자기 필요를 포기하는 행동",
            "배우자의 책임을 대신 감당하는 상황",
            "애정과 의무를 구분하지 못하는 관계",
          ],
        },
      },
    };
  
  export function buildRelationshipAreaInterpretation(
    selection:
      RelationshipAreaSelection,
  ): RelationshipAreaInterpretation | null {
    if (selection.level === null) {
      return null;
    }
  
    const definition =
      RELATIONSHIP_AREA_DEFINITIONS[
        selection.area
      ][selection.level];
  
    return {
      corePattern:
        definition.corePattern,
  
      strengthExpression:
        definition.strengthExpression,
  
      limitationPattern:
        definition.limitationPattern,
  
      suitableConditions: [
        ...definition.suitableConditions,
      ],
  
      cautionConditions: [
        ...definition.cautionConditions,
      ],
    };
  }