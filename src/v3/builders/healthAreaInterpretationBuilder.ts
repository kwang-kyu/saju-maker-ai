import type {
    HealthArea,
    HealthAreaInterpretation,
    HealthLevel,
  } from "../masterReader/types/health.js";
  import type {
    HealthAreaSelection,
  } from "../masterReader/readers/healthSelector.js";
  
  type HealthAreaDefinition = {
    corePattern: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  const HEALTH_AREA_DEFINITIONS:
    Record<
      HealthArea,
      Record<
        HealthLevel,
        HealthAreaDefinition
      >
    > = {
      vitalityStability: {
        limited: {
          corePattern:
            "활동량과 외부 요구가 커지면 기본 활력이 빠르게 흔들릴 수 있는 구조이다.",
  
          strengthExpression:
            "활동 범위를 작게 조절하고 회복 시간을 확보하면 안정적인 상태를 유지할 수 있다.",
  
          limitationPattern:
            "회복 전에 부담이 추가되면 일상적인 활동 지속성이 낮아질 수 있다.",
  
          supportiveConditions: [
            "일정한 휴식 시간",
            "활동량의 단계적 확대",
            "예측 가능한 생활 일정",
          ],
  
          cautionConditions: [
            "회복 전 추가 일정",
            "장시간의 연속 활동",
            "활력 저하 신호를 무시하는 행동",
          ],
        },
  
        moderate: {
          corePattern:
            "생활 리듬과 활동량이 맞을 때 기본 활력을 안정적으로 유지하는 구조이다.",
  
          strengthExpression:
            "환경과 일정에 맞춰 활동 강도를 조절하면 일상적인 지속력을 유지할 수 있다.",
  
          limitationPattern:
            "불규칙한 일정과 부담이 겹치면 활력의 편차가 커질 수 있다.",
  
          supportiveConditions: [
            "규칙적인 활동과 휴식",
            "일정 사이의 회복 구간",
            "과도하지 않은 활동 목표",
          ],
  
          cautionConditions: [
            "갑작스러운 일정 확대",
            "휴식 없는 반복 활동",
            "생활 리듬의 잦은 변경",
          ],
        },
  
        strong: {
          corePattern:
            "활동과 책임이 늘어나도 기본 활력을 비교적 안정적으로 유지하는 구조이다.",
  
          strengthExpression:
            "새로운 활동을 시작하고 일정 기간 지속하는 기본 추진력이 강하게 나타난다.",
  
          limitationPattern:
            "활력이 강하다는 이유로 휴식 필요를 늦게 인정하면 피로가 한꺼번에 나타날 수 있다.",
  
          supportiveConditions: [
            "활동과 휴식의 명확한 구분",
            "지속 가능한 활동 목표",
            "정기적인 상태 점검",
          ],
  
          cautionConditions: [
            "활력을 회복력으로 과신하는 행동",
            "장기간 쉬지 않는 일정",
            "피로 신호 이후에도 활동을 확대하는 상황",
          ],
        },
      },
  
      stressRegulation: {
        limited: {
          corePattern:
            "외부 압력과 감정 부담이 누적되면 긴장 상태를 스스로 낮추기 어려울 수 있는 구조이다.",
  
          strengthExpression:
            "스트레스 원인과 책임 범위를 구체적으로 나누면 불필요한 부담을 줄일 수 있다.",
  
          limitationPattern:
            "압력이 장기간 지속되면 감정·활동·생활 리듬 전반에 부담이 확산될 수 있다.",
  
          supportiveConditions: [
            "압력 원인의 명확한 구분",
            "혼자 정리할 수 있는 시간",
            "역할과 책임의 제한",
          ],
  
          cautionConditions: [
            "여러 문제를 동시에 해결하는 상황",
            "긴장 상태의 장기 방치",
            "스트레스를 활동으로만 덮는 행동",
          ],
        },
  
        moderate: {
          corePattern:
            "스트레스의 종류와 환경에 따라 표현·거리 조절·휴식을 선택하는 구조이다.",
  
          strengthExpression:
            "부담의 원인을 인식하면 적절한 해소 방법을 선택할 수 있다.",
  
          limitationPattern:
            "감정과 책임이 동시에 증가하면 평소의 조절 방식이 흔들릴 수 있다.",
  
          supportiveConditions: [
            "문제를 작은 단위로 나누는 방식",
            "표현과 휴식을 병행하는 환경",
            "부담을 공유할 수 있는 관계",
          ],
  
          cautionConditions: [
            "감정과 업무 부담의 동시 누적",
            "정리 시간을 확보하지 못하는 상황",
            "한 가지 해소 방식에만 의존하는 행동",
          ],
        },
  
        strong: {
          corePattern:
            "외부 압력 속에서도 긴장의 원인을 구분하고 반응 강도를 조절하는 구조이다.",
  
          strengthExpression:
            "표현·행동·휴식 방식을 상황에 맞게 바꾸며 스트레스 흐름을 관리할 수 있다.",
  
          limitationPattern:
            "조절력이 강한 만큼 주변의 압력까지 계속 감당하면 자기 부담을 늦게 알아차릴 수 있다.",
  
          supportiveConditions: [
            "압력과 책임의 명확한 범위",
            "다양한 긴장 해소 방식",
            "정기적인 휴식 전환",
          ],
  
          cautionConditions: [
            "타인의 스트레스까지 관리하는 역할",
            "견딜 수 있다는 이유로 부담을 확대하는 상황",
            "긴장 신호를 성과 동력으로만 사용하는 행동",
          ],
        },
      },
  
      fatigueManagement: {
        limited: {
          corePattern:
            "활동과 책임이 반복되면 피로가 누적되기 전에 조절하기 어려울 수 있는 구조이다.",
  
          strengthExpression:
            "활동량과 휴식 기준을 사전에 정하면 급격한 소진을 줄일 수 있다.",
  
          limitationPattern:
            "피로 신호를 확인한 뒤에도 활동을 이어가면 회복 부담이 커질 수 있다.",
  
          supportiveConditions: [
            "활동 시간의 상한 설정",
            "일정 사이의 휴식",
            "반복 가능한 생활 강도",
          ],
  
          cautionConditions: [
            "연속적인 과로",
            "피로 상태에서의 추가 책임",
            "휴식을 미루는 습관",
          ],
        },
  
        moderate: {
          corePattern:
            "일정과 활동 강도를 조절할 수 있을 때 피로 누적을 관리하는 구조이다.",
  
          strengthExpression:
            "피로 원인을 확인하고 활동량을 줄이면 비교적 안정적으로 균형을 회복할 수 있다.",
  
          limitationPattern:
            "성과 압력이나 책임이 커지면 휴식보다 실행을 우선할 수 있다.",
  
          supportiveConditions: [
            "일정한 휴식 주기",
            "활동량의 단계적 조절",
            "피로 원인의 구체적 점검",
          ],
  
          cautionConditions: [
            "성과를 이유로 휴식을 생략하는 행동",
            "활동량의 급격한 증가",
            "피로를 일시적인 문제로만 보는 태도",
          ],
        },
  
        strong: {
          corePattern:
            "활동량과 휴식 필요를 비교적 빠르게 파악하여 피로 누적을 관리하는 구조이다.",
  
          strengthExpression:
            "부담이 커져도 활동 강도를 조절하며 지속 가능한 상태를 유지할 수 있다.",
  
          limitationPattern:
            "관리력이 강해도 장기적인 과부하가 반복되면 회복 여유가 줄어들 수 있다.",
  
          supportiveConditions: [
            "자율적인 일정 조절",
            "정기적인 활동량 점검",
            "회복을 포함한 계획",
          ],
  
          cautionConditions: [
            "장기 과부하의 반복",
            "회복 시간을 다른 일정으로 대체하는 행동",
            "관리 가능하다는 이유로 책임을 계속 추가하는 상황",
          ],
        },
      },
  
      recoveryCapacity: {
        limited: {
          corePattern:
            "소진 뒤 안정 상태로 돌아오기 위해 충분한 시간과 환경적 지원이 필요한 구조이다.",
  
          strengthExpression:
            "회복 기간을 먼저 확보하고 자극과 책임을 줄이면 안정성을 높일 수 있다.",
  
          limitationPattern:
            "회복 과정에 새로운 부담이 들어오면 소진 상태가 길어질 수 있다.",
  
          supportiveConditions: [
            "충분한 회복 기간",
            "외부 요구가 적은 환경",
            "활동 재개의 단계적 진행",
          ],
  
          cautionConditions: [
            "회복 전 업무 복귀",
            "휴식 중 새로운 책임 수용",
            "짧은 휴식만으로 상태가 회복됐다고 판단하는 행동",
          ],
        },
  
        moderate: {
          corePattern:
            "적절한 휴식과 환경 지원이 있을 때 소진 뒤 안정 상태를 회복하는 구조이다.",
  
          strengthExpression:
            "회복 조건이 갖춰지면 일상적인 활동 수준으로 다시 돌아올 수 있다.",
  
          limitationPattern:
            "휴식이 불규칙하거나 부담이 계속되면 회복 속도의 편차가 커질 수 있다.",
  
          supportiveConditions: [
            "예측 가능한 휴식",
            "활동 재개의 기준",
            "회복을 방해하지 않는 생활 환경",
          ],
  
          cautionConditions: [
            "회복 일정의 잦은 중단",
            "부담이 남은 상태에서의 활동 확대",
            "회복 과정을 성과로 평가하는 환경",
          ],
        },
  
        strong: {
          corePattern:
            "일시적인 소진 뒤에도 내부 기반과 생활 조정을 통해 안정 상태로 돌아오는 힘이 강한 구조이다.",
  
          strengthExpression:
            "휴식과 보충이 시작되면 비교적 빠르게 활동 기반을 회복할 수 있다.",
  
          limitationPattern:
            "회복력이 강하다는 이유로 소진과 회복을 반복하면 장기적인 여유가 줄어들 수 있다.",
  
          supportiveConditions: [
            "회복을 포함한 활동 계획",
            "충분한 보충과 휴식",
            "과부하 원인의 사후 조정",
          ],
  
          cautionConditions: [
            "소진과 회복의 반복",
            "회복력을 과부하 허용량으로 해석하는 행동",
            "원인을 바꾸지 않고 휴식만 반복하는 상황",
          ],
        },
      },
  
      rhythmMaintenance: {
        limited: {
          corePattern:
            "환경과 일정 변화에 따라 활동·휴식·수면 리듬이 쉽게 흔들릴 수 있는 구조이다.",
  
          strengthExpression:
            "기상·활동·휴식 기준을 단순하게 고정하면 생활 리듬을 안정시키는 데 도움이 된다.",
  
          limitationPattern:
            "불규칙한 일정이 반복되면 기본적인 생활 주기를 다시 맞추는 데 시간이 필요할 수 있다.",
  
          supportiveConditions: [
            "고정된 기상과 휴식 시간",
            "예측 가능한 일정",
            "밤낮 변화가 적은 환경",
          ],
  
          cautionConditions: [
            "교대되는 생활 일정",
            "잦은 밤낮 변화",
            "휴식 시간을 일정에 따라 계속 바꾸는 행동",
          ],
        },
  
        moderate: {
          corePattern:
            "일정한 기준이 있을 때 활동과 휴식의 생활 리듬을 유지하는 구조이다.",
  
          strengthExpression:
            "환경 변화가 크지 않으면 비교적 안정적인 생활 주기를 이어갈 수 있다.",
  
          limitationPattern:
            "일정이 갑자기 바뀌거나 책임이 늘면 생활 리듬이 일시적으로 흔들릴 수 있다.",
  
          supportiveConditions: [
            "반복 가능한 일과",
            "일정 변경 전 적응 기간",
            "휴식 시간의 우선 확보",
          ],
  
          cautionConditions: [
            "갑작스러운 일정 변경",
            "생활 주기의 잦은 전환",
            "수면과 휴식을 남는 시간에 배치하는 행동",
          ],
        },
  
        strong: {
          corePattern:
            "환경 변화 속에서도 활동과 휴식의 기본 리듬을 비교적 안정적으로 유지하는 구조이다.",
  
          strengthExpression:
            "규칙과 기준을 활용하여 생활 주기를 스스로 관리할 수 있다.",
  
          limitationPattern:
            "리듬 관리가 강해도 지나치게 경직되면 예상 밖의 일정 변화에 스트레스가 커질 수 있다.",
  
          supportiveConditions: [
            "일정한 생활 기준",
            "자율적인 시간 관리",
            "변화를 반영한 사전 조정",
          ],
  
          cautionConditions: [
            "생활 규칙을 지나치게 경직되게 적용하는 행동",
            "예외 상황을 실패로 해석하는 태도",
            "장기적인 일정 과밀",
          ],
        },
      },
  
      overloadTolerance: {
        limited: {
          corePattern:
            "장기간의 책임과 압박이 누적되면 활동 안정성과 회복 여유가 빠르게 줄어들 수 있는 구조이다.",
  
          strengthExpression:
            "책임 범위를 제한하고 부담을 나누면 안정적인 수행 범위를 유지할 수 있다.",
  
          limitationPattern:
            "과부하 상태를 오래 버티면 스트레스·피로·생활 리듬이 함께 흔들릴 수 있다.",
  
          supportiveConditions: [
            "책임의 명확한 상한",
            "업무와 역할의 분담",
            "압박 기간 뒤의 회복 구간",
          ],
  
          cautionConditions: [
            "장기적인 책임 집중",
            "대체 인력 없는 역할",
            "과부하 상태의 정상화",
          ],
        },
  
        moderate: {
          corePattern:
            "부담의 종류와 기간이 조절될 때 일정 수준의 장기 압박을 감당하는 구조이다.",
  
          strengthExpression:
            "책임이 명확하고 회복 구간이 있으면 지속적인 활동을 유지할 수 있다.",
  
          limitationPattern:
            "여러 종류의 압박이 동시에 겹치면 감당 범위가 빠르게 줄어들 수 있다.",
  
          supportiveConditions: [
            "책임 종류의 제한",
            "압박 기간의 명확한 종료",
            "정기적인 역할 조정",
          ],
  
          cautionConditions: [
            "업무·관계·재정 부담의 동시 증가",
            "종료 시점 없는 압박",
            "회복 구간 없는 장기 책임",
          ],
        },
  
        strong: {
          corePattern:
            "일정 수준의 장기 압박과 책임 속에서도 활동 기반을 유지하는 힘이 강한 구조이다.",
  
          strengthExpression:
            "부담이 커져도 쉽게 이탈하지 않고 책임을 일정 기간 지속할 수 있다.",
  
          limitationPattern:
            "감당력이 강한 만큼 과도한 책임이 장기간 집중될 위험이 있다.",
  
          supportiveConditions: [
            "책임과 권한의 균형",
            "역할 분담이 가능한 환경",
            "장기 활동 속 정기적인 회복",
          ],
  
          cautionConditions: [
            "강한 감당력을 이유로 책임을 계속 추가하는 상황",
            "역할 분담 없는 장기 압박",
            "활동 유지와 건강 안정성을 동일하게 보는 태도",
          ],
        },
      },
  
      habitSelfManagement: {
        limited: {
          corePattern:
            "활동과 환경의 변화에 따라 생활 습관 관리가 뒤로 밀릴 수 있는 구조이다.",
  
          strengthExpression:
            "관리 항목을 적게 정하고 반복 가능한 기준을 만들면 생활 습관을 안정시킬 수 있다.",
  
          limitationPattern:
            "성과와 책임이 커질수록 휴식·식사·생활 관리가 불규칙해질 수 있다.",
  
          supportiveConditions: [
            "단순한 생활 관리 기준",
            "자동화된 반복 일정",
            "관리 항목의 최소화",
          ],
  
          cautionConditions: [
            "한 번에 많은 습관을 바꾸는 행동",
            "업무 우선으로 생활 관리를 미루는 상황",
            "완벽한 관리만을 목표로 하는 태도",
          ],
        },
  
        moderate: {
          corePattern:
            "목적과 기준이 분명할 때 필요한 생활 습관을 선택적으로 유지하는 구조이다.",
  
          strengthExpression:
            "현실적인 목표와 점검 기준이 있으면 자기관리 습관을 이어갈 수 있다.",
  
          limitationPattern:
            "목표가 불분명하거나 일정이 복잡해지면 관리의 일관성이 낮아질 수 있다.",
  
          supportiveConditions: [
            "측정 가능한 관리 목표",
            "반복 가능한 작은 습관",
            "정기적인 생활 점검",
          ],
  
          cautionConditions: [
            "지나치게 복잡한 관리 계획",
            "단기 결과만으로 습관을 평가하는 행동",
            "일정 변화 후 관리 기준을 조정하지 않는 상황",
          ],
        },
  
        strong: {
          corePattern:
            "생활 기준과 일정을 스스로 세워 건강한 습관을 지속적으로 관리하는 구조이다.",
  
          strengthExpression:
            "규칙과 현실적인 자원 배분을 통해 생활 관리 행동을 반복할 수 있다.",
  
          limitationPattern:
            "관리 기준이 지나치게 엄격해지면 작은 변화에도 부담과 자기비판이 커질 수 있다.",
  
          supportiveConditions: [
            "유연한 생활 관리 기준",
            "정기적인 점검과 조정",
            "지속 가능성을 우선하는 계획",
          ],
  
          cautionConditions: [
            "관리 기준의 과도한 엄격함",
            "일시적인 실패를 전체 실패로 보는 태도",
            "상태 변화 없이 계획만 유지하는 행동",
          ],
        },
      },
  
      imbalanceAdaptation: {
        limited: {
          corePattern:
            "계절·환경·일정 변화가 커지면 활동과 회복의 균형을 다시 맞추는 데 시간이 필요한 구조이다.",
  
          strengthExpression:
            "변화를 작게 나누고 적응 기간을 확보하면 생활 균형을 안정시킬 수 있다.",
  
          limitationPattern:
            "여러 변화가 동시에 발생하면 활력·스트레스·리듬의 편차가 커질 수 있다.",
  
          supportiveConditions: [
            "단계적인 환경 변화",
            "충분한 적응 기간",
            "기존 생활 기준의 일부 유지",
          ],
  
          cautionConditions: [
            "여러 환경의 동시 변화",
            "적응 기간 없는 일정 전환",
            "변화 직후 활동을 확대하는 행동",
          ],
        },
  
        moderate: {
          corePattern:
            "변화의 범위와 속도가 조절될 때 새로운 환경에 적응하며 균형을 회복하는 구조이다.",
  
          strengthExpression:
            "기존 리듬을 일부 유지하면서 새로운 조건에 맞춰 활동 방식을 조정할 수 있다.",
  
          limitationPattern:
            "변화가 빠르거나 예측하기 어려우면 적응 과정에서 일시적인 불균형이 나타날 수 있다.",
  
          supportiveConditions: [
            "예측 가능한 변화",
            "기존 생활 리듬의 유지",
            "단계적인 활동 조정",
          ],
  
          cautionConditions: [
            "준비 없는 환경 전환",
            "변화 직후의 과도한 목표",
            "적응 상태를 확인하지 않는 행동",
          ],
        },
  
        strong: {
          corePattern:
            "환경과 일정이 바뀌어도 활동·휴식·회복 방식을 조정하여 균형을 다시 만드는 구조이다.",
  
          strengthExpression:
            "한 가지 반응에 고정되지 않고 상황에 맞는 적응 방법을 선택할 수 있다.",
  
          limitationPattern:
            "적응력이 강하다는 이유로 변화가 지나치게 반복되면 안정적인 기반이 약해질 수 있다.",
  
          supportiveConditions: [
            "변화 뒤 안정화 기간",
            "상태에 맞는 활동 조정",
            "기본 생활 기준의 유지",
          ],
  
          cautionConditions: [
            "잦은 환경 전환",
            "적응력을 이유로 변화를 계속 추가하는 상황",
            "안정화 전에 다음 변화를 시작하는 행동",
          ],
        },
      },
    };
  
  export function buildHealthAreaInterpretation(
    selection:
      HealthAreaSelection,
  ): HealthAreaInterpretation | null {
    if (selection.level === null) {
      return null;
    }
  
    const definition =
      HEALTH_AREA_DEFINITIONS[
        selection.area
      ][selection.level];
  
    return {
      corePattern:
        definition.corePattern,
  
      strengthExpression:
        definition.strengthExpression,
  
      limitationPattern:
        definition.limitationPattern,
  
      supportiveConditions: [
        ...definition
          .supportiveConditions,
      ],
  
      cautionConditions: [
        ...definition
          .cautionConditions,
      ],
    };
  }